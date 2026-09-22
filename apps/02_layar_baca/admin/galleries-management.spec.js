import { test, expect } from '@playwright/test';

test('Pengujian Modul Galleries - Multiple Scenarios', async ({ page }) => {
  test.setTimeout(90000); 

  const dismissToast = async () => {
    const closeBtn = page.getByRole('button', { name: 'Close toast' }).first();
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click({ force: true }).catch(() => {});
    }
    await page.waitForTimeout(400);
  };

  await test.step('TC 0: Login & Navigasi ke Galleries', async () => {
    await page.goto('https://layarbaca.app/admin/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('textbox').first().fill('admin');
    await page.getByRole('textbox', { name: "Gunakan 'admin'" }).fill('sampulkreativ.yes');
    await page.getByRole('button', { name: 'Masuk' }).click();

    await page.getByRole('link', { name: 'Galleries' }).click();
    await expect(page.getByRole('heading', { name: 'Galleries' })).toBeVisible({ timeout: 15000 });
  });

  await test.step('TC 1: Verifikasi Elemen Form Tambah Gallery', async () => {
    await expect(page.getByRole('heading', { name: 'Tambah Gallery Baru' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Contoh: Photoshoot Bali' })).toBeVisible();
    await expect(page.getByText('Pilih Thumbnail')).toBeVisible();
    await expect(page.getByText(/Unggah Foto Galeri|Pilih Banyak Foto/i).first()).toBeVisible();
    await expect(page.getByRole('combobox').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Crawl & Simpan/i })).toBeVisible();
  });

  await test.step('TC 2: Uji Validasi Form Kosong', async () => {
    const titleInput = page.getByRole('textbox', { name: 'Contoh: Photoshoot Bali' });
    await titleInput.fill('');
    await page.getByRole('button', { name: /Crawl & Simpan/i }).click();

    await expect(page.getByText(/Judul.*Thumbnail.*Kreator wajib diisi/i)).toBeVisible({ timeout: 10000 });
    await dismissToast();
  });

  await test.step('TC 3: Verifikasi Daftar Galeri (Gallery List)', async () => {
    await expect(page.getByRole('heading', { name: /Gallery List/i })).toBeVisible();
    const editButtons = page.getByRole('button', { name: 'Edit' });
    await expect(editButtons.first()).toBeVisible({ timeout: 10000 });
  });

  await test.step('TC 4: Verifikasi Modal Konfirmasi Hapus Galeri (TC 14)', async () => {
    // Klik tombol Hapus pada salah satu card galeri
    const deleteBtn = page.getByRole('button', { name: 'Hapus' }).first();
    await expect(deleteBtn).toBeVisible({ timeout: 10000 });
    await deleteBtn.click();

    // Verifikasi munculnya custom modal konfirmasi penghapusan
    const modalPrompt = page.getByText(/Apakah Anda yakin ingin menghapus|Hapus Galeri/i).first();
    await expect(modalPrompt).toBeVisible({ timeout: 10000 });

    // Batalkan penghapusan
    const cancelBtn = page.getByRole('button', { name: 'Batal' });
    await expect(cancelBtn).toBeVisible({ timeout: 5000 });
    await cancelBtn.click();
    await dismissToast();
  });
});