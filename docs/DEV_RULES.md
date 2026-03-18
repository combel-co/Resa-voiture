# DEV RULES — Execution Guide for Humans & AI

## 0. Purpose
Ensure all contributions follow the architecture defined in `ARCHITECTURE.md`.
These rules are mandatory for any change (human or AI).

---

## 1. Read Before Acting (MANDATORY)
Before writing any code, ALWAYS read:
1. `ARCHITECTURE.md`
2. `docs/DEV_RULES.md`

If unclear, STOP and ask for clarification.

---

## 2. Core Rules

### Separation of concerns
- UI: display + user events only
- Service: business logic only
- Repository: database (Firebase) only

### Forbidden
- Calling Firebase from UI
- Writing business logic in UI
- Writing business logic in repository
- Using global mutable state for business data

### Required
- Every feature goes through a service
- Every DB access goes through a repository
- One domain = one module

---

## 3. File Naming Convention
- `*.service.js` → business logic
- `*.repository.js` → DB access
- `*.model.js` → data shape
- `*.validator.js` → input validation

---

## 4. How to Implement a Feature

1. Identify the domain module (resource, reservation, availability, etc.)
2. Add/update service
3. Add/update repository
4. Expose a simple function
5. Call it from UI

Example:

UI:
```js
await reservationService.create(input)
```

---

## 5. Migration Rules (Do not break UI)

- Wrap existing UI functions
- Move logic to service
- Keep UI unchanged until migration complete

---

## 6. Conflict Handling (CRITICAL)

All reservations MUST use Firestore transactions.

---

## 7. Code Style

- Small functions
- Explicit naming (no implicit behavior)
- No hidden side effects

---

## 8. PR Checklist (use for every change)

- [ ] No Firebase calls in UI
- [ ] Logic is in service
- [ ] Repository used for DB
- [ ] Naming conventions respected
- [ ] Aligned with ARCHITECTURE.md

---

## 9. Golden Rule

If you don’t know where code belongs → architecture issue.

---

This document is mandatory and must be followed strictly.
