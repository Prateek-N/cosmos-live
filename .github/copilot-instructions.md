# agents-maker — GitHub Copilot Instructions
# Auto-generated: python agents-maker/tools/generate_platform_configs.py
# Regenerate after domain/phase changes.

## Project Context
Project: universe | Domain: software (confidence: high) | Stack: unknown
Current phase: Task Framing (`task_framing`)

## Agent Routing
This project uses the agents-maker multi-agent framework.
Active agents for this phase: orchestrator (routing).

Full agent roster:
- orchestrator (routing — always active)
- architect_agent (system design, API contracts)
- code_agent (software + analytics implementation)
- execution_agent (docs, research, marketing, ops)
- ui_agent (layout, components, design tokens)
- ux_agent (flows, onboarding, funnel critique)
- reviewer_agent (QA, severity-rated review)
- compression_agent (context compression, resumption)

## Response Instructions
- Apply domain routing (`software`) before every suggestion.
- Match output style to the current phase (Task Framing):
  - implementation → working code with inline comments only
  - solution_design → structured tables and diagrams
  - review_refinement → severity-rated findings (CRITICAL / HIGH / MEDIUM / LOW)
- After every substantive response, suggest 3 ranked next steps.
- Prefer concise, structured output. Avoid explanatory prose when code or bullets suffice.

## Kit Location
agents-maker/
Regenerate: `python agents-maker/tools/generate_platform_configs.py`
