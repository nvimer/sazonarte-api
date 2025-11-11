# 🔀 Git Workflow - Sistema de Inventario

**Proyecto:** Sazonarte API  
**Feature:** Sistema de Inventario

---

## 📊 RESUMEN RÁPIDO

```bash
# RESUMEN DEL FLUJO
feat/inventory-system (rama principal del feature)
  ├── feat/inventory-basic (Fase 1 - 3-5 días)
  ├── feat/inventory-ingredients (Fase 2 - 3-4 días)
  └── feat/inventory-reports (Fase 3 - 2-3 días)
```

**Estrategia:** Feature Branch Workflow con Pull Requests

---

## 🚀 INICIO RÁPIDO

### **Setup Inicial**

```bash
# 1. Asegurarte de estar actualizado
git checkout develop  # o main, según tu flujo
git pull origin develop

# 2. Crear rama principal del feature
git checkout -b feat/inventory-system

# 3. Crear rama de trabajo para Fase 1
git checkout -b feat/inventory-basic

# 4. Empezar a trabajar...
```

---

## 📝 CONVENCIÓN DE COMMITS

### **Formato**

```
<type>(<scope>): <subject>

<body> (opcional)

<footer> (opcional)
```

### **Types**

| Type | Cuándo usar | Ejemplo |
|------|-------------|---------|
| `feat` | Nueva funcionalidad | `feat(inventory): add stock tracking` |
| `fix` | Corrección de bug | `fix(inventory): prevent negative stock` |
| `refactor` | Refactorización | `refactor(inventory): extract stock logic` |
| `docs` | Documentación | `docs(inventory): add swagger docs` |
| `test` | Tests | `test(inventory): add stock service tests` |
| `chore` | Mantenimiento | `chore(inventory): update dependencies` |
| `style` | Formato de código | `style(inventory): fix linting issues` |
| `perf` | Mejora de performance | `perf(inventory): optimize stock queries` |

### **Scopes**

```
inventory          → General del módulo
menu-items         → Relacionado con items
ingredients        → Relacionado con ingredientes
recipes           → Relacionado con recetas
reports           → Relacionado con reportes
orders            → Integración con órdenes
```

### **Examples**

```bash
# ✅ BUENOS COMMITS
git commit -m "feat(inventory): add stockQuantity field to MenuItem model"
git commit -m "feat(inventory): implement daily stock reset endpoint"
git commit -m "fix(inventory): prevent stock from going negative"
git commit -m "refactor(inventory): move stock logic to separate service"
git commit -m "test(inventory): add unit tests for stock adjustments"
git commit -m "docs(inventory): add swagger documentation for stock API"

# ❌ MALOS COMMITS
git commit -m "changes"
git commit -m "fix"
git commit -m "update code"
git commit -m "wip"
```

---

## 🌳 ESTRUCTURA DE RAMAS

### **Modelo de Ramas**

```
main/master (producción)
  ↓
develop (desarrollo)
  ↓
feat/inventory-system (feature principal)
  ↓
feat/inventory-basic (sub-feature)
```

### **Naming Convention**

```
feat/<nombre-descriptivo>      → Nueva funcionalidad
fix/<nombre-del-bug>           → Corrección de bug
refactor/<nombre-refactor>     → Refactorización
hotfix/<nombre-urgente>        → Corrección urgente en producción
```

---

## 📅 FLUJO DIARIO

### **Al Empezar el Día**

```bash
# 1. Ver en qué rama estás
git branch --show-current

# 2. Actualizar la rama
git pull origin feat/inventory-basic

# 3. Ver el estado
git status

# 4. Empezar a trabajar...
```

---

### **Durante el Desarrollo**

```bash
# 1. Hacer cambios en archivos

# 2. Ver qué cambió
git status
git diff

# 3. Agregar archivos específicos (NO uses git add .)
git add prisma/schema.prisma
git add src/api/v1/menus/items/item.validator.ts

# 4. Commit con mensaje descriptivo
git commit -m "feat(inventory): add stock validation schemas"

# 5. Continuar trabajando...

# 6. Push frecuente (al menos al final del día)
git push origin feat/inventory-basic
```

---

### **Al Final del Día**

```bash
# 1. Verificar que no haya cambios sin commit
git status

# 2. Si hay cambios, commitear
git add <archivos>
git commit -m "feat(inventory): <descripción>"

# 3. Push para backup
git push origin feat/inventory-basic

# 4. (Opcional) Crear draft PR si quieres feedback temprano
```

---

## 🔄 INTEGRACIÓN DE FASES

### **Al Completar Fase 1**

```bash
# 1. Asegurarte de que todo está commiteado
git status
# Debe mostrar: "nothing to commit, working tree clean"

# 2. Push final
git push origin feat/inventory-basic

# 3. Ir a GitHub y crear Pull Request
# Base: feat/inventory-system
# Compare: feat/inventory-basic
# Título: "feat(inventory): Basic stock tracking (Phase 1)"

# 4. Esperar aprobación y merge

# 5. Actualizar rama principal
git checkout feat/inventory-system
git pull origin feat/inventory-system

# 6. Crear rama para Fase 2
git checkout -b feat/inventory-ingredients

# 7. Continuar con Fase 2...
```

---

### **Al Completar Todas las Fases**

```bash
# 1. Asegurarte de que todas las sub-features están mergeadas
git checkout feat/inventory-system
git log --oneline --graph

# 2. Push final
git push origin feat/inventory-system

# 3. Crear Pull Request a develop/main
# Base: develop (o main)
# Compare: feat/inventory-system
# Título: "feat(inventory): Complete inventory management system"

# 4. Esperar revisión y aprobación

# 5. Después del merge, actualizar local
git checkout develop
git pull origin develop

# 6. Borrar ramas locales (opcional)
git branch -d feat/inventory-system
git branch -d feat/inventory-basic
git branch -d feat/inventory-ingredients
git branch -d feat/inventory-reports
```

---

## 🔥 COMANDOS ÚTILES

### **Ver Estado**

```bash
# Ver rama actual
git branch --show-current

# Ver todas las ramas
git branch -a

# Ver últimos commits
git log --oneline -10

# Ver commits con gráfico
git log --oneline --graph --all

# Ver qué cambió
git status
git diff
```

---

### **Deshacer Cambios**

```bash
# Descartar cambios en un archivo (NO commiteado)
git checkout -- src/api/v1/menus/items/item.service.ts

# Deshacer último commit (mantiene cambios)
git reset --soft HEAD~1

# Deshacer último commit (BORRA cambios) ⚠️
git reset --hard HEAD~1

# Descartar todos los cambios locales ⚠️
git reset --hard HEAD
```

---

### **Stash (Guardar cambios temporalmente)**

```bash
# Guardar cambios sin commit
git stash

# Ver stashes guardados
git stash list

# Recuperar último stash
git stash pop

# Aplicar stash específico
git stash apply stash@{0}

# Borrar stash
git stash drop stash@{0}
```

---

### **Actualizar desde Develop**

```bash
# Si develop se actualizó mientras trabajabas
git checkout feat/inventory-basic
git fetch origin
git merge origin/develop

# O con rebase (más limpio)
git rebase origin/develop

# Si hay conflictos, resolverlos y:
git add <archivos-resueltos>
git rebase --continue
```

---

## 🚨 PROBLEMAS COMUNES

### **Problema 1: "Hice commit en la rama equivocada"**

```bash
# Ejemplo: Commiteaste en develop en lugar de tu feature branch

# 1. Anotar el hash del commit (git log)
git log --oneline -1
# Ejemplo: abc1234 feat(inventory): add stock tracking

# 2. Ir a la rama correcta
git checkout feat/inventory-basic

# 3. Cherry-pick el commit
git cherry-pick abc1234

# 4. Volver a develop y deshacer
git checkout develop
git reset --hard HEAD~1
```

---

### **Problema 2: "Conflictos al mergear"**

```bash
# 1. Git te dirá qué archivos tienen conflictos
git status

# 2. Abrir archivos y buscar:
<<<<<<< HEAD
código de tu rama
=======
código de la otra rama
>>>>>>> feat/inventory-basic

# 3. Resolver manualmente, borrar marcadores

# 4. Agregar archivos resueltos
git add <archivos>

# 5. Continuar merge
git merge --continue
# O si es rebase:
git rebase --continue
```

---

### **Problema 3: "Quiero descartar TODO y empezar de nuevo"**

```bash
# ⚠️ CUIDADO: Esto BORRA todos los cambios locales

# 1. Ver qué se va a borrar
git status

# 2. Si estás seguro
git reset --hard HEAD
git clean -fd

# 3. Actualizar desde remoto
git pull origin feat/inventory-basic
```

---

### **Problema 4: "Pushee algo por error"**

```bash
# Si NADIE más ha pulleado tu cambio:

# 1. Deshacer localmente
git reset --hard HEAD~1

# 2. Force push ⚠️
git push origin feat/inventory-basic --force

# ⚠️ NUNCA hagas force push en develop/main
# ⚠️ SOLO en tus feature branches
```

---

## 📋 CHECKLIST PRE-COMMIT

Antes de hacer commit, verifica:

- [ ] El código compila sin errores (`npm run build`)
- [ ] No hay errores de linting (`npm run eslint-check-only`)
- [ ] Los tests pasan (`npm test`)
- [ ] No hay console.logs o debuggers
- [ ] El commit message sigue la convención
- [ ] Solo commiteaste archivos relevantes (no `.env`, `node_modules`, etc.)

---

## 📋 CHECKLIST PRE-PUSH

Antes de hacer push, verifica:

- [ ] Todos los cambios están commiteados (`git status`)
- [ ] Los tests pasan
- [ ] La rama está actualizada con develop
- [ ] No hay conflictos
- [ ] El mensaje de commit es claro

---

## 📋 CHECKLIST PRE-PULL REQUEST

Antes de crear PR, verifica:

- [ ] Todos los commits están pusheados
- [ ] La rama base es correcta (feat/inventory-system o develop)
- [ ] El título del PR es descriptivo
- [ ] La descripción del PR está completa
- [ ] Los tests pasan
- [ ] La documentación está actualizada
- [ ] No hay archivos innecesarios
- [ ] Screenshots agregados (si aplica)

---

## 🎯 BUENAS PRÁCTICAS

### **DO ✅**

```bash
✅ Commits frecuentes (cada funcionalidad pequeña)
✅ Push diario (backup)
✅ Mensajes descriptivos
✅ Agregar archivos específicos
✅ Revisar git diff antes de commit
✅ Pull antes de empezar a trabajar
✅ Crear branch por feature
✅ Usar Pull Requests
✅ Pedir code review
```

### **DON'T ❌**

```bash
❌ git add . (agregar todo)
❌ git commit -m "changes" (mensaje genérico)
❌ Commits gigantes (1000+ líneas)
❌ Force push en develop/main
❌ Commit de archivos generados (dist/, node_modules/)
❌ Commit de .env o secretos
❌ Trabajar directamente en develop/main
❌ Ignorar conflictos
❌ Pushear código que no compila
```

---

## 📊 ESTRUCTURA DE PULL REQUEST

### **Título**

```
feat(inventory): Basic stock tracking implementation (Phase 1)
```

### **Descripción**

```markdown
## 📦 Sistema de Inventario - Fase 1

### Descripción
Implementación del control básico de stock para items del menú con tracking diario.

### Cambios Principales
- ✅ Agregados campos de stock a MenuItem (stockQuantity, initialStock, etc.)
- ✅ Creado modelo StockAdjustment para historial
- ✅ Implementados endpoints de gestión de stock
- ✅ Auto-descuento de stock al crear órdenes
- ✅ Auto-bloqueo cuando stock llega a 0
- ✅ Reversión de stock al cancelar órdenes

### Endpoints Nuevos
- `POST /api/v1/items/stock/daily-reset` - Registro inicial del día
- `POST /api/v1/items/:id/stock/add` - Agregar stock
- `POST /api/v1/items/:id/stock/remove` - Quitar stock
- `GET /api/v1/items/low-stock` - Items con stock bajo
- `GET /api/v1/items/out-of-stock` - Items agotados
- `GET /api/v1/items/:id/stock/history` - Historial de ajustes
- `PATCH /api/v1/items/:id/inventory-type` - Configurar tipo

### Migración de BD
⚠️ **Requiere migración**
```bash
npm run prisma:migrate
```

### Testing
- ✅ Unit tests: 15 tests agregados
- ✅ Integration tests: 8 tests agregados
- ✅ Coverage: 87%

### Documentación
- ✅ Swagger actualizado
- ✅ README actualizado
- ✅ Guía de implementación en `/notes`

### Checklist
- [x] Código funcionando
- [x] Tests pasando
- [x] Documentación actualizada
- [x] Sin conflictos
- [x] Linting OK
- [x] Build exitoso

### Cómo Probar
1. Ejecutar migración
2. Iniciar servidor
3. Ir a Swagger: http://localhost:3000/api/v1/docs
4. Probar flujo:
   - Registrar stock inicial
   - Crear orden
   - Verificar descuento automático

### Screenshots
(Agregar screenshots)

### Relacionado
- Issue #X: Sistema de inventario
- Documentación: `/notes/INVENTORY_SYSTEM_IMPLEMENTATION.md`
```

---

## 🔍 REVISAR CÓDIGO ANTES DE PR

```bash
# Ver todos los archivos modificados
git diff develop...feat/inventory-basic --name-only

# Ver cambios completos
git diff develop...feat/inventory-basic

# Ver commits que se van a incluir
git log develop..feat/inventory-basic --oneline

# Verificar que no hay archivos innecesarios
git status
```

---

## 📞 AYUDA RÁPIDA

### **Estoy Perdido**

```bash
# Ver dónde estás
pwd
git branch --show-current
git status

# Ver qué has hecho
git log --oneline -10

# Volver a un estado limpio
git stash  # Guarda cambios
git checkout develop
git pull origin develop
```

### **Necesito Ayuda**

```bash
# Ver ayuda de un comando
git help <comando>
git commit --help

# Ver opciones
git log --help
```

---

## 📚 RECURSOS

### **Git Docs**
- https://git-scm.com/doc

### **Git Cheat Sheet**
- https://education.github.com/git-cheat-sheet-education.pdf

### **Conventional Commits**
- https://www.conventionalcommits.org/

### **Git Flow**
- https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow

---

**Última actualización:** Octubre 2025  
**Autor:** Equipo Sazonarte  
**Versión:** 1.0.0
