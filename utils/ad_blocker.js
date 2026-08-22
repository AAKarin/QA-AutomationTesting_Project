/**
 * Utility Pemblokir Iklan Komprehensif (Adsterra, Monetag, Pop-under & DOM Overlay)
 * @param {import('@playwright/test').Page} page
 */
export async function setupAdBlocker(page) {
  // 1. Blokir Network Request berdasarkan kata kunci domain iklan
  await page.route('**/*', (route) => {
    const url = route.request().url().toLowerCase();
    
    const isAdDomain = [
      'adsterra',
      'monetag',
      'onclickads',
      'popcash',
      'highcpmgate',
      'googlesyndication.com',
      'doubleclick.net',
      'adservice.google.com',
      'propush',
      'hilltopads',
      'adspirer',
      'xmlsof'
    ].some((domain) => url.includes(domain));

    // Blokir juga file JS iklan bawaan Monetag/Adsterra (biasanya berakhiran .js dengan nama acak)
    const isAdScript = url.includes('/tag.js') || url.includes('/zone.js') || url.includes('native.js');

    if (isAdDomain || isAdScript) {
      return route.abort();
    }
    return route.continue();
  });

  // 2. Otomatis Tutup Pop-under / Tab Baru dari Iklan
  page.on('popup', async (popup) => {
    try {
      await popup.close();
    } catch (e) {
      // Abaikan jika popup sudah tertutup
    }
  });

  // 3. Suntikkan CSS untuk menyembunyikan elemen banner/container iklan yang tersisa di DOM
  await page.addInitScript(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      [id*="ad-"], [class*="ad-"], [id*="banner"], [class*="banner"],
      iframe[src*="about:blank"], iframe[src*="ads"],
      div[style*="z-index: 2147483647"], div[style*="z-index: 999999"] {
        display: none !important;
        pointer-events: none !important;
      }
    `;
    document.head?.appendChild(style);
  });
}