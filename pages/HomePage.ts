import { Page } from '@playwright/test';

export class HomePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('https://www.liverpool.com.mx/tienda/home', {
      waitUntil: 'domcontentloaded',
    });
  }

  async search(term: string) {
    const searchBox = this.page.getByRole('textbox', { name: /buscar por producto/i });
    await searchBox.fill(term);
    await searchBox.press('Enter');
  }
}