import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './useAuth';
import { createPlan, getPlan, getPlanOptions, previewPlan } from '../api/services/planService';
import { extractError } from '../utils/extractError';
import {
  PLAN_INTENT_KEY, consumePlanIntent, defaultSettings, planBody,
  planFormErrors, readPlanSettings, writePlanSettings,
} from '../utils/planBuilder';

const PREVIEW_DELAY_MS = 650;
const MIN_PREVIEW_INTERVAL_MS = 3200; // Stay below the public preview's 20 requests per minute.

// Keep API requests and login/save behavior out of the form's markup.
export function usePlanBuilder() {
  const { user, loading: checkingSession } = useAuth();
  const userId = user?.id || user?._id;
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const settings = useMemo(() => readPlanSettings(params), [params]);
  const latestSettings = useRef(settings);
  const settingsKey = writePlanSettings(settings);

  const [options, setOptions] = useState(null);
  const [optionsError, setOptionsError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [preview, setPreview] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [saved, setSaved] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [replacePlanId, setReplacePlanId] = useState(null);
  const lastPreviewAt = useRef(0);
  const saveInProgress = useRef(false);

  const errors = useMemo(() => planFormErrors(settings, options), [settings, options]);
  const valid = options !== null && Object.keys(errors).length === 0;
  const previewReady = valid && preview?.key === settingsKey && preview?.retry === retryCount && !!preview.data;
  const accountReady = !!userId && currentPlan?.owner === userId;
  const activePlan = accountReady ? currentPlan.plan : null;
  const savedPlan = userId && saved?.owner === userId ? saved.plan : null;
  const needsReplacement = !!activePlan && !currentPlan.finished;
  const nothingToPlan = preview?.data?.notices.includes('nothing-to-plan');
  const accountAllowsSave = !userId || (accountReady && !currentPlan.error);
  const replacementAllowed = !needsReplacement || replacePlanId === activePlan.id;
  const canGenerate = previewReady && !nothingToPlan && !saving && !checkingSession
    && accountAllowsSave && replacementAllowed;

  // Rapid edits may arrive before the URL navigation renders. Merge them without losing a field.
  useEffect(() => {
    latestSettings.current = settings;
  }, [settings]);

  // Choices come from the same source data that the server's generator uses.
  useEffect(() => {
    const controller = new AbortController();
    async function loadOptions() {
      try {
        const choices = await getPlanOptions(controller.signal);
        if (!controller.signal.aborted) {
          setOptions(choices);
          setOptionsError('');
        }
      } catch (error) {
        if (!controller.signal.aborted) setOptionsError(extractError(error));
      }
    }
    loadOptions();
    return () => controller.abort();
  }, [retryCount]);

  // Ignore replies for earlier settings. Aborting alone cannot guarantee response order.
  useEffect(() => {
    if (!valid) return;
    const controller = new AbortController();
    const delay = Math.max(PREVIEW_DELAY_MS, MIN_PREVIEW_INTERVAL_MS - (Date.now() - lastPreviewAt.current));
    const timer = setTimeout(async () => {
      lastPreviewAt.current = Date.now();
      try {
        const data = await previewPlan(planBody(settings), controller.signal);
        if (!controller.signal.aborted) setPreview({ key: settingsKey, retry: retryCount, data });
      } catch (error) {
        if (!controller.signal.aborted) {
          setPreview({ key: settingsKey, retry: retryCount, error: extractError(error) });
        }
      }
    }, delay);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [settings, settingsKey, valid, retryCount]);

  // Check for an existing plan before saving or resuming a login request.
  useEffect(() => {
    if (!userId || checkingSession) return;
    const controller = new AbortController();
    async function loadCurrentPlan() {
      try {
        const result = await getPlan(controller.signal);
        if (!controller.signal.aborted) {
          setCurrentPlan({ owner: userId, plan: result.plan, finished: result.finished });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setCurrentPlan({ owner: userId, error: extractError(error) });
        }
      }
    }
    loadCurrentPlan();
    return () => controller.abort();
  }, [userId, checkingSession, retryCount]);

  // Changing the URL updates the form and makes Back/Forward restore the same settings.
  function updateSettings(changes) {
    setSaveError('');
    const next = { ...latestSettings.current, ...changes };
    latestSettings.current = next;
    setParams(writePlanSettings(next), { replace: true });
  }

  // A save always uses the settings whose preview is currently visible.
  const save = useCallback(async (replace = false) => {
    if (!userId || !previewReady || saveInProgress.current) return;
    saveInProgress.current = true;
    setSaving(true);
    setSaveError('');
    try {
      const result = await createPlan({ ...planBody(settings), replace });
      setSaved({ owner: userId, plan: result.plan });
      setCurrentPlan({ owner: userId, plan: result.plan, finished: false });
      setReplacePlanId(null);
    } catch (error) {
      setSaveError(extractError(error, 'Could not save your plan. Please try again.'));
    } finally {
      saveInProgress.current = false;
      setSaving(false);
    }
  }, [userId, previewReady, settings]);

  // Only a matching, one-use intent from this browser tab can save automatically after login.
  const resumeToken = params.get('resume');
  useEffect(() => {
    if (!resumeToken || !userId || checkingSession || !previewReady || !accountReady || currentPlan.error) return;
    let live = true;
    Promise.resolve().then(() => {
      if (!live) return;
      let authorized = false;
      try {
        authorized = consumePlanIntent(sessionStorage, resumeToken, settingsKey);
      } catch {
        // A blocked browser store restores the form without authorizing an automatic save.
      }
      setParams(settingsKey, { replace: true });
      if (!authorized) return;
      if (activePlan && !currentPlan.finished) {
        setSaveError('You already have a plan. Choose whether to keep it or replace it below.');
        return;
      }
      save();
    });
    return () => { live = false; };
  }, [resumeToken, userId, checkingSession, previewReady, accountReady, currentPlan, activePlan, settingsKey, setParams, save]);

  // Leaving for login does not save anything. Keep the intent private to this tab.
  function generate() {
    if (!canGenerate) return;
    if (userId) {
      save(replacePlanId === activePlan?.id);
      return;
    }
    let returnTo = `/my-plan?${settingsKey}`;
    try {
      const token = crypto.randomUUID();
      sessionStorage.setItem(PLAN_INTENT_KEY, JSON.stringify({ token, settings: settingsKey, createdAt: Date.now() }));
      returnTo += `&resume=${token}`;
    } catch {
      // Settings still survive in the URL if the browser blocks session storage.
    }
    navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  }

  function viewCurrentPlan() {
    setSaved({ owner: userId, plan: activePlan });
  }

  function resetSettings() {
    const defaults = defaultSettings();
    latestSettings.current = defaults;
    setParams(writePlanSettings(defaults), { replace: true });
  }

  return {
    settings, settingsKey, options, optionsError, errors, valid, previewReady, canGenerate,
    preview: preview?.key === settingsKey && preview.retry === retryCount ? preview : null,
    activePlan, savedPlan, accountReady, accountError: accountReady ? currentPlan.error : '',
    finished: accountReady && currentPlan.finished, userId, checkingSession,
    saving, saveError, replacing: replacePlanId === activePlan?.id,
    updateSettings, generate, resetSettings, viewCurrentPlan,
    setReplacing: (checked) => setReplacePlanId(checked ? activePlan.id : null),
    retry: () => setRetryCount((count) => count + 1),
  };
}
