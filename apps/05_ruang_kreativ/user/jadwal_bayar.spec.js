import { test, expect } from '@playwright/test';

const BASE_URL = process.env.RUANGKREATIV_URL || 'http://localhost:3000';

test.describe('RuangKreativ - Penjadwalan Sesi & Pembayaran', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigasi ke halaman penjadwalan (sesuaikan dengan rute aslinya)
    await page.goto(`${BASE_URL}/jadwal`);
  });

  test('TC08: Validasi Tampilan Informasi Trainer dan Biaya Kelas', async ({ page }) => {
    await expect(page.getByText('TRAINER TERPILIH')).toBeVisible();
    await expect(page.getByText('Budi Santoso (AI Specialist)')).toBeVisible();
    await expect(page.getByText('Biaya Kelas')).toBeVisible();
    await expect(page.getByText('Rp 150.000 / Sesi')).toBeVisible();
  });

  test('TC09: Validasi Pemilihan Tanggal Belajar & Perubahan Status Visual', async ({ page }) => {
    // Mencari elemen tanggal (misal: RAB 26)
    const btnTanggalRabu = page.getByRole('button', { name: 'RAB 26' });
    
    // Klik dan validasi status terpilih
    await btnTanggalRabu.click();
    
    // Asumsi: Saat diklik, tombol akan memiliki border biru/ungu (misal via class 'border-blue-600' atau aria-pressed)
    // Gunakan regex untuk mencocokkan class tailwind yang menandakan state aktif
    await expect(btnTanggalRabu).toHaveClass(/border-blue-700|ring|active/); 
  });

  test('TC10: Validasi Pemilihan Jam/Slot Waktu Belajar Tersedia', async ({ page }) => {
    const btnJam = page.getByRole('button', { name: '13:00 WIB' });
    
    await btnJam.click();
    await expect(btnJam).toHaveClass(/border-blue-700|ring|active/);
  });

  test('TC11: Validasi Pembaruan Otomatis Teks "Detail Jadwal"', async ({ page }) => {
    // Pilih kombinasi tanggal dan jam
    await page.getByRole('button', { name: 'SEL 25' }).click();
    await page.getByRole('button', { name: '10:00 WIB' }).click();

    // Validasi pembaruan teks (Sesuaikan bulan/tahun dengan default di environment Anda)
    await expect(page.getByText(/Selasa, 25.*10:00 WIB/)).toBeVisible();
  });

  test('TC12: Validasi Fungsionalitas Tombol "Bayar Rp 150.000 & Konfirmasi"', async ({ page }) => {
    // Prasyarat: Pilih tanggal dan jam
    await page.getByRole('button', { name: 'SEL 25' }).click();
    await page.getByRole('button', { name: '10:00 WIB' }).click();

    const btnBayar = page.getByRole('button', { name: 'Bayar Rp 150.000 & Konfirmasi' });
    await expect(btnBayar).toBeEnabled();
    
    // Uji klik dan pastikan mengarah ke halaman payment gateway
    await btnBayar.click();
    
    // Validasi URL atau elemen di halaman selanjutnya
    await expect(page).toHaveURL(/.*payment|checkout/);
  });

  test('TC13: Validasi Penanganan Kondisi Menekan Konfirmasi Tanpa Memilih Jadwal (Negative Case)', async ({ page }) => {
    // Langsung klik tanpa memilih jadwal
    const btnBayar = page.getByRole('button', { name: 'Bayar Rp 150.000 & Konfirmasi' });
    await btnBayar.click();

    // Validasi munculnya pesan error/peringatan di UI
    const notifikasiPeringatan = page.getByText(/Silakan pilih tanggal dan jam/i); // Ganti dengan teks error asli aplikasi Anda
    await expect(notifikasiPeringatan).toBeVisible();
  });

  test('TC14: Validasi Tampilan Pemberitahuan Pengiriman Zoom & Invoice', async ({ page }) => {
    const infoTeks = page.getByText('Link Zoom & Invoice akan dikirim otomatis ke email Anda setelah pembayaran.');
    await expect(infoTeks).toBeVisible();
  });
});