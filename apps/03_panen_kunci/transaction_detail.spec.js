// @ts-check
import { test, expect } from '@playwright/test';
require('dotenv').config();

test.describe('Modul: Transaction Detail (Pencairan) - Panen Kunci', () => {

  const BASE_URL = process.env.BASE_URL_PANEN_KUNCI || 'http://localhost:3000';

  test.beforeEach(async ({ page }) => {
    // Navigasi ke halaman detail transaksi / pencairan
    await page.goto(`${BASE_URL}/transaction-detail`); 
  });

  // TC-41: Validasi tampilan saldo tersedia dan tombol riwayat
  test('Memastikan header, saldo tersedia, dan tombol riwayat dirender dengan benar', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Transaction Detail' })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: '←' })).toBeVisible();

    await expect(page.getByText('SALDO TERSEDIA')).toBeVisible();
    await expect(page.getByText('Rp 1.240.500')).toBeVisible();

    const btnRiwayat = page.getByRole('button', { name: 'Riwayat' }).or(page.getByRole('link', { name: 'Riwayat' }));
    await expect(btnRiwayat).toBeVisible();
  });

  test('Memvalidasi input nominal penarikan dan fungsionalitas "Tarik Semua"', async ({ page }) => {
    await expect(page.getByText('Nominal Penarikan')).toBeVisible();
    
    const inputNominal = page.locator('input[type="text"]').first(); // Disesuaikan dengan selector input nominal
    await expect(inputNominal).toBeVisible();
    
    // Validasi tombol Tarik Semua
    const btnTarikSemua = page.getByRole('button', { name: 'Tarik Semua' });
    await expect(btnTarikSemua).toBeVisible();
    
    // Simulasi klik Tarik Semua (seharusnya mengisi input secara otomatis)
    await btnTarikSemua.click();
    // await expect(inputNominal).toHaveValue('1240500'); // Asumsi format value tanpa titik
  });

  test('Memvalidasi pemilihan metode pencairan dan verifikasi akun tujuan', async ({ page }) => {
    await expect(page.getByText('Metode Pencairan')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Lihat Semua' })).toBeVisible();

    // Memilih metode DANA
    const cardDana = page.getByText('DANA', { exact: true });
    await cardDana.click();
    // Validasi state terpilih (misal ada icon check atau class active)
    // await expect(cardDana).toHaveClass(/active/);

    // Input nomor handphone/rekening
    await expect(page.getByText('Nomor Handphone / Rekening')).toBeVisible();
    const inputRekening = page.locator('input[type="text"]').nth(1); 
    await inputRekening.fill('081234567890');

    // Validasi munculnya badge nama terverifikasi (Mockup: Budi Santoso (DANA))
    // Biasanya ini memanggil API pengecekan nama secara asinkron
    const badgeNama = page.getByText('Budi Santoso (DANA)');
    await expect(badgeNama).toBeVisible();
  });

  test('Memvalidasi rincian transaksi dan tombol konfirmasi', async ({ page }) => {
    await expect(page.getByText('RINCIAN TRANSAKSI')).toBeVisible();
    
    // Validasi kalkulasi rincian
    await expect(page.getByText('Jumlah Penarikan')).toBeVisible();
    await expect(page.getByText('Rp 500.000').first()).toBeVisible();
    
    await expect(page.getByText('Biaya Admin')).toBeVisible();
    await expect(page.getByText('Rp 0')).toBeVisible();
    
    await expect(page.getByText('Total Diterima')).toBeVisible();
    await expect(page.getByText('Rp 500.000').nth(1)).toBeVisible();

    // Validasi tombol CTA
    const btnKonfirmasi = page.getByRole('button', { name: 'Konfirmasi Penarikan' });
    await expect(btnKonfirmasi).toBeVisible();
    
    // Validasi teks informasi waktu proses
    await expect(page.getByText('Proses pencairan biasanya memakan waktu 1-5 menit.')).toBeVisible();
  });

  test('Memvalidasi modal Konfirmasi Penarikan, kalkulasi biaya admin, dan interaksi tombol', async ({ page }) => {
    // Asumsi: Pengguna telah menekan tombol "Konfirmasi Penarikan" di form utama
    await page.getByRole('button', { name: 'Konfirmasi Penarikan' }).click();

    // 1. Validasi Header Modal dan Tombol Close (X)
    const modalHeading = page.getByRole('heading', { name: 'Konfirmasi Penarikan' });
    await expect(modalHeading).toBeVisible();
    
    // Sesuaikan selector dengan implementasi developer (bisa berupa SVG icon, aria-label="Close", atau entitas HTML &times;)
    const btnClose = page.getByRole('button', { name: 'Close' }).or(page.locator('button.close-btn'));
    // await expect(btnClose).toBeVisible(); // Uncomment jika selector sudah dipastikan

    // 2. Validasi Rincian Transaksi (Kalkulasi Matematis)
    await expect(page.getByText('Nominal', { exact: true })).toBeVisible();
    await expect(page.getByText('Rp 150.000')).toBeVisible();

    await expect(page.getByText('Biaya Admin')).toBeVisible();
    await expect(page.getByText('-Rp 2.500')).toBeVisible();

    await expect(page.getByText('Total Diterima')).toBeVisible();
    await expect(page.getByText('Rp 147.500')).toBeVisible();

    // 3. Validasi Informasi Tujuan
    await expect(page.getByText('TUJUAN')).toBeVisible();
    // Memastikan sebagian nomor disensor (masking) untuk keamanan
    await expect(page.getByText('BCA - ****5678')).toBeVisible();

    // 4. Validasi Pesan Peringatan
    await expect(page.getByText('Pastikan data di atas sudah benar sebelum melanjutkan.')).toBeVisible();

    // 5. Validasi Tombol Aksi
    const btnBatal = page.getByRole('button', { name: 'Batal' });
    const btnTarikSekarang = page.getByRole('button', { name: /Tarik Sekarang/i }); // Regex untuk mengakomodasi panah (->)
    
    await expect(btnBatal).toBeVisible();
    await expect(btnTarikSekarang).toBeVisible();

    // 6. Uji Interaksi Pembatalan (State Reset)
    await btnBatal.click();
    await expect(modalHeading).toBeHidden(); // Memastikan modal tertutup

    // 7. Buka kembali modal dan uji penyelesaian (Tarik Sekarang)
    await page.getByRole('button', { name: 'Konfirmasi Penarikan' }).click();
    await btnTarikSekarang.click();
    
    // Asersi lanjutan bisa berupa kemunculan modal "Berhasil", spinner loading, atau navigasi
  });

  test('Memvalidasi modal Penarikan Berhasil setelah konfirmasi pencairan', async ({ page }) => {
    // Asumsi: Pengguna telah mengklik "Tarik Sekarang" pada modal konfirmasi sebelumnya
    // await btnTarikSekarang.click();

    // 1. Validasi Elemen Modal "Penarikan Berhasil"
    const modalHeadingSukses = page.getByRole('heading', { name: 'Penarikan Berhasil' });
    await expect(modalHeadingSukses).toBeVisible();

    // 2. Validasi Teks Deskripsi
    const teksDeskripsi = page.getByText(/Permintaan penarikan saldo Anda telah berhasil dibuat dan sedang diproses/i);
    await expect(teksDeskripsi).toBeVisible();
    await expect(page.getByText(/Dana akan segera masuk ke rekening Anda/i)).toBeVisible();

    // 3. Validasi Ringkasan Transaksi di dalam Modal
    await expect(page.getByText('Nominal', { exact: true })).toBeVisible();
    await expect(page.getByText('Rp 150.000')).toBeVisible(); // Pastikan nilainya sesuai dengan input penarikan
    
    await expect(page.getByText('Tujuan', { exact: true })).toBeVisible();
    await expect(page.getByText('BCA - ****5678')).toBeVisible();

    // 4. Validasi Tombol CTA "Selesai" dan Interaksinya
    const btnSelesai = page.getByRole('button', { name: 'Selesai' });
    await expect(btnSelesai).toBeVisible();

    // 5. Uji penyelesaian alur
    await btnSelesai.click();
    
    // Memastikan modal tertutup dan pengguna dialihkan kembali (biasanya ke Dashboard atau Riwayat)
    await expect(modalHeadingSukses).toBeHidden();
    // await expect(page).toHaveURL(/.*dashboard/); // Buka komentar dan sesuaikan rute jika ada aturan redirect
  });
});