import { DocsWordmark } from "./src/components/docs-wordmark.jsx"
import { SiteFooter } from "./src/components/site-footer.jsx"
import { LanguageSlot } from "./src/components/language-slot.jsx"
import { MobileDrawerMenu } from "./src/components/mobile-drawer-menu.jsx"
import { DesktopSectionTabs, TopNavHeightFix } from "./src/components/site-section-nav.jsx"
import { createI18nPlugin } from "./src/plugins/i18n-plugin.jsx"
import { createDefaultDarkThemePlugin } from "./src/plugins/default-dark-theme-plugin.jsx"
import { createDocsSeoPlugin } from "./src/plugins/docs-seo-plugin.jsx"
import { createLocalizedNavigationPlugin } from "./src/plugins/localized-navigation-plugin.js"
import { DOCS_ORIGIN, sitemapExcludedPaths } from "./src/seo/page-metadata.js"
import { TAB_DEFAULT_TITLE, TAB_TITLE_TEMPLATE } from "./src/seo/site-titles.js"

const i18nPlugin = createI18nPlugin({ preloadNamespaces: ["common", "docs"] })
const defaultDarkThemePlugin = createDefaultDarkThemePlugin()
const localizedNavigationPlugin = createLocalizedNavigationPlugin()
const docsSeoPlugin = createDocsSeoPlugin()

/** @type {import('zudoku').ZudokuConfig} */
const config = {
  site: {
    title: "form0 | docs",
    logo: {
      src: { light: "/logo-mark.svg", dark: "/logo-mark.svg" },
      alt: "form0 docs",
      width: "2rem",
      href: "/getting-started/quickstart",
    },
    footer: {
      position: "center",
    },
    sidebar: {
      collapsible: true,
      toggleVisibility: "always",
    },
  },
  canonicalUrlOrigin: DOCS_ORIGIN,
  sitemap: {
    siteUrl: DOCS_ORIGIN,
    changefreq: "weekly",
    priority: 0.7,
    // Zudoku 0.83 uses the build time for every URL rather than each file's
    // actual modification time, so omitting lastmod is more truthful.
    autoLastmod: false,
    exclude: sitemapExcludedPaths(),
  },
  metadata: {
    favicon: "/favicon.svg",
    // Browser tab. og:title / twitter:title use the longer "by paqu.io" form.
    title: TAB_TITLE_TEMPLATE,
    defaultTitle: TAB_DEFAULT_TITLE,
  },
  navigation: [],
  redirects: [{ from: "/", to: "/getting-started/quickstart" }],
  slots: {
    "head-navigation-start": () => <DocsWordmark />,
    "head-navigation-end": () => <LanguageSlot />,
    "top-navigation-before": () => <DesktopSectionTabs />,
    "top-navigation-after": () => <TopNavHeightFix />,
    "layout-after-head": () => <MobileDrawerMenu />,
    "footer-before": () => <SiteFooter />,
  },
  docs: {
    files: "pages/**/*.{md,mdx}",
    defaultOptions: {
      copyPage: true,
      showLastModified: true,
      suggestEdit: {
        url: "https://github.com/paqu-io/form0-docs-zudoku/blob/main/{filePath}",
        text: "Edit this page",
      },
    },
    publishMarkdown: true,
    llms: {
      // Generated after the build so untranslated and temporary pages can
      // remain reachable without entering the AI discovery corpus.
      llmsTxt: false,
      llmsTxtFull: false,
      includeProtected: false,
    },
  },
  plugins: [i18nPlugin, localizedNavigationPlugin, defaultDarkThemePlugin, docsSeoPlugin],
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
      input: "#dcd8d3",
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
      input: "#3a3938",
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

        --callout-note: oklch(0.55 0.02 280);
        --callout-tip: oklch(0.62 0.17 145);
        --callout-info: oklch(0.58 0.16 250);
        --callout-caution: oklch(0.7 0.16 75);
        --callout-danger: oklch(0.6 0.22 25);
        --callout-sparkles: oklch(0.6 0.2 300);
        --callout-rocket: oklch(0.55 0.2 270);
        --callout-settings: oklch(0.5 0.015 285);
        --callout-zap: oklch(0.68 0.17 95);
        --callout-lock: oklch(0.52 0.06 230);
        --callout-megaphone: oklch(0.62 0.15 220);

        nav-sparkles,
        nav-terminal,
        nav-layout-template,
        nav-cpu,
        nav-blocks,
        nav-react,
        nav-react-native,
        nav-plug,
        nav-postgresql,
        nav-sqlite,
        nav-link,
        nav-book {
          display: inline-block;
          width: 1rem;
          height: 1rem;
          flex-shrink: 0;
          vertical-align: -0.125em;
          background-color: currentColor;
          mask-position: center;
          mask-repeat: no-repeat;
          mask-size: contain;
        }

        nav-sparkles {
          mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xMS4wMTcgMi44MTRhMSAxIDAgMCAxIDEuOTY2IDBsMS4wNTEgNS41NThhMiAyIDAgMCAwIDEuNTk0IDEuNTk0bDUuNTU4IDEuMDUxYTEgMSAwIDAgMSAwIDEuOTY2bC01LjU1OCAxLjA1MWEyIDIgMCAwIDAtMS41OTQgMS41OTRsLTEuMDUxIDUuNTU4YTEgMSAwIDAgMS0xLjk2NiAwbC0xLjA1MS01LjU1OGEyIDIgMCAwIDAtMS41OTQtMS41OTRsLTUuNTU4LTEuMDUxYTEgMSAwIDAgMSAwLTEuOTY2bDUuNTU4LTEuMDUxYTIgMiAwIDAgMCAxLjU5NC0xLjU5NHoiLz48cGF0aCBkPSJNMjAgMnY0Ii8+PHBhdGggZD0iTTIyIDRoLTQiLz48Y2lyY2xlIGN4PSI0IiBjeT0iMjAiIHI9IjIiLz48L3N2Zz4=");
        }

        nav-terminal {
          mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Im00IDE3IDYtNi02LTYiLz48cGF0aCBkPSJNMTIgMTloOCIvPjwvc3ZnPg==");
        }

        nav-layout-template {
          mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxyZWN0IHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgeD0iMyIgeT0iMyIgcng9IjIiLz48cGF0aCBkPSJNMyA5aDE4Ii8+PHBhdGggZD0iTTkgMjFWOSIvPjwvc3ZnPg==");
        }

        nav-cpu {
          mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xMiAyMHYyIi8+PHBhdGggZD0iTTEyIDJ2MiIvPjxwYXRoIGQ9Ik0xNyAyMHYyIi8+PHBhdGggZD0iTTE3IDJ2MiIvPjxwYXRoIGQ9Ik0yIDEyaDIiLz48cGF0aCBkPSJNMiAxN2gyIi8+PHBhdGggZD0iTTIgN2gyIi8+PHBhdGggZD0iTTIwIDEyaDIiLz48cGF0aCBkPSJNMjAgMTdoMiIvPjxwYXRoIGQ9Ik0yMCA3aDIiLz48cGF0aCBkPSJNNyAyMHYyIi8+PHBhdGggZD0iTTcgMnYyIi8+PHJlY3QgeD0iNCIgeT0iNCIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiByeD0iMiIvPjxyZWN0IHg9IjgiIHk9IjgiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIHJ4PSIxIi8+PC9zdmc+");
        }

        nav-blocks {
          mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHJlY3Qgd2lkdGg9IjciIGhlaWdodD0iNyIgeD0iMyIgeT0iMyIgcng9IjEiLz48cmVjdCB3aWR0aD0iNyIgaGVpZ2h0PSI3IiB4PSIxNCIgeT0iMyIgcng9IjEiLz48cmVjdCB3aWR0aD0iNyIgaGVpZ2h0PSI3IiB4PSIzIiB5PSIxNCIgcng9IjEiLz48cmVjdCB3aWR0aD0iNyIgaGVpZ2h0PSI3IiB4PSIxNCIgeT0iMTQiIHJ4PSIxIi8+PC9zdmc+");
        }

        /* Vendored from Simple Icons 16.31.0; see public/icons/simple-icons/README.md. */
        nav-react {
          mask-image: url("/icons/simple-icons/react.svg");
        }

        nav-react-native {
          mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxyZWN0IHg9IjYiIHk9IjIiIHdpZHRoPSIxMiIgaGVpZ2h0PSIyMCIgcng9IjIiLz48cGF0aCBkPSJNMTAgMThoNCIvPjwvc3ZnPg==");
        }

        nav-postgresql {
          mask-image: url("/icons/simple-icons/postgresql.svg");
        }

        nav-sqlite {
          mask-image: url("/icons/simple-icons/sqlite.svg");
        }

        nav-plug {
          mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xMiAyMnYtNSIvPjxwYXRoIGQ9Ik05IDhWMiIvPjxwYXRoIGQ9Ik0xNSA4VjIiLz48cGF0aCBkPSJNMTggOHY1YTYgNiAwIDAgMS0xMiAwVjhaIi8+PC9zdmc+");
        }

        nav-link {
          mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xMCAxM2E1IDUgMCAwIDAgNy41NC41NGwzLTNhNSA1IDAgMCAwLTcuMDctNy4wN2wtMS43MiAxLjcxIi8+PHBhdGggZD0iTTE0IDExYTUgNSAwIDAgMC03LjU0LS41NGwtMyAzYTUgNSAwIDAgMCA3LjA3IDcuMDlsMS43MS0xLjcxIi8+PC9zdmc+");
        }

        nav-book {
          mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik00IDE5LjV2LTE1QTIuNSAyLjUgMCAwIDEgNi41IDJIMTlhMSAxIDAgMCAxIDEgMXYxOGExIDEgMCAwIDEtMSAxSDYuNWExIDEgMCAwIDEgMC01SDIwIi8+PC9zdmc+");
        }

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

        --callout-note: oklch(0.72 0.02 280);
        --callout-tip: oklch(0.75 0.17 145);
        --callout-info: oklch(0.72 0.16 250);
        --callout-caution: oklch(0.8 0.16 75);
        --callout-danger: oklch(0.7 0.2 25);
        --callout-sparkles: oklch(0.72 0.18 300);
        --callout-rocket: oklch(0.7 0.18 270);
        --callout-settings: oklch(0.72 0.015 285);
        --callout-zap: oklch(0.85 0.16 90);
        --callout-lock: oklch(0.7 0.06 230);
        --callout-megaphone: oklch(0.75 0.14 220);

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

      /* Logo mark matches form0-landing (h-8 w-8, gap-3.5 to the wordmark) */
      header a.shrink-0 img {
        width: 2rem !important;
        height: 2rem !important;
      }
      header .flex.items-center.gap-4.min-w-0.justify-self-start {
        gap: 0.875rem;
      }

      /* Let the mobile search button use the remaining header width */
      @media (max-width: 1023px) {
        header .max-w-screen-2xl.mx-auto.flex > div:nth-child(2) {
          flex: 1 1 0%;
          min-width: 0;
        }
        header .max-w-screen-2xl.mx-auto.flex > div:nth-child(2) > div {
          width: 100%;
        }
        header button.relative.w-full.h-8 {
          width: 100%;
          max-width: none;
          padding-inline-end: 0.75rem;
        }
      }

      /* paqu.io-style footer lives in the before slot; hide Zudoku's empty chrome */
      footer > .max-w-screen-2xl {
        padding: 0;
      }
      footer > .max-w-screen-2xl > .flex.flex-row {
        display: block;
        width: 100%;
      }
      footer > .max-w-screen-2xl > .flex.items-center.justify-between {
        display: none;
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

      /* Theme switch active state (match form0-landing) */
      button[aria-label="Switch to dark mode"],
      button[aria-label="Switch to light mode"] {
        border-color: var(--border);
        background-color: color-mix(in srgb, var(--background) 85%, transparent);
      }
      button[aria-label="Switch to dark mode"] > div:first-child,
      button[aria-label="Switch to light mode"] > div:last-child {
        border-color: color-mix(in srgb, var(--primary) 30%, transparent);
        background-color: color-mix(in srgb, var(--primary) 12%, transparent);
        color: var(--primary);
      }
      button[aria-label="Switch to dark mode"] > div:last-child,
      button[aria-label="Switch to light mode"] > div:first-child {
        color: color-mix(in srgb, var(--foreground) 70%, transparent);
      }
      button[aria-label="Switch to dark mode"] > div:first-child svg path,
      button[aria-label="Switch to dark mode"] > div:first-child svg circle,
      button[aria-label="Switch to light mode"] > div:last-child svg path,
      button[aria-label="Switch to light mode"] > div:last-child svg circle {
        fill: currentColor;
        stroke: currentColor;
      }

      /* Landing-style preferences live in our drawer slot; hide the native theme row */
      [data-docs-header-drawer] .overflow-y-auto > ul:not(:has(li)) {
        display: none;
      }
      [data-docs-header-drawer] .border-t > div.flex.items-center.justify-between,
      [data-vaul-drawer][class*="w-[340px"] .border-t > div.flex.items-center.justify-between {
        display: none;
      }
    `,
  },
}

export default config
