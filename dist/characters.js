import { STAGES } from './scenario.js';

/** The six fictional people belong to the exercise, not to the cited incidents. */
export const CAST = Object.freeze({
  vendor: Object.freeze({ name: 'ミオ', role: '情シス担当', color: '#b9a4ff', initial: 'ミ' }),
  hq: Object.freeze({ name: 'レン', role: '受注担当', color: '#8db8ff', initial: 'レ' }),
  factory: Object.freeze({ name: 'ダイチ', role: '工場長', color: '#f3b26a', initial: 'ダ' }),
  logistics: Object.freeze({ name: 'ソラ', role: '配送担当', color: '#7cd5de', initial: 'ソ' }),
  hospital: Object.freeze({ name: 'アオイ', role: '調達担当', color: '#efa2ba', initial: 'ア' }),
  retail: Object.freeze({ name: 'ユウ', role: 'サービス利用者', color: '#a7d7b6', initial: 'ユ' })
});

function context({ day = 0, started = false, pending = false, snapshot, decision } = {}) {
  const source = snapshot && typeof snapshot === 'object' ? snapshot : {};
  // A historical snapshot wins over a caller's current-day default.
  const requestedDay = source.day ?? day;
  const selectedDay = Number.isFinite(Number(requestedDay))
    ? Math.max(0, Math.min(30, Number(requestedDay))) : 0;
  const evidence = Array.isArray(source.evidence) ? source.evidence : [];
  const confirmed = (pattern) => evidence.some((item) =>
    item?.status === 'confirmed' && pattern.test(String(item.label || '')));
  const stage = [...STAGES].reverse().find((item) => item.day <= selectedDay) || STAGES[0];
  const sameStage = decision && Number(decision.day) === stage.day &&
    (!decision.stageId || decision.stageId === stage.id);
  const choice = sameStage ? stage.choices.find((item) => item.id === decision.choiceId) : null;
  return {
    day: selectedDay, started: !!started, pending: !!pending,
    impacted: new Set(Array.isArray(source.impacted) ? source.impacted : []),
    prevented: source.prevented === true,
    patched: source.patched === true,
    isolated: source.isolated === true,
    hasReport: confirmed(/疑わしいデータ.*通報/),
    hasLogs: confirmed(/ログの一部を受領/),
    preserved: confirmed(/証拠を保全した/),
    lost: confirmed(/保存しなかった証拠/),
    hasDemand: confirmed(/要求が届いた/),
    stage, choice
  };
}

function line(ctx, nodeId, text, mood = 'calm', afterChoice = false) {
  const person = CAST[nodeId];
  return {
    nodeId, name: person.name, role: person.role, text, mood,
    stamp: !ctx.started ? '演習の前に' :
      `DAY ${String(ctx.day).padStart(2, '0')} · ${afterChoice ? '判断を受けて' : '現場の声'}`
  };
}

function choiceReaction(ctx) {
  // Each reaction describes a choice validated against the actual stage above.
  const reactions = {
    'verify-update': ['更新と再起動、確認できました！ひとまず一歩前進です。記録も残しましょう。', 'relief'],
    'map-dependencies': ['連絡先とつながりが見えてきました！ただ、PHPの更新はまだこれからです。', 'calm'],
    'defer-update': ['今日は稼働を続けるんですね。ただ、未修正の時間が続くのは気になります。', 'calm'],
    'contain-now': ['接続を絞って隔離しました！受注を続ける別の方法でも、現場の負担は残りますね。', 'calm'],
    'restrict-monitor': ['必要な接続に絞りました。残った経路と、以前の状況は別に調べましょう。', 'calm'],
    'wait-proof': ['正式な回答を待つんですね。どんな情報が出たら止めるか、先に決めませんか？', 'calm'],
    'preserve-rebuild': [ctx.prevented
      ? '記録は確保！確認できた環境で進めます。通報の真偽は、まだ別に調べましょう。'
      : 'ログは確保！復旧先を分けて進めます。以前に何があったかも調べましょう。', 'relief'],
    'wipe-restart': ['初期化と更新を進めたんですね。でも、保存しなかった証拠は調べられません。', 'alert'],
    'hold-original': ['証拠を残す判断ですね。調査を待つ間の仕事も、別の手段を考えたいです。', 'calm'],
    'explain-uncertainty': ['確認済みと未確認を分けて伝えるんですね！次のお知らせの予定も知れると助かります。', 'relief'],
    'deny-leak': ['まだ確認中なのに…「漏えいなし」と言い切って大丈夫？分かっている範囲を知りたいです。', 'alert'],
    'wait-full-report': ['発表はまだ待つんですね。状況だけでも聞けたら、こちらも判断しやすいです。', 'calm'],
    'clean-recovery': [ctx.prevented
      ? '相手の約束に頼らず、確かめられる方法で進める方針ですね。もしもの復旧も考えます。'
      : '確かめた復旧を少しずつ進めます！業務の再開と、流出範囲の確認は別ですね。', 'relief'],
    'pay-demand': ['支払いを選ぶんですね。でも、復旧もデータの削除も、保証されたわけではありません。', 'alert'],
    'parallel-recovery': ['要求の判断は保留して、別の受注・納品を広げるんですね。続けられる段取りを考えます。', 'calm']
  };
  return reactions[ctx.choice.id] || ['判断を受け取りました。確認できたことと、まだ分からないことを整理して進めます。', 'calm'];
}

function activeLine(ctx) {
  if (!ctx.started) {
    return line(ctx, 'vendor', '社長、PHPの更新通知が来ています！取引先も使っているので、一緒に確認しましょう。');
  }
  if (ctx.pending && ctx.choice) {
    const speaker = { prepare: 'vendor', 'first-signal': 'hq', investigation: 'vendor', communication: 'retail', recovery: 'hq' }[ctx.stage.id] || 'hq';
    const [text, mood] = choiceReaction(ctx);
    return line(ctx, speaker, text, mood, true);
  }
  if (ctx.day < 1) {
    return ctx.prevented
      ? line(ctx, 'vendor', '更新と再起動を確認できました！この演習で想定した入口は、先に塞げています。', 'relief')
      : line(ctx, 'vendor', '社長、委託先のPHPはまだ未修正です。更新を、完了の確認まで進めますか？');
  }
  if (ctx.day < 3) {
    if (ctx.prevented) return line(ctx, 'vendor', '更新は第一報より前に確認済みです！でも、届いた通報の真偽は別に調べましょう。', 'relief');
    if (ctx.hasReport) return line(ctx, 'hq', 'あ、やばい…取引先のデータかも？まだ本物か分かりません。まず確認しましょう。', 'alert');
    return line(ctx, 'hq', 'まだ分からないことがあります。確認できたことをそろえて、次の判断をしましょう。');
  }
  if (ctx.day < 7) {
    if (ctx.lost) return line(ctx, 'vendor', 'あっ…保存しなかった証拠は調べられません。分からない範囲も、きちんと残しましょう。', 'alert');
    if (ctx.preserved) return line(ctx, 'vendor', '調査に使う証拠は残せました！復旧を進めても、分からないことは引き続き調べます。', 'relief');
    if (ctx.prevented) return line(ctx, 'vendor', '先に更新を確認できてよかった！でも、通報の確認と記録の保全は続けましょう。', 'relief');
    if (ctx.impacted.has('hq')) return line(ctx, 'hq', 'あ、受注の流れに影響が…！どこを止めて、どう続けるか、みんなで決めたいです。', 'alert');
    return line(ctx, 'vendor', ctx.hasLogs
      ? 'ログの一部が届きました！これだけで断定せず、復旧の前に残すものを確認しましょう。'
      : '復旧を急ぎたいですね。その前に、調査に必要な記録を残せるか確認しましょう。');
  }
  if (ctx.day < 14) return line(ctx, 'retail', '次のお知らせはいつですか？分かったことと、まだ分からないことを教えてほしいです。');
  if (ctx.day < 30) {
    if (ctx.hasDemand) return line(ctx, 'hq', '「払えば戻る」って…本当？要求は届いても、相手の約束はまだ確かめられていません。', 'alert');
    return line(ctx, 'hq', '復旧の見通しを知りたいです。確かめられたことをもとに、次の手を考えましょう。');
  }
  if (ctx.prevented) return line(ctx, 'vendor', '先に更新を確認してよかった！今回の判断を、次も使える備えとして残しましょう。', 'relief');
  if (ctx.impacted.size) return line(ctx, 'hq', 'まだ業務への影響が残っています。次に何を確かめるか、みんなでそろえましょう。', 'alert');
  return line(ctx, 'hq', 'ここまでの判断、振り返りましょう。分かったことも、まだ不明なことも次の備えに。');
}

function supportingLine(ctx, nodeId) {
  if (nodeId === 'vendor') {
    if (ctx.lost) return line(ctx, nodeId, '保存しなかった証拠は調べられません。説明できない範囲も、隠さず整理しましょう。', 'alert');
    if (ctx.preserved) return line(ctx, nodeId, '証拠は保全できました。ここから分かることと、まだ分からないことを整理します。', 'relief');
    if (ctx.prevented) return line(ctx, nodeId, '事前の更新で、想定した入口は塞げています。別の問題まで安全とは言い切れません。', 'relief');
    if (ctx.patched) return line(ctx, nodeId, '更新は済んでいます。でも、それ以前に何があったかは別の調査が必要ですね。');
    if (ctx.hasLogs) return line(ctx, nodeId, 'ログは一部が届いた段階です。見えていない期間まで、安心とは言い切れません。');
    return line(ctx, nodeId, '使っているPHPと更新の状況、確認したいです。連絡だけで終わらせないように。');
  }
  if (nodeId === 'hq') {
    if (ctx.impacted.has(nodeId)) return line(ctx, nodeId, '受注側にも影響が出ています。できる仕事と、いま止まる仕事を整理したいです。', 'alert');
    return line(ctx, nodeId, '取引先の仕組みも、毎日の受注につながっています。確認先をそろえておきたいです。');
  }
  if (nodeId === 'factory') {
    if (ctx.impacted.has(nodeId)) return line(ctx, nodeId, '工場側にも影響が来ています。何を続けられるか、受注担当と段取りを合わせたいです。', 'alert');
    return line(ctx, nodeId, '受注側の状況、教えてください。変化があった時に、工場の段取りも考えられるように。');
  }
  if (nodeId === 'logistics') {
    if (ctx.impacted.has(nodeId)) return line(ctx, nodeId, '配送の仕事にも影響が…！今できることを確認して、納品の段取りを考えたいです。', 'alert');
    if (ctx.isolated) return line(ctx, nodeId, '接続を切っても、取引先への依存は残るんですね。配送側でも状況を確認したいです。');
    return line(ctx, nodeId, '配送の予定にも関わるので、状況を共有してほしいです。次の連絡を待っています。');
  }
  if (nodeId === 'hospital') {
    if (ctx.impacted.has(nodeId)) return line(ctx, nodeId, '調達の仕事にも影響が出ています。確かめられた状況を教えてください。次の手を考えます。', 'alert');
    return line(ctx, nodeId, '調達側も、取引先の状況を知りたいです。必要な確認を、早めに相談しておきましょう。');
  }
  if (ctx.impacted.has('retail')) return line(ctx, 'retail', '利用するサービスにも影響が…！今できることと、次のお知らせの予定を知りたいです。', 'alert');
  return line(ctx, 'retail', '分からないことは、分からないと教えてほしいです。次にいつ知らせてもらえますか？');
}

/** @returns {{nodeId:string,name:string,role:string,text:string,mood:string,stamp:string}} */
export function crisisDialogue(options = {}) {
  return activeLine(context(options));
}

/** Three different supporting people; excludes the active speaker and active quote. */
export function crisisVoices(options = {}) {
  const ctx = context(options);
  const active = activeLine(ctx);
  const order = ctx.day >= 14
    ? ['hospital', 'logistics', 'vendor', 'retail', 'factory', 'hq']
    : ctx.day >= 7
      ? ['hq', 'vendor', 'hospital', 'logistics', 'factory', 'retail']
      : ctx.day >= 3
        ? ['factory', 'vendor', 'logistics', 'hq', 'hospital', 'retail']
        : ['hq', 'vendor', 'factory', 'logistics', 'hospital', 'retail'];
  return order.filter((nodeId) => nodeId !== active.nodeId)
    .map((nodeId) => supportingLine(ctx, nodeId))
    .filter((voice) => voice.text !== active.text)
    .slice(0, 3);
}

/** A selected person can be heard without advancing the exercise. */
export function crisisVoiceFor(nodeId, options = {}) {
  if (!Object.hasOwn(CAST, nodeId)) return null;
  const ctx = context(options), active = activeLine(ctx);
  return active.nodeId === nodeId ? active : supportingLine(ctx, nodeId);
}
