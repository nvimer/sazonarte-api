# ⚡ Referencia Rápida - Sistema de Inventario

**Para:** Consulta rápida diaria  
**Tip:** Imprime o ten a mano mientras desarrollas

---

## 🚀 COMANDOS MÁS USADOS

```bash
# Ver estado
git status

# Commit
git add <archivo>
git commit -m "feat(inventory): <descripción>"

# Push
git push origin <rama-actual>

# Actualizar
git pull origin <rama-actual>

# Ver log
git log --oneline -10
```

---

## 📝 TEMPLATE DE COMMIT

```
feat(inventory): add stock tracking to MenuItem

✅ Add stockQuantity field
✅ Add initialStock field
✅ Add inventoryType field
```

---

## 🌳 ESTRUCTURA DE ARCHIVOS

```
src/api/v1/menus/items/
├── item.validator.ts      ← Agregar schemas
├── item.repository.ts     ← Agregar métodos de BD
├── item.service.ts        ← Agregar lógica de negocio
├── item.controller.ts     ← Agregar endpoints
├── item.route.ts          ← Agregar rutas
└── __tests__/
    └── item-stock.service.test.ts  ← Agregar tests

prisma/
└── schema.prisma          ← Modificar modelos

docs/menus/items/
└── stock.yaml             ← Documentación Swagger

src/types/
└── prisma.types.ts        ← Agregar tipos
```

---

## 📋 ORDEN DE IMPLEMENTACIÓN

```
1. ✅ Schema Prisma (modelos)
2. ✅ Migración (npx prisma migrate dev)
3. ✅ Tipos TypeScript
4. ✅ Validators (Zod schemas)
5. ✅ Repository (queries de BD)
6. ✅ Service (lógica de negocio)
7. ✅ Controller (endpoints)
8. ✅ Routes (rutas)
9. ✅ Integración con Orders
10. ✅ Documentación Swagger
11. ✅ Tests
```

---

## 🔄 FLUJO DIARIO

```
┌──────────────────────────────────────┐
│ MAÑANA                               │
├──────────────────────────────────────┤
│ git pull origin <rama>               │
│ git status                           │
│ npm run dev                          │
└──────────────────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│ DESARROLLO                           │
├──────────────────────────────────────┤
│ Hacer cambios                        │
│ git add <archivos>                   │
│ git commit -m "..."                  │
│ Repetir...                           │
└──────────────────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│ NOCHE                                │
├──────────────────────────────────────┤
│ git status (verificar)               │
│ git push origin <rama>               │
└──────────────────────────────────────┘
```

---

## ✅ CHECKLIST PRE-COMMIT

```
[ ] Código compila (npm run build)
[ ] Tests pasan (npm test)
[ ] Sin console.logs
[ ] Mensaje de commit claro
[ ] Solo archivos relevantes
```

---

## 🎯 COMMITS ATÓMICOS

**❌ MAL (1 commit gigante):**
```bash
git add .
git commit -m "feat(inventory): inventory system"
```

**✅ BIEN (commits pequeños):**
```bash
git add prisma/schema.prisma
git commit -m "feat(inventory): add stock fields to MenuItem"

git add src/types/prisma.types.ts
git commit -m "feat(inventory): add inventory type definitions"

git add src/api/v1/menus/items/item.validator.ts
git commit -m "feat(inventory): add stock validation schemas"
```

---

## 🔥 EMERGENCIAS

### **Deshacer último commit (manteniendo cambios)**
```bash
git reset --soft HEAD~1
```

### **Descartar cambios en archivo**
```bash
git checkout -- <archivo>
```

### **Guardar cambios temporalmente**
```bash
git stash
# hacer algo
git stash pop
```

### **Ver qué cambió**
```bash
git diff <archivo>
```

---

## 📊 NOMBRES DE RAMAS

```
feat/inventory-system          ← Rama principal
feat/inventory-basic           ← Fase 1
feat/inventory-ingredients     ← Fase 2
feat/inventory-reports         ← Fase 3
```

---

## 🎨 PREFIJOS DE COMMIT

```
feat      → Nueva funcionalidad
fix       → Corrección de bug
refactor  → Refactorización
docs      → Documentación
test      → Tests
chore     → Mantenimiento
style     → Formato
perf      → Performance
```

---

## 📁 ARCHIVOS A MODIFICAR (Fase 1)

### **Base de Datos**
- [x] `prisma/schema.prisma` - Modelos

### **Backend Core**
- [x] `src/types/prisma.types.ts` - Tipos
- [x] `src/api/v1/menus/items/item.validator.ts` - Validators
- [x] `src/api/v1/menus/items/item.repository.ts` - Repository
- [x] `src/api/v1/menus/items/item.service.ts` - Service
- [x] `src/api/v1/menus/items/item.controller.ts` - Controller
- [x] `src/api/v1/menus/items/item.route.ts` - Routes

### **Integración**
- [x] `src/api/v1/orders/order.service.ts` - Integración

### **Documentación**
- [x] `docs/menus/items/stock.yaml` - Swagger

### **Tests**
- [x] `src/api/v1/menus/items/__tests__/` - Tests

---

## 🧪 COMANDOS DE TESTING

```bash
# Todos los tests
npm test

# Watch mode
npm run test:watch

# Con coverage
npm run test:coverage

# Solo un archivo
npm test item-stock.service.test.ts
```

---

## 🔧 COMANDOS DE PRISMA

```bash
# Crear migración
npx prisma migrate dev --name <nombre>

# Ver estado de migraciones
npx prisma migrate status

# Ver BD en UI
npx prisma studio

# Regenerar client
npx prisma generate

# Ver schema
cat prisma/schema.prisma
```

---

## 📊 ENDPOINTS A CREAR (Fase 1)

```
POST   /api/v1/items/stock/daily-reset
POST   /api/v1/items/:id/stock/add
POST   /api/v1/items/:id/stock/remove
GET    /api/v1/items/low-stock
GET    /api/v1/items/out-of-stock
GET    /api/v1/items/:id/stock/history
PATCH  /api/v1/items/:id/inventory-type
```

---

## 🎯 OBJETIVOS DIARIOS

### **Día 1**
- [ ] Schema Prisma
- [ ] Migración
- [ ] Tipos TypeScript

### **Día 2**
- [ ] Validators completos

### **Día 3**
- [ ] Repository completo

### **Día 4**
- [ ] Service completo

### **Día 5**
- [ ] Controller + Routes
- [ ] Integración Orders
- [ ] Documentación Swagger

### **Testing**
- [ ] Tests unitarios
- [ ] Tests integración
- [ ] PR y merge

---

## 💡 TIPS

```
✅ Commit frecuente (cada 1-2 horas)
✅ Push al final del día (backup)
✅ Lee el código antes de commit
✅ Usa git diff para revisar cambios
✅ Prueba antes de push
✅ Pide code review
```

---

## 🚨 NUNCA HAGAS

```
❌ git add .
❌ git commit -m "changes"
❌ git push --force en develop/main
❌ Commit de .env
❌ Commit de node_modules/
❌ Commit de código que no compila
```

---

## 📱 ATAJOS ÚTILES

```bash
# Alias útiles (agregar a ~/.bashrc o ~/.zshrc)
alias gs='git status'
alias ga='git add'
alias gc='git commit -m'
alias gp='git push'
alias gl='git log --oneline -10'
alias gd='git diff'
```

---

## 🎨 EJEMPLO COMPLETO

```bash
# 1. Empezar feature
git checkout develop
git pull origin develop
git checkout -b feat/inventory-basic

# 2. Hacer cambios
# Modificar prisma/schema.prisma

# 3. Commit
git add prisma/schema.prisma
git commit -m "feat(inventory): add stock fields to MenuItem model"

# 4. Migración
npx prisma migrate dev --name add_inventory_fields
git add prisma/migrations/
git commit -m "feat(inventory): create migration for stock fields"

# 5. Continuar con validators
# Modificar item.validator.ts
git add src/api/v1/menus/items/item.validator.ts
git commit -m "feat(inventory): add stock validation schemas"

# ... etc

# 6. Push al final del día
git push origin feat/inventory-basic

# 7. Crear PR cuando termines
```

---

## 📞 AYUDA

**¿Perdido?**
```bash
git status  # Ver dónde estás
git branch --show-current  # Ver rama actual
```

**¿Qué he hecho?**
```bash
git log --oneline -10  # Ver últimos commits
git diff  # Ver cambios
```

**¿Cómo deshago?**
```bash
git reset --soft HEAD~1  # Deshacer último commit
git checkout -- <file>   # Descartar cambios
```

---

## 📚 ARCHIVOS DE REFERENCIA

```
/notes/
├── INVENTORY_SYSTEM_IMPLEMENTATION.md  ← Guía completa
├── GIT_WORKFLOW_GUIDE.md               ← Git detallado
└── QUICK_REFERENCE.md                  ← Esta guía
```

---

**Tip Final:** Imprime esta página y tenla cerca mientras trabajas 📄✨

---

**Última actualización:** Octubre 2025
