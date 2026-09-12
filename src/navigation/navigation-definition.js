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

const documentationItems = [
  category(
    "Getting Started",
    [
      doc("getting-started/quickstart", "Quickstart"),
      doc("getting-started/schema-edit", "Edit your first schema"),
    ],
    { icon: "nav-sparkles" },
  ),
  category(
    "CLI",
    [
      doc("cli/overview", "Overview"),
      doc("cli/install-update", "Install and update"),
      doc("cli/initialize-project", "Initialize a project"),
      doc("cli/interactive-shell", "Interactive shell"),
      category("Working with schemas", [
        doc("cli/schemas/load-edit", "Load and edit schemas"),
        doc("cli/schemas/validate-preview", "Validate and preview"),
        doc("cli/schemas/run-values", "Run with values"),
        doc("cli/schemas/watch-test", "Watch and test"),
        doc("cli/schemas/import-export-csv", "Import and export CSV"),
      ]),
      category("Local development", [
        doc("cli/local-development/live-preview", "Live preview server"),
        doc("cli/local-development/app-development-servers", "App development servers"),
      ]),
      doc("cli/project-configuration", "Project configuration"),
      doc("cli/connector-management", "Connector management"),
      category("Reform integration", [
        doc("cli/reform/sign-in-organization", "Sign in and select an organization"),
        doc("cli/reform/sync-forms", "Sync forms"),
      ]),
      doc("cli/command-reference", "Command reference"),
      doc("cli/troubleshooting", "Troubleshooting"),
      doc("cli/security", "Security"),
    ],
    { icon: "nav-terminal" },
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
    "Connectors",
    [
      doc("connectors/overview", "Overview"),
      doc("connectors/choose", "Choosing a connector"),
      {
        type: "link",
        label: "Connector management",
        to: "/cli/connector-management",
      },
      doc("connectors/direct-integration", "Direct integration"),
      category("PostgreSQL", [
        doc("connectors/postgresql/setup", "Setup and configuration"),
        doc("connectors/postgresql/storage", "Storage model and operations"),
      ]),
      category("SQLite", [
        doc("connectors/sqlite/setup", "Setup and configuration"),
        doc("connectors/sqlite/storage", "Storage model and operations"),
      ]),
      doc("connectors/security", "Security and data responsibility"),
      doc("connectors/troubleshooting", "Troubleshooting"),
    ],
    { icon: "nav-plug" },
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
]

const guidesItems = [doc("guides/coming-soon", "Coming soon")]

export const navigationDefinition = deepFreeze([
  category("Documentation", documentationItems),
  category("Guides", guidesItems),
])
