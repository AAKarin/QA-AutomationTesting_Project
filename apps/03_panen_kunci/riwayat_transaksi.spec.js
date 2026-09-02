// @ts-check
import { test, expect } from '@playwright/test';
require('dotenv').config();

test.describe('Modul: Riwayat Transaksi - Panen Kunci', () => {

  const BASE_URL = process.env.BASE_URL_PANEN_KUNCI || 'http://localhost:3000';

  test.beforeEach(async ({ page }) => {
    // Navigasi ke halaman Riwayat Transaksi
    await page.goto(`${BASE_URL}/riwayat-transaksi`); 
  });

  test('Memvalidasi header halaman dan kolom pencarian', async ({ page }) => {
    // Catatan: Terdapat anomali pada mockup di mana header tertulis "Submit Key" 
    // alih-alih "Riwayat Transaksi". Skrip ini menguji berdasarkan visual mockup saat ini.
    await expect(page.getByRole('heading', { name: 'Submit Key' }).or(page.getByRole('heading', { name: 'Riwayat Transaksi' }))).toBeVisible();
    await expect(page.locator('button').filter({ hasText: '←' })).toBeVisible();

    // Validasi input pencarian
    const searchInput = page.getByPlaceholder('Cari transaksi...');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('OpenAI');
    // await expect(page.getByText('API Key OpenAI')).toBeVisible(); // Asumsi hasil filter langsung muncul
  });

  // TC-45: Validasi fungsionalitas tab filter
  test('TC-45: Memvalidasi ketersediaan dan interaksi tab filter transaksi', async ({ page }) => {
    const tabSemua = page.getByRole('button', { name: 'Semua' });
    const tabSetoran = page.getByRole('button', { name: 'Setoran' });
    const tabPenarikan = page.getByRole('button', { name: 'Penarikan' });

    await expect(tabSemua).toBeVisible();
    await expect(tabSetoran).toBeVisible();
    await expect(tabPenarikan).toBeVisible();

    // Uji interaksi klik pada filter
    await tabSetoran.click();
    // Validasi state aktif (misalnya mengecek class css, dsb)
    // await expect(tabSetoran).toHaveClass(/active|bg-blue-800/);
    
    await tabPenarikan.click();
    await tabSemua.click();
  });

  test('Memvalidasi pengelompokan tanggal dan rincian item transaksi beserta statusnya', async ({ page }) => {
    // Validasi Pengelompokan Tanggal
    await expect(page.getByText('Hari Ini')).toBeVisible();
    await expect(page.getByText('Kemarin')).toBeVisible();
    await expect(page.getByText('12 Oktober 2023')).toBeVisible();

    // Validasi Item Transaksi Pemasukan (Setoran)
    await expect(page.getByText('API Key OpenAI')).toBeVisible();
    await expect(page.getByText('+Rp 2.500')).toBeVisible();
    
    // Validasi Item Transaksi Pengeluaran (Penarikan)
    await expect(page.getByText('Penarikan Dana').first()).toBeVisible();
    await expect(page.getByText('-Rp 50.000')).toBeVisible();

    // Validasi Status dan Ikon/Warna
    const statusBerhasil = page.getByText('Berhasil').first();
    await expect(statusBerhasil).toBeVisible();
    
    const statusDiproses = page.getByText('Diproses');
    await expect(statusDiproses).toBeVisible();
    
    const statusGagal = page.getByText('Gagal');
    await expect(statusGagal).toBeVisible();
    await expect(page.getByText('Rp 0')).toBeVisible(); // Pastikan transaksi gagal bernilai Rp 0 atau tidak memotong saldo
  });
});