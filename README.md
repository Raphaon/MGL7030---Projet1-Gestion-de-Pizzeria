# MGL7030 - Projet 3 - Gestion de Pizzeria

## Demarrage rapide

```bash
npm install
npm run db:ensure
npm run db:schema
npm run db:seed
npm start
```

Application :

```text
http://localhost:4000
```

## Identifiants de test

Compte administrateur cree par le seed :

```text
Nom d'utilisateur : admin
Mot de passe      : admin123
```

Ces identifiants sont crees dans la table `users`, rattaches au groupe `admin`, et ce groupe possede la permission `admin:gestion`.
Le mot de passe est stocke avec bcrypt.

## Modele utilisateur / groupe / permission

Tables principales :

```text
users
groups
permissions
user_groups
group_permissions
admins
```

La table `admins` pointe vers `users` pour respecter la consigne demandant une table d'administrateurs, tout en gardant un modele extensible par groupes et permissions.

## Section administration

### Authentification

```text
GET  /api/login
POST /api/login
```

`GET /api/login` affiche un formulaire avec :

```text
nom d'utilisateur
mot de passe
```

Le formulaire est soumis avec `POST /api/login`.
Le serveur verifie le compte dans PostgreSQL et compare le mot de passe avec bcrypt.

Comportement :

```text
identifiants invalides -> retour a /api/login avec message d'erreur
identifiants valides   -> redirection vers /api/gestion
```

### Gestion des garnitures legumes

```text
GET  /api/gestion
POST /api/gestion
```

`GET /api/gestion` affiche une page avec un formulaire d'ajout de garniture legume.

Si l'utilisateur n'est pas authentifie :

```text
GET  /api/gestion -> redirection vers /api/login
POST /api/gestion -> redirection vers /api/login
```

## Seeds

Le seed complet est dans :

```text
scripts/seed.js
```

Il cree ou met a jour :

```text
groupes
permissions
compte admin
garnitures viande
garnitures legumes
formats
pizzas
```

Commande :

```bash
npm run db:seed
```

## Verification

```bash
npm test
```

Le test verifie notamment :

```text
/api/login
/api/gestion protege en GET et POST
connexion admin
ajout de garniture legume authentifie
API PostgreSQL des garnitures, formats, pizzas et commandes
modele users/groups/permissions
```
