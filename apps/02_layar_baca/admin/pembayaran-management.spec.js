import { test, expect } from '@playwright/test';

test('Pengujian Modul Pembayaran - Konfigurasi', async ({ page }) => {
  // Tambahkan sedikit waktu ekstra
  test.setTimeout(90000);

  await test.step('TC 0: Login & Navigasi', async () => {
    await page.goto('https://layarbaca.app/admin/login');
    await page.getByRole('textbox').first().fill('admin');
    await page.getByRole('textbox', { name: "Gunakan 'admin'" }).fill('sampulkreativ.yes');
    await page.getByRole('button', { name: 'Masuk' }).click();
    
    await page.getByRole('link', { name: 'Pembayaran' }).click();
    await expect(page.getByRole('heading', { name: 'Konfigurasi Pembayaran' })).toBeVisible();
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
    await expect(page.getByText('Metode pembayaran diperbarui!')).toBeVisible();
    await page.getByRole('button', { name: 'Close toast' }).first().click();
  });

  await test.step('TC 3: Tambah Metode Pembayaran', async () => {
    // Menambahkan data uji baru
    await page.getByRole('button', { name: 'Tambah Metode' }).first().click();
    await page.getByRole('textbox', { name: 'BCA, Gopay, OVO, Dana...' }).fill('Testing Playwright');
    await page.getByRole('textbox', { name: 'Nama pemilik rekening' }).fill('Testing Playwright');
    await page.getByRole('button', { name: 'Simpan' }).click();
    
    // Validasi toast sukses
    await expect(page.getByText('Metode pembayaran ditambahkan!')).toBeVisible();
    await page.getByRole('button', { name: 'Close toast' }).first().click();
  });

  await test.step('TC 4: Hapus Metode Pembayaran', async () => {
    // Menyiapkan listener agar Playwright meng-klik "OK" / "Yes" pada popup konfirmasi
    page.once('dialog', dialog => {
      console.log(`Pesan dialog hapus: ${dialog.message()}`);
      dialog.accept().catch(() => {}); // Diubah dari dismiss() menjadi accept()
    });
    
    // Asumsi tombol icon hapus (tanpa teks) ada di elemen yang terakhir ditambahkan
    await page.getByRole('button').filter({ hasText: /^$/ }).last().click();
    
    // Validasi toast sukses hapus
    await expect(page.getByText('Metode pembayaran dihapus.')).toBeVisible();
    await page.getByRole('button', { name: 'Close toast' }).first().click();
  });
});