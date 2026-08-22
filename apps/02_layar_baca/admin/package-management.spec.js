import { test, expect } from '@playwright/test';

test.describe.serial('Admin Panel - Kelola Paket Akses & Hak Fitur', () => {
  let page;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();

    // 1. Login Admin 1x di awal
    await page.goto('https://layarbaca.app/admin/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const usernameInput = page.getByRole('textbox').first();
    const passwordInput = page.getByRole('textbox', { name: "Gunakan 'admin'" });
    const submitBtn = page.getByRole('button', { name: 'Masuk' });

    await usernameInput.fill('admin');
    await passwordInput.fill('sampulkreativ.yes');
    await submitBtn.click();

    await page.waitForURL('**/admin/**', { timeout: 20000 });

    // 2. Navigasi ke Menu Paket Akses
    await page.getByRole('link', { name: 'Paket Akses' }).click();
    await expect(page.getByRole('heading', { name: 'Kelola Paket Akses & Hak Fitur' })).toBeVisible({ timeout: 15000 });
  });

  test('1. Verifikasi Komponen Utama & Konfigurasi Fitur Mode Gratis', async () => {
    test.setTimeout(60000);
    // Verifikasi Header & Form Mode Gratis
    await expect(page.getByRole('heading', { name: 'Daftar Fitur Mode Gratis' })).toBeVisible({ timeout: 10000 });

    // Uji Toggle Checkbox Mode Gratis
    const downloadCheckbox = page.locator('label').filter({ hasText: /Izinkan Unduh Video/i }).first();
    const shareCheckbox = page.locator('label').filter({ hasText: /Izinkan Bagikan Link/i }).first();
    const noAdsCheckbox = page.locator('label').filter({ hasText: /Anti Iklan/i }).first();

    await downloadCheckbox.click();
    await downloadCheckbox.click();
    await shareCheckbox.click();
    await shareCheckbox.click();
    await noAdsCheckbox.click();
    await noAdsCheckbox.click();

    // Simpan Perubahan Mode Gratis
    await page.getByRole('button', { name: 'Simpan Perubahan Paket' }).click();
    await expect(page.getByText('Konfigurasi Hak Akses Fitur')).toBeVisible({ timeout: 10000 });
  });

  test('2. Verifikasi Daftar Paket Akses Default (Harian, Mingguan, Bulanan)', async () => {
    test.setTimeout(60000);
    await expect(page.getByRole('heading', { name: 'Daftar Paket Akses' })).toBeVisible({ timeout: 10000 });

    // Cek Keberadaan Paket
    await expect(page.getByRole('heading', { name: 'Paket Harian' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Paket Mingguan' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Paket Bulanan' })).toBeVisible();
  });

  test('3. CRUD Test: Tambah, Input Detail, dan Hapus Paket Baru', async () => {
    test.setTimeout(60000);
    // 1. Klik Tambah Paket Baru
    await page.getByRole('button', { name: 'Tambah Paket Baru' }).click();
    await expect(page.getByRole('heading', { name: 'Paket Baru' })).toBeVisible({ timeout: 10000 });

    // 2. Isi Detail Form Paket Baru
    const newNameInput = page.getByRole('textbox', { name: 'mis. Paket 30 Menit' }).last();
    const newPriceInput = page.getByRole('spinbutton', { name: '3000' }).last();
    const newDurationInput = page.getByRole('spinbutton', { name: '1' }).last();
    const newUnitSelect = page.getByRole('combobox').last();
    const newTagInput = page.getByRole('textbox', { name: 'mis. Akses 30 Menit /' }).last();
    const newDescInput = page.getByRole('textbox', { name: 'mis. Akses Penuh Seluruh' }).last();

    await newNameInput.fill('Testing');
    await newPriceInput.fill('5000');
    await newDurationInput.fill('1');
    await newUnitSelect.selectOption('hours');
    await newTagInput.fill('Testing');
    await newDescInput.fill('Akses Penuh Seluruh Konten (1 Jam)');

    // 3. Hapus Paket Baru yang Ditambahkan
    const deleteBtn = page.getByRole('button', { name: 'Hapus' }).last();
    await deleteBtn.click();

    // 4. Simpan Perubahan Akhir
    await page.getByRole('button', { name: 'Simpan Perubahan Paket' }).click();
    await expect(page.getByText('Konfigurasi Hak Akses Fitur')).toBeVisible({ timeout: 10000 });
  });

});