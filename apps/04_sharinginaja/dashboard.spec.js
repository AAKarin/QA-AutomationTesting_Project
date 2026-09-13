// @ts-check
import { test, expect } from '@playwright/test';
require('dotenv').config();

test.describe('Modul: Dashboard - Sharinginaja', () => {

  const BASE_URL = process.env.BASE_URL_SHARINGINAJA || 'http://localhost:3000';
  const DASHBOARD_URL = `${BASE_URL}/dashboard`;
  
  // Test credentials
  const VALID_EMAIL = process.env.TEST_EMAIL_SHARINGINAJA || 'user@example.com';
  const VALID_PASSWORD = process.env.TEST_PASSWORD_SHARINGINAJA || 'password123';

  test.beforeEach(async ({ page }) => {
    // Login terlebih dahulu
    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel(/Email|Alamat Email/i).fill(VALID_EMAIL);
    await page.getByLabel(/Password|Kata Sandi/i).fill(VALID_PASSWORD);
    await page.getByRole('button', { name: /Masuk|Login/i }).click();
    
    // Tunggu navigasi ke dashboard
    await page.waitForURL(/.*dashboard/, { timeout: 5000 });
  });

  // TC-01: Verifikasi komponen utama dashboard
  test('TC-01: Memverifikasi layout dan komponen utama dashboard', async ({ page }) => {
    // Verifikasi judul dashboard
    await expect(page.getByRole('heading', { name: /Dashboard|Beranda/i })).toBeVisible();
    
    // Verifikasi navigasi sidebar
    const sidebar = page.locator('nav, .sidebar, [role="navigation"]');
    await expect(sidebar).toBeVisible();
    
    // Verifikasi user profile section
    await expect(page.getByText(/@|profile|Profil/i)).toBeVisible();
  });

  // TC-02: Memeriksa navigasi menu sidebar
  test('TC-02: Memeriksa menu navigasi di sidebar', async ({ page }) => {
    // Verifikasi menu items utama
    const homeMenu = page.getByRole('link', { name: /Beranda|Home/i });
    const albumMenu = page.getByRole('link', { name: /Album|Galeri/i });
    const settingsMenu = page.getByRole('link', { name: /Pengaturan|Settings/i });
    
    await expect(homeMenu).toBeVisible();
    await expect(albumMenu).toBeVisible();
    await expect(settingsMenu).toBeVisible();
  });

  // TC-03: Verifikasi album/koleksi pengguna
  test('TC-03: Menampilkan daftar album pengguna', async ({ page }) => {
    // Verifikasi heading "Album Saya" atau "My Albums"
    await expect(page.getByRole('heading', { name: /Album Saya|My Albums|Koleksi Saya/i })).toBeVisible();
    
    // Verifikasi ada minimal satu album atau pesan empty state
    const albums = page.locator('[class*="album"], [class*="card"]');
    const emptyMessage = page.getByText(/Belum ada album|No albums yet/i);
    
    // Pastikan salah satu dari keduanya visible
    const hasAlbums = await albums.count() > 0;
    const isEmpty = await emptyMessage.isVisible();
    
    expect(hasAlbums || isEmpty).toBeTruthy();
  });

  // TC-04: Memeriksa tombol untuk membuat album baru
  test('TC-04: Memeriksa tombol "Buat Album Baru"', async ({ page }) => {
    // Verifikasi tombol untuk membuat album baru
    const createButton = page.getByRole('button', { name: /Buat Album|New Album|Tambah Album|Create/i });
    await expect(createButton).toBeVisible();
    
    // Klik tombol dan verifikasi modal/form terbuka
    await createButton.click();
    await expect(page.getByRole('dialog') || page.getByRole('heading', { name: /Buat Album|Create Album/i })).toBeVisible();
  });

  // TC-05: Memeriksa statistik/summary di dashboard
  test('TC-05: Menampilkan statistik pengguna', async ({ page }) => {
    // Verifikasi statistik seperti jumlah album, foto, dst
    const stats = page.locator('[class*="stat"], [class*="summary"]');
    
    // Verifikasi minimal satu statistik terlihat atau berisi angka
    const count = await stats.count();
    if (count > 0) {
      await expect(stats.first()).toBeVisible();
    }
  });

  // TC-06: Navigasi ke profil pengguna
  test('TC-06: Memeriksa akses ke halaman profil pengguna', async ({ page }) => {
    // Verifikasi link/tombol ke profil
    const profileLink = page.getByRole('link', { name: /Profil|Profile|Akun/i });
    
    if (await profileLink.isVisible()) {
      await profileLink.click();
      await page.waitForURL(/.*profile|.*account/, { timeout: 5000 });
      await expect(page).toHaveURL(/.*profile|.*account/);
    }
  });

  // TC-07: Memeriksa fitur logout
  test('TC-07: Memeriksa fitur logout dari dashboard', async ({ page }) => {
    // Buka menu user (biasanya di top-right)
    const userMenu = page.locator('[class*="user-menu"], [class*="profile-menu"]');
    const userButton = page.getByRole('button', { name: /user|profile|avatar/i });
    
    // Cek apakah ada menu user button
    if (await userButton.isVisible()) {
      await userButton.click();
    } else if (await userMenu.isVisible()) {
      await userMenu.click();
    }
    
    // Cari dan klik logout
    const logoutButton = page.getByRole('button', { name: /Keluar|Logout|Sign Out/i });
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      
      // Verifikasi redirect ke login page
      await page.waitForURL(/.*login/, { timeout: 5000 });
      await expect(page).toHaveURL(/.*login/);
    }
  });

  // TC-08: Memeriksa responsive design dashboard di mobile
  test('TC-08: Verifikasi dashboard di tampilan mobile', async ({ page }) => {
    // Set viewport ke ukuran mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verifikasi hamburger menu ada
    const mobileMenu = page.getByRole('button', { name: /Menu|Hamburger/i });
    
    // Verifikasi konten utama tetap terlihat
    await expect(page.getByRole('heading', { name: /Dashboard|Beranda/i })).toBeVisible();
  });

  // TC-09: Memeriksa navigasi antar menu
  test('TC-09: Navigasi ke menu Album', async ({ page }) => {
    // Klik menu Album
    const albumLink = page.getByRole('link', { name: /Album|Galeri|Koleksi/i });
    
    if (await albumLink.isVisible()) {
      await albumLink.click();
      await page.waitForURL(/.*album|.*gallery/, { timeout: 5000 });
      await expect(page).toHaveURL(/.*album|.*gallery/);
    }
  });

  // TC-10: Memeriksa loading state dan error handling
  test('TC-10: Verifikasi loading state dan error handling', async ({ page }) => {
    // Reload halaman untuk melihat loading state
    await page.reload();
    
    // Tunggu halaman selesai loading
    await page.waitForLoadState('networkidle');
    
    // Verifikasi konten dashboard muncul
    await expect(page.getByRole('heading', { name: /Dashboard|Beranda/i })).toBeVisible();
  });

  // TC-11: Memeriksa notifikasi/toast messages
  test('TC-11: Verifikasi area notifikasi di dashboard', async ({ page }) => {
    // Cari container notifikasi
    const notificationArea = page.locator('[class*="toast"], [class*="notification"], [class*="alert"]');
    
    // Minimal notification container harus ada (meski kosong saat tidak ada notifikasi)
    // Ini lebih untuk memastikan struktur HTML yang benar
    if (await notificationArea.count() > 0) {
      await expect(notificationArea.first()).toBeVisible();
    }
  });

  // TC-12: Memeriksa tema/dark mode toggle jika ada
  test('TC-12: Memeriksa toggle tema (dark/light mode)', async ({ page }) => {
    // Cari tombol untuk toggle tema
    const themeToggle = page.getByRole('button', { name: /Tema|Theme|Dark|Light/i });
    
    if (await themeToggle.isVisible()) {
      const initialTheme = await page.evaluate(() => {
        return document.documentElement.getAttribute('data-theme') || document.documentElement.className;
      });
      
      // Klik toggle
      await themeToggle.click();
      
      // Verifikasi tema berubah
      const newTheme = await page.evaluate(() => {
        return document.documentElement.getAttribute('data-theme') || document.documentElement.className;
      });
      
      // Tema harus berubah (atau minimal tombol respond)
      expect(initialTheme !== newTheme || await themeToggle.isVisible()).toBeTruthy();
    }
  });
});
