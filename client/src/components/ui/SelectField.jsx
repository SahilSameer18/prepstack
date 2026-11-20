import * as Select from '@radix-ui/react-select';
import { useRef, useState } from 'react';
import { FiCheck, FiChevronDown, FiChevronUp } from 'react-icons/fi';

// One dropdown for forms and filters. Radix owns focus, keyboard navigation and typeahead.
// The portal avoids clipped parents; the available-height limit keeps the list inside the screen.
export default function SelectField({
  options,
  value,
  onValueChange,
  disabled = false,
  placeholder = 'Choose an option',
  className = '',
  ...triggerProps
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const wasOpenOnPointerDown = useRef(false);
  const selected = options.find((option) => String(option.value) === String(value));

  // Remember the state at the start of a tap, before Radix handles mouse/touch opening.
  function handleTriggerPointerDown(event) {
    wasOpenOnPointerDown.current = open;
    if (open) event.preventDefault();
  }

  // A second tap closes once; it must not become a fresh open event on touch screens.
  function handleTriggerClick(event) {
    if (!wasOpenOnPointerDown.current) return;
    event.preventDefault();
    wasOpenOnPointerDown.current = false;
    setOpen(false);
  }

  return (
    <Select.Root
      open={open}
      onOpenChange={setOpen}
      value={selected ? String(selected.value) : ''}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <Select.Trigger
        {...triggerProps}
        ref={triggerRef}
        onPointerDown={handleTriggerPointerDown}
        onClick={handleTriggerClick}
        style={{ pointerEvents: 'auto' }}
        className={`flex min-h-[44px] w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-ink/[0.15] bg-card-hover px-3 py-2.5 text-left text-sm text-fg transition-colors hover:border-ink/[0.3] focus-visible:outline-2 focus-visible:outline-brand data-[state=open]:border-brand disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      >
        <span className="min-w-0 flex-1 whitespace-normal break-words">
          <Select.Value placeholder={placeholder}>{selected?.label}</Select.Value>
        </span>
        <Select.Icon asChild>
          <FiChevronDown className="shrink-0 text-muted" aria-hidden="true" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={6}
          collisionPadding={16}
          onPointerDownOutside={(event) => {
            // Let the trigger finish its own toggle instead of closing it on pointer-down.
            if (triggerRef.current?.contains(event.detail.originalEvent.target)) {
              event.preventDefault();
            }
          }}
          className="z-[100] overflow-hidden rounded-xl border border-ink/[0.15] bg-elevated text-fg shadow-2xl"
          style={{
            width: 'var(--radix-select-trigger-width)',
            maxWidth: 'calc(100vw - 2rem)',
            maxHeight: 'min(20rem, var(--radix-select-content-available-height))',
          }}
        >
          <Select.ScrollUpButton className="flex h-7 items-center justify-center bg-elevated text-muted">
            <FiChevronUp aria-hidden="true" />
          </Select.ScrollUpButton>
          <Select.Viewport className="p-1">
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={String(option.value)}
                disabled={option.disabled}
                className="relative flex min-h-[44px] cursor-pointer items-center rounded-lg py-2.5 pl-3 pr-9 text-sm text-fg-3 !outline-none data-[highlighted]:bg-brand/10 data-[highlighted]:text-brand data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              >
                <Select.ItemText>
                  <span className="whitespace-normal break-words">{option.label}</span>
                </Select.ItemText>
                <Select.ItemIndicator className="absolute right-3 text-brand">
                  <FiCheck aria-hidden="true" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton className="flex h-7 items-center justify-center bg-elevated text-muted">
            <FiChevronDown aria-hidden="true" />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
