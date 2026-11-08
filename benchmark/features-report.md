# Extended capability processing costs

Measured 2026-11-08T12:12:48.877Z, v22.22.0, win32.

Seven timed trials with rotating condition order; 12 interleaved batch warmups, two streaming warmups, and 60 plain-baseline warmups. Median per document. Cold means a cleared extension cache, with dependencies already loaded after first use. Cached means the same completed source is repeated. Streaming includes provisional HTML/SVG rendering and the final full render; each workflow starts with an empty cache. Browser layout, painting, networking, and model generation are excluded. First-use rows are single observations in fixture order, not isolated process startup trials. Run this benchmark separately from other benchmark processes.

| Workload | Source code units | First use ms | Empty-cache parse + render ms | Cache disabled ms | Cached parse + render ms | Streaming vs repeated prefix |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Plain prose | 6320 | 8.424 | 0.287 | 0.291 | 0.273 | 9.20× |
| Math | 45 | 26.475 | 0.079 | 0.074 | 0.007 | 0.78× |
| Controls | 502 | 2.111 | 0.052 | 0.036 | 0.013 | 2.56× |
| Drawing | 188 | 0.123 | 0.014 | 0.009 | 0.006 | 1.71× |
| Vector scene | 2355 | 3.572 | 0.194 | 0.137 | 0.033 | 7.11× |
| SVG import | 651 | 9.709 | 0.150 | 0.119 | 0.012 | 1.95× |
| Extended document | 3959 | 2.694 | 0.652 | 0.508 | 0.075 | 5.48× |

Plain prose including HTML generation: markdown-it 0.259 ms, XMarkdown 0.268 ms (0.97× baseline/XMarkdown). Below 1 means XMarkdown is slower. New capabilities have a measured cost; no zero-overhead or universal speed guarantee follows.

The optional shared widget modules total 7752 source bytes, 3152 gzip bytes when compressed independently. They are loaded only for widget documents and once per document, not once per widget. Math uses server-generated native MathML; SVG scenes and imports use native browser SVG and require no document JavaScript.

KaTeX and the XML parser are required only on first mathematical or XML-import use. First-use observations include JIT and module loading where applicable. Cache entries default to 128 and retained string accounting to 512 Ki code units; this is bounded cache accounting, not a measurement or hard bound of total heap memory. Compiled geometry is reused with generated IDs rewritten for each placement.

Stream previews can lag, and may be replaced at completion. These timing improvements are workflow comparisons. No model-generation latency or reader benefit was measured. Full trial ranges are in [features-results.json](features-results.json). Reproduce with `npm run bench:features`.
