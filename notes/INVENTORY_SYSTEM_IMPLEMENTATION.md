# 📦 Sistema de Inventario - Guía de Implementación

**Proyecto:** Sazonarte API  
**Módulo:** Sistema de Inventario de Menú  
**Fecha:** Octubre 2025  
**Rama:** `feat/inventory-system`

---

## 📋 Índice

1. [Estrategia Git](#estrategia-git)
2. [Fase 1: Inventario Básico](#fase-1-inventario-básico)
3. [Fase 2: Ingredientes y Recetas](#fase-2-ingredientes-y-recetas)
4. [Fase 3: Reportes](#fase-3-reportes)
5. [Testing](#testing)
6. [Deployment](#deployment)

---

## 🔀 ESTRATEGIA GIT

### **Estructura de Ramas**

```
main (producción)
  ↓
develop (desarrollo)
  ↓
feat/inventory-system (feature principal)
  ├── feat/inventory-basic (Fase 1)
  ├── feat/inventory-ingredients (Fase 2)
  └── feat/inventory-reports (Fase 3)
```

### **Convención de Commits**

Siguiendo el patrón que ya usas en el proyecto:

```
<type>(<scope>): <subject>

Types:
- feat      → Nueva funcionalidad
- refactor  → Refactorización de código
- fix       → Corrección de bugs
- docs      → Documentación
- test      → Tests
- chore     → Tareas de mantenimiento

Scope:
- inventory
- menu-items
- ingredients
- recipes
- reports

Ejemplos:
✅ feat(inventory): add stock tracking to MenuItem model
✅ refactor(menu-items): extract stock logic to separate service
✅ feat(inventory): implement daily stock reset endpoint
✅ test(inventory): add unit tests for stock adjustment
✅ docs(inventory): add swagger documentation for stock endpoints
```

---

### **Paso a Paso con Git**

#### **PASO 0: Preparación Inicial**

```bash
# 1. Asegurarte de estar en develop (o main según tu flujo)
git checkout develop
git pull origin develop

# 2. Crear rama principal del feature
git checkout -b feat/inventory-system

# 3. Crear rama para Fase 1
git checkout -b feat/inventory-basic
```

---

#### **Durante el Desarrollo**

**Commits frecuentes y atómicos:**

```bash
# Después de cada cambio significativo
git add <archivos específicos>
git commit -m "feat(inventory): add inventoryType field to MenuItem"

# NO hacer:
git add .
git commit -m "changes"  ❌

# SÍ hacer:
git add prisma/schema.prisma
git commit -m "feat(inventory): add stock fields to MenuItem model"

git add src/api/v1/menus/items/item.validator.ts
git commit -m "feat(inventory): add stock validation schemas"
```

**Ejemplo de secuencia de commits para Fase 1:**

```bash
# Commit 1: Base de datos
git add prisma/schema.prisma
git commit -m "feat(inventory): add stock tracking fields to MenuItem"

# Commit 2: Migración
git add prisma/migrations/
git commit -m "feat(inventory): create migration for stock fields"

# Commit 3: Modelo de ajustes
git add prisma/schema.prisma
git commit -m "feat(inventory): add StockAdjustment model"

# Commit 4: Tipos
git add src/types/prisma.types.ts
git commit -m "feat(inventory): add MenuItemWithStock type"

# Commit 5: Validators
git add src/api/v1/menus/items/item.validator.ts
git commit -m "feat(inventory): add stock adjustment validators"

# Commit 6: Repository
git add src/api/v1/menus/items/item.repository.ts
git commit -m "feat(inventory): add stock management methods to repository"

# Commit 7: Service
git add src/api/v1/menus/items/item.service.ts
git commit -m "feat(inventory): add stock adjustment business logic"

# Commit 8: Controller
git add src/api/v1/menus/items/item.controller.ts
git commit -m "feat(inventory): add stock management endpoints"

# Commit 9: Routes
git add src/api/v1/menus/items/item.route.ts
git commit -m "feat(inventory): add stock management routes"

# Commit 10: Integración con Orders
git add src/api/v1/orders/order.service.ts
git commit -m "feat(inventory): integrate auto-deduct stock on order creation"

# Commit 11: Documentación
git add docs/menus/items/
git commit -m "docs(inventory): add swagger documentation for stock endpoints"

# Commit 12: Tests
git add src/api/v1/menus/items/__tests__/
git commit -m "test(inventory): add unit tests for stock management"
```

---

#### **Integración de Fases**

```bash
# Al terminar Fase 1
git checkout feat/inventory-system
git merge feat/inventory-basic
git push origin feat/inventory-system

# Crear Pull Request: feat/inventory-basic -> feat/inventory-system
# Título: "feat(inventory): Basic stock tracking implementation (Phase 1)"

# Después de aprobar y mergear, crear Fase 2
git checkout feat/inventory-system
git checkout -b feat/inventory-ingredients

# Repetir el proceso...
```

---

#### **Pull Request a Develop/Main**

```bash
# Cuando todas las fases estén completas
git checkout feat/inventory-system
git push origin feat/inventory-system

# Crear Pull Request en GitHub:
# feat/inventory-system -> develop

# Título: "feat(inventory): Complete inventory management system"
# Descripción: Ver template abajo
```

**Template de Pull Request:**

```markdown
## 📦 Sistema de Inventario

### Descripción
Implementación completa del sistema de gestión de inventario para items del menú.

### Cambios Principales
- ✅ Control de stock diario para platos pre-preparados
- ✅ Auto-bloqueo de items agotados
- ✅ Descuento automático en órdenes
- ✅ Seguimiento de ingredientes y recetas
- ✅ Reportes administrativos
- ✅ Historial de ajustes de stock

### Modelos Nuevos
- `StockAdjustment` - Historial de cambios de stock
- `Ingredient` - Catálogo de ingredientes
- `Recipe` - Recetas de platos
- `RecipeIngredient` - Ingredientes por receta

### Endpoints Nuevos
**Stock Management:**
- `POST /api/v1/items/stock/daily-reset`
- `POST /api/v1/items/:id/stock/add`
- `POST /api/v1/items/:id/stock/remove`
- `GET /api/v1/items/low-stock`
- `GET /api/v1/items/out-of-stock`

**Ingredients:**
- `GET /api/v1/ingredients`
- `POST /api/v1/ingredients`
- Etc...

### Migración de Base de Datos
⚠️ **Requiere migración:** Sí
- Nuevos campos en `MenuItem`
- Nuevas tablas: `stock_adjustments`, `ingredients`, `recipes`, `recipe_ingredients`

### Testing
- ✅ Tests unitarios: Repository, Service, Controller
- ✅ Tests de integración: Flujos completos
- ✅ Coverage: 85%+

### Checklist
- [ ] Código revisado y funcionando
- [ ] Tests pasando
- [ ] Documentación Swagger actualizada
- [ ] README actualizado si es necesario
- [ ] Sin conflictos con develop
- [ ] Migración probada

### Cómo Probar
1. Ejecutar migración: `npm run prisma:migrate`
2. Ejecutar seeds: `npm run prisma:seed`
3. Iniciar servidor: `npm run dev`
4. Probar endpoints en Swagger: `http://localhost:3000/api/v1/docs`
5. Flujo completo:
   - Registrar stock inicial
   - Crear orden
   - Verificar descuento automático
   - Verificar bloqueo al agotarse

### Screenshots
(Agregar screenshots de Swagger, dashboard, etc.)
```

---

## 🚀 FASE 1: INVENTARIO BÁSICO

**Objetivo:** Control básico de stock diario con auto-bloqueo

**Rama:** `feat/inventory-basic`

**Duración estimada:** 3-5 días

---

### **DÍA 1: Base de Datos y Modelos**

#### **1.1. Actualizar Schema de Prisma**

**Archivo:** `prisma/schema.prisma`

**Ubicación:** Modelo `MenuItem` (línea ~215)

```prisma
model MenuItem {
  id         Int          @id @default(autoincrement())
  categoryId Int          @map("category_id")
  category   MenuCategory @relation(fields: [categoryId], references: [id])

  name        String
  description String?
  price       Decimal @db.Decimal(10, 2)
  isExtra     Boolean @default(false) @map("is_extra")
  isAvailable Boolean @default(true) @map("is_available")
  imageUrl    String? @map("image_url")

  // ========================================
  // ✅ AGREGAR ESTOS CAMPOS
  // ========================================
  inventoryType     String  @default("UNLIMITED") // "TRACKED" | "UNLIMITED"
  stockQuantity     Int?    // Cantidad disponible actual
  initialStock      Int?    // Cantidad inicial del día
  lowStockAlert     Int?    @default(5) @map("low_stock_alert")
  autoMarkUnavailable Boolean @default(true) @map("auto_mark_unavailable")

  // Relaciones inversas
  dailyMenuOptions DailyMenuOption[]
  orderItems       OrderItem[]
  stockAdjustments StockAdjustment[] // ← Nueva relación

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  deleted   Boolean   @default(false)
  deletedAt DateTime? @map("deleted_at")

  @@unique([categoryId, name])
  @@map("menu_items")
}
```

**Ubicación:** Después del modelo `MenuItem`, agregar nuevo modelo:

```prisma
// ========================================
// ✅ NUEVO MODELO
// ========================================
model StockAdjustment {
  id              String   @id @default(uuid())
  menuItemId      Int      @map("menu_item_id")
  menuItem        MenuItem @relation(fields: [menuItemId], references: [id])

  adjustmentType  String   // "DAILY_RESET" | "MANUAL_ADD" | "ORDER_DEDUCT" | "MANUAL_REMOVE" | "ORDER_CANCELLED"
  previousStock   Int      @map("previous_stock")
  newStock        Int      @map("new_stock")
  quantity        Int      // Cambio (+/-)

  reason          String?
  userId          String?  @map("user_id")
  orderId         String?  @map("order_id")

  createdAt       DateTime @default(now()) @map("created_at")

  @@map("stock_adjustments")
}
```

**Commit:**
```bash
git add prisma/schema.prisma
git commit -m "feat(inventory): add stock tracking fields to MenuItem model"
```

---

#### **1.2. Crear Migración**

```bash
npx prisma migrate dev --name add_inventory_system

# Revisar la migración generada
cat prisma/migrations/<timestamp>_add_inventory_system/migration.sql
```

**Commit:**
```bash
git add prisma/migrations/
git commit -m "feat(inventory): create migration for inventory system"
```

---

#### **1.3. Actualizar Tipos de TypeScript**

**Archivo:** `src/types/prisma.types.ts`

**Agregar al final:**

```typescript
// ============================================
// INVENTORY TYPES
// ============================================

/**
 * MenuItem con información de stock incluida
 */
export type MenuItemWithStock = MenuItem & {
  stockAdjustments?: StockAdjustment[];
};

/**
 * Tipos de inventario
 */
export enum InventoryType {
  TRACKED = "TRACKED",     // Control de stock
  UNLIMITED = "UNLIMITED"  // Sin límite (bebidas)
}

/**
 * Tipos de ajuste de stock
 */
export enum StockAdjustmentType {
  DAILY_RESET = "DAILY_RESET",           // Inicio del día
  MANUAL_ADD = "MANUAL_ADD",             // Admin agrega stock
  MANUAL_REMOVE = "MANUAL_REMOVE",       // Admin quita stock (merma)
  ORDER_DEDUCT = "ORDER_DEDUCT",         // Orden confirmada
  ORDER_CANCELLED = "ORDER_CANCELLED",   // Orden cancelada (reversa)
  AUTO_BLOCKED = "AUTO_BLOCKED"          // Auto-bloqueado por stock 0
}
```

**Commit:**
```bash
git add src/types/prisma.types.ts
git commit -m "feat(inventory): add inventory type definitions"
```

---

### **DÍA 2: Validators**

#### **2.1. Actualizar Item Validator**

**Archivo:** `src/api/v1/menus/items/item.validator.ts`

**Agregar al final (antes de los exports de tipos):**

```typescript
/**
 * Schema para registro de stock inicial diario
 */
export const dailyStockResetSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        itemId: z.number().int().positive("Item ID must be positive"),
        quantity: z.number().int().min(0, "Quantity must be 0 or greater"),
        lowStockAlert: z.number().int().min(0).optional()
      })
    ).min(1, "At least one item must be provided")
  })
});

/**
 * Schema para ajustar stock manualmente (agregar)
 */
export const addStockSchema = z.object({
  params: idParamsSchema,
  body: z.object({
    quantity: z.number().int().positive("Quantity must be positive"),
    reason: z.string().min(3, "Reason must be at least 3 characters").optional()
  })
});

/**
 * Schema para ajustar stock manualmente (quitar)
 */
export const removeStockSchema = z.object({
  params: idParamsSchema,
  body: z.object({
    quantity: z.number().int().positive("Quantity must be positive"),
    reason: z.string().min(3, "Reason must be at least 3 characters")
  })
});

/**
 * Schema para configurar tipo de inventario
 */
export const inventoryTypeSchema = z.object({
  params: idParamsSchema,
  body: z.object({
    inventoryType: z.enum(["TRACKED", "UNLIMITED"]),
    lowStockAlert: z.number().int().min(0).optional()
  })
});

/**
 * Schema para query params de stock history
 */
export const stockHistorySchema = z.object({
  params: idParamsSchema,
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20)
  })
});
```

**Agregar exports de tipos:**

```typescript
export type DailyStockResetInput = z.infer<typeof dailyStockResetSchema>["body"];
export type AddStockInput = z.infer<typeof addStockSchema>["body"];
export type RemoveStockInput = z.infer<typeof removeStockSchema>["body"];
export type InventoryTypeInput = z.infer<typeof inventoryTypeSchema>["body"];
export type StockHistoryParams = z.infer<typeof stockHistorySchema>["query"];
```

**Commit:**
```bash
git add src/api/v1/menus/items/item.validator.ts
git commit -m "feat(inventory): add stock management validation schemas"
```

---

### **DÍA 3: Repository**

#### **3.1. Actualizar Item Repository**

**Archivo:** `src/api/v1/menus/items/item.repository.ts`

**Agregar al final de la clase (antes del export):**

```typescript
/**
 * Actualiza el stock de un item
 */
async updateStock(
  id: number,
  quantity: number,
  adjustmentType: string,
  reason?: string,
  userId?: string,
  orderId?: string
): Promise<MenuItem> {
  const item = await prisma.menuItem.findUnique({ where: { id } });
  
  if (!item) {
    throw new Error(`MenuItem with id ${id} not found`);
  }

  const previousStock = item.stockQuantity ?? 0;
  const newStock = previousStock + quantity;

  // Actualizar el item y crear registro de ajuste en transacción
  const [updatedItem] = await prisma.$transaction([
    prisma.menuItem.update({
      where: { id },
      data: {
        stockQuantity: newStock,
        // Auto-bloquear si llega a 0
        isAvailable: item.autoMarkUnavailable && newStock <= 0 ? false : item.isAvailable
      }
    }),
    prisma.stockAdjustment.create({
      data: {
        menuItemId: id,
        adjustmentType,
        previousStock,
        newStock,
        quantity,
        reason,
        userId,
        orderId
      }
    })
  ]);

  return updatedItem;
}

/**
 * Registra stock inicial del día para múltiples items
 */
async dailyStockReset(items: Array<{ itemId: number; quantity: number; lowStockAlert?: number }>): Promise<void> {
  await prisma.$transaction(
    items.map(item =>
      prisma.menuItem.update({
        where: { id: item.itemId },
        data: {
          stockQuantity: item.quantity,
          initialStock: item.quantity,
          lowStockAlert: item.lowStockAlert,
          isAvailable: true
        }
      })
    )
  );

  // Crear registros de ajuste
  await prisma.stockAdjustment.createMany({
    data: items.map(item => ({
      menuItemId: item.itemId,
      adjustmentType: "DAILY_RESET",
      previousStock: 0,
      newStock: item.quantity,
      quantity: item.quantity,
      reason: "Inicio del día"
    }))
  });
}

/**
 * Obtiene items con stock bajo
 */
async getLowStock(): Promise<MenuItem[]> {
  return prisma.menuItem.findMany({
    where: {
      inventoryType: "TRACKED",
      deleted: false,
      stockQuantity: {
        lte: prisma.menuItem.fields.lowStockAlert
      }
    }
  });
}

/**
 * Obtiene items agotados
 */
async getOutOfStock(): Promise<MenuItem[]> {
  return prisma.menuItem.findMany({
    where: {
      inventoryType: "TRACKED",
      deleted: false,
      stockQuantity: 0
    }
  });
}

/**
 * Obtiene historial de ajustes de stock de un item
 */
async getStockHistory(
  itemId: number,
  page: number,
  limit: number
): Promise<PaginatedResponse<StockAdjustment>> {
  const skip = (page - 1) * limit;

  const [adjustments, total] = await Promise.all([
    prisma.stockAdjustment.findMany({
      where: { menuItemId: itemId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma.stockAdjustment.count({
      where: { menuItemId: itemId }
    })
  ]);

  return createPaginatedResponse(adjustments, total, { page, limit });
}

/**
 * Configura el tipo de inventario de un item
 */
async setInventoryType(
  id: number,
  inventoryType: string,
  lowStockAlert?: number
): Promise<MenuItem> {
  return prisma.menuItem.update({
    where: { id },
    data: {
      inventoryType,
      lowStockAlert,
      // Si cambia a UNLIMITED, resetear stock
      ...(inventoryType === "UNLIMITED" && {
        stockQuantity: null,
        initialStock: null
      })
    }
  });
}
```

**Commit:**
```bash
git add src/api/v1/menus/items/item.repository.ts
git commit -m "feat(inventory): add stock management methods to repository"
```

---

### **DÍA 4: Service**

#### **4.1. Actualizar Item Service**

**Archivo:** `src/api/v1/menus/items/item.service.ts`

**Agregar al final de la clase:**

```typescript
/**
 * Registra stock inicial del día
 */
async dailyStockReset(data: DailyStockResetInput): Promise<void> {
  // Validar que todos los items existan
  const itemIds = data.items.map(i => i.itemId);
  const existingItems = await Promise.all(
    itemIds.map(id => this.itemRepository.findById(id))
  );

  const notFound = itemIds.filter((id, idx) => !existingItems[idx]);
  if (notFound.length > 0) {
    throw new CustomError(
      `Items not found: ${notFound.join(", ")}`,
      HttpStatus.NOT_FOUND,
      "ITEMS_NOT_FOUND"
    );
  }

  // Validar que los items sean tipo TRACKED
  const nonTracked = existingItems.filter(
    (item, idx) => item && item.inventoryType !== "TRACKED"
  );
  if (nonTracked.length > 0) {
    throw new CustomError(
      "Only TRACKED items can have stock reset",
      HttpStatus.BAD_REQUEST,
      "INVALID_INVENTORY_TYPE"
    );
  }

  await this.itemRepository.dailyStockReset(data.items);
}

/**
 * Agrega stock manualmente
 */
async addStock(id: number, data: AddStockInput, userId?: string): Promise<MenuItem> {
  const item = await this.findItemByIdOrFail(id);

  if (item.inventoryType !== "TRACKED") {
    throw new CustomError(
      "Cannot add stock to UNLIMITED items",
      HttpStatus.BAD_REQUEST,
      "INVALID_INVENTORY_TYPE"
    );
  }

  return this.itemRepository.updateStock(
    id,
    data.quantity,
    "MANUAL_ADD",
    data.reason,
    userId
  );
}

/**
 * Quita stock manualmente (merma, daños)
 */
async removeStock(id: number, data: RemoveStockInput, userId?: string): Promise<MenuItem> {
  const item = await this.findItemByIdOrFail(id);

  if (item.inventoryType !== "TRACKED") {
    throw new CustomError(
      "Cannot remove stock from UNLIMITED items",
      HttpStatus.BAD_REQUEST,
      "INVALID_INVENTORY_TYPE"
    );
  }

  if ((item.stockQuantity ?? 0) < data.quantity) {
    throw new CustomError(
      "Insufficient stock to remove",
      HttpStatus.BAD_REQUEST,
      "INSUFFICIENT_STOCK"
    );
  }

  return this.itemRepository.updateStock(
    id,
    -data.quantity,
    "MANUAL_REMOVE",
    data.reason,
    userId
  );
}

/**
 * Descuenta stock al confirmar orden
 */
async deductStockForOrder(itemId: number, quantity: number, orderId: string): Promise<void> {
  const item = await this.itemRepository.findById(itemId);

  if (!item || item.inventoryType !== "TRACKED") {
    return; // No hacer nada si no es TRACKED
  }

  if ((item.stockQuantity ?? 0) < quantity) {
    throw new CustomError(
      `Insufficient stock for ${item.name}. Available: ${item.stockQuantity}, Required: ${quantity}`,
      HttpStatus.BAD_REQUEST,
      "INSUFFICIENT_STOCK"
    );
  }

  await this.itemRepository.updateStock(
    itemId,
    -quantity,
    "ORDER_DEDUCT",
    `Order ${orderId}`,
    undefined,
    orderId
  );
}

/**
 * Revierte stock al cancelar orden
 */
async revertStockForOrder(itemId: number, quantity: number, orderId: string): Promise<void> {
  const item = await this.itemRepository.findById(itemId);

  if (!item || item.inventoryType !== "TRACKED") {
    return;
  }

  await this.itemRepository.updateStock(
    itemId,
    quantity,
    "ORDER_CANCELLED",
    `Order ${orderId} cancelled`,
    undefined,
    orderId
  );
}

/**
 * Obtiene items con stock bajo
 */
async getLowStock(): Promise<MenuItem[]> {
  return this.itemRepository.getLowStock();
}

/**
 * Obtiene items agotados
 */
async getOutOfStock(): Promise<MenuItem[]> {
  return this.itemRepository.getOutOfStock();
}

/**
 * Obtiene historial de stock de un item
 */
async getStockHistory(
  id: number,
  params: StockHistoryParams
): Promise<PaginatedResponse<StockAdjustment>> {
  await this.findItemByIdOrFail(id);
  return this.itemRepository.getStockHistory(id, params.page, params.limit);
}

/**
 * Configura tipo de inventario
 */
async setInventoryType(id: number, data: InventoryTypeInput): Promise<MenuItem> {
  await this.findItemByIdOrFail(id);
  return this.itemRepository.setInventoryType(id, data.inventoryType, data.lowStockAlert);
}
```

**Commit:**
```bash
git add src/api/v1/menus/items/item.service.ts
git commit -m "feat(inventory): add stock management business logic to service"
```

---

### **DÍA 5: Controller y Routes**

#### **5.1. Actualizar Item Controller**

**Archivo:** `src/api/v1/menus/items/item.controller.ts`

**Agregar al final de la clase:**

```typescript
/**
 * POST /items/stock/daily-reset
 * Registra stock inicial del día
 */
dailyStockReset = asyncHandler(async (req: Request, res: Response) => {
  const data: DailyStockResetInput = req.body;

  await itemService.dailyStockReset(data);

  res.status(HttpStatus.OK).json({
    success: true,
    message: "Daily stock reset successfully"
  });
});

/**
 * POST /items/:id/stock/add
 * Agrega stock manualmente
 */
addStock = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const data: AddStockInput = req.body;
  const userId = req.user?.id;

  const item = await itemService.addStock(id, data, userId);

  res.status(HttpStatus.OK).json({
    success: true,
    message: "Stock added successfully",
    data: item
  });
});

/**
 * POST /items/:id/stock/remove
 * Quita stock manualmente
 */
removeStock = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const data: RemoveStockInput = req.body;
  const userId = req.user?.id;

  const item = await itemService.removeStock(id, data, userId);

  res.status(HttpStatus.OK).json({
    success: true,
    message: "Stock removed successfully",
    data: item
  });
});

/**
 * GET /items/low-stock
 * Obtiene items con stock bajo
 */
getLowStock = asyncHandler(async (_req: Request, res: Response) => {
  const items = await itemService.getLowStock();

  res.status(HttpStatus.OK).json({
    success: true,
    message: "Low stock items fetched successfully",
    data: items
  });
});

/**
 * GET /items/out-of-stock
 * Obtiene items agotados
 */
getOutOfStock = asyncHandler(async (_req: Request, res: Response) => {
  const items = await itemService.getOutOfStock();

  res.status(HttpStatus.OK).json({
    success: true,
    message: "Out of stock items fetched successfully",
    data: items
  });
});

/**
 * GET /items/:id/stock/history
 * Obtiene historial de ajustes de stock
 */
getStockHistory = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const params: StockHistoryParams = req.query as any;

  const history = await itemService.getStockHistory(id, params);

  res.status(HttpStatus.OK).json({
    success: true,
    message: "Stock history fetched successfully",
    data: history
  });
});

/**
 * PATCH /items/:id/inventory-type
 * Configura tipo de inventario
 */
setInventoryType = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const data: InventoryTypeInput = req.body;

  const item = await itemService.setInventoryType(id, data);

  res.status(HttpStatus.OK).json({
    success: true,
    message: "Inventory type updated successfully",
    data: item
  });
});
```

**Commit:**
```bash
git add src/api/v1/menus/items/item.controller.ts
git commit -m "feat(inventory): add stock management endpoints to controller"
```

---

#### **5.2. Actualizar Item Routes**

**Archivo:** `src/api/v1/menus/items/item.route.ts`

**Agregar antes de las rutas existentes:**

```typescript
// ========================================
// STOCK MANAGEMENT ROUTES
// ========================================

/**
 * POST /items/stock/daily-reset
 * Registra stock inicial del día
 */
router.post(
  "/stock/daily-reset",
  authJwt,
  validate(dailyStockResetSchema),
  itemController.dailyStockReset
);

/**
 * GET /items/low-stock
 * Obtiene items con stock bajo
 */
router.get(
  "/low-stock",
  authJwt,
  itemController.getLowStock
);

/**
 * GET /items/out-of-stock
 * Obtiene items agotados
 */
router.get(
  "/out-of-stock",
  authJwt,
  itemController.getOutOfStock
);

/**
 * POST /items/:id/stock/add
 * Agrega stock manualmente
 */
router.post(
  "/:id/stock/add",
  authJwt,
  validate(addStockSchema),
  itemController.addStock
);

/**
 * POST /items/:id/stock/remove
 * Quita stock manualmente
 */
router.post(
  "/:id/stock/remove",
  authJwt,
  validate(removeStockSchema),
  itemController.removeStock
);

/**
 * GET /items/:id/stock/history
 * Historial de ajustes de stock
 */
router.get(
  "/:id/stock/history",
  authJwt,
  validate(stockHistorySchema),
  itemController.getStockHistory
);

/**
 * PATCH /items/:id/inventory-type
 * Configura tipo de inventario
 */
router.patch(
  "/:id/inventory-type",
  authJwt,
  validate(inventoryTypeSchema),
  itemController.setInventoryType
);
```

**Commit:**
```bash
git add src/api/v1/menus/items/item.route.ts
git commit -m "feat(inventory): add stock management routes"
```

---

#### **5.3. Integrar con Orders**

**Archivo:** `src/api/v1/orders/order.service.ts`

**En el método de crear orden, agregar:**

```typescript
async createOrder(data: CreateOrderInput): Promise<Order> {
  // ... código existente ...

  // ========================================
  // ✅ AGREGAR ESTO ANTES DE CREAR LA ORDEN
  // ========================================
  // Validar stock de items TRACKED
  for (const item of data.items) {
    const menuItem = await menuItemService.findById(item.menuItemId);
    
    if (menuItem.inventoryType === "TRACKED") {
      if ((menuItem.stockQuantity ?? 0) < item.quantity) {
        throw new CustomError(
          `Insufficient stock for ${menuItem.name}`,
          HttpStatus.BAD_REQUEST,
          "INSUFFICIENT_STOCK"
        );
      }
    }
  }

  // Crear la orden
  const order = await this.orderRepository.create(data);

  // ========================================
  // ✅ AGREGAR ESTO DESPUÉS DE CREAR LA ORDEN
  // ========================================
  // Descontar stock
  for (const item of data.items) {
    await menuItemService.deductStockForOrder(
      item.menuItemId,
      item.quantity,
      order.id
    );
  }

  return order;
}
```

**En el método de cancelar orden, agregar:**

```typescript
async cancelOrder(id: string): Promise<Order> {
  const order = await this.findOrderByIdOrFail(id);

  // ... validaciones existentes ...

  // ========================================
  // ✅ AGREGAR ESTO ANTES DE CANCELAR
  // ========================================
  // Revertir stock
  for (const item of order.items) {
    await menuItemService.revertStockForOrder(
      item.menuItemId,
      item.quantity,
      order.id
    );
  }

  // Cancelar la orden
  return this.orderRepository.cancel(id);
}
```

**Commit:**
```bash
git add src/api/v1/orders/order.service.ts
git commit -m "feat(inventory): integrate auto-deduct stock on order creation"
```

---

### **DÍA 5 (continuación): Documentación Swagger**

#### **6.1. Crear documentación de Stock**

**Crear archivo:** `docs/menus/items/stock.yaml`

```yaml
openapi: 3.0.0
paths:
  /items/stock/daily-reset:
    post:
      tags:
        - Menu Items - Stock
      summary: Registrar stock inicial del día
      description: |
        Registra la cantidad de porciones preparadas al inicio del día.
        Solo aplica para items con inventoryType = "TRACKED".
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                items:
                  type: array
                  items:
                    type: object
                    properties:
                      itemId:
                        type: integer
                      quantity:
                        type: integer
                      lowStockAlert:
                        type: integer
            example:
              items:
                - itemId: 1
                  quantity: 30
                  lowStockAlert: 5
                - itemId: 2
                  quantity: 25
                  lowStockAlert: 5
      responses:
        200:
          description: Stock inicial registrado
        400:
          description: Datos inválidos
        401:
          description: No autenticado

  /items/{id}/stock/add:
    post:
      tags:
        - Menu Items - Stock
      summary: Agregar stock manualmente
      description: Incrementa el stock de un item (producción adicional)
      security:
        - BearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                quantity:
                  type: integer
                reason:
                  type: string
            example:
              quantity: 15
              reason: "Producción adicional medio día"
      responses:
        200:
          description: Stock agregado exitosamente
        404:
          description: Item no encontrado

  /items/{id}/stock/remove:
    post:
      tags:
        - Menu Items - Stock
      summary: Quitar stock manualmente
      description: Reduce el stock de un item (merma, daño)
      security:
        - BearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - quantity
                - reason
              properties:
                quantity:
                  type: integer
                reason:
                  type: string
            example:
              quantity: 3
              reason: "Platos se dañaron"
      responses:
        200:
          description: Stock removido exitosamente

  /items/low-stock:
    get:
      tags:
        - Menu Items - Stock
      summary: Listar items con stock bajo
      description: Items que llegaron al umbral de alerta
      security:
        - BearerAuth: []
      responses:
        200:
          description: Items con stock bajo

  /items/out-of-stock:
    get:
      tags:
        - Menu Items - Stock
      summary: Listar items agotados
      description: Items con stock = 0
      security:
        - BearerAuth: []
      responses:
        200:
          description: Items agotados

  /items/{id}/stock/history:
    get:
      tags:
        - Menu Items - Stock
      summary: Historial de ajustes de stock
      description: Ver todos los cambios de stock de un item
      security:
        - BearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: integer
        - in: query
          name: page
          schema:
            type: integer
            default: 1
        - in: query
          name: limit
          schema:
            type: integer
            default: 20
      responses:
        200:
          description: Historial obtenido

  /items/{id}/inventory-type:
    patch:
      tags:
        - Menu Items - Stock
      summary: Configurar tipo de inventario
      description: Define si el item tiene stock rastreado o ilimitado
      security:
        - BearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                inventoryType:
                  type: string
                  enum: [TRACKED, UNLIMITED]
                lowStockAlert:
                  type: integer
            example:
              inventoryType: "TRACKED"
              lowStockAlert: 5
      responses:
        200:
          description: Tipo de inventario actualizado
```

**Commit:**
```bash
git add docs/menus/items/stock.yaml
git commit -m "docs(inventory): add swagger documentation for stock endpoints"
```

---

### **✅ FINALIZAR FASE 1**

```bash
# Verificar que todo funciona
npm run dev

# Probar en Swagger
# http://localhost:3000/api/v1/docs

# Push de la rama
git push origin feat/inventory-basic

# Crear Pull Request en GitHub
# Título: "feat(inventory): Basic stock tracking (Phase 1)"
```

---

## 🧪 TESTING

### **Tests Unitarios**

**Crear:** `src/api/v1/menus/items/__tests__/item-stock.service.test.ts`

```typescript
describe('ItemService - Stock Management', () => {
  describe('dailyStockReset', () => {
    it('should reset stock for tracked items', async () => {
      // Test implementation
    });

    it('should throw error for non-existent items', async () => {
      // Test implementation
    });

    it('should not reset stock for unlimited items', async () => {
      // Test implementation
    });
  });

  describe('deductStockForOrder', () => {
    it('should deduct stock when order is created', async () => {
      // Test implementation
    });

    it('should throw error if insufficient stock', async () => {
      // Test implementation
    });
  });

  describe('revertStockForOrder', () => {
    it('should revert stock when order is cancelled', async () => {
      // Test implementation
    });
  });
});
```

**Commit:**
```bash
git add src/api/v1/menus/items/__tests__/
git commit -m "test(inventory): add unit tests for stock management"
```

---

## 📦 DEPLOYMENT

### **Checklist de Pre-Deploy**

```bash
# 1. Asegurar que todas las migraciones están aplicadas
npm run prisma:migrate

# 2. Ejecutar seeds si es necesario
npm run prisma:seed

# 3. Ejecutar tests
npm test

# 4. Build de producción
npm run build

# 5. Verificar que no hay errores de TypeScript
npx tsc --noEmit
```

### **Variables de Entorno**

Agregar a `.env.example`:

```env
# Inventory Configuration
INVENTORY_LOW_STOCK_ALERT_DEFAULT=5
INVENTORY_AUTO_BLOCK_ON_ZERO=true
```

---

## 📊 MÉTRICAS DE ÉXITO

Al finalizar la Fase 1, deberías poder:

- ✅ Registrar stock inicial del día
- ✅ Ver dashboard con items agotados y con stock bajo
- ✅ Crear órdenes que descuentan stock automáticamente
- ✅ Ver items bloqueados cuando se agotan
- ✅ Ajustar stock manualmente (agregar/quitar)
- ✅ Ver historial de ajustes de stock
- ✅ Configurar items como TRACKED o UNLIMITED

---

## 🎯 SIGUIENTES FASES

**Fase 2:** Ingredientes y Recetas (separar en otro documento cuando esté listo)

**Fase 3:** Reportes Administrativos (separar en otro documento cuando esté listo)

---

## 📞 CONTACTO

Si tienes dudas durante la implementación:
- Revisar esta guía
- Revisar ejemplos en otros módulos (users, profiles, roles)
- Consultar documentación de Prisma/Zod/Express

---

**Última actualización:** Octubre 2025  
**Autor:** Equipo Sazonarte  
**Versión:** 1.0.0
