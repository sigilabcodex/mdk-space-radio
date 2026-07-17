(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const esc = (value) => String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const clock = new Intl.DateTimeFormat(undefined, {hour:'2-digit', minute:'2-digit'});
  const shortDate = new Intl.DateTimeFormat(undefined, {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'});
  const duration = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
  const info = tip => `<button class="info" aria-label="Metric definition" data-tip="${esc(tip)}">?</button>`;

  const metric = (value, suffix = '') => value == null ? '—' : `${value}${suffix}`;

  function renderKpis(real, demo, analytics) {
    const unavailable = analytics.load_status === 'unknown';
    const analyticsMeta = unavailable ? 'UNKNOWN · public analytics unavailable' : null;
    const rows = [
      ['Current listeners', metric(analytics.listeners_now), analyticsMeta || `REAL · 24h avg ${metric(analytics.average_24h)}`, unavailable ? 'unknown' : 'real', 'Current aggregate stream connections from the latest fresh Icecast snapshot; not unique people.'],
      ['Peak listeners', metric(analytics.peak_24h), analyticsMeta || `REAL · 24h · ${analytics.sample_count} samples`, unavailable ? 'unknown' : 'real', 'Highest aggregate concurrent-listener snapshot in the last 24 hours.'],
      ['Estimated listener-hours', metric(analytics.estimated_listener_hours_24h, ' h'), analyticsMeta || `REAL ESTIMATE · ${analytics.observed_duration_seconds_24h}s observed`, unavailable ? 'unknown' : 'real', 'Sum of listeners × duration between consecutive valid samples. This is not a session count.'],
      ['Listening sessions', demo.kpis.sessions, `DEMO DATA · +${demo.kpis.sessions_delta}%`, 'demo', 'Would count continuous stream connection intervals, not people.'],
      ['Web visits', demo.kpis.website_visits, `DEMO DATA · ${demo.kpis.website_visits_delta}%`, 'demo', 'Would count site analytics visits, separate from audio playback.'],
      ['Player starts', demo.kpis.player_starts, `DEMO DATA · +${demo.kpis.player_starts_delta}%`, 'demo', 'Would count attempts to start the web player, not confirmed listening.']
    ];
    $('#kpis').innerHTML = rows.map(([label,value,meta,type,tip]) => `<article class="kpi"><span class="kpi-label">${esc(label)} ${info(tip)}</span><strong class="kpi-value ${type}-text">${esc(value)}</strong><span class="kpi-meta ${type === 'demo' ? 'demo-text' : ''}">${esc(meta)}</span></article>`).join('');
  }

  function renderChart(real, analytics) {
    const series = analytics.series_24h, values = series.map(point => point.listeners), width = 900, height = 220, pad = 24;
    const known = values.filter(value => value != null);
    const max = Math.max(5, analytics.peak_24h || 0, ...known), x = i => pad + i * ((width - pad * 2) / Math.max(1, values.length - 1));
    const y = value => height - pad - value * ((height - pad * 2) / max);
    const segments = [];
    values.forEach((value, index) => {
      if (value == null) return;
      const previous = segments.at(-1);
      if (!previous || previous.at(-1).index !== index - 1) segments.push([]);
      segments.at(-1).push({index, value});
    });
    const paths = segments.map(segment => {
      const line = segment.map(point => `${x(point.index)},${y(point.value)}`).join(' L');
      const area = `M${x(segment[0].index)},${height-pad} L${line} L${x(segment.at(-1).index)},${height-pad} Z`;
      return `<path class="chart-area" d="${area}"/><path class="chart-line" d="M${line}"/>`;
    }).join('');
    const markers = real.play_history.track_markers_24h.map((event, index) => {
      const when = new Date(event.started_at), start = new Date(real.snapshot_at).getTime() - 86400000;
      const markerX = pad + Math.max(0, Math.min(1, (when.getTime() - start) / 86400000)) * (width - pad * 2);
      return `<g><line class="track-marker" x1="${markerX}" x2="${markerX}" y1="${pad}" y2="${height-pad}"/><circle class="marker-dot" cx="${markerX}" cy="${pad + 5 + (index % 3) * 6}" r="2"><title>${esc(event.track_title)} · ${shortDate.format(when)}</title></circle></g>`;
    }).join('');
    const grid = [0,.25,.5,.75,1].map(t => `<line class="chart-grid" x1="${pad}" x2="${width-pad}" y1="${pad+t*(height-pad*2)}" y2="${pad+t*(height-pad*2)}"/><text class="axis-label" x="0" y="${pad+t*(height-pad*2)+3}">${Math.round(max*(1-t))}</text>`).join('');
    const points = values.map((value,index)=>value == null ? '' : `<circle class="chart-point" cx="${x(index)}" cy="${y(value)}" r="${values.length > 100 ? 1 : 2}"><title>${shortDate.format(new Date(series[index].from))} · ${value} average listeners · ${series[index].sample_count} samples</title></circle>`).join('');
    const emptyLabel = analytics.load_status === 'unknown' ? 'LISTENER ANALYTICS UNKNOWN' : 'AWAITING VALID LISTENER SNAPSHOTS';
    const empty = known.length ? '' : `<text class="axis-label" x="${width/2}" y="${height/2}" text-anchor="middle">${emptyLabel}</text>`;
    $('#listenerChart').innerHTML = `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#6ed7dc" stop-opacity=".19"/><stop offset="1" stop-color="#6ed7dc" stop-opacity="0"/></linearGradient></defs>${grid}${paths}${points}${markers}${empty}</svg>`;
  }

  function renderNow(real, analytics) {
    const item = real.now_playing;
    $('#nowPlaying').innerHTML = `<div class="now-cover-wrap"><img class="now-cover" src="${esc(item.cover)}" alt="Cover of ${esc(item.release_title)}"></div><div class="now-details"><h3 class="now-track">${esc(item.track_title)}</h3><p class="now-release">${esc(item.release_id)} · ${esc(item.release_title)}</p><div class="progress-label"><span>${duration(item.elapsed_seconds)}</span><span>${duration(item.duration_seconds)}</span></div><div class="progress" aria-label="Track progress ${Math.round(item.progress_percent)} percent"><i style="width:${item.progress_percent}%"></i></div></div><div class="connection-line"><span>Stream connections ${info('Current Icecast connections from the latest aggregate sampler snapshot; this is not a unique-person estimate.')}</span><strong>${esc(metric(analytics.listeners_now))} CURRENT</strong></div>`;
  }

  function sparkline(values) {
    const max = Math.max(...values), points = values.map((value,index)=>`${index*(80/(values.length-1))},${23-value/max*20}`).join(' ');
    return `<svg class="sparkline" viewBox="0 0 80 25" preserveAspectRatio="none" aria-hidden="true"><path d="M${points.replaceAll(' ',' L')}"/></svg>`;
  }

  function renderContent(real, demo) {
    const releases = real.play_history.top_releases, maxPlays = Math.max(...releases.map(item=>item.broadcast_plays));
    $('#topReleases').innerHTML = releases.map(item => { const d=demo.release_engagement[item.release_id]; return `<div class="release-row"><img class="thumb" src="${esc(item.cover)}" alt=""><div><div class="row-title">${esc(item.title)}</div><div class="row-meta real-text">${item.broadcast_plays} real broadcasts</div></div><div class="bar-track" aria-hidden="true"><i style="width:${item.broadcast_plays/maxPlays*100}%"></i></div><div class="engagement">${sparkline(d.spark)}<span class="demo-text">${d.hours} h · ${d.sessions} sessions</span></div></div>`; }).join('');
    $('#topTracks').innerHTML = real.play_history.top_tracks.map((item,index) => { const d=demo.track_engagement[item.track_id]; return `<div class="track-row"><span class="rank">${String(index+1).padStart(2,'0')}</span><img class="thumb" src="${esc(item.cover)}" alt=""><div><div class="row-title">${esc(item.title)}</div><div class="row-meta">${esc(item.release_id)} · ${esc(item.release_title)}</div></div><div class="engagement"><strong class="demo-text">${d.minutes} min</strong><span>${d.sessions} demo sessions</span><span class="real-text"> · ${item.broadcast_plays} plays</span></div></div>`; }).join('');
  }

  function renderDuration(demo) {
    const max = Math.max(...demo.session_duration.map(item=>item.count));
    $('#sessionDuration').innerHTML = demo.session_duration.map(item=>`<div class="bucket-row"><span>${esc(item.label)}</span><div class="bucket-bar"><i style="width:${item.count/max*100}%"></i></div><span class="bucket-count">${item.count}</span></div>`).join('');
  }

  function renderActivity(real, analytics) {
    const entries = real.play_history.recent_transmissions.slice(0,6);
    const connectionActivity = analytics.load_status === 'unknown'
      ? `<div class="activity-row"><span class="activity-time">—</span><i class="event-node" aria-hidden="true"></i><div class="activity-copy">Listener analytics unavailable<small>Current connection state is unknown</small></div></div>`
      : `<div class="activity-row"><time class="activity-time" datetime="${esc(analytics.freshness.sampled_at)}">${clock.format(new Date(analytics.freshness.sampled_at))}</time><i class="event-node" aria-hidden="true"></i><div class="activity-copy">Connection snapshot received<small>${analytics.listeners_now} current stream connections</small></div></div>`;
    $('#recentActivity').innerHTML = entries.map((item,index)=>`<div class="activity-row"><time class="activity-time" datetime="${esc(item.started_at)}">${clock.format(new Date(item.started_at))}</time><i class="event-node" aria-hidden="true"></i><div class="activity-copy">${index===0?'Carrier locked':'Track changed'} · ${esc(item.track_title)}<small>${esc(item.release_id)} · ${esc(item.release_title)}</small></div></div>`).join('') + connectionActivity;
  }

  function renderHealth(real) {
    $('#systemHealth').innerHTML = real.health.map(item=>`<div class="health-row"><i class="health-led ${item.status}" aria-hidden="true"></i><div><div class="health-name">${esc(item.name)}</div><div class="health-detail">${esc(item.detail)} · ${shortDate.format(new Date(item.observed_at))}</div></div><span class="health-state ${item.status}">${item.status === 'signal' ? 'signal' : 'inferred'}</span></div>`).join('');
  }

  const loadJson = url => fetch(url, {cache:'no-store'}).then(response => {
    if (!response.ok) throw Error(response.status);
    return response.json();
  });
  const unknownAnalytics = {
    load_status:'unknown', generated_at:null, listeners_now:null, peak_24h:null,
    average_24h:null, estimated_listener_hours_24h:null,
    observed_duration_seconds_24h:null, sample_count:null, series_24h:[]
  };
  const analyticsRequest = loadJson('/stats/listener-analytics.json')
    .catch(() => ({...unknownAnalytics}));

  Promise.all([loadJson('real-data.json'), loadJson('demo-data.json'), analyticsRequest]).then(([real,demo,analytics])=>{
    const unavailable = analytics.load_status === 'unknown';
    const updatedAt = unavailable ? real.snapshot_at : analytics.generated_at;
    $('#updatedAt').dateTime=updatedAt; $('#updatedAt').textContent=shortDate.format(new Date(updatedAt));
    if (unavailable) {
      $('#listenerDataState').textContent='UNKNOWN';
      $('#listenerDataState').classList.add('unknown');
      $('#loadError').textContent='Listener analytics unavailable · current audience metrics are unknown.';
      $('#loadError').hidden=false;
    }
    renderKpis(real,demo,analytics); renderChart(real,analytics); renderNow(real,analytics); renderContent(real,demo); renderDuration(demo); renderActivity(real,analytics); renderHealth(real);
  }).catch(()=>{
    $('#loadError').textContent='Dashboard source data could not be loaded.';
    $('#loadError').hidden=false;
  });
})();
