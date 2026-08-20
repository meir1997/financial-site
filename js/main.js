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
    window.location.href = `https://wa.me/972502250493?text=${encodeURIComponent(text)}`;
  });
}

const guideRequestForm = document.getElementById('guideRequestForm');
if (guideRequestForm) {
  guideRequestForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(guideRequestForm);
    const name = String(data.get('name') || '').trim();
    const phone = String(data.get('phone') || '').trim();
    const text = [
      `שלום מאיר, שמי ${name}.`,
      'אשמח לקבל את "המדריך למשקיע המתחיל".',
      `טלפון: ${phone}`,
    ].join('\n');
    window.location.href = `https://wa.me/972502250493?text=${encodeURIComponent(text)}`;
  });
}

const formatCurrency = new Intl.NumberFormat('he-IL', {
  style: 'currency', currency: 'ILS', maximumFractionDigits: 0,
});

function readNonNegative(form, name, fallback = 0) {
  const value = Number(form.elements[name]?.value);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

const compoundForm = document.getElementById('compoundForm');
if (compoundForm) {
  const future = document.getElementById('compoundFuture');
  const contributions = document.getElementById('compoundContributions');
  const growth = document.getElementById('compoundGrowth');
  const chart = document.getElementById('compoundChart');
  const updateCompound = () => {
    const start = readNonNegative(compoundForm, 'start');
    const monthly = readNonNegative(compoundForm, 'monthly');
    const annualRate = readNonNegative(compoundForm, 'rate');
    const years = Math.min(60, Math.max(1, Math.round(readNonNegative(compoundForm, 'years', 1))));
    const monthlyRate = annualRate / 100 / 12;
    let balance = start;
    const yearlyBalances = [];
    for (let month = 1; month <= years * 12; month += 1) {
      balance *= 1 + monthlyRate;
      balance += monthly;
      if (month % 12 === 0) yearlyBalances.push(balance);
    }
    const deposited = start + monthly * years * 12;
    future.textContent = formatCurrency.format(balance);
    contributions.textContent = formatCurrency.format(deposited);
    growth.textContent = formatCurrency.format(Math.max(0, balance - deposited));
    const sample = yearlyBalances.filter((_, index) => index === yearlyBalances.length - 1 || index % Math.ceil(years / 6) === 0);
    const peak = Math.max(...sample, 1);
    chart.replaceChildren(...sample.map((amount, index) => {
      const bar = document.createElement('span');
      bar.style.height = `${Math.max(10, Math.round((amount / peak) * 100))}%`;
      const year = Math.min(years, index * Math.ceil(years / 6) + 1);
      bar.dataset.year = `שנה ${index === sample.length - 1 ? years : year}`;
      bar.title = `${bar.dataset.year}: ${formatCurrency.format(amount)}`;
      return bar;
    }));
  };
  compoundForm.addEventListener('input', updateCompound);
  updateCompound();
}

const loanForm = document.getElementById('loanForm');
if (loanForm) {
  const paymentOutput = document.getElementById('loanPayment');
  const paymentLabel = document.getElementById('loanPaymentLabel');
  const paymentNote = document.getElementById('loanPaymentNote');
  const interestOutput = document.getElementById('loanInterest');
  const totalOutput = document.getElementById('loanTotal');
  const schedule = document.getElementById('loanSchedule');
  const updateLoan = () => {
    const amount = Math.max(1, readNonNegative(loanForm, 'amount', 1));
    const annualRate = readNonNegative(loanForm, 'rate');
    const years = Math.min(40, Math.max(1, Math.round(readNonNegative(loanForm, 'years', 1))));
    const method = String(loanForm.elements.method?.value || 'spitzer');
    const periods = years * 12;
    const rate = annualRate / 100 / 12;
    let remaining = amount;
    let totalPaid = 0;
    let yearlyInterest = 0;
    let yearlyPayments = 0;
    let firstPayment = 0;
    let lastPayment = 0;
    const rows = [];
    const spitzerPayment = rate === 0 ? amount / periods : amount * (rate * (1 + rate) ** periods) / ((1 + rate) ** periods - 1);
    const fixedPrincipal = amount / periods;
    for (let month = 1; month <= periods; month += 1) {
      const interest = remaining * rate;
      const principal = method === 'equal-principal'
        ? Math.min(remaining, fixedPrincipal)
        : Math.min(remaining, spitzerPayment - interest);
      const payment = principal + interest;
      if (month === 1) firstPayment = payment;
      lastPayment = payment;
      remaining = Math.max(0, remaining - principal);
      totalPaid += payment;
      yearlyInterest += interest;
      yearlyPayments += payment;
      if (month % 12 === 0 || month === periods) {
        rows.push({ year: Math.ceil(month / 12), payments: yearlyPayments, interest: yearlyInterest, remaining });
        yearlyInterest = 0;
        yearlyPayments = 0;
      }
    }
    const isEqualPrincipal = method === 'equal-principal';
    paymentLabel.textContent = isEqualPrincipal ? 'החזר בחודש הראשון' : 'החזר חודשי קבוע';
    paymentOutput.textContent = formatCurrency.format(firstPayment);
    paymentNote.textContent = isEqualPrincipal
      ? `בחודש האחרון ההחזר יהיה ${formatCurrency.format(lastPayment)}`
      : 'ההחזר נשאר קבוע לאורך התקופה';
    interestOutput.textContent = formatCurrency.format(totalPaid - amount);
    totalOutput.textContent = formatCurrency.format(totalPaid);
    schedule.replaceChildren(...rows.map((row) => {
      const tr = document.createElement('tr');
      [row.year, formatCurrency.format(row.payments), formatCurrency.format(row.interest), formatCurrency.format(row.remaining)].forEach((value) => {
        const td = document.createElement('td');
        td.textContent = value;
        tr.append(td);
      });
      return tr;
    }));
  };
  loanForm.addEventListener('input', updateLoan);
  loanForm.addEventListener('change', updateLoan);
  updateLoan();
}
