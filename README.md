# form0-docs-zudoku

[![CI](https://github.com/paqu-io/form0-docs-zudoku/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/paqu-io/form0-docs-zudoku/actions/workflows/deploy-docs.yml)
[![Docs](https://img.shields.io/badge/docs-docs.form0.dev-2563eb)](https://docs.form0.dev)
[![Website](https://img.shields.io/badge/site-form0.dev-0f172a)](https://form0.dev)
![GitHub License](https://img.shields.io/github/license/paqu-io/form0-docs-zudoku)

> [!NOTE]
> form0 is in active development and is available to use today. Its schema format and core
> concepts are stable in practice, but releases before 1.0 may include breaking changes. Pin your
> versions and review the release notes when upgrading. A formally stable release is coming.

This repository contains the multilingual documentation published at
[docs.form0.dev](https://docs.form0.dev). It covers the form0 CLI, Core engine, framework bindings,
connectors, and starter applications.

The site is built with [Zudoku](https://zudoku.dev) and is available in English, Spanish, French,
and Italian. The recommended entry point for creating and working with form0 projects is
[form0-cli](https://github.com/paqu-io/form0-cli).

## 🚀 Local development

```bash
git clone https://github.com/paqu-io/form0-docs-zudoku.git
cd form0-docs-zudoku
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Changes to documentation pages and site code
are reflected by the development server.

## Repository structure

- `pages/` contains the English documentation and the `es`, `fr`, and `it` translations.
- `src/navigation/` defines the shared navigation, localized labels, sections, and page badges.
- `src/locales/` contains interface translations used by the documentation site.
- `src/components/` and `src/plugins/` contain site behavior and presentation.
- `src/seo/` and `scripts/` generate and validate metadata, search, sitemap, and agent-readable
  artifacts.
- `public/` contains static assets served with the site.
- `tests/` covers navigation, localization, metadata, rendering, and generated output.

English pages are the structural reference for localized pages. When an English page changes, the
corresponding Spanish, French, and Italian pages must remain complete and structurally aligned.
Translation-only improvements may target a single locale.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full content and localization conventions.

## Validation commands

| Command                       | Purpose                                                                                   |
| ----------------------------- | ----------------------------------------------------------------------------------------- |
| `npm run dev`                 | Generate page metadata and start the development server                                   |
| `npm run check`               | Run the complete formatting, localization, navigation, test, lint, build, and output gate |
| `npm run format`              | Format documentation and source files                                                     |
| `npm run i18n:validate`       | Validate locale namespaces, keys, and placeholders                                        |
| `npm run navigation:validate` | Validate the navigation source of truth                                                   |
| `npm run pages:validate`      | Validate English and localized page parity                                                |
| `npm test`                    | Run the Node.js test suite                                                                |
| `npm run build`               | Build the production site and agent-readable artifacts                                    |
| `npm run preview`             | Preview an existing production build                                                      |

## ✅ Requirements

- Node.js 24
- npm 10 or later

## 📚 Documentation

- [Quickstart](https://docs.form0.dev/getting-started/quickstart)
- [CLI documentation](https://docs.form0.dev/cli/overview)
- [Core documentation](https://docs.form0.dev/core/overview)
- [Full documentation](https://docs.form0.dev)

## Deployment

Pull requests run the complete documentation quality gate. Changes merged into `main` are built
once, and the checked artifact is deployed to [docs.form0.dev](https://docs.form0.dev) through the
protected production environment.

Deployment credentials are stored as GitHub Actions secrets and are not required for local
development or external contributions.

## 🔒 Security

Do not report suspected vulnerabilities through public issues. See [SECURITY.md](./SECURITY.md) for
private reporting instructions and the documentation repository's security scope.

## 🔗 Related repositories

- [form0-cli](https://github.com/paqu-io/form0-cli) — project creation and development workflow
- [form0-core](https://github.com/paqu-io/form0-core) — schema-driven form engine
- [form0-react](https://github.com/paqu-io/form0-react) — React bindings
- [form0-react-native](https://github.com/paqu-io/form0-react-native) — React Native bindings
- [form0-connector-pg](https://github.com/paqu-io/form0-connector-pg) — PostgreSQL connector
- [form0-connector-sqlite](https://github.com/paqu-io/form0-connector-sqlite) — SQLite connector

## 🤝 Support and contributing

See [SUPPORT.md](https://github.com/paqu-io/form0-docs-zudoku/blob/main/SUPPORT.md) for help and
[CONTRIBUTING.md](https://github.com/paqu-io/form0-docs-zudoku/blob/main/CONTRIBUTING.md) to
contribute documentation corrections, translations, examples, and site improvements.

## 📄 License

[MIT](./LICENSE)
