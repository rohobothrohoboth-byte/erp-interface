# Cor.CRM [PerAuth] pilot — Postman checks

Rebuild **Auth** and **Cor.CRM** from this branch. Admin bypass (`Admin` / `super_admin`) remains in effect.

## What changed

1. **Common.PermissionRegistry.CanonicalKeys** — shared 1374-key list (seeders ∪ legacy). Bit indices are identical in every service that calls `PermissionMap.InitializeFromCanonical()`.
2. **Auth** initializes from CanonicalKeys (logs DB drift; does not diverge indices).
3. **Cor.CRM** initializes from CanonicalKeys (no Auth HTTP call at startup).
4. Protected endpoints:
   - Routing: `crm.settings.routing.{view,add,mod,del}`
   - Scoring: `crm.settings.scoring.{view,add,mod,del}`
   - Leads: `crm.leads.list.*`, `crm.leads.conversion.convert`, `crm.leads.bulk.*`, `crm.leads.assigned.view`, `crm.leads.routing.view`

> Lead Sources / Statuses / Email Templates UI is still localStorage-only — no CRM controllers to decorate yet. Add `[PerAuth]` when those APIs exist.

## Prep

1. Start Auth, then Cor.CRM. CRM log should show:  
   `Permission registry initialized from Common with 1374 permissions`
2. Auth log: `Permission registry initialized from Common canonical keys (1374 permissions)`
3. After changing a user's permissions, **re-login** so JWT `ph` is rebuilt.

## A. Registry sanity (Auth)

`GET {{auth}}/api/auth/v1/Permission/Registry`  
Expect `data.count` = 1374 and `data.source` = `Common.PermissionRegistry.CanonicalKeys`.

`GET {{auth}}/api/auth/v1/Permission/MyPermissionCheck/crm.settings.routing.view`  
(with Bearer token) — `granted: true/false` matches assignment.

## B. Cross-service 200 / 403 (Cor.CRM)

Base: `{{crm}}/api/core/crm/v1.0`

| User | Call | Expect |
|------|------|--------|
| Admin / super_admin | `GET /Routing/Rules` | **200** (bypass) |
| Non-admin **with** `crm.settings.routing.view` | `GET /Routing/Rules` | **200** |
| Non-admin **without** that permission | `GET /Routing/Rules` | **403** |
| Non-admin with `crm.settings.scoring.view` | `GET /Scoring/Rules` | **200** |
| Non-admin without it | `GET /Scoring/Rules` | **403** |
| Non-admin with `crm.leads.list.view` | `GET /Lead/AllLeads` | **200** |
| Non-admin without it | `GET /Lead/AllLeads` | **403** |
| Non-admin without `crm.leads.list.add` | `POST /Lead/AddLead` | **403** |
| No / expired token | any of the above | **401** |

Mutations (add/mod/del) use the matching `.add` / `.mod` / `.del` keys the same way.

## C. Suggested test users

1. **admin** — role Admin → always 200 on protected routes.
2. **crm-reader** — only `crm.settings.routing.view`, `crm.settings.scoring.view`, `crm.leads.list.view`.
3. **crm-denied** — authenticated, no CRM settings/leads permissions → 403 on all pilot routes.
