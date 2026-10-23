/**
 * A branching, fictional teaching story. All consequences are authored scenes,
 * not incident statistics, attack probabilities, or a forecast of future CVEs.
 * PHP facts come from the primary sources already recorded in SOURCES.md.
 * Business dependencies below do not describe technical infection routes.
 */

export const STORIES = Object.freeze([
  Object.freeze({
    id: 'crisis', number: '01', title: 'その更新、明日でもいい？',
    subtitle: 'PHP の通知から始まる、空白の 30 日間。', role: '受発注会社の社長',
    duration: '約 5 分',
    description: '一通の更新通知。その先には、工場、配送、そして商品を待つ人がいる。あなたの 3 つの判断で結末が変わる。'
  }),
  Object.freeze({
    id: 'updates', number: '02', title: '更新が、終わらない世界',
    subtitle: '一度直した、その先の 180 日間。', role: '同じ会社の社長',
    duration: '約 5 分',
    description: 'PHP は更新した。でも次の通知は届く。担当者と現場を守りながら、変化に追いつく会社をつくれるか。'
  })
]);

const PEOPLE = Object.freeze(['vendor', 'hq', 'factory', 'logistics', 'hospital', 'retail']);
const FLOWS = Object.freeze({
  crisis: Object.freeze([
    'crisis-opening', 'crisis-php', 'crisis-version', 'crisis-update',
    'crisis-update-reaction', 'crisis-report', 'crisis-response', 'crisis-confirmation',
    'crisis-delivery', 'crisis-communication', 'crisis-procurement', 'crisis-recovery',
    'crisis-history', 'crisis-lesson', 'crisis-epilogue', 'crisis-ending'
  ]),
  updates: Object.freeze([
    'updates-opening', 'updates-php', 'updates-notices', 'updates-cadence',
    'updates-cadence-reaction', 'updates-factory', 'updates-team', 'updates-team-reaction',
    'updates-delivery', 'updates-communication', 'updates-procurement', 'updates-pressure',
    'updates-handoff', 'updates-customer', 'updates-lesson', 'updates-ending'
  ])
});

const DECISIONS = Object.freeze({
  'crisis-update': {
    flag: 'updatedEarly', label: '最初の PHP 更新',
    choices: [
      { id: 'update', label: '今、更新を完了させる', description: '委託先と短い停止を調整し、更新・再起動まで確認する。', value: true, result: '第一報の前に PHP の更新を確認した。' },
      { id: 'defer', label: '今日は売上を優先する', description: '稼働を続け、更新は次の保守日に回す。', value: false, result: '受注を続け、PHP の更新を先送りした。' }
    ]
  },
  'crisis-response': {
    flag: 'alternate', label: '通報を受けた後の受付',
    choices: [
      { id: 'alternate', label: '切り離し、別の受付に切り替える', description: '調査対象との接続を止め、電話と確認用の台帳で受付を続ける。', value: true, result: '接続を切り離し、代替の受注手段を使った。' },
      { id: 'wait', label: '委託先の確認を待つ', description: '代替受付は始めず、既存の仕組みの状況を確認する。', value: false, result: '代替受付を用意せず、委託先の回答を待った。' }
    ]
  },
  'crisis-communication': {
    flag: 'transparent', label: '取引先と利用者への連絡',
    choices: [
      { id: 'share', label: '分かる範囲を、今伝える', description: '確認済み・調査中を分け、次の連絡時刻も伝える。', value: true, result: '分かったことと次の連絡時刻を共有した。' },
      { id: 'silent', label: '全容が分かるまで待つ', description: '不確かな発表を避け、調査がまとまってから知らせる。', value: false, result: '全容が分かるまで、状況の共有を待った。' }
    ]
  },
  'updates-cadence': {
    flag: 'scheduled', label: '更新の進め方',
    choices: [
      { id: 'regular', label: '小さく、定期的に更新する', description: '確認と試験の時間を毎週確保する。緊急の更新は別に判断する。', value: true, result: '小さな更新と試験の時間を定期的に確保した。' },
      { id: 'batch', label: '後でまとめて更新する', description: '目の前の開発を優先し、通常の更新作業をまとめる。', value: false, result: '通常の更新をまとめ、当面の開発を優先した。' }
    ]
  },
  'updates-team': {
    flag: 'sharedTeam', label: '更新を担う人',
    choices: [
      { id: 'team', label: 'もう一人と、手順を共有する', description: '時間を使って手順を残し、別の人でも確認できるようにする。', value: true, result: '手順と担当を共有し、引き継げる体制にした。' },
      { id: 'single', label: '詳しい担当者に任せ続ける', description: '引き継ぎに時間を使わず、今の担当者に判断を集める。', value: false, result: '確認と判断を、一人の担当者に集めた。' }
    ]
  },
  'updates-communication': {
    flag: 'transparent', label: '保守と利用者への連絡',
    choices: [
      { id: 'share', label: '予定と代わりの手段を知らせる', description: '工場・配送・利用者に、使えない時間と次の連絡を共有する。', value: true, result: '保守予定と代替手段を、関係する人へ共有した。' },
      { id: 'silent', label: '問い合わせが来たら答える', description: 'まず更新作業に集中し、連絡は個別の問い合わせに対応する。', value: false, result: '事前の一斉共有をせず、個別の問い合わせに対応した。' }
    ]
  }
});

const PHP = Object.freeze({
  label: 'この物語の PHP 環境', before: 'PHP 8.3.35 + Apache mod_php',
  after: 'PHP 8.3.36 に更新',
  note: 'PHP2Shell の修正版の一つ。実際は配布元の案内に従い、適用と再起動を確認する。'
});

function storyFlow(id) {
  if (!Object.hasOwn(FLOWS, id)) throw new RangeError(`Unknown story: ${String(id)}`);
  return FLOWS[id];
}

function flagsFor(decisions) {
  return Object.fromEntries(decisions.map(({ nodeId, choiceId }) => {
    const decision = DECISIONS[nodeId];
    const choice = decision.choices.find((candidate) => candidate.id === choiceId);
    return [decision.flag, choice.value];
  }));
}

/** Reject skipped decisions and incompatible saved states instead of guessing. */
function validateState(state) {
  if (!state || typeof state !== 'object') throw new TypeError('A story state is required.');
  const flow = storyFlow(state.storyId);
  const index = flow.indexOf(state.nodeId);
  if (index < 0) throw new RangeError('The frame does not belong to this story.');
  if (!Array.isArray(state.decisions)) throw new TypeError('Decisions must be an array.');
  const previous = flow.slice(0, index).filter((nodeId) => Object.hasOwn(DECISIONS, nodeId));
  if (previous.length !== state.decisions.length) throw new RangeError('The story has skipped or repeated a decision.');
  for (let i = 0; i < previous.length; i += 1) {
    const selected = state.decisions[i];
    const decision = DECISIONS[previous[i]];
    if (!selected || selected.nodeId !== previous[i] || !decision.choices.some((choice) => choice.id === selected.choiceId)) {
      throw new RangeError('The story contains an invalid decision.');
    }
  }
  const flags = flagsFor(state.decisions);
  if (!state.flags || Object.keys(flags).length !== Object.keys(state.flags).length ||
      Object.entries(flags).some(([key, value]) => state.flags[key] !== value)) {
    throw new RangeError('The story flags do not match its decisions.');
  }
  return { flow, index, flags };
}

export function createStory(id) {
  return { storyId: id, nodeId: storyFlow(id)[0], decisions: [], flags: {} };
}

function decisionHistory(state) {
  return state.decisions.map(({ nodeId, choiceId }) => {
    const decision = DECISIONS[nodeId];
    return { label: decision.label, result: decision.choices.find((choice) => choice.id === choiceId).result };
  });
}

function crisisScene(day, flags, selected, epilogue = false) {
  const early = flags.updatedEarly === true;
  let impacted = [];
  if (!early && flags.updatedEarly === false && day >= 1 && day < 14) {
    impacted = day < 3 ? ['vendor'] : flags.alternate
      ? ['vendor', 'hq', ...(day >= 5 ? ['logistics'] : [])]
      : ['vendor', 'hq', 'factory', ...(day >= 5 ? ['logistics', 'hospital', 'retail'] : [])];
  }
  return {
    day, impacted, patched: early || day >= 14, prevented: early,
    isolated: day < 14 && (flags.alternate === true || (!early && day >= 3)), futureMode: epilogue,
    pressure: epilogue ? .22 : impacted.length / PEOPLE.length,
    selected: selected || 'vendor'
  };
}

function updateScene(day, flags, selected) {
  const late = flags.scheduled === false;
  const solo = flags.sharedTeam === false;
  const unknown = flags.transparent === false;
  const impacted = day < 30 ? [] : [
    ...(late || solo ? ['vendor'] : []),
    ...(late && day >= 60 ? ['hq', 'factory'] : []),
    ...(late && day >= 90 ? ['logistics'] : []),
    ...(unknown && day >= 105 ? ['hospital', 'retail'] : [])
  ];
  return {
    day, impacted, patched: true, prevented: true, isolated: false, futureMode: true,
    pressure: Math.min(.9, .12 + (late ? .3 : .04) + (solo ? .22 : 0) + (unknown ? .15 : 0)),
    selected: selected || 'vendor'
  };
}

function frame(state, values) {
  const flags = state.flags;
  return {
    id: state.nodeId, kind: 'scene', eyebrow: '架空の会社・人物による体験',
    mood: 'calm', nextLabel: 'つづける', context: '',
    ...values,
    scene: state.storyId === 'crisis'
      ? crisisScene(values.day, flags, values.speaker, values.day === 180)
      : updateScene(values.day, flags, values.speaker)
  };
}

function choiceFrame(state, values) {
  return frame(state, {
    ...values, kind: 'choice',
    choices: DECISIONS[state.nodeId].choices.map(({ id, label, description }) => ({ id, label, description }))
  });
}

function impact(nodeId, status, title, text, quote) {
  return { nodeId, status, title, text, quote };
}

function crisisEnding(state) {
  const { updatedEarly: early, alternate, transparent } = state.flags;
  const impacts = [
    impact('vendor', early ? 'burden' : 'affected', early ? '短い保守で、入口を塞いだ' : '更新だけでは、過去は戻らない', early
      ? '更新・再起動の確認と記録の保全を担当。今回想定した PHP の入口からの侵入は防げた。調査の負担は残った。'
      : 'この架空の展開では、未修正の PHP を入口に委託先の受発注環境が侵害された。復旧後も、過去のアクセスの調査が残った。', early
      ? '止める時間は必要でした。でも、先に更新できてよかった。'
      : '直せたことと、過去に何が起きたかは、別の確認でした。'),
    impact('hq', early ? (alternate ? 'burden' : 'protected') : (alternate ? 'burden' : 'affected'), early
      ? (alternate ? '安全確認のため、受付を切り替えた' : '受注の流れを維持した')
      : (alternate ? '電話と台帳で、受注をつないだ' : '注文が届かず、確認が積み上がった'), early
      ? (alternate ? '更新済みでも通報を調べるため代替受付を選択。照合や入力の手間は発生した。' : '更新を事前に確認できていたため、この物語では受付を維持できた。通報の確認は続けた。')
      : (alternate ? '二重入力と照合の手間は増えたが、必要な注文を工場へ渡せた。' : '委託先の受発注停止を待つ間、自社の受付も滞った。自社への不正侵入を意味しない。'), alternate
      ? '全部いつもどおりではないけれど、受け付ける道は残せました。'
      : (early ? '確認を続けながら、いつもの注文を受けられました。' : 'あ、やばい…注文が見えないと、工場に渡せない。')),
    impact('factory', early ? 'protected' : (alternate ? 'burden' : 'affected'), early ? '生産の段取りを守った' : (alternate ? '優先する注文を組み直した' : '待っていたのは、製造指示だった'), early
      ? '短い保守の調整で、必要な製造指示が届く流れを維持した。'
      : (alternate ? '電話で届く注文を優先し、現場の確認作業が増えた。通常の段取りを変更した。' : '注文が届かず、製造を待つ時間が生まれた。復旧しても、その待ち時間は取り戻せない。'), early
      ? 'つくるものが分かる。それが一番助かる。'
      : (alternate ? '段取りは増えたけど、必要なものからつくれた。' : '設備が動いても、何をつくるか分からなかった。')),
    impact('logistics', early ? 'protected' : (alternate ? 'burden' : 'affected'), early ? '出荷予定を維持した' : (alternate ? '配送ルートを組み直した' : '出発できない便が生まれた'), early
      ? '受注と製造がつながり、今回の PHP 起点の停止による配送待ちは生じなかった。'
      : (alternate ? '通常とは違う受付で確定した荷物を運ぶため、積み込みと配送順を調整した。' : '受注と製造の遅れで荷物がそろわず、配送の予定変更と待機が発生した。'), early
      ? 'いつもの荷物を、いつもの時間に届けられた。'
      : (alternate ? '積み方も順番も変更。でも、届く便をつくれました。' : 'トラックはあるのに、出る荷物がそろわない。')),
    impact('hospital', early ? (transparent ? 'protected' : 'burden') : (alternate && transparent ? 'burden' : 'affected'), transparent ? '状況を知り、調達を判断できた' : '調達先にも、見えない時間が続いた', early
      ? (transparent ? '保守と調査の状況が分かり、病院の調達担当は通常の調達予定を維持した。' : '大きな納品停止はなかったが、通報後の情報が少なく、調達担当の確認電話と不安が増えた。')
      : (transparent ? '納品の見通しをもとに代替の調達を相談できた。連絡しても、納品の遅れそのものが消えるわけではない。' : '納品の見通しが分からず、代替の調達を決めるまで余計に待つことになった。診療被害を想定したものではない。'), transparent
      ? 'まだ分からないことも含めて聞けたので、次の手を考えられました。'
      : '届くのか、別を探すのか。それだけでも知りたかった。'),
    impact('retail', early ? (transparent ? 'protected' : 'burden') : (alternate && transparent ? 'burden' : 'affected'), transparent ? '待つ人に、次の予定を渡した' : '最後に待ったのは、利用者だった', early
      ? (transparent ? '状況と次の案内が届き、いつもの注文を受け取れた。' : '商品は受け取れたが、通報について分からない時間が続き、問い合わせの手間がかかった。')
      : (transparent ? '遅れを知らされたことで、受け取り予定を変更できた。待ち時間や予定変更の負担は残った。' : '商品を待つだけでなく、連絡を探し、問い合わせ、予定を組み直す負担まで増えた。'), transparent
      ? (early ? '何が起きているか分かったから、安心して予定を立てられた。' : '遅れるのは困る。でも、教えてもらえれば予定を変えられる。')
      : 'あ、やばい、今日使う予定だったのに。今どうなっているの？')
  ];
  const title = early ? (transparent ? '小さく止めて、日常を守った。' : '仕事は守れた。でも、説明を待つ人がいた。')
    : alternate ? (transparent ? 'つながりを切らず、負担を引き受けた。' : '仕事をつないでも、情報は届かなかった。')
      : (transparent ? '止まった日々を、伝えながら立て直した。' : '待つ判断が、遠くの誰かの待ち時間になった。');
  return {
    title,
    summary: early
      ? '最初の更新で、この物語が想定した PHP の入口は塞げました。その後の選択は、確認にかかる手間と、相手が判断できる情報を変えました。'
      : 'この物語では委託先の受発注が止まり、仕事の依存を通じて負担が届きました。これは取引先へ順番に感染した話ではありません。',
    impacts,
    chain: [
      { nodeId: 'vendor', label: '委託先の PHP', detail: early ? '第一報より前に更新を確認' : '未修正の入口から、委託先の受発注が停止' },
      { nodeId: 'hq', label: '自社の受注', detail: early ? (alternate ? '確認のため代替受付' : '受付を維持') : (alternate ? '代替受付で注文をつなぐ' : '注文の確認が滞る') },
      { nodeId: 'factory', label: '工場', detail: early ? '製造指示が届く' : (alternate ? '優先順位を組み直す' : '製造指示を待つ') },
      { nodeId: 'logistics', label: '配送', detail: early ? '出荷予定を維持' : (alternate ? '配送順を組み直す' : 'そろわない荷物を待つ') },
      { nodeId: 'hospital', label: '病院の調達', detail: transparent ? '見通しをもとに調達を判断' : '連絡と納品の見通しを待つ' },
      { nodeId: 'retail', label: '利用者', detail: transparent ? '案内をもとに受け取り予定を決める' : '問い合わせて、受け取り予定を確認する' }
    ],
    lesson: 'PHP は Web 受付の裏側で動くソフトウェア。更新の確認、別の受注手段、分かる範囲の連絡。その判断が、画面の向こうの人の時間につながります。次の 180 日も、更新・試験・引き継ぎを続ける備えが必要です。',
    decisions: decisionHistory(state)
  };
}

function updatesEnding(state) {
  const { scheduled, sharedTeam, transparent } = state.flags;
  return {
    title: scheduled && sharedTeam ? (transparent ? '更新を、日常の仕事にできた。' : '整った仕組みの外で、連絡を待つ人がいた。')
      : scheduled ? '仕組みは回った。一人の肩に乗せながら。'
        : sharedTeam ? '仲間と支えた。でも、まとめた仕事は重かった。' : '最後に残ったのは、更新待ちと一人の疲れだった。',
    summary: 'これは、更新の通知と作業が続く世界を置いた架空の 180 日です。攻撃が必ず起こる未来や、脆弱性が半年でなくなる未来を予測したものではありません。',
    impacts: [
      impact('vendor', scheduled && sharedTeam ? 'burden' : 'affected', sharedTeam ? '更新を、一人の仕事にしなかった' : '確認が、一人に集まった', scheduled
        ? (sharedTeam ? '小さな試験を続け、手順を共有。作業は残っても、休む人の代わりに確認できる体制をつくった。' : '毎週の作業は整ったが、判断が一人に集中。休暇中にも確認が届いた。')
        : (sharedTeam ? 'まとめた更新の試験は重くなったが、仲間と作業を分担できた。' : 'まとめた更新の試験と問い合わせが集中し、開発の時間も削られた。'), sharedTeam
        ? '手順を残す時間は必要。でも、一人で抱えなくてよくなった。' : 'あ、やばい…休むと全部止まる。私しか分からない。'),
      impact('hq', scheduled && sharedTeam ? 'protected' : (scheduled || sharedTeam ? 'burden' : 'affected'), '受付を支えたのは、人と手順だった', scheduled
        ? (sharedTeam ? '保守の予定と担当が分かり、受注の確認を止めずに進められた。' : '保守予定は分かったが、担当者の回答を待つ場面が残った。')
        : (sharedTeam ? 'まとめて行う試験に合わせ、受付の段取りを調整した。' : '試験のやり直しと担当者への確認待ちが重なり、受付の準備が遅れた。'), sharedTeam
        ? '聞ける人がもう一人いる。それだけで、仕事が進む。' : '担当者の返事待ちが、私たちの仕事の待ち時間になりました。'),
      impact('factory', scheduled ? 'protected' : (sharedTeam ? 'burden' : 'affected'), scheduled ? '小さな保守を、予定に入れられた' : 'まとめた保守に、段取りを合わせた', scheduled
        ? '保守を見込んで製造指示を準備し、普段の段取りを維持した。'
        : '大きな試験に合わせて製造指示の確認時刻を変更。担当者や受付の確認待ちにも付き合うことになった。', scheduled
        ? '予定が分かっていれば、その前に準備できます。' : '今週まとめて確認、と言われると、こっちの段取りも大きく変わる。'),
      impact('logistics', transparent ? (scheduled ? 'protected' : 'burden') : (scheduled ? 'burden' : 'affected'), transparent ? '配送前に、予定を組み直せた' : '現場で初めて、変更を知った', transparent
        ? (scheduled ? '保守の時間が届き、出荷情報を事前に確認できた。' : '大きな保守に合わせる負担は残ったが、配送順の変更を準備できた。')
        : '保守の影響を個別に聞く必要があり、積み込み前の確認や待ち時間が増えた。配送側への不正侵入を示す話ではない。', transparent
        ? '先に聞けたから、出発の前に変えられた。' : '出発していいの？確認の電話から始まるのがつらい。'),
      impact('hospital', transparent ? (scheduled ? 'protected' : 'burden') : (scheduled ? 'burden' : 'affected'), transparent ? '調達の代案を準備できた' : '「使えない理由」を探した', transparent
        ? '病院の調達担当は保守予定を受け取り、必要に応じて別の発注方法を準備した。'
        : '発注画面の保守を事前に知らず、状況の確認と代替手段の相談に余計な時間を使った。診療被害を想定したものではない。', transparent
        ? 'その時間は電話で頼める、と分かるだけで助かります。' : '調達側に連絡がないと、こちらも何をすればいいか分からない。'),
      impact('retail', transparent ? (scheduled ? 'protected' : 'burden') : (scheduled ? 'burden' : 'affected'), transparent ? '使えない時間を、先に知れた' : '何度も、受付をやり直した', transparent
        ? (scheduled ? '保守の案内を見て、使える時間に注文できた。' : 'まとめた保守の間は不便だったが、利用時刻を変える判断ができた。')
        : '受付できない理由が分からず、再操作と問い合わせを繰り返した。更新する作業自体の必要性が、利用者には届いていなかった。', transparent
        ? '止まる理由と戻る時間が分かれば、予定を変えられる。' : 'また押し直したけど、だめ。保守なら先に知りたかった。')
    ],
    chain: [
      { nodeId: 'vendor', label: '更新の通知', detail: '同じ架空の作業を受け取る' },
      { nodeId: 'hq', label: '担当と試験', detail: sharedTeam ? '担当と手順を共有' : '一人に確認が集中' },
      { nodeId: 'factory', label: '受注と製造', detail: scheduled ? '小さな保守を予定化' : 'まとめた試験に予定を合わせる' },
      { nodeId: 'logistics', label: '配送', detail: transparent ? '事前に配送予定を調整' : '問い合わせてから配送を調整' },
      { nodeId: 'hospital', label: '病院の調達', detail: transparent ? '保守に合わせて発注方法を選ぶ' : '状況と代わりの発注方法を問い合わせる' },
      { nodeId: 'retail', label: '利用者', detail: transparent ? '使える時間を選べる' : '分からず、操作や問い合わせを繰り返す' }
    ],
    lesson: '一度 PHP を更新しても、保守は続きます。小さく試し、担当を分け、止める時間を知らせる。技術を直す仕事と、誰かの予定を守る仕事はつながっています。',
    decisions: decisionHistory(state)
  };
}

function crisisFrame(state) {
  const { updatedEarly: early, alternate, transparent } = state.flags;
  switch (state.nodeId) {
    case 'crisis-opening': return frame(state, {
      chapter: 'PROLOGUE', day: 0, time: '08:55', title: 'いつもどおりの朝。そのはずだった。', speaker: null,
      text: 'あなたは、日用品を受発注する会社の社長。今日も注文が入り、工場が動き、トラックが出る。その流れを、一つの更新通知が揺らそうとしていた。',
      context: 'これから選ぶのは 3 回だけ。間の会話は「つづける」で進みます。', nextLabel: '通知を開く'
    });
    case 'crisis-php': return frame(state, {
      chapter: 'CHAPTER 01', day: 0, time: '09:00', title: 'PHP って、うちにも関係ある？', speaker: 'vendor',
      text: 'PHP は、Web の受付の裏側で動くソフトウェアです。注文ボタンを押した後、内容を受け取る仕事をしています。うちが委託している受発注サービスにも使われています。',
      context: '注文する人 → PHP が動く受発注サービス → 自社 → 工場 → 配送 → 待つ人',
      php: { ...PHP, label: 'PHP = Web 受付の裏側', note: 'PHP 自体が商品やデータを運ぶのではなく、注文を処理する仕組みの一部です。' }
    });
    case 'crisis-version': return frame(state, {
      chapter: 'CHAPTER 01', day: 0, time: '09:03', title: 'PHP2Shell。受付の裏側に、入口がある。', speaker: 'vendor', mood: 'alert',
      text: 'PHP2Shell は、PHP に見つかった重大な脆弱性の呼び名です。条件によって、外から PHP の権限で命令を実行されるおそれがあります。この委託先は、対象となる構成の PHP 8.3.35。修正版 8.3.36 への更新を確認したいです。',
      context: '脆弱性は実際の情報。この会社・環境・この先の展開は演習用の設定です。', php: { ...PHP }
    });
    case 'crisis-update': return choiceFrame(state, {
      chapter: 'DECISION 1 / 3', day: 0, time: '09:10', title: '「今止める」か、「後で直す」か。', speaker: 'hq',
      text: '今日は注文が多い日です。今の更新には、受付を短く止める調整が必要です。でも、後回しにすれば未修正の時間が続きます。社長、どうしましょう。',
      context: '通知を送るだけでなく、更新が完了したかまで確かめる判断です。', php: { ...PHP }
    });
    case 'crisis-update-reaction': return frame(state, {
      chapter: 'CHAPTER 02', day: 0, time: early ? '11:30' : '11:00', title: early ? '小さく止めて、また動かす。' : '今日の売上は、止まらなかった。', speaker: 'vendor', mood: early ? 'relief' : 'calm',
      text: early ? '更新と再起動、確認できました！保守の間、受付には少し待ってもらいました。この物語で想定した PHP の入口は、第一報の前に塞げています。'
        : '受付はそのまま続けています。更新は次の保守日に回しました。いまは普段どおりに見えますが、PHP 8.3.35 の未修正の状態は続いています。',
      context: early ? '短い停止にも、調整と確認を担う人がいます。' : '「いま動く」と「問題がない」は、同じではありません。', php: { ...PHP }
    });
    case 'crisis-report': return frame(state, {
      chapter: 'CHAPTER 02', day: 1, time: '08:40', title: '「取引先のデータが出ているかも」', speaker: 'hq', mood: early ? 'calm' : 'alert',
      text: early ? '通報が届きました。ただ、まだ本物か分かりません。PHP の更新は昨日のうちに確認済み。別の問題がないかも含めて、記録を残して確認しましょう。'
        : 'あ、やばい…取引先のデータかも？まだ本物か分かりません。委託先は受発注の確認を始めています。回答を待つ間、注文をどう受けるか決めないと。',
      context: 'この時点では通報の真偽は未確認。通報が来ただけで、侵入や漏えいを断定しません。'
    });
    case 'crisis-response': return choiceFrame(state, {
      chapter: 'DECISION 2 / 3', day: 1, time: '09:00', title: '確認を待つ間、仕事をどうつなぐ？', speaker: 'hq',
      text: early ? '事前更新は確認できています。さらに切り離して調べるなら、電話と台帳の受付に切り替えられます。ただ、入力と照合の手間は増えます。'
        : '委託先の仕組みが止まると、私たちも注文を渡せません。電話と台帳なら続けられますが、入力と照合は手作業です。社長、切り替えますか。',
      context: '接続を止める判断と、止めた後に仕事を続ける手段をセットで考えます。'
    });
    case 'crisis-confirmation': return frame(state, {
      chapter: 'CHAPTER 03', day: 3, time: '13:20', title: early ? '塞いだ入口と、残る確認。' : '止まったのは、受発注の入口だった。', speaker: 'vendor', mood: early ? 'relief' : 'alert',
      text: early ? '更新前の入口を使う今回の侵入は、防げていました。届いた通報の確認は続けています。' + (alternate ? '代替受付への切り替えで、受注担当には照合の手間が増えています。' : 'この物語では受注の流れを維持できました。記録の確認は続けます。')
        : 'この物語では、未修正だった PHP を入口に、委託先の受発注環境が侵害されたことが確認されました。記録を保全して切り離し、更新した環境での復旧を進めます。',
      context: early ? '更新は万能な安全証明ではありません。別の問題と通報は引き続き調べます。' : 'ここから描くのは架空の展開。工場や配送へ、取引関係だけで自動的に感染するわけではありません。'
    });
    case 'crisis-delivery': return frame(state, {
      chapter: 'CHAPTER 03', day: 5, time: '06:30', title: early ? 'いつものトラックが、出発する。' : (alternate ? 'いつもとは違う順番で、届ける。' : 'トラックはある。でも、荷物がない。'), speaker: 'logistics', mood: early ? 'relief' : 'alert',
      text: early ? '工場に必要な注文が届いて、荷物もそろいました。最初の保守の調整はありましたが、今日も出発できます。'
        : (alternate ? '電話で受けた注文を優先して、工場がつくってくれています。積み込みも配送順も変更です。大変だけど、届ける便はつくれます。'
          : 'あ、やばい！受注が届かず、工場の製造指示も遅れています。出る荷物がそろわない。私たちのシステムが侵入された話ではなく、前の仕事を待っているんです。'),
      context: '受発注の停止 → 製造指示の遅れ → 出荷の遅れ。これは業務の依存による波及です。'
    });
    case 'crisis-communication': return choiceFrame(state, {
      chapter: 'DECISION 3 / 3', day: 7, time: '10:00', title: '全部は分からない。それでも伝える？', speaker: 'retail',
      text: early ? '通報の話を見ました。私の注文はどうなっていますか？調べているなら、次のお知らせがいつかだけでも知りたいです。'
        : '今日、届く予定だったんです。遅れるなら、別の予定を考えたい。今どうなっていますか？次はいつ教えてもらえますか？',
      context: '調査の結論を断定せずに、利用できる手段と次の案内を伝えることはできます。'
    });
    case 'crisis-procurement': return frame(state, {
      chapter: 'CHAPTER 04', day: 7, time: '15:40', title: transparent ? '「分からない」も、判断の材料になる。' : '知らせない時間も、相手の時間だった。', speaker: 'hospital', mood: transparent ? 'relief' : 'alert',
      text: transparent ? (early ? '更新済みで、調査が続いていることが分かりました。次の連絡時刻も分かったので、調達の予定を立てられます。' : '納品の見通しと、まだ分からない範囲を聞けました。代わりの調達を相談します。遅れは困りますが、次の手を考えられます。')
        : (early ? '通報後、状況を確認する連絡が増えています。納品は続いていても、調達の予定をそのままにしていいのか知りたいです。' : '届くのか、別を探すのか。返答を待っている間に、代わりを手配する時間も減ってしまいます。'),
      context: 'アオイは病院の調達担当。ここでは調達の手間を描き、診療被害は想定していません。'
    });
    case 'crisis-recovery': return frame(state, {
      chapter: 'CHAPTER 04', day: 14, time: '17:30', title: early ? '何も起きなかった、とは違う。' : '受付が戻る。たまった仕事は残る。', speaker: 'hq', mood: 'relief',
      text: early ? (alternate ? '代替受付との照合を終えて、通常の受付に戻れました。手間は増えましたが、どの注文を受けたか記録を残せました。' : '受注を続けながら、通報と記録を確認しました。誰かが保守と確認を引き受けたから、普段の仕事が続けられたんですね。')
        : (alternate ? '更新した復旧先で受付が戻りました！電話の台帳と照合します。代替受付でつないだ分も、確認の手間は残っています。' : '更新した復旧先で受付が戻りました！でも、止まっていた注文の確認と、工場への手配が山積みです。戻っただけでは終わりません。'),
      context: '更新で入口を塞ぐことと、それ以前の侵入・流出の有無を調べることは別です。', php: { ...PHP }
    });
    case 'crisis-history': return frame(state, {
      chapter: 'CHAPTER 04', day: 20, time: '18:10', title: '画面が緑に戻っても、時間は戻らない。', speaker: 'factory', mood: early ? 'relief' : 'calm',
      text: early ? '最初の保守に合わせる段取りはありました。それでも、必要な注文を受け取れたから、いつもの仕事を守れた。小さな停止を決めるのも、仕事なんですね。'
        : (alternate ? '優先する注文の組み直しに、みんなで対応しました。作業は戻っても、余計な確認と調整に使った時間は残ります。' : '製造を待った時間と、その後の組み直し。いまは動いていても、あの間に待ってもらった人の予定までは戻せません。'),
      context: '結末では、いまの状態だけでなく、途中で誰が何を負担したかを振り返ります。'
    });
    case 'crisis-lesson': return frame(state, {
      chapter: 'EPILOGUE', day: 30, time: '09:00', title: 'PHP の向こうに、人がいた。', speaker: 'vendor', mood: 'calm',
      text: 'PHP は、画面には見えにくい受付の裏側です。そこで何かが止まると、注文を受ける人、つくる人、運ぶ人、待つ人の予定に届く。だから、更新が終わったかまで確かめる必要があるんです。',
      context: 'PHP2Shell の事実と、あなたが体験した架空の展開は分けて振り返ります。', php: { ...PHP }
    });
    case 'crisis-epilogue': return frame(state, {
      chapter: 'SIX MONTHS LATER', day: 180, time: '半年後', title: 'そして、次の更新通知が届く。', speaker: null,
      text: 'AI を使った脆弱性研究も進むなか、直す仕事は一度では終わらない。次も小さく試せるか。担当が休んでも引き継げるか。あなたの判断の、その先に日常は続いていく。',
      context: 'この半年後は仮想のエピローグです。発見数の増加や収束時期を予測していません。', nextLabel: 'あなたが残した影響を見る'
    });
    case 'crisis-ending': return frame(state, {
      kind: 'ending', chapter: 'YOUR ENDING', day: 180, time: '振り返り', title: 'あなたの判断は、誰に届いた？', speaker: null,
      text: '復旧した後も、引き受けた負担は消えません。6 人の立場から、この物語を振り返ります。',
      context: '以下は選択に応じた教材上の結果です。実際の被害確率や効果を計算したものではありません。', ending: crisisEnding(state)
    });
    default: throw new RangeError('Unknown crisis frame.');
  }
}

function updatesFrame(state) {
  const { scheduled, sharedTeam, transparent } = state.flags;
  switch (state.nodeId) {
    case 'updates-opening': return frame(state, {
      chapter: 'PROLOGUE', day: 0, time: '新しい朝', title: 'アップデートは、終わったはずだった。', speaker: null,
      text: 'PHP2Shell への更新は終えた。受付も、工場も動いている。けれど、次の保守の通知が届く。これは、同じ会社で始まるもう一つの 180 日間。あなたは社長として、更新を続ける仕組みを選ぶ。',
      context: '選ぶのは 3 回。以後の通知・負荷・会話は、未来を考えるための架空の設定です。', nextLabel: '情シスの話を聞く'
    });
    case 'updates-php': return frame(state, {
      chapter: 'CHAPTER 01', day: 0, time: '09:00', title: 'まず、PHP のおさらいから。', speaker: 'vendor', mood: 'relief',
      text: 'PHP は、注文を受け取る Web 受付の裏側です。PHP2Shell という脆弱性に備えて、この受発注環境は PHP 8.3.35 から修正版 8.3.36 に更新済み。今日は、その先の保守を考えます。',
      context: '委託先の受付 → 自社 → 工場 → 配送 → 待つ人。裏側の保守も、この流れを支えます。', php: { ...PHP }
    });
    case 'updates-notices': return frame(state, {
      chapter: 'CHAPTER 01', day: 7, time: '10:30', title: '直すことが増えたら、どう続ける？', speaker: 'vendor',
      text: 'PHP2Shell の研究でも AI が使われたと公表されています。ただ、この先に何件見つかるか、いつ落ち着くかは分かりません。ここでは、いろいろなソフトの更新作業が続く世界を体験してみましょう。',
      context: 'AI が単独で全てを発見した、半年で脆弱性がなくなる、といった前提は置きません。'
    });
    case 'updates-cadence': return choiceFrame(state, {
      chapter: 'DECISION 1 / 3', day: 7, time: '11:00', title: '小さく進める？ まとめて進める？', speaker: 'vendor',
      text: '次の更新には、動作の試験も必要です。定期的に時間を取ると、毎週の開発時間を使います。後でまとめると、今の開発は進みます。どう組み込みましょう。',
      context: '重大な更新の緊急性は個別に判断します。ここでは通常の保守作業の進め方を選びます。'
    });
    case 'updates-cadence-reaction': return frame(state, {
      chapter: 'CHAPTER 02', day: 30, time: '1 か月後', title: scheduled ? '小さな保守が、カレンダーに入った。' : '開発は進む。試験は、後に積まれていく。', speaker: 'hq', mood: 'calm',
      text: scheduled ? '毎週の確認の時間が決まりました。受付の都合も先に伝えられます。少しずつ時間は使いますが、次の保守の段取りが見えるようになりました。'
        : '新しい機能の仕事は進みました。通常の更新は後でまとめることにしたので、次の試験では変更点をまとめて確認する必要がありそうです。',
      context: '作業をためることと、必ず侵害されることは同じではありません。ここで描くのは保守の負荷です。'
    });
    case 'updates-factory': return frame(state, {
      chapter: 'CHAPTER 02', day: 60, time: '2 か月後', title: scheduled ? '止める時間が分かれば、準備できる。' : 'まとめた保守は、現場にも届く。', speaker: 'factory', mood: scheduled ? 'relief' : 'alert',
      text: scheduled ? '短い保守の前に、必要な製造指示を確認できています。まったく手間がないわけじゃない。でも、予定に入れられると準備できます。'
        : 'あ、やばい！まとめた更新の試験で、受注の確認時刻が変わるんですね。工場も段取りを組み直します。大きな変更は、こちらの準備も大きく動かします。',
      context: '同じ架空の保守作業でも、まとめ方によって現場の調整は変わります。'
    });
    case 'updates-team': return choiceFrame(state, {
      chapter: 'DECISION 2 / 3', day: 60, time: '15:00', title: '「あの人しか分からない」を、どうする？', speaker: 'hq',
      text: '確認がミオさんに集まっています。もう一人に教えて手順を残すと、今は時間がかかります。でも、休んだ時も続けられるようにしたい。社長、どうしましょう。',
      context: '人数を増やすだけでなく、判断と確認の手順を共有する選択です。'
    });
    case 'updates-team-reaction': return frame(state, {
      chapter: 'CHAPTER 03', day: 75, time: '2 か月半', title: sharedTeam ? '「私が休んでも、大丈夫」に近づく。' : '速い判断は、一人の予定にかかっていた。', speaker: 'vendor', mood: sharedTeam ? 'relief' : 'alert',
      text: sharedTeam ? '手順を書いて、一緒に確認してもらいました。教える時間は必要でした。でも、私がいない日にも確認できる人ができました！'
        : 'いまは私が見れば判断できます。でも、試験も問い合わせも私に届きます。休暇中も確認が来ていて…あ、やばい、このままだと休めない。',
      context: '更新の負荷は、ソフトウェアだけでなく、それを保守する人にもかかります。'
    });
    case 'updates-delivery': return frame(state, {
      chapter: 'CHAPTER 03', day: 90, time: '3 か月後', title: '保守の予定は、どこまで届いている？', speaker: 'logistics',
      text: scheduled ? '定期的な保守があると聞きました。こちらの出発前に何を確認すればいいか、関係する人みんなに同じ案内があると助かります。'
        : 'まとめた試験に合わせて配送順を調整しています。荷物の確認がいつできるのか、事前に教えてもらえれば、出発の前に組み直せます。',
      context: '直す側に予定があっても、その先で使う人に届いているとは限りません。'
    });
    case 'updates-communication': return choiceFrame(state, {
      chapter: 'DECISION 3 / 3', day: 90, time: '16:00', title: '使えない時間を、先に知らせる？', speaker: 'retail',
      text: '受付が保守中なら、別の時間に使いたいです。電話なら頼めるのかも知りたい。使えないとき、何をすればいいですか？',
      context: '更新作業に集中する時間と、関係者が予定を立てるための情報を考えます。'
    });
    case 'updates-procurement': return frame(state, {
      chapter: 'CHAPTER 04', day: 105, time: '3 か月半', title: transparent ? '連絡があれば、別の手を選べる。' : '問い合わせの向こうにも、仕事がある。', speaker: 'hospital', mood: transparent ? 'relief' : 'alert',
      text: transparent ? '保守の時間と、その間は電話で発注できることが分かりました。必要な調達を先に済ませるか、別の手段を使うか、こちらで決められます。'
        : '発注画面が使えなくて、何度か確認しました。保守だったんですね。理由と代わりの頼み方が分かれば、最初から準備できたのに。',
      context: '病院の調達担当の場面です。診療被害や、病院への不正侵入を描いてはいません。'
    });
    case 'updates-pressure': return frame(state, {
      chapter: 'CHAPTER 04', day: 120, time: '4 か月後', title: scheduled && sharedTeam ? '仕事は続く。でも、抱え方が変わった。' : '作業の山より先に、人が疲れていく。', speaker: 'vendor', mood: scheduled && sharedTeam ? 'relief' : 'alert',
      text: scheduled && sharedTeam ? '更新の確認は続いています。小さく試して、別の人にも見てもらう。楽になったというより、続けられる形になってきました。'
        : scheduled ? '毎週の作業は決まっています。でも、判断が全部私に集まります。試験の時間は取れても、休める仕組みがまだ足りません。'
          : sharedTeam ? 'まとめた変更の確認は大きな仕事です。でも、手順を共有した仲間と分担できます。一度に扱う量も、もう少し小さくできそうです。'
            : 'あ、やばい…まとめた更新の試験に、問い合わせも重なっています。通常の開発を止めて、確認に回る時間が増えました。',
      context: 'この場面は架空の作業負荷です。件数、将来の攻撃、企業の存続を予測していません。'
    });
    case 'updates-handoff': return frame(state, {
      chapter: 'CHAPTER 04', day: 150, time: '5 か月後', title: sharedTeam ? '休暇の日にも、仕事がつながった。' : '一人の返信を、みんなが待っていた。', speaker: 'hq', mood: sharedTeam ? 'relief' : 'alert',
      text: sharedTeam ? '今日はミオさんがお休みです。でも、手順を見て別の担当者に確認できました。引き継ぎに使った時間が、ここで効いています。'
        : 'あ、やばい！ミオさんがいないと、どこまで確認したか分からない。工場も配送も、返信を待っています。誰か一人の予定が、みんなの待ち時間になるんですね。',
      context: '業務の依存は、システムだけでなく担当者の知識にも生まれます。'
    });
    case 'updates-customer': return frame(state, {
      chapter: 'EPILOGUE', day: 165, time: '5 か月半', title: transparent ? '裏側の保守が、ちゃんと伝わった。' : '正しい更新でも、困る人はいる。', speaker: 'retail', mood: transparent ? 'relief' : 'alert',
      text: transparent ? '使えない時間が先に分かったので、注文を済ませておけました。保守はちょっと不便。でも、どうすればいいか分かると助かります。'
        : '何度押しても受付できなくて、問い合わせました。必要な更新だったんですね。それなら、いつ使えるか先に知りたかったです。',
      context: '必要な保守を進めることと、利用者に何も不便をかけないことは同じではありません。'
    });
    case 'updates-lesson': return frame(state, {
      chapter: 'EPILOGUE', day: 180, time: '半年後', title: '守るのは、ソフトウェアの先にある日常。', speaker: 'vendor',
      text: '一度 PHP を更新すれば、保守が全部終わるわけではありません。小さく試し、引き継げるようにし、使う人へ伝える。私たちが直すのはソフトウェア。でも守りたいのは、その先にある毎日です。',
      context: 'これまでの選択で、誰のどんな負担が変わったかを見てみましょう。', nextLabel: '180 日後の、みんなの声を聞く'
    });
    case 'updates-ending': return frame(state, {
      kind: 'ending', chapter: 'YOUR ENDING', day: 180, time: '振り返り', title: '更新を続けた会社。その先にいる人。', speaker: null,
      text: '更新する側だけでなく、仕事をつなぐ人、待つ人にも、あなたの選択が届きました。',
      context: '以下は選択に応じた架空の結果です。更新の間隔だけで安全性を判定するものではありません。', ending: updatesEnding(state)
    });
    default: throw new RangeError('Unknown updates frame.');
  }
}

export function getFrame(state) {
  validateState(state);
  return state.storyId === 'crisis' ? crisisFrame(state) : updatesFrame(state);
}

/** Return a new state; conversations require no action, decisions require an ID. */
export function advanceStory(state, choiceId) {
  const { flow, index } = validateState(state);
  if (index === flow.length - 1) throw new RangeError('This story has ended.');
  const decisions = state.decisions.map((decision) => ({ ...decision }));
  const decision = DECISIONS[state.nodeId];
  if (decision) {
    if (!decision.choices.some((choice) => choice.id === choiceId)) throw new RangeError('Select a valid choice for this scene.');
    decisions.push({ nodeId: state.nodeId, choiceId });
  } else if (choiceId !== undefined) {
    throw new RangeError('This conversation has no choices.');
  }
  return { storyId: state.storyId, nodeId: flow[index + 1], decisions, flags: flagsFor(decisions) };
}

/** Replay a validated click history; undefined/null denotes the next button. */
export function replayStory(id, actions) {
  if (!Array.isArray(actions)) throw new TypeError('Replay actions must be an array.');
  return actions.reduce((state, action) => advanceStory(state, action === null ? undefined : action), createStory(id));
}
