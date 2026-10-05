import { Children, cloneElement, isValidElement } from "react"
import { useUrlLocale } from "../hooks/use-locale-path.js"
import { t } from "../utils/i18n.js"
import "./stack-coverage.css"

// Layer order is fixed; cells in each StackRow fill these columns left to right.
const LAYERS = ["authoring", "logic", "runtime", "data", "platform"]

// Visual kinds and the text announced to screen readers for each one, so ownership never depends
// on color or pattern alone.
const KINDS = {
  form0: "form0",
  "open-source": "openSource",
  commercial: "commercial",
  application: "application",
}

function useLabel() {
  const locale = useUrlLocale()
  return (key) => t(`docs.stackCoverage.${key}`, {}, { locale })
}

/**
 * Which layers of a data-collection stack each project provides. Rendered as a semantic table, so
 * the visual and its text alternative are the same element; narrow containers show stacked cards.
 *
 * @param {{ children: import("react").ReactNode }} props
 */
export function StackCoverage({ children }) {
  const label = useLabel()

  return (
    <figure className="stack-coverage">
      <div className="stack-coverage__scroll">
        <table className="stack-coverage__table">
          <caption className="stack-coverage__sr-only">{label("tableCaption")}</caption>
          <thead>
            <tr>
              <th scope="col">{label("project")}</th>
              {LAYERS.map((layer) => (
                <th key={layer} scope="col">
                  {label(`layers.${layer}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
      <div className="stack-coverage__legend" aria-hidden="true">
        {Object.entries(KINDS).map(([kind, key]) => (
          <span key={kind}>
            <i className={`stack-coverage__swatch stack-coverage__cell--${kind}`} />
            {label(`kinds.${key}`)}
          </span>
        ))}
        <span>
          <b className="stack-coverage__plus">+</b>
          {label("legendNote")}
        </span>
      </div>
      <figcaption>{label("caption")}</figcaption>
    </figure>
  )
}

/**
 * One project. Assigns each StackCell its layer name(s) for the stacked-card layout.
 *
 * @param {{ project: string, license: string, highlight?: boolean, children: import("react").ReactNode }} props
 */
export function StackRow({ project, license, highlight = false, children }) {
  const label = useLabel()

  const { cells, columns } = Children.toArray(children)
    .filter(isValidElement)
    .reduce(
      (result, cell) => {
        const span = cell.props.span || 1
        const layers = LAYERS.slice(result.columns, result.columns + span)
        const layerLabel = layers.map((layer) => label(`layers.${layer}`)).join(", ")
        return {
          cells: [...result.cells, cloneElement(cell, { layerLabel })],
          columns: result.columns + span,
        }
      },
      { cells: [], columns: 0 },
    )

  if (columns !== LAYERS.length) {
    throw new Error(`StackRow "${project}": cells cover ${columns} of ${LAYERS.length} layers`)
  }

  return (
    <tr className={highlight ? "stack-coverage__row--highlight" : undefined}>
      <th scope="row">
        {project}
        <span className="stack-coverage__license">{license}</span>
      </th>
      {cells}
    </tr>
  )
}

/**
 * One layer of a project.
 *
 * `note` is a plain detail (a license, a limitation, an alternative). `addon` names an optional
 * package or integration and is marked with "+", matching the legend.
 *
 * @param {{ kind: keyof typeof KINDS, note?: string, addon?: string, span?: number, layerLabel?: string, children: import("react").ReactNode }} props
 */
export function StackCell({ kind, note, addon, span = 1, layerLabel, children }) {
  const label = useLabel()
  const kindKey = KINDS[kind]

  if (!kindKey) {
    throw new Error(`StackCell: unknown kind "${kind}"`)
  }

  return (
    <td colSpan={span > 1 ? span : undefined} data-layer={layerLabel}>
      <div className={`stack-coverage__cell stack-coverage__cell--${kind}`}>
        <span className="stack-coverage__sr-only">{label(`kinds.${kindKey}`)}: </span>
        <div className="stack-coverage__main">{children}</div>
        {note ? <span className="stack-coverage__note">{note}</span> : null}
        {addon ? <span className="stack-coverage__addon">{addon}</span> : null}
      </div>
    </td>
  )
}
