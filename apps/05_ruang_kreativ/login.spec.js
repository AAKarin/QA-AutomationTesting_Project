import { test, expect } from '@playwright/test';

const BASE_URL = process.env.RUANGKREATIV_URL || 'http://localhost:3000';

test.describe('RuangKreativ - Halaman Login', () => {

  test.beforeEach(async ({ page }) => {
    // Navigasi ke halaman login sebelum setiap tes
    await page.goto(`${BASE_URL}/login`); 
  });

  test('TC64: Validasi proses login berhasil menggunakan email dan kata sandi yang valid', async ({ page }) => {
    // Memastikan elemen UI dimuat dengan benar
    await expect(page.getByRole('heading', { name: 'Selamat Datang Kembali' })).toBeVisible();

    // Isi formulir
    await page.getByLabel('Email').fill('user@example.com'); // Gunakan kredensial valid
    await page.getByLabel('Kata Sandi').fill('PasswordValid123!');
    
    // Klik masuk
    await page.getByRole('button', { name: 'Masuk', exact: true }).click();

    // Validasi pengalihan halaman ke dashboard/beranda setelah login
    await expect(page).toHaveURL(/.*(dashboard|beranda|\/$)/);
  });

  test('TC65: Validasi penanganan kesalahan saat memasukkan email atau kata sandi salah (Negative)', async ({ page }) => {
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Kata Sandi').fill('PasswordSalah123');
    
    await page.getByRole('button', { name: 'Masuk', exact: true }).click();

    // Validasi munculnya pesan error
    await expect(page.getByText(/Email atau kata sandi yang Anda masukkan salah/i)).toBeVisible();
    
    // Validasi masih berada di halaman login
    await expect(page).toHaveURL(/.*login/);
  });

  test('TC66: Validasi peringatan field wajib (required field) saat mengosongkan form (Negative)', async ({ page }) => {
    // Langsung klik tombol masuk tanpa mengisi data
    await page.getByRole('button', { name: 'Masuk', exact: true }).click();

    // Memeriksa validasi bawaan HTML5 (required) atau alert dari framework JS
    // Menggunakan evaluate untuk mengecek properti validity DOM jika menggunakan HTML form required
    const inputEmail = page.getByLabel('Email');
    const isEmailInvalid = await inputEmail.evaluate((node) => node.validity.valueMissing);
    expect(isEmailInvalid).toBeTruthy();

    // ATAU mengecek teks peringatan jika dirender via komponen (Sesuaikan dengan implementasi UI)
    // await expect(page.getByText(/Email wajib diisi/i)).toBeVisible();
    // await expect(page.getByText(/Kata sandi wajib diisi/i)).toBeVisible();
  });

  test('TC67: Validasi fungsionalitas tombol toggle visibilitas kata sandi (ikon mata)', async ({ page }) => {
    const inputPassword = page.getByLabel('Kata Sandi');
    const btnToggleMata = page.locator('.eye-icon-button, button:has(svg)').last(); // Sesuaikan dengan locator ikon mata

    // Ketik kata sandi, tipe bawaan harusnya 'password'
    await inputPassword.fill('Rahasia123');
    await expect(inputPassword).toHaveAttribute('type', 'password');

    // Klik ikon mata untuk menampilkan (Show)
    await btnToggleMata.click();
    await expect(inputPassword).toHaveAttribute('type', 'text');

    // Klik kembali untuk menyembunyikan (Hide)
    await btnToggleMata.click();
    await expect(inputPassword).toHaveAttribute('type', 'password');
  });

  test('TC68: Validasi fungsionalitas centang "Ingat saya" (Remember Me)', async ({ page, context }) => {
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Kata Sandi').fill('PasswordValid123!');
    
    // Centang kotak Ingat saya
    const checkboxIngatSaya = page.getByLabel('Ingat saya');
    await checkboxIngatSaya.check();
    await expect(checkboxIngatSaya).toBeChecked();

    await page.getByRole('button', { name: 'Masuk', exact: true }).click();
    await expect(page).toHaveURL(/.*(dashboard|beranda|\/$)/);

    // Buka tab baru di context yang sama dan navigasi kembali ke login/home
    const newPage = await context.newPage();
    await newPage.goto(`${BASE_URL}/`);
    
    // Validasi bahwa pengguna tidak perlu login ulang (misalnya tombol masuk berubah menjadi nama user)
    // await expect(newPage.getByRole('button', { name: 'Masuk' })).toBeHidden();
  });

  test('TC69: Validasi fungsionalitas login menggunakan OAuth Google', async ({ page }) => {
    // Dalam E2E, interaksi dengan pop-up OAuth Google pihak ketiga biasanya diblokir atau di-mock.
    // Skrip ini memvalidasi bahwa tombol ada dan memicu window baru (redirect) menuju Google.
    
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.getByRole('button', { name: 'Masuk dengan Google' }).click()
    ]);
    
    await popup.waitForLoadState();
    expect(popup.url()).toContain('accounts.google.com');
  });

  test('TC70: Validasi navigasi tautan "Lupa Kata Sandi?" dan "Daftar sekarang"', async ({ page }) => {
    // Uji tautan Lupa Kata Sandi
    await page.getByRole('link', { name: 'Lupa Kata Sandi?' }).click();
    await expect(page).toHaveURL(/.*(lupa-sandi|forgot-password|reset)/);

    // Kembali dan uji tautan Daftar sekarang
    await page.goto(`${BASE_URL}/login`); 
    await page.getByRole('link', { name: 'Daftar sekarang' }).click();
    await expect(page).toHaveURL(/.*(daftar|register)/);
  });

});