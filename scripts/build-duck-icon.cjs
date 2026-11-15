const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function buildDuckIcon() {
  const input = 'C:/Users/PS/.gemini/antigravity/brain/ad9e1b35-8839-406e-b4a7-7aba241781de/.user_uploaded/media_1794701297454_2fe736bf.jpg';
  if (!fs.existsSync(input)) {
    throw new Error('Source duck icon not found at ' + input);
  }

  // 1. Clean up old favicon.ico files to prevent conflicts
  const appIco = path.resolve('src/app/favicon.ico');
  const publicIco = path.resolve('public/favicon.ico');
  if (fs.existsSync(appIco)) {
    fs.unlinkSync(appIco);
    console.log('✓ Deleted src/app/favicon.ico');
  }
  if (fs.existsSync(publicIco)) {
    fs.unlinkSync(publicIco);
    console.log('✓ Deleted public/favicon.ico');
  }

  // 2. Isolate the exact duck silhouette
  // Trim any outer white whitespace to isolate the duck bounding box
  const trimmed = await sharp(input).trim().png().toBuffer();
  const trimmedMeta = await sharp(trimmed).metadata();
  console.log('Trimmed duck dimensions:', trimmedMeta.width, 'x', trimmedMeta.height);

  // 3. Center the duck inside a 512x512 square canvas with ~15% padding
  // Target duck height: 420px (so it fills ~82% of height, looking crisp & prominent in tabs)
  const targetDuckHeight = 420;
  const targetDuckWidth = Math.round((targetDuckHeight / trimmedMeta.height) * trimmedMeta.width);
  const resizedDuck = await sharp(trimmed)
    .resize(targetDuckWidth, targetDuckHeight, { fit: 'inside' })
    .png()
    .toBuffer();

  const topOffset = Math.round((512 - targetDuckHeight) / 2);
  const leftOffset = Math.round((512 - targetDuckWidth) / 2);

  // Composite onto a 512x512 white background canvas (clean luxury square)
  const masterIconBuffer = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([
      {
        input: resizedDuck,
        top: topOffset,
        left: leftOffset,
      },
    ])
    .png()
    .toBuffer();

  // 4. Save to src/app/icon.png (Next.js App Router automatic favicon)
  fs.writeFileSync('src/app/icon.png', masterIconBuffer);
  console.log('✓ Created src/app/icon.png');

  // 5. Save to src/app/apple-icon.png (Next.js App Router automatic Apple icon)
  fs.writeFileSync('src/app/apple-icon.png', masterIconBuffer);
  console.log('✓ Created src/app/apple-icon.png');

  // 6. Save to public/icon.png (for direct URL access)
  fs.writeFileSync('public/icon.png', masterIconBuffer);
  console.log('✓ Created public/icon.png');

  // 7. Save to public/apple-touch-icon.png (180x180 for iOS devices)
  await sharp(masterIconBuffer)
    .resize(180, 180)
    .png()
    .toFile('public/apple-touch-icon.png');
  console.log('✓ Created public/apple-touch-icon.png (180x180)');

  // 8. Update public/favicon.svg to match
  const duckBase64 = resizedDuck.toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <title>Duck Cosmetics Icon</title>
  <rect width="512" height="512" fill="#FFFFFF"/>
  <image href="data:image/png;base64,${duckBase64}" x="${leftOffset}" y="${topOffset}" width="${targetDuckWidth}" height="${targetDuckHeight}" preserveAspectRatio="xMidYMid meet"/>
</svg>`;
  fs.writeFileSync('public/favicon.svg', svgContent, 'utf-8');
  console.log('✓ Updated public/favicon.svg');
}

buildDuckIcon().catch((err) => {
  console.error('Error building duck icon:', err);
  process.exit(1);
});
