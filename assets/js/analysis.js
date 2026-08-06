(async function () {
  const data = await fetchJSON('data/analysis.json');

  document.getElementById('page-title').textContent = data.meta.title;
  document.getElementById('page-subtitle').textContent = data.meta.subtitle;

  // Findings cards
  document.getElementById('findings-list').innerHTML = data.findings
    .map(
      (f, i) => `
      <div id="finding-${f.id}" class="bg-white rounded-2xl shadow-card p-5 fade-in transition ring-2 ring-transparent" style="animation-delay:${i * 50}ms">
        <span class="inline-flex w-7 h-7 rounded-full bg-ocean-900 text-white text-xs font-bold items-center justify-center mb-3">${f.id}</span>
        <p class="text-xs font-semibold text-ocean-500 mb-1">ผลการวิเคราะห์</p>
        <p class="text-sm text-ocean-900 mb-3">${f.finding}</p>
        <p class="text-xs font-semibold text-coral-500 mb-1">ช่องว่างที่พบ</p>
        <p class="text-sm text-ocean-900 mb-3">${f.gap}</p>
        <p class="text-xs font-semibold text-emerald-600 mb-1">ข้อเสนอแนะ</p>
        <p class="text-sm text-ocean-900">${f.suggestion}</p>
      </div>`
    )
    .join('');

  // Roadmap (interactive: click a step to highlight its related finding)
  document.getElementById('roadmap-title').textContent = data.roadmap.title;
  const roadmapEl = document.getElementById('roadmap-list');

  roadmapEl.innerHTML = data.roadmap.steps
    .map(
      (s, i) => `
      <button data-related="${s.relatedFinding}" class="roadmap-btn w-full text-left flex gap-4 pb-8 last:pb-0 relative group">
        ${i !== data.roadmap.steps.length - 1 ? '<span class="absolute left-[19px] top-10 bottom-0 w-0.5 bg-ocean-100"></span>' : ''}
        <span class="shrink-0 w-10 h-10 rounded-full bg-ocean-100 text-ocean-700 font-bold flex items-center justify-center group-hover:bg-ocean-900 group-hover:text-white transition z-10">${s.id}</span>
        <div class="pt-1.5">
          <p class="font-bold text-ocean-900 group-hover:text-ocean-600 transition">${s.title}</p>
          <p class="text-sm text-ocean-700/70 mt-1">${s.detail}</p>
        </div>
      </button>`
    )
    .join('');

  roadmapEl.querySelectorAll('.roadmap-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[id^="finding-"]').forEach((el) => el.classList.remove('ring-ocean-400', 'bg-ocean-50'));
      const target = document.getElementById(`finding-${btn.dataset.related}`);
      if (target) {
        target.classList.add('ring-ocean-400', 'bg-ocean-50');
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });
})();
