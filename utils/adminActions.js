// Lokasi: utils/adminActions.js
export async function approveTransactionAndGetCode(adminPage, email) {
  await adminPage.goto('https://layarbaca.app/admin/transactions');
  
  // Cari baris transaksi sesuai email donatur dan klik Terima
  const row = adminPage.locator('tr, .row-container').filter({ hasText: email }).first();
  await row.getByRole('button', { name: /Terima/i }).click();

  // Cari popup berdasarkan teks yang pasti muncul, bukan class CSS
  const popup = adminPage.getByText(/Kode .* dibuat/i).first();
  
  // Tunggu hingga teks tersebut benar-benar muncul di layar
  await popup.waitFor({ state: 'visible', timeout: 15000 });
  const popupText = await popup.textContent();
  
  // Ekstrak kode (misal: "PXAKIB") menggunakan Regex
  const match = popupText.match(/Kode\s+([A-Z0-9]+)\s+dibuat/i);
  if (!match) {
    throw new Error(`Gagal mengekstrak kode dari teks: ${popupText}`);
  }
  
  return match[1]; 
}