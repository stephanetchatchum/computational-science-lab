/** Registers the offline service worker (production builds only) and tells the learner what it did:
 *  once when the app is first saved for offline use, and when a newer version is ready. */

function toast(html: string, ms = 6000): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'toast'; el.setAttribute('role', 'status'); el.innerHTML = html;
  document.body.appendChild(el);
  if (ms) setTimeout(() => el.remove(), ms);
  return el;
}

function offerUpdate(worker: ServiceWorker) {
  const el = toast('A new version of the lab is ready. <button class="linklike" type="button">Reload</button>', 0);
  el.querySelector('button')!.addEventListener('click', () => {
    navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), { once: true });
    worker.postMessage('skip-waiting');
  });
}

export function registerOffline() {
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return;
  window.addEventListener('load', async () => {
    try {
      const firstTime = !navigator.serviceWorker.controller;
      const reg = await navigator.serviceWorker.register('./sw.js');
      if (reg.waiting && navigator.serviceWorker.controller) offerUpdate(reg.waiting);
      reg.addEventListener('updatefound', () => {
        const w = reg.installing; if (!w) return;
        w.addEventListener('statechange', () => {
          if (w.state !== 'installed') return;
          if (navigator.serviceWorker.controller) offerUpdate(w);
          else if (firstTime) toast('✓ Saved for offline use. This link now works without internet on this device.');
        });
      });
    } catch { /* offline support is a bonus; the app works without it */ }
  });
}
