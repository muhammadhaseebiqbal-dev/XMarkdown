```x-diagram
{"title":"Release dependencies","description":"Build feeds unit tests and packaging. Unit tests and packaging feed integration tests. Integration tests feed release and notification.","direction":"LR","nodes":[{"id":"build","label":"Build"},{"id":"unit","label":"Unit tests"},{"id":"package","label":"Package"},{"id":"integration","label":"Integration tests"},{"id":"release","label":"Release"},{"id":"notify","label":"Notify"}],"edges":[["build","unit"],["build","package"],["unit","integration"],["package","integration"],["integration","release"],["release","notify"]]}
```
