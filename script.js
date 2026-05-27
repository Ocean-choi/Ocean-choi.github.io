'use strict';

// ── Footer year ──
document.getElementById('footer-year').textContent = new Date().getFullYear();

// ── Nav scroll state ──
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ── Back to top ──
document.getElementById('top-btn')
  .addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ── Active nav link ──
const sections = document.querySelectorAll('section[id]');
const navAs    = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAs.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => sectionObserver.observe(s));

// ── Mobile nav ──
const toggle   = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

toggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  toggle.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    toggle.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ── i18n ──
const translations = {
  en: {
    'nav-about':        'About',
    'nav-works':        'Works',
    'nav-contact':      'Contact',
    'hero-sub':         'Visual Director based in Milan',
    'hero-services':    'Fashion Creative · Spatial Design &amp; Event Planning · Private Shooting',
    'hero-desc':        'Sese - se is a Korean children\'s hand-clapping game.<br/>It only begins when two pairs of hands meet.<br/><br/>I\'m a visual director working across spaces, fashion, and branding.<br/>Based in Milan, reaching without borders.<br/>sèsèsè.Lab is how I work.',
    'section-about':    'About',
    'about-name':       'Seajong Choi',
    'about-tagline':    'Visual Director across Space, Fashion &amp; Visual',
    'about-body1':      'Reading spaces, dressing brands,<br/>speaking through images.',
    'about-body2':      'Founder of exhibition design studio SS STUDIO Ltd., running fashion group sèsèsè.Lab and snap photography service oggisnap, he leads space-based projects across Europe and Korea.',
    'about-key':        'Asian brands looking to build their visual identity in Europe — this is where we start.',
    'brand-sesese':     'sèsèsè.Lab',
    'brand-ssstudio':   'SS STUDIO Ltd.',
    'brand-oggisnap':   'oggisnap',
    'edu-ba-degree':    'Interior Design',
    'edu-ma-degree':    'Master in Urban Vision &amp; Architectural Design',
    'section-works':    'Works',
    'filter-all':       'All',
    'filter-fashion':   'Fashion',
    'filter-space':     'Spatial',
    'filter-snap':      'Snap',
    'section-contact':  'Contact',
    'contact-headline': 'Get in<br/><span class="accent">touch.</span>',
    'contact-location': 'Location',
    'contact-instagram':'Instagram',
  },
  ko: {
    'nav-about':        '소개',
    'nav-works':        '작업',
    'nav-contact':      '연락처',
    'hero-sub':         '밀라노 기반 비주얼 디렉터',
    'hero-services':    '패션 크리에이티브 · 공간 디자인 &amp; 이벤트 기획 · 프라이빗 슈팅',
    'hero-desc':        '쎄쎄쎄랩. 한국의 전통 손뼉 치기 놀이입니다.<br/>두 손이 만나야만 비로소 시작되는 놀이.<br/><br/>저는 공간, 패션, 브랜딩을 넘나드는 비주얼 디렉터입니다.<br/>밀라노를 기반으로, 경계 없이 일합니다.<br/>sèsèsè.Lab, 그것이 제가 일하는 방식입니다.',
    'section-about':    '소개',
    'about-name':       '최세종',
    'about-tagline':    '공간, 패션, 비주얼을 넘나드는 비주얼 디렉터 최세종',
    'about-body1':      '공간을 읽고, 브랜드를 입히고,<br/>이미지로 말하는 작업을 합니다.',
    'about-body2':      '패션 그룹 sèsèsè.Lab과 스냅 촬영 서비스 oggisnap을 직접 운영하며, 전시 디자인 스튜디오 SS STUDIO Ltd.의 대표로서 유럽과 한국을 오가며 공간 기반의 프로젝트를 이어가고 있습니다.',
    'about-key':        '아시아 브랜드의 유럽 비주얼 아이덴티티, 여기서 시작합니다.',
    'brand-sesese':     '쎄쎄쎄랩',
    'brand-ssstudio':   '에스에스 스튜디오 주식회사',
    'brand-oggisnap':   '오찌스냅',
    'edu-ba-degree':    '인테리어 디자인',
    'edu-ma-degree':    '어반 비전 &amp; 건축 디자인 석사',
    'section-works':    '작업',
    'filter-all':       '전체',
    'filter-fashion':   '패션',
    'filter-space':     '스페이셜',
    'filter-snap':      '스냅',
    'section-contact':  '연락처',
    'contact-headline': '연락<br/><span class="accent">해주세요.</span>',
    'contact-location': '위치',
    'contact-instagram':'인스타그램',
  },
};

let currentLang = 'en';

function applyLang(lang) {
  currentLang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (translations[lang][key] !== undefined) {
      el.innerHTML = translations[lang][key];
    }
  });
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  document.documentElement.lang = lang === 'ko' ? 'ko' : 'en';
}

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => applyLang(btn.dataset.lang));
});

// ── Gallery shuffle ──
function shuffleGallery() {
  const grid  = document.getElementById('galleryGrid');
  const items = [...grid.querySelectorAll('.gallery-item')];
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    grid.insertBefore(items[j], items[i]);
    [items[i], items[j]] = [items[j], items[i]];
  }
}

// ── Masonry row-span + landscape detection ──
const _G = 4, _R = 8;

function spanItem(item) {
  const h = item.querySelector('img')?.getBoundingClientRect().height;
  if (h) item.style.gridRowEnd = 'span ' + Math.ceil((h + _G) / (_R + _G));
}

function applyOrientation(img) {
  const item = img.closest('.gallery-item');
  if (!item) return;
  if (img.naturalWidth > img.naturalHeight) {
    item.classList.add('landscape');
    item.classList.remove('featured');
  } else {
    item.classList.remove('landscape');
    Math.random() < 0.25
      ? item.classList.add('featured')
      : item.classList.remove('featured');
  }
  requestAnimationFrame(() => spanItem(item));
}

// ── Lazy image loading (Intersection Observer) ──
function loadImage(img) {
  const src = img.dataset.src;
  if (!src) return;   // 이미 로드됐거나 src 없음

  const item = img.closest('.gallery-item');

  img.addEventListener('load', () => {
    img.classList.add('img-loaded');        // fade-in 트리거
    item?.classList.remove('img-loading'); // shimmer 제거
    applyOrientation(img);                 // 방향 감지 + masonry 재계산
  }, { once: true });

  img.addEventListener('error', () => {
    item?.classList.remove('img-loading');
  }, { once: true });

  img.src = src;
  img.removeAttribute('data-src');
}

// IO 인스턴스: 필터 변경 후에도 재사용
const imgObserver = ('IntersectionObserver' in window)
  ? new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        loadImage(entry.target);
        observer.unobserve(entry.target);
      });
    }, {
      rootMargin: '0px 0px 400px 0px',   // 뷰포트 400px 아래부터 미리 로드
      threshold: 0,
    })
  : null;

// 초기: 모든 lazy 이미지를 shimmer 상태로 설정 후 IO 등록
document.querySelectorAll('.gallery-item img.img-lazy').forEach(img => {
  img.closest('.gallery-item')?.classList.add('img-loading');
  imgObserver ? imgObserver.observe(img) : loadImage(img);
});

let _rt;
window.addEventListener('resize', () => {
  clearTimeout(_rt);
  _rt = setTimeout(() => {
    document.querySelectorAll('.gallery-item:not(.hidden)').forEach(spanItem);
  }, 150);
}, { passive: true });

// ── Gallery filter ──
const filterBtns   = document.querySelectorAll('.filter-btn');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    if (filter === 'all') shuffleGallery();

    // Re-query after potential shuffle to get current DOM order
    const items = [...document.querySelectorAll('.gallery-item')];
    items.forEach((item, i) => {
      const match = filter === 'all' || item.dataset.cat === filter;
      if (match) {
        item.classList.remove('hidden', 'fade-out');
        setTimeout(() => item.classList.add('fade-in'), i * 20);

        // hidden 해제된 아이템 중 아직 미로드 이미지 → IO 재등록
        const lazyImg = item.querySelector('img[data-src]');
        if (lazyImg) {
          imgObserver ? imgObserver.observe(lazyImg) : loadImage(lazyImg);
        }
      } else {
        item.classList.remove('fade-in');
        item.classList.add('fade-out');
        setTimeout(() => item.classList.add('hidden'), 280);
      }
    });
  });
});


// Initial shuffle on page load, then show all
shuffleGallery();
document.querySelectorAll('.gallery-item').forEach(item => item.classList.add('fade-in'));

// ── Scroll reveal ──
const revealTargets = document.querySelectorAll(
  '.about-text, .about-aside, .brand-item, .gallery-item, .contact-headline, .contact-group'
);

revealTargets.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealTargets.forEach(el => revealObserver.observe(el));

// ── Image protection ──
document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('contextmenu', e => e.preventDefault());
});
document.querySelectorAll('.gallery-item img').forEach(img => {
  img.setAttribute('draggable', 'false');
  img.addEventListener('dragstart', e => e.preventDefault());
});

// ── Lightbox ──
const lb         = document.getElementById('lightbox');
const lbImg      = lb.querySelector('.lb-img');
lbImg.setAttribute('draggable', 'false');
lbImg.addEventListener('contextmenu', e => e.preventDefault());
lbImg.addEventListener('dragstart',   e => e.preventDefault());
const lbCat      = lb.querySelector('.lb-cat');
const lbTitle    = lb.querySelector('.lb-title');
const lbCount    = lb.querySelector('.lb-count');
const lbClose    = lb.querySelector('.lb-close');
const lbPrev     = lb.querySelector('.lb-prev');
const lbNext     = lb.querySelector('.lb-next');
const lbBackdrop = lb.querySelector('.lb-backdrop');

let lbPool  = [];
let lbIndex = 0;

function getVisibleImgItems() {
  // Query fresh to respect current DOM order (after shuffle)
  return [...document.querySelectorAll('.gallery-item')].filter(item =>
    !item.classList.contains('hidden') && item.querySelector('img')
  );
}

function openLightbox(pool, index) {
  lbPool  = pool;
  lbIndex = index;
  renderLightbox();
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lb.classList.remove('open');
  document.body.style.overflow = '';
}

function renderLightbox() {
  const item  = lbPool[lbIndex];
  const img   = item.querySelector('img');
  const cat   = item.querySelector('.gal-cat')?.textContent ?? '';
  const title = item.querySelector('.gal-title')?.textContent ?? '';

  lbImg.classList.remove('loaded');
  lbCat.textContent   = cat;
  lbTitle.textContent = title;
  lbCount.textContent = `${lbIndex + 1} / ${lbPool.length}`;

  lbPrev.hidden = lbIndex === 0;
  lbNext.hidden = lbIndex === lbPool.length - 1;

  // img.src: 이미 로드된 경우 / img.dataset.src: 아직 lazy-load 전인 경우
  const imgSrc = img.src || img.dataset.src || '';
  const tmp = new Image();
  tmp.onload = () => {
    lbImg.src = tmp.src;
    lbImg.alt = img.alt;
    lbImg.classList.add('loaded');
  };
  tmp.src = imgSrc;
}

function stepLightbox(dir) {
  const next = lbIndex + dir;
  if (next < 0 || next >= lbPool.length) return;
  lbIndex = next;
  renderLightbox();
}

document.getElementById('galleryGrid').addEventListener('click', e => {
  const item = e.target.closest('.gallery-item');
  if (!item || !item.querySelector('img')) return;
  const pool = getVisibleImgItems();
  const idx  = pool.indexOf(item);
  if (idx >= 0) openLightbox(pool, idx);
});

lbClose.addEventListener('click', closeLightbox);
lbBackdrop.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', () => stepLightbox(-1));
lbNext.addEventListener('click', () => stepLightbox(1));

document.addEventListener('keydown', e => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  stepLightbox(-1);
  if (e.key === 'ArrowRight') stepLightbox(1);
});

let touchStartX = 0;
lb.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) stepLightbox(dx < 0 ? 1 : -1);
});
