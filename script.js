const topbar = document.querySelector('.topbar');
const topNav = document.querySelector('.top-nav');
const navToggle = document.querySelector('.nav-toggle');
const navItems = document.querySelectorAll('.top-nav .nav-item');
const revealNodes = document.querySelectorAll('.reveal');
const counters = document.querySelectorAll('[data-counter]');
const phonePreview = document.querySelector('#phone-preview');
const phoneBaseTransform = 'rotateY(-18deg) rotateX(9deg) rotateZ(-8deg) translateY(0)';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isFinePointerDesktop = window.matchMedia('(pointer: fine)').matches && window.innerWidth > 820;

const closeMobileMenu = () => {
  if (!topbar || !navToggle) {
    return;
  }

  topbar.classList.remove('is-menu-open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Открыть меню');
};

if (topbar && topNav && navToggle) {
  navToggle.addEventListener('click', () => {
    const isOpen = topbar.classList.toggle('is-menu-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
    topbar.classList.remove('is-hidden');
  });

  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 820) {
        closeMobileMenu();
      }
    });
  });

  document.addEventListener('click', (event) => {
    if (window.innerWidth > 820 || !topbar.classList.contains('is-menu-open')) {
      return;
    }

    if (topbar.contains(event.target)) {
      return;
    }

    closeMobileMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 820) {
      closeMobileMenu();
    }
  });
}

if (topbar && !reduceMotion) {
  let lastTopbarScrollY = window.scrollY;
  let isTopbarTicking = false;
  const scrollDelta = 10;
  const hideAfterY = 120;

  const updateTopbarState = () => {
    const currentScrollY = window.scrollY;
    const deltaY = currentScrollY - lastTopbarScrollY;

    if (topbar.classList.contains('is-menu-open')) {
      topbar.classList.remove('is-hidden');
      lastTopbarScrollY = currentScrollY;
      isTopbarTicking = false;
      return;
    }

    if (currentScrollY <= 24) {
      topbar.classList.remove('is-hidden');
      lastTopbarScrollY = currentScrollY;
      isTopbarTicking = false;
      return;
    }

    if (Math.abs(deltaY) >= scrollDelta) {
      if (deltaY > 0 && currentScrollY > hideAfterY) {
        topbar.classList.add('is-hidden');
      } else if (deltaY < 0) {
        topbar.classList.remove('is-hidden');
      }

      lastTopbarScrollY = currentScrollY;
    }

    isTopbarTicking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (isTopbarTicking) {
        return;
      }

      isTopbarTicking = true;
      requestAnimationFrame(updateTopbarState);
    },
    { passive: true },
  );
}

if (reduceMotion || window.innerWidth <= 820) {
  revealNodes.forEach((node) => node.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: '0px 0px -40px 0px',
    },
  );

  revealNodes.forEach((node) => revealObserver.observe(node));
}

const animateCounter = (node) => {
  const endValue = Number(node.dataset.counter || '0');
  const duration = 1400;
  const startedAt = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - startedAt) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    node.textContent = String(Math.round(endValue * eased));

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

if (counters.length > 0 && !reduceMotion && window.innerWidth > 820) {
  const countersObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        animateCounter(entry.target);
        countersObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.7 },
  );

  counters.forEach((node) => countersObserver.observe(node));
}

if (phonePreview && isFinePointerDesktop && !reduceMotion) {
  phonePreview.style.transform = phoneBaseTransform;

  phonePreview.addEventListener('mousemove', (event) => {
    const rect = phonePreview.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    phonePreview.style.transform = `rotateY(${-18 + x * 8}deg) rotateX(${9 + y * -6}deg) rotateZ(-8deg) translateY(-4px)`;
  });

  phonePreview.addEventListener('mouseleave', () => {
    phonePreview.style.transform = phoneBaseTransform;
  });
}
