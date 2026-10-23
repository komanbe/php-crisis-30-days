/** Playable roles. These people and their missions belong to the fictional story. */
export const PLAYERS = Object.freeze({
  crisis: Object.freeze({
    id: 'president',
    role: '社長',
    english: 'PRESIDENT',
    color: '#e6c49a',
    identity: '東都精機 / 会社代表',
    tagline: 'ひとつの決断で、仕事と暮らしをつなぐ。',
    roleTitle: 'あなたは、社長。',
    roleText: 'あなたは、日用品を受発注する会社「東都精機」の社長。\n工場や配送会社と協力し、商品を必要な人へ届けています。',
    roleObjective: '現場の声を聞き、会社の次の一手を決める。',
    missionTitle: '守るのは、画面の向こうの毎日。',
    missionText: '注文の受付を支えるのは、PHPで動く委託先のWebサービス。\nここが止まると、工場や配送、商品を待つ人にも影響が届きます。',
    missionObjective: '受注をつなぎ、その先にいる人たちの日常を守る。',
    firstAction: '最初の報告を受け取る',
  }),
  updates: Object.freeze({
    id: 'leader',
    role: '情シスリーダー',
    english: 'IT LEADER',
    color: '#b5a5f7',
    identity: '東都精機 / 更新・運用チーム',
    tagline: '「あの人しかできない」を、チームで変える。',
    roleTitle: '更新チームを、率いる。',
    roleText: 'あなたは、東都精機の情シスリーダー。\nミオの上司として、一緒に働く仲間とサービスの運用を支えています。',
    roleObjective: '担当者が抱え込まず、更新を続けられる体制をつくる。',
    missionTitle: '一度の更新を、続けられる仕事へ。',
    missionText: 'PHPは更新済み。でも、新しい保守の通知は届きます。\nミオと一緒に、試験の時間、引き継ぎ、現場への連絡を整えてください。',
    missionObjective: '180日間、働く人とサービスを支え続ける。',
    firstAction: '最初の報告を受け取る',
  }),
  researcher: Object.freeze({
    id: 'researcher',
    role: 'ホワイトハッカー',
    english: 'WHITE HAT',
    color: '#8ccfc1',
    identity: '外部セキュリティ診断 / 診断担当',
    tagline: 'まず聞く。その先に、守るべきものがある。',
    roleTitle: 'あなたは、診断担当。',
    roleText: 'あなたは、外部のホワイトハッカー。\n依頼者の話を聞き、仕事への影響を踏まえてセキュリティ診断を進めます。',
    roleObjective: '何を守るのか、依頼者と同じ地図を持つ。',
    missionTitle: '最初の仕事は、ヒアリング。',
    missionText: '技術の検証を始める前に、何を守りたいのかを聞いてください。\n止まると誰が困るのかを確かめ、調べる対象と実施条件を依頼者と合意します。',
    missionObjective: '守る対象、業務への影響、診断の範囲を明らかにする。',
    firstAction: 'ヒアリングを始める',
  }),
});

// Every illustration is self-contained. Role-specific IDs keep their gradients
// distinct when all three portraits appear together in character selection.
const PORTRAITS = Object.freeze({
  crisis: `<svg viewBox="0 0 240 260" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id="president-halo"><stop stop-color="#e6c49a" stop-opacity=".19"/><stop offset="1" stop-color="#e6c49a" stop-opacity="0"/></radialGradient>
      <linearGradient id="president-skin" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f1c9aa"/><stop offset=".6" stop-color="#dba98b"/><stop offset="1" stop-color="#bb806a"/></linearGradient>
      <linearGradient id="president-suit" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#5d6275"/><stop offset=".44" stop-color="#363b50"/><stop offset="1" stop-color="#202638"/></linearGradient>
      <linearGradient id="president-paper" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff4df"/><stop offset="1" stop-color="#d8c6ad"/></linearGradient>
    </defs>
    <circle cx="120" cy="123" r="116" fill="url(#president-halo)"/>
    <circle cx="120" cy="122" r="88" fill="none" stroke="#e6c49a" stroke-opacity=".17"/>
    <path d="M30 121a90 90 0 0 1 14-48m151 104a91 91 0 0 0 16-46" fill="none" stroke="#e6c49a" stroke-width="2" stroke-linecap="round" stroke-opacity=".38"/>
    <ellipse cx="120" cy="251" rx="87" ry="7" fill="#080c15" fill-opacity=".32"/>
    <path d="M34 258l8-61q3-24 26-32l32-11h40l32 11q23 8 26 32l8 61Z" fill="url(#president-suit)" stroke="#202637" stroke-width="2"/>
    <path d="M99 141h42v27l-21 24-21-24Z" fill="url(#president-skin)"/>
    <path d="M100 143h40v13q-23 10-40-1Z" fill="#986553" fill-opacity=".3"/>
    <path d="M98 157l22 17 22-17 10 20-15 81h-34l-15-81Z" fill="#edeae4"/>
    <path d="M110 177l10-5 10 5-6 11 8 57-12 13-12-13 8-57Z" fill="#ba956c"/>
    <path d="M98 156l-9 34 22-13Zm44 0 9 34-22-13Z" fill="#fff9ee"/>
    <path d="M85 159l-14 30 20 8-10 13 24 48h15l-22-101Zm70 0 14 30-20 8 10 13-24 48h-15l22-101Z" fill="#697083" fill-opacity=".56" stroke="#83899b" stroke-opacity=".25"/>
    <path d="M58 208l-5 50m129-50 5 50" stroke="#171f30" stroke-width="2" stroke-linecap="round"/>
    <path d="M151 194h26l-3 8h-22Z" fill="#c9af90"/>
    <path d="M155 194l7-11 8 11" fill="#f0dbbe"/>
    <ellipse cx="82" cy="103" rx="8" ry="14" fill="#d5a184"/>
    <ellipse cx="158" cy="103" rx="8" ry="14" fill="#cb9278"/>
    <path d="M82 75q0-37 38-37t38 37v39q-2 18-16 29-9 8-22 8t-22-8q-14-11-16-29Z" fill="url(#president-skin)" stroke="#b7846e" stroke-width="1.2"/>
    <path d="M83 101l-5-24q-3-38 41-40 40-2 43 31l-4 33-7-21q-20-3-34-20-10 18-28 20Z" fill="#373344"/>
    <path d="M88 72q17-7 28-23 18 20 37 23" fill="none" stroke="#655c65" stroke-width="7" stroke-linecap="round"/>
    <path d="M83 82l5 18m65-17-3 17" stroke="#8e868a" stroke-width="4" stroke-linecap="round"/>
    <path d="M94 94q9-5 16-1m20 0q8-4 16 1" fill="none" stroke="#4d3a3c" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="103" cy="103" rx="3" ry="3.6" fill="#343444"/><ellipse cx="137" cy="103" rx="3" ry="3.6" fill="#343444"/>
    <circle cx="104" cy="102" r=".9" fill="#fff4e7"/><circle cx="138" cy="102" r=".9" fill="#fff4e7"/>
    <path d="M120 103l-3 14 6 1" fill="none" stroke="#b77e65" stroke-width="2" stroke-linecap="round"/>
    <path d="M108 129q12 8 24-1" fill="none" stroke="#855b55" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M109 139q10 4 21-1" fill="none" stroke="#f5ccb0" stroke-width="2" stroke-linecap="round"/>
    <g transform="translate(0 -3) rotate(-9 73 218)">
      <rect x="40" y="183" width="66" height="72" rx="5" fill="#b69770" stroke="#243044" stroke-width="2"/>
      <rect x="46" y="188" width="54" height="60" rx="2" fill="url(#president-paper)"/>
      <path d="M55 199h34M55 205h23" stroke="#697b89" stroke-width="2.3" stroke-linecap="round"/>
      <path d="M56 233v-12m11 12v-18m11 18v-9m11 9v-24" stroke="#aa875f" stroke-width="5" stroke-linecap="round"/>
    </g>
    <path d="M97 221q8-9 13-5l6 8q4 5-1 9l-16 9-10-10Z" fill="url(#president-skin)" stroke="#b98771"/>
    <path d="M103 223l5 7m-10-3 5 7" stroke="#b48069" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M121 225l-11 20 49 13h29l-6-14Z" fill="#3d455b" stroke="#202638" stroke-width="2"/>
    <path d="M121 225l-8 19-9-4 9-20Z" fill="#efebe3"/>
    <circle cx="181" cy="248" r="2" fill="#ba9c77"/>
  </svg>`,

  updates: `<svg viewBox="0 0 240 260" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id="leader-halo"><stop stop-color="#b5a5f7" stop-opacity=".22"/><stop offset="1" stop-color="#b5a5f7" stop-opacity="0"/></radialGradient>
      <linearGradient id="leader-skin" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f1d0b8"/><stop offset=".6" stop-color="#dfb39a"/><stop offset="1" stop-color="#c38e7e"/></linearGradient>
      <linearGradient id="leader-shirt" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#a093c3"/><stop offset=".5" stop-color="#766790"/><stop offset="1" stop-color="#49455f"/></linearGradient>
      <linearGradient id="leader-hair" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#554250"/><stop offset=".5" stop-color="#382e43"/><stop offset="1" stop-color="#242639"/></linearGradient>
      <linearGradient id="leader-screen" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#344960"/><stop offset="1" stop-color="#1c2c41"/></linearGradient>
    </defs>
    <circle cx="120" cy="123" r="116" fill="url(#leader-halo)"/>
    <circle cx="120" cy="122" r="88" fill="none" stroke="#b5a5f7" stroke-opacity=".19"/>
    <path d="M44 75a90 90 0 0 1 38-34m116 125a91 91 0 0 0 12-39" fill="none" stroke="#b5a5f7" stroke-width="2" stroke-linecap="round" stroke-opacity=".4"/>
    <ellipse cx="120" cy="251" rx="87" ry="7" fill="#080c15" fill-opacity=".32"/>
    <path d="M78 70q1-35 42-35 43 0 44 40l4 71q-15 12-47 13-29 0-49-15Z" fill="url(#leader-hair)" stroke="#262637" stroke-width="2"/>
    <path d="M36 258l7-58q3-27 27-36l31-11h38l31 11q23 9 27 36l7 58Z" fill="url(#leader-shirt)" stroke="#343348" stroke-width="2"/>
    <path d="M101 139h38v27l-19 24-19-24Z" fill="url(#leader-skin)"/>
    <path d="M101 141h38v14q-20 10-38 0Z" fill="#b17d6a" fill-opacity=".28"/>
    <path d="M102 158l18 17 18-17 5 28-23 17-23-17Z" fill="#e5e4ed"/>
    <path d="M101 155l-14 12 7 25 22-17Zm38 0 14 12-7 25-22-17Z" fill="#bcb0d5" stroke="#8b7aa4"/>
    <path d="M120 198v60M59 211l-5 47m128-47 5 47" fill="none" stroke="#403c56" stroke-width="2" stroke-linecap="round"/>
    <circle cx="126" cy="211" r="2" fill="#c4bdd7"/><circle cx="126" cy="232" r="2" fill="#c4bdd7"/>
    <path d="M151 181h22v23h-22Z" fill="#8b7da8" stroke="#c5b8df" stroke-opacity=".45"/>
    <path d="M155 184h14" stroke="#ded7e9" stroke-width="2" stroke-linecap="round"/>
    <ellipse cx="84" cy="103" rx="7" ry="13" fill="#d3a18b"/><ellipse cx="156" cy="103" rx="7" ry="13" fill="#c99283"/>
    <path d="M84 77q0-31 36-31t36 31v34q-2 20-16 31-9 7-20 7t-20-7q-14-11-16-31Z" fill="url(#leader-skin)" stroke="#c29481" stroke-width="1.2"/>
    <path d="M83 97l-3-26q4-32 40-31 41 0 41 35l-5 25-6-20q-26 1-42-23-3 20-22 24Z" fill="url(#leader-hair)"/>
    <path d="M91 69q12-6 19-19 16 20 39 24" fill="none" stroke="#79616a" stroke-width="5" stroke-linecap="round" stroke-opacity=".7"/>
    <path d="M95 94q7-4 14-1m21 0q7-4 14 1" fill="none" stroke="#59414b" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M97 103q6-4 11 0m24 0q6-4 11 0" fill="none" stroke="#343345" stroke-width="2.4" stroke-linecap="round"/>
    <ellipse cx="103" cy="104" rx="2.3" ry="3.2" fill="#343345"/><ellipse cx="137" cy="104" rx="2.3" ry="3.2" fill="#343345"/>
    <path d="M120 104l-3 13 5 1" fill="none" stroke="#bc8d7b" stroke-width="1.7" stroke-linecap="round"/>
    <path d="M109 128q11 9 23-1" fill="#e8b0a4" stroke="#9c6264" stroke-width="1.8" stroke-linecap="round"/>
    <ellipse cx="96" cy="117" rx="6" ry="3" fill="#cd8f92" fill-opacity=".25"/><ellipse cx="144" cy="117" rx="6" ry="3" fill="#cd8f92" fill-opacity=".22"/>
    <path d="M77 100V84q0-43 43-43t43 43v16" fill="none" stroke="#242b3c" stroke-width="7"/>
    <path d="M79 82q1-39 41-39 36 0 40 33" fill="none" stroke="#b9a9d7" stroke-width="2" stroke-linecap="round"/>
    <rect x="74" y="92" width="12" height="27" rx="5" fill="#53536c" stroke="#b5a5d9" stroke-width="1.5"/>
    <rect x="154" y="92" width="12" height="27" rx="5" fill="#53536c" stroke="#b5a5d9" stroke-width="1.5"/>
    <path d="M161 115q-1 17-24 18" fill="none" stroke="#8c8aa4" stroke-width="3" stroke-linecap="round"/>
    <rect x="130" y="130" width="12" height="6" rx="3" fill="#373c50"/>
    <g transform="translate(0 -7) rotate(7 130 221)">
      <rect x="79" y="185" width="103" height="73" rx="8" fill="#212b3d" stroke="#a49aba" stroke-width="2"/>
      <rect x="85" y="191" width="91" height="59" rx="3" fill="url(#leader-screen)"/>
      <path d="M97 204h30M97 210h20" stroke="#a79ace" stroke-width="2" stroke-linecap="round"/>
      <rect x="97" y="221" width="12" height="14" rx="2" fill="#8bc6c2" fill-opacity=".75"/>
      <rect x="116" y="216" width="12" height="19" rx="2" fill="#b2a1e1" fill-opacity=".75"/>
      <rect x="135" y="208" width="12" height="27" rx="2" fill="#c4b4e9" fill-opacity=".85"/>
      <path d="M154 223l4 4 8-11" fill="none" stroke="#8ccfc1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="131" cy="254" r="1.5" fill="#827f99"/>
    </g>
    <path d="M71 211q9-4 12 2l3 13-8 8-15-10Z" fill="url(#leader-skin)" stroke="#bd8c7b"/>
    <path d="M48 220l16-10 18 24-23 24H39Z" fill="#786d98" stroke="#46415b" stroke-width="2"/>
    <path d="M66 211l-6 6 16 21 7-6Z" fill="#d0c8df"/>
    <path d="M175 225q-9-5-13 1l-6 11q-2 7 5 10l14 2 9-12Z" fill="url(#leader-skin)" stroke="#bd8c7b"/>
    <path d="M164 229l-3 8m9-6-3 9" stroke="#b98473" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M184 230l-14 24 6 4h28l-4-17Z" fill="#635a7d" stroke="#3d3b54" stroke-width="2"/>
  </svg>`,

  researcher: `<svg viewBox="0 0 240 260" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id="researcher-halo"><stop stop-color="#8ccfc1" stop-opacity=".2"/><stop offset="1" stop-color="#8ccfc1" stop-opacity="0"/></radialGradient>
      <linearGradient id="researcher-skin" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#dca787"/><stop offset=".6" stop-color="#c08a70"/><stop offset="1" stop-color="#986653"/></linearGradient>
      <linearGradient id="researcher-jacket" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f0f1e9"/><stop offset=".52" stop-color="#d7e0d8"/><stop offset="1" stop-color="#9fbcb6"/></linearGradient>
      <linearGradient id="researcher-shirt" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#628f89"/><stop offset="1" stop-color="#345863"/></linearGradient>
      <linearGradient id="researcher-paper" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fbf3e4"/><stop offset="1" stop-color="#d7dbcf"/></linearGradient>
    </defs>
    <circle cx="120" cy="123" r="116" fill="url(#researcher-halo)"/>
    <circle cx="120" cy="122" r="88" fill="none" stroke="#8ccfc1" stroke-opacity=".17"/>
    <path d="M35 99a90 90 0 0 1 26-44m139 111a91 91 0 0 0 10-44" fill="none" stroke="#8ccfc1" stroke-width="2" stroke-linecap="round" stroke-opacity=".4"/>
    <ellipse cx="120" cy="251" rx="87" ry="7" fill="#080c15" fill-opacity=".32"/>
    <path d="M34 258l9-60q3-26 29-34l29-9h38l29 9q26 8 29 34l9 60Z" fill="url(#researcher-jacket)" stroke="#7d9d9c" stroke-width="2"/>
    <path d="M101 140h38v29l-19 17-19-17Z" fill="url(#researcher-skin)"/>
    <path d="M101 142h38v13q-18 9-38-1Z" fill="#835e50" fill-opacity=".28"/>
    <path d="M99 164q21 17 42 0l13 94H86Z" fill="url(#researcher-shirt)"/>
    <path d="M100 155l-17 10 4 32 13 61h16l-9-77-14-1Zm40 0 17 10-4 32-13 61h-16l9-77 14-1Z" fill="#f3f3e9" stroke="#b5c8c1" stroke-width="1.2"/>
    <path d="M62 206l-5 52m121-52 5 52" stroke="#9bb2ad" stroke-width="2" stroke-linecap="round"/>
    <path d="M154 190h24v24h-24Z" fill="#b6cec5" stroke="#8aaba5"/>
    <path d="M158 189l-1-12 4-1 1 13" fill="#466d75"/>
    <path d="M151 218h29" stroke="#b4c7be" stroke-width="2"/>
    <ellipse cx="83" cy="103" rx="7" ry="13" fill="#be886c"/><ellipse cx="157" cy="103" rx="7" ry="13" fill="#ac775f"/>
    <path d="M83 76q0-33 37-33t37 33v34q-1 20-16 33-10 8-21 8t-21-8q-15-13-16-33Z" fill="url(#researcher-skin)" stroke="#a97762" stroke-width="1.2"/>
    <path d="M82 100l-6-24q-3-39 42-40 43-2 46 35l-7 30-5-25q-16 3-31-16-13 14-32 15Z" fill="#2e303b"/>
    <path d="M83 70q-15-5-9-18 5-10 17-6 0-17 16-17 10 0 15 7 10-13 22-4 7 5 6 13 17-2 20 12 3 10-9 18l-18-10-19-14-23 15Z" fill="#353843"/>
    <path d="M84 51q10-8 17-1m10-9q10-6 17 2m14 4q10-2 15 7" fill="none" stroke="#54545e" stroke-width="4" stroke-linecap="round"/>
    <path d="M93 92q8-5 15-1m23 0q8-4 16 1" fill="none" stroke="#4c3535" stroke-width="2.5" stroke-linecap="round"/>
    <ellipse cx="102" cy="103" rx="2.7" ry="3.2" fill="#2d303c"/><ellipse cx="138" cy="103" rx="2.7" ry="3.2" fill="#2d303c"/>
    <circle cx="103" cy="102" r=".8" fill="#f4e1cc"/><circle cx="139" cy="102" r=".8" fill="#f4e1cc"/>
    <g fill="#e3f5eb" fill-opacity=".08" stroke="#344e58" stroke-width="2.6">
      <rect x="88" y="95" width="27" height="20" rx="8"/><rect x="125" y="95" width="27" height="20" rx="8"/>
      <path d="M115 102q5-3 10 0m-37 0-6-2m70 2 6-2" fill="none"/>
    </g>
    <path d="M93 99h6m31 0h6" stroke="#d3e5da" stroke-width="1.5" stroke-linecap="round" stroke-opacity=".65"/>
    <path d="M120 105l-3 14 6 1" fill="none" stroke="#a57058" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M108 130q12 7 24-1" fill="none" stroke="#744f49" stroke-width="2.3" stroke-linecap="round"/>
    <path d="M109 139q11 4 21-1" fill="none" stroke="#dfaf8b" stroke-width="1.8" stroke-linecap="round"/>
    <g transform="translate(0 -5) rotate(-8 79 218)">
      <rect x="45" y="177" width="72" height="81" rx="5" fill="#517b7a" stroke="#304c58" stroke-width="2"/>
      <rect x="51" y="184" width="60" height="66" rx="2" fill="url(#researcher-paper)"/>
      <path d="M71 178v-4q0-4 5-4h10q5 0 5 4v4" fill="#a8b9b1" stroke="#566e73" stroke-width="2"/>
      <rect x="67" y="176" width="27" height="9" rx="3" fill="#9db8b0" stroke="#647e7d"/>
      <path d="M62 200l3 3 5-7m-8 18 3 3 5-7m-8 18 3 3 5-7" fill="none" stroke="#537f77" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M77 201h22m-22 14h18m-18 14h22" stroke="#899790" stroke-width="2" stroke-linecap="round"/>
    </g>
    <path d="M109 219q6-9 12-5l5 8q4 6-2 10l-14 8-10-11Z" fill="url(#researcher-skin)" stroke="#a7745e"/>
    <path d="M114 221l5 7m-10-3 5 7" stroke="#9d6d57" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M129 223l-15 21 52 14h36l-8-18Z" fill="#c5d7ce" stroke="#88aaa3" stroke-width="2"/>
    <path d="M130 223l-12 21-9-5 12-21Z" fill="#54857e"/>
    <path d="M66 224l-13-8-15 42h20l20-23Z" fill="#d8e3d9" stroke="#93b1a8" stroke-width="2"/>
  </svg>`,
});

/** Return a static SVG; an unknown story uses the company president portrait. */
export function playerPortrait(storyId) {
  return PORTRAITS[storyId] || PORTRAITS.crisis;
}
