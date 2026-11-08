# Contributing

Use Node.js 22+. Run `npm ci`, `npm test`, `npm run build`, and `npm run check:site`. Exercise changed widgets/layouts in `npm run site`.

Open an issue before large grammar, API, import-profile, or dependency changes. Include a real document use case, proposed syntax, limits, and prior art. Small fixes and documentation improvements can go directly to a pull request.

Keep author source declarative. Do not introduce `eval`, author programs, arbitrary HTML, external fetching, or permissive SVG passthrough. Validators and renderers must agree; malformed input must produce useful diagnostics or bounded rejection. Add meaningful regression coverage and document changed limits.

Performance claims need fixtures, baselines, cache/cold conditions, and named operations. Token comparisons require complete capability-matched representations. Do not claim universal speed/cost gains from excluded runtimes or unsupported fallbacks. Rerun measurements when affected by changes and report the environment.

Update syntax/API docs and changelog for user-visible changes. Keep generated builds, dependencies, credentials, and private documents out of Git. Versions are pinned; dependency updates need tests and compatibility/license review.

Maintainers review scope, correctness, bounds, accessibility, documentation, and verification. Review/release turnaround is not guaranteed at this stage. Follow [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
