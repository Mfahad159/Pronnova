# Architecture

## Status

Initial architecture draft.

Detailed architecture is pending review of the
approved design references and implementation plan.

## 1. Proposed System Components

### Frontend

Technology: React

Responsibilities:

- User interface
- Teacher and student workflows
- Client-side interaction and state management
- Communication with backend services

### Database and Authentication

Technology: Supabase

Responsibilities:

- Persistent application data
- User authentication
- Database access and authorization

### Backend and AI Processing

Status: Not finalized.

Responsibilities and implementation approach will be
defined after reviewing the project requirements,
AI assessment pipeline, and technical references.

## 2. Pending Architecture Decisions

- React project setup and folder structure
- Component organization
- State management and Zustand conventions
- Custom hooks and their responsibilities
- API client and error handling
- Database schema and relationships
- Authentication and authorization
- Audio processing and storage
- Pronunciation assessment pipeline
- Testing and deployment strategy

## 3. Architecture Rules

- Keep component responsibilities clear.
- Avoid duplicating business logic.
- Define API contracts before implementing dependent
  features.
- Keep security-sensitive operations in approved
  secure environments.
- Update this document when architecture decisions
  change.