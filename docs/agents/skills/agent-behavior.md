---
name: agent-behavior
description: Core behavioral, safety, and decision-making rules for AI agents operating in this repository. Use this to understand how to act, communicate, and stay safe.
---

# Skill: Agent Behavior & Safety

## 1. Think and Read Before Acting
- **No assumptions:** NEVER guess the shape of an API, data models, or variables. ALWAYS read the OpenAPI files in `contracts/` before writing frontend or backend code.
- **Explore first:** If asked to fix a bug or add a feature, use search/grep tools to read and understand the existing code context before making any file modifications.

## 2. Safety & Security
- **No destructive actions:** Do not run dangerous commands (e.g., recursive forced deletes on critical directories, dropping databases without backup). Do not modify files outside of the project workspace.
- **Dependency hygiene:** Do not install unknown, unverified, or heavy third-party packages. Keep the project lightweight. If you think a new library is needed, suggest it to the user first.
- **Branching:** Do not push directly to `main`. Always work on feature branches.

## 3. Ambiguity & Communication
- **Ask for clarification:** If the user's request is vague, ambiguous, or lacks crucial details (e.g., missing API fields for a new feature), STOP and ASK the user for clarification. Do not hallucinate or invent complex business logic.
- **Keep it simple:** This is a hackathon project. Prioritize working, readable, and simple solutions over over-engineered, complex architectures.
