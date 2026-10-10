# Audited AI Assistant Engine

## Design Principles
1. **Zero Hallucination Tolerance**: Metrics and revenue numbers are never generated from generative weights. All calculations are executed via Approved Deterministic Queries against verified database aggregates.
2. **Deterministic Intent Classification**: Intent queries are mapped to registered metric definitions:
   - `revenue`
   - `paid-order-count`
   - `average-order-value`
   - `sales-by-product`
   - `low-stock-products`
3. **Evidence Builder**: Every assistant response includes verifiable figures:
   - Exact query parameters (date range, product filters)
   - Raw database aggregation results
   - Timestamp of metric generation
4. **Answer Validation**: Before returning to user, `answer-validator.service.ts` asserts that every number mentioned in the generated text directly correlates with the returned metric figures.
