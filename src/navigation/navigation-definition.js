const doc = (file, label, options = {}) => ({ type: "doc", file, label, ...options })

const category = (label, items, options = {}) => ({
  type: "category",
  label,
  items,
  ...options,
})

const calculationDocs = [
  ["if", "IF"],
  ["and", "AND"],
  ["or", "OR"],
  ["count", "COUNT"],
  ["counta", "COUNTA"],
  ["countblank", "COUNTBLANK"],
  ["array", "ARRAY"],
  ["abs", "ABS"],
  ["ceiling", "CEILING"],
  ["cos", "COS"],
  ["sin", "SIN"],
  ["round", "ROUND"],
  ["upper", "UPPER"],
  ["choicevalue", "CHOICEVALUE"],
  ["choicelabel", "CHOICELABEL"],
  ["choicevalues", "CHOICEVALUES"],
  ["choicelabels", "CHOICELABELS"],
  ["hasother", "HASOTHER"],
  ["other", "OTHER"],
  ["form", "FORM"],
  ["datanames", "DATANAMES", { badge: { label: "New", color: "purple" } }],
  ["setresult", "SETRESULT"],
  ["eval", "EVAL"],
].map(([slug, label, options]) =>
  doc(`core/builtins/calculations-expressions/${slug}`, label, options),
)

const eventDocs = [
  ["on", "ON"],
  ["off", "OFF"],
  ["alert", "ALERT"],
  ["setvalue", "SETVALUE"],
].map(([slug, label]) => doc(`core/builtins/events/${slug}`, label))

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value
  Object.values(value).forEach(deepFreeze)
  return Object.freeze(value)
}

export const navigationDefinition = deepFreeze([
  category(
    "Getting Started",
    [
      doc("getting-started/quickstart", "Quickstart"),
      doc("getting-started/schema-edit", "Edit your first schema"),
    ],
    { icon: "nav-sparkles" },
  ),
  category(
    "Core",
    [
      doc("core/overview", "Overview"),
      doc("core/concepts", "Concepts"),
      category("Schema", [
        doc("core/schema/form", "Form object"),
        doc("core/schema/form-attributes", "Form attributes"),
        doc("core/schema/elements", "Elements and nesting"),
        doc("core/schema/conditions-operators", "Conditions and operators"),
        doc("core/schema/validation", "Schema validation"),
      ]),
      category("Fields", [
        doc("core/fields/catalog", "Field catalog"),
        doc("core/fields/common-attributes", "Common attributes"),
        doc("core/fields/input-fields", "Input fields"),
        doc("core/fields/computed-fields", "Computed fields"),
        doc("core/fields/media-fields", "Media fields"),
        doc("core/fields/containers", "Containers"),
        doc("core/fields/meta-fields", "Meta fields"),
      ]),
      category("Builtins", [
        doc("core/builtins/index", "Builtins overview"),
        category("Calculations & expressions", [
          doc("core/builtins/calculations-expressions-overview", "Overview"),
          ...calculationDocs,
        ]),
        category("Events", [doc("core/builtins/events-overview", "Overview"), ...eventDocs]),
      ]),
      doc("core/ai-metadata", "AI metadata", {
        badge: { label: "Beta", color: "yellow" },
      }),
      doc("core/security", "Security and sandboxing"),
      doc("core/output-records", "Output and records"),
    ],
    { icon: "nav-cpu" },
  ),
  category(
    "Useful Links",
    [
      {
        type: "link",
        icon: "nav-book",
        label: "Zudoku Docs",
        to: "https://zudoku.dev/docs/",
      },
    ],
    { collapsible: false, icon: "nav-link" },
  ),
])
