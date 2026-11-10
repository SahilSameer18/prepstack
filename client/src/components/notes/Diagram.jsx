import { useId } from "react";
import { layoutDiagram } from "./diagramLayout";

// Draws one diagram from its data. Colours come from the design tokens through style (SVG attributes cannot use var()),
// and the caption is shown under the picture so the diagram also works as text.
const Diagram = ({ diagram }) => {
  const markerId = useId();
  const { width, height, boxes, arrows } = layoutDiagram(diagram);
  const isLayers = diagram.kind === "layers";

  return (
    <figure className="rounded-2xl bg-card border border-ink/[0.08] p-3 sm:p-4">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={diagram.caption} className="w-full h-auto max-h-[420px]">
        <defs>
          <marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" style={{ fill: "var(--muted)" }} />
          </marker>
        </defs>
        {arrows.map((a, i) => (
          <g key={i}>
            <line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} markerEnd={`url(#${markerId})`} strokeWidth="1.5" style={{ stroke: "var(--muted)" }} />
            {a.label && (
              <text x={(a.x1 + a.x2) / 2} y={(a.y1 + a.y2) / 2 - 6} textAnchor="middle" fontSize="11" style={{ fill: "var(--muted)" }}>{a.label}</text>
            )}
          </g>
        ))}
        {boxes.map((b) => (
          <g key={b.key}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="8" strokeWidth="1" style={{ fill: isLayers ? "var(--card-hover)" : "var(--elevated)", stroke: "var(--line)" }} />
            <text x={b.x + b.w / 2} y={b.y + b.h / 2} textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="600" style={{ fill: "var(--fg-2)" }}>{b.label}</text>
          </g>
        ))}
      </svg>
      <figcaption className="text-muted text-xs sm:text-sm text-center mt-2 leading-relaxed">{diagram.caption}</figcaption>
    </figure>
  );
};

export default Diagram;
