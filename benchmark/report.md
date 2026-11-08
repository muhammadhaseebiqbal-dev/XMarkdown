# Parser benchmark results

Local prototype measurements. Run timestamp: 2026-11-08T12:19:21.836Z.

Runtime: v22.22.0, win32/x64. Baseline: markdown-it 14.3.3. Chunk size: **64 UTF-16 code units**.

## Batch and streaming speed ratios

| Workload | Source code units | markdown-it batch ms | XMarkdown batch ms | Batch speed ratio | Stream vs repeated XMarkdown | Stream vs repeated markdown-it |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| short prose | 510 | 0.03 | 0.05 | 0.64× | 1.51× | 1.43× |
| long prose | 27,751 | 1.03 | 1.26 | 0.82× | 74.79× | 64.20× |
| code and tables | 12,900 | 0.56 | 0.67 | 0.85× | 22.89× | 22.59× |
| long list | 16,000 | 1.30 | 1.36 | 0.96× | 29.15× | 28.10× |
| graphics report | 17,750 | 0.45 | 0.56 | 0.81× | 41.75× | Different features |

Batch ratio is baseline time / XMarkdown time: less than 1 means XMarkdown is slower. Streaming ratios compare a complete workflow of reparsing every growing prefix with section previews and one final full parse. **They are not single-parse speedups.**

## Complete streaming workflow timings

| Workload | Repeated XMarkdown ms | Incremental XMarkdown ms | Repeated markdown-it ms | Chunks | Incremental submitted input |
| --- | ---: | ---: | ---: | ---: | ---: |
| short prose | 0.13 | 0.09 | 0.13 | 8 | 2.67N |
| long prose | 306.62 | 4.10 | 263.18 | 434 | 2.99N |
| code and tables | 62.59 | 2.73 | 61.77 | 202 | 2.87N |
| long list | 152.14 | 5.22 | 146.69 | 250 | 3.40N |
| graphics report | 71.98 | 1.72 | — | 278 | 2.50N |

## Method and limitations

Reused parser instances and bounded extension cache; hydrated tokens, no HTML rendering; 60 interleaved batch warmups, two streaming warmups, seven timed trials with rotating condition order; median per operation. Streaming compares full-prefix parsing on every chunk with provisional section patches plus one full final parse. Repeated graphic specifications can hit the cache in all XMarkdown conditions. Graphics baseline has unequal features; only the same-XMarkdown stream comparison is used there. See features-report.md for cold and cached rendering costs.

- Both parser instances are reused. Batch warmups and trial order are interleaved to reduce order bias. Times are medians of seven trials, with minimum and maximum values retained in [results.json](results.json).
- Functions parse inline content into tokens. The benchmark excludes HTML generation, SVG layout, DOM updates, networking, model generation, and AI token cost.
- The plain-workload Markdown core uses the same options. XMarkdown additionally applies its extension rules, validation policy, and diagnostics. The graphics workload has extra XMarkdown capabilities, so its bare markdown-it time is contextual rather than equivalent-feature performance.
- Repeated-prefix parsing produces a whole document tree after every chunk. Incremental parsing emits fewer provisional section states and returns a complete final tree. These are deliberately different update strategies, with different preview timing.
- Paragraph previews may lag by a block; long ambiguous containers can defer. The final streamed output is checked against batch output by the test suite.
- Corpora are synthetic and repetitive, from 510 to roughly 28,000 code units. Results are a local pilot, not evidence about every Markdown parser, document, device, model, or chunk size.
- A 50× streaming result on a workload does not establish a 50× batch parser or a 50× faster AI response. Timing variation and chunk size materially affect the ratio.

Reproduce with `npm run bench`. Set `XMARKDOWN_CHUNK_SIZE` to test a different delivery size. The benchmark source is [run.js](run.js).
