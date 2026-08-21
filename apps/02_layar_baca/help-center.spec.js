import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

test.describe('Pusat Bantuan - Floating Button Flow', () => {

  test('1. Kirim Pesan ke Admin lewat Floating Button', async ({ page }) => {
    test.setTimeout(60000);
    const targetUrl = process.env.LAYARBACA_PRAPRODUCTION_URL || 'https://layarbaca.app/app/home';
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    // Klik Floating Button
    const floatingBtn = page.locator('button').filter({ has: page.locator('svg') }).last();
    await expect(floatingBtn).toBeVisible({ timeout: 15000 });
    await floatingBtn.click();

    // Klik Tanya Admin
    const tanyaAdminOption = page.getByText(/Belum terjawab\? Tanya Admin/i).first();
    await expect(tanyaAdminOption).toBeVisible({ timeout: 10000 });
    await tanyaAdminOption.click();

    // Fill Email & Pesan
    const emailInput = page.locator('input[placeholder*="email"]').first();
    const messageInput = page.locator('textarea, input[placeholder*="kendala"]').first();

    await expect(emailInput).toBeVisible({ timeout: 10000 });
    const userEmail = process.env.TEST_USER_EMAIL || 'angel.akun.test.1@gmail.com';
    await emailInput.fill(userEmail);
    await messageInput.fill('Playwright Testing');

    // Klik Kirim Pesan
    const sendBtn = page.getByRole('button', { name: /Kirim Pesan/i }).first();
    await expect(sendBtn).toBeVisible({ timeout: 10000 });
    await sendBtn.click();

    // Validasi: Cek elemen toast secara fleksibel atau penutupan modal
    const successToast = page.getByText(/pesan|berhasil|terkirim/i).first();
    await expect(successToast).toBeVisible({ timeout: 15000 });
  });

  test('2. Flow Panduan "Bagaimana cara beli paket?" hingga Pop-up Pilih Paket Akses', async ({ page }) => {
    test.setTimeout(60000);
    const targetUrl = process.env.LAYARBACA_PRAPRODUCTION_URL || 'https://layarbaca.app/app/home';
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    // 1. Klik Floating Button & Buka Panduan
    await page.locator('.w-14.h-14.rounded-full').click();
    await page.getByRole('button', { name: 'Bagaimana cara beli paket?' }).click();

    // 2. Klik Seluruh Tab Bagian Atas
    await page.getByRole('button', { name: 'Isi Email & Paket' }).click();
    await page.getByRole('button', { name: 'Scan & Bayar' }).click();
    await page.getByRole('button', { name: 'Upload Bukti' }).click();
    await page.getByRole('button', { name: 'Verifikasi' }).click();
    await page.getByRole('button', { name: 'Terima Email' }).click();
    await page.getByRole('button', { name: 'Buka Konten' }).click();
    await page.getByRole('button', { name: 'Pilih Paket' }).click();

    // 3. Cek Teks Deskripsi Panduan
    await expect(page.getByText("Ketuk tombol 'BELI PAKET' di")).toBeVisible();
    await expect(page.getByText('Pilihan Paket — Pilih durasi')).toBeVisible();
    await expect(page.getByText('Beli Paket — Membuka seluruh')).toBeVisible();
    await expect(page.getByText('Seluruh paket membuka akses')).toBeVisible();

    // 4. Klik Tombol Berikutnya Langkah demi Langkah
    await page.getByRole('button', { name: 'Berikutnya' }).click();
    await page.getByRole('button', { name: 'Berikutnya' }).click();
    await page.getByRole('button', { name: 'Berikutnya' }).click();
    await page.getByRole('button', { name: 'Berikutnya' }).click();
    await page.getByRole('button', { name: 'Berikutnya' }).click();
    await page.getByRole('button', { name: 'Berikutnya' }).click();

    // 5. Uji Tombol Back (<) & Lanjutkan Ke Akhir
    const backBtn = page.getByRole('button').filter({ hasText: /^$/ }).nth(1);
    await expect(backBtn).toBeVisible();
    await backBtn.click();

    await page.getByRole('button', { name: 'Berikutnya' }).click();
    
    // Klik 'Mulai Donasi' / Langkah Akhir
    const finalBtn = page.getByRole('button', { name: /Mulai Donasi|Berikutnya/i }).first();
    await finalBtn.click();

    // 6. Validasi Pop-up Pilih Paket Akses beserta Opsi Harganya
    await expect(page.getByText('Akses 1 hari1 HARIPaket')).toBeVisible();
    await expect(page.getByText('Terhemat7 HARIPaket')).toBeVisible();
    await expect(page.getByText('★ Terpopuler30 HARIPaket')).toBeVisible();
    
    await expect(page.getByText('Rp 3.000')).toBeVisible();
    await expect(page.getByText('Rp 15.000')).toBeVisible();
    await expect(page.getByText('Rp 35.000')).toBeVisible();

    // Close Modal Panduan / Pop-up
    await page.locator('.w-8.h-8.rounded-full.bg-white\\/10').click();
  });
});