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
      category("reform integration", [
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
    "Starter apps",
    [
      doc("starter-apps/overview", "Overview"),
      category(
        "React + Vite",
        [
          doc("starter-apps/react-vite/create-run", "Create and run"),
          doc(
            "starter-apps/react-vite/project-structure-configuration",
            "Project structure and configuration",
          ),
          doc(
            "starter-apps/react-vite/forms-routes-presentations",
            "Forms, routes, and presentations",
          ),
          doc("starter-apps/react-vite/renderers-themes-styling", "Renderers, themes, and styling"),
          doc("starter-apps/react-vite/submissions-connectors", "Submissions and connectors"),
          doc("starter-apps/react-vite/build-deployment", "Build and deployment"),
          doc("starter-apps/react-vite/troubleshooting", "Troubleshooting"),
        ],
        { icon: "nav-react" },
      ),
      category(
        "React Native + Expo",
        [
          doc("starter-apps/react-native-expo/create-run", "Create and run"),
          doc(
            "starter-apps/react-native-expo/project-structure-configuration",
            "Project structure and configuration",
          ),
          doc(
            "starter-apps/react-native-expo/forms-screens-navigation",
            "Forms, screens, and navigation",
          ),
          doc(
            "starter-apps/react-native-expo/renderers-themes-fonts-images",
            "Renderers, themes, fonts, and images",
          ),
          doc(
            "starter-apps/react-native-expo/device-development-networking",
            "Device development and networking",
          ),
          doc(
            "starter-apps/react-native-expo/local-storage-submissions",
            "Local storage and submissions",
          ),
          doc("starter-apps/react-native-expo/build-distribution", "Build and distribution"),
          doc("starter-apps/react-native-expo/troubleshooting", "Troubleshooting"),
        ],
        { icon: "nav-react-native" },
      ),
    ],
    { icon: "nav-layout-template" },
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
    "Bindings",
    [
      doc("bindings/overview", "Overview"),
      category(
        "React",
        [
          doc("bindings/react/install-render", "Install and render"),
          doc("bindings/react/form-renderer", "FormRenderer"),
          doc("bindings/react/values-snapshots-submission", "Values, snapshots, and submission"),
          category("Field renderers", [
            doc("bindings/react/built-in-renderers", "Built-in renderers"),
            doc("bindings/react/custom-renderers", "Custom renderers"),
          ]),
          category("Presentation", [
            doc("bindings/react/modes-placement-navigation", "Modes, placement, and navigation"),
            doc("bindings/react/themes-styling", "Themes and styling"),
          ]),
          doc("bindings/react/workers-performance", "Workers and performance"),
          doc("bindings/react/api-reference", "API reference"),
          doc("bindings/react/troubleshooting", "Troubleshooting"),
        ],
        { icon: "nav-react" },
      ),
      category(
        "React Native",
        [
          doc("bindings/react-native/install-render", "Install and render"),
          doc("bindings/react-native/form-renderer", "FormRenderer"),
          doc(
            "bindings/react-native/values-snapshots-submission",
            "Values, snapshots, and submission",
          ),
          category("Field renderers", [
            doc("bindings/react-native/built-in-renderers", "Built-in renderers"),
            doc("bindings/react-native/custom-renderers", "Custom renderers"),
          ]),
          category("Presentation", [
            doc("bindings/react-native/modes-navigation", "Modes and navigation"),
            doc("bindings/react-native/themes-assets", "Themes, fonts, and images"),
          ]),
          doc("bindings/react-native/mobile-integration", "Mobile integration"),
          doc("bindings/react-native/api-reference", "React Native API reference"),
          doc("bindings/react-native/troubleshooting", "React Native troubleshooting"),
        ],
        { icon: "nav-react-native" },
      ),
    ],
    { icon: "nav-blocks" },
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
      category(
        "PostgreSQL",
        [
          doc("connectors/postgresql/setup", "Setup and configuration"),
          doc("connectors/postgresql/storage", "Storage model and operations"),
        ],
        { icon: "nav-postgresql" },
      ),
      category(
        "SQLite",
        [
          doc("connectors/sqlite/setup", "Setup and configuration"),
          doc("connectors/sqlite/storage", "Storage model and operations"),
        ],
        { icon: "nav-sqlite" },
      ),
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
