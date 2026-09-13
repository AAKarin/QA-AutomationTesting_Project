import { test, expect } from '@playwright/test';

const BASE_URL = process.env.RUANGKREATIV_URL || 'http://localhost:3000';

test.describe('RuangKreativ - Halaman Katalog AI Specialist', () => {

  test.beforeEach(async ({ page }) => {
    // Navigasi ke halaman katalog (sesuaikan rute jika berbeda, misal /katalog atau /specialist)
    await page.goto(`${BASE_URL}/katalog`); 
  });

  test('TC15: Validasi Fungsionalitas Pencarian AI Specialist berdasarkan Nama/Keahlian', async ({ page }) => {
    const inputSearch = page.getByPlaceholder(/Cari nama specialist atau keahlian/i);
    const btnCari = page.getByRole('button', { name: 'Cari' });

    // Mencari berdasarkan nama (Budi)
    await inputSearch.fill('Budi');
    await btnCari.click();
    await expect(page.getByText('Budi Santoso')).toBeVisible();
    await expect(page.getByText('Siti Rahma')).not.toBeVisible();

    // Mencari berdasarkan keahlian (Runway)
    await inputSearch.fill('Runway');
    await btnCari.click();
    await expect(page.getByText('Siti Rahma')).toBeVisible();
  });

  test('TC16: Validasi Pencarian dengan Kata Kunci yang Tidak Ditemukan', async ({ page }) => {
    const inputSearch = page.getByPlaceholder(/Cari nama specialist atau keahlian/i);
    const btnCari = page.getByRole('button', { name: 'Cari' });

    await inputSearch.fill('XYZ123');
    await btnCari.click();

    // Sesuaikan teks empty state dengan yang ada di aplikasi Anda
    const pesanKosong = page.getByText(/Tidak ada AI Specialist yang ditemukan/i);
    await expect(pesanKosong).toBeVisible();
  });

  test('TC17: Validasi Penyaringan Daftar AI Specialist Menggunakan Chip Kategori', async ({ page }) => {
    const chipCinematic = page.getByRole('button', { name: 'Cinematic', exact: true });
    
    await chipCinematic.click();
    
    // Memastikan status chip aktif (misal dengan pengecekan class warna background/border aktif)
    await expect(chipCinematic).toHaveClass(/bg-blue|active/); 
    
    // Pastikan spesialis Cinematic muncul dan yang lain hilang
    await expect(page.getByText('Siti Rahma')).toBeVisible();
    await expect(page.getByText('Budi Santoso')).not.toBeVisible();
  });

  test('TC18: Validasi Pembaruan Otomatis Teks Indikator Jumlah Hasil', async ({ page }) => {
    const indikatorJumlah = page.getByText(/Menampilkan.*AI Specialist/i);
    
    // Awalnya (Semua) harusnya ada 2
    await expect(indikatorJumlah).toHaveText(/Menampilkan 2 AI Specialist/i);

    // Klik filter yang hanya memiliki 1 spesialis
    await page.getByRole('button', { name: 'AI Avatar', exact: true }).click();
    
    // Angka harus berubah menjadi 1
    await expect(indikatorJumlah).toHaveText(/Menampilkan 1 AI Specialist/i);
  });

  test('TC19: Validasi Kelengkapan Informasi pada Kartu Profil AI Specialist', async ({ page }) => {
    // Validasi kartu Budi Santoso
    const kartuBudi = page.locator('.kartu-spesialis').filter({ hasText: 'Budi Santoso' }); // Ganti class locator jika perlu
    
    await expect(page.getByText('Al Avatar Specialist')).toBeVisible();
    await expect(page.getByText('4.9 (120 Murid)')).toBeVisible();
    await expect(page.getByText('Midjourney')).toBeVisible();
    await expect(page.getByText('HeyGen')).toBeVisible();
    
    // Validasi harga pada kartu
    await expect(page.getByText('Rp 150.000 / Sesi').first()).toBeVisible();
  });

  test('TC20: Validasi Fungsionalitas Tombol "Pilih & Lihat Jadwal ->"', async ({ page }) => {
    // Cari tombol "Pilih & Lihat Jadwal ->" pada kartu milik Budi Santoso
    const tombolPilih = page.locator('div').filter({ hasText: 'Budi Santoso' }).getByRole('button', { name: /Pilih & Lihat Jadwal/i }).first();
    
    await tombolPilih.click();
    
    // Memastikan diarahkan ke halaman penjadwalan (sesuaikan format URL-nya)
    await expect(page).toHaveURL(/.*jadwal/);
  });

  test('TC21: Validasi Konsistensi dan Fungsionalitas Tautan pada Footer', async ({ page }) => {
    const footer = page.locator('footer'); // Targetkan tag HTML footer
    
    await expect(footer.getByText('© 2024 Katalog AI Specialist.')).toBeVisible();
    await expect(footer.getByRole('link', { name: 'Program Kami' })).toBeVisible();
    await expect(footer.getByRole('link', { name: 'Kelas Private 1-on-1' })).toBeVisible();
    await expect(footer.getByRole('link', { name: 'Privacy Policy' })).toBeVisible();
  });

});