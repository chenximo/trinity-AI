/** Trinity GEO · 页面审计（行选中切换，原型） */
(function () {
  const rows = document.querySelectorAll('.geo-audit-row');
  const panels = document.querySelectorAll('.geo-audit-detail-card[id]');
  if (!rows.length) return;

  rows.forEach((row) => {
    row.addEventListener('click', () => {
      rows.forEach((r) => r.classList.remove('is-selected'));
      row.classList.add('is-selected');
      const id = row.getAttribute('data-audit-id');
      if (!id) return;
      const panel = document.getElementById(id);
      if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });
})();
