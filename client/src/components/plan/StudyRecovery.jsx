import { useState } from 'react';
import { Link } from 'react-router-dom';
import PlanDialog from '../ui/PlanDialog';
import { PlanWeeks } from './PlanPreview';
import { applyPlanRecovery, getPausedPlan, previewPlanRecovery } from '../../api/services/planService';
import { extractError } from '../../utils/extractError';

const BUTTON = 'inline-flex min-h-[44px] items-center rounded-xl border border-ink/[0.2] bg-card px-4 py-2 text-sm font-medium text-fg transition-colors hover:border-ink/[0.4] disabled:opacity-50';
const INPUT = 'mt-2 min-h-[44px] w-full rounded-xl border border-ink/[0.2] bg-card-hover px-3 py-2 text-fg';
const TITLES = {
  calendar: 'Study day settings', pause: 'Pause this plan', resume: 'Resume paused plan',
  recover: 'Spread due reviews', discard: 'Delete paused plan', view: 'Read paused plan',
};

// Recovery belongs in Plan. Today keeps its tasks, time and single Start button.
export default function StudyRecovery({ model }) {
  const [dialog, setDialog] = useState(null);
  const { plan, calendar, pausedPlans = [], finished } = model.data;
  const due = plan?.items.some((item) =>
    !item.skipped && item.nextReviewDay && item.nextReviewDay <= calendar?.today,
  );

  function open(type, paused) {
    model.clearActionError();
    setDialog({ type, planId: paused?.id });
  }

  return (
    <section aria-label="Plan recovery" className="mb-8 space-y-4 border-b border-ink/[0.1] pb-6 text-sm text-fg-3">
      <p className="break-words font-code text-xs uppercase tracking-[0.14em] text-muted">
        Study schedule · {calendar?.timeZone || 'Asia/Kolkata'} · day starts at {calendar?.dayStartHour ?? 0}:00
      </p>
      <div className="flex flex-wrap gap-3">
        <button className={BUTTON} disabled={model.busy} onClick={() => open('calendar')}>
          Study day settings
        </button>
        {plan && !finished && !pausedPlans.length && (
          <button className={BUTTON} disabled={model.busy} onClick={() => open('pause')}>
            Pause plan
          </button>
        )}
        {due && !finished && (
          <button className={BUTTON} disabled={model.busy} onClick={() => open('recover')}>
            Spread due reviews
          </button>
        )}
      </div>
      {pausedPlans.map((paused) => (
        <div key={paused.id} className="space-y-3">
          <p className="break-words">
            <strong>{paused.title}</strong> · Paused since {paused.pausedAtDay}.
          </p>
          <p>
            Resuming fits unfinished tasks into your available days and shifts review dates.
            You can run one short plan while it waits.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className={BUTTON} disabled={model.busy} onClick={() => open('view', paused)}>
              Read paused plan
            </button>
            <button className={BUTTON} disabled={model.busy} onClick={() => open('resume', paused)}>
              Resume plan
            </button>
            <button className={BUTTON} disabled={model.busy} onClick={() => open('discard', paused)}>
              Delete paused plan
            </button>
            {!plan && (
              <Link className={BUTTON} to="/my-plan">Build a short plan</Link>
            )}
          </div>
        </div>
      ))}
      {dialog && (
        <RecoveryDialog
          key={dialog.type + dialog.planId}
          request={dialog}
          model={model}
          onClose={() => setDialog(null)}
        />
      )}
    </section>
  );
}

// Freeze the exact preview payload. Editing or a failed save requires a fresh
// preview, so confirmation cannot silently apply different settings.
function RecoveryDialog({ request, model, onClose }) {
  const calendar = model.data.calendar;
  const [timeZone, setTimeZone] = useState(calendar?.timeZone || 'Asia/Kolkata');
  const [dayStartHour, setDayStartHour] = useState(calendar?.dayStartHour ?? 0);
  const [recoveryDays, setRecoveryDays] = useState(7);
  const [preview, setPreview] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const busy = loading || model.busy;

  async function loadPreview(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (request.type === 'view') {
        const result = await getPausedPlan(request.planId);
        setSnapshot(result.plan);
      } else {
        const body = { ...request };
        if (request.type === 'calendar') Object.assign(body, { timeZone, dayStartHour });
        if (request.type === 'recover') body.recoveryDays = recoveryDays;
        const result = await previewPlanRecovery(body);
        setPreview({ body, result });
      }
    } catch (failure) {
      const message = extractError(failure);
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function confirm() {
    const body = { ...preview.body, checksum: preview.result.checksum };
    const result = await model.runAction(() => applyPlanRecovery(body));
    if (result) onClose();
    else setPreview(null);
  }

  return (
    <PlanDialog title={TITLES[request.type]} onClose={onClose} busy={busy}>
      <div className="space-y-4 text-sm text-fg-3">
        {snapshot ? (
          <>
            <p>{snapshot.title}. Paused snapshot; changes are disabled.</p>
            <PlanWeeks items={snapshot.items} startDate={snapshot.startDate} />
          </>
        ) : preview ? (
          <>
            <RecoverySummary result={preview.result} />
            <div className="flex flex-wrap gap-3">
              <button className={BUTTON} disabled={busy} onClick={() => setPreview(null)}>
                Back to settings
              </button>
              <button className={BUTTON} disabled={busy} onClick={confirm}>
                {model.busy ? 'Saving…' : 'Confirm change'}
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={loadPreview} className="space-y-4">
            {request.type === 'calendar' && (
              <>
                <label className="block">Timezone
                  <input
                    className={INPUT}
                    value={timeZone}
                    maxLength={80}
                    required
                    onChange={(event) => setTimeZone(event.target.value)}
                  />
                </label>
                <button
                  type="button"
                  className={BUTTON}
                  onClick={() => setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone)}
                >
                  Use this device’s timezone
                </button>
                <label className="block">Study day starts at (0–6, local hour)
                  <input
                    className={INPUT}
                    type="number" min="0" max="6" step="1" required
                    value={dayStartHour}
                    onChange={(event) => setDayStartHour(Number(event.target.value))}
                  />
                </label>
                <p>
                  Choose 4 to keep late-night study in the previous day until 4:00 AM.
                  Completed work keeps its recorded date.
                </p>
              </>
            )}
            {request.type === 'recover' && (
              <label className="block">Spread reviews over calendar days (1–28)
                <input
                  className={INPUT}
                  type="number" min="1" max="28" step="1" required
                  value={recoveryDays}
                  onChange={(event) => setRecoveryDays(Number(event.target.value))}
                />
              </label>
            )}
            {request.type === 'pause' && (
              <p>
                Stop this plan until you return. Resuming refits unfinished tasks,
                shifts review dates and previews the new deadline.
                Completed work stays saved.
              </p>
            )}
            {request.type === 'resume' && (
              <p>
                Preview your new schedule and deadline. If a short plan
                is active, it moves to read-only History after confirmation.
              </p>
            )}
            {request.type === 'discard' && (
              <p>
                This permanently deletes the paused plan and its task results.
                Sheet progress stays saved.
              </p>
            )}
            <button className={BUTTON} disabled={busy}>
              {loading ? 'Loading…' : request.type === 'view' ? 'Load saved snapshot' : 'Preview change'}
            </button>
          </form>
        )}
        {(error || model.actionError) && (
          <p role="alert" className="text-bad">{error || model.actionError}</p>
        )}
      </div>
    </PlanDialog>
  );
}

function RecoverySummary({ result }) {
  return (
    <div className="space-y-3" role="status">
      {result.type === 'calendar' && (
        <p>
          Study day changes from {result.studyDayBefore} to {result.studyDayAfter}.
          Timezone: {result.calendar.timeZone}; starts at {result.calendar.dayStartHour}:00.
          Past completions and existing review limits stay saved.
        </p>
      )}
      {result.type === 'pause' && (
        <p>
          Pause {result.title}. Its schedule will shift when you resume;
          its current deadline is {result.deadlineBefore}.
        </p>
      )}
      {result.type === 'resume' && (
        <>
          <p>
            Resume {result.title} after {result.shiftDays} days away. The plan
            shifts {result.reviews} review dates and fits unfinished tasks into
            your available study days.
          </p>
          {result.refitted > 0 && (
            <p>{result.refitted} tasks need different dates to respect your study hours and rest days.</p>
          )}
          {result.movedLocked > 0 && (
            <p>{result.movedLocked} tasks you moved by hand need new dates.</p>
          )}
          {result.extraDays > 0 && (
            <p>The deadline needs {result.extraDays} extra days beyond the break to keep all scheduled work.</p>
          )}
          <p>
            Deadline: {result.deadlineBefore} → {result.deadlineAfter}.
            Completed work and review stages stay saved.
          </p>
          {result.archiveActive && (
            <p className="text-warn">
              Your active plan “{result.archiveActive.title}”, including{' '}
              {result.archiveActive.unfinished} unfinished tasks, will move to read-only History.
            </p>
          )}
        </>
      )}
      {result.type === 'recover' && (
        <p>
          Spread {result.reviewCount} due reviews over the selected window,
          within daily review time and your deadline. No reviews are dropped;
          stages and completions stay saved.
        </p>
      )}
      {result.type === 'discard' && (
        <p>
          Permanently delete {result.title}? Its task results will be removed.
          Sheet progress stays saved.
        </p>
      )}
    </div>
  );
}
