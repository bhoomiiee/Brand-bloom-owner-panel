# API Specification & Routing

All backend API routes follow RESTful conventions under `/api/v1`.

## Endpoints Summary

### Auth & User (`/api/v1/auth`)
- `POST /register`: Create account
- `POST /login`: Authenticate and receive JWT tokens
- `POST /refresh-token`: Refresh expired access token
- `POST /forgot-password` & `POST /reset-password`: Password recovery

### Stores & Onboarding (`/api/v1/stores`, `/api/v1/onboarding`)
- `GET /stores`: List merchant stores
- `POST /stores`: Create store
- `GET /stores/:id`: Store profile
- `POST /onboarding/draft`: Save onboarding draft
- `POST /onboarding/complete`: Finalize store onboarding

### Catalog & Inventory (`/api/v1/products`, `/api/v1/inventory`)
- `GET /products`: List products with pagination, search & filters
- `POST /products`: Create product and variants
- `PUT /products/:id`: Update product
- `GET /inventory`: Low stock alert list & stock levels
- `POST /inventory/adjust`: Manual stock adjustment with movement audit

### Orders & Checkout (`/api/v1/orders`, `/api/v1/checkout`)
- `POST /checkout/calculate`: Compute line items, taxes, and shipping
- `POST /checkout/submit`: Finalize order & initiate payment
- `GET /orders`: Filter orders by status & date range
- `PATCH /orders/:id/status`: Advance order status via state machine

### Assistant (`/api/v1/assistant`)
- `POST /assistant/query`: Run validated natural language BI question with audit log & evidence breakdown.
