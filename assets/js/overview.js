(async function () {
  const data = await fetchJSON('data/overview.json');

  // Header
  document.getElementById('fiscal-badge').textContent = data.meta.fiscalYear;
  document.getElementById('page-title').textContent = data.meta.title;
  document.getElementById('page-subtitle').textContent = data.meta.subtitle;
  document.getElementById('page-subtitle').textContent = data.meta.subtitle;
  
  // Stat cards
  const statCards = document.getElementById('stat-cards');
  statCards.innerHTML = data.stats
    .map((s, i) => {
      const t = toneClasses(s.tone);
      const darkCard = s.tone === 'dark';
      
      // ตรวจสอบว่าเป็นตัวเลขที่สามารถ animate ได้หรือไม่
      const isNumeric = !isNaN(Number(s.value)) && s.value !== '' && s.value !== null;

      return `
      <div class="rounded-2xl shadow-card p-5 fade-in ${darkCard ? 'bg-ocean-900' : 'bg-white'}" style="animation-delay:${i * 60}ms">
        <p class="text-xs font-medium ${darkCard ? 'text-ocean-200' : 'text-ocean-700/70'}">${s.label}</p>
        <p class="mt-2 text-2xl sm:text-3xl font-extrabold ${darkCard ? 'text-white' : 'text-ocean-900'}">
          <span class="stat-value" data-target="${s.value}">${isNumeric ? 0 : s.value}</span>
          <span class="text-sm font-medium ${darkCard ? 'text-ocean-200' : 'text-ocean-700/60'}">${s.unit || ''}</span>
        </p>
      </div>`;
    })
    .join('');

  // เรียก animateCounter เฉพาะรายการที่เป็นตัวเลขเท่านั้น
  statCards.querySelectorAll('.stat-value').forEach((el) => {
    const targetVal = el.dataset.target;
    const num = Number(targetVal);

    if (!isNaN(num) && targetVal !== '' && targetVal !== null) {
      animateCounter(el, num);
    }
  });

  // Bar chart: by mechanism
  document.getElementById('mechanism-title').textContent = data.byMechanism.title;
  new Chart(document.getElementById('mechanism-chart'), {
    type: 'bar',
    data: {
      labels: data.byMechanism.items.map((i) => i.label),
      datasets: [
        {
          label: data.byMechanism.unit,
          data: data.byMechanism.items.map((i) => i.value),
          backgroundColor: '#1c7293',
          borderRadius: 6,
          maxBarThickness: 40
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `${formatNumber(ctx.parsed.y)} เรื่อง` } } },
      scales: {
        x: { ticks: { autoSkip: false, font: { size: 10 } }, grid: { display: false } },
        y: { beginAtZero: true, grid: { color: '#eef7f9' } }
      }
    }
  });

  // Doughnut chart: by type
  document.getElementById('type-title').textContent = data.byType.title;
  new Chart(document.getElementById('type-chart'), {
    type: 'doughnut',
    data: {
      labels: data.byType.items.map((i) => `${i.label} (${i.percent}%)`),
      datasets: [
        {
          data: data.byType.items.map((i) => i.value),
          backgroundColor: ['#1c7293', '#f4a261', '#e76f51'],
          borderWidth: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
        tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${formatNumber(ctx.parsed)} เรื่อง` } }
      }
    }
  });

  // Group breakdown (progress bars)
  document.getElementById('group-title').textContent = data.byGroup.title;
  document.getElementById('group-note').textContent = data.byGroup.note;
  const maxGroup = Math.max(...data.byGroup.items.map((g) => g.value));
  document.getElementById('group-list').innerHTML = data.byGroup.items
    .map(
      (g) => `
      <a href="workflow.html" class="block group">
        <div class="flex items-center justify-between text-sm mb-1">
          <span class="text-ocean-900 group-hover:text-ocean-600 transition">${g.id}. ${g.label}</span>
          <span class="font-semibold text-ocean-700">${formatNumber(g.value)}</span>
        </div>
        <div class="h-2 rounded-full bg-ocean-50 overflow-hidden">
          <div class="h-full rounded-full bg-ocean-500 group-hover:bg-ocean-600 transition-all" style="width:${(g.value / maxGroup) * 100}%"></div>
        </div>
      </a>`
    )
    .join('');

  // Status summary donut
  document.getElementById('status-title').textContent = data.statusSummary.title;
  document.getElementById('status-total').textContent = `รวม ${data.statusSummary.totalLabel}`;
  new Chart(document.getElementById('status-chart'), {
    type: 'doughnut',
    data: {
      labels: data.statusSummary.items.map((i) => i.label),
      datasets: [
        {
          data: data.statusSummary.items.map((i) => i.value),
          backgroundColor: data.statusSummary.items.map((i) => toneClasses(i.tone).dot.includes('emerald') ? '#10b981' : toneClasses(i.tone).dot.includes('amber') ? '#f59e0b' : '#f43f5e'),
          borderWidth: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${formatNumber(ctx.parsed)} เรื่อง` } } }
    }
  });
  document.getElementById('status-legend').innerHTML = data.statusSummary.items
    .map((i) => {
      const t = toneClasses(i.tone);
      return `<div class="flex items-center justify-between">
        <span class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full ${t.dot}"></span>${i.label}</span>
        <span class="font-semibold">${formatNumber(i.value)} (${i.percent}%)</span>
      </div>`;
    })
    .join('');

  // Observations accordion
  document.getElementById('observations-title').textContent = data.observations.title;
  document.getElementById('observations-list').innerHTML = data.observations.items
    .map(
      (text, idx) => `
      <div class="flex items-start gap-3 px-4 py-3 rounded-xl border border-ocean-100 hover:border-ocean-300 hover:bg-ocean-50/60 transition cursor-default">
        <span class="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-ocean-900 text-white text-xs font-bold flex items-center justify-center">${idx + 1}</span>
        <span class="text-sm text-ocean-900 leading-relaxed">${text}</span>
      </div>`
    )
    .join('');
})();
