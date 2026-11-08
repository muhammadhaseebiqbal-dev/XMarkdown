# Changelog

## Unreleased

- Fixed showcase drawing/controls in sandboxed previews by bundling the shared widget runtime into interactive examples. Edited documents use an isolated preview shell with checked parent messages and completion acknowledgement.

Worker distribution, conformance/fuzzing, and model/reader evaluations remain planned.

## 0.2.1 — 2026-11-08

- Prepared the first npm release as `xmarkdown-renderer`; `xmarkdown` is owned by another publisher. Package imports now use `xmarkdown-renderer` and its `/react`, `/browser`, `/widgets`, `/frame`, and `/styles.css` entries. The v0.2.0 GitHub release keeps its original name and imports.
- Simplified the README around installation, real React source, capability/provenance/accomplishment matrices, examples, and measured tradeoffs. Showcase deployment instructions live in maintainer documentation.
- Published the Show HN submission and recorded its discussion URL in the launch notes.
- Reviewed and merged dependency updates to markdown-it 15.0.3, actions/checkout v7, and actions/setup-node v7; parser/browser/React regressions pass. The v0.2.0 tag keeps its original dependencies and benchmark baseline.
- Complete editable React report example with real chart/math/control syntax, diagnostic handling, a download, and shared CSS guidance.
- Published showcase at https://xmarkdown-zeta.vercel.app; added full-example links, deployment asset revalidation, and dark-theme callout contrast.

## 0.2.0 — 2026-11-08

- Bounded TeX through lazy KaTeX, calculated controls, and drawing with undo/clear.
- Compact SVG scenes and checked existing imports through lazy saxes; paths/groups/gradients/clips/masks/symbols and local reuse.
- Optional widget assets, bounded geometry caching, ID rewriting, eviction and retention regressions.
- Twelve measured source comparisons and feature-level cold/cached/rendering benchmarks.
- First public MVP repository: dark showcase, eighteen examples including five larger fixtures, detailed docs, CI, contribution/security policies and templates.
- Installable source package with shared Node/browser core, lazy browser processors, React component, CSS and TypeScript exports. Showcase edits use the native browser renderer; HTTP bridge remains available.
- Package is installable from GitHub; npm registry publication is pending.

## 0.1.0 — 2026-11-08

- Initial markdown-it profile with callouts, charts, directed diagrams, diagnostics, bounds, and provisional streaming sections.
- Local demos, prior-art research, parser benchmarks, and source comparisons.
