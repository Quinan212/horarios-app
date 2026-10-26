'use strict';
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const cubic = 'cubic-bezier(.645,.045,.355,1)';
  const out = 'cubic-bezier(.215,.61,.355,1)';
  const animations = new WeakMap(), dialogs = new WeakMap();
  const swaps = new WeakMap(), popups = new WeakMap();
  const scrim = document.getElementById('modalScrim');
  let themeTimer;

  function stop(element) {
    const previous = animations.get(element);
    if (!previous) return;
    previous.cancel(); animations.delete(element);
  }
  function play(element, frames, options = {}) {
    stop(element);
    if (reduced.matches || !element.animate) return Promise.resolve();
    const animation = element.animate(frames, {duration: 347, easing: cubic, fill: 'both', ...options});
    animations.set(element, animation);
    return animation.finished.catch(() => {});
  }
  const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));
  const pagePosition = () => ({left: scrollX, top: scrollY, behavior: 'instant'});
  const children = dialog => [...dialog.children];
  function lockContents(dialog, locked) {
    children(dialog).forEach(element => {element.inert = locked;});
  }
  function travel(dialog) {
    const drawer = dialog.id === 'editor' && matchMedia('(min-width:1041px)').matches;
    return drawer ? `${dialog.offsetWidth + 32}px 0` : `0 ${dialog.offsetHeight + 32}px`;
  }
  function contentBlocks(dialog) {
    return dialog.id === 'editor'
      ? [dialog.querySelector('.dialog-heading'), ...dialog.querySelector('form').children]
      : [...dialog.children];
  }
  async function openDialog(dialog) {
    const previous = dialogs.get(dialog);
    if (dialog.open && !previous?.closing) return;
    const token = {}, position = pagePosition();
    const from = dialog.open ? getComputedStyle(dialog).translate : null;
    dialogs.set(dialog, {token, closing: false});
    dialog.dataset.motion = 'opening';
    lockContents(dialog, true);
    scrim.hidden = false;
    const scrimOpacity = getComputedStyle(scrim).opacity;
    if (!dialog.open) {
      scrim.style.opacity = '0';
      dialog.showModal();
    }
    dialog.focus({preventScroll: true});
    scrollTo(position);
    const blocks = contentBlocks(dialog).filter(Boolean);
    const surface = play(dialog, [{translate: from || travel(dialog)}, {translate: '0 0'}], {duration: 480});
    const background = play(scrim, [{opacity: previous ? scrimOpacity : 0}, {opacity: 1}], {duration: 480});
    scrim.style.opacity = '1';
    const content = blocks.map((element, index) => play(element,
      [{opacity: 0, transform: 'translateY(12px)'}, {opacity: 1, transform: 'translateY(0)'}],
      {duration: 320, delay: 80 + Math.min(index, 4) * 45, easing: out, fill: 'backwards'}));
    await Promise.all([surface, background, ...content]);
    if (dialogs.get(dialog)?.token === token) {
      [dialog, scrim, ...blocks].forEach(stop); lockContents(dialog, false); dialog.dataset.motion = 'open';
    }
  }
  function closeDialog(dialog, finish) {
    if (!dialog.open) {finish?.(); return Promise.resolve();}
    const previous = dialogs.get(dialog);
    if (previous?.closing) return previous.promise;
    const token = {}, position = pagePosition();
    const from = getComputedStyle(dialog).translate;
    const opacity = getComputedStyle(scrim).opacity;
    const state = {token, closing: true, promise: null};
    dialogs.set(dialog, state);
    dialog.dataset.motion = 'closing';
    lockContents(dialog, true);
    const content = contentBlocks(dialog).filter(Boolean).map(element => {
      const style = getComputedStyle(element);
      return play(element, [{opacity: style.opacity, transform: style.transform},
        {opacity: 0, transform: 'translateY(6px)'}], {duration: 180, easing: out});
    });
    state.promise = Promise.all([
      play(dialog, [{translate: from}, {translate: travel(dialog)}], {duration: 347}),
      play(scrim, [{opacity}, {opacity: 0}], {duration: 347}), ...content,
    ]).then(() => {
      if (dialogs.get(dialog)?.token !== token) return;
      dialog.close();
      [dialog, scrim, ...contentBlocks(dialog).filter(Boolean)].forEach(stop);
      lockContents(dialog, false); dialogs.delete(dialog); delete dialog.dataset.motion;
      scrim.hidden = true; scrim.style.opacity = '0';
      scrollTo(position); finish?.();
    });
    return state.promise;
  }
  function popup(element, show) {
    const token = {}; popups.set(element, token);
    if (show) {
      const wasHidden = element.hidden;
      const style = getComputedStyle(element);
      const from = wasHidden ? {opacity: 0, scale: '.9'} : {opacity: style.opacity, scale: style.scale};
      element.hidden = false; element.inert = false;
      return play(element, [from, {opacity: 1, scale: '1'}], {duration: 200, easing: out});
    }
    if (element.hidden) return Promise.resolve();
    element.inert = true;
    const style = getComputedStyle(element);
    return play(element, [{opacity: style.opacity, scale: style.scale}, {opacity: 0, scale: '.96'}],
      {duration: 160, easing: out}).then(() => {
      if (popups.get(element) === token) {element.hidden = true; stop(element);}
    });
  }
  function indicator(container, selector = '[aria-pressed="true"]') {
    const active = container.querySelector(selector);
    if (!active || !container.offsetWidth) return;
    container.style.setProperty('--indicator-x', `${active.offsetLeft}px`);
    container.style.setProperty('--indicator-w', `${active.offsetWidth}px`);
    if (container.classList.contains('day-picker')) {
      container.style.setProperty('--day-spots', [...container.children].map(button => `${button.offsetLeft}px 0 0 0 var(--soft)`).join(','));
    }
    container.classList.add('indicator-ready');
  }
  async function swap(element, update) {
    const running = swaps.get(element);
    if (running) {running.pending = update; return running.promise;}
    const state = {pending: update, promise: null};
    swaps.set(element, state);
    state.promise = (async () => {
      element.setAttribute('aria-busy', 'true');
      try {
        while (state.pending) {
          await play(element, [{opacity: 1, transform: 'translateY(0)'},
            {opacity: 0, transform: 'translateY(-8px)'}], {duration: 200});
          const action = state.pending; state.pending = null;
          action();
          if (!reduced.matches) await nextFrame();
          await play(element, [{opacity: 0, transform: 'translateY(12px)'},
            {opacity: 1, transform: 'translateY(0)'}], {duration: 420, easing: out});
        }
      } finally {stop(element); swaps.delete(element); element.removeAttribute('aria-busy');}
    })();
    return state.promise;
  }
  function changeTheme(update) {
    clearTimeout(themeTimer);
    if (!reduced.matches) {
      document.documentElement.classList.add('theme-transition');
      getComputedStyle(document.body).backgroundColor;
    }
    update();
    themeTimer = setTimeout(() => document.documentElement.classList.remove('theme-transition'), 550);
  }
  document.addEventListener('pointerdown', event => {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    button.classList.add('is-pressed');
    const release = () => {
      button.classList.remove('is-pressed');
      document.removeEventListener('pointerup', release);
      document.removeEventListener('pointercancel', release);
      window.removeEventListener('blur', release);
    };
    document.addEventListener('pointerup', release, {once: true});
    document.addEventListener('pointercancel', release, {once: true});
    window.addEventListener('blur', release, {once: true});
  });
  const observer = new ResizeObserver(entries => entries.forEach(({target}) => indicator(target)));
  document.querySelectorAll('.view-switch,.day-picker').forEach(element => observer.observe(element));
  globalThis.ScheduleMotion = Object.freeze({openDialog, closeDialog, popup, indicator, swap, changeTheme});
})();
