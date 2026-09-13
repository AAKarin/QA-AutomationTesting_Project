import { test, expect } from '@playwright/test';

const BASE_URL = process.env.RUANGKREATIV_URL || 'http://localhost:3000';
const URL_REGISTER = `${BASE_URL}/register`; // Sesuaikan dengan route pendaftaran

test.describe('RuangKreativ - Halaman Pendaftaran Akun', () => {

  test.beforeEach(async ({ page }) => {
    // Navigasi ke halaman pendaftaran sebelum setiap tes
    await page.goto(URL_REGISTER);
  });

  test('TC84: Validasi pendaftaran akun berhasil menggunakan data valid (Positive)', async ({ page }) => {
    // Memastikan judul halaman tampil
    await expect(page.getByRole('heading', { name: 'Mulai Perjalanan Kreatif Anda' })).toBeVisible();

    // Mengisi form pendaftaran
    // Catatan: Anda perlu men-generate email acak pada E2E test sungguhan agar tidak duplikat
    const randomEmail = `userbaru_${Date.now()}@test.com`; 
    
    await page.getByLabel('Nama Lengkap').fill('John Doe');
    await page.getByLabel('Email').fill(randomEmail);
    await page.getByLabel('Password').fill('PasswordKuat123!');
    
    // Centang Syarat & Ketentuan
    const checkboxTerms = page.getByRole('checkbox', { name: /Saya menyetujui Syarat & Ketentuan/i });
    await checkboxTerms.check();

    // Klik tombol daftar
    await page.getByRole('button', { name: 'Daftar Sekarang' }).click();

    // Validasi pengalihan ke halaman beranda atau verifikasi email
    await expect(page).toHaveURL(/.*(verifikasi|beranda|dashboard|\/$)/);
  });

  test('TC85: Validasi pencegahan pendaftaran saat checkbox Syarat & Ketentuan tidak dicentang (Negative)', async ({ page }) => {
    await page.getByLabel('Nama Lengkap').fill('John Doe');
    await page.getByLabel('Email').fill('johndoe@test.com');
    await page.getByLabel('Password').fill('PasswordKuat123!');
    
    // Sengaja tidak mencentang checkbox T&C
    const btnDaftar = page.getByRole('button', { name: 'Daftar Sekarang' });
    
    // Opsi A: Tombol dalam keadaan disabled
    if (await btnDaftar.isDisabled()) {
      await expect(btnDaftar).toBeDisabled();
    } else {
      // Opsi B: Tombol dapat diklik tapi memunculkan pesan peringatan validasi
      await btnDaftar.click();
      await expect(page.getByText(/Anda harus menyetujui Syarat & Ketentuan/i)).toBeVisible();
    }
  });

  test('TC86: Validasi pendaftaran menggunakan alamat email yang sudah terdaftar (Negative)', async ({ page }) => {
    await page.getByLabel('Nama Lengkap').fill('John Doe');
    await page.getByLabel('Email').fill('emailterdaftar@test.com'); // Asumsikan email ini sudah ada di DB
    await page.getByLabel('Password').fill('PasswordKuat123!');
    
    await page.getByRole('checkbox', { name: /Saya menyetujui Syarat & Ketentuan/i }).check();
    await page.getByRole('button', { name: 'Daftar Sekarang' }).click();

    // Validasi sistem menolak dan menampilkan pesan error
    await expect(page.getByText(/Email sudah terdaftar/i)).toBeVisible();
  });

  test('TC87: Validasi format penulisan email tidak valid pada kolom input (Negative)', async ({ page }) => {
    // Isi email dengan format salah (tanpa @)
    const inputEmail = page.getByLabel('Email');
    await inputEmail.fill('johndoe.com');
    
    // Hilangkan fokus (blur) dari input untuk memicu validasi frontend
    await inputEmail.blur();

    // Memeriksa validasi HTML5 bawaan browser
    const isEmailInvalid = await inputEmail.evaluate((node) => node.validity.typeMismatch || node.validity.patternMismatch);
    expect(isEmailInvalid).toBeTruthy();
    
    // ATAU memeriksa teks pesan error kustom (jika menggunakan library form validasi seperti formik/zod)
    // await expect(page.getByText(/Format email tidak sesuai/i)).toBeVisible();
  });

  test('TC88: Validasi batas minimum panjang dan kompleksitas password (Negative)', async ({ page }) => {
    await page.getByLabel('Nama Lengkap').fill('John Doe');
    await page.getByLabel('Email').fill('john@test.com');
    
    // Isi dengan password yang terlalu pendek
    const inputPassword = page.getByLabel('Password');
    await inputPassword.fill('12345'); 
    await inputPassword.blur();

    // Validasi munculnya pesan instruksi batas minimum
    await expect(page.getByText(/minimal 8 karakter/i)).toBeVisible();
    
    // Coba submit dan pastikan gagal
    await page.getByRole('button', { name: 'Daftar Sekarang' }).click();
    await expect(page).toHaveURL(URL_REGISTER);
  });

  test('TC89: Validasi pendaftaran akun cepat menggunakan Google OAuth', async ({ page }) => {
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.getByRole('button', { name: 'Daftar dengan Google' }).click()
    ]);
    
    // Validasi jendela popup diarahkan ke akun Google untuk autentikasi
    await popup.waitForLoadState();
    expect(popup.url()).toContain('accounts.google.com');
  });

  test('TC90: Validasi navigasi tautan dokumen legal dan masuk', async ({ page, context }) => {
    // Tautan legal seringkali membuka tab baru (target="_blank")
    const [tabSyarat] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('link', { name: 'Syarat & Ketentuan' }).click()
    ]);
    await tabSyarat.waitForLoadState();
    expect(tabSyarat.url()).toMatch(/.*(syarat|terms)/);

    const [tabPrivasi] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('link', { name: 'Kebijakan Privasi' }).click()
    ]);
    await tabPrivasi.waitForLoadState();
    expect(tabPrivasi.url()).toMatch(/.*(privasi|privacy)/);

    // Tautan Masuk di sini (Biasanya satu halaman)
    await page.getByRole('link', { name: 'Masuk di sini' }).click();
    await expect(page).toHaveURL(/.*login/);
  });

});