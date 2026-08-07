import { test, expect } from '@playwright/test';
// Pastikan Anda mengimpor dotenv agar Playwright bisa membaca file .env
import 'dotenv/config';

test('Validasi Elemen & Interaksi IMK Halaman Studio AIKreativ - Staging', async ({ page }) => {
  // 1. Mengambil URL Staging dari file .env
  const baseUrl = process.env.AIKREATIV_STAGING_URL;
  
  // Memastikan baseUrl tidak undefined sebelum lanjut
  expect(baseUrl).toBeDefined();

  // Navigasi ke halaman target (Base URL + Path Studio)
  await page.goto(`${baseUrl}studio?tab=image-to-video`);

  // 2. Memastikan Elemen Navigasi terlihat dan bisa diakses
  await expect(page.locator('button[title="KEMBALI"]')).toBeVisible();
  await expect(page.locator('button[title="Switch to English"]')).toBeVisible();
  await expect(page.locator('button[title="Panel User"]')).toBeVisible();

  // [TAMBAHAN] Menutup banner promo jika muncul agar tidak menghalangi interaksi
  const closeBannerBtn = page.locator('button', { hasText: 'Close' }).first();
  // Gunakan try-catch atau pengecekan visibilitas agar tidak error jika banner tidak muncul
  if (await closeBannerBtn.isVisible()) {
    await closeBannerBtn.click();
  }

  // 3. Interaksi dengan area Prompt
  // Menggunakan Regex untuk mencocokkan sebagian teks placeholder yang baru
  const promptInput = page.getByPlaceholder(/Jelaskan gerakan dan transformasi/i).first();
  await expect(promptInput).toBeVisible();
  await promptInput.fill('Foto sinematik seorang astronot mendarat di Mars');

  // 4. Validasi Interaksi Parameter Generasi
  const seedInput = page.locator('input[type="number"]').first();
  await expect(seedInput).toHaveValue('123456');
  await seedInput.fill('888888');

  const qualitySelect = page.locator('select');
  await qualitySelect.selectOption('4K');

  // 5. Memastikan area Upload Referensi fungsional
  const uploadBtn = page.getByText('Upload', { exact: true }).first();
  await expect(uploadBtn).toBeVisible();

  // 6. Validasi Aturan HCI: Pencegahan Error
  const generateBtn = page.locator('button:has-text("Generate")').first();
  await expect(generateBtn).toBeDisabled(); 
});