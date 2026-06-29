// One-time icon generator. Produces square app icons (with the tall, transparent
// yn-icon logo centered on a solid background) for the PWA manifest and the iOS
// "Add to Home Screen" apple-touch-icon.
//
// Run from web/:  npm install --no-save sharp && node scripts/gen-icons.mjs
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, '..', '..', 'assets', 'yn-icon.png');
const OUT = join(__dirname, '..', 'public', 'icons');

// Background behind the (transparent) logo. Matches the app's dark theme so the
// icon looks intentional rather than getting an iOS-default black fill.
const BG = { r: 0x21, g: 0x21, b: 0x21, alpha: 1 };

async function make(size, file, padRatio = 0.12) {
  const inner = Math.round(size * (1 - padRatio * 2));
  const logo = await sharp(SRC)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(join(OUT, file));
  console.log('wrote', file, size + 'x' + size);
}

await make(180, 'apple-touch-icon.png');
await make(192, 'icon-192.png');
await make(512, 'icon-512.png');
console.log('done');
