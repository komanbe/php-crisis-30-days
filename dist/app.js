import { createScene } from './scene.js';
import { createFutureExperience } from './future.js';
import { CAST, crisisDialogue, crisisVoices, crisisVoiceFor } from './characters.js';
import { STAGES, createState, choose, snapshot, summarize, INDICATOR_NOTICE } from './scenario.js';
import { REFERENCES, PHP_INFO } from './references.js';

const $ = id => document.getElementById(id);
const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state = createState(), started = false, pending = false, viewDay = 0, perspective = 'observed', selected = null, rotating = false;
let playback = null, toastTimer, futureExperience = null, futureMode = false;
let playerName = '';
try { playerName = (localStorage.getItem('blindspot-player') || '').slice(0,16); } catch {}
const ordinaryHeading = document.querySelector('.atlas-heading').innerHTML;
const STORAGE = 'coworker-crisis-v1';
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE));
  if(saved?.version === 1 && Array.isArray(saved?.state?.decisions)) {
    let restored = createState();
    for (const d of saved.state.decisions) restored = choose(restored, d.choiceId);
    state = restored; started = !!saved.started; pending = !!saved.pending && state.decisions.length > 0;
    viewDay = Math.min(Number(saved.viewDay)||0,STAGES[state.stageIndex].day);
  }
} catch { /* Local persistence is optional. */ }
const save = () => {try{localStorage.setItem(STORAGE,JSON.stringify({version:1,state,started,pending,viewDay}));}catch{}};
const scene = createScene($('scene'), {onSelect: id => {selected = id; showNode(id); updateScene();}});
const labels = ['予兆','第一報','調査','説明','葛藤','振り返り'];
const stageIndexAt = day => STAGES.reduce((v,s,i)=>s.day<=day?i:v,0);
const activeIndex = () => pending ? Math.max(0,state.stageIndex-1) : state.stageIndex;
const maxDay = () => STAGES[activeIndex()].day;
const notify = message => {clearTimeout(toastTimer); $('toast').textContent=message;$('toast').classList.add('show');toastTimer=setTimeout(()=>$('toast').classList.remove('show'),4200);};
function updateScene(){
  if(futureMode)return;
  const snap=snapshot(state,viewDay);
  const dialogue=crisisDialogue(dialogueContext());
  scene.update({dialogue,futureMode:false,pressure:0,day:viewDay,visibility:perspective,impacted:snap.impacted,isolated:snap.isolated,patched:snap.patched,selected,layer:'all',prevented:snap.prevented});
  $('map-mode-label').textContent = !started ? '平常時のつながり' : perspective==='truth' ? '演習で仮定した全体像' : 'その時点で見えること';
  $('observed-view').classList.toggle('selected',perspective==='observed');
  $('truth-view').classList.toggle('selected',perspective==='truth');
  $('observed-view').setAttribute('aria-pressed',String(perspective==='observed'));
  $('truth-view').setAttribute('aria-pressed',String(perspective==='truth'));
  $('perspective-note').textContent = perspective==='truth' ? '全体像は演習上の仮定です。赤は侵害、橙は取引への影響。' : '拠点を選ぶと、PHP基盤とのつながりを確認できます。';
  if(selected)showNode(selected);
}
function renderTimeline(){
  $('day-value').textContent=String(viewDay).padStart(2,'0');
  const index = stageIndexAt(viewDay);
  $('track-progress').style.width=`${index/5*100}%`;
  $('track-progress').style.height=`${index/5*100}%`;
  $('timeline-stages').innerHTML=STAGES.map((s,i)=>`<button data-day="${s.day}" class="${i===index?'current':i<index?'past':''}" ${s.day>maxDay()?'disabled':''} aria-label="${s.day}日目 ${labels[i]}" ${i===index?'aria-current="step"':''}><span class="time-dot">${String(i+1).padStart(2,'0')}</span><span>${labels[i]}</span><span class="time-day">DAY ${String(s.day).padStart(2,'0')}</span></button>`).join('');
  $('timeline-stages').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{stopPlayback();viewDay=Number(b.dataset.day);render();save();}));
  $('timeline-range').max=maxDay();
  $('timeline-range').value=viewDay;
  $('play-timeline').disabled=!started||maxDay()===0;
  $('timeline-hint').textContent=state.stageIndex===5&&!pending?'日付を選んで、判断と影響を振り返る。再生ボタンで30日間をリプレイ。':'意思決定をすると時間が進みます。過去の日付に戻って振り返れます。';
}
const iconPerson=`<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.3"/><path d="M5 21v-2a7 7 0 0 1 14 0v2M9 15l3 3 3-3" stroke="currentColor" stroke-width="1.3"/></svg>`;
function dialogueContext(){
 const stage=STAGES[stageIndexAt(viewDay)];
 return {day:viewDay,started,pending,snapshot:snapshot(state,viewDay),decision:state.decisions.find(d=>d.stageId===stage.id)};
}
function avatarMarkup(person,mood='calm'){
 return `<span class="person-avatar mood-${mood}" style="--person:${person.color||'#b4a5ff'}" aria-hidden="true"><i class="avatar-head"></i><i class="avatar-body"></i><small>!</small></span>`;
}
function playerHUD(){
 const count=state.decisions.filter(d=>d.day<=viewDay).length;
 return `<div class="game-hud"><button class="player-chip" id="player-edit" aria-label="プレイヤー名を変更">${avatarMarkup({color:'#b4a5ff'})}<span><small>YOU / 社長</small><b>${escape(playerName||'あなた')}</b></span><span class="player-pencil">✎</span></button><div class="quest-status"><span>${count===5?'5つの判断を記録':'MISSION '+String(Math.min(activeIndex()+1,5)).padStart(2,'0')}<small> ${count} / 5</small></span><div class="quest-pips">${Array.from({length:5},(_,i)=>`<i class="${i<count?'done':''}"></i>`).join('')}</div></div><span class="game-label">STORY MODE</span></div>`;
}
function voicesMarkup(){
 return `<section class="field-voices" aria-label="演習内の架空の会話"><div class="field-voices-head"><span>現場の声</span><small>演習内の会話</small></div><div class="voice-grid">${[crisisDialogue(dialogueContext()),...crisisVoices(dialogueContext()).slice(0,2)].map(v=>`<article class="voice-card mood-${v.mood}">${avatarMarkup(CAST[v.nodeId],v.mood)}<div><div class="voice-person"><b>${escape(v.name)}</b><small>${escape(v.role)}</small></div><p>「${escape(v.text)}」</p></div></article>`).join('')}</div></section>`;
}
function editPlayer(){
 openModal('YOUR CHARACTER',`<h2>この会社の社長は、あなた。</h2><p>物語の中で使う名前を決められます。</p><label class="player-name-label">プレイヤー名<input id="edit-player-name" maxlength="16" value="${escape(playerName)}" placeholder="あなた" autocomplete="off"></label><button class="primary" id="save-player">この名前で続ける →</button><p class="small-note">名前はこのブラウザだけに保存します。</p>`);
 $('save-player').addEventListener('click',()=>{playerName=$('edit-player-name').value.trim().slice(0,16);try{localStorage.setItem('blindspot-player',playerName);}catch{}$('modal').close();render();});
}
function intro(){
 $('brief-content').innerHTML=`<div class="brief-top"><span class="chapter">PLAY AS THE CEO</span><span class="pill">5 MISSIONS · 約5分</span></div><p class="intro-copy">あなたは、部品メーカーの社長。<br>現場の声を聞き、会社の次の一手を決めよう。</p><div class="player-setup">${avatarMarkup({color:'#b4a5ff'})}<label><span>プレイヤー名 <small>任意</small></span><input id="player-name" maxlength="16" value="${escape(playerName)}" placeholder="あなた" autocomplete="off" aria-label="プレイヤー名"></label><span class="player-rank">CEO</span></div><button class="primary" id="start">社長として、判断を始める <span class="arrow">↗</span></button><button class="intro-future" id="intro-future">AI時代の、この先180日を見てみる →</button><p class="small-note">登場人物・会話・被害は、学習用の架空設定です。</p>`;
 $('player-name').addEventListener('input',e=>{playerName=e.target.value.trim().slice(0,16);try{localStorage.setItem('blindspot-player',playerName);}catch{}});
 $('intro-future').addEventListener('click',openFuture);
 $('start').addEventListener('click',()=>{started=true;render();save();$('briefing').scrollIntoView({behavior:'smooth',block:'nearest'});$('briefing').focus({preventScroll:true});});
}
function evidenceMarkup(entries){return `<div class="evidence">${entries.slice(0,4).map(e=>`<div><span class="tag ${escape(e.status)}">${({confirmed:'確認済',unknown:'未確認',inferred:'推定'})[e.status]||'情報'}</span><span>${escape(e.label)}</span></div>`).join('')}</div>`;}
function metricsMarkup(snap){return `<div class="metrics"><div class="metric"><small>状況の見通し</small><strong>${snap.visibility}<span>/ 100</span></strong><div class="meter"><span style="width:${snap.visibility}%"></span></div></div><div class="metric"><small>業務の継続</small><strong>${snap.continuity}<span>/ 100</span></strong><div class="meter"><span style="width:${snap.continuity}%"></span></div></div></div>`;}
function renderBrief(){
 if(!started){intro();return;}
 const idx=stageIndexAt(viewDay), stage=STAGES[idx], snap=snapshot(state,viewDay), decision=state.decisions.find(d=>d.stageId===stage.id);
 const historical=idx<activeIndex();
 if(idx===5&&!pending){renderResult();return;}
 const title=snap.prevented&&idx===4?'要求と事実を、切り分ける。':stage.title;
 const preventionNote=snap.prevented&&idx>=2?'<p class="prevention-note">事前更新で想定した侵入は防げています。以下は、被害が発生した場合にも備える対応方針として選んでください。</p>':'';
 $('brief-content').innerHTML=`${playerHUD()}${voicesMarkup()}<div class="decision-layout"><section class="brief-story"><div class="brief-top"><span class="chapter">DECISION <b>${String(idx+1).padStart(2,'0')} / 05</b></span><span class="pill">DAY ${String(viewDay).padStart(2,'0')} · ${escape(stage.time)}</span></div>${historical?'<div class="replay-banner">過去の判断と、その日に見えていた情報</div>':''}<h2 class="decision-title">${escape(title)}</h2><div class="message"><span class="sender">${escape(stage.sourceRole)}</span><p>${escape(snap.message||stage.message)}</p></div>${evidenceMarkup(snap.evidence||stage.evidence)}</section><section class="decision-options">${historical||pending?`${metricsMarkup(snap)}<div class="feedback"><span class="choice-locked">✓ 判断を記録</span><b>あなたの判断：${escape(decision?.title)}</b>${escape(decision?.feedback)}</div><p class="small-note">${escape(INDICATOR_NOTICE)}</p><button class="primary" id="advance">${historical?'現在の場面に戻る':idx===4?'30日後を振り返る':'次の場面へ'} <span class="arrow">→</span></button>`:`<p class="eyebrow action-label">MAKE YOUR CALL</p><p class="question">${escape(stage.prompt)}</p>${preventionNote}<div class="choices">${stage.choices.map((c,i)=>`<button class="choice" data-choice="${escape(c.id)}"><span class="choice-code">${'ABC'[i]}</span><span><b>${escape(c.title)}</b><small>${escape(c.description)}</small></span><span class="choice-arrow">↗</span></button>`).join('')}</div>`}</section></div>`;
 $('player-edit').addEventListener('click',editPlayer);
 if(historical||pending)$('advance').addEventListener('click',()=>{if(!historical)pending=false;viewDay=STAGES[activeIndex()].day;stopPlayback();render();save();});
 else $('brief-content').querySelectorAll('[data-choice]').forEach(b=>b.addEventListener('click',()=>{state=choose(state,b.dataset.choice);pending=true;render();save();}));
}
function renderResult(){
 const result=summarize(state),snap=snapshot(state,30);
 $('brief-content').innerHTML=`<div class="brief-top"><span class="chapter">AFTER ACTION <b> / DAY 30</b></span><span class="result-badge">演習完了</span></div><h2 class="decision-title">見えていたら、<br>変えられた未来。</h2><p class="review-note">${escape(result.summary)}</p>${metricsMarkup(snap)}<p class="question">あなたの判断から</p><ul class="result-list">${[...result.strengths.slice(0,2),...result.opportunities.slice(0,2)].map(x=>`<li>${escape(x)}</li>`).join('')}</ul><div class="result-actions"><button class="primary" id="comparison-open">もうひとつの未来を見る <span class="arrow">↗</span></button><button class="secondary" id="result-future">次のステージ：この先180日へ →</button><button class="secondary" id="report-download">意思決定の記録を保存 ↓</button><button class="text-button" id="retry">違う判断で、もう一度体験する ↺</button></div><p class="small-note">${escape(INDICATOR_NOTICE)}</p>`;
 $('result-future').addEventListener('click',openFuture);
 $('comparison-open').addEventListener('click',openComparison);
 $('report-download').addEventListener('click',downloadReport);
 $('retry').addEventListener('click',reset);
}
function render(){if(futureMode)return;document.body.classList.toggle('mode-intro',!started);document.body.classList.toggle('mode-active',started);document.body.classList.toggle('mode-result',started&&stageIndexAt(viewDay)===5&&!pending);updateScene();renderTimeline();renderBrief();}
function resetRotation(){rotating=false;$('rotate').setAttribute('aria-pressed','false');$('rotate').setAttribute('aria-label','自動回転を開始');}
function reset(){if(futureMode)closeFuture();stopPlayback();resetRotation();state=createState();started=false;pending=false;viewDay=0;perspective='observed';selected=null;$('node-detail').hidden=true;scene.reset();render();save();window.scrollTo({top:0,behavior:'smooth'});notify('新しい30日間を始められます。');}
function stopPlayback(){clearInterval(playback);playback=null;$('play-timeline').textContent='▶';$('play-timeline').setAttribute('aria-label','時間軸を再生');}
function startPlayback(){if(playback){stopPlayback();return;}if(maxDay()===0)return;viewDay=0;render();$('play-timeline').textContent='Ⅱ';$('play-timeline').setAttribute('aria-label','時間軸を一時停止');playback=setInterval(()=>{viewDay=Math.min(viewDay+1,maxDay());render();if(viewDay>=maxDay())stopPlayback();},1100);}
const nodes={
 vendor:{name:'委託先 Webサービス',role:'取引先の受発注をつなぐWeb基盤。演習開始時はPHP 8.3.35 / Apache mod_phpを利用。更新担当と確認方法が重要です。',link:'PHP基盤 → 受発注 → 自社の生産計画'},
 hq:{name:'東都精機 本社',role:'あなたが経営する架空の部品メーカー。受注情報と出荷指示を扱います。社外サービスへの依存が事業の継続を左右します。',link:'委託先との接続には権限・分離の確認が必要'},
 factory:{name:'部品製造工場',role:'本社からの生産指示で部品を製造。システムが感染していなくても、受注や指示が途絶えると業務に影響します。',link:'受注情報 → 生産計画 → 製造'},
 logistics:{name:'物流センター',role:'製品の保管・出荷を担う拠点。出荷指示の停止は、その先の複数の企業に届きます。感染と業務停止は別の現象です。',link:'出荷指示 → 配送 → 顧客企業'},
 hospital:{name:'医療機関',role:'製品の供給を受ける架空の取引先。図の橙色は供給の遅れを示し、院内ネットワークへの侵入を意味しません。',link:'納入遅延 → 調達・現場業務への影響'},
 retail:{name:'販売店・顧客',role:'製品を必要とする取引先とその顧客。遠い企業のシステム障害でも、納期や在庫に影響が届くことがあります。',link:'入荷遅延 → 在庫不足 → 顧客への説明'}
};
function showNode(id){let n=nodes[id];if(!n)return;if(futureMode&&id==='vendor')n={name:'共通ソフトウェア基盤',role:'PHPを含む共通のソフトウェアを、複数のサービスが使う場面です。新たな課題が届くたびに、影響範囲の確認と更新の判断が続きます。',link:'同じ課題に対して、対応計画を比較しています。'};if(futureMode&&id==='hospital')n={name:'医療機関の調達',role:'医療機関の調達担当も、取引先のサービスや納品予定を確認する場面を想定しています。橙は更新対応の負荷を表し、実際の納入遅延や院内への侵入を示しません。',link:'取引先の状況確認 → 調達の段取り・連絡'};const snap=snapshot(state,viewDay);const person=CAST[id], voice=futureMode?{text:'更新の確認が、私たちの仕事にもつながっています。どんな計画なら続けられるか、一緒に考えたいです。',mood:'calm'}:crisisVoiceFor(id,dialogueContext());$('node-detail').hidden=false;$('node-detail').innerHTML=`<div class="node-head"><span class="node-person">${avatarMarkup(person,voice.mood)}<span><b>${escape(person.name)}</b><small>${escape(person.role)}</small></span></span><button id="close-node" aria-label="拠点の説明を閉じる">×</button></div><p class="node-quote">「${escape(voice.text)}」</p><b class="node-place">${escape(n.name)}</b><p>${escape(n.role)}</p><div class="node-status">${futureMode?'橙は架空の対応負荷。侵害の予測ではありません。':snap.impacted.includes(id)?'● 演習上の業務影響あり':'○ '+(id==='vendor'&&snap.patched?'更新確認済み':'業務影響は表示されていません')}</div><p>${escape(n.link)}</p>`;$('close-node').addEventListener('click',()=>{selected=null;$('node-detail').hidden=true;updateScene();});}
function openModal(kicker,html){stopPlayback();futureExperience?.pause();$('modal-kicker').textContent=kicker;$('modal-body').innerHTML=html;$('modal').showModal();$('modal').scrollTop=0;}
function openFuture(initialState){
 if(initialState instanceof Event)initialState=undefined;
 if(futureMode){$('briefing').scrollIntoView({behavior:'smooth'});return;}
 stopPlayback();futureMode=true;history.replaceState(null,'','#future');selected=null;$('node-detail').hidden=true;
 document.body.classList.remove('mode-intro','mode-active','mode-result');document.body.classList.add('mode-future');
 $('future-open').classList.add('active');$('exercise-nav').classList.remove('active');
 document.querySelector('.atlas-heading').innerHTML='<p class="eyebrow"><span class="short-line"></span> AFTER PHP2SHELL</p><h1>その先の、<br><span>180</span>日を想像する。</h1><p class="subtitle">発見が増える。更新が続く。<br>社会を支える企業は、ついていけるか。</p><p class="future-scene-note">橙は対応負荷の表現。侵害の予測ではありません。</p>';
 $('map-mode-label').textContent='共通基盤と更新の負荷 / 架空の将来';
 futureExperience=createFutureExperience($('brief-content'),{initialState,onStateChange:()=>{},onSceneUpdate:data=>{scene.update({...data,isolated:false});if(data.dialogue)$('map-mode-label').textContent=(data.plan==='prepared'?'備えた会社':'あなたの会社')+' / '+data.dialogue.stamp;},onClose:closeFuture});
 window.scrollTo({top:0,behavior:'smooth'});
}
function closeFuture(){
 futureExperience?.dispose();futureExperience=null;futureMode=false;history.replaceState(null,'',location.pathname+location.search);document.body.classList.remove('mode-future');
 document.querySelector('.atlas-heading').innerHTML=ordinaryHeading;
 $('future-open').classList.remove('active');$('exercise-nav').classList.add('active');
 render();window.scrollTo({top:0,behavior:'smooth'});
}
function openPHP(){openModal('UNDERSTAND THE MECHANISM',`<h2>ひとつの脆弱性が、<br>なぜ自社の問題になるのか。</h2><p>Webサービスを動かすPHP。その処理の不具合が、認証なしでのコード実行につながる可能性があります。委託先の基盤でも、受注や物流を支えていれば、自社の経営に関わります。</p><div class="chip-list">${PHP_INFO.cves.map(x=>`<span>${escape(x)}</span>`).join('')}<span>2026.10.21 公開</span></div><div class="flow-diagram"><div>PHPの脆弱性<small>共通のソフトウェア</small></div><span>→</span><div>委託先の停止<small>サービスへの依存</small></div><span>→</span><div>自社・社会の影響<small>受注・製造・配送</small></div></div><h3>この演習では、PHP 8.3.35 → 8.3.36 を使用</h3><p>Apache mod_phpを利用する架空の委託先を設定しています。実物の脆弱なPHPや攻撃コードは実行しません。</p><table class="version-table"><thead><tr><th>系列</th><th>影響範囲</th><th>修正版</th></tr></thead><tbody>${PHP_INFO.versions.map(v=>`<tr><td>${escape(v.branch)}</td><td>${escape(v.affected)}</td><td>${escape(v.fixed)}</td></tr>`).join('')}</tbody></table><ul>${PHP_INFO.conditions.map(x=>`<li>${escape(x)}</li>`).join('')}</ul><div class="notice">このマップは、業務のつながりを可視化した概念図です。赤い侵害経路は「接続権限があり、分離が不十分」という演習上の追加仮定。取引があるだけで、感染するわけではありません。${escape(PHP_INFO.disclaimer)}</div><p>${PHP_INFO.sources.map(s=>`<a href="${escape(s.url)}" target="_blank" rel="noopener noreferrer">${escape(s.name)} ↗</a>`).join('　')}</p>`);}
function openSources(){openModal('LEARNING FROM REAL INCIDENTS',`<h2>現実の出来事から、学ぶ。</h2><p>入口は違っても、経営が直面する「見えない時間」は共通します。ここでは各組織が公表した資料から、意思決定につながる教訓を読みます。</p><div class="notice">以下の事件をPHP2Shellによる事件として紹介しているわけではありません。事実と、この教材での学習ポイントを分けて記載しています。</div><div class="source-grid">${REFERENCES.filter(r=>r.type==='incident').map(r=>`<article class="source-card"><small>${escape(r.date)}</small><h3>${escape(r.name)}</h3><p>${escape(r.body)}</p><div class="lesson">${escape(r.lesson)}</div><a href="${escape(r.url)}" target="_blank" rel="noopener noreferrer">公式資料を読む ↗</a></article>`).join('')}</div><h3>AIと脆弱性研究の、確認できる現在</h3><p>Wiz ResearchはPHP2Shellの研究でWiz Atlas、Gemini 4 Argon、GPT-5.6 Solを使用したと公表しています。PHP Foundationは、根本問題の兆候は2024年に把握され、2026年の研究者の報告で影響が明確になったと説明しています。</p><p><a href="https://www.wiz.io/blog/php2shell-php-rce" target="_blank" rel="noopener noreferrer">Wiz Research ↗</a>　<a href="https://thephp.foundation/blog/2026/10/21/todays-php-security-release-and-how-were-strengthening-php-security/" target="_blank" rel="noopener noreferrer">PHP Foundation ↗</a></p><div class="notice">180日モードの発見数と業務の場面は架空の設定です。「半年で収束する」「特定の企業が倒産する」という予測を事実として採用していません。発見が増える・一定・落ち着く、の3つの仮定を比較できます。</div><h3>議論・伝え方の参考</h3><p><a href="https://x.com/hjkworld_ai/status/2113104893905170479" target="_blank" rel="noopener noreferrer">可視化の投稿 ↗</a>　<a href="https://x.com/TGLetter/status/2113151811133522221" target="_blank" rel="noopener noreferrer">波及を考える投稿 ↗</a>　<a href="https://x.com/Sokichi_Hoshino/status/2113030266155639205" target="_blank" rel="noopener noreferrer">PHPの解説 ↗</a></p><p>投稿は議論と表現の参考です。投稿内の数値や将来予測を、この教材の観測データとしては使用していません。</p><h3>空間表現の参考プロトタイプ</h3><p><a href="https://wtnv-lab.github.io/coworker-forensic-atlas/" target="_blank" rel="noopener noreferrer">時空間フォレンジック ↗</a>　<a href="https://wtnv-lab.github.io/saganoseki_fire/" target="_blank" rel="noopener noreferrer">佐賀関大規模火災 ↗</a>　<a href="https://wtnv-lab.github.io/hiroshima-archive-navara/" target="_blank" rel="noopener noreferrer">ヒロシマ・アーカイブ ↗</a></p>`);}
function openComparison(){
 const actual=snapshot(state,30);let prepared=createState();['verify-update','contain-now','preserve-rebuild','explain-uncertainty','clean-recovery'].forEach(id=>prepared=choose(prepared,id));const alternative=snapshot(prepared,30);
 openModal('A DIFFERENT FIRST DAY',`<h2>最初の判断が、<br>その先の景色を変える。</h2><p>同じ仮想モデルで、あなたの経路と「事前更新・証拠保全・段階復旧」を選んだ経路を比較します。現実の効果を予測する比較ではありません。</p><table class="version-table"><thead><tr><th>30日目の学習指標</th><th>あなたの判断</th><th>備えた場合の例</th></tr></thead><tbody><tr><td>状況の見通し</td><td>${actual.visibility} / 100</td><td>${alternative.visibility} / 100</td></tr><tr><td>業務の継続</td><td>${actual.continuity} / 100</td><td>${alternative.continuity} / 100</td></tr><tr><td>想定した初期侵入</td><td>${actual.prevented?'事前更新で予防':'発生した仮定'}</td><td>事前更新で予防</td></tr></tbody></table><h3>次の会議で、確認したい3つのこと</h3><ul><li>受注・生産・物流は、どの委託先や共通基盤に依存しているか。</li><li>ログを誰が、どこに、どの期間残し、いざという時に読めるか。</li><li>原因不明でも、誰が接続停止・代替運用・第一報を判断できるか。</li></ul><div class="notice">${escape(INDICATOR_NOTICE)} 修正後も、すでに起きた侵害の確認は必要です。</div>`);
}
function downloadReport(){const r=summarize(state);const text=`空白の30日間 — 意思決定の記録\nTHE BLIND SPOT / PHP2Shell Edition\n\n${INDICATOR_NOTICE}\n\n${r.title}\n${r.summary}\n\n${state.decisions.map(d=>`DAY ${d.day}: ${d.title}\n${d.feedback}`).join('\n\n')}\n\n学び\n${r.lessons.join('\n')}\n\n情報確認日: 2026-10-23\nPHP公式: https://www.php.net/archive/2026.php#2026-10-21-5\n`;const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='空白の30日間_意思決定の記録.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('意思決定の記録を保存しました。');}
$('future-open').addEventListener('click',openFuture);
$('php-open').addEventListener('click',openPHP);$('sources-open').addEventListener('click',openSources);
$('help-open').addEventListener('click',()=>openModal('HOW TO EXPLORE',`<h2>見る。判断する。振り返る。</h2><ul><li>「社長として、判断を始める」から、社長として5つの意思決定を行います。</li><li>拠点を選ぶと役割を表示。ドラッグで回転、ホイールで拡大縮小できます。</li><li>「社長に見えること」は観測された業務影響。「仮定した全体像」は演習で仮定した侵害経路も表示します。</li><li>時間軸の丸い番号から、経験した日付に戻れます。キーボードでもTabとEnterで操作できます。</li><li>進捗はこのブラウザに自動保存。30日後には判断の記録をダウンロードできます。</li></ul><div class="notice">企業・配置・時間経過・指標は架空です。法的な報告期限や実際の対策判断は、個別の状況に応じて専門家と確認してください。</div>`));
$('modal-close').addEventListener('click',()=>$('modal').close());$('modal').addEventListener('click',e=>{if(e.target===$('modal')){const r=$('modal').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('modal').close();}});
$('exercise-nav').addEventListener('click',()=>{if(futureMode)closeFuture();$('modal').close();$('briefing').scrollIntoView({behavior:'smooth',block:'nearest'});});
$('observed-view').addEventListener('click',()=>{perspective='observed';updateScene();});$('truth-view').addEventListener('click',()=>{perspective='truth';updateScene();notify('赤い経路は、接続・権限の不備を追加した仮定です。');});
$('zoom-in').addEventListener('click',()=>scene.zoom(1));$('zoom-out').addEventListener('click',()=>scene.zoom(-1));$('reset-view').addEventListener('click',()=>{scene.reset();resetRotation();});
$('rotate').addEventListener('click',()=>{rotating=!rotating;scene.setRotate(rotating);$('rotate').setAttribute('aria-pressed',String(rotating));$('rotate').setAttribute('aria-label',rotating?'自動回転を停止':'自動回転を開始');});
$('restart').addEventListener('click',reset);$('play-timeline').addEventListener('click',startPlayback);$('timeline-range').addEventListener('input',e=>{stopPlayback();viewDay=Number(e.target.value);render();save();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPlayback();});
render();
if(location.hash==='#future')openFuture();
