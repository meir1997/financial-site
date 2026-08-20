const mobileToggle = document.getElementById('mobileToggle');
const navLinks = document.getElementById('navLinks');

function closeMenu() {
  if (!mobileToggle || !navLinks) return;
  mobileToggle.classList.remove('active');
  mobileToggle.setAttribute('aria-expanded', 'false');
  mobileToggle.setAttribute('aria-label', 'פתיחת תפריט');
  navLinks.classList.remove('open');
  document.body.classList.remove('menu-open');
}

if (mobileToggle && navLinks) {
  mobileToggle.addEventListener('click', () => {
    const willOpen = !navLinks.classList.contains('open');
    mobileToggle.classList.toggle('active', willOpen);
    mobileToggle.setAttribute('aria-expanded', String(willOpen));
    mobileToggle.setAttribute('aria-label', willOpen ? 'סגירת תפריט' : 'פתיחת תפריט');
    navLinks.classList.toggle('open', willOpen);
    document.body.classList.toggle('menu-open', willOpen);
  });

  navLinks.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
      mobileToggle.focus();
    }
  });
}

const navbar = document.getElementById('navbar');
if (navbar) {
  const updateHeader = () => navbar.classList.toggle('scrolled', window.scrollY > 10);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
}

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(contactForm);
    const name = String(data.get('name') || '').trim();
    const phone = String(data.get('phone') || '').trim();
    const message = String(data.get('message') || '').trim();
    const text = [`שלום מאיר, שמי ${name}.`, `טלפון: ${phone}`, message].filter(Boolean).join('\n');
    window.open(`https://wa.me/972502250493?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  });
}
