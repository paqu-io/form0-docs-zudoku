import { useUrlLocale } from "../hooks/use-locale-path.js"
import { t } from "../utils/i18n.js"
import { CalculationOrderDiagram } from "./diagrams/calculation-order-diagram.jsx"
import { EvaluationCycleDiagram } from "./diagrams/evaluation-cycle-diagram.jsx"
import { RepeatableScopeDiagram } from "./diagrams/repeatable-scope-diagram.jsx"

const DIAGRAMS = {
  "evaluation-cycle": { key: "evaluationCycle", Component: EvaluationCycleDiagram },
  "calculation-order": { key: "calculationOrder", Component: CalculationOrderDiagram },
  "repeatable-scope": { key: "repeatableScope", Component: RepeatableScopeDiagram },
}

/**
 * Renders a translated, prerendered SVG diagram for the engine pages.
 *
 * Pages wrap a ```mermaid fence inside this component. The fence is intentionally not rendered:
 * it only exists so the published Markdown (`.md`, `llms-full.txt`, "Copy page") carries a
 * text version of the diagram. Keep it in sync with the SVG when either changes; see
 * "Diagrams" in CONTRIBUTING.md.
 *
 * @param {{ name: keyof typeof DIAGRAMS, children?: import("react").ReactNode }} props
 */
export function EngineDiagram({ name }) {
  const locale = useUrlLocale()
  const diagram = DIAGRAMS[name]

  if (!diagram) {
    throw new Error(`EngineDiagram: unknown diagram "${name}"`)
  }

  const { key, Component } = diagram
  const label = (labelKey) => t(`docs.diagrams.${key}.${labelKey}`, {}, { locale })

  return (
    <figure className="my-6">
      <div className="overflow-x-auto rounded-lg border bg-card p-4">
        <Component label={label} ariaLabel={label("ariaLabel")} />
      </div>
      <figcaption className="mt-2 text-sm text-muted-foreground">{label("caption")}</figcaption>
    </figure>
  )
}
