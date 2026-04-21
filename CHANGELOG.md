# Changelog — FamResa

Format : `[vX] AAAA-MM-JJ — description`  
Chaque bump de version doit mettre à jour `version.js` **et** ce fichier.

---

## [v34] 2026-04-21
- Build `famresa-build-20260421-2`
- Planning : « Réserver » uniquement avec début **et** fin choisis sur le calendrier (même jour deux fois = 1 jour, pas 1 nuit) ; plus de date de fin implicite au passage assistant.
- Voiture : conflits par **créneaux horaires** — même journée possible si les plages ne se chevauchent pas (ex. 9h–12h puis 14h–18h) ; jours partiellement libres visibles comme les séjours maison « partiels ».
- Accueil : bandeau trajet / séjour affiché jusqu’à **45 jours** avant le départ (au lieu de 7) ; date « aujourd’hui » en **heure locale** pour éviter les décalages UTC.

## [v33] 2026-04-21
- Build `famresa-build-20260421-1`
- Planning : bandeau d’actions (`#planning-action-bar`) déplacé hors de `<main>` pour que `position: fixed` reste collé au bas de l’écran sur mobile (évite le scroll avec le calendrier quand `main` est le scrollport).

## [v32] 2026-04-16
- Build `famresa-build-20260416-2`
- Migrations architecture en cours : découpe `js/` → `src/modules/`

## [v31] et antérieur
- Historique non documenté. Référence : git log.

---

*Ce fichier est lu par le Service Worker (`sw.js`) via `version.js` — tout changement de cache doit s'accompagner d'une entrée ici.*
