import { test, expect } from '@playwright/test';

test('Pengujian Modul Pembayaran - Konfigurasi', async ({ page }) => {
  // Tambahkan sedikit waktu ekstra
  test.setTimeout(90000);

  const dismissToast = async () => {
    const closeBtn = page.getByRole('button', { name: 'Close toast' }).first();
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click({ force: true }).catch(() => {});
    }
    await page.waitForTimeout(400);
  };

  await test.step('TC 0: Login & Navigasi', async () => {
    await page.goto('https://layarbaca.app/admin/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('textbox').first().fill('admin');
    await page.getByRole('textbox', { name: "Gunakan 'admin'" }).fill('sampulkreativ.yes');
    await page.getByRole('button', { name: 'Masuk' }).click();
    
    await page.getByRole('link', { name: 'Pembayaran' }).click();
    await expect(page.getByRole('heading', { name: 'Konfigurasi Pembayaran' })).toBeVisible({ timeout: 15000 });
  });

  await test.step('TC 1: Buka Form Edit & Batal', async () => {
    // Membuka form edit lalu membatalkannya
    await page.getByRole('button', { name: 'Edit' }).first().click();
    await expect(page.getByText('Edit Metode')).toBeVisible();
    await page.getByRole('button', { name: 'Batal' }).click();
  });

  await test.step('TC 2: Simpan Edit Pembayaran', async () => {
    // Membuka ulang form edit dan langsung menyimpannya
    await page.getByRole('button', { name: 'Edit' }).first().click();
    await page.getByRole('button', { name: 'Simpan' }).click();
    
    // Validasi toast sukses
    await expect(page.getByText('Metode pembayaran diperbarui!')).toBeVisible({ timeout: 10000 });
    await dismissToast();
  });

  await test.step('TC 3: Tambah Metode Pembayaran', async () => {
    // Menambahkan data uji baru
    await page.getByRole('button', { name: 'Tambah Metode' }).first().click();
    await page.getByRole('textbox', { name: 'BCA, Gopay, OVO, Dana...' }).fill('Testing Playwright');
    await page.getByRole('textbox', { name: 'Nama pemilik rekening' }).fill('Testing Playwright');
    await page.getByRole('button', { name: 'Simpan' }).click();
    
    // Validasi toast sukses
    await expect(page.getByText('Metode pembayaran ditambahkan!')).toBeVisible({ timeout: 10000 });
    await dismissToast();
  });

  await test.step('TC 4: Hapus Metode Pembayaran', async () => {
    // Cari tombol hapus di card terakhir (ikon tempat sampah di samping tombol Edit)
    const lastCard = page.locator('div').filter({ has: page.getByRole('heading', { name: 'Testing Playwright' }) }).last();
    const trashBtn = lastCard.locator('button').filter({ has: page.locator('svg') }).last();
    await trashBtn.click();
    
    // Konfirmasi melalui custom modal
    const confirmDeleteBtn = page.getByRole('button', { name: 'Ya, Hapus' });
    await expect(confirmDeleteBtn).toBeVisible({ timeout: 10000 });
    await confirmDeleteBtn.click();
    
    // Validasi toast sukses hapus
    await expect(page.getByText(/Metode pembayaran dihapus|berhasil/i)).toBeVisible({ timeout: 15000 });
    await dismissToast();
  });
});