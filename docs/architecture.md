# Store Owner Portal — Architecture Blueprint

## 1. System Overview

The Store Owner Portal is a multi-tenant SaaS application that allows merchants to configure stores, manage catalogs, control inventory, customize storefront themes, fulfill orders, and query business intelligence using an auditable AI assistant.

```
+-----------------------------------------------------------+
|                      Client Layer                         |
|  [Store Owner Admin Portal]      [Customer Storefront]    |
+-----------------------------+-----------------------------+
                              | HTTPS / JSON API
+-----------------------------v-----------------------------+
|                      API Gateway                          |
|  - Rate Limiter      - Request ID      - CORS & Security  |
|  - Auth Middleware   - Store Resolver  - RBAC Policy      |
+-----------------------------+-----------------------------+
                              |
+-----------------------------v-----------------------------+
|                     Domain Modules                        |
|  Auth, Stores, Products, Inventory, Orders, Themes, AI    |
+-----------------------------+-----------------------------+
                              |
+-----------------------------v-----------------------------+
|                    Persistence & Jobs                     |
|  - MongoDB (Multi-Tenant Scoped Collections)              |
|  - Redis Cache / BullMQ Job Queue                         |
+-----------------------------------------------------------+
```

## 2. Multi-Tenancy Strategy

- **Logical Partitioning**: Every collection (except root `users`) contains a mandatory `storeId: ObjectId` indexed field.
- **Contextual Tenant Resolver**: Inbound requests resolve store context via `x-store-id` header or domain/slug lookup.
- **Tenant Query Wrappers**: Database queries pass through `tenantQuery(storeId, filter)` to guarantee tenant isolation.

## 3. High-Integrity Order State Machine

Orders follow an immutable transition lifecycle:
`PENDING` -> `PAYMENT_PROCESSING` -> `PAID` -> `PROCESSING` -> `FULFILLED` -> `COMPLETED`
Terminal failure branches include `CANCELLED` and `REFUNDED` with automatic inventory return movements.
