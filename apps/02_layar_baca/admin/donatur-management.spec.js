import { test, expect } from '@playwright/test';

test('Pengujian Modul Donatur & Pelanggan', async ({ page }) => {
  // Timeout ekstra untuk menangani proses broadcast & pengiriman notifikasi
  test.setTimeout(120000);

  await test.step('TC 0: Login & Navigasi', async () => {
    await page.goto('https://layarbaca.app/admin/login');
    await page.getByRole('textbox').first().fill('admin');
    await page.getByRole('textbox', { name: "Gunakan 'admin'" }).fill('sampulkreativ.yes');
    await page.getByRole('button', { name: 'Masuk' }).click();

    await page.getByRole('link', { name: 'Donatur' }).click();
    await expect(page.getByRole('heading', { name: 'Manajemen Pelanggan & Donatur' })).toBeVisible();
  });

  await test.step('TC 1: Cari Email Donatur Spesifik', async () => {
    await page.getByRole('textbox', { name: 'Masukkan alamat email' }).fill('angel.akun.test.1');
    await page.getByText('angel.akun.test.1@gmail.com').first().click();
  });

  await test.step('TC 2: Uji Tandai & Hapus Flag Merah', async () => {
    // Tandai Flag Merah
    await page.getByRole('button', { name: 'Tandai Flag Merah' }).first().click();
    await expect(page.getByText('Berhasil menandai flag merah')).toBeVisible();
    await page.getByRole('button', { name: 'Close toast' }).first().click();

    // Hapus Flag Merah
    await page.getByRole('button', { name: 'Hapus Flag Merah' }).first().click();
    await expect(page.getByText('Berhasil menghapus flag merah')).toBeVisible();
    await page.getByRole('button', { name: 'Close toast' }).first().click();
  });

  await test.step('TC 3: Kirim Notifikasi Individual (Kirim WA)', async () => {
    await page.getByRole('button', { name: 'Kirim WA' }).first().click();
    
    await page.getByRole('textbox', { name: 'Contoh: Promo Video Eksklusif' }).fill('Testing Playwright');
    
    // Pilih lampiran video promo jika ada
    await page.locator('div').filter({ hasText: /^-- Tanpa Lampiran Video --$/ }).first().click();
    await page.locator('div').filter({ hasText: /^Kreativ Fans Short Teaser #1$/ }).first().click();
    
    await page.getByRole('textbox', { name: 'Ketik pesan promosi Anda di' }).fill('Testing Playwright');
    await page.getByRole('button', { name: 'Kirim via WhatsApp' }).click();

    await expect(page.getByText('Notifikasi email berhasil')).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Close toast' }).first().click();
  });

  await test.step('TC 4: Uji Filter & Sortir Pelanggan', async () => {
    await page.getByRole('button', { name: 'Filter' }).first().click();

    // Pilih opsi filter
    await page.getByRole('combobox').nth(2).selectOption('Happy Donation (All Content Access)');
    await page.getByRole('combobox').nth(3).selectOption('has_phone');
    await page.getByRole('combobox').nth(4).selectOption('email');

    // Terapkan Pengurutan (Sorting)
    await page.getByRole('combobox').first().selectOption('lastDonatedAt');
    await page.getByRole('combobox').nth(1).selectOption('asc');
  });

  await test.step('TC 5: Broadcast Email Massal', async () => {
    await page.getByRole('button', { name: 'Broadcast Notifikasi' }).click();
    await expect(page.getByRole('heading', { name: 'Broadcast Email Massal' })).toBeVisible();

    // Pilih target (menggunakan Regex agar tidak terpengaruh jumlah angka pelanggan)
    await page.getByText(/Potensial Saja/i).first().click();

    await page.getByRole('textbox', { name: 'Contoh: Kejutan Eksklusif' }).fill('Testing Playwright');
    await page.getByRole('textbox', { name: 'Ketik pesan promosi akbar' }).fill('Testing Playwright');

    // Klik tombol kirim dengan regex untuk mencocokkan jumlah penerima yang dinamis
    await page.getByRole('button', { name: /Kirim ke .* Penerima/i }).click();

    await expect(page.getByText('Broadcast email berhasil')).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: 'Close toast' }).first().click();
  });

  await test.step('TC 6: Form Broadcast - Batal', async () => {
    await page.getByRole('button', { name: 'Broadcast Notifikasi' }).click();
    await page.getByRole('button', { name: 'Batal' }).click();
  });
});