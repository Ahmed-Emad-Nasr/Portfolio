// This script generates thumbnails for all PNG and JPG screenshots in the Cases folders.
// It uses sharp for fast image resizing and outputs webp thumbnails to public/Assets/Cases/thumbnails/

import sharp from "sharp";
import fs from "fs";
import path from "path";

const CASES_DIR = path.join(process.cwd(), "public", "Assets", "Cases");
const THUMBNAILS_DIR = path.join(CASES_DIR, "thumbnails");
const THUMB_SIZE = 320; // px width

function isImageFile(file) {
  return /\.(png|jpg|jpeg)$/i.test(file);
}

function getAllImageFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory() && file !== "thumbnails") {
      results = results.concat(getAllImageFiles(filePath));
    } else if (stat && stat.isFile() && isImageFile(file)) {
      results.push(filePath);
    }
  }
  return results;
}

function getThumbnailPath(imagePath) {
  // e.g. .../Cases/BruteForce_Room/Screenshot (228).png => .../Cases/thumbnails/BruteForce_Room__Screenshot (228).webp
  const rel = path.relative(CASES_DIR, imagePath).replace(/[\\/]/g, "__").replace(/\.(png|jpg|jpeg)$/i, ".webp");
  return path.join(THUMBNAILS_DIR, rel);
}

async function generateThumbnails() {
  if (!fs.existsSync(THUMBNAILS_DIR)) fs.mkdirSync(THUMBNAILS_DIR);
  const images = getAllImageFiles(CASES_DIR);
  for (const img of images) {
    const thumbPath = getThumbnailPath(img);
    if (fs.existsSync(thumbPath)) continue;
    await sharp(img)
      .resize(THUMB_SIZE)
      .webp({ quality: 80 })
      .toFile(thumbPath);
    console.log(`Created thumbnail: ${thumbPath}`);
  }
}

generateThumbnails().catch(console.error);
