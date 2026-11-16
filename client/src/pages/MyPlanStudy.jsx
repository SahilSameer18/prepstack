import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useStudyPlan } from "../hooks/useStudyPlan";
import StudyToday from "../components/plan/StudyToday";
import StudyStart from "../components/plan/StudyStart";
import StudySchedule from "../components/plan/StudySchedule";
import StudyRecovery from "../components/plan/StudyRecovery";
import StudyReview, { StudyItemList } from "../components/plan/StudyReview";
import StudyHistory from "../components/plan/StudyHistory";
import {
  StudyChangeDialog,
  StudyConfirmDialog,
  StudyTaskDialog,
} from "../components/plan/StudyDialogs";
import {
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

const TABS = ["Today", "Plan", "Reviews", "Starred", "History"];

// The workspace owns navigation and saves. Each tab owns only its own presentation.
export default function MyPlanStudy({ embedded = false, planModel }) {
  const ownModel = useStudyPlan(!planModel);
  const model = planModel || ownModel;
  const [params, setParams] = useSearchParams();
  const [dialog, setDialog] = useState(null);
  const [round, setRound] = useState(null);
  const [roundIndex, setRoundIndex] = useState(0);
  const [notice, setNotice] = useState(null);
  const [historyVersion, setHistoryVersion] = useState(0);
  const plan = model.data?.plan;
  const readOnly = !!model.data?.finished;
  const requestedTab = params.get(embedded ? "view" : "tab") || (readOnly || (!plan && model.data?.pausedPlans?.length) ? "plan" : "today");
  const tab = TABS.some((name) => name.toLowerCase() === requestedTab)
    ? requestedTab
    : "today";
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
      if (mode === "review") return reviewPlanItem(selected.id, payload.passed);
      if (payload.done) return updatePlanItem(selected.id, payload);
      return recordPlanResult(selected.id, payload);
    });
    if (!result) return;
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

  if (model.loading)
    return (
      <p role="status" className="py-12 text-muted">
        Loading your plan…
      </p>
    );
  if (model.error)
    return (
      <div role="alert" className="space-y-4 py-12 text-bad">
        <p>{model.error}</p>
        <button className="min-h-[44px] text-brand" onClick={model.reload}>
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

  return (
    <div className="mx-auto max-w-5xl py-5 sm:py-8">
      <h1 className="mb-4 font-display text-2xl font-bold text-fg">My plan</h1>
      <nav
        aria-label="Study plan tabs"
        className="mb-6 flex gap-1 overflow-x-auto border-b border-ink/[0.1]"
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
            className={`min-h-[44px] shrink-0 border-b-2 px-3 text-sm ${tab === name.toLowerCase() ? "border-brand text-brand" : "border-transparent text-muted"}`}
          >
            {name}
          </button>
        ))}
      </nav>

      {tab === 'plan' && !item && !round && <StudyRecovery model={model} />}

      {round && !roundItem ? (
        <section className="space-y-4 text-fg-3">
          <h2 className="text-xl font-semibold text-fg">
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
        <div className="space-y-4 text-sm text-muted">
          <p>You have no current plan. Choose your goal, your weeks and your daily hours, and see the plan before you save it.</p>
          <Link
            className="inline-flex min-h-[44px] items-center text-brand"
            to="/my-plan"
          >
            Build your plan
          </Link>
        </div>
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
          <h2 className="text-xl font-semibold text-fg">
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
  );
}
