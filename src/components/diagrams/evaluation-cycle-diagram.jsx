// KEEP IN SYNC: this SVG has a Mermaid twin inside <EngineDiagram name="evaluation-cycle"> in
// pages/core/engine/evaluation-cycle.mdx (and the es/fr/it copies, which must stay identical).
// When you change boxes, arrows, or labels here, update that Mermaid fence too.
// See "Diagrams" in CONTRIBUTING.md.

import { ArrowMarkers, diagramStyle as s } from "./diagram-style.jsx"

const STEP_WIDTH = 90
const STEP_GAP = 8
const FIRST_STEP_X = 188
const PASS_STEPS = [
  ["calculations"],
  ["required"],
  ["visible"],
  ["readOnly"],
  ["valueErrorsLine1", "valueErrorsLine2"],
].map((lines, index) => ({ lines, x: FIRST_STEP_X + index * (STEP_WIDTH + STEP_GAP) }))

/**
 * One value change: the full eval() pass, the change event, and the SETVALUE loop.
 * @param {{ label: (key: string) => string, ariaLabel: string }} props
 */
export function EvaluationCycleDiagram({ label, ariaLabel }) {
  const arrow = "url(#ec-arrow)"
  const monoLabel = { ...s.label, fontFamily: s.code.fontFamily }

  return (
    <svg
      viewBox="0 0 906 262"
      role="img"
      aria-label={ariaLabel}
      style={{ width: "100%", minWidth: 640, height: "auto" }}
    >
      <ArrowMarkers prefix="ec" />

      {/* Top lane: edit → eval() pass → renderer */}
      <rect x="10" y="42" width="96" height="56" rx="6" style={s.box} />
      <text x="58" y="66" textAnchor="middle" style={s.text}>
        {label("userEdits")}
      </text>
      <text x="58" y="84" textAnchor="middle" style={s.subCode}>
        quantity
      </text>

      <line x1="106" y1="70" x2="172" y2="70" markerEnd={arrow} style={s.wire} />
      <text x="139" y="61" textAnchor="middle" style={monoLabel}>
        setValue
      </text>

      <rect x="176" y="18" width="506" height="104" rx="8" style={s.frame} />
      <text x="190" y="38" style={s.title}>
        eval()
      </text>
      <text x="242" y="38" style={s.sub}>
        {label("onePass")}
      </text>

      {PASS_STEPS.map(({ x, lines }, index) => {
        const center = x + STEP_WIDTH / 2
        const next = PASS_STEPS[index + 1]
        return (
          <g key={x}>
            <rect x={x} y="54" width={STEP_WIDTH} height="52" rx="5" style={s.box} />
            {lines.length === 1 ? (
              <text x={center} y="84" textAnchor="middle" style={s.text}>
                {label(lines[0])}
              </text>
            ) : (
              <>
                <text x={center} y="76" textAnchor="middle" style={s.text}>
                  {label(lines[0])}
                </text>
                <text x={center} y="93" textAnchor="middle" style={s.text}>
                  {label(lines[1])}
                </text>
              </>
            )}
            {next && (
              <line
                x1={x + STEP_WIDTH}
                y1="80"
                x2={next.x}
                y2="80"
                markerEnd={arrow}
                style={s.wire}
              />
            )}
          </g>
        )
      })}

      <line x1="682" y1="70" x2="732" y2="70" markerEnd={arrow} style={s.wire} />
      <text x="707" y="61" textAnchor="middle" style={s.label}>
        {label("state")}
      </text>

      <rect x="736" y="42" width="160" height="56" rx="6" style={s.box} />
      <text x="816" y="66" textAnchor="middle" style={s.text}>
        {label("renderer")}
      </text>
      <text x="816" y="84" textAnchor="middle" style={s.sub}>
        {label("rerenders")}
      </text>

      <line x1="816" y1="98" x2="816" y2="186" markerEnd={arrow} style={s.wire} />
      <text x="808" y="148" textAnchor="end" style={monoLabel}>
        trigger('change')
      </text>

      {/* Bottom lane, right to left: handler → operations → host → back into eval() */}
      <rect x="736" y="190" width="160" height="56" rx="6" style={s.box} />
      <text x="816" y="214" textAnchor="middle" style={s.code}>
        ON('change')
      </text>
      <text x="816" y="232" textAnchor="middle" style={s.sub}>
        {label("handlerRuns")}
      </text>

      <line x1="736" y1="218" x2="646" y2="218" markerEnd={arrow} style={s.wire} />
      <text x="691" y="209" textAnchor="middle" style={s.label}>
        {label("returns")}
      </text>

      <rect x="462" y="190" width="180" height="56" rx="6" style={s.box} />
      <text x="552" y="214" textAnchor="middle" style={s.text}>
        {label("operations")}
      </text>
      <text x="552" y="232" textAnchor="middle" style={s.subCode}>
        SETVALUE · ALERT
      </text>

      <line x1="462" y1="218" x2="406" y2="218" markerEnd={arrow} style={s.wire} />
      <text x="434" y="209" textAnchor="middle" style={s.label}>
        {label("toHost")}
      </text>

      <rect x="222" y="190" width="180" height="56" rx="6" style={s.box} />
      <text x="312" y="214" textAnchor="middle" style={s.text}>
        {label("hostApplies")}
      </text>
      <text x="312" y="232" textAnchor="middle" style={s.subCode}>
        onOperations
      </text>

      <line
        x1="312"
        y1="190"
        x2="312"
        y2="126"
        markerEnd="url(#ec-arrow-accent)"
        style={s.wireLoop}
      />
      <text x="322" y="152" style={s.labelAccent}>
        {label("loopTitle")}
      </text>
      <text x="322" y="168" style={s.label}>
        {label("loopNote")}
      </text>
    </svg>
  )
}
