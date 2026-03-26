# Gestion des rôles — Congrès ANALIM

## Rôles disponibles

| Rôle | Description |
|------|-------------|
| `ROLE_USER` | Attribué automatiquement à tout congressiste inscrit |
| `ROLE_ADMIN` | Accès complet à l'API et à la gestion du congrès |

> `ROLE_USER` est toujours inclus dans `ROLE_ADMIN` (hiérarchie Symfony standard).

---

## Matrice des accès

### Congressistes (`/api/attendees`)

| Opération | User | Admin |
|-----------|------|-------|
| `POST` — S'inscrire | ✅ Public | ✅ |
| `GET` — Liste complète | ❌ 403 | ✅ |
| `GET` — Son propre profil | ✅ | ✅ |
| `PATCH` — Modifier son profil | ✅ (champs limités) | ✅ (tous champs) |
| `PATCH` — Modifier les rôles | ❌ 403 | ✅ |
| `DELETE` | ❌ 403 | ✅ |

### Référentiels (`/api/hotels`, `/api/sessions`, `/api/activities`, `/api/payer_organizations`)

| Opération | User | Admin |
|-----------|------|-------|
| `GET` — Liste / Détail | ✅ | ✅ |
| `POST` / `PATCH` / `PUT` / `DELETE` | ❌ 403 | ✅ |

### Factures (`/api/invoices`)

| Opération | User | Admin |
|-----------|------|-------|
| `GET` — Liste complète | ❌ 403 | ✅ |
| `GET` — Sa propre facture | ✅ | ✅ |
| `POST` — Créer une facture | ❌ 403 | ✅ |
| `PATCH` — Marquer imprimée | ❌ 403 | ✅ |
| `GET` — PDF | ✅ (sa facture) | ✅ |

### Règlements (`/api/payments`)

| Opération | User | Admin |
|-----------|------|-------|
| `GET` — Liste complète | ❌ 403 | ✅ |
| `GET` — Son propre règlement | ✅ | ✅ |
| `POST` / `DELETE` | ❌ 403 | ✅ |

### Statistiques (`/api/stats`)

| Opération | User | Admin |
|-----------|------|-------|
| `GET` | ❌ 403 | ✅ |

---

## Promouvoir un congressiste en admin

Seul un admin peut modifier les rôles via `PATCH /api/attendees/{id}` :

```http
PATCH /api/attendees/42
Authorization: Bearer <token_admin>
Content-Type: application/merge-patch+json

{
  "roles": ["ROLE_ADMIN"]
}
```

Pour rétrograder en user simple, passer `"roles": []` (ROLE_USER est toujours attribué automatiquement).

---

## Protection anti-escalade

Un congressiste ne peut **pas** modifier ses propres rôles, même s'il patch son propre profil.
La vérification est faite dans `AttendeeStateProcessor` : si les rôles changent et que l'appelant n'est pas admin → `403 Access Denied`.

---

## Implémentation technique

- **Symfony Security** : expressions `is_granted()` sur les opérations API Platform
- **Groupes de sérialisation** :
  - `attendee:write` — champs modifiables par tout utilisateur authentifié
  - `attendee:admin:write` — champs supplémentaires réservés à l'admin (`roles`)
- **`AttendeeStateProcessor`** — vérifie les changements de rôles + hashe le mot de passe
