import { graphicStyles } from '../src/index.js';

// Shared by the live playground and the representation comparison.
export const demoSource = `# How a request moves

The API validates a request before storing it. **The same document** contains prose and visual data.

:::note[Trust boundary]
Each visual uses a known schema. Labels remain text.
:::

\`\`\`x-diagram
{"title":"Request pipeline","description":"A request passes through validation, storage, and a response.","nodes":[{"id":"request","label":"Request"},{"id":"validate","label":"Validate"},{"id":"store","label":"Store"},{"id":"response","label":"Response"}],"edges":[["request","validate"],["validate","store"],["store","response"]]}
\`\`\`

\`\`\`x-chart
{"type":"bar","title":"Requests per day","x":"day","y":"requests","description":"Sample data: Monday 24, Tuesday 31, Wednesday 18, Thursday 42.","data":[{"day":"Mon","requests":24},{"day":"Tue","requests":31},{"day":"Wed","requests":18},{"day":"Thu","requests":42}]}
\`\`\`
`.replace(/\r\n/g, '\n');

export const documentStyle = `body{font:16px/1.65 system-ui,sans-serif;color:#172b45;margin:0 auto;padding:24px;max-width:850px}h1,h2{line-height:1.2}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#f1f5f9;padding:16px}a{color:#2563eb}code{font-size:.9em}table{border-collapse:collapse}td,th{border:1px solid #cbd5e1;padding:8px}${graphicStyles}`;
