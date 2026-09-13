import { test, expect } from '@playwright/test';

const BASE_URL = process.env.RUANGKREATIV_URL || 'http://localhost:3000';

test.describe('RuangKreativ - Halaman Portofolio Karya AI', () => {

  test.beforeEach(async ({ page }) => {
    // Navigasi ke halaman portofolio
    await page.goto(`${BASE_URL}/portofolio`); 
  });

  test('TC29: Validasi Fungsionalitas Pencarian Video Portofolio', async ({ page }) => {
    const inputSearch = page.getByPlaceholder(/Ketik gaya video, topik, atau industri/i);
    const btnCari = page.getByRole('button', { name: 'Cari' });

    // Uji coba pencarian spesifik (misal: "Sneakers")
    await inputSearch.fill('Sneakers');
    await btnCari.click();
    
    // Pastikan kartu HypeStep AI muncul
    await expect(page.getByText('HypeStep AI — Video Promosi Sneakers')).toBeVisible();
    // Pastikan kartu yang tidak relevan (Kabar Pagi) tidak muncul
    await expect(page.getByText('Kabar Pagi AI')).not.toBeVisible();
  });

  test('TC30: Validasi Penyaringan Galeri Menggunakan Chip Kategori', async ({ page }) => {
    // Cari tombol chip "Iklan Produk"
    const chipIklanProduk = page.getByRole('button', { name: 'Iklan Produk', exact: true });
    
    await chipIklanProduk.click();
    
    // Pastikan chip memiliki status aktif (misal dengan penanda class dari framework UI)
    await expect(chipIklanProduk).toHaveClass(/bg-blue|active|selected/);
    
    // Pastikan hanya portofolio berlabel Iklan Produk yang muncul
    await expect(page.getByText('HypeStep AI')).toBeVisible();
    await expect(page.getByText('PureGlow Organic')).toBeVisible();
    await expect(page.getByText('NusaVerse Cerita Rakyat')).not.toBeVisible(); // Ini animasi 3D
  });

  test('TC31: Validasi Fungsionalitas Pengurutan menggunakan Dropdown', async ({ page }) => {
    // Buka dropdown urutkan
    const dropdownUrutkan = page.locator('select'); // Sesuaikan locator jika menggunakan elemen custom dropdown
    
    // Ubah ke opsi lain, misal Durasi (asumsi value 'durasi' atau sejenisnya ada di select)
    await dropdownUrutkan.selectOption({ label: 'Terbaru' }); 
    // Anda bisa melakukan pengecekan DOM untuk melihat apakah urutan node elemen kartu berubah
    // (Pengecekan spesifik ini bergantung pada data yang dikembalikan dan layout UI)
  });

  test('TC32: Validasi Kelengkapan Informasi pada Kartu Portofolio', async ({ page }) => {
    // Targetkan salah satu kartu secara spesifik
    const kartuKabarPagi = page.locator('.kartu-portofolio').filter({ hasText: 'Kabar Pagi AI' }); // Sesuaikan class target
    
    // Validasi judul dan deskripsi
    await expect(kartuKabarPagi.getByText('Kabar Pagi AI — Demonstrasi AI Presenter')).toBeVisible();
    
    // Validasi badge kategori
    await expect(kartuKabarPagi.getByText('REALISTIS', { exact: true })).toBeVisible();
    
    // Validasi durasi
    await expect(kartuKabarPagi.getByText('3 Menit')).toBeVisible();
    
    // Validasi tombol play
    await expect(kartuKabarPagi.getByRole('button', { name: /Play Preview/i })).toBeVisible();
  });

  test('TC33: Validasi Fungsionalitas Pemutaran Preview Video', async ({ page }) => {
    const kartuHypeStep = page.locator('.kartu-portofolio').filter({ hasText: 'HypeStep AI' });
    const btnPlay = kartuHypeStep.getByRole('button', { name: /Play Preview/i });

    await btnPlay.click();
    
    // Validasi munculnya pop-up modal / video player
    const modalVideo = page.locator('dialog, .modal-video'); 
    await expect(modalVideo).toBeVisible();
    
    // Validasi tag video di dalam modal
    await expect(modalVideo.locator('video, iframe')).toBeVisible();
  });

  test('TC34: Validasi Fungsionalitas Tombol "Muat Lebih Banyak"', async ({ page }) => {
    const btnMuatLebih = page.getByRole('button', { name: /Muat Lebih Banyak/i });
    
    // Hitung elemen sebelum klik
    const jumlahAwal = await page.locator('.kartu-portofolio').count(); // Sesuaikan class

    // Gulir dan klik (jika tombol visible, artinya data belum ter-load semua)
    if (await btnMuatLebih.isVisible()) {
        await btnMuatLebih.click();
        
        // Tunggu request / animasi
        await page.waitForTimeout(2000); 
        
        // Pastikan jumlah bertambah
        const jumlahAkhir = await page.locator('.kartu-portofolio').count();
        expect(jumlahAkhir).toBeGreaterThan(jumlahAwal);
    }
  });

  test('TC35: Validasi Pencarian dengan Kata Kunci yang Tidak Menghasilkan Data (Negative Case)', async ({ page }) => {
    const inputSearch = page.getByPlaceholder(/Ketik gaya video, topik, atau industri/i);
    const btnCari = page.getByRole('button', { name: 'Cari' });

    await inputSearch.fill('qwerty12345');
    await btnCari.click();
    
    // Validasi empty state
    await expect(page.getByText(/Video portofolio tidak ditemukan/i)).toBeVisible();
  });

});