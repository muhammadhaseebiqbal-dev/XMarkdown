```x-widget
{"type":"controls","title":"Queue what-if","description":"Adjust arrival rate and service capacity to see whether the queue grows.","inputs":[{"id":"rate","label":"Requests per minute","type":"range","min":0,"max":180,"value":80}],"outputs":[{"id":"status","label":"Queue","expr":"rate + '/min: ' + (rate <= 100 ? 'capacity is sufficient' : 'queue grows by ' + (rate-100) + ' requests/min')"}]}
```
