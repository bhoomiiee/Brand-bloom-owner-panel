# MongoDB Database Schema Specification

Database Name: `store_owner_portal`

## Collections Overview

| Collection | Description | Primary Indexes |
|---|---|---|
| `users` | Global platform user profiles & credentials | `{ email: 1 }` (unique) |
| `sessions` | Active JWT refresh tokens & device tracking | `{ userId: 1 }`, `{ expiresAt: 1 }` (TTL) |
| `stores` | Store profile, currency, domain, settings | `{ slug: 1 }` (unique), `{ ownerId: 1 }` |
| `storeMemberships` | User roles per store (OWNER, ADMIN, STAFF) | `{ storeId: 1, userId: 1 }` (unique) |
| `categories` | Hierarchical category taxonomy | `{ storeId: 1, slug: 1 }` (unique) |
| `products` | Base product definitions & metadata | `{ storeId: 1, slug: 1 }`, `{ storeId: 1, isArchived: 1 }` |
| `productVariants` | Specific SKUs, prices, barcodes, attributes | `{ storeId: 1, sku: 1 }` (unique) |
| `inventories` | Stock on hand, reserved stock, safety thresholds | `{ storeId: 1, variantId: 1 }` (unique) |
| `inventoryMovements`| Stock movement audit trail (IN, OUT, RESERVED) | `{ storeId: 1, variantId: 1, createdAt: -1 }` |
| `orders` | Placed customer orders | `{ storeId: 1, orderNumber: 1 }`, `{ storeId: 1, status: 1 }` |
| `orderEvents` | Order state transition audit timeline | `{ orderId: 1, createdAt: 1 }` |
| `themes` | Built-in storefront theme templates | `{ slug: 1 }` |
| `storefrontConfigs` | Active store theme customization & sections | `{ storeId: 1 }` (unique) |
| `assistantQueryLogs`| Natural language BI queries, plan, evidence | `{ storeId: 1, createdAt: -1 }` |
