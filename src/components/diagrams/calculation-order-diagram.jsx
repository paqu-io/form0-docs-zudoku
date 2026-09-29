// KEEP IN SYNC: this SVG has a Mermaid twin inside <EngineDiagram name="calculation-order"> in
// pages/core/engine/calculations-dependencies.mdx (and the es/fr/it copies, which must stay
// identical). When you change boxes, arrows, or labels here, update that Mermaid fence too.
// See "Diagrams" in CONTRIBUTING.md.

import { ArrowMarkers, diagramStyle as s } from "./diagram-style.jsx"

const INPUT_STYLE = { ...s.box, strokeDasharray: "4 3" }
const CYCLE_STYLE = { ...s.frame }

/**
 * A field node: data_name in monospace, a short translated note underneath.
 * @param {{ x: number, y: number, width: number, name: string, note: string, style: object, noteStyle?: object }} props
 */
function FieldNode({ x, y, width, name, note, style, noteStyle = s.sub }) {
  return (
    <g>
      <rect x={x} y={y} width={width} height="46" rx="6" style={style} />
      <text x={x + width / 2} y={y + 20} textAnchor="middle" style={s.code}>
        {name}
      </text>
      <text x={x + width / 2} y={y + 36} textAnchor="middle" style={noteStyle}>
        {note}
      </text>
    </g>
  )
}

/**
 * Calculated fields run after the fields they reference; a cycle is set to null and skipped.
 * @param {{ label: (key: string) => string, ariaLabel: string }} props
 */
export function CalculationOrderDiagram({ label, ariaLabel }) {
  const arrow = "url(#co-arrow)"
  const arrowAccent = "url(#co-arrow-accent)"
  const accentWire = { ...s.wire, stroke: "var(--primary)" }

  return (
    <svg
      viewBox="0 0 860 236"
      role="img"
      aria-label={ariaLabel}
      style={{ width: "100%", minWidth: 640, height: "auto" }}
    >
      <ArrowMarkers prefix="co" />

      {/* Left: an ordered dependency graph */}
      <text x="20" y="24" style={{ ...s.text, fontWeight: 600 }}>
        {label("orderTitle")}
      </text>

      <FieldNode x={20} y={46} width={104} name="qty" note={label("input")} style={INPUT_STYLE} />
      <FieldNode
        x={20}
        y={140}
        width={104}
        name="price"
        note={label("input")}
        style={INPUT_STYLE}
      />
      <FieldNode
        x={184}
        y={93}
        width={132}
        name="subtotal"
        note={label("runsFirst")}
        style={s.box}
      />
      <FieldNode x={380} y={46} width={120} name="tax" note={label("runsSecond")} style={s.box} />
      <FieldNode x={380} y={150} width={120} name="total" note={label("runsThird")} style={s.box} />

      <line x1="124" y1="69" x2="180" y2="108" markerEnd={arrow} style={s.wire} />
      <line x1="124" y1="163" x2="180" y2="124" markerEnd={arrow} style={s.wire} />
      <line x1="316" y1="108" x2="376" y2="75" markerEnd={arrow} style={s.wire} />
      <line x1="316" y1="124" x2="376" y2="165" markerEnd={arrow} style={s.wire} />
      <line x1="440" y1="92" x2="440" y2="146" markerEnd={arrow} style={s.wire} />

      <line
        x1="548"
        y1="14"
        x2="548"
        y2="222"
        style={{ stroke: "var(--border)", strokeWidth: 1, strokeDasharray: "4 4" }}
      />

      {/* Right: a cycle */}
      <text x="572" y="24" style={{ ...s.text, fontWeight: 600 }}>
        {label("cycleTitle")}
      </text>

      <FieldNode
        x={572}
        y={46}
        width={104}
        name="a"
        note="null"
        style={CYCLE_STYLE}
        noteStyle={s.labelAccent}
      />
      <FieldNode
        x={740}
        y={46}
        width={104}
        name="b"
        note="null"
        style={CYCLE_STYLE}
        noteStyle={s.labelAccent}
      />
      <line x1="676" y1="61" x2="736" y2="61" markerEnd={arrowAccent} style={accentWire} />
      <line x1="740" y1="79" x2="680" y2="79" markerEnd={arrowAccent} style={accentWire} />
      <text x="742" y="116" textAnchor="middle" style={s.labelAccent}>
        {label("cycleResult")}
      </text>

      <FieldNode x={640} y={150} width={136} name="c" note={label("runsWithNull")} style={s.box} />
      <line x1="624" y1="92" x2="676" y2="146" markerEnd={arrow} style={s.wire} />
    </svg>
  )
}
