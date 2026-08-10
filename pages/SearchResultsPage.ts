import { Page } from '@playwright/test';

export interface Product {
  name: string;
  price: string;
}

export class SearchResultsPage {
  constructor(private page: Page) {}

  async filterByColor(color: string): Promise<void> {
    const checkbox = this.page.getByRole('checkbox', { name: new RegExp(`^${color}`, 'i') });
    
    await Promise.all([
      this.page.waitForResponse(r => 
        r.url().includes('web-bff/product/search') && r.status() === 200
      ),
      checkbox.click(),
    ]);
  }
  
  async sortByPriceAscending(): Promise<unknown> {
    await this.page.getByTestId('dropdown-sorting-button').click();
    
    const [response] = await Promise.all([
      this.page.waitForResponse(r => 
        r.url().includes('web-bff/product/search') && r.status() === 200
      ),
      this.page.getByRole('option', { name: 'Menor precio' }).click(),
    ]);
    
    return response.json(); // ahora sí obtienes JSON real, no HTML
  }

  async getFirstNProducts(n: number): Promise<Product[]> {
    const cards = this.page.locator('a[data-testid$="-card-link"]').filter({ visible: true });
    const results: Product[] = [];

    for (let i = 0; i < n; i++) {
      const card = cards.nth(i);
      const name = await card.locator('h3').textContent();

      // Precio con descuento si existe, si no, el precio original
      const discounted = card.locator('[data-testid="discounted"]');
      const hasDiscount = await discounted.count() > 0;
      const priceLocator = hasDiscount
        ? discounted
        : card.locator('[data-testid="original"]');

      const price = await priceLocator.textContent();

      results.push({
        name: name?.trim() ?? '',
        price: price?.trim() ?? '',
      });
    }

    return results;
  }
}