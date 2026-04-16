# PWA Release Checklist

Checklist obligatoire avant chaque déploiement sur GitHub Pages.

---

## Pre-deploy

### 1. Incrémenter les versions dans `version.js`

```js
var APP_VERSION = 'vNN';                    // ex: v32 → v33
var APP_BUILD = 'famresa-build-YYYYMMDD-N'; // ex: famresa-build-20260416-2
```

> **`version.js` est la seule source de vérité.** Le SW (via `importScripts`) et la page (via `<script>`) lisent ce fichier.

### 2. Bumper `?v=` des scripts modifiés dans `index.html`

Uniquement les fichiers modifiés dans cette release :

```html
<script src="js/auth.js?v=27" defer></script>
```

> Les `?v=` sont un filet de sécurité pour le cache navigateur sans SW. Le mécanisme principal est `APP_BUILD`.

### 3. Tester localement

- [ ] Clear site data (DevTools > Application > Clear site data)
- [ ] Vérifier que le login complète sans erreur Firebase
- [ ] Vérifier que le SW s'installe et s'active (DevTools > Application > Service Workers)

### 4. Tester sur 2+ appareils

| Appareil | Vérifications |
|---|---|
| **iOS Safari (web)** | Login OK, prompt install modal iOS affiché après 5s |
| **iOS Safari (PWA installée)** | APP_BUILD purge déclenché, reload auto, login OK après |
| **Android Chrome (web)** | Login OK, banner install affiché après 5s |
| **Android Chrome (PWA installée)** | APP_BUILD purge déclenché, reload auto, login OK après |

---

## Deploy

### 5. Push sur main

```bash
git push origin main
```

### 6. Attendre le build GitHub Pages (~1-2 min)

Vérifier dans l'onglet Actions du repo que le deploy est terminé.

---

## Post-deploy

### 7. Vérifier le purge automatique

Sur un appareil avec l'ancienne PWA installée :
- [ ] Ouvrir l'app → doit purger et recharger automatiquement (APP_BUILD mismatch)
- [ ] Login fonctionne après le reload

### 8. Surveiller les erreurs

- [ ] Vérifier la collection Firestore `erreur` pour de nouveaux incidents
- [ ] Si erreurs : suivre `docs/PWA_INCIDENTS_RUNBOOK.md`

---

## Rappel architecture versioning

```
version.js          ← source unique (APP_VERSION + APP_BUILD)
  ├── sw.js         ← importScripts('./version.js') → CACHE_NAME = 'famresa-' + APP_VERSION
  └── index.html    ← <script src="version.js"> (sync) → APP_BUILD lu par le bloc SW registration
```
