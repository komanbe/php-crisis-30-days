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
  label: '委託先の受発注サーバー', before: 'PHP 8.3.35 + Apache mod_php',
  after: 'PHP 8.3.36 に更新',
  note: '配布元の案内に従って更新し、再起動と受付の動作まで確認する。'
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
    id: state.nodeId, kind: 'scene', eyebrow: '受発注会社・社長室',
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
      ? '更新と再起動を確認し、対象の修正を反映。通報後も記録を調べ、確認した範囲で不審な動きは見つからなかった。調査の負担は残った。'
      : '未修正の PHP を入口に、委託先の受発注環境が侵害された。復旧後も、過去のアクセスの調査が残った。', early
      ? '止める時間は必要でした。でも、先に更新できてよかった。'
      : '直せたことと、過去に何が起きたかは、別の確認でした。'),
    impact('hq', early ? (alternate ? 'burden' : 'protected') : (alternate ? 'burden' : 'affected'), early
      ? (alternate ? '安全確認のため、受付を切り替えた' : '受注の流れを維持した')
      : (alternate ? '電話と台帳で、受注をつないだ' : '注文が届かず、確認が積み上がった'), early
      ? (alternate ? '通報の確認中は電話と台帳に切り替えた。受付は続けられたが、照合や入力の手間が増えた。' : '通報の確認を続けながら、受注の流れを維持した。')
      : (alternate ? '二重入力と照合の手間は増えたが、必要な注文を工場へ渡せた。' : '委託先の受発注が止まり、自社でも注文を確認できなくなった。回答を待つ間に、処理する仕事が積み上がった。'), alternate
      ? '全部いつもどおりではないけれど、受け付ける道は残せました。'
      : (early ? '確認を続けながら、いつもの注文を受けられました。' : 'あ、やばい…注文が見えないと、工場に渡せない。')),
    impact('factory', early ? 'protected' : (alternate ? 'burden' : 'affected'), early ? '生産の段取りを守った' : (alternate ? '優先する注文を組み直した' : '待っていたのは、製造指示だった'), early
      ? '短い保守の調整で、必要な製造指示が届く流れを維持した。'
      : (alternate ? '電話で届く注文を優先し、現場の確認作業が増えた。通常の段取りを変更した。' : '注文が届かず、製造を待つ時間が生まれた。復旧しても、その待ち時間は取り戻せない。'), early
      ? 'つくるものが分かる。それが一番助かる。'
      : (alternate ? '段取りは増えたけど、必要なものからつくれた。' : '設備が動いても、何をつくるか分からなかった。')),
    impact('logistics', early ? 'protected' : (alternate ? 'burden' : 'affected'), early ? '出荷予定を維持した' : (alternate ? '配送ルートを組み直した' : '出発できない便が生まれた'), early
      ? '受注と製造の流れを維持でき、予定どおりに荷物がそろった。出荷を止めずに届けられた。'
      : (alternate ? '通常とは違う受付で確定した荷物を運ぶため、積み込みと配送順を調整した。' : '受注と製造の遅れで荷物がそろわず、配送の予定変更と待機が発生した。'), early
      ? 'いつもの荷物を、いつもの時間に届けられた。'
      : (alternate ? '積み方も順番も変更。でも、届く便をつくれました。' : 'トラックはあるのに、出る荷物がそろわない。')),
    impact('hospital', early ? (transparent ? 'protected' : 'burden') : (alternate && transparent ? 'burden' : 'affected'), transparent ? '状況を知り、調達を判断できた' : '調達先にも、見えない時間が続いた', early
      ? (transparent ? '保守と調査の状況が分かり、病院の調達担当は通常の調達予定を維持した。' : '大きな納品停止はなかったが、通報後の情報が少なく、調達担当の確認電話と不安が増えた。')
      : (transparent ? '納品の見通しをもとに代替の調達を相談できた。必要な物をそろえるための調整と、納品を待つ時間は残った。' : '納品の見通しが分からず、代替の調達を決めるまで余計に待つことになった。確認の電話にも時間を使った。'), transparent
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
      ? 'PHP の修正を早く反映し、受注から配送までの流れを維持しました。それでも、調査、受付の切り替え、連絡を待つ時間は、誰かが引き受けていました。'
      : '委託先で止まった受発注が、工場の製造指示、配送の出発、利用者の予定に影響しました。広がったのはシステムへの侵入ではなく、前の仕事を待つ時間でした。',
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
    summary: '半年の間、更新の通知は届き続けました。作業をいつ進めるか、誰が担うか、いつ知らせるか。その選択が、担当者の休暇と、現場や利用者の予定を変えました。',
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
        : '保守の影響を個別に聞く必要があり、積み込み前の確認や待ち時間が増えた。返答を待つ間にも、出発の時間が近づいていた。', transparent
        ? '先に聞けたから、出発の前に変えられた。' : '出発していいの？確認の電話から始まるのがつらい。'),
      impact('hospital', transparent ? (scheduled ? 'protected' : 'burden') : (scheduled ? 'burden' : 'affected'), transparent ? '調達の代案を準備できた' : '「使えない理由」を探した', transparent
        ? '病院の調達担当は保守予定を受け取り、必要に応じて別の発注方法を準備した。'
        : '発注画面の保守を事前に知らず、状況の確認と代替手段の相談に余計な時間を使った。調達の予定を組み直す手間が増えた。', transparent
        ? 'その時間は電話で頼める、と分かるだけで助かります。' : '調達側に連絡がないと、こちらも何をすればいいか分からない。'),
      impact('retail', transparent ? (scheduled ? 'protected' : 'burden') : (scheduled ? 'burden' : 'affected'), transparent ? '使えない時間を、先に知れた' : '何度も、受付をやり直した', transparent
        ? (scheduled ? '保守の案内を見て、使える時間に注文できた。' : 'まとめた保守の間は不便だったが、利用時刻を変える判断ができた。')
        : '受付できない理由が分からず、再操作と問い合わせを繰り返した。更新する作業自体の必要性が、利用者には届いていなかった。', transparent
        ? '止まる理由と戻る時間が分かれば、予定を変えられる。' : 'また押し直したけど、だめ。保守なら先に知りたかった。')
    ],
    chain: [
      { nodeId: 'vendor', label: '更新の通知', detail: '使っているソフトの保守通知が届く' },
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
      context: '午前 9 時の受注開始まで、あと 5 分。', nextLabel: '通知を開く'
    });
    case 'crisis-php': return frame(state, {
      chapter: 'CHAPTER 01', day: 0, time: '09:00', title: 'PHP って、うちにも関係ある？', speaker: 'vendor',
      text: 'PHP は、Web の受付の裏側で動くソフトウェアです。お客さんが注文ボタンを押したあと、内容を受け取って処理する。その部分に使われています。うちの委託先も、これを使っているんです。',
      context: '注文する人 → PHP が動く受発注サービス → 自社 → 工場 → 配送 → 待つ人',
      php: { ...PHP, label: 'PHP = Web 受付の裏側', note: 'PHP 自体が商品やデータを運ぶのではなく、注文を処理する仕組みの一部です。' }
    });
    case 'crisis-version': return frame(state, {
      chapter: 'CHAPTER 01', day: 0, time: '09:03', title: 'PHP2Shell。受付の裏側に、入口がある。', speaker: 'vendor', mood: 'alert',
      text: 'PHP2Shell という脆弱性の注意喚起が出ています。条件がそろうと、外から PHP の権限で命令を動かされるおそれがあります。委託先に確認したところ、使っている 8.3.35 は対象です。修正版の 8.3.36 に上げたいです。',
      context: '委託先から回答：PHP 8.3.35、Apache mod_php で稼働中。', php: { ...PHP }
    });
    case 'crisis-update': return choiceFrame(state, {
      chapter: 'DECISION 1 / 3', day: 0, time: '09:10', title: '「今止める」か、「後で直す」か。', speaker: 'hq',
      text: '今日は注文が多いんです。今更新するなら、受付を少し止める連絡を入れます。ただ、後に回すと、その間は修正されないままです。社長、今やりますか？',
      context: '委託先は作業を調整できる。あとは、受付を止めるかどうか。', php: { ...PHP }
    });
    case 'crisis-update-reaction': return frame(state, {
      chapter: 'CHAPTER 02', day: 0, time: early ? '11:30' : '11:00', title: early ? '小さく止めて、また動かす。' : '今日の売上は、止まらなかった。', speaker: 'vendor', mood: early ? 'relief' : 'calm',
      text: early ? '更新と再起動、確認できました！受付の動作も正常です。この脆弱性の修正は反映されています。更新前の記録も確認します。'
        : '分かりました。受付は続けて、更新は次の保守日に回します。委託先にも伝えました。ただ、今の PHP 8.3.35 は未修正のままです。何か動きがあれば、すぐ報告します。',
      context: early ? '短い保守を終え、受注担当が通常の受付を再開した。' : '午前の注文は、いつもどおり積み上がっている。', php: { ...PHP }
    });
    case 'crisis-report': return frame(state, {
      chapter: 'CHAPTER 02', day: 1, time: '08:40', title: '「取引先のデータが出ているかも」', speaker: 'hq', mood: early ? 'calm' : 'alert',
      text: early ? '「取引先のデータらしいものが出ている」と連絡が来ました。本物かどうかは、まだ分かりません。昨日の更新は確認済みですが、それとは別に調べてもらいます。'
        : 'あ、やばい…取引先のデータかも？という連絡が来ています。まだ本物かは分かりません。委託先が確認を始めました。返事を待つ間、今日の注文はどう受けましょう。',
      context: '通報の真偽、データの出所、関係する期間は、まだ確認できていない。'
    });
    case 'crisis-response': return choiceFrame(state, {
      chapter: 'DECISION 2 / 3', day: 1, time: '09:00', title: '確認を待つ間、仕事をどうつなぐ？', speaker: 'hq',
      text: early ? '昨日の更新は済んでいます。念のため接続を切って調べるなら、電話と台帳に切り替えます。ただ、あとで一件ずつ照合が必要です。どうしますか？'
        : '委託先の受付が止まると、こちらも注文を工場へ渡せません。電話で受けて台帳に残すことはできます。手作業は増えますが、切り替えておきますか？',
      context: '受付には今日も注文が入る。電話で受けるなら、人手を回す必要がある。'
    });
    case 'crisis-confirmation': return frame(state, {
      chapter: 'CHAPTER 03', day: 3, time: '13:20', title: early ? '塞いだ入口と、残る確認。' : '止まったのは、受発注の入口だった。', speaker: 'vendor', mood: early ? 'relief' : 'alert',
      text: early ? '今確認した範囲で、不審な動きは見つかっていません。ただ、通報の真偽はまだ調査中です。' + (alternate ? '電話受付の記録も残せています。受注担当と照合を続けます。' : '受付は通常どおり動いています。引き続き、記録を確認します。')
        : '委託先の調査で、未修正の PHP から受発注サーバーに侵入されたことが確認されました。記録を保全し、接続を切っています。更新した環境で、復旧の作業に入ります。',
      context: early ? '確認できた記録には異常なし。見えていない範囲と通報の調査は続いている。' : '受発注サーバーを隔離。工場と配送のシステムでは、今のところ異常は報告されていない。'
    });
    case 'crisis-delivery': return frame(state, {
      chapter: 'CHAPTER 03', day: 5, time: '06:30', title: early ? 'いつものトラックが、出発する。' : (alternate ? 'いつもとは違う順番で、届ける。' : 'トラックはある。でも、荷物がない。'), speaker: 'logistics', mood: early ? 'relief' : 'alert',
      text: early ? '荷物、そろいました。工場にも必要な注文が届いています。最初の保守では少し調整しましたけど、今日も予定どおり出発できます！'
        : (alternate ? '電話で受けた注文から、工場がつくってくれています。積み方も配送順も変更です。ちょっと大変ですけど、届ける便は出せます。'
          : 'あ、やばい、出発に間に合わない！工場に注文が届いていなくて、荷物がそろっていません。トラックも配送のシステムも動くんです。運ぶものが、まだないんです。'),
      context: early ? '受注から製造、出荷まで。今朝も荷物がつながった。' : '注文を待つ工場。その荷物を待つ配送。前の仕事の遅れが、次の予定に届く。'
    });
    case 'crisis-communication': return choiceFrame(state, {
      chapter: 'DECISION 3 / 3', day: 7, time: '10:00', title: '全部は分からない。それでも伝える？', speaker: 'retail',
      text: early ? '通報の話を見ました。私の注文はどうなっていますか？調べているなら、次のお知らせがいつかだけでも知りたいです。'
        : '今日、届く予定だったんです。遅れるなら、別の予定を考えたい。今どうなっていますか？次はいつ教えてもらえますか？',
      context: '調査は続いている。一方で、問い合わせは待ってくれない。'
    });
    case 'crisis-procurement': return frame(state, {
      chapter: 'CHAPTER 04', day: 7, time: '15:40', title: transparent ? '「分からない」も、判断の材料になる。' : '知らせない時間も、相手の時間だった。', speaker: 'hospital', mood: transparent ? 'relief' : 'alert',
      text: transparent ? (early ? '更新済みで、調査が続いていることが分かりました。次の連絡時刻も分かったので、調達の予定を立てられます。' : '納品の見通しと、まだ分からない範囲を聞けました。代わりの調達を相談します。遅れは困りますが、次の手を考えられます。')
        : (early ? '通報後、状況を確認する連絡が増えています。納品は続いていても、調達の予定をそのままにしていいのか知りたいです。' : '届くのか、別を探すのか。返答を待っている間に、代わりを手配する時間も減ってしまいます。'),
      context: '病院の調達窓口。アオイは納品予定を見ながら、別の調達先にも連絡を取っている。'
    });
    case 'crisis-recovery': return frame(state, {
      chapter: 'CHAPTER 04', day: 14, time: '17:30', title: early ? '何も起きなかった、とは違う。' : '受付が戻る。たまった仕事は残る。', speaker: 'hq', mood: 'relief',
      text: early ? (alternate ? '代替受付との照合を終えて、通常の受付に戻れました。手間は増えましたが、どの注文を受けたか記録を残せました。' : '受注を続けながら、通報と記録を確認しました。誰かが保守と確認を引き受けたから、普段の仕事が続けられたんですね。')
        : (alternate ? '更新した復旧先で受付が戻りました！電話の台帳と照合します。代替受付でつないだ分も、確認の手間は残っています。' : '更新した復旧先で受付が戻りました！でも、止まっていた注文の確認と、工場への手配が山積みです。戻っただけでは終わりません。'),
      context: '受付の動作確認と、過去のアクセスの調査。それぞれの担当が報告をまとめている。', php: { ...PHP }
    });
    case 'crisis-history': return frame(state, {
      chapter: 'CHAPTER 04', day: 20, time: '18:10', title: '画面が緑に戻っても、時間は戻らない。', speaker: 'factory', mood: early ? 'relief' : 'calm',
      text: early ? '最初の保守に合わせる段取りはありました。それでも、必要な注文を受け取れたから、いつもの仕事を守れた。小さな停止を決めるのも、仕事なんですね。'
        : (alternate ? '優先する注文の組み直しに、みんなで対応しました。作業は戻っても、余計な確認と調整に使った時間は残ります。' : '製造を待った時間と、その後の組み直し。いまは動いていても、あの間に待ってもらった人の予定までは戻せません。'),
      context: '工場の終業時刻。日報には、製造だけでなく確認と調整の記録も残っている。'
    });
    case 'crisis-lesson': return frame(state, {
      chapter: 'EPILOGUE', day: 30, time: '09:00', title: 'PHP の向こうに、人がいた。', speaker: 'vendor', mood: 'calm',
      text: '最初は、PHP の更新通知が一通来ただけでしたよね。でも、受付の裏側には、工場も配送も、お客さんの予定もつながっていた。次も、更新を頼んで終わりにせず、動くところまで確認します。',
      context: '月末の打ち合わせ。更新の確認手順と、連絡先の一覧が机に並んでいる。', php: { ...PHP }
    });
    case 'crisis-epilogue': return frame(state, {
      chapter: 'SIX MONTHS LATER', day: 180, time: '半年後', title: 'そして、次の更新通知が届く。', speaker: null,
      text: 'AI を使った脆弱性研究も進むなか、直す仕事は一度では終わらない。次も小さく試せるか。担当が休んでも引き継げるか。あなたの判断の、その先に日常は続いていく。',
      context: '半年後の受信トレイ。次の保守通知が、一件届いた。', nextLabel: 'あなたが残した影響を見る'
    });
    case 'crisis-ending': return frame(state, {
      kind: 'ending', chapter: 'YOUR ENDING', day: 180, time: '振り返り', title: 'あなたの判断は、誰に届いた？', speaker: null,
      text: 'いつもの画面に戻ったあとも、日報と受信トレイには、あの日々の記録が残っていた。',
      context: '受注、製造、配送、調達、利用者。6 人から、報告が届いている。', ending: crisisEnding(state)
    });
    default: throw new RangeError('Unknown crisis frame.');
  }
}

function updatesFrame(state) {
  const { scheduled, sharedTeam, transparent } = state.flags;
  switch (state.nodeId) {
    case 'updates-opening': return frame(state, {
      chapter: 'PROLOGUE', day: 0, time: '新しい朝', title: 'アップデートは、終わったはずだった。', speaker: null,
      text: 'PHP2Shell への更新は終えた。受付も、工場も動いている。ようやく一息つける。そう思った朝、ミオが次の保守予定を持って社長室に入ってきた。',
      context: '朝の社長室。今日の議題は、これからの保守体制。', nextLabel: '情シスの話を聞く'
    });
    case 'updates-php': return frame(state, {
      chapter: 'CHAPTER 01', day: 0, time: '09:00', title: 'まず、PHP のおさらいから。', speaker: 'vendor', mood: 'relief',
      text: '注文を受け取る Web 受付の裏側に、PHP が使われています。PHP2Shell の件は、8.3.35 から修正版の 8.3.36 に更新できました。ただ、使っているソフトはほかにもあって、保守は続くんです。',
      context: 'PHP の更新・再起動と受付の動作は確認済み。保守の一覧には、ほかのソフトも並んでいる。', php: { ...PHP }
    });
    case 'updates-notices': return frame(state, {
      chapter: 'CHAPTER 01', day: 7, time: '10:30', title: '直すことが増えたら、どう続ける？', speaker: 'vendor',
      text: 'PHP2Shell の研究でも AI が使われたそうです。この先、何件見つかるかまでは分かりません。でも、通知が来るたびに慌てて人を集めるやり方は、そろそろ変えたいんです。',
      context: '届いた通知を確認し、影響する環境を調べて、試験と更新を組む。毎回、同じ準備が必要になる。'
    });
    case 'updates-cadence': return choiceFrame(state, {
      chapter: 'DECISION 1 / 3', day: 7, time: '11:00', title: '小さく進める？ まとめて進める？', speaker: 'vendor',
      text: '通常の更新でも、受付がちゃんと動くか試験が要ります。毎週少しずつ時間を取りますか？ それとも、今の開発が落ち着いてからまとめますか？ 緊急のものは、もちろん別に判断します。',
      context: '開発の締め切りと、保守に使う時間。どちらも、同じ予定表に入れなければならない。'
    });
    case 'updates-cadence-reaction': return frame(state, {
      chapter: 'CHAPTER 02', day: 30, time: '1 か月後', title: scheduled ? '小さな保守が、カレンダーに入った。' : '開発は進む。試験は、後に積まれていく。', speaker: 'hq', mood: 'calm',
      text: scheduled ? '毎週の確認の時間が決まりました。受付の都合も先に伝えられます。少しずつ時間は使いますが、次の保守の段取りが見えるようになりました。'
        : '新しい機能の仕事は進みました。通常の更新は後でまとめることにしたので、次の試験では変更点をまとめて確認する必要がありそうです。',
      context: scheduled ? '予定表に、次の試験と保守の時間が入った。' : '開発の予定は進む。一方、保守の一覧には未着手の項目が残っている。'
    });
    case 'updates-factory': return frame(state, {
      chapter: 'CHAPTER 02', day: 60, time: '2 か月後', title: scheduled ? '止める時間が分かれば、準備できる。' : 'まとめた保守は、現場にも届く。', speaker: 'factory', mood: scheduled ? 'relief' : 'alert',
      text: scheduled ? '短い保守の前に、必要な製造指示を確認できています。まったく手間がないわけじゃない。でも、予定に入れられると準備できます。'
        : 'あ、やばい！まとめた更新の試験で、受注の確認時刻が変わるんですね。工場も段取りを組み直します。大きな変更は、こちらの準備も大きく動かします。',
      context: scheduled ? '工場は保守の前に必要な製造指示を受け取っている。' : '工場の日報に、製造指示の確認時刻の変更が書き加えられた。'
    });
    case 'updates-team': return choiceFrame(state, {
      chapter: 'DECISION 2 / 3', day: 60, time: '15:00', title: '「あの人しか分からない」を、どうする？', speaker: 'hq',
      text: '確認がミオさんに集まっています。もう一人に教えて手順を残すと、今は時間がかかります。でも、休んだ時も続けられるようにしたい。社長、どうしましょう。',
      context: '受信トレイの宛先は、今日もミオに集中している。'
    });
    case 'updates-team-reaction': return frame(state, {
      chapter: 'CHAPTER 03', day: 75, time: '2 か月半', title: sharedTeam ? '「私が休んでも、大丈夫」に近づく。' : '速い判断は、一人の予定にかかっていた。', speaker: 'vendor', mood: sharedTeam ? 'relief' : 'alert',
      text: sharedTeam ? '手順を書いて、一緒に確認してもらいました。教える時間は必要でした。でも、私がいない日にも確認できる人ができました！'
        : 'いまは私が見れば判断できます。でも、試験も問い合わせも私に届きます。休暇中も確認が来ていて…あ、やばい、このままだと休めない。',
      context: sharedTeam ? '共有フォルダーに、試験の手順と確認済みの記録がそろい始めた。' : 'ミオの予定表には、休暇の日にも確認依頼が届いている。'
    });
    case 'updates-delivery': return frame(state, {
      chapter: 'CHAPTER 03', day: 90, time: '3 か月後', title: '保守の予定は、どこまで届いている？', speaker: 'logistics',
      text: scheduled ? '定期的な保守があると聞きました。こちらの出発前に何を確認すればいいか、関係する人みんなに同じ案内があると助かります。'
        : 'まとめた試験に合わせて配送順を調整しています。荷物の確認がいつできるのか、事前に教えてもらえれば、出発の前に組み直せます。',
      context: '配送担当が見ている出荷予定表には、保守の時間がまだ載っていない。'
    });
    case 'updates-communication': return choiceFrame(state, {
      chapter: 'DECISION 3 / 3', day: 90, time: '16:00', title: '使えない時間を、先に知らせる？', speaker: 'retail',
      text: '受付が保守中なら、別の時間に使いたいです。電話なら頼めるのかも知りたい。使えないとき、何をすればいいですか？',
      context: '次の保守が近づく。案内を出すなら、利用者が予定を変えられるうちに。'
    });
    case 'updates-procurement': return frame(state, {
      chapter: 'CHAPTER 04', day: 105, time: '3 か月半', title: transparent ? '連絡があれば、別の手を選べる。' : '問い合わせの向こうにも、仕事がある。', speaker: 'hospital', mood: transparent ? 'relief' : 'alert',
      text: transparent ? '保守の時間と、その間は電話で発注できることが分かりました。必要な調達を先に済ませるか、別の手段を使うか、こちらで決められます。'
        : '発注画面が使えなくて、何度か確認しました。保守だったんですね。理由と代わりの頼み方が分かれば、最初から準備できたのに。',
      context: transparent ? '病院の調達窓口に、保守時間と電話受付の案内が届いた。' : '病院の調達窓口から、受付の状況を尋ねる電話が入った。'
    });
    case 'updates-pressure': return frame(state, {
      chapter: 'CHAPTER 04', day: 120, time: '4 か月後', title: scheduled && sharedTeam ? '仕事は続く。でも、抱え方が変わった。' : '作業の山より先に、人が疲れていく。', speaker: 'vendor', mood: scheduled && sharedTeam ? 'relief' : 'alert',
      text: scheduled && sharedTeam ? '更新の確認は続いています。小さく試して、別の人にも見てもらう。楽になったというより、続けられる形になってきました。'
        : scheduled ? '毎週の作業は決まっています。でも、判断が全部私に集まります。試験の時間は取れても、休める仕組みがまだ足りません。'
          : sharedTeam ? 'まとめた変更の確認は大きな仕事です。でも、手順を共有した仲間と分担できます。一度に扱う量も、もう少し小さくできそうです。'
            : 'あ、やばい…まとめた更新の試験に、問い合わせも重なっています。通常の開発を止めて、確認に回る時間が増えました。',
      context: scheduled && sharedTeam ? '担当表には複数の名前が並び、次の確認を引き継げる。' : '試験の記録と問い合わせ。ミオは二つの画面を行き来している。'
    });
    case 'updates-handoff': return frame(state, {
      chapter: 'CHAPTER 04', day: 150, time: '5 か月後', title: sharedTeam ? '休暇の日にも、仕事がつながった。' : '一人の返信を、みんなが待っていた。', speaker: 'hq', mood: sharedTeam ? 'relief' : 'alert',
      text: sharedTeam ? '今日はミオさんがお休みです。でも、手順を見て別の担当者に確認できました。引き継ぎに使った時間が、ここで効いています。'
        : 'あ、やばい！ミオさんがいないと、どこまで確認したか分からない。工場も配送も、返信を待っています。誰か一人の予定が、みんなの待ち時間になるんですね。',
      context: sharedTeam ? 'ミオの休暇中、別の担当者が確認記録を開いている。' : 'ミオへの確認が返るまで、受注担当も次の連絡を出せずにいる。'
    });
    case 'updates-customer': return frame(state, {
      chapter: 'EPILOGUE', day: 165, time: '5 か月半', title: transparent ? '裏側の保守が、ちゃんと伝わった。' : '正しい更新でも、困る人はいる。', speaker: 'retail', mood: transparent ? 'relief' : 'alert',
      text: transparent ? '使えない時間が先に分かったので、注文を済ませておけました。保守はちょっと不便。でも、どうすればいいか分かると助かります。'
        : '何度押しても受付できなくて、問い合わせました。必要な更新だったんですね。それなら、いつ使えるか先に知りたかったです。',
      context: transparent ? '保守案内には、使えない時間と、その間の連絡先が書かれている。' : '問い合わせの記録に、「いつ使えるようになりますか」が続いている。'
    });
    case 'updates-lesson': return frame(state, {
      chapter: 'EPILOGUE', day: 180, time: '半年後', title: '守るのは、ソフトウェアの先にある日常。', speaker: 'vendor',
      text: '半年たっても、保守の通知は来ますね。PHP の更新だけじゃなく、試験も、引き継ぎも、連絡も必要でした。次の担当者には、ソフトの設定だけじゃなくて、誰がその先で待っているかも伝えたいです。',
      context: '半年前と同じ社長室。机の上には、現場と利用者から届いた報告がある。', nextLabel: '180 日後の、みんなの声を聞く'
    });
    case 'updates-ending': return frame(state, {
      kind: 'ending', chapter: 'YOUR ENDING', day: 180, time: '振り返り', title: '更新を続けた会社。その先にいる人。', speaker: null,
      text: '更新する側だけでなく、仕事をつなぐ人、待つ人にも、あなたの選択が届きました。',
      context: '180 日間の記録を閉じる前に、関わった 6 人の声を聞く。', ending: updatesEnding(state)
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
