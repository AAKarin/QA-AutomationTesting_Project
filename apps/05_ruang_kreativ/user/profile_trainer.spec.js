import { test, expect } from '@playwright/test';

const BASE_URL = process.env.RUANGKREATIV_URL || 'http://localhost:3000';
const URL_PROFIL_MENTOR = `${BASE_URL}/mentor/budi-santoso`; // Sesuaikan dengan route spesifik

test.describe('RuangKreativ - Halaman Detail Profil Mentor', () => {

  test.beforeEach(async ({ page }) => {
    // Navigasi ke halaman detail profil mentor
    await page.goto(URL_PROFIL_MENTOR);
  });

  test('TC78: Validasi kelengkapan dan akurasi informasi profil mentor utama', async ({ page }) => {
    // Validasi Nama dan Badge Role
    await expect(page.getByRole('heading', { name: 'Budi Santoso' })).toBeVisible();
    await expect(page.getByText('AI Avatar Specialist', { exact: true })).toBeVisible();

    // Validasi Rating, Jumlah Murid, dan Lokasi
    await expect(page.getByText('4.9')).toBeVisible();
    await expect(page.getByText('(120 Murid)')).toBeVisible();
    await expect(page.getByText('Jakarta, Indonesia')).toBeVisible();

    // Validasi Teks Deskripsi Bio
    const bioText = page.getByText(/Membantu Anda membuat video avatar AI yang berbicara secara natural/i);
    await expect(bioText).toBeVisible();
    await expect(page.getByText(/Ahli dalam merangkai prompt dan mengatur alur kerja produksi/i)).toBeVisible();
  });

  test('TC79: Validasi tampilan indikator statistik dan daftar Keahlian Utama', async ({ page }) => {
    // Validasi Statistik Pencapaian
    await expect(page.getByText('500+')).toBeVisible();
    await expect(page.getByText('Sesi Mentoring Sukses')).toBeVisible();

    // Validasi Daftar Tag Keahlian Utama
    const sectionKeahlian = page.locator('div').filter({ hasText: 'Keahlian Utama' }).last();
    await expect(sectionKeahlian.getByText('Midjourney', { exact: true })).toBeVisible();
    await expect(sectionKeahlian.getByText('HeyGen', { exact: true })).toBeVisible();
    await expect(sectionKeahlian.getByText('D-ID', { exact: true })).toBeVisible();
    await expect(sectionKeahlian.getByText('Adobe Premiere', { exact: true })).toBeVisible();
    await expect(sectionKeahlian.getByText('Runway Gen-2', { exact: true })).toBeVisible();
  });

  test('TC80: Validasi kartu Biaya Mentoring dan fungsionalitas tombol Pilih & Lihat Jadwal', async ({ page }) => {
    // Validasi Kartu Tarif dan Fasilitas
    const kartuBiaya = page.locator('div').filter({ hasText: 'BIAYA MENTORING' }).last();
    await expect(kartuBiaya.getByText('Rp 150.000 / Sesi')).toBeVisible();
    await expect(kartuBiaya.getByText('1 Jam sesi privat 1-on-1 via Zoom')).toBeVisible();
    
    // Uji Fungsionalitas Tombol Pemesanan
    const btnPilihJadwal = kartuBiaya.getByRole('button', { name: 'Pilih & Lihat Jadwal ->' });
    await expect(btnPilihJadwal).toBeVisible();
    await btnPilihJadwal.click();

    // Validasi pengalihan ke halaman/modal penjadwalan
    // await expect(page).toHaveURL(/.*jadwal|pemesanan/); 
    // Atau jika berupa modal:
    // await expect(page.locator('.modal-penjadwalan')).toBeVisible();
  });

  test('TC81: Validasi interaktivitas galeri dan media pada bagian Portofolio Karya AI', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Portofolio Karya AI' })).toBeVisible();

    // Validasi keberadaan kartu portofolio
    const portoCorporate = page.locator('.kartu-portofolio, div').filter({ hasText: 'Corporate Presentation Avatar' }).first();
    const portoSciFi = page.locator('.kartu-portofolio, div').filter({ hasText: 'Sci-Fi Cinematic Trailer' }).first();

    await expect(portoCorporate).toBeVisible();
    await expect(portoCorporate.getByText('Realistis')).toBeVisible();
    
    await expect(portoSciFi).toBeVisible();
    await expect(portoSciFi.getByText('Cinematic')).toBeVisible();

    // Uji interaktivitas klik thumbnail
    await portoCorporate.click();
    
    // Validasi modal video atau pratinjau karya terbuka (sesuaikan locator dengan implementasi developer)
    // await expect(page.locator('dialog, .modal-karya-ai')).toBeVisible();
  });

  test('TC82: Validasi bagian Ulasan Murid (Rating Bintang, Nama, dan Teks)', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Ulasan Murid' })).toBeVisible();

    // Validasi komponen ulasan spesifik
    const ulasanSiti = page.locator('div').filter({ hasText: 'Siti Rahmawati' }).last();
    await expect(ulasanSiti).toBeVisible();
    
    // Validasi teks testimoni
    await expect(ulasanSiti.getByText(/Sangat merekomendasikan Mas Budi! Penjelasannya sangat terstruktur/i)).toBeVisible();
    await expect(ulasanSiti.getByText(/Saya yang pemula di AI kini bisa membuat video promosi sendiri/i)).toBeVisible();

    // Validasi rendering 5 bintang (asumsi dirender menggunakan ikon SVG)
    const stars = ulasanSiti.locator('svg, .icon-star'); 
    await expect(stars).toHaveCount(5);
  });

});