import { createScene, portraitSVG } from './scene.js?v=story-1';
import { CAST } from './characters.js';
import { STORIES, createStory, getFrame, advanceStory } from './story-data.js?v=story-1';
import { PHP_INFO, REFERENCES } from './references.js';

const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const STORAGE = 'blindspot-story-v1';
let screen = 'title', state = null, actions = [], saved = {};
try { const raw = JSON.parse(localStorage.getItem(STORAGE)); if(raw && typeof raw === 'object') saved = raw; } catch {}
const scene = createScene($('scene'), {onSelect:()=>{}});
scene.setStoryMode?.(true);
function persist(){ if(!state)return; saved[state.storyId] = actions; try{localStorage.setItem(STORAGE,JSON.stringify(saved));}catch{} }
function restore(id){
 let result = createStory(id), history = [];
 try { for(const action of (Array.isArray(saved[id])?saved[id]:[]).slice(0,60)){ result=advanceStory(result,action||undefined);history.push(action); } }catch{}
 return {state:result,actions:history};
}
function person(id,mood='calm'){
 const p=CAST[id]||{name:'物語',role:'ナレーション',color:'#baa5ff'};
 return `<span class="avatar" style="--person:${p.color}" aria-hidden="true">${id?portraitSVG(id,mood):'<i class="avatar-head"></i><i class="avatar-body"></i>'}</span>`;
}
function setScreen(next){screen=next;document.body.dataset.screen=next;scene.setRotate(next==='title');$('story-root').removeAttribute('aria-busy');}
function focusFrame(){
 requestAnimationFrame(()=>{
  const heading=$('story-root').querySelector('h1');
  if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}
  window.scrollTo({top:0,behavior:'instant'});
  reserveScene();
 });
}
function reserveScene(){
 const dock=$('story-root').querySelector('.dialogue-dock');
 const panel=dock?.querySelector('.php-explainer, .dialogue-panel');
 const bounds=$('scene').getBoundingClientRect();
 const overlap=panel?Math.max(0,bounds.bottom-panel.getBoundingClientRect().top+20):0;
 $('scene').style.setProperty('--story-scene-bottom',`${Math.ceil(overlap)}px`);
}
new ResizeObserver(reserveScene).observe($('story-root'));
window.addEventListener('resize',reserveScene);
function title(){
 setScreen('title');$('chapter-label').textContent='あなたの選択で、物語が変わる。';
 scene.update({isolated:false,pressure:0,layer:'all',day:0,futureMode:false,impacted:[],patched:false,prevented:false,selected:null,dialogue:null,visibility:'observed'});scene.focusStory?.(null);
 $('story-root').innerHTML=`<section class="title-screen"><p class="film-kicker">A PHP2SHELL STORY</p><h1 class="film-title">ひとつの更新が、<br>誰かの明日を変える。</h1><p class="film-subtitle">PHPの脆弱性。止まる受注、その先の暮らし。<br>あなたの判断で、物語の結末が変わる。</p><div class="film-meta"><span>2つの物語</span><span>1話 約5分</span><span>3つの分岐</span></div><button class="primary" id="begin">開始する <span aria-hidden="true">▶</span></button><p class="fiction-note">PHPの脆弱性を題材にした、学習用フィクション。</p></section>`;
 reserveScene();
}
function library(){
 setScreen('library');$('chapter-label').textContent='STORY SELECT';scene.focusStory?.(null);
 scene.update({isolated:false,pressure:0,layer:'all',day:0,impacted:[],patched:false,prevented:false,dialogue:null,futureMode:false,selected:null});
 $('story-root').innerHTML=`<section class="story-library"><p class="section-kicker">CHOOSE YOUR STORY</p><h1>どの物語を、体験する？</h1><p>会話は「次へ」で。大事な場面だけ、あなたが決める。</p><div class="story-cards">${STORIES.map((s,i)=>{
 const previous=restore(s.id);const continuing=previous.actions.length>0&&getFrame(previous.state).kind!=='ending';
 return `<button class="story-card" data-story="${esc(s.id)}"><span class="story-number">STORY ${String(i+1).padStart(2,'0')}</span><span class="story-card-role">${esc(s.role)}</span><span class="story-card-title">${esc(s.title)}</span><span class="story-card-desc">${esc(s.description||s.subtitle)}</span><span class="story-card-footer"><small>${esc(s.duration||'約5分')} · 3つの分岐</small><b>${continuing?'続きから体験する':'この物語を始める'} →</b></span></button>`;
 }).join('')}</div><button class="text-button" id="library-back">← タイトルへ</button></section>`;
 focusFrame();
}
function start(id,restart=false){
 if(restart){state=createStory(id);actions=[];}else{const restored=restore(id);state=restored.state;actions=restored.actions;if(getFrame(state).kind==='ending'){state=createStory(id);actions=[];}}
 persist();renderFrame();
}
function phpMarkup(info){if(!info)return '';return `<aside class="php-explainer" aria-label="PHPのポイント"><span class="php-label">${esc(info.label)}</span><div class="php-flow"><b>${esc(info.before)}</b><span class="php-arrow" aria-hidden="true">→</span><b>${esc(info.after)}</b></div><p>${esc(info.note)}</p></aside>`;}
function renderFrame(){
 const f=getFrame(state); if(f.kind==='ending'){renderEnding(f);return;}
 setScreen('playing');$('chapter-label').textContent=STORIES.find(s=>s.id===state.storyId)?.title||'';
 document.body.dataset.mood=f.mood||'calm';
 scene.update({...f.scene,visibility:'observed',dialogue:null,selected:f.speaker||null});scene.focusStory?.(f.speaker||null);
 const p=CAST[f.speaker];
 $('story-root').innerHTML=`<section class="play-screen"><div class="scene-heading"><span class="scene-chapter">${esc(f.chapter)}</span><h1 id="scene-title">${esc(f.title)}</h1><p class="scene-context">${esc(f.context)}</p></div><div class="scene-stamp"><span>DAY ${String(f.day).padStart(2,'0')}</span><small>${esc(f.time)}</small></div><div class="dialogue-dock">${phpMarkup(f.php)}<article class="dialogue-panel"><div class="speaker-row">${person(f.speaker,f.mood)}<div class="speaker-info"><b>${esc(p?.name||'STORY')}</b><small>${esc(p?.role||'物語の案内')}</small></div><span class="mood-label">${f.kind==='choice'?'あなたの判断':f.mood==='alert'?'現場からの声':f.mood==='relief'?'少し、前へ':'STORY'}</span></div><p class="dialogue-text">${esc(f.text)}</p>${f.kind==='choice'?`<div class="story-choices">${f.choices.map((c,i)=>`<button class="story-choice" data-choice="${esc(c.id)}"><small>${'AB'[i]}</small><span><b>${esc(c.label)}</b><span>${esc(c.description)}</span></span><span aria-hidden="true">→</span></button>`).join('')}</div>`:`<div class="dialogue-actions"><span class="chapter-dots" aria-label="${state.decisions.length}回の判断を記録">${Array.from({length:3},(_,i)=>`<i class="${i<state.decisions.length?'done':''}"></i>`).join('')}</span><button class="next-button" id="story-next">${esc(f.nextLabel||'次へ')} <span aria-hidden="true">→</span></button></div>`}</article><p class="story-disclaimer">登場人物と展開は架空です。${f.scene?.futureMode?'今後の出来事を予測するものではありません。':'橙色は業務への影響。取引先への自動感染ではありません。'}</p></div></section>`;
 focusFrame();
}
function renderEnding(f){
 setScreen('ending');$('chapter-label').textContent='EPILOGUE / あなたの選択の、その先';
 scene.update({...f.scene,visibility:'observed',dialogue:null,selected:null});scene.focusStory?.(null);
 const e=f.ending;
 const status={affected:'影響が届いた',protected:'守れた日常',burden:'負担が残った'};
 $('story-root').innerHTML=`<section class="ending-screen"><p class="section-kicker">YOUR STORY / DAY ${f.day}</p><h1>${esc(e.title)}</h1><p class="ending-summary">${esc(e.summary)}</p><div class="impact-chain" aria-label="仕事と暮らしへの影響のつながり">${e.chain.map((n,i)=>`<div class="chain-stop"><span>${String(i+1).padStart(2,'0')}</span><b>${esc(n.label)}</b><small>${esc(n.detail)}</small></div>`).join('')}</div><div class="impact-grid">${e.impacts.map(i=>`<article class="impact-card" data-status="${esc(i.status)}"><div class="impact-person">${person(i.nodeId,i.status==='protected'?'relief':i.status==='affected'?'alert':'calm')}<div><b>${esc(CAST[i.nodeId].name)}</b><small>${esc(CAST[i.nodeId].role)}</small></div><span class="impact-status">${status[i.status]}</span></div><h3>${esc(i.title)}</h3><p>${esc(i.text)}</p><blockquote>「${esc(i.quote)}」</blockquote></article>`).join('')}</div><section class="ending-learning"><h2>あなたの判断が、誰かの時間になる。</h2><p>${esc(e.lesson)}</p></section><details class="decision-record"><summary>あなたが選んだ、3つの判断</summary><ol>${e.decisions.map(d=>`<li><b>${esc(d.label)}</b><p>${esc(d.result)}</p></li>`).join('')}</ol></details><div class="ending-actions"><button class="primary" id="another-story">もうひとつの物語へ →</button><button class="secondary" id="replay-story">違う選択で、もう一度</button></div><p class="ending-fiction">この結末は選択に応じた学習用の仮定です。実際の被害・対策効果・未来の予測ではありません。<br>PHPを更新しても、過去の侵害の確認は別に必要です。<button class="text-button" data-sources>PHPの解説・参考資料を読む ↗</button></p></section>`;
 focusFrame();
}
function next(choice){
 const nextState=advanceStory(state,choice);state=nextState;actions.push(choice||null);persist();renderFrame();
}
function modal(title,html){$('modal-title').textContent=title;$('modal-content').innerHTML=html;if(!$('story-modal').open)$('story-modal').showModal();}
function showMenu(){modal('物語のメニュー',`<p>進んだ場面は、このブラウザに自動で保存しています。</p><div class="modal-actions"><button class="primary" data-close>物語に戻る →</button><button class="secondary" data-sources>PHPの解説・参考資料</button><button class="text-button" id="menu-title">タイトルに戻る</button></div>`);}
function sources(){
 modal('PHPから、暮らしまで。',`<p>PHPは、Webサイトやサービスを裏側で動かすためのプログラミング言語です。この物語では、注文を受け付ける委託先のサービスで使われています。</p><h3>PHP2Shellとは？</h3><p>PHPの処理に見つかった脆弱性です。条件によっては、ログインしていない第三者がPHPを動かすプロセスの権限でコードを実行できる可能性があります。</p><p>物語で使うのは <strong>PHP 8.3.35 / Apache mod_php</strong> の架空の環境。8.3系の修正版は <strong>8.3.36</strong> です。更新の依頼だけでなく、反映・再起動・稼働まで確認する場面を描いています。</p><p>${PHP_INFO.cves.map(esc).join(' / ')}<br>公開日：2026年10月21日 / 教材の情報確認：2026年10月23日</p><ul>${PHP_INFO.sources.map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.name)} ↗</a></li>`).join('')}</ul><h3>なぜ、工場や配送の人が困る？</h3><p>注文が届かないと、何を作り、どこへ届けるかを決められません。ここで追うのは、仕事のつながりによる影響です。取引があるだけで他社にも自動で感染する、という意味ではありません。</p><h3>もうひとつの物語について</h3><p>「更新が、終わらない世界」は、PHPを更新したあとも別の対応が続く架空の180日間です。発見数や半年後の状況を予測していません。AIが脆弱性研究で使われている背景は、<a href="https://www.wiz.io/blog/php2shell-php-rce" target="_blank" rel="noopener noreferrer">Wiz Research</a> と <a href="https://thephp.foundation/blog/2026/10/21/todays-php-security-release-and-how-were-strengthening-php-security/" target="_blank" rel="noopener noreferrer">PHP Foundation</a> の公表資料を参照しています。</p><h3>実際の事件から学ぶ</h3><p>以下は業務への波及や備えを考える参考です。PHP2Shellが原因だったという事例ではありません。</p>${REFERENCES.filter(r=>r.type==='incident').map(r=>`<details><summary>${esc(r.name)}</summary><p>${esc(r.body)}</p><p>${esc(r.lesson)}</p><a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">公式資料 ↗</a></details>`).join('')}<p>登場人物・会社・会話・分岐・結末は架空です。回答はこのブラウザ内だけに保存されます。</p><button class="primary" data-close>物語に戻る →</button>`);
}
$('story-root').addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.id==='begin')library();else if(b.id==='library-back')title();else if(b.dataset.story)start(b.dataset.story);else if(b.id==='story-next')next();else if(b.dataset.choice)next(b.dataset.choice);else if(b.id==='another-story')library();else if(b.id==='replay-story')start(state.storyId,true);else if(b.hasAttribute('data-sources'))sources();
});
$('story-menu').addEventListener('click',showMenu);$('modal-close').addEventListener('click',()=>$('story-modal').close());
$('modal-content').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-close'))$('story-modal').close();else if(b.hasAttribute('data-sources'))sources();else if(b.id==='menu-title'){$('story-modal').close();title();}});
$('story-modal').addEventListener('click',e=>{if(e.target===$('story-modal')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
// Earlier links ending in #future now arrive at the same cinematic opening.
// The visitor explicitly chooses a story instead of entering a dashboard.
title();
