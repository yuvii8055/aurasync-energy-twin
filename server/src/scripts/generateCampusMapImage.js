import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PNG } from 'pngjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '..', '..', '..', 'client', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const width = 1600;
const height = 1000;
const png = new PNG({ width, height });

// Fill background with landscaped campus lawn (#1e3323)
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (width * y + x) << 2;
    // Base grass texture with subtle variation
    const noise = ((x * 13 + y * 29) % 17) - 8;
    png.data[idx] = Math.max(0, Math.min(255, 32 + noise));      // R
    png.data[idx + 1] = Math.max(0, Math.min(255, 54 + noise));  // G
    png.data[idx + 2] = Math.max(0, Math.min(255, 38 + noise));  // B
    png.data[idx + 3] = 255;                                     // A
  }
}

function setPixel(x, y, r, g, b, a = 255) {
  if (x < 0 || x >= width || y < 0 || y >= height) return;
  const idx = (width * y + x) << 2;
  png.data[idx] = r;
  png.data[idx + 1] = g;
  png.data[idx + 2] = b;
  png.data[idx + 3] = a;
}

function fillRect(rx, ry, rw, rh, r, g, b) {
  for (let y = Math.floor(ry); y < Math.floor(ry + rh); y++) {
    for (let x = Math.floor(rx); x < Math.floor(rx + rw); x++) {
      setPixel(x, y, r, g, b);
    }
  }
}

function drawLine(x0, y0, x1, y1, r, g, b, thickness = 2) {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  let cx = x0;
  let cy = y0;
  while (true) {
    for (let tx = -Math.floor(thickness / 2); tx <= Math.floor(thickness / 2); tx++) {
      for (let ty = -Math.floor(thickness / 2); ty <= Math.floor(thickness / 2); ty++) {
        setPixel(cx + tx, cy + ty, r, g, b);
      }
    }
    if (cx === x1 && cy === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      cx += sx;
    }
    if (e2 < dx) {
      err += dx;
      cy += sy;
    }
  }
}

// 1. Draw Kanakapura Main Road (along top/north: x=0..width, y=20..90)
fillRect(0, 30, width, 55, 45, 48, 55); // Asphalt
// Dashed white road markings
for (let x = 0; x < width; x += 40) {
  fillRect(x, 56, 20, 3, 240, 240, 240);
}

// 2. Campus Main Entrance Avenue (running south from road: x=240..310, y=85..920)
fillRect(240, 85, 70, 835, 52, 56, 64);
// Internal cross loop roads
fillRect(310, 380, 1180, 48, 52, 56, 64);
fillRect(310, 680, 1180, 45, 52, 56, 64);
fillRect(1440, 85, 55, 835, 52, 56, 64);
fillRect(820, 85, 50, 835, 52, 56, 64);

// 3. Green Belt & Forest Conservation Area (South-West)
fillRect(60, 450, 160, 480, 24, 76, 36);

// 4. DSATM Basketball Court (x=80, y=140, w=130, h=190)
fillRect(75, 135, 140, 200, 42, 68, 120); // Acrylic blue court
// Court markings (white lines)
for (let x = 85; x <= 205; x++) {
  setPixel(x, 145, 255, 255, 255);
  setPixel(x, 325, 255, 255, 255);
  setPixel(x, 235, 255, 255, 255); // half court
}
for (let y = 145; y <= 325; y++) {
  setPixel(85, y, 255, 255, 255);
  setPixel(205, y, 255, 255, 255);
}

// 5. ElectricPe EV Charging Station (x=120, y=360, w=100, h=65)
fillRect(115, 355, 105, 70, 25, 95, 85); // Teal EV Bay

// 6. Dayananda Sagar Academy of Technology and Management - Main Building
// (x=360, y=140, w=410, h=210)
fillRect(350, 130, 430, 230, 85, 80, 95); // Roof concrete
fillRect(370, 150, 390, 190, 68, 72, 84); // Inner roof structure
fillRect(470, 200, 190, 90, 40, 65, 45);  // Central courtyard green

// 7. Dayananda Sagar Business Academy (DSBA)
// (x=920, y=140, w=380, h=210)
fillRect(910, 130, 400, 230, 95, 85, 80);
fillRect(930, 150, 360, 190, 75, 70, 78);

// 8. DSATM Mechanical & Civil Engineering Block
// (x=360, y=450, w=410, h=200)
fillRect(350, 440, 430, 220, 80, 88, 96);
fillRect(370, 460, 390, 180, 65, 74, 82);
// Workshop sheds
fillRect(620, 480, 120, 140, 105, 112, 120);

// 9. Block-C Academic Block
// (x=920, y=450, w=380, h=200)
fillRect(910, 440, 400, 220, 88, 82, 92);
fillRect(930, 460, 360, 180, 72, 68, 76);

// 10. Boys Hostel 1
// (x=360, y=750, w=410, h=190)
fillRect(350, 740, 430, 210, 95, 90, 82);
fillRect(370, 760, 390, 170, 78, 74, 68);

// 11. Parking & Solar Array Canopy
// (x=920, y=750, w=380, h=190)
fillRect(910, 740, 400, 210, 40, 45, 55);
// Solar panels (deep blue strips)
for (let y = 760; y < 920; y += 22) {
  fillRect(930, y, 360, 14, 25, 45, 110);
}

// Write to client/public/dsatm-map.png
const outputPath = path.join(publicDir, 'dsatm-map.png');
png.pack().pipe(fs.createWriteStream(outputPath)).on('finish', () => {
  console.log('✅ Generated campus map image at:', outputPath);
});
