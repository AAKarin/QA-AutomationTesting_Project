import { test, expect } from '@playwright/test';

test('Pengujian Modul Kreator - Multiple Scenarios', async ({ page }) => {
  // Tambahkan sedikit waktu ekstra agar tidak keburu gagal jika internet lambat
  test.setTimeout(90000); 

  await test.step('TC 0: Login, Navigasi & Cek Data Awal', async () => {
    // Login Admin
    await page.goto('https://layarbaca.app/admin/login');
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
    await page.getByRole('textbox', { name: 'https://' }).fill('https://layarbaca.app/admin/creators');
    
    await page.getByRole('button', { name: 'Simpan Kreator' }).click();
    
    // Validasi Toast Sukses Tambah
    await expect(page.getByText('Kreator berhasil ditambahkan')).toBeVisible();
    await page.getByRole('button', { name: 'Close toast' }).first().click();
  });

  await test.step('TC 2: Edit Kreator (Menghapus URL Avatar)', async () => {
    // Catatan: menggunakan .nth(5) karena ini adalah urutan tombol dari rekaman aslimu
    await page.getByRole('button').nth(5).click(); 
    await page.getByRole('textbox', { name: 'https://' }).fill(''); // Dikosongkan
    
    await page.getByRole('button', { name: 'Simpan Kreator' }).click();

    // Validasi Toast Sukses Edit
    await expect(page.getByText('Kreator berhasil diperbarui')).toBeVisible();
    await page.getByRole('button', { name: 'Close toast' }).first().click();
  });

  await test.step('TC 3: Validasi Form Kosong (Negatif)', async () => {
    await page.getByRole('button', { name: 'Kreator Baru' }).click();
    await page.getByRole('button', { name: 'Simpan Kreator' }).click();
    
    // (Opsional) Jika saat form kosong disubmit memunculkan error, kamu bisa uncomment baris di bawah
    // dan sesuaikan teks errornya:
    // await expect(page.getByText('Nama dan Handle wajib diisi')).toBeVisible();
    
    // Batal / Tutup form
    await page.getByRole('button', { name: 'Batal' }).click();
  });
});