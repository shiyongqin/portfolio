'use strict';

const modes = [...document.querySelectorAll('[data-change-mode]')];
const values = {
  pp: { penetration: '+1.2pp', payment: '+0.8pp', explanation: '百分点 = 优化后比例 − 优化前比例。两个指标分别提升 1.2 和 0.8 个百分点。' },
  relative: { penetration: '+18.75%', payment: '+66.67%', explanation: '相对变化 =（优化后 − 优化前）÷ 优化前。这里由简历中的比例直接计算，不代表新增项目指标。' }
};
for (const button of modes) {
  button.addEventListener('click', () => {
    const data = values[button.dataset.changeMode];
    if (!data) return;
    modes.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    document.querySelector('[data-change="penetration"]').textContent = data.penetration;
    document.querySelector('[data-change="payment"]').textContent = data.payment;
    document.querySelector('.change-explanation').textContent = data.explanation;
  });
}

const tabs = [...document.querySelectorAll('[data-case]')];
function selectCase(key, focus = false) {
  if (!tabs.some(tab => tab.dataset.case === key)) return;
  for (const tab of tabs) {
    const selected = tab.dataset.case === key;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
    if (selected && focus) tab.focus();
  }
}
for (const [index, tab] of tabs.entries()) {
  tab.addEventListener('click', () => selectCase(tab.dataset.case));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectCase(tabs[next].dataset.case, true); }
  });
}

let toastTimer;
function notify(message) {
  const toast = document.querySelector('.toast');
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3500);
}
document.querySelector('#copy-link').addEventListener('click', async () => {
  const url = new URL(window.location.href); url.hash = ''; url.search = '';
  try {
    await navigator.clipboard.writeText(url.href);
    notify('数据分析作品集链接已复制');
  } catch {
    const field = document.createElement('textarea');
    field.value = url.href;
    field.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0';
    field.setAttribute('aria-label', '数据分析网站链接');
    document.body.append(field); field.focus(); field.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch { /* The browser can deny legacy clipboard access. */ }
    field.remove(); document.querySelector('#copy-link').focus();
    notify(copied ? '数据分析作品集链接已复制' : '请从浏览器地址栏复制网站链接');
  }
});
