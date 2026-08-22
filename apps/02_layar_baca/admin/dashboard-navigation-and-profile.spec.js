import { test, expect } from '@playwright/test';

test.describe.serial('Admin Panel - Navigasi Sidebar, Profil Admin & Logout Flow', () => {
  let page;

  test.beforeAll(async ({ browser }) => {
    // Buat context & page sekali untuk seluruh test di file ini
    const context = await browser.newContext();
    page = await context.newPage();
    
    // Login Admin 1x di awal
    await page.goto('https://layarbaca.app/admin/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    const usernameInput = page.getByRole('textbox').first();
    const passwordInput = page.getByRole('textbox', { name: "Gunakan 'admin'" });
    const submitBtn = page.getByRole('button', { name: 'Masuk' });

    await usernameInput.fill('admin');
    await passwordInput.fill('sampulkreativ.yes');
    await submitBtn.click();

    // Tunggu sampai URL berpindah ke area admin
    await page.waitForURL('**/admin/**', { timeout: 20000 });
  });

  test('1. Verifikasi Navigasi Menu Sidebar Admin', async () => {
    test.setTimeout(60000);
    const sidebarLinks = [
      'Dasbor',
      'Paket Akses',
      'Videos',
      'Galleries',
      'Kreator',
      'Pembayaran',
      'Transaksi',
      'Pusat Bantuan',
      'Donatur',
      'Kode Akses'
    ];

    for (const menuName of sidebarLinks) {
      const link = page.getByRole('link', { name: menuName });
      if (await link.isVisible()) {
        await link.click({ force: true });
        await page.waitForTimeout(500); // Jeda singkat antar navigasi
      }
    }
  });

  test('2. Negative Test: Ganti Password tanpa memasukkan Password Saat Ini', async () => {
    test.setTimeout(60000);
    // Buka Modal Profil Admin
    const profileBtn = page.getByRole('button', { name: 'Profil Admin' });
    await expect(profileBtn).toBeVisible({ timeout: 10000 });
    await profileBtn.click();

    // Cek Form Ganti Password & Klik Simpan
    const savePasswordBtn = page.getByRole('button', { name: 'Simpan Password Baru' });
    await expect(savePasswordBtn).toBeVisible({ timeout: 10000 });
    await savePasswordBtn.click();

    // Validasi Toast error
    const toastError = page.getByText('Masukkan password saat ini.').first();
    await expect(toastError).toBeVisible({ timeout: 10000 });

    // Close Modal Profil
    const closeModalBtn = page.getByRole('button').filter({ hasText: /^$/ }).first();
    if (await closeModalBtn.isVisible()) {
      await closeModalBtn.click();
    }
  });

  test('3. Positive Test: Berhasil Logout dari Admin Panel', async () => {
    test.setTimeout(60000);
    const logoutBtn = page.getByRole('button', { name: 'Keluar' });
    await expect(logoutBtn).toBeVisible({ timeout: 10000 });
    await logoutBtn.click();

    // Validasi kembali ke Halaman Login Admin
    await expect(page.getByRole('heading', { name: 'Admin Portal' })).toBeVisible({ timeout: 15000 });
  });

});