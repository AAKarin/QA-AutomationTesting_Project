// utils/chaos_prompts.js

export const CHAOS_PAYLOADS = {
  // 1. Stress Test Numerik Extreme (Injeksi Angka & Float Raksasa)
  numericOverflow: [
    "9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999",
    "0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001",
    "-9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999"
  ],

  // 2. Syntax & Injections (Pemicu Unescaped Error / HTTP 500)
  codeInjections: [
    "<script>alert('QA_STAGING_TEST')</script>",
    "SELECT * FROM users WHERE '1'='1' --",
    "{ \"status\": 500, \"payload\": null, \"err\": \"CRASH_TEST\" }",
    "\\u0000\\u0001\\u0002 ░▒▓█ ﷽ 𝄠𝄡𝄢"
  ],

  // 3. String Overflow (Batas Maksimal Input Prompt)
  extremeLength: "A".repeat(5000)
};