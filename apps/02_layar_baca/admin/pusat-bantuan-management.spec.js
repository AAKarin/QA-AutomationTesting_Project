import { test, expect } from '@playwright/test';

test('Pengujian Modul Pusat Bantuan (Inbox)', async ({ page }) => {
  test.setTimeout(90000);

  await test.step('TC 0: Login & Navigasi', async () => {
    await page.goto('https://layarbaca.app/admin/login');
    await page.getByRole('textbox').first().fill('admin');
    await page.getByRole('textbox', { name: "Gunakan 'admin'" }).fill('sampulkreativ.yes');
    await page.getByRole('button', { name: 'Masuk' }).click();

    await page.getByRole('link', { name: 'Pusat Bantuan' }).click();
    await expect(page.getByRole('heading', { name: 'Pusat Bantuan Admin (Inbox)' })).toBeVisible();
  });

  await test.step('TC 1: Refresh Inbox & Filter Status Pesan', async () => {
    await page.getByRole('button', { name: 'Refresh Inbox' }).click();

    await page.locator('.lucide.lucide-chevron-down').first().click();
    await page.getByRole('button', { name: /Unread/i }).click();
    await page.getByRole('button', { name: /Replied/i }).click();
    await page.getByRole('button', { name: /All/i }).click();
  });

  await test.step('TC 2: Cari & Pilih Pesan', async () => {
    await page.getByRole('textbox', { name: 'Cari email / pesan...' }).fill('angel.akun.test.1');
    await page.getByRole('textbox', { name: 'Cari email / pesan...' }).press('Enter');

    await page.getByText('"angel.akun.test.1" <angel.').first().click();
    await expect(page.getByText('Detail Pesan')).toBeVisible();
  });

  await test.step('TC 3: Form Balas Pesan - Batal', async () => {
    await page.getByRole('button', { name: 'Balas' }).first().click();
    await expect(page.getByRole('heading', { name: 'Balas Pesan Bantuan via Brevo' })).toBeVisible();

    await page.getByRole('textbox', { name: 'Tuliskan balasan resmi Anda' }).fill('Testing Dari Playwright');
    await page.getByRole('button', { name: 'Batal' }).click();
  });

  await test.step('TC 4: Kirim Balasan Email Pertama', async () => {
    // Memastikan item pesan diklik ulang untuk mengikat kembali ID pesan ke state UI
    await page.getByText('"angel.akun.test.1" <angel.').first().click();
    
    await page.getByRole('button', { name: 'Balas' }).first().click();
    await page.getByRole('textbox', { name: 'Tuliskan balasan resmi Anda' }).fill('Testing Dari Playwright');
    await page.getByRole('button', { name: 'Kirim Balasan Email' }).click();

    await expect(page.getByText('Balasan email berhasil')).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Close toast' }).first().click();
  });

  await test.step('TC 5: Kirim Balasan Email Lanjutan (Balas Lagi)', async () => {
    await page.getByRole('button', { name: 'Balas Lagi' }).first().click();
    await page.getByRole('textbox', { name: 'Tuliskan balasan resmi Anda' }).fill('Ayo testing pakai playwright');
    await page.getByRole('button', { name: 'Kirim Balasan Email' }).click();

    await expect(page.getByText('Balasan email berhasil')).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Close toast' }).first().click();
  });

  await test.step('TC 6: Tandai Dibaca & Hapus Pesan', async () => {
    page.once('dialog', dialog => {
      dialog.accept().catch(() => {});
    });

    // Tandai pesan sebagai dibaca dulu sebelum dihapus
    await page.getByRole('button', { name: 'Tandai Dibaca' }).first().click();
    await expect(page.getByText('Pesan ditandai sebagai dibaca')).toBeVisible();
    await page.getByRole('button', { name: 'Close toast' }).first().click();

    await page.getByRole('button', { name: 'Hapus Pesan' }).first().click();
  });
});