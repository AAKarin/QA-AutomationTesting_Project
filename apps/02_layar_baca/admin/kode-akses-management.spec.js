import { test, expect } from '@playwright/test';

test('Pengujian Modul Kode Akses', async ({ page }) => {
  // Tambahkan timeout untuk mencegah flaky saat proses generate kode dari backend
  test.setTimeout(90000);

  await test.step('TC 0: Login & Navigasi', async () => {
    await page.goto('https://layarbaca.app/admin/login');
    await page.getByRole('textbox').first().fill('admin');
    await page.getByRole('textbox', { name: "Gunakan 'admin'" }).fill('sampulkreativ.yes');
    await page.getByRole('button', { name: 'Masuk' }).click();

    await page.getByRole('link', { name: 'Kode Akses' }).click();
    await expect(page.getByRole('heading', { name: 'Kode Akses' }).first()).toBeVisible();
  });

  await test.step('TC 1: Cari & Tarik Akses (Revoke)', async () => {
    await page.getByRole('textbox', { name: 'Cari kode atau email...' }).fill('angel.akun.tes');
    
    await page.getByRole('button', { name: 'Tarik Akses (Revoke)' }).first().click();
    
    // Menggunakan Regex karena kode unik (misal: MMQDEJ) bersifat dinamis
    await expect(page.getByText(/Kode akses .* berhasil/i)).toBeVisible();
    await page.getByRole('button', { name: 'Close toast' }).first().click();
  });

  await test.step('TC 2: Form Generate Manual - Batal', async () => {
    await page.getByRole('button', { name: 'Generate Manual' }).click();
    await page.getByRole('button', { name: 'Batal' }).click();
  });

  await test.step('TC 3: Generate Manual - Tanpa Akses Spesifik', async () => {
    await page.getByRole('button', { name: 'Generate Manual' }).click();
    await page.getByRole('textbox', { name: 'contoh@mail.com' }).fill('angel.akun.test.1@gmail.com');
    await page.getByRole('button', { name: 'Buat Kode' }).click();
    
    // Validasi toast dinamis
    await expect(page.getByText(/Kode manual .* berhasil/i)).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Close toast' }).first().click();
  });

  await test.step('TC 4: Generate Manual - Dengan Akses Konten & Anti Iklan', async () => {
    await page.getByRole('button', { name: 'Generate Manual' }).click();
    
    // Memilih dropdown akses konten (contoh: post-gallery-1)
    await page.getByRole('combobox').selectOption('post-gallery-1|false');
    await page.getByRole('textbox', { name: 'contoh@mail.com' }).fill('angel.akun.test.1@gmail.com');
    
    // Klik opsi fitur tambahan
    await page.getByText('Anti Iklan (Tanpa Iklan / No').click();
    
    await page.getByRole('button', { name: 'Buat Kode' }).click();
    
    // Validasi toast dinamis
    await expect(page.getByText(/Kode manual .* berhasil/i)).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Close toast' }).first().click();
  });
});