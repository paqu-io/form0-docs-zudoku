# Security Policy

Security reports are taken seriously. Please report vulnerabilities privately so they can be
investigated and fixed before public disclosure.

## Reporting a vulnerability

Use the
[form0 documentation private vulnerability report](https://github.com/paqu-io/form0-docs-zudoku/security/advisories/new).
Do not open a public issue for a suspected vulnerability.

Include:

- the affected page, build, workflow, or deployed behavior;
- a minimal reproduction or proof of concept;
- the impact you believe is possible;
- any mitigations you have already identified; and
- whether the issue has been disclosed anywhere else.

Reports affecting any version are welcome. When possible, reproduce the issue against the latest
default branch or the currently deployed site. Security fixes are normally made on the latest
version; older revisions are assessed case by case.

Maintainers will review the report, may ask for more information, and will coordinate disclosure
after a fix or mitigation is available. Please keep the report private during that process.

## Scope

Relevant reports include vulnerabilities in the documentation application, generated site,
contribution build process, deployment workflow, or repository configuration. Examples include
unauthorized script execution in the published site, exposure of protected deployment data, or a
build boundary that allows an untrusted contribution to access data it should not receive.

Documentation errors, broken links, inaccurate examples, and ordinary accessibility or rendering
problems are not security vulnerabilities. Report them through
[GitHub Issues](https://github.com/paqu-io/form0-docs-zudoku/issues).

Vulnerabilities in a form0 package should be reported privately to the repository that owns that
package. Vulnerabilities in an upstream dependency may also need to be reported to that upstream
project.

For ordinary questions and documentation support, see [SUPPORT.md](./SUPPORT.md).
