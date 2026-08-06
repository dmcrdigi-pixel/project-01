(async function () {
  const data = await fetchJSON('data/workflow.json');

  document.getElementById('page-title').textContent = data.meta.title;
  document.getElementById('page-subtitle').textContent = data.meta.subtitle;

  const tabsEl = document.getElementById('group-tabs');
  const detailEl = document.getElementById('group-detail');

  function renderTabs(activeId) {
    tabsEl.innerHTML = data.groups
      .map((g) => {
        const active = g.id === activeId;
        const tone = toneClasses(g.status.tone);
        return `
        <button data-id="${g.id}" class="group-tab-btn shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition
          ${active ? 'bg-ocean-900 text-white border-ocean-900' : 'bg-white text-ocean-700 border-ocean-100 hover:border-ocean-300'}">
          <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${active ? 'bg-white/20' : tone.bg + ' ' + tone.text}">${g.id}</span>
          <span class="whitespace-nowrap">${g.label}</span>
        </button>`;
      })
      .join('');

    tabsEl.querySelectorAll('.group-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        renderTabs(id);
        renderDetail(data.groups.find((g) => g.id === id));
      });
    });
  }

  function renderDetail(g) {
    const tone = toneClasses(g.status.tone);
    const breakdownEntries = Object.entries(g.status.breakdown).filter(([, v]) => v > 0);

    detailEl.innerHTML = `
      <div class="lg:col-span-2 bg-white rounded-2xl shadow-card p-6 fade-in">
        <div class="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div>
            <p class="text-xs font-semibold text-ocean-500 mb-1">กลุ่มวาระที่ ${g.id}${g.totalNote ? ` · ${g.totalNote}` : ''}</p>
            <h2 class="text-lg font-bold text-ocean-900">${g.label}</h2>
          </div>
          <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${tone.bg} ${tone.text} ring-1 ${tone.ring}">${g.status.label}</span>
        </div>

        <h3 class="text-sm font-bold text-ocean-900 mb-4">ขั้นตอนการขับเคลื่อน</h3>
        <ol class="space-y-5 mb-6">
          ${g.steps
            .map(
              (s, i) => `
            <li class="relative pl-10 stepper-item">
              <span class="absolute left-0 top-0 w-8 h-8 rounded-full bg-ocean-600 text-white text-sm font-bold flex items-center justify-center">${i + 1}</span>
              <p class="text-sm text-ocean-900 leading-relaxed pt-1">${s}</p>
            </li>`
            )
            .join('')}
        </ol>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="p-4 rounded-xl bg-ocean-50/70">
            <p class="text-xs font-semibold text-ocean-700/70 mb-1">ผลของการพิจารณา</p>
            <p class="text-sm text-ocean-900">${g.decision}</p>
          </div>
          <div class="p-4 rounded-xl ${tone.bg}">
            <p class="text-xs font-semibold ${tone.text}/70 mb-1">สถานะที่พบ</p>
            <p class="text-sm font-semibold ${tone.text}">${g.status.label}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-card p-6 fade-in">
        <p class="text-xs font-semibold text-ocean-700/70 mb-1">จำนวนวาระในกลุ่มนี้</p>
        <p class="text-3xl font-extrabold text-ocean-900 mb-6">${formatNumber(g.total)} <span class="text-sm font-medium text-ocean-700/60">เรื่อง</span></p>

        <p class="text-xs font-semibold text-ocean-700/70 mb-3">สัดส่วนตามสถานะ</p>
        <div class="space-y-3">
          ${breakdownEntries
            .map(([label, value]) => {
              const t = toneClasses(statusTone(label));
              const pct = Math.round((value / g.total) * 100);
              return `
              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-ocean-900">${label}</span>
                  <span class="font-semibold text-ocean-700">${formatNumber(value)} (${pct}%)</span>
                </div>
                <div class="h-2 rounded-full bg-ocean-50 overflow-hidden">
                  <div class="h-full rounded-full ${t.dot}" style="width:${pct}%"></div>
                </div>
              </div>`;
            })
            .join('')}
        </div>
      </div>
    `;
  }

  renderTabs(data.groups[0].id);
  renderDetail(data.groups[0]);

  document.getElementById('observations-title').textContent = data.observations.title;
  document.getElementById('observations-list').innerHTML = data.observations.items
    .map(
      (text, idx) => `
      <div class="flex items-start gap-3 px-4 py-3 rounded-xl border border-ocean-100 hover:border-ocean-300 hover:bg-ocean-50/60 transition">
        <span class="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-ocean-900 text-white text-xs font-bold flex items-center justify-center">${idx + 1}</span>
        <span class="text-sm text-ocean-900 leading-relaxed">${text}</span>
      </div>`
    )
    .join('');
})();
