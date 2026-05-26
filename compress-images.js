/**
 * Web Optimization Image Compressor
 * - 원본 백업: images_backup/
 * - 압축 결과: images/ (제자리 교체)
 * - 목표: 각 파일 1MB 이하, 화질 최대 유지
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, 'images');
const BACKUP_DIR = path.join(__dirname, 'images_backup');
const MAX_SIZE_BYTES = 1 * 1024 * 1024; // 1MB
const SUPPORTED_EXTS = ['.jpg', '.jpeg', '.png'];

// 통계
const stats = {
  total: 0,
  alreadyOk: 0,
  compressed: 0,
  failed: 0,
  savedBytes: 0,
};

function getAllImages(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getAllImages(fullPath));
    } else if (
      SUPPORTED_EXTS.includes(path.extname(entry.name).toLowerCase()) &&
      !entry.name.startsWith('._') // macOS 리소스 포크 파일 제외
    ) {
      results.push(fullPath);
    }
  }
  return results;
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function backupFile(srcPath) {
  const relativePath = path.relative(IMAGES_DIR, srcPath);
  const backupPath = path.join(BACKUP_DIR, relativePath);
  ensureDir(path.dirname(backupPath));
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(srcPath, backupPath);
  }
}

async function compressImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const originalSize = fs.statSync(filePath).size;

  // 1MB 이하면 건너뜀
  if (originalSize <= MAX_SIZE_BYTES) {
    stats.alreadyOk++;
    return { status: 'ok', originalSize, newSize: originalSize };
  }

  // 원본 백업
  backupFile(filePath);

  const isJpeg = ext === '.jpg' || ext === '.jpeg';
  const isPng = ext === '.png';

  // 압축 시도: 품질을 단계적으로 낮춰가며 1MB 이하로 맞춤
  const qualitySteps = isJpeg ? [88, 82, 76, 70, 64, 58, 50] : [90, 80, 70, 60, 50];

  let buffer = null;
  let usedQuality = null;

  // 유니코드 경로 문제 우회: 파일을 Buffer로 읽어 sharp에 전달
  const fileBuffer = fs.readFileSync(filePath);

  // 메타데이터 읽기
  const meta = await sharp(fileBuffer).metadata();
  const maxDimension = 2400;

  for (const quality of qualitySteps) {
    let pipeline = sharp(fileBuffer);

    // 해상도가 매우 크면(2400px 이상) 리사이즈 (최대 2400px 유지)
    if ((meta.width || 0) > maxDimension || (meta.height || 0) > maxDimension) {
      pipeline = pipeline.resize(maxDimension, maxDimension, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    if (isJpeg) {
      buffer = await pipeline
        .jpeg({ quality, mozjpeg: true, progressive: true })
        .toBuffer();
    } else if (isPng) {
      buffer = await pipeline
        .png({ quality, compressionLevel: 9, progressive: true })
        .toBuffer();
    }

    if (buffer.length <= MAX_SIZE_BYTES) {
      usedQuality = quality;
      break;
    }
  }

  // 여전히 크면 더 강하게 리사이즈
  if (!buffer || buffer.length > MAX_SIZE_BYTES) {
    const scaleFactor = Math.sqrt(MAX_SIZE_BYTES / (buffer ? buffer.length : originalSize)) * 0.9;
    const newWidth = Math.floor((meta.width || 1920) * scaleFactor);

    let pipeline = sharp(fileBuffer).resize(newWidth, null, {
      fit: 'inside',
      withoutEnlargement: false,
    });

    if (isJpeg) {
      buffer = await pipeline.jpeg({ quality: 75, mozjpeg: true, progressive: true }).toBuffer();
    } else if (isPng) {
      buffer = await pipeline.png({ quality: 70, compressionLevel: 9 }).toBuffer();
    }
    usedQuality = 'resize+compress';
  }

  // 결과 저장 (원본 덮어쓰기)
  fs.writeFileSync(filePath, buffer);
  const newSize = buffer.length;

  return {
    status: 'compressed',
    originalSize,
    newSize,
    quality: usedQuality,
    savedBytes: originalSize - newSize,
  };
}

function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)}MB`;
  return `${(bytes / 1024).toFixed(1)}KB`;
}

async function main() {
  console.log('🖼️  Web Image Optimizer');
  console.log('━'.repeat(60));
  console.log(`📁 원본 백업 위치: images_backup/`);
  console.log(`🎯 목표: 각 파일 1MB 이하, 화질 최대 유지\n`);

  ensureDir(BACKUP_DIR);

  const images = getAllImages(IMAGES_DIR);
  stats.total = images.length;

  console.log(`총 ${images.length}개 이미지 발견\n`);

  for (let i = 0; i < images.length; i++) {
    const filePath = images[i];
    const relPath = path.relative(IMAGES_DIR, filePath);
    const fileName = path.basename(filePath);

    try {
      const result = await compressImage(filePath);

      if (result.status === 'ok') {
        process.stdout.write(`✅ [${i + 1}/${images.length}] ${fileName} — ${formatSize(result.originalSize)} (이미 최적화됨)\n`);
      } else {
        stats.compressed++;
        stats.savedBytes += result.savedBytes;
        const pct = Math.round((1 - result.newSize / result.originalSize) * 100);
        process.stdout.write(
          `🗜️  [${i + 1}/${images.length}] ${fileName}\n` +
          `    ${formatSize(result.originalSize)} → ${formatSize(result.newSize)} (-${pct}%) [품질: ${result.quality}]\n`
        );
      }
    } catch (err) {
      stats.failed++;
      console.error(`❌ [${i + 1}/${images.length}] ${fileName} — 오류: ${err.message}`);
    }
  }

  console.log('\n' + '━'.repeat(60));
  console.log('📊 압축 완료 요약');
  console.log('━'.repeat(60));
  console.log(`  전체 파일  : ${stats.total}개`);
  console.log(`  이미 최적화: ${stats.alreadyOk}개`);
  console.log(`  압축 완료  : ${stats.compressed}개`);
  console.log(`  실패       : ${stats.failed}개`);
  console.log(`  절감 용량  : ${formatSize(stats.savedBytes)}`);
  console.log(`\n💾 원본 백업: C:\\Users\\user\\portfolio\\images_backup\\`);
}

main().catch(console.error);
