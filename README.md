# Congrès ANALIM

Application de gestion de congrès — Projet M1 Ynov.

## Stack

- **Backend** : Symfony 7.4 + API Platform v4 + PostgreSQL
- **Frontend** : React 19 + Vite + TypeScript + Tailwind _(à venir)_
- **Auth** : JWT (lexik/jwt-authentication-bundle)
- **Docker** : PostgreSQL (5433), pgAdmin (5050), Mailpit (8025)

---

## Prérequis

- [Rancher Desktop](https://rancherdesktop.io/) (ou Docker Desktop)
- PHP 8.2+
- [Composer](https://getcomposer.org/)
- [Symfony CLI](https://symfony.com/download) _(optionnel)_

---

## Installation

### 1. Démarrer les services Docker

```bash
docker compose up -d
```

### 2. Installer les dépendances backend

```bash
cd backend
composer install
```

### 3. Configurer l'environnement local

```bash
cp .env.local.dist .env.local
# Éditer .env.local si besoin (les valeurs par défaut correspondent au Docker Compose)
```

### 4. Générer les clés JWT

```bash
php bin/console lexik:jwt:generate-keypair
```

### 5. Créer la base de données et migrer

```bash
php bin/console doctrine:migrations:migrate
```

### 6. Charger les fixtures _(données de démo)_

```bash
php bin/console doctrine:fixtures:load
```

### 7. Démarrer le serveur

```bash
# Avec Symfony CLI
symfony server:start

# Ou avec PHP built-in
php -S localhost:8000 -t public/
```

L'API est disponible sur **http://localhost:8000/api** (Swagger UI inclus).

---

## Services

| Service  | URL                      | Identifiants            |
|----------|--------------------------|-------------------------|
| API      | http://localhost:8000/api | —                      |
| pgAdmin  | http://localhost:5050    | admin@analim.fr / admin |
| Mailpit  | http://localhost:8025    | —                       |

**Connexion pgAdmin → PostgreSQL :**
- Host : `congressistes_postgres` — Port : `5432`
- Database : `congressistes` — User : `app` / Password : `secret`

---

## Fixtures

Les fixtures chargent un jeu de données reproductible pour le développement (seed fixe).

| Données              | Quantité | Détails |
|----------------------|----------|---------|
| Hôtels               | 4        | De 1 à 4 étoiles, tarifs nuit + petit-déjeuner |
| Sessions             | 10       | Réparties sur 5 jours de congrès (8–12 juin 2026), prix 50–120 € |
| Activités            | 8        | Visites, concerts, ateliers, dîner gala |
| Organismes payeurs   | 3        | Ligue Grand Est, Université de Lorraine, Lycée Valadon |
| Congressistes        | 20       | Générés avec Faker ; 15 avec hôtel, 8 avec organisme |
| Factures             | 7        | Pour les 7 premiers congressistes ; 2 imprimées et réglées |
| Paiements            | 2        | Pour les 2 factures imprimées |

**Comptes disponibles après `doctrine:fixtures:load` :**

| Rôle        | Email           | Mot de passe |
|-------------|-----------------|--------------|
| Admin       | 1er congressiste généré par Faker | user1234 |
| Utilisateur | Tous les autres  | user1234     |

> Le premier congressiste créé reçoit automatiquement le rôle `ROLE_ADMIN`. Son email est généré aléatoirement par Faker mais reste fixe grâce au seed (42).

Pour les tests manuels en Swagger, créez d'abord un compte admin via `POST /api/attendees` ou utilisez `GET /api/attendees` après login pour retrouver l'email du premier congressiste.

---

## Endpoints principaux

| Méthode | Route                            | Accès    | Description                   |
|---------|----------------------------------|----------|-------------------------------|
| POST    | `/api/auth`                      | Public   | Obtenir un token JWT          |
| POST    | `/api/attendees`                 | Public   | S'inscrire au congrès         |
| GET     | `/api/attendees`                 | Connecté | Liste des congressistes       |
| PATCH   | `/api/attendees/{id}`            | Admin    | Modifier un congressiste      |
| DELETE  | `/api/attendees/{id}`            | Admin    | Supprimer un congressiste     |
| GET     | `/api/hotels`                    | Connecté | Liste des hôtels              |
| POST    | `/api/hotels`                    | Admin    | Créer un hôtel                |
| GET     | `/api/sessions`                  | Connecté | Liste des sessions            |
| POST    | `/api/sessions`                  | Admin    | Créer une session             |
| GET     | `/api/activities`                | Connecté | Liste des activités           |
| POST    | `/api/activities`                | Admin    | Créer une activité            |
| GET     | `/api/payer_organizations`       | Connecté | Liste des organismes payeurs  |
| POST    | `/api/payer_organizations`       | Admin    | Créer un organisme            |
| GET     | `/api/invoices`                  | Connecté | Liste des factures            |
| POST    | `/api/invoices`                  | Admin    | Générer une facture           |
| PATCH   | `/api/invoices/{id}/mark-printed`| Admin    | Marquer une facture imprimée  |
| GET     | `/api/invoices/{id}/pdf`         | Connecté | Télécharger la facture en PDF |
| POST    | `/api/payments`                  | Admin    | Enregistrer un règlement      |
| DELETE  | `/api/payments/{id}`             | Admin    | Supprimer un règlement        |
| GET     | `/api/stats`                     | Admin    | Dashboard statistiques        |

La documentation complète est sur `/api` (Swagger UI).

---

## Tests

Le projet dispose d'une suite de **122 tests** (unitaires + intégration).

### Lancer les tests

```bash
cd backend
php bin/phpunit
```

Les tests utilisent une base **SQLite en mémoire** — aucun service Docker n'est nécessaire.

### Tests unitaires (`tests/Unit/`)

Testent la logique métier de chaque classe de manière isolée (sans base de données ni HTTP).

| Fichier | Ce qui est testé |
|---------|-----------------|
| `Entity/AttendeeTest` | Rôles, `eraseCredentials`, `getUserIdentifier` |
| `State/AttendeeStateProcessorTest` | Hashage du mot de passe, dispatch d'événement, règles métier (sessions/activités verrouillés après facturation) |
| `State/InvoiceStateProcessorTest` | Calcul du total (hôtel, petit-déjeuner, sessions, activités, dépôt), doublon de facture, mark-printed |
| `State/PaymentStateProcessorTest` | Date automatique, `settled` true/false selon les paiements restants |
| `Event/AttendeeCreatedEventTest` | L'événement porte bien l'attendee |

### Tests d'intégration (`tests/Integration/`)

Testent l'API complète : requête HTTP → Symfony → base de données.

| Fichier | Routes couvertes |
|---------|-----------------|
| `AuthApiTest` | `POST /api/auth` |
| `AttendeeApiTest` | `GET/POST/PATCH/DELETE /api/attendees` + filtres |
| `InvoiceApiTest` | `GET/POST /api/invoices`, mark-printed, calcul total |
| `PaymentApiTest` | `GET/POST/DELETE /api/payments` |
| `StatsApiTest` | `GET /api/stats` |
| `ActivityApiTest` | `GET/POST/PATCH/DELETE /api/activities` |
| `HotelApiTest` | `GET/POST/PUT/PATCH/DELETE /api/hotels` |
| `SessionApiTest` | `GET/POST/PUT/PATCH/DELETE /api/sessions` |
| `PayerOrganizationApiTest` | `GET/POST/PUT/PATCH/DELETE /api/payer_organizations` |

Chaque ressource est testée avec : accès sans token (401), accès utilisateur sans droits (403), accès admin (201/200/204), et les erreurs de validation (422).

---

## TODO

- [ ] Frontend React
