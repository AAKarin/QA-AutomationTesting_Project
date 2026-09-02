// @ts-check
import { test, expect } from '@playwright/test';
require('dotenv').config();

test.describe('Modul: Profil Pengguna (Belum Terverifikasi) - Panen Kunci', () => {

  const BASE_URL = process.env.BASE_URL_PANEN_KUNCI || 'http://localhost:3000';

  test.beforeEach(async ({ page }) => {
    // Navigasi ke halaman profil
    await page.goto(`${BASE_URL}/profile`); 
  });

  test('Memvalidasi tampilan kartu profil dan status rekening bank yang masih kosong', async ({ page }) => {
    // 1. Header dan Navigasi Kembali
    await expect(page.getByRole('heading', { name: 'Panen Kunci' })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: '←' }).or(page.locator('.back-btn'))).toBeVisible();

    // 2. Info Identitas Pengguna
    // Menggunakan regex atau class jika struktur DOM gambar bervariasi
    await expect(page.locator('img[alt*="avatar"]').or(page.locator('img'))).toBeVisible(); 
    await expect(page.getByText('Budi Santoso')).toBeVisible();
    await expect(page.getByText('budi.santoso@example.com')).toBeVisible();

    // 3. Validasi State Data Rekening Kosong (Unverified)
    await expect(page.getByText('REKENING BANK')).toBeVisible();
    await expect(page.getByText('Nomor Rekening')).toBeVisible();
    await expect(page.getByText('Atas Nama')).toBeVisible();
    
    // Mengecek keberadaan dua karakter strip (-) sebagai penanda data belum diisi
    const emptyStateDashes = page.getByText('-', { exact: true });
    await expect(emptyStateDashes).toHaveCount(2);
  });

  test('Memvalidasi menu pengaturan keamanan, bantuan, dan fungsionalitas keluar', async ({ page }) => {
    // 1. Menu Keamanan
    await expect(page.getByText('KEAMANAN')).toBeVisible();
    
    // Elemen menu bisa berupa link <a> atau button, menggunakan .or() untuk fleksibilitas
    const menuResetSandi = page.getByRole('link', { name: 'Reset Kata Sandi' }).or(page.getByText('Reset Kata Sandi'));
    await expect(menuResetSandi).toBeVisible();

    // 2. Menu Bantuan & Umum
    await expect(page.getByText('BANTUAN & UMUM')).toBeVisible();
    await expect(page.getByText('Pusat Bantuan')).toBeVisible();
    await expect(page.getByText('Syarat & Ketentuan')).toBeVisible();
    await expect(page.getByText('Kebijakan Privasi')).toBeVisible();

    // 3. Validasi Tombol Keluar (Logout)
    const btnKeluar = page.getByRole('button', { name: 'Keluar' }).or(page.getByText('Keluar'));
    await expect(btnKeluar).toBeVisible();
    
    // Uji Interaksi Logout (Opsional: Uncomment saat integrasi backend selesai)
    // await btnKeluar.click();
    // await expect(page).toHaveURL(/.*login/); // Memastikan sesi dihancurkan dan dialihkan ke log in
  });

});