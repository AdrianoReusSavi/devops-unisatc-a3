import { test, expect, Page } from '@playwright/test';
import { faker } from '@faker-js/faker';

async function safeGoto(page: Page, url: string, retries = 5, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      await page.goto(url);
      return;
    } catch (e) {
      if (e.message.includes('ECONNREFUSED')) {
        console.log(`Tentativa ${i + 1} falhou. Retentando em ${delay}ms...`);
        await page.waitForTimeout(delay);
      } else {
        throw e;
      }
    }
  }
  throw new Error(`Falha ao acessar ${url} após ${retries} tentativas.`);
}

test('Admin cria uma nova Categoria com segurança', async ({ page }) => {
  await safeGoto(page, 'http://localhost:1337/admin');

  await page.fill('input[name="email"]', 'admin@satc.edu.br');
  await page.fill('input[name="password"]', 'welcomeToStrapi123');
  await page.click('button[type="submit"]');

  await page.getByRole('link', { name: 'Content Manager' }).click();
  await page.getByRole('link', { name: 'Categoria' }).click();
  await page.getByRole('link', { name: 'Create new entry' }).first().click();

  await page.fill('input[name="name"]', faker.commerce.department());
  await page.getByText('Save').click();

  await page.getByRole('button', { name: 'Super Admin' }).click();
  await page.getByText('Log out').click();

  await expect(page).toHaveURL(/admin\/auth/);
});