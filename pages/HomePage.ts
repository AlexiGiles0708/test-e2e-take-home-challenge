import { Page, expect } from '@playwright/test';

export class HomePage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('https://www.liverpool.com.mx/tienda/home', {
      waitUntil: 'domcontentloaded',
    });
  
    await this.page.screenshot({
      path: 'debug-home-chromium.png',
      fullPage: true,
    });
  
    await expect(
      this.page.getByRole('textbox', {
        name: /buscar por producto/i,
      })
    ).toBeVisible();
  }

  async search(term: string): Promise<void> {
    const searchBox = this.page.getByRole('textbox', {
      name: /buscar por producto/i,
    });

    await searchBox.fill(term);
    await searchBox.press('Enter');

    await this.page.waitForURL(/\/tienda\?s=/);
  }
}