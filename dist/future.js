const FUTURE_DAYS = 180;
const TRENDS = {
  accelerating: { label: '発見が増えていく', description: 'AIなどの支援で、見つかる課題が増える仮定。' },
  steady: { label: '一定の発見が続く', description: '新たな課題が、ほぼ一定のペースで届く仮定。' },
  settling: { label: '発見が落ち着いていく', description: '初めの集中的な発見が、徐々に落ち着く仮定。' },
};
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const CHARACTERS = {
  vendor: { name: 'ミオ', role: '情シス担当', color: '#b4a1ff', hair: 'short' },
  hq: { name: 'レン', role: '受注担当', color: '#81b5ff', hair: 'parted' },
  factory: { name: 'ダイチ', role: '工場長', color: '#ffb06b', hair: 'cap' },
  logistics: { name: 'ソラ', role: '配送担当', color: '#62ced5', hair: 'short' },
  hospital: { name: 'アオイ', role: '医療機関の調達担当', color: '#eaa8d5', hair: 'long' },
  retail: { name: 'ユウ', role: 'サービス利用者', color: '#a5d992', hair: 'parted' },
};
const CHAPTERS = [
  { title: '最初の知らせ', cause: '新しい課題が、担当者の受信箱に届く。', roles: ['vendor', 'hq', 'retail'] },
  { title: '更新と、いつもの仕事', cause: '更新の確認と、生産の準備が重なる。', roles: ['vendor', 'factory', 'hq'] },
  { title: 'つながる先にも、人がいる', cause: '受注の確認が、配送の予定にもつながる。', roles: ['logistics', 'vendor', 'retail'] },
  { title: '「いつ届く？」への返事', cause: '取引先も、次の予定を決めようとしている。', roles: ['hospital', 'vendor', 'logistics'] },
  { title: '次の更新を、誰が担う', cause: '日々の対応を続けられる体制が問われる。', roles: ['hq', 'vendor', 'hospital'] },
  { title: '半年後も、続く仕事', cause: '発見の数が変わっても、更新の仕事は続く。', roles: ['retail', 'vendor', 'factory'] },
];

function conversationFor(model, day, plan) {
  const records = model[plan], record = records[day];
  const chapterIndex = Math.max(0, Math.ceil(day / 30) - 1);
  const chapter = CHAPTERS[chapterIndex];
  const prior = records[Math.max(0, day - 30)];
  const improving = day >= 30 && record.backlog < prior.backlog;
  const busy = record.backlog >= 8;
  const mood = improving || (day > 0 && record.backlog === 0) ? 'relief' : busy ? 'alert' : 'calm';
  const intro = {
    vendor: 'こんにちは、ミオです。更新する間隔と、対応できる量を決めておきましょう。',
    hq: '受注を担当するレンです。注文を止めずに、半年間やっていけるかな。',
    retail: 'ユウです。いつも使えるサービスでいてくれると、うれしいです。',
  };
  const replies = [
    {
      hq: busy ? 'あ、やばい！注文を受けながら、影響の確認も必要なの？ まず優先順位を決めよう。' : '更新の予定が分かると、受注の準備も合わせられますね。',
      retail: busy ? '使えるかどうか、どこを見れば分かるんだろう。案内があると助かるな。' : '事前に案内があると、使う時間を調整できます。',
    },
    {
      factory: busy ? 'あ、やばい！指示を受ける仕組みを止めるなら、工場にも先に教えてくれ。段取りを組み直すよ。' : '更新の時間が決まっているなら、その間の作業を先に用意しておける。',
      hq: busy ? '更新待ちの確認と注文の処理が重なってる。担当を分けられないかな。' : '通常の受注と、更新の確認。担当を分けて進めていこう。',
    },
    {
      logistics: busy ? '出荷の確認がまだなら、配送の予定も決めにくいな。どこまで確かか、教えてほしい。' : '確認済みの出荷予定が届いた。この情報なら、配送の準備を進められるよ。',
      retail: busy ? 'あれ、いつ届くのかな。分からないことも含めて、知らせてほしい。' : '次の案内がいつ来るか分かると、待っている間も予定が立てやすいね。',
    },
    {
      hospital: busy ? '納入が遅れる可能性があるなら、別の調達先も確認します。まだ未確認の範囲を教えてください。' : '更新と納入の予定を共有してもらえれば、こちらも余裕を持って準備できます。',
      logistics: busy ? '調べる項目が増えているね。納品の約束をする前に、一つずつ確かめよう。' : '調達担当と時間を合わせよう。更新中の連絡先も共有しておくね。',
    },
    {
      hq: busy ? 'あ、やばい！いつもの担当に確認が全部集まってる。引き継げる人と、手順が必要だ。' : '次の担当にも更新の手順を渡しておこう。特定の人だけに頼らず続けたいね。',
      hospital: busy ? '新しい情報が入ったら、前の案内も更新してください。調達の判断に使います。' : '定期的な共有があると、こちらも確認の時間を確保できます。',
    },
    {
      retail: busy ? '便利なサービスでも、状況が分からないと困っちゃう。次の案内を待っているよ。' : '更新の案内が続いているんだね。これからも、使える状態を守ってほしいな。',
      factory: busy ? 'ここで終わりにはできないな。更新の時間と人を、来月の計画にも組み込もう。' : '続けられる段取りができてきた。次の課題が来ても、また確認して進めよう。',
    },
  ];
  const vendorLine = day === 0 ? intro.vendor : improving
    ? `ふう、前の月より更新待ちを減らせた。いまは${record.backlog}課題。新しい連絡も、引き続き確認します。`
    : record.backlog === 0 ? 'よし、いま届いている課題は対応できた！ 次の発見に備えて、動作も確認しておこう。'
    : busy ? `あ、やばい！更新の確認が追いつかない。${record.backlog}課題が待っているから、対応の枠を見直したい。`
    : `いまの更新待ちは${record.backlog}課題。次の枠で対応できるよう、準備を進めます。`;
  const recovering = {
    hq: '前の月より確認が進んだんだね。残っていることを共有して、受注の段取りも調整しよう。',
    factory: '少し見通しが立ってきたな。残りの確認と、現場の準備を並行して進めよう。',
    logistics: '前より更新待ちは減ったんだね。まだ確認中の範囲も聞いて、配送を組み立てよう。',
    hospital: '確認が進んだ範囲を教えてください。まだ分からないことも分けてもらえると助かります。',
    retail: '少しずつ進んでいるんだね。次の案内も待っているよ。',
  };
  const lines = chapter.roles.map(nodeId => ({
    nodeId, ...CHARACTERS[nodeId], mood,
    text: day === 0 ? intro[nodeId] : nodeId === 'vendor' ? vendorLine : improving ? recovering[nodeId] : replies[chapterIndex][nodeId],
    stamp: `DAY ${String(day).padStart(3, '0')}`,
  }));
  return { ...chapter, chapter: chapterIndex + 1, lines, improving, mood, record };
}

function avatarMarkup(person) {
  const mouth = person.mood === 'alert' ? '<ellipse cx="24" cy="30" rx="2.5" ry="3" fill="#805c60"/>' : '<path d="M20 29q4 4 8 0" fill="none" stroke="#805c60" stroke-width="1.7" stroke-linecap="round"/>';
  const hair = person.hair === 'cap' ? '<path d="M12 20v-5q12-12 24 0v5Z" fill="currentColor"/><path d="M9 20h30" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>' : person.hair === 'long' ? '<path d="M11 35V20q0-15 13-15t13 15v15l-6-2V16H17v17Z" fill="#45465d"/>' : '<path d="M12 21V17Q13 5 25 7q12 1 12 14l-7-8-16 7Z" fill="#45465d"/>';
  return `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="23" fill="currentColor" opacity=".12"/><path d="M9 48v-5q0-10 15-10t15 10v5" fill="currentColor"/>${person.hair === 'long' ? hair : ''}<rect x="20" y="30" width="8" height="9" rx="3" fill="#dfb59d"/><ellipse cx="24" cy="22" rx="11" ry="13" fill="#edc9b0"/>${person.hair !== 'long' ? hair : '<path d="M13 19q0-13 13-12l9 7-7-1-13 9Z" fill="#45465d"/>'}<circle cx="20" cy="23" r="1.25" fill="#353746"/><circle cx="28" cy="23" r="1.25" fill="#353746"/>${mouth}</svg>`;
}

// The stream is generated once and shared by both plans. These rates are
// illustrative settings, not measurements of AI research or actual CVEs.
function makeArrivals(trend, seed) {
  let value = seed >>> 0;
  const random = () => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    return value / 4294967296;
  };
  const arrivals = [0];
  for (let day = 1; day <= FUTURE_DAYS; day++) {
    const rate = trend === 'accelerating' ? .1 + .003 * day : trend === 'settling' ? .57 - .0025 * day : .29;
    const found = random() < rate ? 1 : 0;
    arrivals.push(found + (found && day % 23 === 0 ? 1 : 0));
  }
  return arrivals;
}

function runPlan(arrivals, cadence, capacity) {
  let backlog = 0, exposure = 0, maintenance = 0, totalFound = 0, totalResolved = 0;
  return arrivals.map((incoming, day) => {
    totalFound += incoming;
    backlog += incoming;
    let resolved = 0;
    if (day > 0 && day % cadence === 0 && backlog > 0) {
      resolved = Math.min(backlog, capacity);
      backlog -= resolved;
      totalResolved += resolved;
      maintenance++;
    }
    // End-of-day backlog. A task arriving and resolved today adds zero days.
    exposure += backlog;
    return { day, incoming, totalFound, resolved, totalResolved, backlog, exposure, maintenance };
  });
}

/** Pure deterministic teaching model. Counts are invented tasks, never CVE forecasts. */
export function simulateFuture({ trend = 'accelerating', cadence = 30, capacity = 2, seed = 4173 } = {}) {
  if (!Object.hasOwn(TRENDS, trend)) throw new RangeError('Unknown future scenario');
  if (![7, 30, 90].includes(Number(cadence))) throw new RangeError('Cadence must be 7, 30, or 90 days');
  if (![1, 2, 3].includes(Number(capacity))) throw new RangeError('Capacity must be 1, 2, or 3 tasks');
  cadence = Number(cadence); capacity = Number(capacity);
  const arrivals = makeArrivals(trend, Number(seed));
  return {
    trend, cadence, capacity, seed, days: FUTURE_DAYS, arrivals,
    user: runPlan(arrivals, cadence, capacity),
    prepared: runPlan(arrivals, 7, 3),
    comparison: { cadence: 7, capacity: 3 },
  };
}

function storyFor(record, day) {
  if (day === 0) return { title: '同じ発見。違う対応計画。', text: 'ここから両社に、同じ架空の課題が届きます。更新の間隔と、一度に対応できる量を変えてみてください。', tag: 'START' };
  if (record.backlog === 0) return { title: '次の課題を受け止める余力がある。', text: 'この時点の更新待ちは解消。影響範囲の確認や、復旧テストに手を回せる場面を想定しています。新しい発見が止まったという意味ではありません。', tag: '余力を保つ場面' };
  if (record.backlog <= 4) return { title: '確認と更新を、日常の仕事にする。', text: '少数の課題を次の更新枠へ。担当と手順が決まっていれば、急な連絡にも状況を説明しやすくなります。', tag: '定常対応の場面' };
  if (record.backlog <= 11) return { title: '更新を待つ仕事が、重なり始める。', text: 'どのサービスに影響するかの確認と、日常業務が同じ担当に集まる場面。優先順位を決める時間も必要になります。', tag: '担当者の負荷が増える場面' };
  if (record.backlog <= 23) return { title: '「どこまで大丈夫か」に答えにくくなる。', text: '未確認の範囲が広がる場面を想定。受発注を一時停止して確認するか、継続しながら対応するか、経営判断が求められます。', tag: '情報が追いつかない場面' };
  return { title: '更新待ちが、事業の判断に持ち込まれる。', text: '注文処理の停止、担当者の過負荷、顧客への説明が同時に生じる場面の例です。これは課題数に基づく物語で、実被害や倒産を予測するものではありません。', tag: '業務への影響を考える場面' };
}

function curveMarkup(model, day) {
  const w = 620, h = 182, left = 37, right = 15, top = 12, bottom = 29;
  const maxY = Math.max(4, ...model.user.map(r => r.backlog), ...model.prepared.map(r => r.backlog));
  const ceiling = Math.ceil(maxY / 5) * 5;
  const x = d => left + d / 180 * (w - left - right);
  const y = b => top + (1 - b / ceiling) * (h - top - bottom);
  const points = records => records.slice(0, day + 1).map(r => `${x(r.day).toFixed(1)},${y(r.backlog).toFixed(1)}`).join(' ');
  const grid = [0, .5, 1].map(p => `<line x1="${left}" y1="${y(ceiling * p)}" x2="${w - right}" y2="${y(ceiling * p)}" class="future-grid-line"/><text x="${left - 8}" y="${y(ceiling * p) + 4}" text-anchor="end">${Math.round(ceiling * p)}</text>`).join('');
  return `<svg class="future-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${day}日目までの更新待ち。あなたの計画は${model.user[day].backlog}課題、7日ごとに3課題対応する計画は${model.prepared[day].backlog}課題。">${grid}${[0, 30, 60, 90, 120, 150, 180].map(d => `<text x="${x(d)}" y="${h - 8}" text-anchor="middle">${d}日</text>`).join('')}<polyline points="${points(model.prepared)}" class="future-line future-line-prepared"/><polyline points="${points(model.user)}" class="future-line future-line-user"/><line x1="${x(day)}" y1="${top}" x2="${x(day)}" y2="${h - bottom}" class="future-chart-cursor"/><circle cx="${x(day)}" cy="${y(model.user[day].backlog)}" r="4" class="future-point-user"/><circle cx="${x(day)}" cy="${y(model.prepared[day].backlog)}" r="3" class="future-point-prepared"/></svg>`;
}

/** Mounts inside the supplied panel; the host owns entering/leaving future mode. */
export function createFutureExperience(container, { onSceneUpdate = () => {}, onClose = () => {}, onStateChange = () => {}, initialState = {} } = {}) {
  let trend = Object.hasOwn(TRENDS, initialState?.trend) ? initialState.trend : 'accelerating';
  let cadence = [7, 30, 90].includes(Number(initialState?.cadence)) ? Number(initialState.cadence) : 30;
  let capacity = [1, 2, 3].includes(Number(initialState?.capacity)) ? Number(initialState.capacity) : 2;
  let day = Number.isFinite(Number(initialState?.day)) ? clamp(Math.round(Number(initialState.day)), 0, 180) : 0;
  let plan = initialState?.plan === 'prepared' ? 'prepared' : 'user';
  let playing = null, disposed = false;
  let model = simulateFuture({ trend, cadence, capacity });
  container.innerHTML = `<section class="future-experience" aria-label="これからの180日を考える仮想シナリオ">
    <header class="future-header"><div><div class="future-eyebrow">THE NEXT 180 DAYS <span>仮想シナリオ / 公開予測ではない</span></div><h2>発見が速くなる世界で、<br>更新を続けられるか。</h2><p>AIが脆弱性の発見を助ける時代。新しい課題が届き続けるとき、対応計画の違いは、半年後の仕事にどう現れるでしょうか。</p></div><button class="future-close" data-action="close" aria-label="180日シミュレーションを閉じる">30日間の演習へ <span aria-hidden="true">↗</span></button></header>
    <div class="future-plan-switch" role="group" aria-label="会話と3Dに表示する会社"><button data-plan="user" aria-pressed="true"><span class="future-company-icon" aria-hidden="true">▥</span><span><strong>あなたの会社</strong><small>あなたが決める対応計画</small></span></button><button data-plan="prepared" aria-pressed="false"><span class="future-company-icon" aria-hidden="true">▥</span><span><strong>備えた会社</strong><small>7日ごと・3課題まで対応</small></span></button></div>
    <p class="future-settings-note">あなたの会社の対応計画を設定。両社に届く課題は同じです。</p>
    <div class="future-controls"><label>発見の流れ<select name="trend" aria-label="発見の流れ"><option value="accelerating">発見が増えていく</option><option value="steady">一定の発見が続く</option><option value="settling">発見が落ち着いていく</option></select><small class="future-trend-description"></small></label><label>更新する間隔<select name="cadence" aria-label="更新する間隔"><option value="7">7日ごと</option><option value="30" selected>30日ごと</option><option value="90">90日ごと</option></select><small>計画した更新枠でまとめて対応</small></label><label>1回の更新で対応できる量<select name="capacity" aria-label="1回の更新で対応できる課題数"><option value="1">1課題</option><option value="2" selected>2課題</option><option value="3">3課題</option></select><small>チームの余力を表す架空の設定</small></label></div>
    <div class="future-timeline"><button data-action="play" class="future-play" aria-label="180日間を再生">▶ <span>再生</span></button><div class="future-slider-wrap"><div class="future-time-caption"><span class="future-day-label">DAY <strong>000</strong> / 180</span><span class="future-found-label"></span></div><input type="range" min="0" max="180" step="1" value="0" aria-label="経過日数" name="day"><div class="future-months">${[0, 30, 60, 90, 120, 150, 180].map(d => `<button data-day="${d}">${d === 0 ? '開始' : `${d / 30}か月`}</button>`).join('')}</div></div><button data-action="reset" class="future-reset">最初へ ↺</button></div>
    <section class="future-chapter" aria-label="現場の声"><div class="future-chapter-top"><span class="future-chapter-number"></span><span class="future-dialogue-label">現場の声 <small>演習内の会話</small></span></div><h3 class="future-chapter-title"></h3><p class="future-chapter-cause"></p><div class="future-voices"></div><div class="future-chapter-bottom"><p class="future-conversation-status"></p><button data-action="next-chapter" class="future-next-chapter">1か月後へ <span aria-hidden="true">→</span></button></div></section>
    <div class="future-analysis"><div class="future-data-panel"><div class="future-panel-heading"><h3>更新待ちの積み上がり</h3><span>単位：架空の課題数</span></div><div class="future-legend"><span class="future-user-key">あなたの計画</span><span class="future-prepared-key">7日ごと・3課題の計画</span></div><div class="future-chart-wrap"></div><div class="future-metrics"></div><p class="future-metric-note">「未対応課題 × 日」は、各日の更新待ちを足した値です。攻撃される確率ではありません。更新回数は、課題のある日に実施した計画更新の回数です。</p></div><aside class="future-story"><span class="future-story-tag"></span><h3 class="future-story-title"></h3><p class="future-story-text"></p><div class="future-tradeoff"></div></aside></div>
    <footer class="future-notes"><p>両計画に届く課題は同じです。1課題の難しさは同じと仮定し、更新枠の間隔と処理量だけを変えています。実際の優先度、互換性テスト、費用、個別の脆弱性の影響は含みません。</p><p>世界の脆弱性が半年で尽きるという予測ではありません。ここに示す発見数・業務の場面は、将来を考えるための架空の設定です。</p></footer>
  </section>`;
  const root = container.querySelector('.future-experience');
  const find = selector => root.querySelector(selector);
  const getState = () => ({ day, trend, cadence, capacity, plan });
  find('[name="trend"]').value = trend;
  find('[name="cadence"]').value = cadence;
  find('[name="capacity"]').value = capacity;
  function stop() {
    clearInterval(playing); playing = null;
    const play = find('[data-action="play"]');
    play.innerHTML = '▶ <span>再生</span>'; play.setAttribute('aria-label', '180日間を再生');
  }
  function update() {
    if (disposed) return;
    const user = model.user[day], prepared = model.prepared[day], active = model[plan][day], story = storyFor(active, day);
    const conversation = conversationFor(model, day, plan);
    root.dataset.plan = plan;
    root.querySelectorAll('[data-plan]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.plan === plan)));
    find('.future-trend-description').textContent = TRENDS[trend].description;
    find('.future-day-label strong').textContent = String(day).padStart(3, '0');
    find('.future-found-label').textContent = `ここまでに届いた課題 ${user.totalFound} 件`;
    find('[name="day"]').value = day;
    root.querySelectorAll('[data-day]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.day) === day)));
    find('.future-chapter').dataset.mood = conversation.mood;
    find('.future-chapter-number').textContent = day === 0 ? 'PROLOGUE / 180 DAYS' : `CHAPTER ${String(conversation.chapter).padStart(2, '0')} / 06 · DAY ${String(day).padStart(3, '0')}`;
    find('.future-chapter-title').textContent = day === 0 ? 'この会社の、半年間を見届けよう。' : conversation.title;
    find('.future-chapter-cause').textContent = day === 0 ? '情シス、現場、利用者。つながりの先にいる人たちの声を聞こう。' : conversation.cause;
    find('.future-voices').innerHTML = conversation.lines.map(person => `<article class="future-chat" data-mood="${person.mood}" style="--future-person:${person.color}"><div class="future-avatar">${avatarMarkup(person)}</div><div class="future-chat-content"><div class="future-chat-person"><strong>${person.name}</strong><span>${person.role}</span><i>${person.mood === 'alert' ? '!' : person.mood === 'relief' ? '✓' : '…'}</i></div><p>${person.text}</p></div></article>`).join('');
    find('.future-conversation-status').textContent = `${plan === 'user' ? 'あなたの会社' : '備えた会社'}の場面 / 更新待ち ${active.backlog}課題${conversation.improving ? ' / 前月より改善' : ''}`;
    const nextDay = Math.min(180, (Math.floor(day / 30) + 1) * 30);
    find('.future-next-chapter').innerHTML = day === 180 ? '最初の場面へ <span aria-hidden="true">↺</span>' : `DAY ${String(nextDay).padStart(3, '0')} の現場へ <span aria-hidden="true">→</span>`;
    find('.future-chart-wrap').innerHTML = curveMarkup(model, day);
    find('.future-metrics').innerHTML = `<table><thead><tr><th>この時点の状態</th><th>あなたの計画</th><th>7日ごと・3課題</th></tr></thead><tbody><tr><th>更新待ち</th><td>${user.backlog}<small> 課題</small></td><td>${prepared.backlog}<small> 課題</small></td></tr><tr><th>累積の未対応</th><td>${user.exposure.toLocaleString('ja-JP')}<small> 課題×日</small></td><td>${prepared.exposure.toLocaleString('ja-JP')}<small> 課題×日</small></td></tr><tr><th>計画更新</th><td>${user.maintenance}<small> 回</small></td><td>${prepared.maintenance}<small> 回</small></td></tr></tbody></table>`;
    find('.future-story-tag').textContent = story.tag;
    find('.future-story-title').textContent = story.title;
    find('.future-story-text').textContent = story.text;
    find('.future-tradeoff').textContent = day === 0 ? '頻繁な更新には、準備や確認の手間も必要です。課題を減らす速さと、更新を続ける体制を一緒に考えます。' : `比較の計画は、ここまでに${prepared.maintenance}回の更新を実施。あなたの計画は${user.maintenance}回です。間隔を短くすると、更新の準備・確認を行う機会も増えます。`;
    const pressure = clamp(active.backlog / 24, 0, 1);
    const impacted = active.backlog === 0 ? [] : active.backlog <= 4 ? ['vendor'] : active.backlog <= 11 ? ['vendor', 'hq'] : active.backlog <= 23 ? ['vendor', 'hq', 'factory', 'logistics'] : ['vendor', 'hq', 'factory', 'logistics', 'hospital', 'retail'];
    const { nodeId, name, role, text, mood, stamp } = conversation.lines[0];
    onSceneUpdate({ day: Math.round(day / 6), impacted, patched: true, prevented: true, visibility: 'observed', pressure, futureMode: true, selected: null, plan, dialogue: { nodeId, name, role, text, mood, stamp } });
    onStateChange(getState());
  }
  function handleChange(event) {
    const name = event.target.name;
    if (!['trend', 'cadence', 'capacity'].includes(name)) return;
    stop();
    trend = find('[name="trend"]').value;
    cadence = Number(find('[name="cadence"]').value);
    capacity = Number(find('[name="capacity"]').value);
    model = simulateFuture({ trend, cadence, capacity });
    update();
  }
  function handleInput(event) {
    if (event.target.name !== 'day') return;
    stop(); day = Number(event.target.value); update();
  }
  function handleClick(event) {
    const button = event.target.closest('button');
    if (!button || !root.contains(button)) return;
    if (button.dataset.plan) { stop(); plan = button.dataset.plan === 'prepared' ? 'prepared' : 'user'; update(); return; }
    if (button.dataset.day !== undefined) { stop(); day = Number(button.dataset.day); update(); return; }
    const action = button.dataset.action;
    if (action === 'close') { stop(); onClose(); }
    if (action === 'reset') { stop(); day = 0; update(); }
    if (action === 'next-chapter') { stop(); day = day === 180 ? 0 : Math.min(180, (Math.floor(day / 30) + 1) * 30); update(); }
    if (action === 'play') {
      if (playing) { stop(); return; }
      if (day >= 180) day = 0;
      button.innerHTML = 'Ⅱ <span>一時停止</span>'; button.setAttribute('aria-label', '180日間の再生を一時停止');
      update();
      playing = setInterval(() => { day = Math.min(day + 6, 180); update(); if (day === 180) stop(); }, 900);
    }
  }
  const onVisibility = () => { if (document.hidden) stop(); };
  root.addEventListener('change', handleChange);
  root.addEventListener('input', handleInput);
  root.addEventListener('click', handleClick);
  document.addEventListener('visibilitychange', onVisibility);
  update();
  return { pause: stop, getState, dispose() {
    if (disposed) return;
    stop(); disposed = true;
    root.removeEventListener('change', handleChange);
    root.removeEventListener('input', handleInput);
    root.removeEventListener('click', handleClick);
    document.removeEventListener('visibilitychange', onVisibility);
    root.remove();
  } };
}
