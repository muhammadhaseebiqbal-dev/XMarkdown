# Show HN draft

Status on 8 November 2026: account creation completed, but submission was blocked by Hacker News' temporary Show HN restriction for accounts unfamiliar with the community. No post was published. The [restriction notice](https://news.ycombinator.com/showlim) gives no fixed waiting period or karma threshold. The draft below is retained for a future eligible submission.

Title: Show HN: XMarkdown – Markdown with charts, controls and validated SVG

URL: https://xmarkdown-zeta.vercel.app

## Introductory comment

We built XMarkdown to explore a small document format for AI-generated reports that need more than prose: charts, directed diagrams, equations, calculated controls, drawing, and static SVG scenes/imports.

The demo has 18 examples, an editable browser playground, and a React integration. The Markdown core is markdown-it; KaTeX handles math and saxes tokenizes imported SVG. We added the extension schemas, validation, graphics rendering, widget runtime, caching, and streaming coordination.

Ordinary Markdown syntax stays familiar. Graphics use named fences with structured data. Source savings vary: one demo uses 208 tokens versus 1,219 for literal HTML/SVG, but only 261 for shared-component HTML. This is an MVP, and we haven't measured AI generation or reader benefits. SVG follows a checked static subset.

For plain prose, I'd still use ordinary Markdown. The question we're testing is whether one consistent, bounded renderer makes richer generated documents easier to produce and integrate.

MIT source and installation: https://github.com/muhammadhaseebiqbal-dev/XMarkdown

I'd appreciate feedback on the authoring syntax, integration friction, and how it compares with existing Markdown plugin stacks, Markdoc/MyST, and shared-component HTML.

## Launch approach

Lead with a working example people can edit. Explain the specific use case, show the source and result together, and disclose what is measured. Share in communities where rich generated documents are relevant, follow each community's posting rules, and answer technical feedback. Star counts are an outcome of exposure and perceived usefulness; they cannot be promised. Avoid purchased stars, vote requests, duplicate promotion, and manufactured endorsements.
