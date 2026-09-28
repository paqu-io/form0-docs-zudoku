// Shared SVG styling for engine diagrams. Colors come from the Zudoku theme
// variables, so diagrams follow light and dark mode without extra CSS.

export const MONO_FONT = '"JetBrains Mono", ui-monospace, monospace'

export const diagramStyle = {
  text: { fill: "var(--foreground)", fontSize: 13 },
  sub: { fill: "var(--muted-foreground)", fontSize: 11.5 },
  code: { fill: "var(--foreground)", fontSize: 11.5, fontFamily: MONO_FONT },
  subCode: { fill: "var(--muted-foreground)", fontSize: 11.5, fontFamily: MONO_FONT },
  label: { fill: "var(--muted-foreground)", fontSize: 11.5 },
  labelAccent: { fill: "var(--primary)", fontSize: 11.5, fontWeight: 600 },
  title: { fill: "var(--foreground)", fontSize: 12.5, fontWeight: 600, fontFamily: MONO_FONT },
  box: {
    fill: "var(--card)",
    stroke: "var(--muted-foreground)",
    strokeWidth: 1,
    strokeOpacity: 0.6,
  },
  frame: { fill: "var(--accent)", stroke: "var(--primary)", strokeWidth: 1.25 },
  wire: { fill: "none", stroke: "var(--foreground)", strokeWidth: 1.4 },
  wireLoop: { fill: "none", stroke: "var(--primary)", strokeWidth: 1.4, strokeDasharray: "5 4" },
}

/**
 * Arrowhead markers. Ids are prefixed per diagram so several diagrams can share a page.
 * @param {{ prefix: string }} props
 */
export function ArrowMarkers({ prefix }) {
  return (
    <defs>
      <marker
        id={`${prefix}-arrow`}
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="7"
        markerHeight="7"
        orient="auto-start-reverse"
      >
        <path d="M0,0 L10,5 L0,10 z" style={{ fill: "var(--foreground)" }} />
      </marker>
      <marker
        id={`${prefix}-arrow-accent`}
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="7"
        markerHeight="7"
        orient="auto-start-reverse"
      >
        <path d="M0,0 L10,5 L0,10 z" style={{ fill: "var(--primary)" }} />
      </marker>
    </defs>
  )
}
