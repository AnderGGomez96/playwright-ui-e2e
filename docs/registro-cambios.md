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
