import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { SearchResultsPage } from '../pages/SearchResultsPage';
import { extractProductsFromResponse, normalize } from '../utils/network-interceptor';

test('busca PS5, filtra por blanco, ordena por precio, extrae 5 resultados y valida contra la red', async ({ page }) => {
  const home = new HomePage(page);
  const results = new SearchResultsPage(page);

  await home.goto();
  await home.search('playstation 5');
  await results.filterByColor('BLANCO');
  
  const responseBody = await results.sortByPriceAscending();
  const apiProducts = extractProductsFromResponse(responseBody);

  const uiProducts = await results.getFirstNProducts(5);
  console.log('Productos UI:', uiProducts);
  console.log('Productos API:', apiProducts.length);

  const matches = uiProducts.filter(uiProduct =>
    apiProducts.some(apiProduct => normalize(apiProduct.name) === normalize(uiProduct.name))
  );


  uiProducts.forEach(uiProduct => {
    const match = apiProducts.find(p => normalize(p.name) === normalize(uiProduct.name));
  
    if (!match) {
      console.warn(`⚠️ "${uiProduct.name}" (UI) no se encontró en la respuesta interceptada`);
      return;
    }
  
    const uiPriceNumber = parseFloat(uiProduct.price.replace(/[^0-9.]/g, ''));
    if (Math.abs(uiPriceNumber - match.price) > 0.01) {
      console.warn(`Discrepancia de precio en "${uiProduct.name}": UI=${uiProduct.price}, API=$${match.price}`);
    } else {
      console.log(`"${uiProduct.name}" coincide (nombre y precio)`);
    }
  });
  
  
  expect(
    matches.length,
    `Se esperaban al menos 3 productos coincidentes, se encontraron ${matches.length}`
  ).toBeGreaterThanOrEqual(3);
});