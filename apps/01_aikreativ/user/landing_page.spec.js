import { test, expect } from '@playwright/test';

test.describe('Landing Page AIKreativ (Pra-Production)', () => {
  test.setTimeout(60000);
  const BASE_URL = process.env.AIKREATIV_PRAPRODUCTION_URL || 'https://pra-production.aikreativ.app';

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL); 
  });

  test('Validasi Navigasi Utama dan Lokalisasi Bahasa (ID/EN)', async ({ page }) => {
    // Memastikan tombol brand bisa diakses
    await expect(page.getByRole('button', { name: 'AI Kreativ .app' })).toBeVisible();

    // Validasi ubah bahasa ke English
    await page.getByRole('button', { name: 'EN', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'CREATE AI IMAGE & VIDEO IN' })).toBeVisible();

    // Kembalikan ke bahasa Indonesia
    await page.getByRole('button', { name: 'ID', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'BUAT GAMBAR & VIDEO AI DALAM' })).toBeVisible();
  });

  test('Memvalidasi Menu Navigasi (Galeri, Model AI, Paket Kredit)', async ({ page }) => {
    // Menu Galeri
    await page.getByRole('link', { name: 'Galeri', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Apa yang Bisa Anda Ciptakan?' })).toBeVisible();

    // Menu Model AI
    await page.getByRole('link', { name: 'Model AI', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Akses Semua Model AI Unggulan' })).toBeVisible();

    // Menu Paket Kredit
    await page.getByRole('link', { name: 'Paket Kredit' }).click();
    await expect(page.getByRole('heading', { name: 'Mulai dari Rp14.000' })).toBeVisible();
  });

  test('Validasi Tab Harga (Topup Eceran vs Langganan)', async ({ page }) => {
    await page.getByRole('link', { name: 'Paket Kredit' }).click();

    // Tab Topup Eceran
    await page.getByRole('button', { name: 'TOPUP ECERAN Beli sesuai' }).click();
    await expect(page.getByText('PAKET HEMAT', { exact: true })).toBeVisible();
    await expect(page.getByText('PAKET POPULER', { exact: true })).toBeVisible();
    await expect(page.getByText('PAKET PRO TERBAIK')).toBeVisible();

    // Tab Langganan
    await page.getByRole('button', { name: 'LANGGANAN Lebih hemat untuk' }).click();
    await expect(page.getByText('PERTALITE', { exact: true })).toBeVisible();
    await expect(page.getByText('PERTAMAX', { exact: true })).toBeVisible();
    await expect(page.getByText('PREMIUM', { exact: true })).toBeVisible();
  });

  test('Validasi Fungsionalitas Akordion FAQ', async ({ page }) => {
    await page.getByText('Pertanyaan Umum', { exact: true }).click();

    // Klik dan validasi FAQ 1
    await page.getByRole('button', { name: 'Apakah kredit yang saya beli' }).click();
    await expect(page.getByText('Tidak. Semua kredit yang')).toBeVisible();

    // Klik dan validasi FAQ 2
    await page.getByRole('button', { name: 'Berapa lama waktu rendering' }).click();
    await expect(page.getByText('Rendering video berkisar')).toBeVisible();

    // Klik dan validasi FAQ 3
    await page.getByRole('button', { name: 'Apakah saya bisa refund jika' }).click();
    await expect(page.getByText('Jika terjadi kendala teknis')).toBeVisible();
  });

  test('Validasi Akses Studio, Model AI, dan Tombol Kembali', async ({ page }) => {
    await page.getByRole('link', { name: 'Model AI', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Akses Semua Model AI Unggulan' })).toBeVisible();

    // ====================================================================
    // SKENARIO 1: VEO 3.1 FAST (Model Video)
    // ====================================================================
    await test.step('Klik VEO 3.1 Fast dan validasi dropdown model', async () => {
      // Menggunakan selektor persis dari rekaman Anda
      await page.getByText('VEO 3.1 FastGOOGLE SPEEDModel').first().click();
      
      // Kita cari tombol dropdown yang berakhiran kata 'search'
      const modelDropdownButton = page.locator('button:has-text("search")').first();
      
      // ASSERTION INI AKAN GAGAL (Sengaja untuk menangkap bug)
      // Playwright berharap 'VEO 3.1 Fast', tapi karena bug UI, ia akan menemukan 'Grok Imagine search'
      await expect(modelDropdownButton).toContainText(/VEO 3.1 Fast/i, { timeout: 5000 }); 
      
      await page.getByRole('button', { name: 'arrow_back KEMBALI' }).click();
    });

    // ====================================================================
    // SKENARIO 2: SEEDANCE 1.5 (Model Video)
    // ====================================================================
    await test.step('Klik Seedance 1.5 dan validasi dropdown model', async () => {
      await page.getByText('Seedance 1.5KAMERA').first().click();
      
      const modelDropdownButton = page.locator('button:has-text("search")').first();
      await expect(modelDropdownButton).toContainText(/Seedance 1.5/i, { timeout: 5000 }); 
      
      await page.getByRole('button', { name: 'arrow_back KEMBALI' }).click();
    });

    // ====================================================================
    // SKENARIO 3: SEEDREAM 5 (Model Image)
    // ====================================================================
    await test.step('Klik Seedream 5 dan validasi dropdown model', async () => {
      await page.getByText('Seedream 5EDIT KAIN &').first().click();
      
      const modelDropdownButton = page.locator('button:has-text("search")').first();
      
      // ASSERTION INI JUGA KEMUNGKINAN GAGAL
      // Sesuai rekaman Anda, UI di I2I justru menampilkan 'Flux-2 Pro search', bukan Seedream
      await expect(modelDropdownButton).toContainText(/Seedream 5/i, { timeout: 5000 }); 
    });
  });
});