// @ts-check
import { test, expect } from '@playwright/test';
require('dotenv').config();

test.describe('Modul: Setor API Key - Panen Kunci', () => {

  const BASE_URL = process.env.BASE_URL_PANEN_KUNCI || 'http://localhost:3000';

  test.beforeEach(async ({ page }) => {
    // Navigasi ke halaman Setor API Key
    await page.goto(`${BASE_URL}/setor-api`); 
  });

  // TC-25: Validasi ketersediaan judul halaman dan tombol kembali
  test('TC-25: Memastikan tombol kembali (Back Button) tersedia dan berfungsi', async ({ page }) => {
    // Memeriksa tombol kembali (asumsi menggunakan tag a atau button dengan aria-label)
    // Seringkali developer menggunakan icon arrow-left, kita cari dengan role button/link
    const backButton = page.locator('button').filter({ hasText: '←' }).or(page.locator('.back-button')); 
    
    await expect(backButton).toBeVisible();
    
    // Uji fungsi klik untuk kembali
    await backButton.click();
    // await expect(page).toHaveURL(/.*dashboard/);
  });

  // TC-26: Validasi keterbacaan petunjuk langkah demi langkah
  test('TC-26: Memeriksa panduan "Cara Mendapatkan API Key"', async ({ page }) => {
    await expect(page.getByText('Cara Mendapatkan API Key')).toBeVisible();

    // Validasi Langkah 1
    await expect(page.getByText('Daftar di Panen Kunci').first()).toBeVisible();
    await expect(page.getByText('Buat akun atau masuk ke dashboard pengembang')).toBeVisible();

    // Validasi Langkah 2
    await expect(page.getByText('Salin API Key').first()).toBeVisible();
    await expect(page.getByText('Masuk ke menu API Settings dan klik tombol salin')).toBeVisible();

    // Validasi Langkah 3
    await expect(page.getByText('Tempel di Sini').first()).toBeVisible();
    await expect(page.getByText('Masukkan API key yang telah disalin ke kolom di bawah ini.')).toBeVisible();
  });

  // TC-27: Validasi proses input dan pengiriman API Key
  test('TC-27: Berhasil menginput dan menyetor API Key baru', async ({ page }) => {
    await expect(page.getByText('Masukkan API Key Anda')).toBeVisible();
    await expect(page.getByText('Disimpan secara aman dan terenkripsi.')).toBeVisible();

    const inputApiKey = page.getByPlaceholder('sk-kie-...');
    const btnSetor = page.getByRole('button', { name: 'Setor API Key' });

    await expect(inputApiKey).toBeVisible();
    
    // Simulasi pengisian (Paste) API Key
    await inputApiKey.fill('sk-kie-dummy-key-1234567890');
    
    // Klik tombol setor
    await expect(btnSetor).toBeVisible();
    await btnSetor.click();

    // Di sini kita bisa menambahkan validasi modal konfirmasi sukses/gagal nantinya
  });

  // TC-28: Validasi riwayat dan status verifikasi penyetoran API Key
  test('TC-28: Menampilkan riwayat API Key dengan status Valid dan Tidak Valid', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Riwayat API Key' }).or(page.getByText('Riwayat API Key'))).toBeVisible();

    // Memeriksa keberadaan item riwayat
    const historyCard = page.locator('.history-card').or(page.getByText(/sk-kie-/i)).first();
    await expect(historyCard).toBeVisible();

    // Memeriksa Badge Status Valid (Hijau)
    const badgeValid = page.getByText('Valid', { exact: true }).first();
    await expect(badgeValid).toBeVisible();
    // Opsional: Cek warna teks/background jika menggunakan class khusus
    
    // Memeriksa Badge Status Tidak Valid (Merah)
    const badgeTidakValid = page.getByText('Tidak Valid', { exact: true }).first();
    await expect(badgeTidakValid).toBeVisible();
  });

  // TC-29: Validasi fungsionalitas tautan "Lihat Semua"
  test('TC-29: Memeriksa tautan "Lihat Semua" pada riwayat API Key', async ({ page }) => {
    const linkLihatSemua = page.getByRole('link', { name: 'Lihat Semua' });
    
    await expect(linkLihatSemua).toBeVisible();
    await linkLihatSemua.click();

    // Validasi sistem mengarahkan ke halaman daftar riwayat penuh
    // await expect(page).toHaveURL(/.*riwayat-api/);
  });

  // TC-30: Validasi kemunculan modal konfirmasi keberhasilan penyetoran
  test('TC-30: Berhasil menyetor API Key valid dan memvalidasi popup Setoran Berhasil', async ({ page }) => {
    // 1. Aksi Input & Submit API Key
    const inputApiKey = page.getByPlaceholder('sk-kie-...');
    await inputApiKey.fill('sk-kie-valid-key-12345');
    await page.getByRole('button', { name: 'Setor API Key' }).click();

    // 2. Validasi Elemen Modal "Setoran Berhasil!"
    const modalHeading = page.getByRole('heading', { name: 'Setoran Berhasil!' });
    await expect(modalHeading).toBeVisible();

    // 3. Memvalidasi teks deskripsi dan nominal penambahan saldo
    // Menggunakan regex untuk fleksibilitas render spasi/baris baru pada DOM
    const deskripsiSukses = page.getByText(/API Key valid dan saldo Anda telah bertambah/i);
    await expect(deskripsiSukses).toBeVisible();
    
    const nominalSaldo = page.getByText('Rp3.000.');
    await expect(nominalSaldo).toBeVisible();

    // 4. Validasi Tombol CTA "Selesai"
    const btnSelesai = page.getByRole('button', { name: 'Selesai' });
    await expect(btnSelesai).toBeVisible();

    // 5. Interaksi klik dan penutupan modal
    await btnSelesai.click();
    
    // Memastikan UI merespons dengan menutup modal setelah interaksi
    await expect(modalHeading).toBeHidden();
    
    // Opsional: Validasi bahwa input field telah dikosongkan (reset) setelah sukses
    await expect(inputApiKey).toHaveValue('');
  });

  // TC-32 & TC-33: Validasi kemunculan modal kegagalan dan fungsionalitas tombol Coba Lagi
  test('TC-32 & TC-33: Gagal menyetor API Key dan memvalidasi popup Setoran Gagal', async ({ page }) => {
    // 1. Aksi Input & Submit API Key (Skenario Invalid/Kehabisan Kredit)
    const inputApiKey = page.getByPlaceholder('sk-kie-...');
    await inputApiKey.fill('sk-kie-invalid-key-00000');
    await page.getByRole('button', { name: 'Setor API Key' }).click();

    // 2. Validasi Elemen Modal "Setoran Gagal!"
    const modalHeading = page.getByRole('heading', { name: 'Setoran Gagal!' });
    await expect(modalHeading).toBeVisible();

    // 3. Memvalidasi teks alasan penolakan secara presisi
    const deskripsiGagal = page.getByText('API Key tidak valid atau kredit tidak mencukupi. Pastikan Anda menyalin key yang benar dari Kie.ai.');
    await expect(deskripsiGagal).toBeVisible();

    // 4. Validasi ketersediaan tombol tindakan
    const btnCobaLagi = page.getByRole('button', { name: 'Coba Lagi' });
    const btnBantuan = page.getByRole('button', { name: 'Hubungi Bantuan' }).or(page.getByRole('link', { name: 'Hubungi Bantuan' }));
    
    await expect(btnCobaLagi).toBeVisible();
    await expect(btnBantuan).toBeVisible();

    // 5. Uji Interaksi klik tombol "Coba Lagi" (TC-33)
    await btnCobaLagi.click();
    
    // Memastikan modal tertutup dan pengguna bisa mencoba input ulang
    await expect(modalHeading).toBeHidden();
    
    // Pastikan *field* input masih *visible* dan siap untuk digunakan kembali
    await expect(inputApiKey).toBeVisible();
  });

});