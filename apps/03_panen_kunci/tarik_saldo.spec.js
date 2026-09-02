// @ts-check
import { test, expect } from '@playwright/test';
require('dotenv').config();

test.describe('Modul: Tarik Saldo - Panen Kunci', () => {

  const BASE_URL = process.env.BASE_URL_PANEN_KUNCI || 'http://localhost:3000';

  test.beforeEach(async ({ page }) => {
    // Navigasi ke halaman Tarik Saldo
    await page.goto(`${BASE_URL}/tarik-saldo`); 
  });

  // TC-35: Validasi ketersediaan judul halaman dan ikon kembali
  test('TC-35: Memastikan header Tarik Saldo dan tombol kembali berfungsi', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Tarik Saldo' })).toBeVisible();
    
    // Asumsi tombol back menggunakan icon atau tag tertentu
    const backButton = page.locator('button').filter({ hasText: '←' }).or(page.locator('.back-button'));
    await expect(backButton).toBeVisible();
  });

  // TC-36: Validasi tampilan rincian Saldo Aktif dan Saldo Pasif
  test('TC-36: Menampilkan kartu informasi Saldo Aktif dan Pasif dengan benar', async ({ page }) => {
    await expect(page.getByText('SALDO AKTIF')).toBeVisible();
    
    // Validasi nominal sesuai mockup
    const nominalAktif = page.getByText('Rp 85.000');
    const nominalPasif = page.getByText('Saldo Pasif: Rp 450.000');
    
    await expect(nominalAktif).toBeVisible();
    await expect(nominalPasif).toBeVisible();
  });

  // TC-37 & TC-38: Validasi progress bar dan indikator kelayakan penarikan
  test('TC-37 & TC-38: Memvalidasi syarat minimum penarikan dan status tombol (Disabled)', async ({ page }) => {
    await expect(page.getByText('Penarikan')).toBeVisible();
    await expect(page.getByText('Minimum: Rp 50.000')).toBeVisible(); // Catatan: Ada diskrepansi logika di mockup, tapi kita validasi teks yang dirender
    
    // Validasi indikator persentase dan sisa saldo yang dibutuhkan
    await expect(page.getByText('85%')).toBeVisible();
    await expect(page.getByText('Rp 15.000 lagi untuk penarikan')).toBeVisible();

    // Validasi tombol Tarik Saldo dalam keadaan nonaktif (disabled)
    const btnTarikSaldo = page.getByRole('button', { name: 'TARIK SALDO' });
    await expect(btnTarikSaldo).toBeVisible();
    await expect(btnTarikSaldo).toBeDisabled(); 

    // Validasi pesan petunjuk di bawah tombol
    await expect(page.getByText('Tombol akan aktif setelah mencapai limit minimum.')).toBeVisible();
  });

  // TC-40: Validasi riwayat penarikan dan status sukses
  test('TC-40: Menampilkan daftar riwayat penarikan dengan status Berhasil', async ({ page }) => {
    await expect(page.getByText('Riwayat Penarikan')).toBeVisible();

    // Validasi ketersediaan tautan Lihat Semua
    const linkLihatSemua = page.getByRole('link', { name: 'Lihat Semua >' }).or(page.getByText('Lihat Semua'));
    await expect(linkLihatSemua).toBeVisible();

    // Validasi item riwayat pertama (Transfer Bank BCA)
    const itemBCA = page.getByText('Transfer Bank BCA').first();
    await expect(itemBCA).toBeVisible();
    
    // Memastikan format penanda keluar (- Rp 100.000)
    await expect(page.getByText('- Rp 100.000').first()).toBeVisible();
    
    // Validasi badge status "Berhasil"
    const badgeBerhasil = page.getByText('Berhasil').first();
    await expect(badgeBerhasil).toBeVisible();
    
    // Opsional: Validasi item riwayat lainnya untuk memastikan list dirender dengan baik
    await expect(page.getByText('GoPay')).toBeVisible();
    await expect(page.getByText('- Rp 150.000')).toBeVisible();
  });

});