# Liverpool E2E Test Automation

[![Playwright Tests](https://github.com/AlexiGiles0708/test-e2e-take-home-challenge/actions/workflows/test.yml/badge.svg)](https://github.com/AlexiGiles0708/test-e2e-take-home-challenge/actions/workflows/test.yml)

Automatización E2E del flujo de búsqueda de productos en [Liverpool.com.mx](https://www.liverpool.com.mx/), construida con **Playwright + TypeScript** siguiendo el patrón **Page Object Model**.

El proyecto automatiza:
1. Búsqueda de "playstation 5".
2. Filtro por color "Blanco".
3. Ordenamiento por precio (menor a mayor).
4. Extracción de los primeros 5 resultados (nombre y precio).
5. Interceptación de la respuesta de red (`web-bff/product/search`) y validación cruzada entre los datos mostrados en la UI y los datos reales devueltos por el servidor.

Ver [`TEST_STRATEGY.md`](./TEST_STRATEGY.md) para el detalle de decisiones de diseño, trade-offs y manejo de flakiness.

## Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- npm (incluido con Node.js)

## Instalación

Clona el repositorio e instala las dependencias:

```bash
git clone https://github.com/AlexiGiles0708/test-e2e-take-home-challenge.git
cd test-e2e-take-home-challenge
npm ci
npx playwright install --with-deps
```

## Cómo correr los tests

### Modo headless (por defecto)

```bash
npx playwright test
```

Este es el modo por defecto — no abre ninguna ventana de navegador, ideal para CI y ejecuciones rápidas.

### Modo headed (con navegador visible)

```bash
npx playwright test --headed
```

Útil para ver visualmente el flujo mientras corre, o para debugging.

### Correr solo en un navegador específico

```bash
npx playwright test --project=chromium
```

Proyectos disponibles: `chromium`, `firefox`, `webkit`.

### Modo UI interactivo (recomendado para debugging)

```bash
npx playwright test --ui
```

Abre una interfaz gráfica donde puedes ver cada paso del test ejecutándose, con capturas de cada acción.

## Ver el reporte HTML

Después de correr los tests, genera y abre el reporte con:

```bash
npx playwright show-report
```

El reporte incluye el detalle de cada test, y capturas de pantalla automáticas en caso de fallo.

## Estructura del proyecto

```
├── .github/
│   └── workflows/
│       └── test.yml              # Pipeline de CI (GitHub Actions)
├── e2e/
│   └── search-flow.spec.ts       # Test principal del flujo E2E
├── pages/
│   ├── HomePage.ts               # Page Object: página de inicio / búsqueda
│   └── SearchResultsPage.ts      # Page Object: resultados, filtros, orden, extracción
├── utils/
│   └── network-interceptor.ts    # Parseo de la respuesta de red y utilidades de comparación
├── playwright.config.ts          # Configuración de Playwright (headless, reporter, screenshots)
├── TEST_STRATEGY.md              # Documento de estrategia de pruebas
└── README.md
```

## CI/CD

Cada `push` o `pull request` hacia `main` dispara automáticamente la suite completa en modo headless vía GitHub Actions. El pipeline:

1. Instala las dependencias del proyecto.
2. Instala los navegadores de Playwright.
3. Corre la suite de tests en modo headless.
4. Sube el reporte HTML como artifact descargable, incluso si algún test falla.

Puedes ver las ejecuciones más recientes en la pestaña [Actions](https://github.com/AlexiGiles0708/test-e2e-take-home-challenge/actions) del repositorio.

## Notas técnicas

- Liverpool usa **Next.js con Server-Side Rendering**. El ordenamiento por precio se ejecuta del lado del cliente (sin nueva petición de red), mientras que el filtro por color sí dispara una llamada real a `web-bff/product/search`, que es el punto donde se intercepta la respuesta para la validación cruzada. Más detalle en [`TEST_STRATEGY.md`](./TEST_STRATEGY.md).