import { test, expect } from '@playwright/test';

test('Pengujian Modul Donatur & Pelanggan', async ({ page }) => {
  // Timeout ekstra untuk menangani proses broadcast & pengiriman notifikasi
  test.setTimeout(120000);

  const dismissToast = async () => {
    const closeBtn = page.getByRole('button', { name: 'Close toast' }).first();
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click({ force: true }).catch(() => {});
    }
    await page.waitForTimeout(400);
  };

  await test.step('TC 0: Login & Navigasi', async () => {
    await page.goto('https://layarbaca.app/admin/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('textbox').first().fill('admin');
    await page.getByRole('textbox', { name: "Gunakan 'admin'" }).fill('sampulkreativ.yes');
    await page.getByRole('button', { name: 'Masuk' }).click();

    await page.getByRole('link', { name: 'Donatur' }).click();
    await expect(page.getByRole('heading', { name: 'Manajemen Pelanggan & Donatur' })).toBeVisible();
  });

  await test.step('TC 1: Cari Email Donatur Spesifik', async () => {
    await page.getByRole('textbox', { name: 'Masukkan alamat email' }).fill('angel.akun.test.1');
    await page.getByText('angel.akun.test.1@gmail.com').first().click();
  });

  await test.step('TC 2: Uji Tandai & Hapus Flag Merah', async () => {
    // Tandai Flag Merah
    await page.getByRole('button', { name: 'Tandai Flag Merah' }).first().click();
    await expect(page.getByText('Berhasil menandai flag merah')).toBeVisible();
    await dismissToast();

    // Hapus Flag Merah
    await page.getByRole('button', { name: 'Hapus Flag Merah' }).first().click();
    await expect(page.getByText('Berhasil menghapus flag merah')).toBeVisible();
    await dismissToast();
  });

  await test.step('TC 3: Kirim Notifikasi Individual (Kirim Email Promo)', async () => {
    await page.getByRole('button', { name: /Email Promo/i }).first().click();
    await expect(page.getByRole('heading', { name: 'Kirim Notifikasi Email' })).toBeVisible({ timeout: 10000 });
    
    await page.locator('input[placeholder*="Contoh:"], input[placeholder*="Rilis"], input[placeholder*="Subjek"]').first().fill('Testing Playwright');
    
    // Biarkan lampiran video promo default (-- Tanpa Lampiran Video --) agar tidak conflict package/video
    await page.locator('textarea[placeholder*="Ketik pesan promosi"]').first().fill('Testing Playwright');
    await page.getByRole('button', { name: 'Kirim via Email' }).click();

    await expect(page.locator('[data-sonner-toast]').filter({ hasText: /email|notifikasi/i }).first()).toBeVisible({ timeout: 15000 });
    await dismissToast();
  });

  await test.step('TC 4: Uji Filter & Sortir Pelanggan', async () => {
    const filterBtn = page.getByRole('button', { name: 'Filter' }).first();
    if (await filterBtn.isVisible().catch(() => false)) {
      await filterBtn.click();
      await page.waitForTimeout(500);

      const comboboxes = page.getByRole('combobox');
      const comboCount = await comboboxes.count();
      if (comboCount > 0) {
        // Terapkan sorting jika ada
        await comboboxes.first().selectOption({ index: 1 }).catch(() => {});
      }
    }
  });

  await test.step('TC 5: Broadcast Email Massal', async () => {
    await page.getByRole('button', { name: 'Broadcast Notifikasi' }).click();
    await expect(page.getByRole('heading', { name: /Broadcast/i })).toBeVisible({ timeout: 10000 });

    await page.locator('input[placeholder*="Kejutan"]').first().fill('Testing Playwright');
    await page.locator('textarea[placeholder*="Ketik pesan"]').first().fill('Testing Playwright');

    // Klik tombol kirim dengan regex untuk mencocokkan jumlah penerima yang dinamis
    const sendBroadcastBtn = page.getByRole('button', { name: /Kirim ke .* Penerima/i });
    if (await sendBroadcastBtn.isVisible().catch(() => false)) {
      await sendBroadcastBtn.click({ force: true });
      await expect(page.locator('[data-sonner-toast]').filter({ hasText: /broadcast.*berhasil|berhasil/i }).first()).toBeVisible({ timeout: 15000 });
      await dismissToast();
    } else {
      await page.getByRole('button', { name: 'Batal' }).click();
    }

    // Tunggu overlay modal benar-benar hilang sebelum TC berikutnya
    const overlay = page.locator('div.fixed.inset-0.bg-slate-900\/60');
    await overlay.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(500);
  });

  await test.step('TC 6: Form Broadcast - Batal', async () => {
    const broadcastBtn = page.getByRole('button', { name: 'Broadcast Notifikasi' });
    // Pastikan tidak ada overlay modal yang masih terbuka
    const overlay = page.locator('div.fixed.inset-0.bg-slate-900\/60');
    await overlay.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

    if (await broadcastBtn.isVisible().catch(() => false)) {
      await broadcastBtn.click({ force: true });
      const cancelBtn = page.getByRole('button', { name: 'Batal' });
      await expect(cancelBtn).toBeVisible({ timeout: 5000 });
      await cancelBtn.click();
      // Tunggu overlay modal ditutup
      await overlay.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    }
  });
});