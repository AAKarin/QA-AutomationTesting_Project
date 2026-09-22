import { test, expect } from '@playwright/test';

test('Pengujian Modul Kreator - Multiple Scenarios', async ({ page }) => {
  // Tambahkan sedikit waktu ekstra agar tidak keburu gagal jika internet lambat
  test.setTimeout(90000); 

  const dismissToast = async () => {
    const closeBtn = page.getByRole('button', { name: 'Close toast' }).first();
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click({ force: true }).catch(() => {});
    }
    await page.waitForTimeout(400);
  };

  await test.step('TC 0: Login, Navigasi & Cek Data Awal', async () => {
    // Login Admin
    await page.goto('https://layarbaca.app/admin/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('textbox').first().fill('admin');
    await page.getByRole('textbox', { name: "Gunakan 'admin'" }).fill('sampulkreativ.yes');
    await page.getByRole('button', { name: 'Masuk' }).click();

    // Navigasi ke Menu Kreator
    await page.getByRole('link', { name: 'Kreator' }).click();
    await expect(page.getByRole('heading', { name: 'Kreator' })).toBeVisible();

    // Verifikasi Data Awal (Pastikan List Kreator Muncul)
    await expect(page.getByRole('heading', { name: 'Kreativ Fans' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Satria' })).toBeVisible();
  });

  await test.step('TC 1: Tambah Kreator Baru (Positif)', async () => {
    await page.getByRole('button', { name: 'Kreator Baru' }).click();
    await page.getByRole('textbox', { name: 'Alex Studio' }).fill('Testing Playwright');
    await page.getByRole('textbox', { name: '@alexstudio' }).fill('@playwrighttester');
    await page.getByRole('textbox', { name: 'Kreator konten...' }).fill('testing playwright');
    
    await page.getByRole('button', { name: 'Simpan Kreator' }).click();
    
    // Validasi Toast Sukses Tambah
    await expect(page.getByText('Kreator berhasil ditambahkan')).toBeVisible({ timeout: 15000 });
    await dismissToast();
  });

  await test.step('TC 2: Edit Kreator', async () => {
    await page.getByRole('button', { name: 'Edit Kreator' }).first().click(); 
    await page.getByRole('textbox', { name: 'Kreator konten...' }).fill('Bio kreator berhasil diperbarui via test');
    
    await page.getByRole('button', { name: 'Simpan Kreator' }).click();

    // Validasi Toast Sukses Edit
    await expect(page.getByText(/Kreator berhasil diperbarui/i).first()).toBeVisible({ timeout: 15000 });
    await dismissToast();
  });

  await test.step('TC 3: Validasi Form Kosong / Batal', async () => {
    await page.getByRole('button', { name: 'Kreator Baru' }).click({ force: true });
    await expect(page.getByRole('heading', { name: 'Tambah Kreator Baru' })).toBeVisible({ timeout: 10000 });
    
    // Batal / Tutup form
    await page.getByRole('button', { name: 'Batal' }).click();
    await expect(page.getByRole('heading', { name: 'Tambah Kreator Baru' })).toBeHidden({ timeout: 10000 });
  });
});