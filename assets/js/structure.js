(async function () {
  const data = await fetchJSON('data/structure.json');

  document.getElementById('page-title').textContent = data.meta.title;
  document.getElementById('page-subtitle').textContent = data.meta.subtitle;

  // Totals
  document.getElementById('totals').innerHTML = data.totals
    .map(
      (t, i) => `
      <div class="bg-white rounded-2xl shadow-card p-5 fade-in" style="animation-delay:${i * 60}ms">
        <p class="text-xs font-medium text-ocean-700/70">${t.label}</p>
        <p class="mt-2 text-2xl sm:text-3xl font-extrabold text-ocean-900">
          <span class="stat-value" data-target="${t.value}">0</span>
          <span class="text-sm font-medium text-ocean-700/60">${t.unit}</span>
        </p>
      </div>`
    )
    .join('');
  document.querySelectorAll('#totals .stat-value').forEach((el) => animateCounter(el, Number(el.dataset.target)));

  // Levels
  const levelColors = { national: 'ocean', provincial: 'sand' };
  data.levels.forEach((lvl) => {
    const mount = document.getElementById(`level-${lvl.id}`);
    const accent = lvl.id === 'national' ? 'bg-ocean-900' : 'bg-ocean-600';
    mount.innerHTML = `
    <div class="bg-white rounded-2xl shadow-card overflow-hidden h-full">
      <div class="${accent} text-white px-5 py-4">
        <h2 class="font-bold text-lg">${lvl.title}</h2>
        <p class="text-xs text-white/80 mt-0.5">${lvl.description}</p>
      </div>
      <div class="p-5 space-y-3">
        ${lvl.bodies
          .map(
            (b) => `
          <div class="flex items-start gap-3 p-3 rounded-xl border border-ocean-100 hover:bg-ocean-50/60 transition">
            <span class="shrink-0 w-2.5 h-2.5 rounded-full bg-ocean-500 mt-1.5"></span>
            <div>
              <p class="font-semibold text-sm text-ocean-900">${b.name}</p>
              <p class="text-xs text-ocean-700/70 mt-0.5">${b.detail}</p>
            </div>
          </div>`
          )
          .join('')}
      </div>
    </div>`;
  });

  // Escalation criteria
  document.getElementById('escalation-title').textContent = data.escalationCriteria.title;
  document.getElementById('escalation-list').innerHTML = data.escalationCriteria.items
    .map(
      (item) => `
      <div class="flex items-center gap-3 p-4 rounded-xl bg-sand-50 border border-sand-200">
        <span class="text-xl">⚡</span>
        <p class="text-sm font-medium text-ocean-900">${item}</p>
      </div>`
    )
    .join('');

  // Flow tabs (interactive)
  const tabsEl = document.getElementById('flow-tabs');
  const contentEl = document.getElementById('flow-content');

  function renderFlow(flow) {
    contentEl.innerHTML = `
    <div class="fade-in">
      <div class="flex items-center gap-2 mb-5">
        <span class="px-3 py-1 rounded-full bg-ocean-900 text-white text-xs font-semibold">${flow.direction}</span>
        <h3 class="font-bold text-ocean-900">${flow.title}</h3>
      </div>
      <ol class="space-y-5">
        ${flow.steps
          .map(
            (s, i) => `
          <li class="relative pl-10 stepper-item">
            <span class="absolute left-0 top-0 w-8 h-8 rounded-full bg-ocean-600 text-white text-sm font-bold flex items-center justify-center">${i + 1}</span>
            <p class="text-sm text-ocean-900 leading-relaxed pt-1">${s}</p>
          </li>`
          )
          .join('')}
      </ol>
    </div>`;
  }

  function renderTabs() {
    tabsEl.innerHTML = data.flows
      .map(
        (f, i) => `
      <button data-idx="${i}" class="flow-tab-btn px-4 py-2 rounded-lg text-sm font-semibold transition ${i === 0 ? 'bg-ocean-900 text-white' : 'bg-ocean-50 text-ocean-700 hover:bg-ocean-100'}">${f.title}</button>`
      )
      .join('');

    tabsEl.querySelectorAll('.flow-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        tabsEl.querySelectorAll('.flow-tab-btn').forEach((b) => b.classList.remove('bg-ocean-900', 'text-white'));
        tabsEl.querySelectorAll('.flow-tab-btn').forEach((b) => b.classList.add('bg-ocean-50', 'text-ocean-700'));
        btn.classList.remove('bg-ocean-50', 'text-ocean-700');
        btn.classList.add('bg-ocean-900', 'text-white');
        renderFlow(data.flows[Number(btn.dataset.idx)]);
      });
    });
  }

  renderTabs();
  renderFlow(data.flows[0]);

  // Gaps
  document.getElementById('gaps-title').textContent = data.gaps.title;
  document.getElementById('gaps-list').innerHTML = data.gaps.items
    .map(
      (text, idx) => `
      <div class="flex items-start gap-3 px-4 py-3 rounded-xl border border-coral-400/30 bg-coral-50/40">
        <span class="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-coral-500 text-white text-xs font-bold flex items-center justify-center">${idx + 1}</span>
        <span class="text-sm text-ocean-900 leading-relaxed">${text}</span>
      </div>`
    )
    .join('');
})();
