import { test, expect } from '@playwright/test';

const BASE_URL = process.env.RUANGKREATIV_URL || 'http://localhost:3000';

test.describe('RuangKreativ - Halaman Reschedule Sesi Belajar AI', () => {

  test.beforeEach(async ({ page }) => {
    // Navigasi ke halaman reschedule. 
    // Pada skenario riil, pastikan pengguna sudah terautentikasi dan memiliki ID sesi yang valid
    await page.goto(`${BASE_URL}/reschedule/SES-12345`); // Contoh URL route
  });

  test('TC57: Validasi Tampilan Informasi "Jadwal Saat Ini" dan "Trainer Terpilih"', async ({ page }) => {
    // Memastikan kotak Jadwal Saat Ini tampil
    await expect(page.getByText('Jadwal Saat Ini')).toBeVisible();
    await expect(page.getByText(/Senin, 24 Mei 2024.*14:00 WIB/)).toBeVisible(); // Menyesuaikan regex dengan teks aktual

    // Memastikan informasi Trainer Terpilih tampil
    await expect(page.getByText('TRAINER TERPILIH')).toBeVisible();
    await expect(page.getByText('Budi Santoso')).toBeVisible();
    await expect(page.getByText('AI Specialist')).toBeVisible();
  });

  test('TC58: Validasi Pemilihan Opsi "Pilih Tanggal Belajar Baru" dan Tanggal Non-aktif', async ({ page }) => {
    // Uji klik tanggal aktif (Misal: 26)
    const btnTanggalAktif = page.getByRole('button', { name: /Sel 26/i });
    await btnTanggalAktif.click();
    
    // Validasi indikator visual bahwa tanggal terpilih (biasanya menggunakan class/border aktif)
    await expect(btnTanggalAktif).toHaveClass(/border-blue|active|selected/i); 

    // Uji klik tanggal non-aktif (Misal: 29)
    const btnTanggalNonAktif = page.getByRole('button', { name: /Jum 29/i });
    
    // Pastikan elemen dalam kondisi disabled dan tidak dapat diklik
    await expect(btnTanggalNonAktif).toBeDisabled(); 
  });

  test('TC59: Validasi Pemilihan Slot Waktu pada "Pilih Jam Tersedia Baru"', async ({ page }) => {
    const btnJam1300 = page.getByRole('button', { name: '13:00 WIB' });
    
    await btnJam1300.click();
    
    // Validasi perubahan visual/state menjadi aktif (misal warna background berubah)
    await expect(btnJam1300).toHaveClass(/bg-blue-600|active|text-white/);
  });

  test('TC60: Validasi Pembaruan Otomatis pada Kartu "Detail Jadwal Baru"', async ({ page }) => {
    // Pilih Tanggal
    await page.getByRole('button', { name: /Sel 26/i }).click();
    // Pilih Jam
    await page.getByRole('button', { name: '13:00 WIB' }).click();

    // Pastikan kotak rincian jadwal terbawah diperbarui secara real-time
    const kartuDetailBaru = page.locator('div').filter({ hasText: 'DETAIL JADWAL BARU' }).last();
    
    await expect(kartuDetailBaru.getByText('Selasa, 26 Mei 2024')).toBeVisible();
    await expect(kartuDetailBaru.getByText('13:00 WIB • Sesi 1 Jam')).toBeVisible();
  });

  test('TC61: Validasi Fungsionalitas Tombol "Konfirmasi Jadwal Baru"', async ({ page }) => {
    // Lakukan pemilihan jadwal
    await page.getByRole('button', { name: /Sel 26/i }).click();
    await page.getByRole('button', { name: '13:00 WIB' }).click();

    // Klik tombol konfirmasi
    const btnKonfirmasi = page.getByRole('button', { name: 'Konfirmasi Jadwal Baru ->' });
    await btnKonfirmasi.click();

    // Validasi pengalihan halaman setelah berhasil mengirim jadwal baru
    // Biasanya dialihkan kembali ke Dashboard Sesi Saya atau memunculkan notifikasi sukses
    await expect(page).toHaveURL(/.*(sesi-saya|pesanan-saya)/);
  });

  test('TC62: Validasi Pencegahan Submission (Negative Case) Jika Jadwal Belum Lengkap', async ({ page }) => {
    const btnKonfirmasi = page.getByRole('button', { name: 'Konfirmasi Jadwal Baru ->' });

    // Jangan pilih tanggal atau jam, lalu coba klik tombol konfirmasi
    // Tombol seharusnya berada pada kondisi disabled (atribut HTML disabled)
    // ATAU menampilkan alert "Silakan pilih jadwal"
    
    if (await btnKonfirmasi.isDisabled()) {
      await expect(btnKonfirmasi).toBeDisabled();
    } else {
      await btnKonfirmasi.click();
      await expect(page.getByText(/Silakan pilih tanggal dan jam baru/i)).toBeVisible();
    }
  });

});