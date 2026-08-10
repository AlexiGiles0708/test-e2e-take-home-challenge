# Test Strategy

## 1. ¿Qué no automatizarías en este flujo, y por qué?

No automatizaría la validación visual/estética de las tarjetas de producto (colores exactos, alineación, tamaños de imagen) — eso se cubre mejor con visual regression testing (screenshot comparison), no con aserciones funcionales. Tampoco automatizaría el flujo de compra completo (agregar al carrito, checkout, pago), ya que implica transacciones reales, datos sensibles y dependencias externas (pasarelas de pago) fuera del alcance de "búsqueda y validación de resultados".

## 2. Si Liverpool agregara un CAPTCHA al flujo de búsqueda, ¿cómo lo manejarías?

No intentaría resolverlo por automatización (viola términos de servicio del sitio y es una solución frágil). Lo manejaría solicitando al equipo un ambiente de staging/QA sin CAPTCHA, o un bypass mediante feature flag / API key de testing proporcionada por el equipo de desarrollo — práctica común en equipos que automatizan sobre producción real.

## 3. ¿Qué riesgos de flakiness existen en este test, y cómo los mitigaste?

Este fue el hallazgo más significativo del ejercicio. Al ejecutar los 2 navegadores en paralelo (comportamiento por defecto de Playwright) contra el sitio de producción real, se identificaron fallos intermitentes y reproducibles:

- **Bloqueo activo por WAF (Akamai):** en una ejecución con alta concurrencia, el sitio devolvió una página "Access Denied" servida por Akamai (`errors.edgesuite.net`), indicando detección de tráfico automatizado. Confirmado con evidencia real (screenshot + page snapshot).
- **Timing de `waitForResponse`:** un error inicial de diseño (registrar el listener de red después de disparar la acción que la causa) generó timeouts falsos. Se corrigió usando el patrón `Promise.all([waitForResponse(...), click()])`, que registra el listener y dispara la acción de forma atómica.
- **Contención de recursos/red:** se comprobó empíricamente que cada test, ejecutado de forma aislada, pasa consistentemente (Chromium: 9s, Firefox: 12.7s), pero fallaba al correr los 3 en paralelo. Se redujo a chrom y firefox.


## 4. Si tuvieras que integrar esto en un pipeline de equipo con 50+ suites, ¿qué cambiarías?

Reduciría aún más la concurrencia (o correría esta suite en un job aislado, no junto a las otras 50), dado que se comprobó que la agresividad del paralelismo activa defensas del sitio bajo prueba. También añadiría reintentos automáticos (`retries`) específicamente para fallos de red/WAF, separaría esta suite en un pipeline con menor frecuencia de ejecución (no en cada commit, sino en cadencia programada) para reducir la carga total sobre el sitio real, y consideraría rotar user-agents si el volumen de ejecuciones lo justificara.