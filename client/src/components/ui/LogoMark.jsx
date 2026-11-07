import { useId } from "react";

// The PrepStack mark: a bold "P" on an amber tile with three stacked layers. Same shape as /favicon.svg.
const LogoMark = ({ className = "w-7 h-7" }) => {
  const gradientId = useId(); // unique per instance, so the navbar and footer copies never share an id
  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "var(--logo-top)" }} />
          <stop offset="1" style={{ stopColor: "var(--logo-bottom)" }} />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill={`url(#${gradientId})`} />
      <g style={{ fill: "var(--card)" }}>
        <path
          fillRule="evenodd"
          d="M150 104H304A104 104 0 0 1 304 312H200V390A18 18 0 0 1 182 408H150A18 18 0 0 1 132 390V122A18 18 0 0 1 150 104ZM200 164H300A44 44 0 0 1 300 252H200Z"
        />
        <rect x="252" y="344" width="148" height="26" rx="13" opacity=".92" />
        <rect x="252" y="382" width="108" height="26" rx="13" opacity=".62" />
        <rect x="252" y="420" width="68" height="26" rx="13" opacity=".36" />
      </g>
    </svg>
  );
};

export default LogoMark;
