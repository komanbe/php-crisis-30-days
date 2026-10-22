// Confirmed source facts are in `body`; educational interpretations are in `lesson`.
// Incident cards are historical comparisons, not evidence of PHP involvement.
export const REFERENCES = [
  {
    id: 'osaka',
    name: '大阪急性期・総合医療センター',
    date: '2023-03-28',
    title: '給食委託先との接続から、診療システムへ',
    body: '給食センター側の情報基盤から病院への侵入が報告された。2022年10月31日の障害から、基幹システムは43日目、診療システム全体は73日目に復旧した。',
    lesson: '委託先との接続範囲と権限を見直す。外部との接続を、組織の境界だけで安全と判断しない。',
    url: 'https://www.gh.opho.jp/pdf/report_v01.pdf#page=11',
    type: 'incident'
  },
  {
    id: 'askul',
    name: 'アスクル',
    date: '2025-12-12',
    title: '物流の停止が、委託企業とその顧客へ波及',
    body: 'MFA未適用の委託先向け管理者アカウントの不正利用を確認。物流システムと同じデータセンター内のバックアップが暗号化され、出荷停止は物流受託サービスの利用企業とその顧客にも影響した。',
    lesson: '業務の依存先と代替手段を把握する。取引先への業務影響と、その取引先への不正侵入は分けて考える。',
    url: 'https://pdf.irpocket.com/C0032/PDLX/O3bg/N4O3.pdf#page=3',
    type: 'incident'
  },
  {
    id: 'mino',
    name: '美濃工業',
    date: '2025-11-03',
    title: '正規のVPNアカウントから侵入',
    body: '公式第四報は、社員用VPNの正規ID・パスワードの悪用による侵入と説明し、VPN機器の脆弱性悪用ではないと明記。受注・生産・出荷に関わるシステムの確認と復旧が行われた。',
    lesson: '入口の認証に加え、侵入後の権限と移動範囲も管理する。社内の被害から、取引先への不正侵入まで推測で結びつけない。',
    url: 'https://www.mino-in.co.jp/archives/news/サイバー攻撃によるシステム障害について（第四',
    type: 'incident'
  },
  {
    id: 'handa',
    name: 'つるぎ町立半田病院',
    date: '2022-06-07',
    title: '保守の責任と、失われた調査ログ',
    body: '電子カルテ等の暗号化により、正常な病院業務が約2か月滞った。報告書は保守用VPN経由の侵入を有力とする一方、ログ未保存のため侵入経路を証明する分析はできなかったと説明する。',
    lesson: '更新担当と保守の責任を明確にし、復旧と並行して調査に必要な記録を保全する。侵入経路の推定を確定情報と混同しない。',
    url: 'https://www.handa-hospital.jp/topics/2022/0616/report_01.pdf#page=19',
    type: 'incident'
  },
  {
    id: 'british-library',
    name: '英国図書館',
    date: '2024-03-08',
    title: '複雑な接続と旧来システムが被害を拡大',
    body: '2023年10月の攻撃では、外部パートナー等が利用するサーバーで最初の不正アクセスを確認。正確な侵入点は未確定であり、MFAの欠如と複雑な旧来のネットワークがリスクとして示された。',
    lesson: '信頼する相手にも、接続範囲と認証を設計する。外部パートナーが感染源だったと断定しない。',
    url: 'https://www.bl.uk/stories/blogs/posts/learning-lessons-from-the-cyber-attack',
    type: 'incident'
  },
  {
    id: 'hse',
    name: 'アイルランドHSE',
    date: '2021-12-03',
    title: '共有医療ネットワークを越えて広がる影響',
    body: 'フィッシングメールのExcel添付をきっかけに端末が感染し、2021年5月14日にランサムウェアが実行された。主に未分割の共有ネットワークと複雑な権限関係が、多数の接続組織への大規模な影響につながった。',
    lesson: 'つながりを可視化し、ネットワークの区画と責任を揃える。共有サービスの停止を前提に継続手段を考える。',
    url: 'https://about.hse.ie/api/v2/download-file/file_based_publications/conti_cyber_attack_on_the_hse_full_report.pdf#page=11',
    type: 'incident'
  },
  {
    id: 'php-official',
    name: 'PHP開発チーム',
    date: '2026-10-21',
    title: 'PHPの重大な脆弱性と修正版',
    body: 'CVE-2026-109618とCVE-2026-109619は、認証なしのリモートコード実行につながる可能性がある。PHP 8.5.12、8.4.27、8.3.36、8.2.35で修正された。',
    lesson: '自社だけでなく委託サービスのPHP利用と修正状況も確認する。設定変更だけで完全に解消するものではない。',
    url: 'https://www.php.net/archive/2026.php#2026-10-21-5',
    type: 'advisory'
  },
  {
    id: 'jpcert',
    name: 'JPCERT/CC',
    date: '2026-10-22',
    title: 'PHPの複数の脆弱性に関する国内向け注意喚起',
    body: '2つの脆弱性により、PHP実行プロセスの権限で任意のコードを実行される可能性を注意喚起。更新と侵害の痕跡の調査を促し、痕跡がなくても侵害を否定できない点を示している。',
    lesson: '脆弱性情報は公的機関と開発元の更新を確認し、実際の利用環境に応じて対応する。',
    url: 'https://www.jpcert.or.jp/at/2026/at260033.html',
    type: 'advisory'
  }
];

export const PHP_INFO = {
  title: 'PHP2Shell ── 共通基盤に見つかった2つの脆弱性',
  summary: '2026年10月21日、PHP開発チームが認証なしのリモートコード実行につながる2つの重大な脆弱性と修正版を公表。共通のPHPを利用する複数サービスが、同時に対応を求められる状況を学ぶ。',
  cves: ['CVE-2026-109618', 'CVE-2026-109619'],
  versions: [
    { branch: '8.5', affected: '8.5.11以前', fixed: '8.5.12' },
    { branch: '8.4', affected: '8.4.26以前', fixed: '8.4.27' },
    { branch: '8.3', affected: '8.3.35以前', fixed: '8.3.36' },
    { branch: '8.2', affected: '8.2.34以前', fixed: '8.2.35' }
  ],
  date: '2026-10-21',
  conditions: [
    'PHP公式は、PHP-FPM、Apache mod_php、php-cgi、FrankenPHP、LiteSpeedなど、Webリクエストを処理するPHP環境を対象としている。',
    'PHP公式はmod_phpのリスクを最も高いと評価。具体的な悪用の成立は実行方式や設定などに依存する。',
    '表はPHP公式の対象ブランチを示す。OS配布元やLTSベンダーによるバックポートは、表示バージョンだけで判断せず提供元の情報を確認する。',
    'PHP 8.1以前はPHPプロジェクトの通常サポート対象外。利用ベンダーの修正提供状況の確認、またはサポート中のバージョンへの移行が必要。'
  ],
  disclaimer: '本編は架空企業の意思決定を学ぶシミュレーション。表示する日数・被害・因果関係は演習上の仮定であり、実際の攻撃予測ではない。PHPの脆弱性から他社へ自動感染することや、参考事件の原因がPHPだったことを示さない。業務停止の波及とネットワーク侵害を区別する。',
  sources: [
    { name: 'PHP公式セキュリティアドバイザリ', url: 'https://www.php.net/archive/2026.php#2026-10-21-5' },
    { name: 'JPCERT/CC 注意喚起', url: 'https://www.jpcert.or.jp/at/2026/at260033.html' }
  ]
};
