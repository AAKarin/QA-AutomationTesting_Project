import { test, expect } from '@playwright/test';
import path from 'path';

test.describe.serial('E2E Flow Pembelian Paket & Upload Bukti', () => {
  let context;
  let page;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test.afterAll(async () => {
    await context.close();
  });

  test('Test Case 1: Memilih Paket Pembelian', async () => {
    await page.goto('https://layarbaca.app/', { waitUntil: 'domcontentloaded', timeout: 30000 });

    const btnBeliPaket = page.getByText(/BELI PAKET/i).first();
    await expect(btnBeliPaket).toBeVisible({ timeout: 10000 });
    await btnBeliPaket.click();

    const paketHarian = page.getByText(/Paket harian/i).first();
    await expect(paketHarian).toBeVisible({ timeout: 10000 });
    await paketHarian.click();

    const btnLanjutKePembayaran = page.getByRole('button', { name: /LANJUT KE PEMBAYARAN/i });
    await btnLanjutKePembayaran.click();
  });

  test('Test Case 2: Mengisi Formulir & Validasi WhatsApp', async () => {
    const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]').first();
    await expect(emailInput).toBeVisible({ timeout: 15000 });
    await emailInput.fill('angel.akun.test.1@gmail.com');

    const waCheckboxLabel = page.getByText(/Saya ingin menerima pemberitahuan melalui WA/i);
    await waCheckboxLabel.click();

    const btnLanjutPembayaran = page.getByRole('button', { name: /LANJUT PEMBAYARAN/i });
    await btnLanjutPembayaran.click();

    const errorWaMessage = page.getByText(/Nomor WhatsApp tidak boleh kosong/i).first();
    await expect(errorWaMessage).toBeVisible({ timeout: 10000 });

    const waInput = page.locator('input[placeholder="8..."]').first();
    await waInput.fill('8239400913448');

    const btn7Hari = page.getByRole('button', { name: '7 HARI', exact: true });
    await btn7Hari.click();
    
    await btnLanjutPembayaran.click();
  });

  test('Test Case 3: Membuka Tab Baru QRIS & Verifikasi URL', async () => {
    const unduhQrisBtn = page.locator('button, a').filter({ hasText: /Unduh QRIS/i }).first();
    await expect(unduhQrisBtn).toBeVisible({ timeout: 15000 });
    
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      unduhQrisBtn.click()
    ]);

    await newPage.waitForLoadState();
    expect(newPage.url()).toContain('cdn.layarbaca.app');
    await newPage.close();

    const btnLanjutkan = page.getByRole('button', { name: /SAYA SUDAH BAYAR/i });
    await btnLanjutkan.scrollIntoViewIfNeeded();
    await btnLanjutkan.click();
  });

  test('Test Case 4: Upload Bukti Pembayaran & Autentikasi', async () => {
    await expect(page.getByText(/Konfirmasi Valid/i).first()).toBeVisible({ timeout: 15000 });

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText(/Ketuk untuk unggah bukti/i).click({ force: true });
    
    const fileChooser = await fileChooserPromise;
    const imagePath = path.resolve(__dirname, '../../utils/dummy-image.png');
    await fileChooser.setFiles(imagePath);

    await page.waitForTimeout(1000);

    const btnBukaAutentikasi = page.getByRole('button', { name: /BUKA AUTENTIKASI/i });
    await expect(btnBukaAutentikasi).toBeVisible();
    await btnBukaAutentikasi.click();
  });
});