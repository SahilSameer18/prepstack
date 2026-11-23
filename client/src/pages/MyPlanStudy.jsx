import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { motion, useReducedMotion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { useStudyPlan } from "../hooks/useStudyPlan";
import { useLoadingGate } from "../hooks/useLoadingGate";
import PageBackdrop from "../components/ui/PageBackdrop";
import { SkeletonStudy } from "../components/ui/Skeletons";
import StudyToday from "../components/plan/StudyToday";
import StudyStart from "../components/plan/StudyStart";
import StudySchedule from "../components/plan/StudySchedule";
import StudyRecovery from "../components/plan/StudyRecovery";
import StudyReview, { StudyItemList } from "../components/plan/StudyReview";
import StudyHistory from "../components/plan/StudyHistory";
import FirstStepCard from "../components/plan/FirstStepCard";
import {
  StudyChangeDialog,
  StudyConfirmDialog,
  StudyTaskDialog,
} from "../components/plan/StudyDialogs";
import {
  saveStartingCheck,
  finishLearningPractice,
  deleteCurrentPlan,
  deletePlanHistory,
  recordPlanResult,
  reviewPlanItem,
  updatePlanItem,
} from "../api/services/planService";
import { dateInIndia } from "../utils/planBuilder";
import {
  formatPlanMinutes,
  resolveStudyItem,
  revisionRoundItems,
} from "../utils/studyPlan";
import { SPRING } from "../utils/motion";

const TABS = ["Today", "Plan", "Reviews", "Starred", "History"];

// The workspace owns navigation and saves. Each tab owns only its own presentation.
export default function MyPlanStudy({ embedded = false, planModel }) {
  const ownModel = useStudyPlan(!planModel);
  const model = planModel || ownModel;
  const [params, setParams] = useSearchParams();
  const calm = useReducedMotion();
  const gate = useLoadingGate(!!model.loading);

  // When the last task of the day is completed, say so once. It is a short toast: the Today screen itself gets nothing added.
  // The Today view moves on to the next study day (or empties) once the day's tasks are done.
  const todayView = model.data?.today;
  const dayDone = !!todayView && (!todayView.isToday || todayView.items.length === 0);
  const justCompleted = useRef(false);
  useEffect(() => {
    if (justCompleted.current && dayDone) {
      justCompleted.current = false;
      toast.success("That is today's plan done. Well done.");
    }
  }, [dayDone]);
  const [dialog, setDialog] = useState(null);
  const [round, setRound] = useState(null);
  const [roundIndex, setRoundIndex] = useState(0);
  const [notice, setNotice] = useState(null);
  const [historyVersion, setHistoryVersion] = useState(0);
  const plan = model.data?.plan;
  const hasPausedPlan = !!model.data?.pausedPlans?.length;
  const readOnly = !!model.data?.finished;
  const requestedTab = params.get(embedded ? "view" : "tab");
  const defaultTab = readOnly || (!plan && hasPausedPlan) ? "plan" : "today";
  const tab = requestedTab === "history" || (plan && TABS.some((name) => name.toLowerCase() === requestedTab))
    ? requestedTab
    : defaultTab;
  const mode = params.get("mode") || "task";
  const selected = plan?.items.find((item) => item.id === params.get("item"));
  const roundItem = round?.[roundIndex];

  // Dashboard tabs and study views have separate query keys. Reuse the same
  // workspace without losing its parent tab on Start, Back or result saves.
  function setStudyParams(next) {
    const query = embedded ? { tab: 'plan', view: next.tab } : { tab: next.tab };
    if (next.item) query.item = next.item;
    if (next.mode) query.mode = next.mode;
    setParams(query);
  }

  function navigate(name) {
    model.clearActionError();
    setNotice(null);
    setStudyParams({ tab: name });
  }

  function openDialog(type, item) {
    model.clearActionError();
    setDialog({ type, itemId: item?.id });
  }

  function start(entry, requestedMode) {
    const item = resolveStudyItem(plan, entry);
    if (!item) return;
    model.clearActionError();
    const nextMode =
      requestedMode || (entry.type === "review" ? "review" : "task");
    setStudyParams({ tab, item: item.id, mode: nextMode });
  }

  // A revision round is deliberately local practice: no completion or review writes.
  function startRound() {
    setRound(revisionRoundItems(plan.items));
    setRoundIndex(0);
    setDialog(null);
  }

  async function finish(payload) {
    if (round) {
      setRoundIndex((index) => index + 1);
      return;
    }
    if (mode === "practice") {
      navigate(tab);
      return;
    }
    const result = await model.runAction(() => {
      if (mode === "check") return saveStartingCheck({ id: 'notes', itemId: selected.id, quizScore: payload.quizScore });
      if (selected.learningKind) return finishLearningPractice(selected.id, payload);
      if (mode === "review") return reviewPlanItem(selected.id, payload.passed, payload.effort);
      if (payload.done) return updatePlanItem(selected.id, payload);
      return recordPlanResult(selected.id, payload);
    });
    if (!result) return;
    if (mode === "task") {
      justCompleted.current = true;
      setTimeout(() => { justCompleted.current = false; }, 4000);
    }
    setStudyParams({ tab });
    if (result.offerRecode)
      setNotice({
        text: "Review saved. Your next review is scheduled; you can practise the problem again now.",
        itemId: selected.id,
      });
  }

  async function confirmAction(action) {
    const result = await model.runAction(action);
    if (result) {
      setDialog(null);
      setHistoryVersion((version) => version + 1);
    }
  }

  if (gate === "blank") return <div className="min-h-[40vh]" />;
  if (gate === "skeleton") return <SkeletonStudy />;
  if (model.error)
    return (
      <div role="alert" className="surface-card mx-auto my-12 max-w-md space-y-4 p-6 text-bad">
        <p>{model.error}</p>
        <button className="min-h-[44px] cursor-pointer font-semibold text-brand" onClick={model.reload}>
          Retry loading plan
        </button>
      </div>
    );

  const item = roundItem || selected;
  const dialogItem = plan?.items.find((entry) => entry.id === dialog?.itemId);
  const practiceItems = plan ? revisionRoundItems(plan.items) : [];
  const today = model.data.today || {
    isToday: true,
    date: model.data.calendar?.today || dateInIndia(),
    items: [],
    minutes: 0,
    startItem: null,
  };

  const Heading = embedded ? 'h2' : 'h1';

  return (
    <div className={embedded ? undefined : "relative"}>
    {!embedded && <PageBackdrop />}
    <div className={embedded ? undefined : "relative z-10 mx-auto max-w-5xl pb-12 pt-2"}>
      <Heading className={embedded ? "mb-3 font-code text-xs font-normal uppercase tracking-[0.14em] text-muted" : "mb-6 font-display text-4xl font-black leading-[1.04] tracking-[-0.04em] text-fg sm:text-5xl"}>My plan</Heading>
      {plan && <nav
        aria-label="Study plan tabs"
        className={embedded ? "mb-8 flex gap-5 overflow-x-auto sm:gap-6" : "mb-8 flex gap-1 overflow-x-auto sm:gap-1.5"}
      >
        {TABS.map((name) => (
          <button
            key={name}
            type="button"
            aria-current={tab === name.toLowerCase() ? "page" : undefined}
            disabled={model.busy}
            onClick={() => {
              setRound(null);
              navigate(name.toLowerCase());
            }}
            className={`relative min-h-[44px] shrink-0 cursor-pointer text-sm transition-colors disabled:cursor-not-allowed ${embedded ? "px-0.5" : "flex-1 rounded-xl px-1.5 sm:flex-none sm:px-4"} ${tab === name.toLowerCase() ? "font-semibold text-brand" : `text-muted hover:text-fg ${embedded ? "" : "hover:bg-ink/[0.05]"}`}`}
          >
            {tab === name.toLowerCase() && (
              <motion.span
                aria-hidden="true"
                layoutId={calm ? undefined : "study-tab-slide"}
                className={embedded ? "absolute inset-x-0 bottom-1 h-0.5 rounded-full bg-brand" : "absolute inset-0 -z-10 rounded-xl bg-brand/12"}
                transition={SPRING.smooth}
              />
            )}
            {name}
          </button>
        ))}
      </nav>}

      {!plan && tab === "history" && (
        <button type="button" className="mb-3 min-h-[44px] text-sm text-brand" onClick={() => navigate(defaultTab)}>
          Back to My plan
        </button>
      )}

      {round && !roundItem ? (
        <section className="space-y-4 text-fg-3">
          <h2 className="font-display text-2xl font-bold tracking-tight text-fg">
            Practice round complete
          </h2>
          <p>Your saved progress and review dates are unchanged.</p>
          <button
            className="min-h-[44px] text-brand"
            onClick={() => setRound(null)}
          >
            Back to plan
          </button>
        </section>
      ) : item && (!readOnly || mode === "practice" || round) ? (
        <StudyStart
          key={item.id + (round ? roundIndex : mode)}
          item={item}
          plan={plan}
          mode={round ? "practice" : mode}
          busy={model.busy}
          error={model.actionError}
          onFinish={finish}
          onBack={() => {
            setRound(null);
            navigate(tab);
          }}
        />
      ) : tab === "history" ? (
        <StudyHistory
          key={historyVersion}
          onClear={() => openDialog("clear-history")}
        />
      ) : !plan ? (
        <>
          {hasPausedPlan ? <StudyRecovery model={model} /> : <FirstStepCard />}
          <div className="flex flex-wrap items-center gap-x-5 text-sm">
            {hasPausedPlan && <Link to="/my-plan" className="inline-flex min-h-[44px] items-center text-brand">Build a new plan</Link>}
            <button type="button" className="min-h-[44px] text-muted hover:text-fg" onClick={() => navigate("history")}>Plan history</button>
          </div>
          {!hasPausedPlan && (
            <details className="text-sm">
              <summary className="min-h-[44px] cursor-pointer py-3 text-muted hover:text-fg">Study settings</summary>
              <StudyRecovery model={model} />
            </details>
          )}
        </>
      ) : tab === "today" ? (
        <StudyToday
          today={readOnly ? { ...today, items: [], minutes: 0, startItem: null } : today}
          onStart={start}
        />
      ) : tab === "reviews" ? (
        <>
          {notice && (
            <div className="mb-5 text-sm text-fg-3">
              <p role="status">{notice.text}</p>
              <button
                type="button"
                className="min-h-[44px] text-brand"
                onClick={() => start(plan.items.find((entry) => entry.id === notice.itemId), 'practice')}
              >
                Practice this problem
              </button>
            </div>
          )}
          <StudyReview
            currentDay={model.data.calendar?.today}
            plan={plan}
            readOnly={readOnly}
            onStart={start}
            onRebuild={() => openDialog("rebuild")}
          />
        </>
      ) : tab === "starred" ? (
        <section className="space-y-5">
          <h2 className="font-display text-2xl font-bold tracking-tight text-fg">
            Starred for revision
          </h2>
          <StudyItemList
            items={plan.items.filter(
              (entry) => entry.starred && !entry.skipped,
            )}
            onStart={start}
          />
        </section>
      ) : (
        <StudySchedule
          plan={plan}
          today={today}
          readOnly={readOnly}
          model={model}
          onStart={start}
          onDialog={openDialog}
          recoveryControls={<StudyRecovery model={model} />}
        />
      )}

      {dialog && ["hours", "lighter", "rebuild", "pace"].includes(dialog.type) && (
        <StudyChangeDialog
          type={dialog.type}
          plan={plan}
          model={model}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog && ["task", "add"].includes(dialog.type) && (
        <StudyTaskDialog
          key={dialog.itemId || "add"}
          item={dialogItem}
          plan={plan}
          model={model}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.type === "delete" && (
        <StudyConfirmDialog
          title="Delete current plan?"
          text="This removes the current plan and its saved task results. Sheet progress and older plans stay saved."
          label="Confirm delete plan"
          model={model}
          onClose={() => setDialog(null)}
          onConfirm={() => confirmAction(deleteCurrentPlan)}
        />
      )}
      {dialog?.type === "clear-history" && (
        <StudyConfirmDialog
          title="Delete plan history?"
          text="This permanently removes your finished plan snapshots, including any expired current plan. Sheet progress stays saved."
          label="Confirm delete history"
          model={model}
          onClose={() => setDialog(null)}
          onConfirm={() => confirmAction(deletePlanHistory)}
        />
      )}
      {dialog?.type === "pull" && dialogItem && (
        <StudyConfirmDialog
          title="Pull tomorrow’s first task?"
          text={`${dialogItem.title} (${formatPlanMinutes(dialogItem.plannedMinutes)}) moves to today and stays locked during rebuilds.`}
          label="Confirm move to today"
          model={model}
          onClose={() => setDialog(null)}
          onConfirm={() =>
            confirmAction(() =>
              updatePlanItem(dialogItem.id, { day: model.data.calendar?.today || dateInIndia() }),
            )
          }
        />
      )}
      {dialog?.type === "revision" && (
        <StudyConfirmDialog
          title="Optional revision round"
          text={`${practiceItems.length} problems and sections, about ${formatPlanMinutes(practiceItems.reduce((sum, entry) => sum + entry.plannedMinutes, 0))}. Starred material comes first. This is practice only; completed tasks and review dates stay saved.`}
          label="Start revision round"
          model={model}
          onClose={() => setDialog(null)}
          onConfirm={startRound}
        />
      )}
    </div>
    </div>
  );
}
