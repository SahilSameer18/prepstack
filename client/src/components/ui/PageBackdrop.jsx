// Fading grid paper plus two warm glows behind the top of a page. Colours are tokens; --glow sets the strength.
// Put it first inside a `relative` page wrapper; page content sits above it (relative z-10).
export default function PageBackdrop() {
  const fade = "radial-gradient(ellipse 70% 80% at 60% 18%, var(--ink) 20%, transparent 75%)";
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[820px] transform-gpu"
      style={{ maskImage: fade, WebkitMaskImage: fade }}
    >
      <div className="absolute inset-0 bg-line-grid" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 45% 55% at 78% 22%, color-mix(in srgb, var(--brand-grad-top) var(--glow), transparent) 0%, transparent 70%), radial-gradient(ellipse 40% 45% at 8% 4%, color-mix(in srgb, var(--brand-grad-top) calc(var(--glow) * 0.5), transparent) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
