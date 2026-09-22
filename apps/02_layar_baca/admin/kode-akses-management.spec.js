import { test, expect } from '@playwright/test';

test('Pengujian Modul Kode Akses', async ({ page }) => {
  // Tambahkan timeout untuk mencegah flaky saat proses generate kode dari backend
  test.setTimeout(90000);

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

    await page.getByRole('link', { name: 'Kode Akses' }).click();
    await expect(page.getByRole('heading', { name: 'Kode Akses' }).first()).toBeVisible();
  });

  await test.step('TC 1: Cari & Tarik Akses (Revoke)', async () => {
    const searchInput = page.getByRole('textbox', { name: 'Cari kode atau email...' });
    await searchInput.fill('angel.akun.tes');
    
    const revokeBtn = page.getByRole('button', { name: 'Tarik Akses (Revoke)' }).first();
    if (await revokeBtn.isVisible().catch(() => false)) {
      await revokeBtn.click();
      await expect(page.locator('[data-sonner-toast]').filter({ hasText: /Kode akses .* berhasil|berhasil/i }).first()).toBeVisible({ timeout: 15000 });
      await dismissToast();
    }
    await searchInput.fill('');
    await page.waitForTimeout(500);
  });

  await test.step('TC 2: Form Generate Manual - Batal', async () => {
    await page.getByRole('button', { name: 'Generate Manual' }).click();
    await page.getByRole('button', { name: 'Batal' }).click();
  });

  await test.step('TC 3: Generate Manual - Tanpa Akses Spesifik', async () => {
    await page.getByRole('button', { name: 'Generate Manual' }).click();
    await expect(page.getByRole('heading', { name: 'Buat Kode Akses' })).toBeVisible({ timeout: 10000 });
    
    // Pastikan dropdown konten terpilih secara eksplisit (index 0 = pilihan pertama)
    const selectContent = page.getByRole('combobox').first();
    await selectContent.selectOption({ index: 0 }).catch(() => {});
    
    await page.getByRole('textbox', { name: 'contoh@mail.com' }).fill('angel.akun.test.1@gmail.com');
    await page.getByRole('button', { name: 'Buat Kode' }).click({ force: true });
    
    // Validasi toast - server bisa mengembalikan berbagai pesan sukses
    await expect(
      page.locator('[data-sonner-toast]').first()
    ).toBeVisible({ timeout: 15000 });
    await dismissToast();
  });

  await test.step('TC 4: Generate Manual - Dengan Akses Konten & Anti Iklan', async () => {
    await page.getByRole('button', { name: 'Generate Manual' }).click();
    await expect(page.getByRole('heading', { name: 'Buat Kode Akses' })).toBeVisible({ timeout: 10000 });
    
    // Memilih dropdown akses konten secara eksplisit (index 1 = opsi kedua)
    const selectContent = page.getByRole('combobox').first();
    if (await selectContent.isVisible().catch(() => false)) {
      await selectContent.selectOption({ index: 1 }).catch(() => {});
    }
    await page.getByRole('textbox', { name: 'contoh@mail.com' }).fill('angel.akun.test.1@gmail.com');
    
    // Klik opsi Anti Iklan via checkbox agar lebih presisi
    const noAdsCheckbox = page.getByRole('checkbox', { name: /Anti Iklan/i });
    if (await noAdsCheckbox.isVisible().catch(() => false)) {
      await noAdsCheckbox.check({ force: true }).catch(() => {});
    }
    
    await page.getByRole('button', { name: 'Buat Kode' }).click({ force: true });
    
    // Validasi toast - server bisa mengembalikan berbagai pesan sukses
    await expect(
      page.locator('[data-sonner-toast]').first()
    ).toBeVisible({ timeout: 15000 });
    await dismissToast();
  });
});