import { test, expect } from '@playwright/test';

test.describe('Admin Panel - Pengujian Authentication & Login', () => {

  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://layarbaca.app/admin/login', { waitUntil: 'domcontentloaded' });
  });

  test('1. Verifikasi elemen UI pada halaman Login Admin', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Admin Portal' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Silakan masuk untuk')).toBeVisible();
    await expect(page.getByText('Username', { exact: true })).toBeVisible();
    await expect(page.getByText('Password', { exact: true })).toBeVisible();
  });

  test('2. Negative Test: Login gagal menggunakan kredensial yang salah', async ({ page }) => {
    const usernameInput = page.getByRole('textbox').first();
    const passwordInput = page.getByRole('textbox', { name: "Gunakan 'admin'" });
    const submitBtn = page.getByRole('button', { name: 'Masuk' });

    await usernameInput.fill('admin');
    await passwordInput.fill('salah_password');
    await submitBtn.click();

    const toastError = page.getByText('Username atau password salah').first();
    await expect(toastError).toBeVisible({ timeout: 10000 });

    const closeToastBtn = page.getByRole('button', { name: 'Close toast' });
    if (await closeToastBtn.isVisible()) {
      await closeToastBtn.click();
    }
  });

  test('3. Positive Test: Login berhasil dengan kredensial valid', async ({ page }) => {
    const usernameInput = page.getByRole('textbox').first();
    const passwordInput = page.getByRole('textbox', { name: "Gunakan 'admin'" });
    const submitBtn = page.getByRole('button', { name: 'Masuk' });

    await usernameInput.fill('admin');
    await passwordInput.fill('sampulkreativ.yes');
    await submitBtn.click();

    // Validasi URL berpindah dari halaman login setelah sukses
    await expect(page).not.toHaveURL('https://layarbaca.app/admin/login', { timeout: 15000 });
  });

});