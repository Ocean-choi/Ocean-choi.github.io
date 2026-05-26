const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const TARGET_SIZE = 400 * 1024; // 400KB
const IMAGES_DIR = path.join(__dirname, 'images');

// 지원 확장자
const SUPPORTED = ['.jpg', '.jpeg', '.JPG', '.JPEG'];

// 폴더 재귀 탐색 (맥OS ._메타 파일 제외)
function getAllImages(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('._')) continue; // macOS 메타파일 스킵
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getAllImages(fullPath));
    } else if (SUPPORTED.includes(path.extname(entry.name))) {
      results.push(fullPath);
    }
  }
  return results;
}

// 품질을 이진탐색으로 찾아서 400KB 이하로 압축
async function compressImage(filePath) {
  const originalSize = fs.statSync(filePath).size;

  // 이미 400KB 이하면 스킵
  if (originalSize <= TARGET_SIZE) {
    return { filePath, status: 'skipped', originalSize, newSize: originalSize };
  }

  // 특수문자 경로 대응: 파일을 Buffer로 직접 읽어서 sharp에 전달
  const inputBuffer = fs.readFileSync(filePath);

  let low = 30, high = 90, bestBuffer = null, bestQuality = 30;

  // 이진탐색으로 최적 품질 탐색
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const buf = await sharp(inputBuffer)
      .jpeg({ quality: mid, mozjpeg: true })
      .toBuffer();

    if (buf.length <= TARGET_SIZE) {
      bestBuffer = buf;
      bestQuality = mid;
      low = mid + 1; // 품질 더 올려보기
    } else {
      high = mid - 1; // 품질 낮추기
    }
  }

  // 최고 품질로도 400KB 초과하면 quality=30 강제 적용
  if (!bestBuffer) {
    bestBuffer = await sharp(inputBuffer)
      .jpeg({ quality: 30, mozjpeg: true })
      .toBuffer();
    bestQuality = 30;
  }

  fs.writeFileSync(filePath, bestBuffer);
  return {
    filePath,
    status: 'compressed',
    originalSize,
    newSize: bestBuffer.length,
    quality: bestQuality,
  };
}

async function main() {
  const images = getAllImages(IMAGES_DIR);
  console.log(`\n총 ${images.length}개 이미지 처리 시작...\n`);

  let totalOriginal = 0, totalNew = 0, compressed = 0, skipped = 0;
  const results = [];

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const rel = path.relative(IMAGES_DIR, img);
    process.stdout.write(`[${i + 1}/${images.length}] ${rel} ... `);

    try {
      const res = await compressImage(img);
      results.push(res);
      totalOriginal += res.originalSize;
      totalNew += res.newSize;

      if (res.status === 'skipped') {
        skipped++;
        console.log(`SKIP (${(res.originalSize / 1024).toFixed(0)}KB — 이미 400KB 이하)`);
      } else {
        compressed++;
        const saving = (((res.originalSize - res.newSize) / res.originalSize) * 100).toFixed(1);
        console.log(
          `OK  ${(res.originalSize / 1024).toFixed(0)}KB → ${(res.newSize / 1024).toFixed(0)}KB  (-${saving}%, q=${res.quality})`
        );
      }
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
    }
  }

  console.log('\n========================================');
  console.log(`압축 완료: ${compressed}개 / 스킵: ${skipped}개`);
  console.log(`전체 용량: ${(totalOriginal / 1024 / 1024).toFixed(2)}MB → ${(totalNew / 1024 / 1024).toFixed(2)}MB`);
  console.log(`절약된 용량: ${((totalOriginal - totalNew) / 1024 / 1024).toFixed(2)}MB (${(((totalOriginal - totalNew) / totalOriginal) * 100).toFixed(1)}% 감소)`);
  console.log('========================================\n');
}

main().catch(console.error);
