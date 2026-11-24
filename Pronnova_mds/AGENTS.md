# Pronnova — AI Development Instructions

## Project Context

Pronnova is a pronunciation assessment and adaptive
learning system for Pakistani Grade 1 students.

Read the following files before making significant changes:

- docs/index.md
- docs/project-context.md
- docs/architecture.md
- Relevant feature specifications in specs/

## Development Principles

1. Understand the existing code before modifying it.
2. Follow approved requirements and architecture.
3. Do not introduce technologies or libraries without
   discussing them first.
4. Prefer small, focused, maintainable changes.
5. Do not implement unrelated features or refactor
   unrelated code.
6. Ask for clarification when requirements are unclear.
7. Explain the implementation plan before major changes.

## Implementation Workflow

For each feature:

1. Read the relevant specification.
2. Inspect the existing implementation.
3. Propose an implementation plan.
4. Implement only the approved scope.
5. Run relevant tests and checks.
6. Report changes, test results, and remaining issues.

## React Development

- Follow the approved React project structure.
- Reuse existing components and hooks when appropriate.
- Follow the agreed Zustand conventions once finalized.
- Keep components focused and maintainable.
- Avoid unnecessary state and duplicate business logic.
- Do not introduce new state management libraries
  without approval.

## Code Quality

- Follow existing project conventions.
- Use clear names and maintainable code.
- Avoid unnecessary abstractions and dependencies.
- Do not claim tests pass unless they were run.
- Do not silently change established behavior.

## Documentation

Update relevant documentation when implementation
decisions or project behavior change.

## Security

- Never expose secrets, API keys, or credentials.
- Do not commit environment files containing secrets.
- Validate user input and protect sensitive data.
- Follow approved authentication and authorization rules.