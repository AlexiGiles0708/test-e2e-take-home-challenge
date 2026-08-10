import { Page, expect } from '@playwright/test';

export interface Product {
  name: string;
  price: string;
}

export class SearchResultsPage {
  constructor(private page: Page) {}

  async filterByColor(color: string): Promise<void> {
    const checkbox = this.page.getByRole('checkbox', {
      name: new RegExp(`^${color}`, 'i')
    });
  
    await checkbox.click();
  
    await expect(checkbox).toBeChecked();
  }
  
  async sortByPriceAscending() {
    await this.page.getByTestId('dropdown-sorting-button').click();
  
    const [response] = await Promise.all([
      this.page.waitForResponse(response => {
        const url = response.url();
  
        return (
          url.includes('web-bff/product/search') &&
          url.includes('sort=sortPrice%7C0') &&
          response.status() === 200
        );
      }),
  
      this.page.getByRole('option', {
        name: 'Menor precio'
      }).click(),
    ]);
  
    return response.json();
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