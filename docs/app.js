'use strict';

const screens = {
  home: { name: '首页', title: '先知道，今天要做什么。', description: '首页聚焦今日待办和值日，把最常用的行动入口放在眼前。', alt: '元气小家首页：集中呈现今日待办与值日', index: '01' },
  bills: { name: '账单', title: '费用有记录，对账更清楚。', description: '公共费用与分摊确认放在同一处，关键金额和状态直接呈现。', alt: '元气小家账单页：待确认金额、记录公共费用与电费列表', index: '02' },
  chores: { name: '家务', title: '轮到谁，做到哪，一眼看见。', description: '周进度、任务责任与完成状态放在一起，减少反复询问。', alt: '元气小家家务页：本周进度、筛选与值日任务列表', index: '03' },
  supplies: { name: '物资', title: '快乐补给，还有多少？', description: '按品类查看共享物资，直接更新库存，让补货不再全靠记忆。', alt: '元气小家物资页：补货状态、品类筛选与库存更新入口', index: '04' },
  house: { name: '更多', title: '一起生活，也有共同的规则。', description: '成员、邀请与室友公约集中管理，让共同约定有固定的位置。', alt: '元气小家合租管理页：合租房、成员与共同规则', index: '05' }
};

let activeScreen = 'home';
const tabs = [...document.querySelectorAll('[data-screen]')];
function selectScreen(key, moveFocus = false) {
  if (!Object.hasOwn(screens, key)) return;
  activeScreen = key;
  const data = screens[key];
  for (const tab of tabs) {
    const selected = tab.dataset.screen === key;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (selected && moveFocus) tab.focus();
  }
  const galleryImage = document.querySelector('#gallery-image');
  galleryImage.src = `assets/${key}.webp`;
  galleryImage.alt = data.alt;
  document.querySelector('#screen-title').textContent = data.title;
  document.querySelector('#screen-description').textContent = data.description;
  document.querySelector('#screen-panel').setAttribute('aria-labelledby', `tab-${key}`);
  document.querySelector('.screen-counter').replaceChildren(document.createTextNode(`${data.index} `), Object.assign(document.createElement('span'), { textContent: '/ 05' }));
  document.querySelector('.screen-zoom').setAttribute('aria-label', `放大查看${data.name}界面`);
}
for (const [index, tab] of tabs.entries()) {
  tab.addEventListener('click', () => selectScreen(tab.dataset.screen));
  tab.addEventListener('keydown', event => {
    let nextIndex;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabs.length - 1;
    if (nextIndex !== undefined) { event.preventDefault(); selectScreen(tabs[nextIndex].dataset.screen, true); }
  });
}

const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu() { menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.setAttribute('aria-label', '展开导航'); mobileNav.hidden = true; }
menuToggle.addEventListener('click', () => {
  const willOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(willOpen));
  menuToggle.setAttribute('aria-label', willOpen ? '收起导航' : '展开导航');
  mobileNav.hidden = !willOpen;
});
mobileNav.querySelectorAll('a,button').forEach(item => item.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
const desktopQuery = window.matchMedia('(min-width: 601px)');
desktopQuery.addEventListener('change', event => { if (event.matches) closeMenu(); });

function showDialog(dialog, trigger) {
  if (dialog.open) return;
  dialog._returnFocus = trigger;
  dialog.showModal();
  document.documentElement.style.overflow = 'hidden';
}
document.querySelectorAll('[data-summary]').forEach(button => button.addEventListener('click', () => showDialog(document.querySelector('#summary-dialog'), button)));
document.querySelector('.screen-zoom').addEventListener('click', event => {
  const data = screens[activeScreen];
  const dialog = document.querySelector('#image-dialog');
  document.querySelector('#zoom-image').src = `assets/${activeScreen}.webp`;
  document.querySelector('#zoom-image').alt = data.alt + '放大图';
  document.querySelector('#image-dialog-title').textContent = `${data.name} · 真实产品界面`;
  document.querySelector('.image-dialog-body').scrollTop = 0;
  showDialog(dialog, event.currentTarget);
});
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.style.overflow = '';
    dialog._returnFocus?.focus();
  });
});

let toastTimer;
function notify(message) {
  const toast = document.querySelector('.toast');
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3500);
}
document.querySelector('#copy-link').addEventListener('click', async () => {
  const url = new URL(window.location.href); url.hash = ''; url.search = '';
  try {
    await navigator.clipboard.writeText(url.href);
    notify('网站链接已复制');
  } catch {
    const field = document.createElement('textarea');
    field.value = url.href;
    field.setAttribute('aria-label', '网站链接');
    field.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0';
    document.body.append(field);
    field.focus(); field.select();
    let success = false;
    try { success = document.execCommand('copy'); } catch { /* Browser may deny legacy clipboard access. */ }
    field.remove();
    document.querySelector('#copy-link').focus();
    notify(success ? '网站链接已复制' : '请从浏览器地址栏复制网站链接');
  }
});
