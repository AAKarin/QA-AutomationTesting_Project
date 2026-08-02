const { test, expect } = require('@playwright/test');

test.describe('Pengujian Landing Page AIKreativ.app', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://staging.aikreativ.app/');
    
    // Penanganan Popup Promo "Seedream 5 Pro"
    const closePopupButton = page.getByRole('button', { name: 'Close', exact: true })
      .or(page.getByRole('button', { name: 'Nanti Dulu' }));

    // Jika popup muncul, tutup agar tidak menghalangi elemen lain di halaman utama
    if (await closePopupButton.first().isVisible().catch(() => false)) {
      await closePopupButton.first().click();
    }
  });

  // --- 1. PENGUJIAN POPUP PROMO BANNER ---
  test('0. Memeriksa Komponen Popup Promo Banner', async ({ page }) => {
    // Re-open/Check popup jika ada di awal pemuatan
    const promoHeading = page.getByRole('heading', { name: 'Seedream 5 Pro' });
    
    if (await promoHeading.isVisible().catch(() => false)) {
      // Memastikan Badge dan Judul Promo Tampil
      await expect(promoHeading).toBeVisible();
      await expect(page.getByText('🔥 Promo Special Model')).toBeVisible();

      // Memastikan Tombol Aksi di Popup Promo Tampil
      await expect(page.getByRole('button', { name: 'Nanti Dulu' })).toBeVisible();
      await expect(page.getByRole('button', { name: /Coba Model/i })).toBeVisible();
    }
  });

  // --- 2. PENGUJIAN METADATA & HEADER ---
  test('1. Memeriksa Metadata dan Judul Halaman', async ({ page }) => {
    await expect(page).toHaveTitle('AIKreativ.app - Advanced Cinematic AI Studio');
  });

  test('2. Memeriksa Elemen Header dan Navigasi', async ({ page }) => {
    const header = page.getByRole('banner');
    await expect(header.getByText('AIKreativ')).toBeVisible();
    await expect(header.getByRole('link', { name: 'Galeri' })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Model AI' })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Paket Kredit' })).toBeVisible();
    await expect(header.getByRole('button', { name: 'ID', exact: true })).toBeVisible();
    await expect(header.getByRole('button', { name: 'EN', exact: true })).toBeVisible();
  });

  // --- 3. PENGUJIAN HERO & MARQUEE ---
  test('3. Memeriksa Hero Section dan Tombol Aksi Utama (CTA)', async ({ page }) => {
    const mainSection = page.getByRole('main');
    await expect(mainSection.getByRole('heading', { level: 1 })).toContainText('BUAT GAMBAR & VIDEO AI');
    await expect(mainSection.getByRole('button', { name: 'MULAI KREASI' })).toBeVisible();
    await expect(mainSection.getByText('1 kesempatan generate gratis tanpa kartu kredit')).toBeVisible();
  });

  test('4. Memeriksa Teks Berjalan (Marquee Feature Banner)', async ({ page }) => {
    const marqueeSection = page.locator('main').locator('div').filter({ hasText: 'WAN 2.7' });
    await expect(marqueeSection.getByText('WAN 2.7').first()).toBeVisible();
    await expect(marqueeSection.getByText('IMAGE TO VIDEO').first()).toBeVisible();
    await expect(marqueeSection.getByText('NO CREDIT CARD').first()).toBeVisible();
  });

  // --- 4. PENGUJIAN SHOWCASE & INTERAKSI ---
  test('5. Memeriksa Seksi Showcase (Apa yang Bisa Anda Ciptakan?)', async ({ page }) => {
    const showcaseHeading = page.getByRole('heading', { name: 'Apa yang Bisa Anda Ciptakan?' });
    await showcaseHeading.scrollIntoViewIfNeeded();
    await expect(showcaseHeading).toBeVisible();
    await expect(page.getByText('Image to Image').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ubah Imajinasi Visual' })).toBeVisible();
  });

  test('6. Memeriksa Navigasi Anchor Link (Galeri, Model AI, Paket Kredit)', async ({ page }) => {
    const header = page.getByRole('banner');

    await header.getByRole('link', { name: 'Galeri' }).click();
    await expect(page).toHaveURL(/.*#showcase/);

    await header.getByRole('link', { name: 'Model AI' }).click();
    await expect(page).toHaveURL(/.*#models/);

    await header.getByRole('link', { name: 'Paket Kredit' }).click();
    await expect(page).toHaveURL(/.*#pricing/);
  });

  test('7. Memeriksa Tombol Bantuan / Help Center Widget', async ({ page }) => {
    const helpButton = page.getByRole('button', { name: 'Toggle help center' });
    await expect(helpButton).toBeVisible();
    await helpButton.click();
    await expect(page.getByRole('alert')).toBeAttached();
  });

  test('8. Memeriksa Tombol Beli / Top-Up Kredit', async ({ page }) => {
    const pricingHeading = page.getByRole('heading', { name: 'Mulai dari Rp14.000' });
    await pricingHeading.scrollIntoViewIfNeeded();
    await expect(page.getByRole('button', { name: 'BELI STARTER' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'BELI CREATOR' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'BELI PRO' })).toBeVisible();
  });

  test('9. Memvalidasi Klik Semua Card Model Mengarah ke Tab & Model yang Benar', async ({ page }) => {
    test.setTimeout(120000);

    const modelsData = [
        // Video-Only
        { name: 'VEO 3.1 FAST', expectedTab: 'IMAGE TO VIDEO' },
        { name: 'SEEDANCE 1.5', expectedTab: 'IMAGE TO VIDEO' },
        { name: 'SEEDANCE 2', expectedTab: 'IMAGE TO VIDEO' },
        { name: 'PIXVERSE V6', expectedTab: 'IMAGE TO VIDEO' },
        { name: 'KLING 2.6 MOTION', expectedTab: 'IMAGE TO VIDEO' },
        
        // Dual-Mode (Diprioritaskan ke IMAGE TO IMAGE)
        { name: 'GROK IMAGINE', expectedTab: 'IMAGE TO IMAGE' },
        { name: 'WAN AI', expectedTab: 'IMAGE TO IMAGE' },
        
        // Image-Only
        { name: 'QWEN', expectedTab: 'IMAGE TO IMAGE' },
        { name: 'NANO BANANA 2', expectedTab: 'IMAGE TO IMAGE' },
        { name: 'SEEDREAM 5', expectedTab: 'IMAGE TO IMAGE' },
        { name: 'GPT IMAGE 2', expectedTab: 'IMAGE TO IMAGE' },
    ];

    for (const model of modelsData) {
        // 1. Kembali ke Landing Page
        await page.goto('https://staging.aikreativ.app/', { waitUntil: 'domcontentloaded' });

        // 2. Klik Kartu Model
        const modelCard = page.getByRole('heading', { name: new RegExp(model.name, 'i'), level: 3 });
        await modelCard.click();

        // 3. Tunggu hingga URL masuk ke Studio
        await page.waitForURL('**/studio**', { timeout: 10000 });

        // 4. LOGIKA BARU: Cari tombol TAB mana yang sedang AKTIF (berwarna hijau bg-[#10b981])
        // Regex mencakup: bg-[#10b981], bg-emerald, bg-green, atau class active
        const activeTabButton = page.getByRole('button', { name: /IMAGE TO/i })
        .filter({ has: page.locator('xpath=self::*[contains(@class, "10b981") or contains(@class, "emerald") or contains(@class, "green") or contains(@class, "active")]') });

        // Ambil teks dari tab yang benar-benar aktif di UI saat ini
        const activeTabText = await activeTabButton.innerText().catch(() => 'TIDAK ADA TAB AKTIF');

        // 5. CEK 1: Bandingkan Tab Aktif UI vs Expected Tab Model (Soft Assertion)
        const isTabCorrect = activeTabText.toUpperCase().includes(model.expectedTab);
        
        expect.soft(
        isTabCorrect,
        `[BUG TAB] Model "${model.name}": Seharusnya mengarah ke tab "${model.expectedTab}", tapi tab yang AKTIF di Studio adalah "${activeTabText.trim()}"!`
        ).toBeTruthy();

        // 6. CEK 2: Validasi Model Selector Button di Studio (Soft Assertion)
        const firstName = model.name.split(' ')[0]; 
        const modelButton = page.getByRole('button', { name: new RegExp(firstName, 'i') });
        await expect.soft(
        modelButton, 
        `[BUG MODEL] Model "${model.name}": Nama model tidak terpilih/tampil di Studio!`
        ).toBeVisible();
    }
  });

});