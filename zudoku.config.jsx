import React from "react"
import { LanguageSlot } from "./src/components/language-slot.jsx"
import { createI18nPlugin } from "./src/plugins/i18n-plugin.jsx"
import { createLocalizedNavigationPlugin } from "./src/plugins/localized-navigation-plugin.js"

const i18nPlugin = createI18nPlugin({ preloadNamespaces: ["common", "docs"] })
const localizedNavigationPlugin = createLocalizedNavigationPlugin()

/** @type {import('zudoku').ZudokuConfig} */
const config = {
  site: {
    title: "form0 | docs",
    logo: {
      src: { light: "/logo-light.svg", dark: "/logo-dark.svg" },
      alt: "form0 docs",
      width: "267px",
    },
  },
  metadata: {
    favicon: "/favicon.svg",
    title: "form0 | docs - %s",
    defaultTitle: "form0 | docs",
  },
  navigation: [
    {
      type: "category",
      label: "Documentation",
      link: { type: "doc", file: "introduction", path: "/introduction" },
      items: [
        {
          type: "category",
          label: "Getting Started",
          icon: "sparkles",
          items: [
            "/introduction",
            {
              type: "link",
              icon: "folder-cog",
              badge: {
                label: "New",
                color: "purple",
              },
              label: "API Reference",
              to: "/api",
            },
            {
              type: "doc",
              file: "test",
              label: "This is a test",
            },
          ],
        },
        {
          type: "category",
          label: "Useful Links",
          collapsible: false,
          icon: "link",
          items: [
            {
              type: "link",
              icon: "book",
              label: "Zudoku Docs",
              to: "https://zudoku.dev/docs/",
            },
          ],
        },
      ],
    },
    {
      type: "link",
      to: "/api",
      label: "API Reference",
    },
  ],
  redirects: [{ from: "/", to: "/introduction" }],
  slots: {
    "head-navigation-end": () => <LanguageSlot />,
  },
  apis: [
    {
      type: "file",
      input: "./apis/openapi.yaml",
      path: "/api",
    },
  ],
  docs: {
    defaultOptions: {
      // Avoid hydration mismatch from locale-dependent toLocaleString in the last-modified tooltip.
      showLastModified: false,
    },
  },
  plugins: [i18nPlugin, localizedNavigationPlugin],
  // Pagefind search only works after build (index is generated at build time).
  // Dev mode will show errors in console but search will work in production.
  search: {
    type: "pagefind",
    maxSubResults: 3,
    ranking: {
      termFrequency: 0.8,
      pageLength: 0.6,
      termSimilarity: 1.2,
      termSaturation: 1.2,
    },
  },
  theme: {
    noDefaultTheme: true,
    light: {
      background: "#f8f5f2",
      foreground: "#1b1c1d",
      card: "#ffffff",
      cardForeground: "#1b1c1d",
      popover: "#ffffff",
      popoverForeground: "#1b1c1d",
      primary: "#e24414",
      primaryForeground: "#fdfdfd",
      secondary: "#e8e2dc",
      secondaryForeground: "#3d3e3f",
      muted: "#d5d0cb",
      mutedForeground: "#5b5c5d",
      accent: "#fceee5",
      accentForeground: "#1b1c1d",
      destructive: "#c82d2d",
      destructiveForeground: "#ffffff",
      border: "#dcd8d3",
      input: "#ffffff",
      ring: "#e24414",
      radius: "0.5rem",
    },
    dark: {
      background: "#1c1b1a",
      foreground: "#f0e9e4",
      card: "#151514",
      cardForeground: "#f0e9e4",
      popover: "#151514",
      popoverForeground: "#f0e9e4",
      primary: "#e24414",
      primaryForeground: "#fdfdfd",
      secondary: "#2d2c2a",
      secondaryForeground: "#f0e9e4",
      muted: "#262524",
      mutedForeground: "#a8a4a0",
      accent: "#3d3028",
      accentForeground: "#f0e9e4",
      destructive: "#e04040",
      destructiveForeground: "#ffffff",
      border: "#3a3938",
      input: "#201f1e",
      ring: "#e24414",
      radius: "0.5rem",
    },
    fonts: {
      // Use schema-compliant external CSS definitions served locally.
      sans: { url: "/fonts/figtree.css", fontFamily: "Figtree" },
      mono: { url: "/fonts/jetbrains-mono.css", fontFamily: "JetBrains Mono" },
    },
    customCss: `
      :root {
        --chart-1: #e24414;
        --chart-2: #e88d1c;
        --chart-3: #3d9b68;
        --chart-4: #4080b8;
        --chart-5: #9872a8;

        --sidebar: #ffffff;
        --sidebar-foreground: #1b1c1d;
        --sidebar-primary: #e24414;
        --sidebar-primary-foreground: #fdfdfd;
        --sidebar-accent: #fceee5;
        --sidebar-accent-foreground: #1b1c1d;
        --sidebar-border: #dcd8d3;
        --sidebar-ring: #e24414;

        --font-serif: Pangolin, cursive;
        --font-sans: Figtree, ui-sans-serif, system-ui, sans-serif;
        --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;

        --shadow-2xs: 0px 2px 10px -3px hsl(0 0% 0% / 0.03);
        --shadow-xs: 0px 2px 10px -3px hsl(0 0% 0% / 0.03);
        --shadow-sm: 0px 2px 10px -3px hsl(0 0% 0% / 0.05),
          0px 1px 2px -4px hsl(0 0% 0% / 0.05);
        --shadow: 0px 2px 10px -3px hsl(0 0% 0% / 0.05),
          0px 1px 2px -4px hsl(0 0% 0% / 0.05);
        --shadow-md: 0px 2px 10px -3px hsl(0 0% 0% / 0.05),
          0px 2px 4px -4px hsl(0 0% 0% / 0.05);
        --shadow-lg: 0px 2px 10px -3px hsl(0 0% 0% / 0.05),
          0px 4px 6px -4px hsl(0 0% 0% / 0.05);
        --shadow-xl: 0px 2px 10px -3px hsl(0 0% 0% / 0.05),
          0px 8px 10px -4px hsl(0 0% 0% / 0.05);
        --shadow-2xl: 0px 2px 10px -3px hsl(0 0% 0% / 0.13);

        --tracking-normal: 0em;
        --spacing: 0.25rem;

        /* CookieConsent (light) */
        --cc-font-family: var(--font-sans);
        --cc-bg: var(--card);
        --cc-text: var(--foreground);
        --cc-border-color: var(--border);
        --cc-link-color: var(--primary);
        --cc-btn-primary-bg: var(--primary);
        --cc-btn-primary-text: var(--primary-foreground);
        --cc-btn-primary-color: var(--primary-foreground);
        --cc-btn-primary-border: transparent;
        --cc-btn-secondary-bg: var(--secondary);
        --cc-btn-secondary-text: var(--secondary-foreground);
        --cc-btn-secondary-color: var(--secondary-foreground);
        --cc-btn-secondary-border: transparent;
        --cc-btn-border-radius: var(--radius);
        --cc-modal-border-radius: var(--radius);
        --cc-toggle-on-bg: var(--primary);
        --cc-toggle-off-bg: var(--muted);
        --cc-toggle-knob-bg: var(--card);
        --cc-overlay-bg: rgba(0, 0, 0, 0.45);
        --cc-modal-shadow: var(--shadow-md);
      }

      .dark {
        --chart-1: #e24414;
        --chart-2: #e88d1c;
        --chart-3: #3d9b68;
        --chart-4: #4080b8;
        --chart-5: #9872a8;

        --sidebar: #151514;
        --sidebar-foreground: #f0e9e4;
        --sidebar-primary: #e24414;
        --sidebar-primary-foreground: #fdfdfd;
        --sidebar-accent: #3d3028;
        --sidebar-accent-foreground: #f0e9e4;
        --sidebar-border: #3a3533;
        --sidebar-ring: #e24414;

        --font-serif: Pangolin, cursive;
        --font-sans: Figtree, ui-sans-serif, system-ui, sans-serif;
        --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;

        --shadow-2xs: 0px 2px 10px -3px hsl(0 0% 0% / 0.10);
        --shadow-xs: 0px 2px 10px -3px hsl(0 0% 0% / 0.10);
        --shadow-sm: 0px 2px 10px -3px hsl(0 0% 0% / 0.20),
          0px 1px 2px -4px hsl(0 0% 0% / 0.20);
        --shadow: 0px 2px 10px -3px hsl(0 0% 0% / 0.20),
          0px 1px 2px -4px hsl(0 0% 0% / 0.20);
        --shadow-md: 0px 2px 10px -3px hsl(0 0% 0% / 0.20),
          0px 2px 4px -4px hsl(0 0% 0% / 0.20);
        --shadow-lg: 0px 2px 10px -3px hsl(0 0% 0% / 0.20),
          0px 4px 6px -4px hsl(0 0% 0% / 0.20);
        --shadow-xl: 0px 2px 10px -3px hsl(0 0% 0% / 0.20),
          0px 8px 10px -4px hsl(0 0% 0% / 0.20);
        --shadow-2xl: 0px 2px 10px -3px hsl(0 0% 0% / 0.50);

        /* CookieConsent (dark) */
        --cc-bg: var(--card);
        --cc-text: var(--foreground);
        --cc-border-color: var(--border);
        --cc-link-color: var(--primary);
        --cc-btn-primary-bg: var(--primary);
        --cc-btn-primary-text: var(--primary-foreground);
        --cc-btn-primary-color: var(--primary-foreground);
        --cc-btn-primary-border: transparent;
        --cc-btn-secondary-bg: var(--secondary);
        --cc-btn-secondary-text: var(--secondary-foreground);
        --cc-btn-secondary-color: var(--secondary-foreground);
        --cc-btn-secondary-border: transparent;
        --cc-toggle-on-bg: var(--primary);
        --cc-toggle-off-bg: var(--muted);
        --cc-toggle-knob-bg: var(--card);
        --cc-overlay-bg: rgba(0, 0, 0, 0.55);
        --cc-modal-shadow: var(--shadow-md);
      }

      /* CookieConsent tweaks */
      #cc-main .cm__btn--close,
      #cc-main .cm__close,
      #cc-main [data-cc="c-close"] {
        display: none !important;
      }
      #cc-main .cm__btn,
      #cc-main .pm__btn {
        transition: none !important;
      }
      #cc-main .cm__btn,
      #cc-main .pm__btn {
        font-size: 0.875rem;
        font-weight: 500;
      }
      #cc-main .cm__title,
      #cc-main .pm__title {
        font-size: 1rem;
      }
      #cc-main .cm__desc,
      #cc-main .pm__section-desc,
      #cc-main .pm__table-caption,
      #cc-main .pm__table-td,
      #cc-main .pm__table-th,
      #cc-main .pm__service-title {
        font-size: 0.9375rem;
      }

      /* Remove focus ring flash on search dialog close button */
      [data-slot="dialog-close"],
      [role="dialog"] button,
      [data-radix-dialog-content] button,
      [cmdk-dialog] button {
        --tw-ring-color: transparent !important;
        --tw-ring-shadow: none !important;
      }
      [data-slot="dialog-close"]:focus,
      [data-slot="dialog-close"]:focus-visible,
      [role="dialog"] button:focus,
      [role="dialog"] button:focus-visible,
      [data-radix-dialog-content] button:focus,
      [data-radix-dialog-content] button:focus-visible,
      [cmdk-dialog] button:focus,
      [cmdk-dialog] button:focus-visible {
        outline: none !important;
        box-shadow: none !important;
      }
    `,
  },
};

export default config;
