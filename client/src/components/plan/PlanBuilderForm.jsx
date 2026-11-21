import SelectField from "../ui/SelectField";
import { DEFAULT_SUBJECTS, PACES, paceMinutes, planTopics } from "../../utils/planBuilder";

const INPUT =
  "w-full min-h-[44px] rounded-xl border border-ink/[0.14] !bg-card px-3 py-2.5 text-sm text-fg outline-none transition-[border-color,box-shadow] duration-200 hover:border-ink/[0.24] focus:border-brand focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand)_12%,transparent)]";
const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Keep visible labels separate from the values the API expects.
const GOAL_CHOICES = [
  { value: "placements", label: "Campus placements" },
  { value: "role", label: "Switch to a developer role" },
  { value: "bigtech", label: "Big-tech SDE interviews" },
];
const STYLE_CHOICES = [
  { value: "one-topic", label: "One topic at a time" },
  { value: "mixed", label: "Mix topics from the start" },
];
const PACE_CHOICES = Object.entries(PACES).map(([value, pace]) => ({
  value,
  label: `${pace.label}: a Medium problem takes about ${paceMinutes(value)} min`,
}));
const REST_DAY_CHOICES = [
  { value: "none", label: "No fixed rest day" },
  ...WEEKDAYS.map((label, value) => ({ label, value: String(value) })),
];

// Keep every label and validation message connected to its form control.
function Field({ name, label, error, hint, children }) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={`plan-${name}`}
        className="block text-sm font-semibold text-fg"
      >
        {label}
      </label>
      {children}
      {hint && <p className="text-sm leading-relaxed text-muted">{hint}</p>}
      {error && (
        <p id={`plan-${name}-error`} className="text-sm text-bad">
          {error}
        </p>
      )}
    </div>
  );
}

// The form only renders settings and reports edits. Requests and saving belong to usePlanBuilder.
export default function PlanBuilderForm({
  settings,
  options,
  errors,
  onChange,
  onGenerate,
  disabled,
}) {
  const topics = planTopics(settings, options);
  const sheets =
    settings.goalType === "bigtech"
      ? options.sheets.filter((sheet) =>
          ["neetcode-150", "striver-sde"].includes(sheet.slug),
        )
      : options.sheets;

  function fieldAttributes(name) {
    return {
      id: `plan-${name}`,
      className: INPUT,
      "aria-invalid": !!errors[name],
      "aria-describedby": errors[name] ? `plan-${name}-error` : undefined,
    };
  }

  // Goal changes apply a useful preset and clear topic selections from the previous syllabus.
  function changeGoal(goalType) {
    const bigTech = goalType === "bigtech";
    onChange({
      goalType,
      sheetSlug: bigTech ? "neetcode-150" : "blind-75",
      subjects: bigTech ? [...DEFAULT_SUBJECTS, "hld"] : [...DEFAULT_SUBJECTS],
      knownTopics: [],
    });
  }

  // Dropdown values are text; the server expects a weekday number or null.
  function changeRestDay(value) {
    onChange({ restDay: value === "none" ? null : Number(value) });
  }

  function toggleChoice(field, value, checked) {
    const selected = settings[field];
    onChange({
      [field]: checked
        ? [...selected, value]
        : selected.filter((item) => item !== value),
    });
  }

  return (
    <form
      id="plan-builder"
      onSubmit={(event) => {
        event.preventDefault();
        onGenerate();
      }}
    >
      <fieldset disabled={disabled} className="space-y-7 disabled:opacity-60">
        <legend className="mb-5 font-display text-2xl font-bold tracking-tight text-fg">
          Make room for your goal
        </legend>
        <Field
          name="goalType"
          label="What are you preparing for?"
          error={errors.goalType}
        >
          <SelectField
            {...fieldAttributes("goalType")}
            disabled={disabled}
            value={settings.goalType}
            onValueChange={changeGoal}
            options={GOAL_CHOICES}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field name="weeks" label="Weeks to prepare" error={errors.weeks}>
            <input
              {...fieldAttributes("weeks")}

              type="number"

              min="1"

              max="52"

              step="1"
              required

              value={Number.isNaN(settings.weeks) ? "" : settings.weeks}

              onChange={(event) =>
                onChange({ weeks: event.target.valueAsNumber })
              }
            />
          </Field>
          <Field
            name="startDate"
            label="Start date"
            error={errors.startDate}
          >
            <input
              {...fieldAttributes("startDate")}

              type="date"
              required

              value={settings.startDate}

              onChange={(event) => onChange({ startDate: event.target.value })}
            />
          </Field>
          <Field
            name="weekdayHours"
            label="Hours per weekday"
            hint="Time available on each Monday to Friday. Use 0 for no study."
            error={errors.weekdayHours}
          >
            <input
              {...fieldAttributes("weekdayHours")}

              type="number"

              min="0"

              max="12"

              step="any"
              required

              value={
                Number.isNaN(settings.weekdayHours) ? "" : settings.weekdayHours
              }

              onChange={(event) =>
                onChange({ weekdayHours: event.target.valueAsNumber })
              }
            />
          </Field>
          <Field
            name="weekendHours"
            label="Hours per weekend day"
            hint="Time available on each Saturday and Sunday."
            error={errors.weekendHours}
          >
            <input
              {...fieldAttributes("weekendHours")}

              type="number"

              min="0"

              max="12"

              step="any"
              required

              value={
                Number.isNaN(settings.weekendHours) ? "" : settings.weekendHours
              }

              onChange={(event) =>
                onChange({ weekendHours: event.target.valueAsNumber })
              }
            />
          </Field>
          <Field name="restDay" label="Weekly rest day" error={errors.restDay}>
            <SelectField
              {...fieldAttributes("restDay")}
              disabled={disabled}
              value={settings.restDay === null ? "none" : String(settings.restDay)}
              onValueChange={changeRestDay}
              options={REST_DAY_CHOICES}
            />
          </Field>
          <Field
            name="style"
            label="How do you like to study?"
            error={errors.style}
          >
            <SelectField
              {...fieldAttributes("style")}
              disabled={disabled}
              value={settings.style}
              onValueChange={(value) => onChange({ style: value })}
              options={STYLE_CHOICES}
            />
          </Field>
          <Field
            name="pace"
            label="How fast do you solve problems?"
            error={errors.pace}
          >
            <SelectField
              {...fieldAttributes("pace")}
              disabled={disabled}
              value={settings.pace}
              onValueChange={(value) => onChange({ pace: value })}
              options={PACE_CHOICES}
            />
          </Field>
        </div>

        {settings.goalType === "role" ? (
          <Field
            name="roadmapSlug"
            label="Choose your role roadmap"
            error={errors.roadmapSlug}
          >
            <SelectField
              {...fieldAttributes("roadmapSlug")}
              disabled={disabled}
              value={settings.roadmapSlug}
              onValueChange={(value) => onChange({ roadmapSlug: value, knownTopics: [] })}
              options={options.roadmaps.map((road) => ({
                value: road.slug,
                label: road.title,
              }))}
            />
          </Field>
        ) : (
          <>
            <Field
              name="sheetSlug"
              label="Choose a DSA sheet"
              error={errors.sheetSlug}
            >
              <SelectField
                {...fieldAttributes("sheetSlug")}
                disabled={disabled}
                value={settings.sheetSlug}
                onValueChange={(value) => onChange({ sheetSlug: value, knownTopics: [] })}
                options={sheets.map((sheet) => ({
                  value: sheet.slug,
                  label: sheet.title,
                }))}
              />
            </Field>
            <fieldset>
              <legend className="mb-3 text-sm font-semibold text-fg">
                CS subjects to include
              </legend>
              <div className="grid gap-1 sm:grid-cols-2">
                {options.subjects.map((subject) => (
                  <label
                    key={subject.id}
                    className="flex min-h-[44px] items-center gap-3 text-sm text-fg-3"
                  >
                    <input

              type="checkbox"
                      className="size-[18px] accent-brand"

              checked={settings.subjects.includes(subject.id)}

              onChange={(event) =>
                        toggleChoice(
                          "subjects",
                          subject.id,
                          event.target.checked,
                        )
                      }
                    />
                    {subject.title}
                  </label>
                ))}
              </div>
              {errors.subjects && (
                <p className="text-sm text-bad">{errors.subjects}</p>
              )}
            </fieldset>
          </>
        )}

        <details className="border-t border-ink/[0.1] pt-5">
          <summary className="min-h-[44px] cursor-pointer text-sm font-semibold text-fg">
            Already know some DSA topics?{" "}
            <span className="font-normal text-muted">Optional</span>
          </summary>
          <p className="mb-3 text-sm leading-relaxed text-muted">
            Selected topics are left out of this plan. Choose only topics you
            can solve confidently.
          </p>
          {settings.knownTopics.length > 0 && (
            <button

              type="button"
              className="min-h-[44px] cursor-pointer text-sm font-semibold text-brand transition-colors hover:text-brand-hover"
              onClick={() => onChange({ knownTopics: [] })}
            >
              Clear known topics
            </button>
          )}
          <div className="grid gap-1 sm:grid-cols-2">
            {topics.map((topic) => (
              <label
                key={topic.id}
                className="flex min-h-[44px] items-center gap-3 text-sm text-fg-3"
              >
                <input

              type="checkbox"
                  className="size-[18px] shrink-0 accent-brand"

              checked={settings.knownTopics.includes(topic.id)}

              onChange={(event) =>
                    toggleChoice("knownTopics", topic.id, event.target.checked)
                  }
                />
                {topic.title}
              </label>
            ))}
          </div>
          {!topics.length && (
            <p className="text-sm text-muted">
              This roadmap has no DSA topics to skip.
            </p>
          )}
          {errors.knownTopics && (
            <p className="mt-2 text-sm text-bad">{errors.knownTopics}</p>
          )}
        </details>
      </fieldset>
    </form>
  );
}
