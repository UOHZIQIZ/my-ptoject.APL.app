(() => {
  "use strict";
  const LANGS = [
  {
    "code": "en",
    "html": "en",
    "name": "English"
  },
  {
    "code": "zh",
    "html": "zh-CN",
    "name": "中文"
  },
  {
    "code": "fr",
    "html": "fr",
    "name": "Français"
  },
  {
    "code": "ja",
    "html": "ja",
    "name": "日本語"
  },
  {
    "code": "ko",
    "html": "ko",
    "name": "한국어"
  }
];
  const STRINGS = {
  "en": {
    "prev": "‹ Previous",
    "next": "Next ›",
    "chapters": {
      "home": "Home",
      "world": "World",
      "companions": "Companions",
      "collections": "Collections",
      "memories": "Memories",
      "bestiary": "Bestiary"
    },
    "codex": {
      "characters": "Companion Codex",
      "weapons": "Weapon Codex",
      "materials": "Material Codex",
      "artifacts": "Artifact Codex",
      "domains": "Domain Codex",
      "elements": "Element Codex",
      "consumables": "Food & Potions",
      "enemies": "Enemy Codex",
      "bosses": "Weekly Bosses"
    },
    "musicLabel": "Music",
    "musicTitle": "Songs of the Road",
    "musicOpen": "Open in Spotify",
    "musicNote": "Official soundtracks by HOYO-MiX on Spotify. Without a Spotify login each track plays a ~30s preview; log in to Spotify in this browser to hear full songs.",
    "musicNoteYT": "Soundtracks from the official Genshin Impact YouTube channel. Full-length, no login needed (ads may play).",
    "musicFileWarn": "Note: YouTube only plays on a site opened from a web address. If you double-clicked index.html, use the “start site” script or GitHub Pages instead.",
    "musicOpenYT": "Open on YouTube",
    "musicAdd": "Add",
    "musicRemove": "Remove",
    "musicAddPlaceholder": "Paste a YouTube / YouTube Music link",
    "musicBadLink": "That isn’t a valid YouTube link.",
    "musicYTError": "This video can’t be played inside the site right now — use “Open on YouTube” above.",
    "musicGroups": {
      "mine": "Added by me",
      "regions": "Themes & Regions",
      "more": "More Soundtracks",
      "characters": "Character Themes",
      "events": "Event Music",
      "local": "My Music"
    },
    "placesTitle": "Notable Places"
  },
  "zh": {
    "prev": "‹ 上一页",
    "next": "下一页 ›",
    "chapters": {
      "home": "扉页",
      "world": "世界",
      "companions": "同伴",
      "collections": "收藏",
      "memories": "回忆",
      "bestiary": "魔物"
    },
    "codex": {
      "characters": "同伴图鉴",
      "weapons": "武器图鉴",
      "materials": "材料图鉴",
      "artifacts": "圣遗物图鉴",
      "domains": "秘境图鉴",
      "elements": "元素图鉴",
      "consumables": "料理与药剂",
      "enemies": "魔物图鉴",
      "bosses": "周本首领"
    },
    "musicLabel": "音乐",
    "musicTitle": "旅途之音",
    "musicOpen": "在 Spotify 中打开",
    "musicNote": "官方原声来自 HOYO-MiX（Spotify）。未登录时每首可试听约 30 秒，在本浏览器登录 Spotify 后可完整播放。",
    "musicNoteYT": "来自《原神》官方 YouTube 频道的原声，完整播放，无需登录（可能会有广告）。",
    "musicFileWarn": "提示：YouTube 只能在网址打开的网站中播放。直接双击 index.html 时请改用「启动网站」脚本或 GitHub Pages 打开。",
    "musicOpenYT": "在 YouTube 打开",
    "musicAdd": "添加",
    "musicRemove": "删除",
    "musicAddPlaceholder": "粘贴 YouTube / YouTube Music 链接",
    "musicBadLink": "这不是有效的 YouTube 链接。",
    "musicYTError": "这个视频暂时无法在网站里播放，可以点右上角在 YouTube 打开。",
    "musicGroups": {
      "mine": "我添加的",
      "regions": "主题与地区",
      "more": "更多原声",
      "characters": "角色曲",
      "events": "活动曲",
      "local": "我的音乐"
    },
    "placesTitle": "代表地点"
  },
  "fr": {
    "prev": "‹ Précédent",
    "next": "Suivant ›",
    "chapters": {
      "home": "Accueil",
      "world": "Monde",
      "companions": "Compagnons",
      "collections": "Collections",
      "memories": "Souvenirs",
      "bestiary": "Bestiaire"
    },
    "codex": {
      "characters": "Codex des compagnons",
      "weapons": "Codex des armes",
      "materials": "Codex des matériaux",
      "artifacts": "Codex des artéfacts",
      "domains": "Codex des domaines",
      "elements": "Codex des éléments",
      "consumables": "Plats et potions",
      "enemies": "Codex des ennemis",
      "bosses": "Boss hebdomadaires"
    },
    "musicLabel": "Musique",
    "musicTitle": "Chants de la route",
    "musicOpen": "Ouvrir dans Spotify",
    "musicNote": "Bandes originales officielles de HOYO-MiX sur Spotify. Sans connexion, chaque titre est un extrait d’environ 30 s ; connectez-vous à Spotify dans ce navigateur pour l’écoute complète.",
    "musicNoteYT": "Bandes originales de la chaîne YouTube officielle de Genshin Impact. Lecture complète, sans connexion (publicités possibles).",
    "musicFileWarn": "Remarque : YouTube ne fonctionne que sur un site ouvert depuis une adresse web. Si vous avez double-cliqué sur index.html, utilisez le script « démarrer le site » ou GitHub Pages.",
    "musicOpenYT": "Ouvrir sur YouTube",
    "musicAdd": "Ajouter",
    "musicRemove": "Supprimer",
    "musicAddPlaceholder": "Collez un lien YouTube / YouTube Music",
    "musicBadLink": "Ce n’est pas un lien YouTube valide.",
    "musicYTError": "Cette vidéo ne peut pas être lue ici pour le moment — utilisez « Ouvrir sur YouTube ».",
    "musicGroups": {
      "mine": "Ajoutés par moi",
      "regions": "Thèmes et régions",
      "more": "Autres bandes originales",
      "characters": "Thèmes des personnages",
      "events": "Musiques d’événements",
      "local": "Ma musique"
    },
    "placesTitle": "Lieux notables"
  },
  "ja": {
    "prev": "‹ 前へ",
    "next": "次へ ›",
    "chapters": {
      "home": "扉",
      "world": "世界",
      "companions": "仲間",
      "collections": "コレクション",
      "memories": "思い出",
      "bestiary": "魔物"
    },
    "codex": {
      "characters": "仲間図鑑",
      "weapons": "武器図鑑",
      "materials": "素材図鑑",
      "artifacts": "聖遺物図鑑",
      "domains": "秘境図鑑",
      "elements": "元素図鑑",
      "consumables": "料理と薬剤",
      "enemies": "魔物図鑑",
      "bosses": "週ボス"
    },
    "musicLabel": "音楽",
    "musicTitle": "旅の調べ",
    "musicOpen": "Spotify で開く",
    "musicNote": "HOYO-MiX 公式サウンドトラック（Spotify）。未ログインでは各曲約30秒の試聴、このブラウザで Spotify にログインすると全曲再生できます。",
    "musicNoteYT": "原神公式 YouTube チャンネルのサウンドトラック。ログイン不要で全曲再生できます（広告が流れる場合があります）。",
    "musicFileWarn": "注意：YouTube はウェブアドレスで開いたサイトでのみ再生できます。index.html をダブルクリックで開いた場合は「サイト起動」スクリプトか GitHub Pages を使ってください。",
    "musicOpenYT": "YouTube で開く",
    "musicAdd": "追加",
    "musicRemove": "削除",
    "musicAddPlaceholder": "YouTube / YouTube Music のリンクを貼り付け",
    "musicBadLink": "有効な YouTube リンクではありません。",
    "musicYTError": "この動画は現在サイト内で再生できません。右上から YouTube で開いてください。",
    "musicGroups": {
      "mine": "追加した曲",
      "regions": "テーマと地域",
      "more": "その他のサウンドトラック",
      "characters": "キャラクター曲",
      "events": "イベント曲",
      "local": "マイミュージック"
    },
    "placesTitle": "主な名所"
  },
  "ko": {
    "prev": "‹ 이전",
    "next": "다음 ›",
    "chapters": {
      "home": "홈",
      "world": "세계",
      "companions": "동료",
      "collections": "수집품",
      "memories": "추억",
      "bestiary": "마물"
    },
    "codex": {
      "characters": "동료 도감",
      "weapons": "무기 도감",
      "materials": "재료 도감",
      "artifacts": "성유물 도감",
      "domains": "비경 도감",
      "elements": "원소 도감",
      "consumables": "요리와 물약",
      "enemies": "마물 도감",
      "bosses": "주간 보스"
    },
    "musicLabel": "음악",
    "musicTitle": "여정의 노래",
    "musicOpen": "Spotify에서 열기",
    "musicNote": "HOYO-MiX 공식 OST(Spotify). 로그인하지 않으면 곡당 약 30초 미리듣기, 이 브라우저에서 Spotify에 로그인하면 전곡을 들을 수 있어요.",
    "musicNoteYT": "원신 공식 YouTube 채널의 OST. 로그인 없이 전곡 재생(광고가 나올 수 있음).",
    "musicFileWarn": "참고: YouTube는 웹 주소로 연 사이트에서만 재생됩니다. index.html을 더블클릭해 열었다면 「사이트 시작」 스크립트나 GitHub Pages를 사용하세요.",
    "musicOpenYT": "YouTube에서 열기",
    "musicAdd": "추가",
    "musicRemove": "삭제",
    "musicAddPlaceholder": "YouTube / YouTube Music 링크 붙여넣기",
    "musicBadLink": "올바른 YouTube 링크가 아닙니다.",
    "musicYTError": "이 영상은 지금 사이트 안에서 재생할 수 없어요. 위의 「YouTube에서 열기」를 이용하세요.",
    "musicGroups": {
      "mine": "내가 추가한 곡",
      "regions": "테마와 지역",
      "more": "더 많은 OST",
      "characters": "캐릭터 테마",
      "events": "이벤트 음악",
      "local": "내 음악"
    },
    "placesTitle": "주요 명소"
  }
};
  const STORAGE_KEY = "travelers-diary.lang.v2";

  function detect() {
    const q = new URLSearchParams(location.search).get("lang");
    if (q && STRINGS[q]) return q;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && STRINGS[saved]) return saved;
    } catch (_) {                  }
    return "en";
  }

  function save(code) {
    try { localStorage.setItem(STORAGE_KEY, code); } catch (_) {              }
  }

  const referenceText = {
  "en": [
    "Find your next discovery",
    "A field guide for every journey through Teyvat. Browse a category and search an English name.",
    "Search English names…",
    "Search",
    "Back to results",
    "No matching entries. Try another name or clear your filters.",
    "Browse categories",
    "Regions",
    "All groups",
    "Clear",
    "Results",
    "Loading reference data…",
    "Could not load data. Please retry.",
    "Retry",
    "Home",
    "English reference data"
  ],
  "zh": [
    "寻找你的下一次发现",
    "提瓦特资料手记：选择分类，输入英文名称，查阅详细资料。",
    "输入英文名称…",
    "搜索",
    "返回搜索结果",
    "没有匹配资料。请更换名称或清除筛选。",
    "浏览分类",
    "地区",
    "全部分组",
    "清除",
    "搜索结果",
    "正在加载资料…",
    "资料加载失败，请重试。",
    "重试",
    "首页",
    "资料内容及名称为英文"
  ],
  "fr": [
    "Votre prochaine découverte",
    "Choisissez une catégorie et recherchez un nom anglais.",
    "Rechercher un nom anglais…",
    "Rechercher",
    "Retour aux résultats",
    "Aucun résultat. Modifiez le nom ou les filtres.",
    "Catégories",
    "Régions",
    "Tous les groupes",
    "Effacer",
    "Résultats",
    "Chargement…",
    "Chargement impossible. Réessayez.",
    "Réessayer",
    "Accueil",
    "Données en anglais"
  ],
  "ja": [
    "次の発見へ",
    "分類を選び、英語の名前で資料を検索できます。",
    "英語名を入力…",
    "検索",
    "検索結果に戻る",
    "該当する資料がありません。",
    "分類を見る",
    "地域",
    "すべてのグループ",
    "クリア",
    "検索結果",
    "読み込み中…",
    "読み込みに失敗しました。",
    "再試行",
    "ホーム",
    "資料は英語です"
  ],
  "ko": [
    "다음 발견을 찾아서",
    "분류를 선택하고 영어 이름으로 자료를 검색하세요.",
    "영어 이름 검색…",
    "검색",
    "검색 결과로 돌아가기",
    "검색 결과가 없습니다.",
    "분류 둘러보기",
    "지역",
    "모든 그룹",
    "초기화",
    "검색 결과",
    "불러오는 중…",
    "자료를 불러오지 못했습니다.",
    "재시도",
    "홈",
    "자료는 영어입니다"
  ]
};
  const rarityLabels = {
  "en": [
    "Rarity",
    "All rarities"
  ],
  "zh": [
    "星级",
    "全部星级"
  ],
  "fr": [
    "Rareté",
    "Toutes les raretés"
  ],
  "ja": [
    "レアリティ",
    "すべてのレアリティ"
  ],
  "ko": [
    "희귀도",
    "모든 희귀도"
  ]
};
  window.DiaryI18n = { LANGS, STRINGS, detect, save, referenceText, rarityLabels };
})();
