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
  throw new Error(`Não foi possível acessar ${url} após ${retries} tentativas.`);
}

test('Admin cria um novo Artigo com segurança', async ({ page }) => {
  await safeGoto(page, 'http://localhost:1337/admin');

  await page.fill('input[name="email"]', 'admin@satc.edu.br');
  await page.fill('input[name="password"]', 'welcomeToStrapi123');
  await page.click('button[type="submit"]');

  await page.getByRole('link', { name: 'Content Manager' }).click();
  await page.getByRole('link', { name: 'Artigo' }).click();
  await page.getByRole('link', { name: 'Create new entry' }).click();

  await page.fill('input[name="title"]', faker.lorem.sentence());
  await page.fill('textarea[name="description"]', faker.lorem.sentence().slice(0, 80));

  await page.getByText('Save').click();

  await page.getByRole('link', { name: 'Back' }).click();

  await page.getByRole('button', { name: 'Super Admin' }).click();
  await page.getByText('Log out').click();

  await expect(page).toHaveURL(/admin\/auth/);
});