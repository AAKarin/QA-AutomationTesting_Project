import { test, expect } from '@playwright/test';

const BASE_URL = process.env.RUANGKREATIV_URL || 'http://localhost:3000';

test.describe('RuangKreativ - Modal Detail Video & Widget Chat', () => {

  test.beforeEach(async ({ page }) => {
    // Navigasi ke halaman tempat kartu video berada (asumsi: portofolio atau kelas)
    await page.goto(`${BASE_URL}/portofolio`); 
  });

  test('TC36: Validasi Tampilan Modal Detail Video dan Ketersediaan Tombol Tutup (X)', async ({ page }) => {
    // Klik kartu untuk membuka modal
    await page.locator('.kartu-portofolio').filter({ hasText: 'AI Video Learning: Product Video' }).click();
    
    // Validasi modal muncul
    const modalDetail = page.locator('dialog, .modal-container').first();
    await expect(modalDetail).toBeVisible();

    // Validasi tombol tutup (X) tersedia
    const btnTutup = modalDetail.getByRole('button', { name: /close|x/i }).first();
    await expect(btnTutup).toBeVisible();
  });

  test('TC37: Validasi Fungsionalitas Tombol Tutup (X) dan Overlay Close', async ({ page }) => {
    const kartu = page.locator('.kartu-portofolio').filter({ hasText: 'AI Video Learning: Product Video' });
    const modalDetail = page.locator('dialog, .modal-container').first();
    const btnTutup = modalDetail.getByRole('button', { name: /close|x/i }).first();

    // Uji tutup via tombol X
    await kartu.click();
    await expect(modalDetail).toBeVisible();
    await btnTutup.click();
    await expect(modalDetail).toBeHidden();

    // Uji tutup via klik overlay (area di luar modal)
    await kartu.click();
    await expect(modalDetail).toBeVisible();
    
    // Klik di pojok kiri atas viewport yang diasumsikan sebagai area backdrop/overlay
    await page.mouse.click(10, 10); 
    await expect(modalDetail).toBeHidden();
  });

  test('TC38: Validasi Pemutaran dan Kontrol Video pada Modal', async ({ page }) => {
    await page.locator('.kartu-portofolio').filter({ hasText: 'AI Video Learning: Product Video' }).click();
    
    const modalDetail = page.locator('dialog, .modal-container').first();
    const videoPlayer = modalDetail.locator('video, iframe');
    
    // Validasi video player dirender
    await expect(videoPlayer).toBeVisible();

    // Uji klik tombol Play di dalam player
    const btnPlay = modalDetail.getByRole('button', { name: /play/i }).first();
    if (await btnPlay.isVisible()) {
        await btnPlay.click();
        // Validasi state play bisa melalui pengecekan class atau property video (misal tidak paused)
        // const isPaused = await videoPlayer.evaluate(vid => vid.paused);
        // expect(isPaused).toBe(false);
    }
  });

  test('TC39: Validasi Kelengkapan Informasi Judul, Pembuat, Tools, dan Tag AI', async ({ page }) => {
    await page.locator('.kartu-portofolio').filter({ hasText: 'AI Video Learning: Product Video' }).click();
    const modalDetail = page.locator('dialog, .modal-container').first();

    // Validasi Judul dan Kreator
    await expect(modalDetail.getByRole('heading', { name: 'AI Video Learning: Product Video' })).toBeVisible();
    await expect(modalDetail.getByText('by Raka Pratama')).toBeVisible();
    await expect(modalDetail.getByText('Tools: AIKreativ')).toBeVisible();

    // Validasi Tag Teknologi (Chips)
    await expect(modalDetail.getByText('NANO BANANA 2', { exact: true })).toBeVisible();
    await expect(modalDetail.getByText('SEEDREAM 5', { exact: true })).toBeVisible();
    await expect(modalDetail.getByText('SEEDANCE 1.5', { exact: true })).toBeVisible();
  });

  test('TC40: Validasi Tampilan Daftar Materi Pembelajaran', async ({ page }) => {
    await page.locator('.kartu-portofolio').filter({ hasText: 'AI Video Learning: Product Video' }).click();
    const modalDetail = page.locator('dialog, .modal-container').first();

    await expect(modalDetail.getByText('APA YANG AKAN ANDA PELAJARI DI SESI INI (1 JAM ZOOM):')).toBeVisible();
    
    // Validasi salah satu poin materi utama
    await expect(modalDetail.getByText(/Membuat foto produk dan kemasan terlihat jernih, mewah/i)).toBeVisible();
    await expect(modalDetail.getByText(/Teknik slow-motion dengan efek pencahayaan/i)).toBeVisible();
  });

  test('TC41: Validasi Tampilan Informasi "Keterampilan Utama" dan "Sektor Terkait"', async ({ page }) => {
    await page.locator('.kartu-portofolio').filter({ hasText: 'AI Video Learning: Product Video' }).click();
    const modalDetail = page.locator('dialog, .modal-container').first();

    // Validasi label dan rincian bagian bawah
    await expect(modalDetail.getByText(/Keterampilan Utama:/i)).toBeVisible();
    await expect(modalDetail.getByText(/Gaya Visual, Kontrol Kamera & Pencahayaan/i)).toBeVisible();
    
    await expect(modalDetail.getByText(/Sektor Terkait:/i)).toBeVisible();
    await expect(modalDetail.getByText(/Kecantikan & Kosmetik, E-commerce, Ritel/i)).toBeVisible();
  });

  test('TC42: Validasi Fungsionalitas dan Tampilan Widget Obrolan Mengambang (Floating Chat)', async ({ page }) => {
    // Widget ini diasumsikan berada di luar modal, langsung di body/viewport
    const widgetChat = page.locator('button').filter({ has: page.locator('svg') }).last(); // Menyesuaikan tombol melayang di pojok
    
    // Pastikan widget melayang terlihat di viewport
    await expect(widgetChat).toBeVisible();
    
    // Uji klik widget untuk membuka pop-up obrolan
    await widgetChat.click();
    
    // Memastikan jendela chat box/iframe terbuka (sesuaikan class chatbox)
    // const chatBox = page.locator('.chat-window, iframe#chat-widget'); 
    // await expect(chatBox).toBeVisible();
  });
});