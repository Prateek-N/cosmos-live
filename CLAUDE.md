# agents-maker — Project AI Config
# Auto-generated: python agents-maker/tools/generate_claude_md.py
# Regenerate after domain/phase changes: python agents-maker/tools/generate_claude_md.py

## Active Domain
software  (confidence: high)

## Stack
unknown

## Current Phase
Task Framing (`task_framing`)

## Agent Routing
All tasks in this project route through the agents-maker multi-agent kit.
Orchestrator is always active. Specialist agents for this phase: orchestrator (routing).

## Session Instructions
- Apply domain routing and phase context from agents-maker before every task.
- After every response: append a [Companion] block with 3 ranked next steps.
- Include a `Command:` line the user can copy to continue the workflow.

## Kit Location
agents-maker/ (relative to project root)
Generate a fresh prompt: `python agents-maker/tools/generate_prompt.py "your task"`
