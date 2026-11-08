# Security policy

Only `main` / the 0.2.x MVP is actively maintained. No production-hardening or independent audit is implied.

Use **Report a vulnerability** under the repository Security tab when available. If private reporting is unavailable, open an issue requesting a private contact channel **without exploit payloads or sensitive details**. Do not post credentials, private documents, or weaponized examples. Provide revision, minimal non-sensitive reproduction, runtime, expected boundary, observed behavior, and impact. No response SLA is promised.

Author documents are untrusted. Raw HTML is escaped, link schemes checked, and ordinary images become alt text. SVG has a checked static profile and local references. Math trust is disabled. Controls use a bounded expression interpreter. The browser module must only mount parser-generated markup; arbitrary `data-x-widget` markup is not a trusted input API.

The showcase previews are sandboxed, allow trusted scripts, and omit same-origin permission. The public API caps sources at 32,768 code units and uses a per-request parser/cache. Application code does not persist/log source text; hosting may retain ordinary access metadata. Avoid entering confidential documents into the public playground.

Input/allocation limits do not impose hard CPU/memory isolation. Hostile-input deployments need process/worker isolation, time/resource budgets, request limits, and application-specific network policy. Operators should configure platform abuse protection and monitor public endpoint usage. External resource loading and arbitrary author programs are unsupported.
