# 🔧 Correcciones de Tests - Explicación Detallada

## 📋 Resumen de Problemas

### Estado Actual
- **Tests pasando:** 358 ✅
- **Tests fallando:** 12 ❌
- **Build:** ✅ Sin errores

## 🔴 Problema 1: Error de Faker en Tests

### Error
```
SyntaxError: Cannot use import statement outside a module
at @faker-js/faker/dist/index.js
```

### Causa Raíz
1. **`@faker-js/faker` v10.2.0** usa ES modules (`"type": "module"` en package.json)
2. **Jest** por defecto espera CommonJS
3. El mock de faker no está siendo usado correctamente
4. La configuración de `transformIgnorePatterns` no está transformando correctamente el módulo

### Intentos de Solución
1. ✅ Agregar `@faker-js` a `transformIgnorePatterns` - No resolvió completamente
2. ✅ Eliminar mock de faker - No ayudó
3. ❌ Configurar `useESM: true` en ts-jest - Causó más problemas

### Solución Recomendada
**Opción A: Mock manual en cada test**
```typescript
jest.mock("@faker-js/faker", () => ({
  faker: {
    person: { firstName: () => "John", lastName: () => "Doe" },
    internet: { email: () => "test@test.com", password: () => "password123" },
    phone: { number: () => "1234567890" },
    location: { streetAddress: () => "123 Main St" },
    string: { alphanumeric: (n) => "a".repeat(n || 10) },
  },
}));
```

**Opción B: Actualizar Jest a versión que soporte ES modules mejor**
- Requiere actualizar dependencias
- Puede romper otros tests

**Opción C: Usar versión anterior de faker (v8) que usa CommonJS**
- No recomendado, perdería features nuevas

### Tests Afectados
- `auth.service.test.ts` ❌
- `order.integration.test.ts` ❌  
- `order.e2e.test.ts` ❌

---

## 🔴 Problema 2: Stock Integration Tests - Items No Encontrados

### Error
```
CustomError: Menu Item ID X not found
at ItemService.setInventoryType
```

### Causa Raíz
1. El item se crea en el test usando `testPrisma.menuItem.create()`
2. `itemService.setInventoryType()` usa `getPrismaClient()` que devuelve el cliente de test
3. Dentro de la transacción, `findByIdForUpdate` no encuentra el item
4. **Posible causa:** El cliente de test no tiene extensiones de soft delete, entonces `findFirst` con `deleted: false` puede no estar funcionando correctamente
5. **Otra posible causa:** Problema de sincronización - el item se crea pero la transacción no lo ve

### Cambios Realizados
```typescript
// ANTES:
const item = await tx.menuItem.findUnique({
  where: { id: itemId },
});
if (!item || item.deleted) return null;

// DESPUÉS:
const item = await tx.menuItem.findFirst({
  where: {
    id: itemId,
    deleted: false,
  },
});
```

**Razón del cambio:**
- `findFirst` permite filtrar por campos no únicos como `deleted`
- Necesario porque el cliente de test no tiene extensiones de soft delete

### Problema Persistente
El cambio no resolvió el problema. El item sigue sin encontrarse.

### Posibles Soluciones
1. **Verificar que el cliente de test esté conectado:**
   ```typescript
   // En el test, asegurar conexión antes de crear items
   await connectTestDatabase();
   ```

2. **Usar el mismo cliente en test y service:**
   ```typescript
   // En lugar de getPrismaClient(), pasar testPrisma directamente
   ```

3. **Agregar extensiones de soft delete al cliente de test:**
   - Similar a como está en `src/database/prisma.ts`
   - Requiere refactorizar `test-database.ts`

4. **Debuggear con logs:**
   ```typescript
   // Agregar logs para ver qué está pasando
   console.log('Item ID:', item.id);
   console.log('Client:', client === testPrisma);
   ```

### Tests Afectados
- `stock.integration.test.ts` - 12 tests fallando ❌

---

## ✅ Cambios Aplicados

### 1. Jest Configuration
```typescript
transformIgnorePatterns: [
  "node_modules/(?!(@faker-js|.*\\.mjs$))",
],
```
- Permite que Jest transforme módulos ES de faker
- **Estado:** Parcialmente efectivo

### 2. Item Repository - findByIdForUpdate
```typescript
async findByIdForUpdate(tx, itemId) {
  const item = await tx.menuItem.findFirst({
    where: { id: itemId, deleted: false },
  });
  return item;
}
```
- Cambio de `findUnique` a `findFirst` para compatibilidad con cliente de test
- **Estado:** No resolvió completamente el problema

---

## 🎯 Recomendaciones

### Prioridad Alta
1. **Resolver problema de faker:**
   - Implementar mock manual en tests que lo necesiten
   - O investigar configuración de Jest para ES modules

2. **Resolver problema de stock integration:**
   - Agregar logs para debuggear
   - Verificar sincronización de datos
   - Considerar agregar extensiones al cliente de test

### Prioridad Media
- Revisar otros tests de integración que puedan tener problemas similares
- Documentar mejor el setup de tests de integración

---

## 📝 Notas Técnicas

### Faker ES Modules
- `@faker-js/faker@10.2.0` es un módulo ES puro
- Jest necesita transformarlo a CommonJS
- La configuración actual no es suficiente

### Prisma Test Client
- El cliente de test no tiene las extensiones de soft delete
- Esto causa inconsistencias en cómo se filtran los datos
- `findFirst` debería funcionar, pero hay algo más

---

**Última actualización:** 2025-01-16
