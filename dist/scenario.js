/**
 * 空白の30日 — fictional executive tabletop exercise.
 * This module does not send requests, execute PHP, or model exploit payloads.
 * All scores and propagation rules are deterministic teaching assumptions.
 * PHP2Shell facts: https://www.php.net/archive/2026.php#2026-10-21-5
 */

export const INDICATOR_NOTICE = '指標は学習用の仮想値です。被害予測・実測値・対策効果の検証結果ではありません。';

export const STAGES = [
  {
    id: 'prepare', day: 0, time: '09:00', kicker: 'DAY 00 · 予兆',
    title: '「うちには関係ない」で、いいですか。',
    message: 'あなたは架空の部品メーカー「東都精機」の社長。受発注を委託する会社から、PHP 8.3.35 / Apache mod_php を利用中との回答が届いた。PHP2Shellの修正版は公開済み。取引先の仕組みも、自社の事業を支えている。',
    sourceRole: '委託先の運用担当からの回答',
    evidence: [
      { label: 'PHP2Shellの修正リリースは公開済み', status: 'confirmed' },
      { label: '委託先はPHP 8.3.35 / mod_phpを利用（架空設定）', status: 'confirmed' },
      { label: '委託先で侵害が発生しているか', status: 'unknown' },
    ],
    prompt: '明日も受注を続けるため、今、何を決める？',
    choices: [
      { id: 'verify-update', title: '更新と再起動を確認する', description: '委託先と停止枠を確保。8.3.36への更新、ワーカー再起動、稼働確認まで完了させる。短い計画停止を受け入れる。', effects: { visibility: 24, trust: 4, continuity: -6, containment: 65, patched: true, inventory: true }, feedback: 'この演習では、修正を確認したためPHP2Shellの想定入口を塞げました。更新依頼だけで完了にせず、反映と稼働の確認が重要です。' },
      { id: 'map-dependencies', title: '依存関係と連絡先を調べる', description: '受発注・物流・保守の接続を一覧化。先に影響範囲を把握するが、更新はまだ終わらない。', effects: { visibility: 19, trust: 3, continuity: -1, containment: 10, inventory: true }, feedback: '誰に連絡し、どこを切り離すかが見えてきました。ただし、調査そのものでは脆弱性は修正されません。' },
      { id: 'defer-update', title: '通常稼働を優先する', description: '繁忙期の停止を避け、委託先の次回定例報告を待つ。現在の稼働は保てるが、未修正の時間が続く。', effects: { visibility: 1, trust: 0, continuity: 0, containment: 0 }, feedback: '今日の稼働は維持できました。一方、委託先の未修正期間と、対応の責任者が曖昧なまま残ります。' },
    ],
  },
  {
    id: 'first-signal', day: 1, time: '08:42', kicker: 'DAY 01 · 第一報',
    title: '情報はない。決断の時刻は来る。',
    message: '外部から「取引先に由来するかもしれないデータが公開されている」と連絡が入った。自社情報か、本物か、今も侵入が続いているかは不明。営業部には受発注の状況を問う電話が入り始める。',
    sourceRole: '外部からの通報・社内の初動会議',
    evidence: [
      { label: '疑わしいデータについての通報を受領（架空設定）', status: 'confirmed' },
      { label: '公開データの真正性と、自社情報の有無', status: 'unknown' },
      { label: '委託先との接続が影響経路になり得る', status: 'inferred' },
    ],
    prompt: '被害が確定する前に、接続を止める？',
    choices: [
      { id: 'contain-now', title: '限定隔離と代替運用を始める', description: '関係する接続を絞って隔離。委託先と専門家に調査を依頼し、受注は確認済みの別経路へ。現場の負荷は増える。', effects: { visibility: 12, trust: 3, continuity: -9, containment: 70, isolated: true, alternate: true }, feedback: '確証を待たず、影響の大きい経路を限定して止めました。隔離しても、取引先サービスへの依存による業務影響は残ります。' },
      { id: 'restrict-monitor', title: '接続を絞り、監視を強める', description: '必要な取引だけ継続し、権限と接続先を制限する。すべてを切り離すより業務への負担は小さい。', effects: { visibility: 9, trust: 1, continuity: -3, containment: 35, restricted: true }, feedback: '現場への影響を抑えながら露出を減らしました。制限の対象から漏れた経路や、すでに起きた侵害は別に調べる必要があります。' },
      { id: 'wait-proof', title: '確証が出るまで通常運用を続ける', description: '誤報による停止を避けるため、委託先の正式な回答を待つ。その間も接続は開いたまま。', effects: { visibility: 0, trust: -2, continuity: 0, containment: 0 }, feedback: '誤報による停止は避けられますが、調査待ちの時間にも影響は広がり得ます。「何が分かれば止めるか」の判断条件が必要でした。' },
    ],
  },
  {
    id: 'investigation', day: 3, time: '11:15', kicker: 'DAY 03 · 調査',
    title: '復旧を急ぐほど、消える手がかり。',
    message: '委託先から調査用ログが届いたが、情報はまだ断片的。現場は復旧を求め、技術担当は証拠の保全を求める。どこまでを確認し、何を残すかが、その後の説明を左右する。',
    sourceRole: '調査担当と生産部門の合同会議',
    evidence: [
      { label: 'ログの一部を受領した（架空設定）', status: 'confirmed' },
      { label: '不審なログが侵害に由来するか', status: 'unknown' },
      { label: 'ログが残っていない期間の安全性', status: 'unknown' },
    ],
    prompt: '証拠の保全と、いま必要な復旧をどう両立する？',
    choices: [
      { id: 'preserve-rebuild', title: '証拠を保全し、別環境で復旧する', description: '専門家とログ・イメージを保存。確認済みの環境を別に用意し、更新と復旧テストを進める。人手と時間が必要。', effects: { visibility: 20, trust: 5, continuity: -4, containment: 20, evidencePreserved: true, cleanEnvironment: true, patched: true }, feedback: '原因調査に必要な手がかりを残し、復旧先を分けました。更新は新たな悪用を防ぐ対策であり、過去の侵害を消すものではありません。' },
      { id: 'wipe-restart', title: '初期化して、早く再開する', description: '動かない環境を初期化して更新版を入れる。再開を急げる一方、保存しなかった証拠は失われる。', effects: { visibility: -12, trust: -3, continuity: 12, containment: 10, evidenceLost: true, patched: true }, feedback: '短期の再開は進みましたが、未保存のログや痕跡は取り戻せません。侵入時期や流出範囲を後から説明しにくくなります。' },
      { id: 'hold-original', title: '元の環境を保ち、調査を待つ', description: '変更を最小限にし、調査担当の到着を待つ。証拠は守りやすいが、復旧と代替運用の手配が遅れる。', effects: { visibility: 10, trust: 1, continuity: -8, containment: 8, evidencePreserved: true }, feedback: '証拠を残す判断はできました。調査を待つ間にも事業は続くため、復旧・代替運用を別の担当で動かす余地があります。' },
    ],
  },
  {
    id: 'communication', day: 7, time: '15:00', kicker: 'DAY 07 · 説明',
    title: '「分からない」を、どう伝える。',
    message: '顧客、従業員、取引先が説明を求めている。全部が判明する日はまだ見えない。調査で確認できたことと、未確認のことを分け、次の連絡時刻を決める必要がある。',
    sourceRole: '広報・顧客窓口・外部専門家',
    evidence: [
      { label: '顧客と取引先から説明を求められている', status: 'confirmed' },
      { label: '情報流出の有無・対象・全体の規模', status: 'unknown' },
      { label: '過去に不正アクセスがなかったこと', status: 'unknown' },
    ],
    prompt: '今日出す第一報には、何を書く？',
    choices: [
      { id: 'explain-uncertainty', title: '確認済み・未確認・次の更新を伝える', description: '判明した事実、調査中の範囲、影響への対応を公表。窓口と次の更新予定を示し、必要な報告は専門家と確認する。', effects: { visibility: 12, trust: 18, continuity: -2, containment: 0, transparent: true }, feedback: '未知を隠さず、判断できる情報を届けました。断定を避けても、誰が何をして次にいつ知らせるかは説明できます。' },
      { id: 'deny-leak', title: '「漏えいはない」と伝える', description: '現時点で流出の確証がないことから、安全を断言して安心を促す。後で事実が変われば訂正が必要になる。', effects: { visibility: -4, trust: -14, continuity: 2, containment: 0, prematureDenial: true }, feedback: '「確認できていない」と「ない」は異なります。判断根拠を超えた断定は、後の説明と信頼回復を難しくします。' },
      { id: 'wait-full-report', title: '全容が分かるまで発表を待つ', description: '誤った内容を出さないために正式報告を保留。個別窓口は維持するが、関係者は判断材料を得にくい。', effects: { visibility: 1, trust: -8, continuity: 0, containment: 0, communicationDelayed: true }, feedback: '誤情報を避ける意図はあっても、沈黙は相手の判断を止めます。調査の状況と次の更新時刻だけでも共有できました。' },
    ],
  },
  {
    id: 'recovery', day: 14, time: '17:40', kicker: 'DAY 14 · 葛藤',
    title: '「払えば戻る」は、約束になるか。',
    message: '攻撃者を名乗る相手から、復旧とデータ削除をうたう支払い要求が届いた。相手の主張は未確認。復旧の見通しを求める現場の声が強くなるなか、経営として方針を示す。',
    sourceRole: '危機対応会議・攻撃者を名乗る相手の主張',
    evidence: [
      { label: '復旧・削除をうたう要求が届いた（架空設定）', status: 'confirmed' },
      { label: '相手が主張するデータを実際に保有しているか', status: 'unknown' },
      { label: '支払いにより復旧・削除が実行されるか', status: 'unknown' },
    ],
    prompt: '支払いの約束と、検証できる復旧。何を軸にする？',
    choices: [
      { id: 'clean-recovery', title: '支払わず、検証した復旧を進める', description: '専門家・関係窓口に相談し、バックアップの安全性と復元を検証。重要な業務から段階的に戻す。復旧には時間がかかる。', effects: { visibility: 12, trust: 6, continuity: 15, containment: 25, cleanRecovery: true, patched: true }, feedback: '復旧の可否を、相手の約束ではなく検証に置きました。この演習ではテストを経た段階復旧が進みますが、実際の復旧期間を保証するものではありません。' },
      { id: 'pay-demand', title: '支払いを選び、交渉を進める', description: '早期復旧への期待から支払いを選ぶ。実行可能性や各種リスクを専門家と確認するが、復旧やデータ削除は保証されない。', effects: { visibility: 0, trust: -3, continuity: 0, containment: 0, paymentChosen: true }, feedback: '支払いは復旧の確約ではありません。この演習では復号・削除の成否を未確認のまま扱い、業務継続を自動的に回復させません。' },
      { id: 'parallel-recovery', title: '判断を保留し、代替業務を広げる', description: '要求の真正性や選択肢を専門家と確認しながら、手動受注と別経路の納品を拡大する。現場負荷が続く。', effects: { visibility: 5, trust: 2, continuity: 10, containment: 10, alternate: true, recoveryPending: true }, feedback: '不確かな要求と、いま継続できる業務を分けました。代替運用の持続可能性と、復旧を決める条件が次の課題です。' },
    ],
  },
  {
    id: 'reflection', day: 30, time: '09:00', kicker: 'DAY 30 · 振り返り',
    title: '空白を、次の備えに変える。',
    message: '30日間の経営判断を振り返る。結果だけでなく、その時点で分かっていたことと、分からなかったことを見る。委託先の確認、証拠の保全、説明の更新、検証できる復旧を、次の運用に残そう。',
    sourceRole: '経営会議・演習の振り返り',
    evidence: [
      { label: 'あなたが選んだ判断と、その時点の情報', status: 'confirmed' },
      { label: '実際の企業で同じ判断をした場合の結果', status: 'unknown' },
      { label: '見えない依存関係を事前に把握する価値', status: 'inferred' },
    ],
    prompt: '最初の1日に戻れるなら、何を変える？',
    choices: [],
  },
];

const INITIAL = Object.freeze({ containment: 0, visibility: 18, trust: 65, continuity: 100 });
const METRICS = ['containment', 'visibility', 'trust', 'continuity'];
const FLAGS = ['patched', 'inventory', 'isolated', 'restricted', 'alternate', 'evidencePreserved', 'cleanEnvironment', 'evidenceLost', 'transparent', 'prematureDenial', 'communicationDelayed', 'cleanRecovery', 'paymentChosen', 'recoveryPending'];
const NODE_ORDER = ['vendor', 'hq', 'factory', 'logistics', 'hospital', 'retail'];
const clamp = (value) => Math.max(0, Math.min(100, Math.round(value)));

export function createState() {
  return { stageIndex: 0, decisions: [], ...INITIAL };
}

// Read effects from the scenario, not from caller-modifiable history objects.
function validDecisions(state, throughDay = 30) {
  const seen = new Set();
  return (Array.isArray(state?.decisions) ? state.decisions : [])
    .map((decision) => {
      const stage = STAGES.find((item) => item.id === decision.stageId);
      const choice = stage?.choices.find((item) => item.id === decision.choiceId);
      if (!stage || !choice || stage.day > throughDay || seen.has(stage.id)) return null;
      seen.add(stage.id);
      return { stage, choice };
    })
    .filter(Boolean)
    .sort((a, b) => a.stage.day - b.stage.day);
}

function replay(decisions) {
  const values = { ...INITIAL };
  for (const flag of FLAGS) values[flag] = false;
  for (const { choice } of decisions) {
    for (const metric of METRICS) values[metric] = clamp(values[metric] + (choice.effects[metric] || 0));
    for (const flag of FLAGS) if (typeof choice.effects[flag] === 'boolean') values[flag] = choice.effects[flag];
  }
  return values;
}

export function choose(state, choiceId) {
  const stageIndex = Math.max(0, Math.min(STAGES.length - 1, state.stageIndex));
  const stage = STAGES[stageIndex];
  const choice = stage.choices.find((item) => item.id === choiceId);
  if (!choice) throw new RangeError(`Unknown choice for ${stage.id}: ${choiceId}`);
  const decisions = [...state.decisions.filter((item) => item.day < stage.day), {
    stageId: stage.id, day: stage.day, choiceId: choice.id, title: choice.title,
    effects: { ...choice.effects }, feedback: choice.feedback,
  }];
  return {
    stageIndex: Math.min(stageIndex + 1, STAGES.length - 1),
    decisions,
    ...replay(validDecisions({ decisions })),
  };
}

function stageAt(day) {
  return [...STAGES].reverse().find((stage) => stage.day <= day) || STAGES[0];
}

/** Historical snapshots replay only choices made on or before the selected day. */
export function snapshot(state, day = STAGES[state.stageIndex].day) {
  const selectedDay = Number.isFinite(Number(day)) ? Math.max(0, Math.min(30, Number(day))) : 0;
  const stage = stageAt(selectedDay);
  const decisions = validDecisions(state, selectedDay);
  const values = replay(decisions);
  const prevented = decisions.some(({ stage: item, choice }) => item.day === 0 && choice.id === 'verify-update');
  const isolation = decisions.find(({ choice }) => choice.effects.isolated);
  const incident = selectedDay >= 1 && !prevented;
  const elapsedIndex = STAGES.indexOf(stage);
  // These are teaching rules, not empirically estimated damage probabilities.
  const baseLoss = [0, 12, 26, 38, 45, 50][elapsedIndex];
  const reducedLoss = isolation ? baseLoss * (isolation.stage.day <= 1 ? 0.5 : 0.75) : values.restricted ? baseLoss * 0.78 : baseLoss;
  let continuity = values.continuity - (incident ? reducedLoss : 0);
  if (prevented && selectedDay >= 1) continuity += 6; // Scheduled maintenance ends.
  if (values.cleanRecovery && selectedDay >= 30) continuity += 24;
  const trust = clamp(values.trust - (incident ? reducedLoss * 0.18 : 0));
  const visibility = clamp(values.visibility);
  let impacted = [];
  if (incident) {
    let count = [0, 1, 3, 4, 6, 6][elapsedIndex];
    if (isolation && isolation.stage.day <= 1) count = Math.min(count, 2);
    else if (values.restricted) count = Math.min(count, 4);
    impacted = NODE_ORDER.slice(0, count);
    if (values.cleanRecovery && selectedDay >= 14) impacted = impacted.filter((id) => id !== 'vendor');
    if (values.cleanRecovery && selectedDay >= 30) impacted = [];
  }
  const evidence = stage.evidence.map((entry) => ({ ...entry }));
  if (values.evidencePreserved && selectedDay >= 3) evidence.push({ label: '調査用の証拠を保全した（あなたの判断）', status: 'confirmed' });
  if (values.evidenceLost && selectedDay >= 3) evidence.push({ label: '初期化前に保存しなかった証拠は調査できない', status: 'confirmed' });
  if (values.patched) evidence.push({ label: prevented ? '第一報より前に更新・再起動を確認した' : '更新済み。過去の侵害の有無は別に調査する', status: 'confirmed' });
  if (values.cleanRecovery && selectedDay >= 14) evidence.push({ label: '検証を経た段階復旧を進める（演習上の仮定）', status: 'inferred' });
  let summary;
  if (selectedDay < 1) summary = prevented ? '更新と稼働確認を完了。短い計画停止で、この演習の侵入経路を塞ぎました。' : '稼働は続いています。未修正の委託先と、その先の依存関係を確認する段階です。';
  else if (prevented) summary = '事前更新により、この演習で想定したPHP2Shellの侵入は発生しません。外部の通報や要求は、真偽を分けて確認します。';
  else if (values.cleanRecovery && selectedDay >= 30) summary = '演習上は段階復旧が完了。業務が戻っても、流出範囲の確認や関係者への説明は続きます。';
  else if (values.cleanRecovery) summary = '証拠を確認しながら段階復旧へ。業務の再開と、流出範囲の確定は別の課題です。';
  else if (values.paymentChosen) summary = '支払いを選択しましたが、復旧・削除の成否は未確認です。要求への対応だけでは、事業は自動的に回復しません。';
  else if (isolation) summary = '接続経由の拡大を抑えました。一方、委託先サービスの停止に伴う受発注への影響は残ります。';
  else summary = '未修正の委託先を起点とする仮想の影響が、接続と業務依存を通じて広がっています。流出範囲は未確認です。';
  let message = stage.message;
  if (prevented && stage.day === 1) message = '外部から疑わしいデータの通報が入った。ただし、委託先の更新と再起動は第一報より前に確認済み。この演習で想定したPHP2Shell経由の侵入は起きていない。通報自体の真偽と、別の原因の有無は切り分けて確認する。';
  if (prevented && stage.day === 3) message = '更新記録と稼働状況は確認できた。外部の通報について、証拠を残しながら調べる。脆弱性を修正した事実だけで、すべての別経路まで安全と断言することはできない。';
  if (prevented && stage.day === 14) message = '復旧とデータ削除をうたう要求が届いた。しかし、この演習のPHP2Shell経由の侵入は事前更新で防いでいる。要求の主張を事実として扱わず、専門家と真偽を確認する。以下は、実被害が発生した場合も含めた方針の検討。';
  return {
    day: selectedDay, visibility, trust, continuity: clamp(continuity), containment: values.containment,
    impacted, isolated: values.isolated, patched: values.patched, prevented, summary, message, evidence,
    indicatorNotice: INDICATOR_NOTICE,
  };
}

export function summarize(state) {
  const decisions = validDecisions(state);
  const values = replay(decisions);
  const final = snapshot(state, 30);
  const strengths = [];
  const opportunities = [];
  if (final.prevented) strengths.push('委託先の更新を完了まで確認し、想定した入口を事前に塞いだ。');
  else opportunities.push('委託先を含む利用製品の一覧と、更新完了を確認する担当・手順を決める。');
  if (values.inventory) strengths.push('取引とシステムの依存関係を、事業継続の課題として扱った。');
  if (values.isolated || values.restricted) strengths.push('確定情報が少ない段階で、影響のある接続を制限した。');
  else opportunities.push('確証を待つ場合も、隔離に切り替える条件と代替運用を決めておく。');
  if (values.evidencePreserved) strengths.push('復旧だけでなく、後の原因調査と説明のために証拠を残した。');
  else opportunities.push('初期化の前に、専門家と必要なログ・記録の保存を検討する。');
  if (values.transparent) strengths.push('確認済みの事実と不明点を分け、関係者が判断できる説明を選んだ。');
  else opportunities.push('「未確認」を「ない」と言い換えず、窓口と次の更新予定を伝える。');
  if (values.cleanRecovery) strengths.push('復旧を相手の約束に依存させず、検証と段階的な再開を選んだ。');
  if (values.paymentChosen) opportunities.push('支払いと、復旧・データ削除の実現は別。独立した復旧計画が必要。');
  if (!values.cleanRecovery && !final.prevented) opportunities.push('バックアップの存在だけでなく、安全な環境への復元と業務テストを確認する。');
  return {
    title: final.prevented ? '見えない入口に、先に手を打った。' : '不確実な30日を、判断の記録に。',
    summary: final.summary,
    strengths, opportunities,
    lessons: [
      '侵害の拡大と、サービス停止による業務の連鎖は別。接続を切っても依存は残る。',
      '更新は脆弱性への対策。過去の侵害調査、証拠保全、復旧は別に進める。',
      '分からないことを明示し、次に何を確認するかを伝えることも経営判断になる。',
    ],
    indicators: { visibility: final.visibility, trust: final.trust, continuity: final.continuity },
    decisions: decisions.map(({ stage, choice }) => ({ day: stage.day, title: choice.title, feedback: choice.feedback })),
    completed: decisions.length === STAGES.length - 1,
    disclaimer: `${INDICATOR_NOTICE} 企業、接続、被害の進行は架空です。参考にした実際の事件の原因をPHP2Shellとするものではありません。`,
  };
}
