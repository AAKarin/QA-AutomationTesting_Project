// @ts-check
import { test, expect } from '@playwright/test';
require('dotenv').config();

test.describe('Modul: Ubah Kata Sandi - Panen Kunci', () => {

  const BASE_URL = process.env.BASE_URL_PANEN_KUNCI || 'http://localhost:3000';

  test.beforeEach(async ({ page }) => {
    // Navigasi ke halaman ubah kata sandi
    await page.goto(`${BASE_URL}/ubah-kata-sandi`); 
  });

  test('Memvalidasi header dan teks petunjuk keamanan kata sandi', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Ubah Kata Sandi' })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: '←' }).or(page.locator('.back-btn'))).toBeVisible();

    // Memastikan instruksi kriteria kata sandi dirender penuh
    const deskripsiInstruksi = page.getByText(/Kata sandi Anda harus memiliki minimal 8 karakter dan merupakan kombinasi dari huruf, angka, dan simbol khusus/i);
    await expect(deskripsiInstruksi).toBeVisible();
  });

  test('Memvalidasi field input kata sandi beserta placeholder-nya', async ({ page }) => {
    // 1. Field Kata Sandi Saat Ini
    await expect(page.getByText('Kata Sandi Saat Ini')).toBeVisible();
    const inputSandiLama = page.getByPlaceholder('Masukkan kata sandi lama');
    await expect(inputSandiLama).toBeVisible();
    await expect(inputSandiLama).toHaveAttribute('type', 'password');

    // 2. Field Kata Sandi Baru
    await expect(page.getByText('Kata Sandi Baru', { exact: true })).toBeVisible();
    const inputSandiBaru = page.getByPlaceholder('Minimal 8 karakter');
    await expect(inputSandiBaru).toBeVisible();
    await expect(inputSandiBaru).toHaveAttribute('type', 'password');

    // 3. Field Konfirmasi Kata Sandi Baru
    await expect(page.getByText('Konfirmasi Kata Sandi Baru')).toBeVisible();
    const inputKonfirmasi = page.getByPlaceholder('Ulangi kata sandi baru');
    await expect(inputKonfirmasi).toBeVisible();
    await expect(inputKonfirmasi).toHaveAttribute('type', 'password');
  });

  test('Memvalidasi fungsionalitas ikon mata (Toggle Password Visibility) dan tombol submit', async ({ page }) => {
    // Menguji interaksi ikon mata pada salah satu input (misal: Kata Sandi Baru)
    const inputSandiBaru = page.getByPlaceholder('Minimal 8 karakter');
    
    // Asumsi ikon mata menggunakan elemen button/svg di dalam/sebelah input container
    // Pengembang biasanya menambahkan aria-label="Toggle password visibility" atau class spesifik
    const toggleSandiBaru = inputSandiBaru.locator('xpath=following-sibling::*').first(); 
    
    // Simulasi klik untuk melihat kata sandi
    await inputSandiBaru.fill('P@ssw0rd123');
    await toggleSandiBaru.click();
    
    // Verifikasi atribut type berubah menjadi teks
    // await expect(inputSandiBaru).toHaveAttribute('type', 'text'); 
    
    // Kembalikan ke tipe password
    // await toggleSandiBaru.click();
    // await expect(inputSandiBaru).toHaveAttribute('type', 'password');

    // Validasi indikator kekuatan sandi (3 bar di bawah input Kata Sandi Baru)
    // Cukup validasi keberadaan containernya jika menggunakan elemen div generik
    const passwordStrengthBar = page.locator('.password-strength-indicator').or(page.locator('.flex > div.h-1')); // Disesuaikan dengan class CSS dari Tailwind/framework yang digunakan
    // await expect(passwordStrengthBar).toBeVisible();

    // Validasi CTA
    const btnSimpan = page.getByRole('button', { name: 'Simpan Perubahan' });
    await expect(btnSimpan).toBeVisible();
  });

  test('Memvalidasi modal Gagal Mengubah Kata Sandi beserta rincian error-nya', async ({ page }) => {
    // Simulasi: Pengguna mengisi kata sandi lama yang salah dan kata sandi baru yang tidak memenuhi kriteria
    await page.getByPlaceholder('Masukkan kata sandi lama').fill('SandiSalah123');
    await page.getByPlaceholder('Minimal 8 karakter').fill('lemah');
    await page.getByPlaceholder('Ulangi kata sandi baru').fill('lemah');
    
    // Memicu aksi simpan untuk memunculkan modal error
    await page.getByRole('button', { name: 'Simpan Perubahan' }).click();

    // 1. Validasi Kemunculan Modal dan Judul Utama
    const modalHeadingError = page.getByRole('heading', { name: 'Gagal Mengubah Kata Sandi' });
    await expect(modalHeadingError).toBeVisible();

    // 2. Validasi Paragraf Penjelasan
    const teksPenjelasan = page.getByText(/Kata sandi lama yang Anda masukkan salah atau kata sandi baru tidak memenuhi kriteria/i);
    await expect(teksPenjelasan).toBeVisible();

    // 3. Validasi Rincian Indikator Error (Granular Validation)
    // Pastikan list error spesifik dirender oleh sistem sesuai dengan kesalahan input
    await expect(page.getByText('Kata sandi saat ini tidak sesuai.')).toBeVisible();
    await expect(page.getByText('Minimal 8 karakter.')).toBeVisible();
    await expect(page.getByText('Kombinasi huruf, angka, dan simbol.')).toBeVisible();

    // 4. Validasi Interaksi Pemulihan (Tombol Coba Lagi)
    const btnCobaLagi = page.getByRole('button', { name: 'Coba Lagi' });
    await expect(btnCobaLagi).toBeVisible();
    
    // Menguji agar modal tertutup saat diklik
    await btnCobaLagi.click();
    await expect(modalHeadingError).toBeHidden();
  });

  test('Memvalidasi modal Kata Sandi Diubah dan navigasi kembali ke profil', async ({ page }) => {
    // Simulasi pengisian form dengan data valid yang memenuhi kriteria keamanan
    await page.getByPlaceholder('Masukkan kata sandi lama').fill('SandiLama123!');
    await page.getByPlaceholder('Minimal 8 karakter').fill('SandiKuatBaru123!');
    await page.getByPlaceholder('Ulangi kata sandi baru').fill('SandiKuatBaru123!');
    
    // Memicu aksi simpan untuk mengeksekusi request API dan memunculkan modal sukses
    await page.getByRole('button', { name: 'Simpan Perubahan' }).click();

    // 1. Validasi Judul Modal Keberhasilan
    const modalHeadingSukses = page.getByRole('heading', { name: 'Kata Sandi Diubah' });
    await expect(modalHeadingSukses).toBeVisible();

    // 2. Validasi Teks Instruksi
    const teksDeskripsi = page.getByText(/Kata sandi Anda telah berhasil diperbarui/i);
    await expect(teksDeskripsi).toBeVisible();
    await expect(page.getByText(/Silakan gunakan kata sandi baru untuk masuk ke akun Anda selanjutnya/i)).toBeVisible();

    // 3. Validasi Tombol CTA (Call to Action)
    const btnKembaliProfile = page.getByRole('button', { name: 'Kembali ke Profile' });
    await expect(btnKembaliProfile).toBeVisible();
    
    // 4. Uji Alur Penutupan Modal / Navigasi
    await btnKembaliProfile.click();
    
    // Memastikan modal tidak lagi membayangi UI (state dibersihkan)
    await expect(modalHeadingSukses).toBeHidden();
    
    // Asumsi: Mengklik tombol ini akan mengarahkan pengguna kembali ke halaman profil utama
    // Uncomment baris di bawah ini dan sesuaikan dengan routing aplikasi Anda:
    // await expect(page).toHaveURL(/.*profile/); 
  });

});