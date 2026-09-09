/* ================================================================
   BANI — ровно 2 экрана по горизонтали (hero → franchise).
   На экране hero любой скролл трекпадом/колесом уводит вправо, на
   экран franchise. Внутри franchise — обычный вертикальный скролл;
   докрутка вверх до упора возвращает влево, на hero.
   ================================================================ */

(function initScreens() {
  const franchise = document.getElementById('franchise');
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  let target = window.scrollX || window.pageXOffset;
  let ticking = false;
  const maxScroll = () => document.documentElement.scrollWidth - window.innerWidth;

  function scrollHoriz(delta) {
    target = clamp(target + delta, 0, maxScroll());
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => { window.scrollTo({ left: target, behavior: 'auto' }); ticking = false; });
    }
  }
  function goTo(screen) { // 0 = hero, 1 = franchise
    target = screen * window.innerWidth;
    window.scrollTo({ left: target, behavior: 'smooth' });
  }

  function onWheel(e) {
    const onHero = (window.scrollX || window.pageXOffset) < window.innerWidth - 2;
    const atTop = franchise ? franchise.scrollTop <= 0 : true;
    if (onHero || (atTop && e.deltaY < 0 && Math.abs(e.deltaY) >= Math.abs(e.deltaX))) {
      e.preventDefault();
      scrollHoriz(Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY);
    }
    // иначе — обычный вертикальный скролл внутри franchise, без вмешательства
  }
  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('scroll', () => { target = window.scrollX || window.pageXOffset; });
  window.addEventListener('resize', () => { target = clamp(target, 0, maxScroll()); });

  document.addEventListener('keydown', (e) => {
    if (['ArrowRight', 'PageDown'].includes(e.key)) { e.preventDefault(); goTo(1); }
    if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); goTo(0); }
  });

  const navLogo = document.getElementById('navLogo');
  if (navLogo) navLogo.addEventListener('click', (e) => { e.preventDefault(); goTo(0); });
  const navCta = document.getElementById('navCta');
  if (navCta) navCta.addEventListener('click', (e) => {
    e.preventDefault();
    goTo(1);
    setTimeout(() => document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' }), 350);
  });

  // прямая ссылка вида #economics при загрузке — сначала уйти на экран 2, потом докрутить
  if (location.hash.length > 1) {
    const el = document.querySelector(location.hash);
    if (el && franchise && franchise.contains(el)) {
      window.scrollTo(0, 0);
      target = 0;
      setTimeout(() => { goTo(1); setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 400); }, 50);
    }
  }
})();

/* ---------------- DnD: стикеры, декоративные объекты, конструктор ---------------- */
function setupDraggable(el, bounds) {
  if (window.gsap && window.Draggable) {
    Draggable.create(el, {
      type: 'x,y',
      bounds,
      inertia: !!window.InertiaPlugin,
      edgeResistance: 0.6,
      onPress() { el.style.zIndex = 999; },
    });
    return;
  }
  // Фолбэк без GSAP: обычный drag мышью/тачем
  let dragging = false, offX = 0, offY = 0;
  const parent = bounds || el.offsetParent || document.body;
  function down(e) {
    dragging = true; el.style.zIndex = 999;
    const p = e.touches ? e.touches[0] : e;
    const r = el.getBoundingClientRect();
    offX = p.clientX - r.left; offY = p.clientY - r.top;
    e.preventDefault();
  }
  function move(e) {
    if (!dragging) return;
    const p = e.touches ? e.touches[0] : e;
    const pr = parent.getBoundingClientRect();
    el.style.position = 'absolute';
    el.style.left = p.clientX - pr.left - offX + 'px';
    el.style.top = p.clientY - pr.top - offY + 'px';
    e.preventDefault();
  }
  function up() { dragging = false; }
  el.addEventListener('mousedown', down);
  el.addEventListener('touchstart', down, { passive: false });
  document.addEventListener('mousemove', move, { passive: false });
  document.addEventListener('touchmove', move, { passive: false });
  document.addEventListener('mouseup', up);
  document.addEventListener('touchend', up);
}

(function initDragObjects() {
  try {
    if (window.gsap && window.Draggable) gsap.registerPlugin(Draggable, window.InertiaPlugin);
  } catch (e) { /* игнорируем — сработает фолбэк */ }

  document.querySelectorAll('[data-drag]').forEach((el) => {
    setupDraggable(el, el.closest('.panel'));
  });
})();

/* ---------------- Конструктор франшизы (собери точку BANI) ---------------- */
(function initBuilder() {
  const pieces = document.querySelectorAll('[data-piece]');
  const zone = document.getElementById('builderZone');
  const msg = document.getElementById('builderMsg');
  const stage = document.getElementById('builderStage');
  if (!pieces.length || !zone || !stage) return;

  function checkComplete() {
    const placed = document.querySelectorAll('[data-piece].placed').length;
    zone.classList.toggle('full', placed === pieces.length);
    if (msg) msg.classList.toggle('show', placed === pieces.length);
  }

  const hasGsap = window.gsap && window.Draggable;
  if (hasGsap) {
    try { gsap.registerPlugin(Draggable, window.InertiaPlugin); } catch (e) {}
  }

  pieces.forEach((piece) => {
    if (hasGsap) {
      try {
        Draggable.create(piece, {
          type: 'x,y',
          bounds: stage,
          inertia: !!window.InertiaPlugin,
          edgeResistance: 0.65,
          onPress() { piece.style.zIndex = 60; },
          onDragEnd() {
            piece.classList.toggle('placed', Draggable.hitTest(piece, zone, '40%'));
            checkComplete();
          },
        });
        return;
      } catch (e) { /* падаем в фолбэк ниже */ }
    }
    // Фолбэк без GSAP
    let dragging = false, offX = 0, offY = 0;
    piece.style.position = 'absolute';
    function down(e) {
      dragging = true; piece.style.zIndex = 60;
      const p = e.touches ? e.touches[0] : e;
      const r = piece.getBoundingClientRect();
      offX = p.clientX - r.left; offY = p.clientY - r.top;
      e.preventDefault();
    }
    function move(e) {
      if (!dragging) return;
      const p = e.touches ? e.touches[0] : e;
      const sr = stage.getBoundingClientRect();
      piece.style.left = p.clientX - sr.left - offX + 'px';
      piece.style.top = p.clientY - sr.top - offY + 'px';
      e.preventDefault();
    }
    function up() {
      if (!dragging) return;
      dragging = false;
      const pr = piece.getBoundingClientRect(), zr = zone.getBoundingClientRect();
      const overlap = !(pr.right < zr.left || pr.left > zr.right || pr.bottom < zr.top || pr.top > zr.bottom);
      piece.classList.toggle('placed', overlap);
      checkComplete();
    }
    piece.addEventListener('mousedown', down);
    piece.addEventListener('touchstart', down, { passive: false });
    document.addEventListener('mousemove', move, { passive: false });
    document.addEventListener('touchmove', move, { passive: false });
    document.addEventListener('mouseup', up);
    document.addEventListener('touchend', up);
  });
})();

/* ---------------- Меню/продукт ---------------- */
const menu = {
  'Пицца': [
    ['Тамбовский окорок, трюфель', 1270, 'Дровяная печь, домашнее тесто'],
    ['С артишоками', 1210, 'Хрустящая корочка, сливочный соус'],
    ['Бекон', 1190, '23 см'],
    ['Мортаделла, страчателла', 1270, 'Томатный соус'],
    ['Креветки, страчателла', 1400, '23 см'],
    ['Диабола', 1190, 'Острая'],
    ['Бри, клюква', 1270, '23 см'],
    ['Шампиньоны, трюфель', 1170, 'Классика'],
  ],
  'Паста': [
    ['Карбонара', 980, 'Домашняя паста, сливочный соус'],
    ['Феттуччини, грибы, трюфель', 880, ''],
    ['Ньокки, курица, песто', 890, ''],
    ['Креветки, качо э пеппе', 1090, ''],
  ],
  'Салаты': [
    ['Цезарь с курицей', 890, 'Томаты черри, романо'],
    ['Цезарь, лангустино', 1100, ''],
  ],
  'Напитки': [
    ['Лимонад Личи-огурец', 610, ''],
    ['Лимонад Манго-маракуйя', 610, ''],
    ['Вода Baikal', 270, ''],
    ['Coca-Cola', 410, ''],
  ],
};

(function initMenu() {
  const catRow = document.getElementById('catRow');
  const menuCards = document.getElementById('menuCards');
  if (!catRow || !menuCards) return;
  const cats = Object.keys(menu);

  function renderMenu(cat) {
    menuCards.innerHTML = '';
    menu[cat].forEach(([name, price, desc]) => {
      const c = document.createElement('div');
      c.className = 'mcard';
      c.innerHTML = `<div class="photo-slot">Фото блюда</div><h3>${name}</h3><div class="desc">${desc || ''}</div><div class="p">${price} ₽</div>`;
      menuCards.appendChild(c);
    });
  }
  cats.forEach((cat, i) => {
    const b = document.createElement('div');
    b.className = 'cat-btn' + (i === 0 ? ' active' : '');
    b.textContent = cat;
    b.onclick = () => {
      document.querySelectorAll('.cat-btn').forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
      renderMenu(cat);
    };
    catRow.appendChild(b);
  });
  renderMenu(cats[0]);
})();

/* ---------------- Форма заявки (демо, без бэкенда) ---------------- */
(function initLeadForm() {
  const form = document.getElementById('leadForm');
  const success = document.getElementById('leadSuccess');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    // ЗАМЕНИТЬ: отправка на бэкенд/Telegram-бот/CRM.
    form.hidden = true;
    if (success) success.hidden = false;
  });
})();
