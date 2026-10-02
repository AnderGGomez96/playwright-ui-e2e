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

---

## C-004 — 2026-10-01 — D-006: selectores estables sin duplicación

- **Alcance**: observación de la usuaria sobre selectores `data-qa` escritos
  como literales dentro del POM. Se declaran una sola vez en `src/locators/`
  como `loginStableSelectors` / `signupStableSelectors`; los candidatos `css`
  de los `LocatorSpec` y las aserciones de ausencia de los POM/fixtures las
  consumen por referencia (las ausencias siguen sin healer, contrato H-01).
  El fixture `cartWithProduct` reemplaza su CSS crudo por
  `healer.resolve(cartLocators.product('Blue Top'))`.
- **Gobernanza**: regla y guard escritos en la skill `playwright-ui-e2e`
  (SKILL, `locators.md`, `writing-tests.md`), en los agentes `dev`, `tester`
  y `auditor`, y en `AGENTS.md`; backlog **BL-011 (P1)** para el
  `healer.locator(spec)` sin resolución.
- **Archivos**: `src/locators/login.locators.ts`,
  `src/locators/signup.locators.ts`, `src/pages/login.page.ts`,
  `src/pages/signup.page.ts`, `src/fixtures/base.ts` (+ `.opencode/`,
  `AGENTS.md` y backlog locales, no commiteables).
- **Verificación**: guard de selectores literales en POM/fixtures = **0**;
  `npx tsc --noEmit` = **0**; módulo auth `--workers=2` = **19/19**;
  carrito invitado/logueado verde con la fila resuelta por healer.
- **Incidencia registrada (D-007)**: el test de producto "Winter Top" falla
  de forma intermitente por crash de sesión del navegador
  (`Protocol error ... session closed`); reproducido también con las fuentes
  anteriores a D-006 (corrida de control) y no reproducible en sondas
  directas. Pasa al módulo producto (BL-001).
- **Evidencia**: `.local/evidencia/C-004/` (`resumen.md`,
  `guard-selectores.txt`, `tsc.txt`, `auth-workers2.txt`,
  `guest-workers2*.txt`, `control-pre-d006.txt`, `product-*.txt`).

---

## C-005 — 2026-10-01 — Throttle paramétrico para sitio bajo carga

- **Alcance**: el sitio externo responde "bajo carga" y las corridas
  paralelas fallan (D-007). Se agrega pausa entre tests configurable con
  `E2E_TEST_DELAY_MS` (auto-fixture en `src/fixtures/base.ts`; `0` default) y
  workers configurables con `E2E_WORKERS` (`playwright.config.ts`).
- **Documentación**: `AGENTS.md` (claves de entorno + comando canónico),
  skill `playwright-ui-e2e` (`debugging.md`), claves comentadas en `.env`.
- **Verificación**: delay de 8000 ms aplicado 2× (20.2 s) y a 0 (sin efecto);
  `E2E_WORKERS=1` fuerza 1 worker; suite guest con throttle
  (`workers=1`, `delay=2500`) = **22 passed / 1 failed** (solo D-005), sin el
  crash de "Winter Top"; `npx tsc --noEmit` = 0.
- **Resultado**: D-007 mitigado operativamente (correr throttled mientras el
  sitio esté cargado); sin cambios de comportamiento por defecto.
- **Evidencia**: `.local/evidencia/C-005/` (`resumen.md`, `delay-off.txt`,
  `delay-on-2000.txt`, `delay-on-8000.txt`, `workers-env.txt`,
  `guest-throttled.txt`).

---

## C-006 — 2026-10-01 — Legibilidad de negocio en specs auth

- **Alcance**: convención de legibilidad (título en español con ID,
  `test.step` "Cuando/Entonces/Y", mensaje de negocio en cada `expect`,
  `subtitle` v1.63) escrita en la skill `playwright-ui-e2e`
  (`writing-tests.md` + regla 9), `AGENTS.md` y agentes dev/tester/auditor;
  aplicada a `tests/e2e_guest/auth/login.spec.ts` y `signup.spec.ts` sin
  cambiar comportamiento.
- **Verificación**: 2 corridas 19/19; diff vs HEAD solo presentación; 100 %
  de los `expect` con mensaje (104/104 llamadas); steps y subtitles en el
  reporte; `npx tsc --noEmit` = 0; healing `autoRecoveries = 0`; auditor
  `pasa`.
- **Deuda**: ninguna; la convención rige desde este cambio para todo spec
  nuevo (y para la revisión retroactiva en curso).
- **Evidencia**: `.local/evidencia/C-006/` (`resumen.md`,
  `report-steps.json`, `steps-resumen.txt`).

---

## C-007 — 2026-10-01 — BL-011: `Healer.locator(spec, índice)` sin resolución

- **Alcance**: `Healer.locator(spec, index = 0): Locator` síncrono (traducción
  pura `candidateToLocator(...).first()`, `RangeError` con key e índice fuera de
  rango) y helper `cssCandidateIndex(spec)`; migración de los POM de login y
  registro: ausencias → `healer.locator`, presencia → `healer.resolve`;
  eliminación de `loginStableSelectors`/`signupStableSelectors` (css inline una
  sola vez en cada `LocatorSpec`); specs de framework `HL-01..HL-07`; regla de
  decisión §0.1 y guard nuevo en skill, agentes y `AGENTS.md`. `resolve`,
  `governor`, `cache`, `patch-writer` y motores IA sin cambios.
- **Archivos**: `src/healing/healer.ts`, `src/healing/locator-factory.ts`,
  `src/locators/login.locators.ts`, `src/locators/signup.locators.ts`,
  `src/pages/login.page.ts`, `src/pages/signup.page.ts`,
  `tests/e2e_guest/framework/healer-locator.spec.ts`,
  `tests/e2e_auth/framework/healer-locator.spec.ts` (+ `.opencode/` y
  `AGENTS.md`, locales no commiteables).
- **Verificación**: `revision-spec` = apto; T-01..T-08 con dev→tester→auditor
  (veredicto `pasa` en las 8); suite completa 27/27 (2.3 min, throttle D-007);
  auth 19/19; framework 7/7; `npx tsc --noEmit` = 0; guard = 0; healing 225
  eventos 100 % `primary`, 0 `cache`/`ai`, `autoRecoveries = 0`; corrida con
  `HEAL_MAX_PER_TEST=0` verde y control de sensibilidad con
  `HealingGovernanceError` real.
- **Resultado**: sin regresión (0 fallos; evaluación `sin regresión`); API sin
  efectos consumida por los POM; una sola fuente de verdad también en las
  ausencias.
- **Seguridad**: `revision-seguridad` sin hallazgos (sin secretos/PII/deps
  nuevas; permiso de agentes intacto).
- **Deuda**: observaciones H-1/H-2 resueltas en el cierre (redacción del guard
  y D-001/D-002 residuales en la skill); D-004/D-005/D-007 quedan fuera de la
  rama (BL-001 producto/carrito en `stash`, se retoma al restaurarlo).
- **Evidencia**: `.local/evidencia/C-007/` (`resumen.md`,
  `revision-seguridad.md`, `playwright-full.txt`, `healing-summary.txt`,
  `guard-selectores.txt`, `tsc.txt`) y
  `.local/evidencia/evidencia-evaluacion-2026-10-01-c007.md`.
- **Git**: commits por tarea T-01..T-07 (`c54022a`, `6f28753`, `f9a1096`,
  `56252c2`, `fb678e4`, `f4ac276`, `d9f4dc0`) con tags
  `spec-healer-locator-t01..t07`; merge `--no-ff` a `develop` + tag
  `spec-healer-locator`; PR `develop` → `main`.
