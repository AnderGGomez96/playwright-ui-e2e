# Plan de estudio — Reaprendizaje Playwright UI

Audiencia: ex-API que vuelve a UI. Método: MAL vs BIEN + cadena `Browser -> BrowserContext -> Page -> Locator -> expect` + micro-tareas en https://automationexercise.com. Fuente única: https://playwright.dev/docs. Prohibido workarounds (`waitForTimeout`, sleeps, XPath absolutos, `force: true`).

Convención repo: TypeScript, specs en `tests/`, POM, `baseURL: 'https://automationexercise.com'` en `playwright.config.ts`, web-first (`getByRole` + `expect` con auto-waiting), `reporter: 'html'`, `trace: 'on-first-retry'`.

## Módulo 1 — Fundamentos Browser/Context/Page + config baseURL

- **Objetivo:** entender la cadena `Browser -> BrowserContext -> Page`, el fixture `page` aislado por test y configurar `baseURL` para usar rutas relativas.
- **Docs oficiales:**
  - https://playwright.dev/docs/browser-contexts
  - https://playwright.dev/docs/test-configuration
  - https://playwright.dev/docs/api/class-page
- **MAL vs BIEN (resumido):**
  - MAL: `await page.goto('https://automationexercise.com/')` con URL absoluta repetida en cada test + crear `browser.newContext()` a mano sin necesidad.
  - BIEN: `baseURL: 'https://automationexercise.com'` en config + `await page.goto('/')` usando el `page` del fixture ya aislado.
- **Micro-tarea en automationexercise.com:** configurar `baseURL`, crear `tests/home.spec.ts` que abre `/` y verifica título/contenido visible del home.
- **Criterio de done:** `npx playwright test tests/home.spec.ts` pasa en chromium; `page.goto` usa ruta relativa; reporte HTML generado.

## Módulo 2 — Locators web-first

- **Objetivo:** localizar por rol/texto accesible en lugar de CSS/XPath frágiles.
- **Docs oficiales:**
  - https://playwright.dev/docs/locators
  - https://playwright.dev/docs/api/class-page#page-get-by-role
- **MAL vs BIEN (resumido):**
  - MAL: `page.locator('div > ul > li:nth-child(2) > a.btn')` o XPath absoluto.
  - BIEN: `page.getByRole('link', { name: 'Signup / Login' })`, como en `tests/example.spec.ts` con `getByRole('link', { name: 'Get started' })`.
- **Micro-tarea en automationexercise.com:** spec que navega a `/`, hace clic en `Signup / Login` con `getByRole` y verifica el heading `Login to your account`.
- **Criterio de done:** test pasa sin selectores CSS/XPath frágiles; locator re-resuelve tras navegación; sin `waitForTimeout`.

## Módulo 3 — Assertions/expect + auto-waiting

- **Objetivo:** usar aserciones web-first con reintento automático en vez de aserciones inmediatas de mentalidad API.
- **Docs oficiales:**
  - https://playwright.dev/docs/test-assertions
  - https://playwright.dev/docs/actionability
- **MAL vs BIEN (resumido):**
  - MAL: `expect(await page.textContent('h2')).toBe('Login')` o `waitForTimeout(3000)` antes de afirmar.
  - BIEN: `await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible()` con auto-waiting, como `toBeVisible()` / `toHaveTitle()` en `tests/example.spec.ts`.
- **Micro-tarea en automationexercise.com:** login con credencial inválida y afirmar mensaje de error con `expect(locator).toBeVisible()` sin esperas manuales.
- **Criterio de done:** test es estable en re-ejecuciones; falla genera trace (`on-first-retry`); cero esperas fijas.

## Módulo 4 — POM + fixtures

- **Objetivo:** separar localizadores/acciones en Page Objects y usar fixtures de Playwright Test.
- **Docs oficiales:**
  - https://playwright.dev/docs/pom
  - https://playwright.dev/docs/test-fixtures
- **MAL vs BIEN (resumido):**
  - MAL: selectores y `page.click` duplicados en cada spec.
  - BIEN: clase `LoginPage` con `readonly loginHeading = this.page.getByRole(...)` + método `goto()` / `login(email, pass)`; spec solo orquesta `test('...', async ({ page }) => { ... })`.
- **Micro-tarea en automationexercise.com:** crear `tests/pages/login.page.ts` con POM de login y un spec que lo usa para el flujo de error de login.
- **Criterio de done:** dos specs reutilizan el mismo POM sin duplicar localizadores; `npx playwright test` pasa.

## Módulo 5 — Test isolation / API setup + UI (puente desde background API)

- **Objetivo:** aprovechar conocimiento API para preparar estado vía `request` y verificar en UI, manteniendo aislamiento por test.
- **Docs oficiales:**
  - https://playwright.dev/docs/test-isolation
  - https://playwright.dev/docs/api/class-apirequestcontext
- **MAL vs BIEN (resumido):**
  - MAL: encadenar tests con estado compartido (crear usuario en test 1 y usarlo en test 2) o loguearse por UI en cada test lento.
  - BIEN: `test.beforeEach` + `request` fixture para setup (ej. crear/asegurar estado) y luego `page` aislado solo para la verificación UI.
- **Micro-tarea en automationexercise.com:** spec que usa `request` para comprobar disponibilidad de endpoint/página (`GET /`) en `beforeEach` y luego verifica en UI el listado de productos.
- **Criterio de done:** tests son independientes y reordenables; setup API documentado con URL de docs; sin estado compartido entre tests.

## Módulo 6 — Debug / trace / report

- **Objetivo:** diagnosticar fallos con trace viewer y reporte HTML en lugar de `console.log` y re-runs ciegos.
- **Docs oficiales:**
  - https://playwright.dev/docs/trace-viewer
  - https://playwright.dev/docs/test-reporters
  - https://playwright.dev/docs/debug
- **MAL vs BIEN (resumido):**
  - MAL: añadir `waitForTimeout` + `console.log(await page.content())` para "ver qué pasa".
  - BIEN: mantener `trace: 'on-first-retry'` y `reporter: 'html'` (ya en `playwright.config.ts`), reproducir con `npx playwright show-report` y `npx playwright show-trace`.
- **Micro-tarea en automationexercise.com:** forzar un fallo (aserción con texto erróneo), abrir reporte y trace, identificar el eslabón de la cadena que falló (`Locator` vs `expect`).
- **Criterio de done:** alumno localiza el fallo solo con trace/reporte; revierte el fallo provocado y el suite vuelve a verde.
