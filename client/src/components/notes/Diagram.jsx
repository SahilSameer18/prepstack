import { useId } from "react";
import { layoutDiagram } from "./diagramLayout";

// Draws one diagram from its data. Colours come from the design tokens through style (SVG attributes cannot use var()),
// and the caption is shown under the picture so the diagram also works as text.
const boxStyle = { fill: "var(--elevated)", stroke: "var(--line)" };

// One node: a plain box, or a database (cylinder), queue, cache, client (rounded) or external (dashed) shape.
const Shape = ({ b, fill }) => {
  const { x, y, w, h, shape } = b;
  const common = { strokeWidth: 1, style: { fill, stroke: "var(--line)" } };
  if (shape === "database") {
    const ry = 6;
    return (
      <g {...common}>
        <path d={`M${x} ${y + ry} v${h - 2 * ry} a${w / 2} ${ry} 0 0 0 ${w} 0 v${-(h - 2 * ry)} a${w / 2} ${ry} 0 0 0 ${-w} 0 z`} style={common.style} strokeWidth="1" />
        <path d={`M${x} ${y + ry} a${w / 2} ${ry} 0 0 0 ${w} 0`} style={{ fill: "none", stroke: "var(--line)" }} strokeWidth="1" />
      </g>
    );
  }
  if (shape === "queue") {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} rx="6" {...common} />
        {[7, 13, 19].map((d) => <line key={d} x1={x + w - d} y1={y + 8} x2={x + w - d} y2={y + h - 8} strokeWidth="1" style={{ stroke: "var(--muted)" }} />)}
      </g>
    );
  }
  if (shape === "client") return <rect x={x} y={y} width={w} height={h} rx={h / 2} {...common} />;
  if (shape === "external") return <rect x={x} y={y} width={w} height={h} rx="8" strokeDasharray="5 3" {...common} />;
  if (shape === "cache") return <rect x={x} y={y} width={w} height={h} rx="8" {...common} style={{ fill: "var(--card-hover)", stroke: "var(--line)" }} />;
  return <rect x={x} y={y} width={w} height={h} rx="8" {...common} />;
};

const Diagram = ({ diagram }) => {
  const markerId = useId();
  const { width, height, boxes, arrows, groups = [], lifelines = [] } = layoutDiagram(diagram);
  const isLayers = diagram.kind === "layers";
  const isSequence = diagram.kind === "sequence";

  return (
    <figure className="rounded-2xl bg-card border border-ink/[0.08] p-3 sm:p-4">
      {/* a wide picture keeps a readable size on a phone and scrolls sideways inside its card instead of shrinking its text */}
      <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={diagram.caption} className="w-full h-auto max-h-[460px]" style={width > 420 ? { minWidth: Math.min(width, 640) } : undefined}>
        <defs>
          <marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" style={{ fill: "var(--muted)" }} />
          </marker>
        </defs>
        {groups.map((g) => (
          <g key={g.key}>
            <rect x={g.x} y={g.y} width={g.w} height={g.h} rx="10" strokeWidth="1" strokeDasharray="4 3" style={{ fill: "none", stroke: "var(--muted)" }} />
            <text x={g.x + 10} y={g.y + 12} fontSize="11" fontWeight="600" style={{ fill: "var(--muted)" }}>{g.label}</text>
          </g>
        ))}
        {lifelines.map((l) => (
          <line key={l.key} x1={l.x} y1={l.y1} x2={l.x} y2={l.y2} strokeWidth="1" strokeDasharray="3 4" style={{ stroke: "var(--line)" }} />
        ))}
        {arrows.map((a, i) => {
          const mx = a.x1 + (a.x2 - a.x1) * 0.18;
          const my = a.y1 + (a.y2 - a.y1) * 0.18;
          return (
            <g key={i}>
              <line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} markerEnd={`url(#${markerId})`} strokeWidth="1.5" strokeDasharray={a.dashed ? "5 3" : undefined} style={{ stroke: "var(--muted)" }} />
              {a.label && (Math.abs(a.y2 - a.y1) > Math.abs(a.x2 - a.x1) ? (
                // a mostly vertical arrow keeps its label beside the line, so the text never sits on it
                <text x={(a.x1 + a.x2) / 2 + 8} y={(a.y1 + a.y2) / 2} dominantBaseline="central" fontSize="11" style={{ fill: "var(--muted)" }}>{a.label}</text>
              ) : (
                <text x={(a.x1 + a.x2) / 2} y={(a.y1 + a.y2) / 2 - 6} textAnchor="middle" fontSize="11" style={{ fill: "var(--muted)" }}>{a.label}</text>
              ))}
              {a.step !== undefined && (
                <g>
                  <circle cx={mx} cy={my} r="8" strokeWidth="1" style={{ fill: "var(--card)", stroke: "var(--muted)" }} />
                  <text x={mx} y={my} textAnchor="middle" dominantBaseline="central" fontSize="10" fontWeight="700" style={{ fill: "var(--fg-2)" }}>{a.step}</text>
                </g>
              )}
            </g>
          );
        })}
        {boxes.map((b) => (
          <g key={b.key}>
            {isSequence || isLayers || !b.shape ? (
              <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="8" strokeWidth="1" style={{ ...boxStyle, fill: isLayers ? "var(--card-hover)" : "var(--elevated)" }} />
            ) : (
              <Shape b={b} fill="var(--elevated)" />
            )}
            <text x={b.x + (b.w - (b.shape === "queue" ? 24 : 0)) / 2} y={b.y + b.h / 2} textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="600" style={{ fill: "var(--fg-2)" }}>{b.label}</text>
          </g>
        ))}
      </svg>
      </div>
      <figcaption className="text-muted text-xs sm:text-sm text-center mt-2 leading-relaxed">{diagram.caption}</figcaption>
    </figure>
  );
};

export default Diagram;
