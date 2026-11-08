<!-- MVP launch update: native browser and React integration added on 2026-11-08. -->
# Compatibility policy

Version 0.2.x is an experimental integration MVP. Public APIs, extension schemas, and patch behavior may change before 1.0. Pin an exact revision when integrating. Record user-visible changes in the changelog and syntax reference.

The core follows configured markdown-it behavior rather than independent CommonMark/GFM conformance. HTML, images, linkification, and nesting have policy differences. Results currently include markdown-it tokens; a processor-independent normalized model is planned.

Node.js 22+ is supported; CI covers 22 and 24. Browser ESM exports include the async parser and widget module, sharing the native core. A worker distribution is still planned. Math assumes MathML support; drawing requires SVG/Pointer Events. Desktop/mobile manual checks are not a certified accessibility/browser matrix.

Version 0.2.1 introduces the npm package name `xmarkdown-renderer`. Use `npm install xmarkdown-renderer@0.2.1` and import from `xmarkdown-renderer` or its subpaths. The older v0.2.0 GitHub release retains its package name `xmarkdown` and original imports. The unscoped npm name `xmarkdown` belongs to another publisher. Conformance, migration coverage, and broader framework testing remain future work; npm availability does not make this MVP a stable 1.0 release.
