import React, { useState } from 'react';
import { XMarkdown } from 'xmarkdown-renderer/react';
import 'xmarkdown-renderer/styles.css';

export const initialSource = String.raw`# Team capacity report

This is **XMarkdown inside React**: prose, a chart, math, and a live control.

~~~x-chart
{
  "type": "bar",
  "title": "Requests per day",
  "description": "Monday 24; Tuesday 31; Wednesday 28.",
  "x": "day",
  "y": "requests",
  "data": [
    {"day": "Mon", "requests": 24},
    {"day": "Tue", "requests": 31},
    {"day": "Wed", "requests": 28}
  ]
}
~~~

For the queue model, stable arrival requires $\lambda < \mu$.

~~~x-widget
{
  "type": "controls",
  "title": "Try the arrival rate",
  "description": "Move the slider to compare arrival with a capacity of 100.",
  "inputs": [{"id": "rate", "label": "Requests per minute", "type": "range", "min": 0, "max": 180, "value": 80}],
  "outputs": [{"id": "status", "label": "Queue", "expr": "rate <= 100 ? 'within capacity' : 'queue grows'"}]
}
~~~

:::tip[Try an edit]
Change a chart value in the editor, or move the rendered slider.
:::
`;

export default function ReportDemo() {
  const [source, setSource] = useState(initialSource);
  const [diagnostics, setDiagnostics] = useState([]);
  const [error, setError] = useState(null);

  return (
    <section className="react-quickstart">
      <label htmlFor="report-source">Edit the XMarkdown document</label>
      <textarea id="report-source" rows={14} value={source}
        onChange={event => setSource(event.target.value)} />

      {error && <p role="alert">{error.message}</p>}
      {diagnostics.map((item, index) => (
        <p role="status" key={index}>Line {item.line}: {item.message}</p>
      ))}

      <XMarkdown source={source} className="xmarkdown react-native"
        onDiagnostics={items => { setDiagnostics(items); setError(null); }}
        onError={cause => { setError(cause); setDiagnostics([]); }} />
    </section>
  );
}
