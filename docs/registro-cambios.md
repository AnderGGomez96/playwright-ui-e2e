# Registro de cambios

Formato `C-###`. Cada entrada resume alcance, archivos, verificación y
resultado. La evidencia cruda vive en `.local/evidencia/C-###/` (ignorada
por git).

---

## C-001 — 2026-09-28 — Puesta a punto del repo

- **Alcance**:
  - Análisis del producto (estructura, stack, sistema de healing) y llenado
    de la sección PRODUCTO de `AGENTS.md`.
  - `.gitignore`: se ignoran `.opencode/`, `AGENTS.md`, `.env*`,
    `.healing/`, `patches/`, `tests/playwright/.auth/` y `.local/`.
  - `playwright.config.ts`: `dotenv.config()` activo (el `.env` no se estaba
    cargando en los runners).
  - `README.md`: reescrito para el producto (venía del ambiente base
    `opencode-env`).
  - Git: rama `main` + remoto privado `AnderGGomez96/playwright-ui-e2e` +
    rama de integración `develop`.
- **Archivos**: `AGENTS.md`, `.gitignore`, `playwright.config.ts`,
  `README.md`, `docs/registro-cambios.md`.
- **Verificación**:
  - `npx playwright test --list` carga el config y `.env` (19 variables,
    `HEAL_ENGINE=systemone`): 9 tests listados.
  - `npx tsc --noEmit` mantiene los 5 errores conocidos (D-001, sin
    regresión).
- **Deuda derivada**: D-001 a D-004 documentadas en `AGENTS.md`.
- **Evidencia**: `.local/evidencia/C-001/`.

---

## C-002 — 2026-09-28 — Limpieza de código muerto

- **Alcance**: eliminación de `src/healing/fixtures.ts` (fixture duplicado) y
  `src/healing/systemone-batch-resolver.ts` (resolver batch sin consumidores);
  imports/locales/parámetros sin uso; bloques de código comentado; `await`
  faltante en `NavbarComponent.navbarOption`; corrección de
  `cartLocators.product` (regex de slug y fallback CSS inválido); skill de
  producto actualizada.
- **Archivos**: `src/**`, `tests/e2e_guest/**`,
  `.opencode/skills/playwright-ui-e2e/*`, `AGENTS.md`.
- **Verificación**: `npx tsc --noEmit --noUnusedLocals --noUnusedParameters`
  muestra solo D-001; `npx playwright test --list` = 9 tests; corrida real
  guest: 4 passed / 3 failed conocidos (D-002, D-003, D-005; sin regresión);
  selector de `cartLocators.product` validado en vivo (carrito vacío, sin
  error de sintaxis).
- **Deuda derivada**: D-005 (dato `Madames`).
- **Evidencia**: `.local/evidencia/C-002/`.

---

## C-003 — 2026-09-30/10-01 — Módulo auth (login y registro)

- **Alcance**: 19 escenarios auth (L-01..L-07, R-01..R-12) implementados
  como 19 tests en `tests/e2e_guest/auth/`; datos de prueba
  (`SEEDED_USER`, `buildUniqueUser()`, `SIGNUP_DOB`, `SIGNUP_COUNTRY`);
  locators H-06 de login (7 keys) y registro (29 keys); POM `LoginPage`
  (14 métodos) y `SignupPage` (paso 1, paso 2, alta, borrado, validaciones
  nativas); D-002 resuelto (proyecto `setup` + `auth.setup.spec.ts` con
  `SEEDED_USER` y `storageState`); D-001 resuelto en el working tree
  (`tests/e2e_auth/cart/cart.spec.ts`, se commitea en C5).
- **Archivos**: `src/constant/test-data.ts`,
  `src/locators/login.locators.ts`, `src/locators/signup.locators.ts`,
  `src/pages/login.page.ts`, `src/pages/signup.page.ts`,
  `src/fixtures/base.ts`, `tests/e2e_guest/auth/login.spec.ts`,
  `tests/e2e_guest/auth/signup.spec.ts`,
  `tests/setup/auth.setup.spec.ts`, `playwright.config.ts`.
- **Verificación**: módulo auth `--workers=2` = **19/19**; corrida limpia
  de primarios = 205 eventos, 34 keys, 100 % `primary`/`chain`,
  `autoRecoveries = 0`, sin IA/caché ni parches auth; suite guest
  `--workers=2` = 23 tests, **22 passed / 1 failed** (solo D-005), 38.4 s,
  0 × HTTP 504; segunda pasada con workers por defecto (10) = 22/1, 13.6 s;
  `npx tsc --noEmit` = **0**; `setup` real e idempotente genera
  `user.json` (2 cookies del dominio) y `chromium-logged` = 2 passed;
  muestreo `created-user.json` 5/5 (R-07, R-08, R-10, R-11, R-12).
- **Resultado**: sin regresión (único fallo: D-005, fuera de alcance); 0
  fallos nuevos. Correcciones de spec registradas: AC-08.2/R-09 al
  comportamiento real del select de país (precargado `India`), aditivo
  `*FieldTypeMismatch()` en design §2 y fusión de R-06 en un test para
  conservar 19 escenarios.
- **Seguridad**: `revision-seguridad` sin hallazgos bloqueantes (1
  observación aceptada: credenciales seeded en `test-data.ts`, cuenta demo
  de sitio público, repo privado).
- **Deuda**: D-004 y D-005 intactas (fuera de alcance); observaciones
  menores de auditoría (`accountInformationHeading` sin consumidor,
  `titleMrs` sin cobertura, contraseña fija de `buildUniqueUser`).
- **Evidencia**: `.local/evidencia/C-003/` (`resumen.md`,
  `revision-seguridad.md`, `playwright-guest-workers2.txt`,
  `playwright-guest-default-workers.txt`, `tsc-noemit.txt`,
  `healing-t15-summary.txt`, `created-user-sample.txt`, `git-status.txt`,
  `product-cart-mtimes.txt`) y
  `.local/evidencia/evidencia-evaluacion-2026-10-01.md`.
