import { test, expect } from '@playwright/test';

test('Pengujian Modul Transaksi - Verifikasi & Filter', async ({ page }) => {
  // Tambahkan timeout yang lebih panjang karena skenario transaksinya panjang
  test.setTimeout(120000); 

  await test.step('TC 0: Login & Navigasi', async () => {
    await page.goto('https://layarbaca.app/admin/login');
    await page.getByRole('textbox').first().fill('admin');
    await page.getByRole('textbox', { name: "Gunakan 'admin'" }).fill('sampulkreativ.yes');
    await page.getByRole('button', { name: 'Masuk' }).click();
    
    await page.getByRole('link', { name: 'Transaksi' }).click();
    await expect(page.getByRole('heading', { name: 'Konfirmasi Pembayaran' })).toBeVisible();
  });

  await test.step('TC 1: Uji Tampilan & Toggle Pengaturan', async () => {
    // Ubah mode tampilan
    await page.getByRole('button', { name: 'Tabel' }).click();
    await page.getByRole('button', { name: 'Grid' }).click();
    await page.getByRole('button', { name: 'List' }).click();

    // Toggle Video Short
    await page.getByRole('button').nth(5).click(); // Hati-hati: .nth(5) bisa bergeser jika ada tombol baru di UI
    await expect(page.getByText('Video Short Aktif')).toBeVisible();
    await page.getByRole('button', { name: 'Close toast' }).first().click();

    await page.getByRole('button').nth(5).click();
    await expect(page.getByText('Video Short Nonaktif')).toBeVisible();
    await page.getByRole('button', { name: 'Close toast' }).first().click();
  });

  await test.step('TC 2: Uji Filter Transaksi', async () => {
    await page.getByRole('button', { name: 'Buka Filter' }).click();
    await page.getByRole('textbox', { name: 'Contoh: user@mail.com' }).fill('angel');
    await page.getByRole('button', { name: 'Cari / Terapkan Filter' }).click();
    
    await expect(page.getByText('Filter pencarian diterapkan')).toBeVisible();
    await page.getByRole('button', { name: 'Close toast' }).first().click();
  });

  await test.step('TC 3: Cek Bukti Transfer (Popup Window)', async () => {
    // Menangkap tab/jendela baru yang terbuka saat klik Bukti Transfer
    const page1Promise = page.waitForEvent('popup');
    await page.getByRole('button', { name: 'Bukti' }).first().click();
    const page1 = await page1Promise;
    
    // Pastikan gambar di tab baru termuat, lalu tutup tabnya agar rapi
    await expect(page1.getByRole('img')).toBeVisible();
    await page1.close();
  });

  await test.step('TC 4: Kirim Ulang Email Custom', async () => {
    await page.getByRole('button', { name: 'Kirim Email' }).first().click();
    await expect(page.getByRole('heading', { name: 'Kirim Ulang Email' })).toBeVisible();
    
    await page.getByRole('button', { name: 'Custom' }).click();
    await page.getByRole('textbox', { name: 'Masukkan pesan custom anda di' }).fill('Testing Playwright');
    await page.getByRole('button', { name: 'Kirim Sekarang' }).click();
    
    await expect(page.getByText('Email berhasil dikirim!')).toBeVisible();
    await page.getByRole('button', { name: 'Close toast' }).first().click();
  });

  await test.step('TC 5: Reset Kode Akses', async () => {
    await page.getByRole('button', { name: 'Reset Kode' }).first().click();
    
    // Menggunakan regex untuk toast karena kode akses biasanya berubah-ubah (dinamis)
    await expect(page.getByText(/Kode .* berhasil direset!/)).toBeVisible();
    await page.getByRole('button', { name: 'Close toast' }).first().click();
  });

  await test.step('TC 6: Cabut Akses Transaksi', async () => {
    // Tangani popup konfirmasi dari browser dengan Accept (Iya)
    page.once('dialog', dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.accept().catch(() => {}); 
    });

    await page.getByRole('button', { name: 'Cabut Akses' }).first().click();
    await expect(page.getByText('Hak akses berhasil dicabut!')).toBeVisible();
    await page.getByRole('button', { name: 'Close toast' }).first().click();
  });

  await test.step('TC 7: Reset Filter Pencarian', async () => {
    // Tombol Reset yang ada di sebelah tombol Filter
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await expect(page.getByText('Filter direset')).toBeVisible();
    await page.getByRole('button', { name: 'Close toast' }).first().click();
  });
});