# XMarkdown evaluation plan

Proposed on **8 November 2026**. Local parser timings and deterministic source-token counts are now available in the [benchmark report](../benchmark/report.md) and [representation comparison](../comparison/report.md). No LLM generation experiment or reader study has been performed. The remaining evaluation determines whether this profile improves the complete workflow over existing options.

## Questions to answer

1. Does the format reduce total generation tokens and completion time for the same document capabilities?
2. Can models produce valid documents with fewer repair attempts?
3. Can readers find and understand the information as well as, or better than, the baselines?
4. Does the renderer maintain a bounded capability model under malformed or hostile input?
5. Are the benefits large enough to justify new syntax, integration work, and a maintained runtime?

## Baselines

| Variant | Purpose |
| --- | --- |
| CommonMark/GFM with professional typography | Establish whether presentation improvements alone solve the prose problem. |
| Styled Markdown with Mermaid and chart plugins | The closest simple baseline for the proposed capability set. |
| A configured MyST or Markdoc document profile | Test established structured-document approaches. |
| Semantic HTML using shared CSS and prebuilt components | Give HTML the same renderer-reuse advantage as XMarkdown. |
| Independently generated self-contained HTML/CSS/JS/SVG | Test the workflow motivating the recent enthusiasm. |
| Proposed XMarkdown profile | Test whether the restricted syntax and validation add measurable value. |

Do not compare a full interactive HTML document with plain Markdown that cannot express the task. Use a capability-matched subset for the main comparison and report unsupported tasks separately. Keep a separate open-ended prototype track where HTML's expressive freedom is useful.

## Corpus

Start with 24 fixed briefs: four examples each of prose explanations, comparison documents, flow/sequence explanations, small data reports, implementation plans, and annotated technical walkthroughs. Provide the same facts, data, source excerpts, audience, accessibility requirements, and intended interactions to each variant.

Include short and long documents, Unicode, long labels, negative and missing chart values, nested lists, code fences within examples, reference links, and documents that deliberately do not need a visual. Figures must have factual labels and text alternatives.

Run an initial single-model pilot. After correcting experiment defects, use several model families and repeated generations for external validity. Lock model/version, sampling settings where supported, tool permissions, token limits, instructions, and evaluation rules. Randomize condition order and log serving conditions. Do not infer another provider's token counts from an unrelated tokenizer.

## Two experiments

**Representation experiment:** Hold facts, layout requirements, and interactions constant, and encode matched artifacts in each syntax. This isolates source verbosity and parser/renderer behavior. Hand-authored matched examples are useful here but do not measure model generation efficiency.

**Generation experiment:** Ask the same model to fulfill each brief using each format. Count initial generation and all repair turns. Permit the same number and kind of inspection tools in each condition. Include the necessary format instructions and examples in its cost. This tests the real workflow, including whether a model needs help with unfamiliar syntax.

## Measurements

| Metric | Recording rule |
| --- | --- |
| Input/output tokens | Use actual provider usage records for all calls, including repairs; record cached input separately where exposed. |
| Billed cost | Compute from recorded usage and the applicable provider pricing at experiment time; keep distinct from raw token count. |
| Time to first output | Start at request dispatch and record the first token/event. |
| Time to first useful display | Define in advance what meaningful prose or a complete visual counts; record separately from first output. |
| Time to acceptable completion | Include tool calls, validation, model repairs, and rendering until the fixed acceptance checklist passes. |
| Syntactic validity | Record parser acceptance and diagnostics; distinguish tolerant source fallback from successful graphics parsing. |
| Semantic validity | Check chart fields and values, graph references, content coverage, and task-specific facts. Valid JSON is insufficient. |
| Repair effort | Record repair turns, added tokens, human intervention, and failure after the permitted budget. |
| Runtime performance | Separately measure parse, validation, layout, render time, memory, runtime download size, and offline behavior. |
| Reader performance | Use tasks such as locating a tradeoff, tracing a failure path, or reading a chart value; record correctness and time. |
| Reader preference | Collect preference separately; a pretty output can still harm comprehension. |
| Accessibility | Check headings, reading order, chart descriptions, keyboard operation, focus, contrast, reflow, zoom, and print output. |
| Editability | Measure an identical small content/data change, diff size, and preservation of unrelated source. |
| Streaming correctness | Compare final batch output with final incremental output; track provisional changes and incomplete-block behavior. |

For reader trials, counterbalance document order, anonymize the source-format labels, use the same content, and avoid repeated exposure that teaches the answer. A small internal trial is exploratory; report its limitations instead of presenting it as a general readability result.

## Parser and security acceptance corpus

Run adversarial tests against both parser and renderer, including:

- Script tags, inline event handlers, embedded HTML/SVG, encoded unsafe URLs, SVG resource references, and malicious labels.
- Document attempts to lower Mermaid security settings or inject CSS/configuration.
- Huge inputs, deep nesting, many diagram edges, large datasets, extreme dimensions, and expensive layout requests.
- Duplicate/unknown attributes, unsupported chart types, invalid field references, nonfinite values, and unexpected object keys.
- Truncation at every boundary of a graphics fence or JSON string. Incomplete data must not reach active rendering.
- Ordinary code examples containing extension syntax. They must remain literal code.
- Later reference definitions, setext headings, nested fences, and unknown blocks to exercise Markdown precedence.
- Server-side resolution attempts targeting local paths or arbitrary network endpoints, if that capability is introduced.

Use a controlled fixture server to detect unintended network requests. Verify host-policy enforcement at the capability boundary, not only absence of visible alerts. Define timeout and memory limits before running resource tests, with cancellable execution. Keep document input separate from any evaluator's instructions; a rendering test is not a prompt-injection solution.

Use the chosen CommonMark baseline's conformance examples for ordinary syntax. Specify intentional differences in the safe rendering profile. Add fuzzing and dependency-specific regression cases before treating the renderer as suitable for untrusted documents.

## Decision rule

Agree on thresholds before seeing the results. A practical first gate is: the core profile must preserve required facts and features, enforce its capability policy, and improve total generation work against the strongest comparable existing solution without materially degrading reader task performance or accessibility.

Report per-task results, failures, medians, distributions, and uncertainty. Do not hide unsupported tasks or publish a pooled token-saving percentage that mixes unequal features.

Proceed with a dedicated specification and parser only if the pilot identifies a repeatable advantage. Otherwise, improve the renderer or package an existing Markdown stack as a constrained profile.
