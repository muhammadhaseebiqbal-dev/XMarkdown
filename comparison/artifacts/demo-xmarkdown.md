# How a request moves

The API validates a request before storing it. **The same document** contains prose and visual data.

:::note[Trust boundary]
Each visual uses a known schema. Labels remain text.
:::

```x-diagram
{"title":"Request pipeline","description":"A request passes through validation, storage, and a response.","nodes":[{"id":"request","label":"Request"},{"id":"validate","label":"Validate"},{"id":"store","label":"Store"},{"id":"response","label":"Response"}],"edges":[["request","validate"],["validate","store"],["store","response"]]}
```

```x-chart
{"type":"bar","title":"Requests per day","x":"day","y":"requests","description":"Sample data: Monday 24, Tuesday 31, Wednesday 18, Thursday 42.","data":[{"day":"Mon","requests":24},{"day":"Tue","requests":31},{"day":"Wed","requests":18},{"day":"Thu","requests":42}]}
```
