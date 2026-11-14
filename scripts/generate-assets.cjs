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

  // 2. Generate Favicon with official brand logo
  const inputLogo = path.resolve('public/duck-logo.jpg');
  const trimmed = await sharp(inputLogo).trim().png().toBuffer();
  const trimmedMeta = await sharp(trimmed).metadata();

  const logoWidth = 432;
  const logoHeight = Math.round((logoWidth / trimmedMeta.width) * trimmedMeta.height);
  const resizedTrimmed = await sharp(trimmed)
    .resize(logoWidth, logoHeight, { fit: 'inside' })
    .png()
    .toBuffer();

  const base64Data = resizedTrimmed.toString('base64');
  const topOffset = Math.round((512 - logoHeight) / 2);
  const leftOffset = Math.round((512 - logoWidth) / 2);

  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="104" fill="#FFFFFF"/>
  <rect width="512" height="512" rx="104" fill="none" stroke="#5D3A7A" stroke-width="12" stroke-opacity="0.16"/>
  <image href="data:image/png;base64,${base64Data}" x="${leftOffset}" y="${topOffset}" width="${logoWidth}" height="${logoHeight}" preserveAspectRatio="xMidYMid meet"/>
</svg>`;

  fs.writeFileSync('public/favicon.svg', faviconSvg, 'utf8');

  // Also output favicon.png (32x32 and 192x192)
  await sharp(Buffer.from(faviconSvg)).resize(32, 32).png().toFile('public/favicon-32x32.png');
  await sharp(Buffer.from(faviconSvg)).resize(192, 192).png().toFile('public/favicon-192x192.png');
  await sharp(Buffer.from(faviconSvg)).resize(180, 180).png().toFile('public/apple-touch-icon.png');
  await sharp(Buffer.from(faviconSvg)).resize(48, 48).toFile('public/favicon.ico');
  fs.copyFileSync('public/favicon.ico', 'src/app/favicon.ico');
  await sharp(Buffer.from(faviconSvg)).resize(32, 32).png().toFile('src/app/icon.png');

  console.log('✓ Created public/favicon.svg, favicon.ico, and PNG favicons');
}

run().catch((err) => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
