const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const element = entry.target;
    const target = Number(element.dataset.count);
    const suffix = element.dataset.suffix || '';
    if (reduceMotion) {
      element.textContent = target + suffix;
    } else {
      const start = performance.now();
      const animate = (now) => {
        const progress = Math.min((now - start) / 900, 1);
        element.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3))) + suffix;
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
    countObserver.unobserve(element);
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach((element) => countObserver.observe(element));

if (!reduceMotion && matchMedia('(pointer: fine)').matches) {
  const spotlight = document.querySelector('.spotlight');
  window.addEventListener('pointermove', (event) => {
    spotlight.style.left = `${event.clientX}px`;
    spotlight.style.top = `${event.clientY}px`;
  });

  document.querySelectorAll('.tilt').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${-y * 3}deg) rotateY(${x * 3}deg) translateY(-2px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

const intro = 'Mahendra Chittupolu is a backend and systems engineer at DigitalOcean, building cloud billing APIs, tax infrastructure, and automation in Go, TypeScript, and Python. He has shipped 20 product launches and cut manual overhead by 40%.';
const toast = document.querySelector('.toast');
document.querySelectorAll('.copy-intro').forEach((button) => {
  button.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(intro); }
    catch { /* Clipboard permissions vary; the interface remains usable. */ }
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2200);
  });
});

const command = document.querySelector('.command');
const commandInput = command.querySelector('input');
const commandButtons = [...command.querySelectorAll('[data-target]')];
let previousFocus;

function openCommand() {
  previousFocus = document.activeElement;
  command.hidden = false;
  requestAnimationFrame(() => commandInput.focus());
}

function closeCommand() {
  command.hidden = true;
  commandInput.value = '';
  commandButtons.forEach((button) => { button.hidden = false; });
  previousFocus?.focus();
}

document.querySelector('.cmd-button').addEventListener('click', openCommand);
document.querySelector('.command-backdrop').addEventListener('click', closeCommand);
document.addEventListener('keydown', (event) => {
  const typing = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
  if (event.key === '/' && !typing) { event.preventDefault(); openCommand(); }
  if (event.key === 'Escape' && !command.hidden) closeCommand();
  if (!command.hidden && !typing) {
    const shortcut = { h: 'top', w: 'work', p: 'projects', s: 'stack', c: 'contact' }[event.key.toLowerCase()];
    if (shortcut) document.querySelector(`#${shortcut}`).scrollIntoView();
  }
});

commandInput.addEventListener('input', () => {
  const query = commandInput.value.toLowerCase();
  commandButtons.forEach((button) => { button.hidden = !button.textContent.toLowerCase().includes(query); });
});

commandButtons.forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelector(`#${button.dataset.target}`).scrollIntoView();
    closeCommand();
  });
});
