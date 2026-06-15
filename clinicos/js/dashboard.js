// ============================================================
// DASHBOARD.JS
// ============================================================

function renderDashboard() {
  const session  = getSession();
  const email    = session.email;
  const patients = getDoctorPatients(email);
  const allVisits = getDoctorVisits(email);
  const todayV   = getVisitsToday(email);
  const weekV    = getVisitsThisWeek(email);
  const monthV   = getVisitsThisMonth(email);
  const topSym   = getTopSymptoms(email);

  document.getElementById('statTotalPatients').textContent = patients.length;
  document.getElementById('statTotalVisits').textContent   = allVisits.length;
  document.getElementById('statToday').textContent         = todayV.length;
  document.getElementById('statThisWeek').textContent      = weekV.length;
  document.getElementById('statThisMonth').textContent     = monthV.length;

  // Top symptoms chart
  const symContainer = document.getElementById('symptomChart');
  if (topSym.length === 0) {
    symContainer.innerHTML = '<p class="empty-msg">No visit data yet this week.</p>';
  } else {
    const max = topSym[0][1];
    symContainer.innerHTML = topSym.map(([sym, count]) => `
      <div class="sym-row">
        <span class="sym-label">${sym}</span>
        <div class="sym-bar-wrap">
          <div class="sym-bar" style="width:${Math.round((count/max)*100)}%"></div>
        </div>
        <span class="sym-count">${count}</span>
      </div>
    `).join('');
  }

  // Recent visits feed
  const recent = [...allVisits].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);
  const feed   = document.getElementById('recentFeed');
  if (recent.length === 0) {
    feed.innerHTML = '<p class="empty-msg">No visits recorded yet.</p>';
  } else {
    feed.innerHTML = recent.map(v => `
      <div class="feed-item">
        <div class="feed-avatar">${v.patientName.charAt(0)}</div>
        <div class="feed-body">
          <div class="feed-name">${v.patientName}</div>
          <div class="feed-meta">${v.diagnosis}</div>
          <div class="feed-chips">${(v.symptoms||[]).slice(0,3).map(s=>`<span class="chip-mini">${s}</span>`).join('')}</div>
        </div>
        <div class="feed-date">${formatDate(v.date)}</div>
      </div>
    `).join('');
  }
}
