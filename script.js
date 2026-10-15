(() => {
  'use strict';

  const MOBILE_BREAKPOINT = 920;
  const menuButton = document.querySelector('.menu-button');
  const navigation = document.querySelector('.site-nav');
  const backdrop = document.querySelector('.nav-backdrop');
  const header = document.querySelector('.site-header');
  const mobileQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
  const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  let isMenuOpen = false;

  const syncNavigationState = () => {
    if (!menuButton || !navigation || !backdrop) return;

    if (mobileQuery.matches) {
      navigation.setAttribute('aria-hidden', String(!isMenuOpen));
      backdrop.setAttribute('aria-hidden', String(!isMenuOpen));
    } else {
      isMenuOpen = false;
      document.body.classList.remove('is-menu-open');
      navigation.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      navigation.removeAttribute('aria-hidden');
      backdrop.setAttribute('aria-hidden', 'true');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'メニューを開く');
    }
  };

  const openMenu = () => {
    if (!menuButton || !navigation || !backdrop || !mobileQuery.matches) return;

    isMenuOpen = true;
    menuButton.setAttribute('aria-expanded', 'true');
    menuButton.setAttribute('aria-label', 'メニューを閉じる');
    navigation.setAttribute('aria-hidden', 'false');
    backdrop.setAttribute('aria-hidden', 'false');
    navigation.classList.add('is-open');
    backdrop.classList.add('is-open');
    document.body.classList.add('is-menu-open');

    const firstFocusable = navigation.querySelector(focusableSelector);
    window.setTimeout(() => firstFocusable?.focus(), 40);
  };

  const closeMenu = ({ restoreFocus = true } = {}) => {
    if (!menuButton || !navigation || !backdrop || !isMenuOpen) return;

    isMenuOpen = false;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'メニューを開く');
    navigation.setAttribute('aria-hidden', 'true');
    backdrop.setAttribute('aria-hidden', 'true');
    navigation.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    document.body.classList.remove('is-menu-open');

    if (restoreFocus) menuButton.focus();
  };

  menuButton?.addEventListener('click', () => {
    if (isMenuOpen) closeMenu();
    else openMenu();
  });

  backdrop?.addEventListener('click', () => closeMenu());

  navigation?.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => closeMenu({ restoreFocus: false }));
  });

  document.addEventListener('keydown', (event) => {
    if (!isMenuOpen) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key !== 'Tab' || !navigation) return;

    const focusableElements = [...navigation.querySelectorAll(focusableSelector)]
      .filter((element) => element.getClientRects().length > 0);

    if (!focusableElements.length) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  });

  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', syncNavigationState);
  } else {
    mobileQuery.addListener(syncNavigationState);
  }
  syncNavigationState();

  const setHeaderState = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 24);
  };
  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  // FAQはネイティブのdetails要素を使い、同時に開く項目を1つにします。
  const faqItems = document.querySelectorAll('.faq-list details');
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      faqItems.forEach((otherItem) => {
        if (otherItem !== item) otherItem.open = false;
      });
    });
  });

  // 予約・電話・地図は、誤操作しても外部送信しないデモ用ダイアログです。
  const dialog = document.querySelector('#demo-dialog');
  const dialogTitle = document.querySelector('#demo-dialog-title');
  const dialogMessage = document.querySelector('#demo-dialog-message');
  const dialogClose = document.querySelector('[data-demo-close]');
  let dialogOpener = null;

  const dialogCopy = {
    'WEB予約': {
      title: 'WEB予約はデモ表示です',
      message: 'このポートフォリオサイトから予約や情報送信はできません。実案件では、予約サービスの仕様と個人情報の取り扱いを確認したうえで接続します。'
    },
    '電話案内': {
      title: '電話番号は架空です',
      message: '表示中の番号はデザイン確認用で、発信は行われません。実在する医療機関の電話番号ではありません。'
    },
    '地図案内': {
      title: '地図はデモ表示です',
      message: '掲載している住所・駅名・地図はすべて架空です。実在する場所への案内は行われません。'
    }
  };

  document.querySelectorAll('[data-demo-open]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const kind = trigger.dataset.demoKind || 'WEB予約';
      const copy = dialogCopy[kind] || dialogCopy['WEB予約'];
      dialogOpener = trigger;

      if (dialogTitle) dialogTitle.textContent = copy.title;
      if (dialogMessage) dialogMessage.textContent = copy.message;

      if (dialog && typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        window.alert(`${copy.title}\n\n${copy.message}`);
      }
    });
  });

  dialogClose?.addEventListener('click', () => dialog?.close());

  dialog?.addEventListener('click', (event) => {
    const bounds = dialog.getBoundingClientRect();
    const isOutside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
    if (isOutside) dialog.close();
  });

  dialog?.addEventListener('close', () => {
    if (dialogOpener instanceof HTMLElement && document.contains(dialogOpener)) {
      dialogOpener.focus();
    }
  });

  // JSが動かない場合も内容は表示されたままです。対応環境だけ控えめに演出します。
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealTargets = document.querySelectorAll([
    '.news-item',
    '.about-intro',
    '.value-card',
    '.director',
    '.service-card',
    '.flow-card',
    '.visit-details',
    '.hours__grid',
    '.access__grid',
    '.medical-note'
  ].join(','));

  if (!reduceMotion && 'IntersectionObserver' in window) {
    revealTargets.forEach((target, index) => {
      target.classList.add('reveal-ready');
      target.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealTargets.forEach((target) => observer.observe(target));
  }
})();
