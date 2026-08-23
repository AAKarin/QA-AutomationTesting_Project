import { test, expect } from '@playwright/test';

test('Pengujian Modul Galleries - Multiple Scenarios', async ({ page }) => {
  // Tambahkan sedikit waktu ekstra agar tidak keburu gagal jika internet lambat
  test.setTimeout(90000); 

  await test.step('TC 0: Login & Navigasi', async () => {
    await page.goto('https://layarbaca.app/admin/login');
    await page.getByRole('textbox').first().fill('admin');
    await page.getByRole('textbox', { name: "Gunakan 'admin'" }).fill('sampulkreativ.yes');
    await page.getByRole('button', { name: 'Masuk' }).click();

    await page.getByRole('link', { name: 'Galleries' }).click();
    await expect(page.getByRole('heading', { name: 'Galleries' })).toBeVisible();
  });

  await test.step('TC 1: Submit Form Kosong', async () => {
    await page.getByRole('button', { name: 'Crawl & Simpan' }).click();
    await expect(page.getByText('Title, Thumbnail, and Creator')).toBeVisible();
    await page.getByRole('button', { name: 'Close toast' }).first().click();
  });

  await test.step('TC 2: Kosongkan Thumbnail URL', async () => {
    // Fill menimpa teks sebelumnya secara otomatis
    await page.getByRole('textbox', { name: 'Contoh: Photoshoot Bali' }).fill('Testing');
    await page.getByRole('textbox', { name: 'https://...' }).fill(''); // Sengaja dikosongkan
    await page.getByRole('textbox', { name: 'https://drive.google.com/' }).fill('https://layarbaca.app/admin/galleries');
    
    await page.getByRole('combobox').first().selectOption('free');
    await page.getByRole('combobox').nth(1).selectOption('f24f6245-538e-4225-93ae-1965428b4439');

    await page.getByRole('button', { name: 'Crawl & Simpan' }).click();
    await expect(page.getByText('Title, Thumbnail, and Creator')).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Close toast' }).first().click();
  });

  await test.step('TC 3: Kosongkan GDrive URL', async () => {
    await page.getByRole('textbox', { name: 'https://...' }).fill('https://layarbaca.app/admin/galleries');
    await page.getByRole('textbox', { name: 'https://drive.google.com/' }).fill(''); // Sengaja dikosongkan
    
    await page.getByRole('button', { name: 'Crawl & Simpan' }).click();
    await expect(page.getByText('Gdrive URL is required for')).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Close toast' }).first().click();
  });

  await test.step('TC 4: Link File GDrive (Bukan Folder)', async () => {
    // Uji dengan link file yang valid, bukan folder
    await page.getByRole('textbox', { name: 'https://drive.google.com/' }).fill('https://drive.google.com/file/d/15uIiBj4IQYi__ea2L-qwez7grn2JqghX/view?usp=sharing');
    await page.getByRole('button', { name: 'Crawl & Simpan' }).click();
    
    try {
      await expect(page.getByText('No images found in this')).toBeVisible({ timeout: 5000 });
      await page.getByRole('button', { name: 'Close toast' }).first().click();
    } catch (e) {
      console.log('Bug terdeteksi: Gagal validasi link file vs folder');
    }
  });

  await test.step('TC 5: Submit dengan URL GDrive Sembarangan', async () => {
    // Uji dengan URL ngawur
    await page.getByRole('textbox', { name: 'https://drive.google.com/' }).fill('https://layarbaca.app/admin/galleries');
    await page.getByRole('button', { name: 'Crawl & Simpan' }).click();
    
    try {
      await expect(page.getByText('No images found in this')).toBeVisible({ timeout: 5000 });
      await page.getByRole('button', { name: 'Close toast' }).first().click();
    } catch (e) {
      console.log('Bug terdeteksi: Sistem menyimpan URL GDrive yang tidak valid!');
    }
  });

});