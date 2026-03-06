# 🚗 FamCar — Réservation voiture familiale

Application ultra-simple pour réserver la voiture familiale, jour par jour.

**🌐 Site live** → [combel-co.github.io/Resa-voiture](https://combel-co.github.io/Resa-voiture/)
**🔥 Firebase** → [console.firebase.google.com/project/famcar-e2bb3](https://console.firebase.google.com/project/famcar-e2bb3)

## Fonctionnalités

- 🔒 Code PIN familial (stocké dans Firebase, invisible dans le code)
- 📅 Calendrier mensuel avec navigation
- 👤 Identification simple (prénom + email)
- 📸 Photo de profil optionnelle
- ✅ Réservation / annulation en 2 clics
- 🔄 Mise à jour en temps réel
- 🚗 Support multi-voitures (extensible)
- 📱 100% responsive mobile

## Configuration initiale

### 1. Activer Firestore

1. Aller dans la [console Firebase](https://console.firebase.google.com/project/famcar-e2bb3)
2. Menu gauche → **Build > Firestore Database**
3. **Créer une base de données** → mode **test** → région `eur3 (europe-west)`

### 2. Définir le code PIN familial

**Option A — Automatique** : La première personne qui entre un code sur le site le définit comme code familial.

**Option B — Manuel** : Dans Firestore → **Démarrer une collection** → nom `config` → ID du document `access` → champ `pin` (type string) → valeur = votre code à 4 chiffres.

### 3. Activer GitHub Pages

1. [Settings > Pages](https://github.com/combel-co/Resa-voiture/settings/pages) du repo
2. Source : **Deploy from a branch**
3. Branch : `main` / `root` → **Save**

### 4. Sécuriser les règles Firestore

Dans Firestore > Règles, coller :

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /cars/{carId} {
      allow read: if true;
      allow write: if true;
    }
    match /bookings/{bookingId} {
      allow read: if true;
      allow create: if true;
      allow delete: if true;
    }
    match /users/{userId} {
      allow read: if true;
      allow create: if true;
      allow update: if true;
    }
    match /config/{docId} {
      allow read: if true;
    }
  }
}
```

> ⚠️ La collection `config` (qui contient le PIN) est en **lecture seule** — personne ne peut la modifier depuis l'app.

## Comment ça marche

1. Ouvrir le site → entrer le **code PIN familial** (4 chiffres)
2. Cliquer sur son **profil** (en haut à droite) → s'identifier avec prénom + email
3. Cliquer sur un **jour disponible** → **Réserver**
4. Pour annuler → cliquer sur son jour → **Annuler**

## Architecture

```
Resa-voiture/
├── index.html     ← Toute l'app (HTML + CSS + JS) en un seul fichier
└── README.md      ← Ce fichier
```

Collections Firestore :
- **cars** → `{ name, emoji }`
- **bookings** → `{ carId, date, userId, userName, photo, createdAt }`
- **users** → `{ name, email, photo, createdAt }`
- **config** → `{ pin }` (document `access`)

## Modifier le code PIN

1. [Console Firebase](https://console.firebase.google.com/project/famcar-e2bb3) → Firestore
2. Collection `config` → document `access`
3. Modifier le champ `pin`
4. Tout le monde devra entrer le nouveau code (ou vider le cache navigateur)

## Ajouter une 2e voiture

1. Dans Firestore → collection `cars`
2. **Ajouter un document** → champs : `name` (ex: "Clio") + `emoji` (ex: "🚙")
3. Un sélecteur d'onglets apparaîtra automatiquement dans l'app

## Stack

- HTML / CSS / Vanilla JS (zéro framework, zéro build)
- Firebase Firestore (temps réel, gratuit jusqu'à 50K lectures/jour)
- Google Fonts (DM Sans + Fraunces)
- GitHub Pages (hébergement gratuit)

---

Fait avec ❤️ pour la famille.
