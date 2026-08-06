(async function () {
  const data = await fetchJSON('data/agenda.json');

  document.getElementById('page-title').textContent = data.meta.title;
  document.getElementById('page-subtitle').textContent = data.meta.subtitle;

  // Status summary cards
  document.getElementById('status-cards').innerHTML = data.statusSummary
    .map((s, i) => {
      const t = toneClasses(s.tone);
      return `
      <div class="bg-white rounded-2xl shadow-card p-5 fade-in" style="animation-delay:${i * 60}ms">
        <div class="flex items-center gap-2 mb-2">
          <span class="w-2.5 h-2.5 rounded-full ${t.dot}"></span>
          <p class="text-sm font-semibold text-ocean-900">${s.label}</p>
        </div>
        <p class="text-2xl font-extrabold text-ocean-900">
          <span class="stat-value" data-target="${s.value}">0</span>
          <span class="text-sm font-medium text-ocean-700/60">เรื่อง (${s.percent}%)</span>
        </p>
        <p class="text-xs text-ocean-700/60 mt-2">${data.statusLegend[s.label] || ''}</p>
      </div>`;
    })
    .join('');
  document.querySelectorAll('#status-cards .stat-value').forEach((el) => animateCounter(el, Number(el.dataset.target)));

  // Stacked bar chart by group/status
  document.getElementById('byGroup-title').textContent = data.byGroupStatus.title;
  const bg = data.byGroupStatus;
  const colorMap = { 'เสร็จสิ้น': '#10b981', 'อยู่ระหว่างเสนอระดับถัดไป': '#f59e0b', 'ต้องเร่งรัดติดตาม': '#f43f5e' };
  new Chart(document.getElementById('group-status-chart'), {
    type: 'bar',
    data: {
      labels: bg.items.map((i) => i.label),
      datasets: bg.statuses.map((status) => ({
        label: status,
        data: bg.items.map((i) => i[status]),
        backgroundColor: colorMap[status],
        borderRadius: 4,
        maxBarThickness: 42
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } },
      scales: {
        x: { stacked: true, ticks: { font: { size: 9 }, maxRotation: 40, minRotation: 0 }, grid: { display: false } },
        y: { stacked: true, beginAtZero: true, grid: { color: '#eef7f9' } }
      }
    }
  });

  // Table setup
  document.getElementById('key-agenda-title').textContent = data.keyAgendaTitle;
  document.getElementById('priority-note').textContent = data.priorityNote;

  const statusSelect = document.getElementById('status-filter');
  const statuses = [...new Set(data.items.map((i) => i.status))];
  statusSelect.innerHTML += statuses.map((s) => `<option value="${s}">${s}</option>`).join('');

  const state = { search: '', status: '', priorityOnly: false, sortBy: 'id' };

  function applyFilters() {
    let list = data.items.filter((item) => {
      const matchesSearch =
        !state.search ||
        [item.topic, item.mechanism, item.resolution].join(' ').toLowerCase().includes(state.search.toLowerCase());
      const matchesStatus = !state.status || item.status === state.status;
      const matchesPriority = !state.priorityOnly || item.priority;
      return matchesSearch && matchesStatus && matchesPriority;
    });

    list = list.slice().sort((a, b) => {
      if (state.sortBy === 'status') return a.status.localeCompare(b.status, 'th');
      return a.id - b.id;
    });

    renderList(list);
  }

  function renderList(list) {
    const listEl = document.getElementById('agenda-list');
    const emptyEl = document.getElementById('empty-state');
    document.getElementById('result-count').textContent = `พบ ${formatNumber(list.length)} รายการ จากทั้งหมด ${formatNumber(data.items.length)} รายการ`;

    if (list.length === 0) {
      listEl.innerHTML = '';
      emptyEl.classList.remove('hidden');
      return;
    }
    emptyEl.classList.add('hidden');

    listEl.innerHTML = list
      .map(
        (item) => `
      <details class="group border border-ocean-100 rounded-xl overflow-hidden fade-in">
        <summary class="cursor-pointer list-none px-4 py-3.5 hover:bg-ocean-50/60 transition flex items-start gap-3">
          <span class="shrink-0 w-7 h-7 rounded-full bg-ocean-900 text-white text-xs font-bold flex items-center justify-center mt-0.5">${item.id}</span>
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-1">
              ${item.priority ? '<span class="text-amber-500 text-sm">★</span>' : ''}
              ${statusBadge(item.status)}
            </div>
            <p class="text-sm text-ocean-900 line-clamp-2 group-open:line-clamp-none">${item.topic}</p>
          </div>
          <svg class="shrink-0 w-5 h-5 text-ocean-400 transition-transform group-open:rotate-180 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </summary>
        <div class="px-4 pb-4 pt-1 border-t border-ocean-50 bg-ocean-50/30">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-sm">
            <div>
              <p class="text-xs font-semibold text-ocean-700/60 mb-1">กลไก / ครั้งล่าสุด</p>
              <p class="text-ocean-900">${item.mechanism}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-ocean-700/60 mb-1">มติ / ข้อสั่งการ</p>
              <p class="text-ocean-900">${item.resolution}</p>
            </div>
          </div>
        </div>
      </details>`
      )
      .join('');
  }

  document.getElementById('search-input').addEventListener('input', (e) => {
    state.search = e.target.value;
    applyFilters();
  });
  statusSelect.addEventListener('change', (e) => {
    state.status = e.target.value;
    applyFilters();
  });
  const priorityBtn = document.getElementById('priority-toggle');
  priorityBtn.addEventListener('click', () => {
    state.priorityOnly = !state.priorityOnly;
    priorityBtn.classList.toggle('bg-amber-500', state.priorityOnly);
    priorityBtn.classList.toggle('text-white', state.priorityOnly);
    priorityBtn.classList.toggle('border-amber-500', state.priorityOnly);
    applyFilters();
  });
  document.querySelectorAll('.sort-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.sortBy = btn.dataset.sort;
      document.querySelectorAll('.sort-btn').forEach((b) => {
        b.classList.remove('bg-ocean-900', 'text-white');
        b.classList.add('bg-ocean-50', 'text-ocean-700');
      });
      btn.classList.remove('bg-ocean-50', 'text-ocean-700');
      btn.classList.add('bg-ocean-900', 'text-white');
      applyFilters();
    });
  });

  applyFilters();
})();
