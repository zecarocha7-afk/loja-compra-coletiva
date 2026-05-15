# Security Specification - Compra Coletiva PMMG

## Data Invariants
1. A user profile must belong to the authenticated user and have a valid role ('militar', 'administrador', 'fornecedor').
2. Products and Kits must be associated with a valid vendor.
3. Orders must be linked to the user who created them.
4. Only administrators can update the status of orders or manage vendor/product catalogs.
5. All timestamps (`createdAt`, `updatedAt`) must be server-generated.

## The Dirty Dozen Payloads

1. **Identity Spoofing (Users)**: Attempt to create a user profile with a UID that doesn't match the auth UID.
2. **Privilege Escalation**: Attempt to update own role to 'administrador'.
3. **Ghost Field (Users)**: Attempt to inject `isVerifiedApp: true` into a user profile.
4. **Identity Spoofing (Orders)**: Attempt to create an order for a different `userId`.
5. **State Shortcut (Orders)**: Attempt to create an order directly with status 'Concluído'.
6. **Unauthorized Update (Orders)**: A non-admin user trying to update `trackingNumber` or `status` of an order.
7. **Resource Poisoning (Orders)**: Injecting a 1MB junk string into `id` or `status`.
8. **Malicious Catalog Entry**: A non-admin/non-authorized user trying to create a product for a random vendor.
9. **PII Leak**: An authenticated user trying to 'get' another user's private profile.
10. **Query Scraping**: An authenticated user trying to list all orders without a `where` clause on `userId` (unless they are admin).
11. **Immortal Field Violation**: Attempting to change `createdAt` on an order update.
12. **Relational Orphan**: Creating an order for a product that doesn't exist (though Firestore doesn't enforce this natively, we can check for existence of related docs in some cases or at least validate structure).

## Test Runner (firestore.rules.test.ts)
*Note: This is a representation of the tests to be run.*

```typescript
// Example test cases
describe('Firestore Security Rules', () => {
  it('should deny creating a user profile with a different UID', async () => { ... });
  it('should deny updating role to administrator', async () => { ... });
  it('should deny creating an order for another user', async () => { ... });
  it('should deny non-admin status updates on orders', async () => { ... });
});
```
