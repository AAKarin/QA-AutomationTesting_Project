import { test, expect } from '@playwright/test';

test('Pengujian Modul Profil Admin (Ganti Password)', async ({ page }) => {

  await test.step('TC 0: Login & Navigasi ke Profil', async () => {
    await page.goto('https://layarbaca.app/admin/login');
    await page.getByRole('textbox').first().fill('admin');
    await page.getByRole('textbox', { name: /gunakan 'admin'/i }).fill('sampulkreativ.yes');
    await page.getByRole('button', { name: 'Masuk' }).click();

    await page.getByRole('button', { name: 'Profil Admin' }).click();
    await expect(page.getByRole('heading', { name: 'Profil Admin' })).toBeVisible();
  });

  await test.step('TC 1: Validasi Gagal - Password Saat Ini Kosong', async () => {
    await page.getByRole('button', { name: 'Simpan Password Baru' }).click();
    
    await expect(page.getByText('Masukkan password saat ini.')).toBeVisible();
    await page.getByRole('button', { name: 'Close toast' }).first().click();
  });

  await test.step('TC 2: Validasi Gagal - Konfirmasi Password Berbeda', async () => {
    await page.getByRole('textbox', { name: '••••••••' }).fill('sampulkreativ.yes');
    await page.getByRole('textbox', { name: 'Min. 6 karakter' }).fill('sampulkreativ.yes');
    
    // Sengaja dibuat typo (kurang huruf 's')
    await page.getByRole('textbox', { name: 'Ulangi password baru' }).fill('sampulkreativ.ye');
    await expect(page.getByText('Password tidak cocok')).toBeVisible();

    await page.getByRole('button', { name: 'Simpan Password Baru' }).click();
    await expect(page.getByText(/Konfirmasi password tidak/i)).toBeVisible();
    await page.getByRole('button', { name: 'Close toast' }).first().click();
  });

  await test.step('TC 3: Validasi Gagal - Password Saat Ini Salah', async () => {
    // Memperbaiki konfirmasi password agar cocok
    await page.getByRole('textbox', { name: 'Ulangi password baru' }).fill('sampulkreativ.yes');
    
    // Sengaja menyalahkan password saat ini
    await page.getByRole('textbox', { name: '••••••••' }).fill('sampulkreativ.ye');
    
    await page.getByRole('button', { name: 'Simpan Password Baru' }).click();
    await expect(page.getByText('Password saat ini tidak sesuai')).toBeVisible();
    await page.getByRole('button', { name: 'Close toast' }).first().click();
  });

  await test.step('TC 4: Berhasil Ganti Password', async () => {
    // Memasukkan password saat ini yang benar
    await page.getByRole('textbox', { name: '••••••••' }).fill('sampulkreativ.yes');
    
    await page.getByRole('button', { name: 'Simpan Password Baru' }).click();
    await expect(page.getByText('Password berhasil diperbarui!')).toBeVisible();
    await page.getByRole('button', { name: 'Close toast' }).first().click();
  });

  await test.step('TC 5: Uji Logout & Login Ulang', async () => {
    await page.getByRole('button', { name: 'Keluar' }).click();
    await expect(page.url()).toContain('/login');

    // Coba login dengan password yang baru disimpan (di kasus ini tetap 'sampulkreativ.yes')
    await page.getByRole('textbox').first().fill('admin');
    await page.getByRole('textbox', { name: /gunakan 'admin'/i }).fill('sampulkreativ.yes');
    await page.getByRole('button', { name: 'Masuk' }).click();

    await expect(page.getByText('Login berhasil')).toBeVisible();
    await page.getByRole('button', { name: 'Close toast' }).first().click();
  });
});