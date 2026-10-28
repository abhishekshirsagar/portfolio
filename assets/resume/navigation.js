document.addEventListener('click', event => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const anchor = event.target.closest?.('a[href]');
  if (!anchor) return;
  const target = new URL(anchor.href);
  const resume = new URL(`${globalThis.__FRAMER_MIRROR_BASE__}resume/`, location.href);
  if (target.origin !== resume.origin || target.pathname !== resume.pathname) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  location.assign(resume.href);
}, true);