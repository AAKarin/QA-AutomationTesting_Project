import { test, expect } from '@playwright/test';
import path from 'path';

const BASE_URL = process.env.RUANGKREATIV_URL || 'http://localhost:3000';

test.describe('RuangKreativ - Halaman Pesan Jasa Video AI', () => {

  test.beforeEach(async ({ page }) => {
    // Navigasi ke halaman form pemesanan jasa video
    await page.goto(`${BASE_URL}/pesan-jasa-video`); 
  });

  test('TC21: Validasi Pemilihan Opsi "Gaya Visual Video"', async ({ page }) => {
    const btn3DAnimasi = page.locator('div').filter({ hasText: '3D Animasi / Kartun' }).first();
    const btnCinematic = page.locator('div').filter({ hasText: 'Cinematic / Ads' }).first();

    // Uji klik opsi 3D Animasi
    await btn3DAnimasi.click();
    // Memastikan status visual aktif (class indikator terpilih atau adanya icon check)
    await expect(btn3DAnimasi).toHaveClass(/border-blue|active|selected/); 

    // Uji berpindah opsi ke Cinematic
    await btnCinematic.click();
    await expect(btnCinematic).toHaveClass(/border-blue|active|selected/);
    await expect(btn3DAnimasi).not.toHaveClass(/border-blue|active|selected/);
  });

  test('TC22: Validasi Pemilihan Opsi "Format Orientasi"', async ({ page }) => {
    const btnPortrait = page.locator('div').filter({ hasText: '9:16 (Portrait)' }).first();

    await btnPortrait.click();
    // Memastikan status orientasi berpindah secara presisi
    await expect(btnPortrait).toHaveClass(/border-blue|active|selected/);
  });

  test('TC23: Validasi Penginputan Skrip/Deskripsi pada Textarea', async ({ page }) => {
    const inputSkrip = page.getByPlaceholder('Contoh: Video dibuka dengan adegan...');
    const teksUji = 'Video dibuka dengan adegan promosi produk terbaru di ruang tamu yang cerah.';

    await inputSkrip.fill(teksUji);
    // Memastikan input teks tersimpan di form tanpa terpotong
    await expect(inputSkrip).toHaveValue(teksUji);
  });

  test('TC24: Validasi Pengunggahan File Skrip (Format Valid)', async ({ page }) => {
    // Siapkan file dummy untuk tes (pastikan file ini ada di folder proyek Anda)
    const fileSkripValid = path.join(__dirname, 'dummy_data', 'skrip_video.pdf');
    
    // Menargetkan input type file yang biasanya di-hide di belakang area Drag & Drop
    const fileInput = page.locator('input[type="file"]');
    
    // Melakukan proses unggah
    await fileInput.setInputFiles(fileSkripValid);
    
    // Validasi indikator sukses (nama file muncul di UI)
    await expect(page.getByText('skrip_video.pdf')).toBeVisible();
  });

  test('TC25: Validasi Penolakan File Skrip dengan Ekstensi Tidak Didukung (Negative Case)', async ({ page }) => {
    const fileSkripInvalid = path.join(__dirname, 'dummy_data', 'gambar_logo.png');
    const fileInput = page.locator('input[type="file"]');
    
    await fileInput.setInputFiles(fileSkripInvalid);
    
    // Validasi munculnya pesan error format
    await expect(page.getByText(/Format file tidak didukung/i)).toBeVisible();
  });

  test('TC26: Validasi Error Form saat Opsi Wajib Dikosongkan (Negative Case)', async ({ page }) => {
    // Asumsi: Form bisa di-reset atau tidak ada opsi default yang terpilih
    // Langsung klik Lanjut ke Pembayaran tanpa mengisi Gaya Visual dan Orientasi
    await page.getByRole('button', { name: 'Lanjut ke Pembayaran' }).click();

    // Validasi munculnya pesan validasi bahwa field wajib harus diisi
    const pesanErrorGaya = page.getByText(/Gaya Visual Video wajib dipilih/i);
    const pesanErrorOrientasi = page.getByText(/Format Orientasi wajib dipilih/i);
    
    await expect(pesanErrorGaya).toBeVisible();
    await expect(pesanErrorOrientasi).toBeVisible();
  });

  test('TC27: Validasi Tampilan Rincian "Estimasi Biaya" dan Tombol "Lanjut ke Pembayaran"', async ({ page }) => {
    // Validasi teks estimasi biaya
    await expect(page.getByText('ESTIMASI BIAYA')).toBeVisible();
    await expect(page.getByText('Rp 500.000 / 3 Menit Video')).toBeVisible();
    await expect(page.getByText('Harga dapat berubah sesuai kerumitan revisi.')).toBeVisible();

    // Prasyarat: Isi form wajib agar bisa lanjut
    await page.locator('div').filter({ hasText: 'Realistis (Avatar)' }).first().click();
    await page.locator('div').filter({ hasText: '16:9 (Landscape)' }).first().click();

    // Klik tombol pembayaran
    await page.getByRole('button', { name: 'Lanjut ke Pembayaran' }).click();
    
    // Validasi pengalihan halaman ke checkout/payment
    await expect(page).toHaveURL(/.*checkout|pembayaran/);
  });
});