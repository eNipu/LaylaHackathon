Created 0 of 2 detected sources in PostHog. The credential prompts were cancelled, so both sources need browser setup.

# PostHog warehouse source setup

## Project changes

- No application source code or environment configuration was changed.
- No data warehouse source was created in PostHog.
- This report was created to record the browser handoff.

## Files modified or created

- Created `posthog-warehouse-report.md`.

## Manual steps

1. Connect **Anthropic** in PostHog: [Open Anthropic source setup](https://eu.i.posthog.com/project/159914/data-warehouse/new-source?kind=Anthropic&utm_source=wizard&utm_campaign=warehouse-source). Use an organization-level Anthropic Admin API key, or the appropriately scoped Claude Enterprise key for Enterprise Analytics tables.
2. Connect **Turso** in PostHog: [Open Turso source setup](https://eu.i.posthog.com/project/159914/data-warehouse/new-source?kind=Turso&utm_source=wizard&utm_campaign=warehouse-source). Use the organization slug and an organization-scoped Platform API token; a database auth token cannot access the Platform API.

## Skipped sources

- **Anthropic** — skipped because the credential prompt was cancelled.
- **Turso** — skipped because the credential prompt was cancelled.
