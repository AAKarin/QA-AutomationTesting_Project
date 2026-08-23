import { test, expect } from '@playwright/test';

test.describe('Admin Panel - Management Video & Film', () => {

  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    // Login Admin sebelum tiap test case
    await page.goto('https://layarbaca.app/admin/login', { waitUntil: 'domcontentloaded' });
    const usernameInput = page.getByRole('textbox').first();
    const passwordInput = page.getByRole('textbox', { name: "Gunakan 'admin'" });
    const submitBtn = page.getByRole('button', { name: 'Masuk' });

    await usernameInput.fill('admin');
    await passwordInput.fill('sampulkreativ.yes');
    await submitBtn.click();

    await page.waitForURL('**/admin/**', { timeout: 20000 });
    await page.getByRole('link', { name: 'Videos' }).click();
    await expect(page.getByRole('heading', { name: 'Manajemen Video & Film' })).toBeVisible({ timeout: 15000 });
  });

  test('1. Tab Konten Video Pribadi: Verifikasi Filter & Toggle View', async ({ page }) => {
    // Verifikasi Komponen Filter
    await expect(page.getByText('Cari Konten')).toBeVisible();
    await expect(page.getByText('Filter Kreator')).toBeVisible();
    await page.getByRole('button', { name: 'Reset Filter' }).click();

    // Switching Tampilan Grid & List
    await page.getByRole('button', { name: 'Grid' }).click();
    await page.getByRole('button', { name: 'List' }).click();
  });

  test('2. Tab Film & Series (LK21): Pencarian & Pengaturan Akses', async ({ page }) => {
    await page.getByRole('button', { name: /Konfigurasi Film & Series/i }).click();
    await expect(page.getByRole('heading', { name: 'Pengaturan Status & Harga' })).toBeVisible({ timeout: 10000 });

    // Pencarian Film Specific
    const searchInput = page.getByRole('textbox', { name: /Cari di SELURUH/i });
    await searchInput.fill('spider-man');
    await expect(page.getByRole('row', { name: /Spider-Man/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('3. Tab Anime (Animasu): Selection Massal & Pencarian Anime', async ({ page }) => {
    await page.getByRole('button', { name: /Konfigurasi Anime/i }).click();
    await expect(page.getByRole('heading', { name: 'Pengaturan Status & Harga' })).toBeVisible({ timeout: 10000 });

    // Uji Pilih Semua Anime & Batalkan
    const selectAllBtn = page.getByRole('button', { name: /Pilih SEMUA Anime/i });
    await selectAllBtn.click();
    await expect(page.getByText(/SEMUA Anime Animasu Dipilih/i)).toBeVisible({ timeout: 10000 });

    const cancelBtn = page.getByRole('button', { name: 'Batalkan Pilihan' });
    await cancelBtn.click();
  });

  test('4. Tab GarasiFilm21: Filter Pencarian Film', async ({ page }) => {
    await page.getByRole('button', { name: /Konfigurasi Film \(/i }).click();
    await expect(page.getByRole('heading', { name: 'Pengaturan Status & Harga' })).toBeVisible({ timeout: 10000 });

    const searchGarasiInput = page.getByRole('textbox', { name: /Cari judul film GarasiFilm21/i });
    await searchGarasiInput.fill('Ghost in the cell');
    await searchGarasiInput.press('Enter');
  });

  test('5. Form Tambah Konten Video Baru & Batal', async ({ page }) => {
    await page.getByRole('button', { name: 'Tambah Konten' }).click();
    await expect(page.getByRole('heading', { name: 'Tambah Konten' })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Kembali' }).click();
  });

});