document.documentElement.classList.add('js');
const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

/* ---------- Navbar state, progress bar, back-to-top ---------- */
const nav = $('#nav'), bar = $('#progress'), toTop = $('#toTop');
function onScroll() {
  const y = scrollY, h = document.documentElement;
  nav.classList.toggle('scrolled', y > 40);
  bar.style.width = (y / (h.scrollHeight - h.clientHeight) * 100) + '%';
  toTop.classList.toggle('show', y > 700);
  spy();
}
addEventListener('scroll', onScroll, { passive: true });
toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

/* ---------- Scroll-spy: highlights the current section in the navbar ---------- */
const spyLinks = [...$$('#links a, .drawer-links a')];
const linkHrefs = [...new Set(spyLinks.map(a => a.getAttribute('href')))];
const sections = [...$$('main section[id]')];
function spy() {
  const pos = scrollY + 150;
  let cur = '#top';
  sections.forEach(s => { if (s.offsetTop <= pos) cur = s.dataset.group || '#' + s.id; });
  if (!linkHrefs.includes(cur)) {
    // sections without their own nav link inherit the closest previous one
    const idx = sections.findIndex(s => '#' + s.id === cur);
    for (let i = idx; i >= 0; i--) {
      const g = sections[i].dataset.group || '#' + sections[i].id;
      if (linkHrefs.includes(g)) { cur = g; break; }
    }
  }
  if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) cur = '#contact';
  spyLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === cur));
}

/* ---------- Mobile drawer ---------- */
const drawer = $('#drawer'), overlay = $('#overlay'), burger = $('#burger');
function setDrawer(open) {
  drawer.classList.toggle('open', open);
  overlay.classList.toggle('show', open);
  document.body.classList.toggle('lock', open);
  burger.setAttribute('aria-expanded', open);
  drawer.setAttribute('aria-hidden', !open);
}
burger.addEventListener('click', () => setDrawer(true));
$('#close').addEventListener('click', () => setDrawer(false));
overlay.addEventListener('click', () => setDrawer(false));
$$('.drawer a').forEach(a => a.addEventListener('click', () => setDrawer(false)));
addEventListener('keydown', e => { if (e.key === 'Escape') setDrawer(false); });

/* ---------- Hero slideshow ---------- */
const slides = [...$$('.slide')], dotsBox = $('#dots');
let cur = 0, timer;
slides.forEach((_, i) => {
  const b = document.createElement('button');
  b.setAttribute('aria-label', 'صورة ' + (i + 1));
  b.addEventListener('click', () => { show(i); restart(); });
  dotsBox.appendChild(b);
});
const dots = [...dotsBox.children];
function show(i) {
  slides[cur].classList.remove('on'); dots[cur].classList.remove('on');
  cur = i;
  slides[cur].classList.remove('on'); void slides[cur].offsetWidth; // restart the zoom animation
  slides[cur].classList.add('on'); dots[cur].classList.add('on');
}
function restart() { clearInterval(timer); timer = setInterval(() => show((cur + 1) % slides.length), 5500); }
dots[0].classList.add('on');
restart();

/* ---------- Rotating word in hero title ---------- */
const words = ['إيبوكسي', 'احترافية', 'متقنة', 'أنيقة'];
const swap = $('#swap');
let wi = 0;
setInterval(() => {
  swap.classList.add('out');
  setTimeout(() => { wi = (wi + 1) % words.length; swap.textContent = words[wi]; swap.classList.remove('out'); }, 400);
}, 2600);

/* ---------- Reveal on scroll ---------- */
const revealIO = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('in'), (i % 4) * 90);
      revealIO.unobserve(e.target);
    }
  });
}, { threshold: .12 });
$$('[data-anim]').forEach(el => revealIO.observe(el));
$$('.head').forEach(el => revealIO.observe(el));

/* ---------- Animated counters ---------- */
const countIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, end = +el.dataset.n, suf = el.dataset.suf || '';
    let t0;
    const step = t => {
      t0 = t0 || t;
      const p = Math.min((t - t0) / 1500, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + (p === 1 ? suf : '');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    countIO.unobserve(el);
  });
}, { threshold: .6 });
$$('[data-n]').forEach(el => countIO.observe(el));

/* ---------- Card spotlight following the mouse ---------- */
$$('.spot .card').forEach(c => c.addEventListener('mousemove', e => {
  const r = c.getBoundingClientRect();
  c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
  c.style.setProperty('--my', (e.clientY - r.top) + 'px');
}));

/* ---------- Wall color picker ---------- */
const room = $('#room'), roomName = $('#roomName');
$$('.sw').forEach(b => b.addEventListener('click', () => {
  $$('.sw').forEach(x => x.classList.remove('on'));
  b.classList.add('on');
  room.style.setProperty('--wall', b.dataset.c);
  roomName.textContent = b.dataset.n;
}));

/* ---------- FAQ: one open at a time ---------- */
$$('.faq details').forEach(d => d.addEventListener('toggle', () => {
  if (d.open) $$('.faq details').forEach(o => { if (o !== d) o.open = false; });
}));

/* ---------- Button ripple ---------- */
$$('.btn').forEach(b => b.addEventListener('click', e => {
  const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height);
  const sp = document.createElement('span');
  sp.className = 'ripple';
  sp.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
  b.appendChild(sp);
  setTimeout(() => sp.remove(), 600);
}));

/* ---------- Contact form -> WhatsApp ---------- */
$('#send').addEventListener('click', () => {
  const name = $('#fn').value.trim() || 'عميل';
  const text =
    `السلام عليكم، أنا ${name}\n` +
    `الخدمة: ${$('#fs').value}\n` +
    `الحي: ${$('#fa').value}\n` +
    `التفاصيل: ${$('#fm').value.trim() || 'غير محدد'}`;
  window.open(`https://wa.me/966509721131?text=${encodeURIComponent(text)}`, '_blank');
});

$('#yr').textContent = new Date().getFullYear();
onScroll();