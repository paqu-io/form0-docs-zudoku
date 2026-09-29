// KEEP IN SYNC: this SVG has a Mermaid twin inside <EngineDiagram name="repeatable-scope"> in
// pages/core/engine/parent-child-scopes.mdx (and the es/fr/it copies, which must stay identical).
// When you change boxes, arrows, or labels here, update that Mermaid fence too.
// See "Diagrams" in CONTRIBUTING.md.

import { ArrowMarkers, diagramStyle as s } from "./diagram-style.jsx"

const CHIP_STYLE = { fill: "var(--secondary)", stroke: "var(--border)", strokeWidth: 1 }
const ZONE_STYLE = { ...s.box, fill: "none", strokeDasharray: "5 4" }
const NO_STYLE = {
  fill: "none",
  stroke: "var(--muted-foreground)",
  strokeWidth: 1.4,
  strokeDasharray: "4 4",
}
const X_STYLE = { stroke: "var(--muted-foreground)", strokeWidth: 2 }

/**
 * A field chip showing a data_name.
 * @param {{ x: number, y: number, width: number, height?: number, name: string }} props
 */
function Chip({ x, y, width, height = 30, name }) {
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx="5" style={CHIP_STYLE} />
      <text x={x + width / 2} y={y + height / 2 + 4} textAnchor="middle" style={s.code}>
        {name}
      </text>
    </g>
  )
}

/**
 * One repeatable row with its own engine instance.
 * @param {{ x: number, title: string, note: string, footer: string[], footerStyle: object }} props
 */
function Row({ x, title, note, footer, footerStyle }) {
  return (
    <g>
      <rect x={x} y="175" width="280" height="125" rx="7" style={s.frame} />
      <text x={x + 14} y="196" style={{ ...s.text, fontWeight: 600 }}>
        {title}
      </text>
      <text x={x + 14} y="213" style={s.sub}>
        {note}
      </text>
      <Chip x={x + 14} y={224} width={64} name="qty" />
      <Chip x={x + 86} y={224} width={64} name="price" />
      <Chip x={x + 158} y={224} width={108} name="line_total" />
      {footer.map((line, index) => (
        <text key={line} x={x + 14} y={274 + index * 15} style={footerStyle}>
          {line}
        </text>
      ))}
    </g>
  )
}

/**
 * Each repeatable row runs its own engine, seeded with a copy of the parent values.
 * @param {{ label: (key: string) => string, ariaLabel: string }} props
 */
export function RepeatableScopeDiagram({ label, ariaLabel }) {
  const accentWire = { ...s.wire, stroke: "var(--primary)", strokeWidth: 1.6 }
  const arrowAccent = "url(#rs-arrow-accent)"

  return (
    <svg
      viewBox="0 0 820 330"
      role="img"
      aria-label={ariaLabel}
      style={{ width: "100%", minWidth: 640, height: "auto" }}
    >
      <ArrowMarkers prefix="rs" />

      <rect x="10" y="10" width="800" height="310" rx="10" style={s.box} />
      <text x="26" y="32" style={{ ...s.text, fontWeight: 600 }}>
        {label("mainForm")}
      </text>
      <Chip x={30} y={46} width={130} height={34} name="customer" />
      <Chip x={180} y={46} width={150} height={34} name="discount_pct" />

      <rect x="30" y="130" width="760" height="180" rx="8" style={ZONE_STYLE} />
      <text x="46" y="153" style={{ ...s.text, fontWeight: 600 }}>
        RepeatableSection
      </text>
      <text x="176" y="153" style={s.subCode}>
        line_items
      </text>

      <Row
        x={50}
        title={label("row1")}
        note={label("ownEngine")}
        footer={["$qty * $price", "* (1 - $discount_pct / 100)"]}
        footerStyle={s.subCode}
      />
      <Row
        x={490}
        title={label("row2")}
        note={label("ownEngine")}
        footer={[label("sameFields")]}
        footerStyle={s.sub}
      />

      {/* Parent values are copied into each row */}
      <path d="M255 80 C 255 125, 300 125, 300 171" markerEnd={arrowAccent} style={accentWire} />
      <path d="M255 80 C 255 125, 520 120, 520 171" markerEnd={arrowAccent} style={accentWire} />
      <text x="532" y="153" style={s.labelAccent}>
        {label("parentCopied")}
      </text>

      {/* Rows are isolated from each other */}
      <line x1="330" y1="239" x2="490" y2="239" style={NO_STYLE} />
      <line x1="403" y1="232" x2="417" y2="246" style={X_STYLE} />
      <line x1="417" y1="232" x2="403" y2="246" style={X_STYLE} />
      <text x="410" y="270" textAnchor="middle" style={s.label}>
        {label("isolated")}
      </text>
    </svg>
  )
}
