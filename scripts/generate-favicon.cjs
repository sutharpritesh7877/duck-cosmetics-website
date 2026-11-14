const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function buildFavicons() {
  const input = path.resolve('public/duck-logo.jpg');
  if (!fs.existsSync(input)) {
    throw new Error('File not found: ' + input);
  }

  // 1. Trim whitespace to isolate the official brand mark
  const trimmed = await sharp(input).trim().png().toBuffer();
  const trimmedMeta = await sharp(trimmed).metadata();

  // 2. Size the logo mark appropriately for a 512x512 square canvas
  const logoWidth = 432;
  const logoHeight = Math.round((logoWidth / trimmedMeta.width) * trimmedMeta.height);
  const resizedTrimmed = await sharp(trimmed)
    .resize(logoWidth, logoHeight, { fit: 'inside' })
    .png()
    .toBuffer();

  const base64Data = resizedTrimmed.toString('base64');
  const topOffset = Math.round((512 - logoHeight) / 2);
  const leftOffset = Math.round((512 - logoWidth) / 2);

  // 3. Create crisp luxury SVG favicon
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="104" fill="#FFFFFF"/>
  <rect width="512" height="512" rx="104" fill="none" stroke="#5D3A7A" stroke-width="12" stroke-opacity="0.16"/>
  <image href="data:image/png;base64,${base64Data}" x="${leftOffset}" y="${topOffset}" width="${logoWidth}" height="${logoHeight}" preserveAspectRatio="xMidYMid meet"/>
</svg>`;

  fs.writeFileSync('public/favicon.svg', svgContent, 'utf-8');
  console.log('✓ Wrote public/favicon.svg');

  // 4. Render 512x512 master PNG from SVG
  const masterPng = await sharp(Buffer.from(svgContent)).resize(512, 512).png().toBuffer();

  // 5. Render favicon-192x192.png (PWA / Android)
  await sharp(masterPng).resize(192, 192).png().toFile('public/favicon-192x192.png');
  console.log('✓ Wrote public/favicon-192x192.png');

  // 6. Render apple-touch-icon.png (iOS)
  await sharp(masterPng).resize(180, 180).png().toFile('public/apple-touch-icon.png');
  console.log('✓ Wrote public/apple-touch-icon.png');

  // 7. Render favicon-32x32.png (Desktop standard)
  await sharp(masterPng).resize(32, 32).png().toFile('public/favicon-32x32.png');
  console.log('✓ Wrote public/favicon-32x32.png');

  // 8. Render favicon.ico
  await sharp(masterPng).resize(48, 48).toFile('public/favicon.ico');
  console.log('✓ Wrote public/favicon.ico');

  // 9. Synchronize Next.js App directory icon files
  fs.copyFileSync('public/favicon.ico', 'src/app/favicon.ico');
  await sharp(masterPng).resize(32, 32).png().toFile('src/app/icon.png');
  console.log('✓ Synchronized src/app/favicon.ico and src/app/icon.png');
}

buildFavicons().catch((err) => {
  console.error('Favicon build failed:', err);
  process.exit(1);
});
