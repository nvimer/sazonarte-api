# Code Optimization Plan

## Issue Identified: Inconsistent Prisma Client Usage

### Problem
Several repositories are using `prisma` directly instead of `getPrismaClient()`, which causes:
- Inconsistency across the codebase
- Potential issues with integration/E2E tests that need to use test database
- Difficulty in maintaining and testing

### Repositories to Update
1. ✅ `user.repository.ts` - Already updated
2. ❌ `order.repository.ts` - Needs update
3. ❌ `item.repository.ts` - Needs update
4. ❌ `role.repository.ts` - Needs update
5. ❌ `profile.repository.ts` - Needs update
6. ❌ `permission.repository.ts` - Needs update
7. ❌ `category.repository.ts` - Needs update
8. ❌ `table.repository.ts` - Needs update

### Benefits
- Consistent architecture across all repositories
- Proper test database support for integration/E2E tests
- Easier maintenance and testing
- Better separation of concerns

### Implementation Strategy
1. Update each repository to import and use `getPrismaClient()`
2. Replace all `prisma.` calls with `getPrismaClient().`
3. Update corresponding unit tests to mock `getPrismaClient()`
4. Verify all tests pass after changes
