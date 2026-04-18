# FamResa — Guide Claude Code

## Lecture obligatoire avant tout code

Lis ces fichiers dans l'ordre avant d'écrire la moindre ligne :

1. [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — modèle de données, règles fondamentales, structure des modules
2. [`docs/DEV_RULES.md`](docs/DEV_RULES.md) — règles strictes d'écriture du code (nommage, Firebase, UI/service)
3. [`docs/AI_GUIDE.md`](docs/AI_GUIDE.md) — comportement attendu des agents IA sur ce projet

> **Règle absolue** : si ces fichiers ne sont pas lus → ne pas écrire de code.

## Références complémentaires

- [`docs/FIREBASE_ADMIN.md`](docs/FIREBASE_ADMIN.md) — opérations admin Firebase (scripts, migrations)
- [`docs/PWA_INCIDENTS_RUNBOOK.md`](docs/PWA_INCIDENTS_RUNBOOK.md) — gestion des incidents PWA / SW
- [`docs/PWA_RELEASE_CHECKLIST.md`](docs/PWA_RELEASE_CHECKLIST.md) — checklist avant chaque release

## Points d'attention rapides

- **Pas de Firebase dans `js/`** — tout accès Firestore passe par `src/modules/*Service.js`
- **Pas de suppression côté client** — les règles Firestore bloquent les `delete`
- **Version SW** — tout bump de cache nécessite `version.js` + entrée dans `CHANGELOG.md`
- **`admin-profiles-audit.html`** — page d'audit servie publiquement ; à protéger via Firebase Hosting rewrites avant exposition large
