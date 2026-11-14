/** Focus alone does not imply an open keyboard (hardware keyboards and Android Back). */
export function keyboardOccludesSearch(focused: boolean, baseline: number, height: number, scale = 1): boolean {
  return focused && scale === 1 && baseline - height > 120;
}

export function watchKeyboard() {
  const viewport = window.visualViewport;
  let width = window.innerWidth;
  let baseline = viewport?.height ?? window.innerHeight;
  const update = () => {
    const height = viewport?.height ?? window.innerHeight;
    if (Math.abs(window.innerWidth - width) > 40) {
      width = window.innerWidth;
      baseline = height;
    }
    const focused = !!document.activeElement?.matches('main input');
    baseline = Math.max(baseline, height);
    document.documentElement.classList.toggle('keyboard-open',
      keyboardOccludesSearch(focused, baseline, height, viewport?.scale ?? 1));
  };
  viewport?.addEventListener('resize', update);
  window.addEventListener('resize', update, { passive: true });
  document.addEventListener('focusin', update);
  // Wait until focus has moved, including focus restored after a render.
  document.addEventListener('focusout', () => requestAnimationFrame(update));
  update();
}
