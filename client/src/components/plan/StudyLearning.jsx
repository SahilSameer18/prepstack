import { useEffect, useRef, useState } from 'react';
import PlanDialog from '../ui/PlanDialog';
import { getPlanLearning, saveStartingCheck, previewLearningChange, applyLearningChange } from '../../api/services/planService';
import { extractError } from '../../utils/extractError';
import { studyMaterial } from '../../utils/studyPlan';

const BUTTON = 'min-h-[44px] rounded-xl border border-ink/[0.2] px-4 py-2 text-sm text-fg hover:border-brand disabled:opacity-50';

// Optional learning controls live outside Today. A preview is kept until the
// learner applies it; failed or stale writes leave the saved plan untouched.
export default function StudyLearning({ plan, model, onStart }) {
  const [reply, setReply] = useState(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [preview, setPreview] = useState(null);
  const [previewing, setPreviewing] = useState(false);  const previewTrigger = useRef(null);  const sectionRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const result = await getPlanLearning(controller.signal);
        if (!controller.signal.aborted) {
          setReply(result);
          setError('');
        }
      } catch (failure) {
        if (!controller.signal.aborted) setError(extractError(failure));
      }
    }
    load();
    return () => controller.abort();
  }, [plan.updatedAt, retry]);

  async function check(id, outcome) {
    await model.runAction(() => saveStartingCheck({ id, outcome }));
  }

  async function inspect(offerId, trigger) {    previewTrigger.current = trigger;
    setPreviewing(true);
    setError('');
    try {
      setPreview(await previewLearningChange(offerId));
    } catch (failure) {
      setError(extractError(failure));
    } finally {
      setPreviewing(false);
    }
  }

  async function apply() {
    const saved = await model.runAction(() => applyLearningChange(preview.offer.id, preview.checksum));
    if (saved) closePreview();  }  function closePreview() {    setPreview(null);    // Loading disables the trigger before the dialog captures focus. Restore    // that actual button after modal cleanup, or the section if it was removed.    requestAnimationFrame(() => {      const target = previewTrigger.current?.isConnected ? previewTrigger.current : sectionRef.current;      target?.focus();    });
  }

  const busy = model.busy || previewing;
  const lastQuiz = reply?.results.find((entry) => entry.id === 'notes');
  const notes = plan.items.find((item) => item.type === 'notes');
  return (
    <section ref={sectionRef} tabIndex={-1} aria-label="Learning checks" className="space-y-5 border-t border-ink/[0.1] pt-6">
      <h3 className="font-display text-xl font-bold text-fg">Check and strengthen your learning</h3>
      <p className="max-w-prose text-sm leading-relaxed text-muted">Optional self-checks for placement preparation and role changes. They do not grade you, skip lessons or change your review dates. You can correct or skip a starting check anytime.</p>
      {error && <div role="alert" className="space-y-2 text-sm text-bad">
        <p>{error}</p>
        <button className={BUTTON} onClick={() => setRetry((value) => value + 1)}>Retry learning checks</button>
      </div>}
      {!reply && !error && <p role="status" className="text-sm text-muted">Loading learning checks…</p>}
      {reply && <>
        <details className="space-y-4">
          <summary className="min-h-[44px] cursor-pointer py-3 font-semibold text-fg">Optional starting check</summary>
          {reply.checks.map((entry) => {
            const material = studyMaterial(entry);
            const result = reply.results.find((value) => value.id === entry.id);
            return <div key={entry.id} className="space-y-3 border-t border-ink/[0.1] py-4">
              <h4 className="font-semibold text-fg">{entry.title} · about {entry.minutes} min</h4>
              <p className="max-w-prose text-sm leading-relaxed text-fg-3">{entry.objective}</p>
              {(entry.link || material) && <a href={entry.link || material.path} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center text-sm text-brand underline">Open reference (new tab)</a>}
              {result && <p role="status" className="text-sm text-muted">Your last answer: {result.outcome === 'independent' ? 'could do independently' : result.outcome === 'help' ? 'would like practice' : 'skipped'}</p>}
              <div className="flex flex-wrap gap-2">
                <button className={BUTTON} disabled={busy} onClick={() => check(entry.id, 'independent')}>Could do independently</button>
                <button className={BUTTON} disabled={busy} onClick={() => check(entry.id, 'help')}>I would like practice</button>
                <button className={BUTTON} disabled={busy} onClick={() => check(entry.id, 'skipped')}>Skip this check</button>
              </div>
            </div>;
          })}
          {lastQuiz && <p className="text-sm text-muted">Last starting quiz: {lastQuiz.quizScore}/5. This is a familiar section quiz, not an unfamiliar application test.</p>}
          {notes && <button className={BUTTON} disabled={busy} onClick={() => onStart(notes, 'check')}>Try a section quiz without changing progress</button>}
        </details>
        <div className="space-y-4">
          <h4 className="font-semibold text-fg">Suggested next practice</h4>
          {!reply.offers.length && <p className="max-w-prose text-sm text-muted">No extra practice is suggested yet. Complete activities and reviews to build evidence. An unfamiliar problem is offered only when a completed topic has a suitable question outside your saved plan and solves.</p>}
          {reply.offers.map((offer) => <div key={offer.id} className="space-y-2 border-t border-ink/[0.1] pt-4">
            <p className="font-medium text-fg">{offer.title}{offer.minutes > 0 && ` · about ${offer.minutes} min`}</p>
            <p className="max-w-prose text-sm leading-relaxed text-muted">{offer.objective}</p>
            <button className={BUTTON} disabled={busy} onClick={(event) => inspect(offer.id, event.currentTarget)}>{previewing ? 'Preparing preview…' : 'Preview schedule change'}</button>
          </div>)}
        </div>
      </>}
      {model.actionError && !preview && <p role="alert" className="text-sm text-bad">{model.actionError}</p>}
      {preview && <PlanDialog title="Review learning change" busy={model.busy} onClose={closePreview}>
        <div className="space-y-4 text-sm">
          <p className="font-semibold text-fg">{preview.offer.title}</p>
          {preview.offer.kind === 'estimate' && <p>New estimate multiplier: {preview.offer.factor}. Completed and partially completed activities keep their recorded minutes.</p>}
          <ul className="space-y-2 text-fg-3">{preview.tasks.map((task) => <li key={task.key}>{task.day} · {task.plannedMinutes} min · {task.title}{task.part && ` (part ${task.part.n} of ${task.part.of})`}</li>)}</ul>
          <p>{preview.diff.movedItems} existing activities move; {preview.diff.newlyLeftOut} no longer fit. {preview.diff.doneProtected} completed parts are protected.</p>
          <p className="text-muted">The deadline stays the same. Existing skipped, locked and personal tasks are kept. Apply only if these trade-offs suit you.</p>
          {model.actionError && <p role="alert" className="text-bad">{model.actionError}</p>}
          <button className="amber-specular-button min-h-[44px] rounded-xl px-5 py-3 text-on-brand disabled:opacity-50" disabled={model.busy} onClick={apply}>{model.busy ? 'Saving…' : 'Apply learning change'}</button>
        </div>
      </PlanDialog>}
    </section>
  );
}
