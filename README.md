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

| Service  | URL                      | Identifiants         |
|----------|--------------------------|----------------------|
| API      | http://localhost:8000/api | —                   |
| pgAdmin  | http://localhost:5050    | admin@analim.fr / admin |
| Mailpit  | http://localhost:8025    | —                    |

**Connexion pgAdmin → PostgreSQL :**
- Host : `congressistes_postgres` — Port : `5432`
- Database : `congressistes` — User : `app` / Password : `secret`

---

## Comptes de test _(fixtures)_

| Rôle       | Email               | Mot de passe |
|------------|---------------------|--------------|
| Admin      | admin@analim.fr     | admin1234    |
| Utilisateur | alice@test.fr      | user1234     |
| Utilisateur | bob@test.fr        | user1234     |

---

## Endpoints principaux

| Méthode | Route                        | Accès      | Description                  |
|---------|------------------------------|------------|------------------------------|
| POST    | `/api/auth`                  | Public     | Obtenir un token JWT         |
| GET     | `/api/attendees`             | Connecté   | Liste des congressistes      |
| POST    | `/api/attendees`             | Admin      | Créer un congressiste        |
| GET     | `/api/invoices`              | Connecté   | Liste des factures           |
| POST    | `/api/invoices`              | Admin      | Générer une facture          |
| GET     | `/api/invoices/{id}/pdf`     | Connecté   | Télécharger la facture en PDF|
| POST    | `/api/payments`              | Admin      | Enregistrer un règlement     |
| GET     | `/api/stats`                 | Admin      | Dashboard statistiques       |

La documentation complète est sur `/api` (Swagger UI).

---

## TODO

- [ ] Tests unitaires (State Processors)
- [ ] Tests fonctionnels (API endpoints)
- [ ] Frontend React
