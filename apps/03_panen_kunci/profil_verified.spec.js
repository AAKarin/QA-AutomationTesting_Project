// @ts-check
import { test, expect } from '@playwright/test';
require('dotenv').config();

test.describe('Modul: Profil Pengguna (Terverifikasi) - Panen Kunci', () => {

  const BASE_URL = process.env.BASE_URL_PANEN_KUNCI || 'http://localhost:3000';

  test.beforeEach(async ({ page }) => {
    // Navigasi ke halaman profil dengan sesi user yang sudah diverifikasi
    await page.goto(`${BASE_URL}/profile`); 
  });

  test('Memvalidasi kemunculan badge Verified Account pada identitas pengguna', async ({ page }) => {
    await expect(page.getByText('Budi Santoso', { exact: true })).toBeVisible();
    await expect(page.getByText('budi.santoso@example.com')).toBeVisible();

    // Validasi krusial: Badge Verified Account harus muncul
    const badgeVerified = page.getByText('Verified Account');
    await expect(badgeVerified).toBeVisible();
    
    // Opsional: Validasi indikator titik hijau (online/status) jika elemennya memiliki aria-label atau alt text
    // await expect(page.locator('.status-indicator-green')).toBeVisible();
  });

  test('Memvalidasi rincian rekening bank terisi, fungsionalitas masking, dan tombol Ubah', async ({ page }) => {
    await expect(page.getByText('REKENING BANK')).toBeVisible();

    // Memastikan nama bank dan singkatan ter-render
    await expect(page.getByText('Bank Central Asia')).toBeVisible();
    await expect(page.getByText('BCA', { exact: true })).toBeVisible();

    // Validasi tombol "Ubah" untuk mengedit rekening
    const btnUbah = page.getByRole('button', { name: 'Ubah' }).or(page.getByText('Ubah'));
    await expect(btnUbah).toBeVisible();

    // Validasi Data Masking pada Nomor Rekening
    await expect(page.getByText('Nomor Rekening')).toBeVisible();
    // Memastikan format **** **** 5678 ter-render dengan benar demi privasi
    const maskedRekening = page.getByText('**** **** 5678');
    await expect(maskedRekening).toBeVisible();

    // Validasi Nama Pemilik Rekening
    await expect(page.getByText('Atas Nama')).toBeVisible();
    await expect(page.getByText('BUDI SANTOSO')).toBeVisible();
  });

  test('Memastikan menu statis Keamanan dan Bantuan tetap konsisten', async ({ page }) => {
    // Pengujian regresi ringan untuk memastikan menu bawah tidak terpengaruh oleh state verifikasi
    await expect(page.getByText('KEAMANAN')).toBeVisible();
    await expect(page.getByText('Reset Kata Sandi')).toBeVisible();
    
    await expect(page.getByText('BANTUAN & UMUM')).toBeVisible();
    await expect(page.getByText('Pusat Bantuan')).toBeVisible();
    await expect(page.getByText('Syarat & Ketentuan')).toBeVisible();
    await expect(page.getByText('Kebijakan Privasi')).toBeVisible();

    const btnKeluar = page.getByRole('button', { name: 'Keluar' }).or(page.getByText('Keluar'));
    await expect(btnKeluar).toBeVisible();
  });

});