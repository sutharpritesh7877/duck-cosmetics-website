const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function run() {
  const width = 1200;
  const height = 630;

  // 1. Generate OpenGraph Banner Image
  const svgBanner = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4A2D61" />
        <stop offset="50%" stop-color="#5D3A7A" />
        <stop offset="100%" stop-color="#3A1F52" />
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="45%" r="60%">
        <stop offset="0%" stop-color="#8E62B0" stop-opacity="0.35" />
        <stop offset="100%" stop-color="#5D3A7A" stop-opacity="0" />
      </radialGradient>
      <style>
        .serif { font-family: 'Playfair Display', Georgia, serif; }
        .sans { font-family: 'Inter', -apple-system, sans-serif; }
      </style>
    </defs>

    <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
    <circle cx="600" cy="280" r="380" fill="url(#glow)" />

    <!-- Inlay Border -->
    <rect x="30" y="30" width="1140" height="570" rx="24" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5" />

    <!-- Top Badge -->
    <g transform="translate(600, 110)">
      <rect x="-130" y="-18" width="260" height="36" rx="18" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" stroke-width="1" />
      <text text-anchor="middle" y="5" fill="#F8F6FA" font-size="12" font-weight="600" letter-spacing="4" class="sans">PRE-LAUNCH VIP ACCESS</text>
    </g>

    <!-- Headline -->
    <text text-anchor="middle" x="600" y="375" fill="#FFFFFF" font-size="52" font-weight="400" letter-spacing="2" class="serif">REDEFINE YOUR GLOW</text>
    
    <!-- Subhead -->
    <text text-anchor="middle" x="600" y="430" fill="rgba(255,255,255,0.85)" font-size="18" font-weight="300" letter-spacing="1.5" class="sans">Haute Botanical Skincare · Classical Ayurvedic Nectars · Pediatric Baby Care</text>

    <!-- Bottom Features -->
    <g transform="translate(600, 520)">
      <text text-anchor="middle" y="0" fill="rgba(255,255,255,0.7)" font-size="13" font-weight="500" letter-spacing="3" class="sans">100% CRUELTY-FREE  ·  DERMATOLOGICALLY TESTED  ·  AHMEDABAD MAISON</text>
    </g>
  </svg>
  `;

  const logoBuf = fs.readFileSync('public/duck-logo-white.png');
  const resizedLogo = await sharp(logoBuf).resize({ width: 340 }).toBuffer();

  await sharp(Buffer.from(svgBanner))
    .composite([
      {
        input: resizedLogo,
        top: 175,
        left: 430,
      },
    ])
    .jpeg({ quality: 95 })
    .toFile('public/og-image.jpg');

  console.log('✓ Created public/og-image.jpg');

  // 2. Generate Favicon with official brand purple #5D3A7A
  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="16" fill="#5D3A7A"/>
  <!-- Duck body matching brand emblem -->
  <path d="M46 34c0 7.732-6.268 14-14 14s-14-6.268-14-14c0-3.5 1.5-6.5 4-8.5.5-2.5 2-6 6.5-7.5 4.5-1.5 8 .5 9.5 3 2.5 1.5 5 4.5 4 13z" fill="#FFFFFF"/>
  <!-- Beak -->
  <path d="M48 24c3.5.5 6 1.8 7 3.5-2 1.5-5 1.8-7 1.2z" fill="#E8C37D"/>
  <!-- Eye -->
  <circle cx="41" cy="23" r="2.2" fill="#5D3A7A"/>
  <!-- Wing accent -->
  <path d="M26 36c2.5-3 6.5-4 10-2.5-1 4-4.5 6.5-8.5 6.5-1 0-1.5-.5-1.5-4z" fill="#EADBF7"/>
</svg>`;

  fs.writeFileSync('public/favicon.svg', faviconSvg, 'utf8');

  // Also output favicon.png (32x32 and 192x192)
  await sharp(Buffer.from(faviconSvg)).resize(32, 32).png().toFile('public/favicon-32x32.png');
  await sharp(Buffer.from(faviconSvg)).resize(192, 192).png().toFile('public/favicon-192x192.png');
  await sharp(Buffer.from(faviconSvg)).resize(48, 48).png().toFile('public/favicon.ico');

  console.log('✓ Created public/favicon.svg, favicon.ico, and PNG favicons');
}

run().catch((err) => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
