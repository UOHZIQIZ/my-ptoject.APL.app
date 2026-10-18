(() => {
  "use strict";

  const DATA = window.DIARY_MUSIC || {};
  const { STRINGS } = window.DiaryI18n;
  const STORE_KEY = "travelers-diary.music";
  const MINE_KEY = "travelers-diary.music.mine";

  const $ = (s) => document.querySelector(s);
  const box = $("#music");
  if (!box) return;
  const toggle = $("#musicToggle");
  const panel = $("#musicPanel");
  const listEl = $("#musicList");
  const nowEl = $("#musicNow");
  const titleEl = $("#musicTitle");
  const noteEl = $("#musicNote");
  const closeBtn = $("#musicClose");
  const openLink = $("#musicOpen");
  const srcBar = $("#musicSources");

  const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const lang = () => document.documentElement.dataset.lang || "en";
  const t = () => STRINGS[lang()] || STRINGS.en;
  const isFile = location.protocol === "file:";

  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || "null") ?? d; } catch (_) { return d; } };
  const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {              } };

  let mine = load(MINE_KEY, []);

  function buildItems() {
    const out = [];
    (DATA.youtube || []).forEach((g) => g.items.forEach((it, i) => out.push({ ...it, src: "youtube", group: g.id, key: `yt-${g.id}-${i}` })));
    mine.forEach((it, i) => out.push({ ...it, src: "youtube", group: "mine", key: `yt-mine-${it.v || it.list}`, mineIndex: i }));
    (DATA.spotify || DATA.groups || []).forEach((g) => g.items.forEach((it, i) => out.push({ ...it, src: "spotify", group: g.id, key: `sp-${g.id}-${i}` })));
    (DATA.local || []).forEach((it, i) => out.push({ ...it, file: it.src, src: "local", group: "local", key: `lo-${i}` }));
    return out;
  }
  let items = buildItems();
  const SOURCES = ["youtube", "spotify", ...((DATA.local || []).length ? ["local"] : [])];

  const saved = load(STORE_KEY, {});
  const state = {
    source: SOURCES.includes(saved.source) ? saved.source : "youtube",
    current: { youtube: saved.youtube, spotify: saved.spotify, local: saved.local },
    playingSrc: null,
    built: false,
  };
  for (const s of SOURCES) {
    if (!items.some((i) => i.key === state.current[s] && i.src === s)) state.current[s] = items.find((i) => i.src === s)?.key;
  }
  const save = () => store(STORE_KEY, { source: state.source, ...state.current });

  function parseYouTube(input) {
    const raw = String(input || "").trim();
    if (/^[\w-]{11}$/.test(raw)) return { v: raw };
    let u;
    try { u = new URL(raw.startsWith("http") ? raw : `https://${raw}`); } catch (_) { return null; }
    if (!/(^|\.)youtube\.com$|(^|\.)youtu\.be$|(^|\.)youtube-nocookie\.com$/.test(u.hostname)) return null;
    const list = u.searchParams.get("list");
    let v = u.searchParams.get("v");
    if (!v && u.hostname.endsWith("youtu.be")) v = u.pathname.slice(1);
    const m = u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})/);
    if (!v && m) v = m[1];
    if (list && !v) return { list };
    if (v && /^[\w-]{11}$/.test(v)) return list ? { v, list } : { v };
    if (list) return { list };
    return null;
  }

  function renderText() {
    const s = t();
    toggle.querySelector(".music-label").textContent = s.musicLabel;
    toggle.setAttribute("aria-label", s.musicLabel);
    titleEl.textContent = s.musicTitle;
    closeBtn.setAttribute("aria-label", s.close);
    srcBar.innerHTML = SOURCES.map((src) => `
      <button type="button" class="music-src${src === state.source ? " is-on" : ""}" data-src="${src}">
        ${esc(src === "youtube" ? "YouTube" : src === "spotify" ? "Spotify" : s.musicGroups.local)}
      </button>`).join("");
    renderList();
    renderNote();
    renderOpenLink();
  }

  function renderNote() {
    const s = t();
    if (state.source === "youtube") {
      noteEl.innerHTML = esc(s.musicNoteYT) + (isFile ? `<br /><strong class="music-warn">${esc(s.musicFileWarn)}</strong>` : "");
    } else if (state.source === "spotify") {
      noteEl.textContent = s.musicNote;
    } else {
      noteEl.textContent = "";
    }
  }

  function renderList() {
    const s = t();
    const src = state.source;
    const groupsOrder = src === "youtube"
      ? [...(DATA.youtube || []).map((g) => g.id), "mine"]
      : src === "spotify" ? (DATA.spotify || DATA.groups || []).map((g) => g.id) : ["local"];
    let html = groupsOrder.map((gid) => {
      const rows = items.filter((i) => i.src === src && i.group === gid);
      if (!rows.length && gid !== "mine") return "";
      return `
        <p class="music-group">${esc(s.musicGroups[gid] || gid)}</p>
        <ul>
          ${rows.map((it) => `
            <li class="music-row">
              <button type="button" class="music-item${it.key === state.current[src] ? " is-current" : ""}" data-music="${esc(it.key)}">
                <span class="music-disc" aria-hidden="true"></span>
                <span class="music-name">${esc(it.title)}</span>
                ${it.note ? `<span class="music-tag">${esc(it.note)}</span>` : ""}
              </button>
              ${it.group === "mine" ? `<button type="button" class="music-remove" data-remove="${it.mineIndex}" aria-label="${esc(s.musicRemove)}">×</button>` : ""}
            </li>`).join("")}
        </ul>`;
    }).join("");
    if (src === "youtube") {
      html += `
        <form class="music-add" id="musicAdd" autocomplete="off">
          <input type="text" name="url" placeholder="${esc(s.musicAddPlaceholder)}" aria-label="${esc(s.musicAddPlaceholder)}" />
          <button type="submit">${esc(s.musicAdd)}</button>
          <p class="music-add-msg" aria-live="polite"></p>
        </form>`;
    }
    listEl.innerHTML = html;
  }

  function renderOpenLink() {
    const it = items.find((i) => i.key === state.current[state.source]);
    const s = t();
    if (it?.src === "spotify") {
      openLink.hidden = false;
      openLink.href = `https://open.spotify.com/album/${it.spotify}`;
      openLink.textContent = `${s.musicOpen} ↗`;
    } else if (it?.src === "youtube") {
      openLink.hidden = false;
      openLink.href = it.v ? `https://www.youtube.com/watch?v=${it.v}${it.list ? `&list=${it.list}` : ""}` : `https://www.youtube.com/playlist?list=${it.list}`;
      openLink.textContent = `${s.musicOpenYT} ↗`;
    } else {
      openLink.hidden = true;
    }
  }

  function setPlaying(src, on) {
    if (on) state.playingSrc = src;
    else if (state.playingSrc === src) state.playingSrc = null;
    box.classList.toggle("is-playing", Boolean(state.playingSrc));
  }
  function pauseOthers(except) {
    if (except !== "youtube") { try { yt.player?.pauseVideo(); } catch (_) {              } }
    if (except !== "spotify") {
      try { sp.controller?.pause(); } catch (_) {              }
      if (!sp.controller && sp.el?.querySelector("iframe")) sp.el.innerHTML = "";
    }
    if (except !== "local") { try { lo.audio?.pause(); } catch (_) {              } }
  }

  nowEl.innerHTML = `<div class="music-slot" data-slot="youtube"></div><div class="music-slot" data-slot="spotify"></div><div class="music-slot" data-slot="local"></div>`;
  const slot = (src) => nowEl.querySelector(`[data-slot="${src}"]`);
  function showSlot(src) { nowEl.querySelectorAll(".music-slot").forEach((el) => el.classList.toggle("is-on", el.dataset.slot === src)); nowEl.dataset.src = src; }

  const yt = { api: false, loading: false, player: null, ready: false, queued: null, el: null };

  function loadYouTubeApi() {
    if (yt.api || yt.loading) return;
    yt.loading = true;
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { if (prev) prev(); yt.api = true; if (yt.queued) playYouTube(yt.queued.it, yt.queued.autoplay); };
    const sc = document.createElement("script");
    sc.src = "https://www.youtube.com/iframe_api";
    sc.async = true;
    sc.onerror = () => { slot("youtube").innerHTML = `<p class="music-loading is-error">${esc(t().musicYTError)}</p>`; };
    document.head.appendChild(sc);
  }

  function playYouTube(it, autoplay) {
    if (!yt.api) {
      yt.queued = { it, autoplay };
      slot("youtube").innerHTML = `<p class="music-loading">♪ …</p>`;
      loadYouTubeApi();
      return;
    }
    yt.queued = null;
    if (!yt.player) {
      slot("youtube").innerHTML = `<div id="ytPlayer"></div>`;
      const vars = { playsinline: 1, rel: 0, modestbranding: 1 };
      if (location.origin && location.origin !== "null") vars.origin = location.origin;
      if (it.list && !it.v) { vars.listType = "playlist"; vars.list = it.list; }
      else if (it.list) vars.list = it.list;
      yt.player = new YT.Player("ytPlayer", {
        width: "100%", height: "100%",
        videoId: it.v || undefined,
        playerVars: vars,
        events: {
          onReady: (e) => { yt.ready = true; if (autoplay) e.target.playVideo(); },
          onStateChange: (e) => {
            setPlaying("youtube", e.data === YT.PlayerState.PLAYING);
            if (e.data === YT.PlayerState.PLAYING) { pauseOthers("youtube"); updateMineTitle(); }
          },
          onError: () => {
            slot("youtube").insertAdjacentHTML("beforeend", "");
            noteEl.innerHTML = esc(t().musicYTError) + (isFile ? `<br /><strong class="music-warn">${esc(t().musicFileWarn)}</strong>` : "");
          },
        },
      });
      return;
    }
    const p = yt.player;
    if (!yt.ready) { setTimeout(() => playYouTube(it, autoplay), 300); return; }
    if (it.list && !it.v) {
      autoplay ? p.loadPlaylist({ listType: "playlist", list: it.list }) : p.cuePlaylist({ listType: "playlist", list: it.list });
    } else if (it.list) {
      autoplay ? p.loadPlaylist({ listType: "playlist", list: it.list, index: 0 }) : p.cuePlaylist({ listType: "playlist", list: it.list });
    } else {
      autoplay ? p.loadVideoById(it.v) : p.cueVideoById(it.v);
    }
    renderNote();
  }

  function updateMineTitle() {
    const it = items.find((i) => i.key === state.current.youtube);
    if (!it || it.group !== "mine" || !yt.player?.getVideoData) return;
    const title = yt.player.getVideoData()?.title;
    if (title && mine[it.mineIndex] && mine[it.mineIndex].title !== title) {
      mine[it.mineIndex].title = title;
      store(MINE_KEY, mine);
      items = buildItems();
      if (state.source === "youtube") renderList();
    }
  }

  const sp = { api: null, failed: false, loading: false, controller: null, el: null, queued: null };

  function loadSpotifyApi() {
    if (sp.api || sp.failed || sp.loading) return;
    sp.loading = true;
    window.onSpotifyIframeApiReady = (api) => { sp.api = api; if (sp.queued) playSpotify(sp.queued.it, sp.queued.autoplay); };
    const sc = document.createElement("script");
    sc.src = "https://open.spotify.com/embed/iframe-api/v1";
    sc.async = true;
    sc.onerror = () => { sp.failed = true; if (sp.queued) playSpotify(sp.queued.it, false); };
    document.head.appendChild(sc);
    setTimeout(() => { if (!sp.api) { sp.failed = true; if (sp.queued) playSpotify(sp.queued.it, false); } }, 8000);
  }

  function playSpotify(it, autoplay) {
    sp.el = slot("spotify");
    const uri = `spotify:album:${it.spotify}`;
    if (sp.controller) { sp.controller.loadUri(uri); if (autoplay) sp.controller.play(); return; }
    if (sp.api) {
      sp.queued = null;
      sp.el.innerHTML = `<div id="spotifyEmbed"></div>`;
      sp.api.createController($("#spotifyEmbed"), { uri, width: "100%", height: 352 }, (ctrl) => {
        sp.controller = ctrl;
        ctrl.addListener("playback_update", (e) => {
          setPlaying("spotify", !e.data.isPaused);
          if (!e.data.isPaused) pauseOthers("spotify");
        });
        if (autoplay) ctrl.play();
      });
    } else if (sp.failed) {
      sp.queued = null;
      sp.el.innerHTML = `
        <iframe class="music-embed" title="Spotify"
          src="https://open.spotify.com/embed/album/${encodeURIComponent(it.spotify)}?utm_source=generator&theme=0"
          height="352" frameborder="0" loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`;
    } else {
      sp.queued = { it, autoplay };
      sp.el.innerHTML = `<p class="music-loading">♪ …</p>`;
      loadSpotifyApi();
    }
  }

  const lo = { audio: null };
  function playLocal(it, autoplay) {
    const el = slot("local");
    el.innerHTML = `
      <div class="music-local">
        <p class="music-local-title">♪ ${esc(it.title)}</p>
        <audio controls preload="metadata" src="${esc(it.file)}"></audio>
      </div>`;
    lo.audio = el.querySelector("audio");
    lo.audio.addEventListener("play", () => { setPlaying("local", true); pauseOthers("local"); });
    lo.audio.addEventListener("pause", () => setPlaying("local", false));
    lo.audio.addEventListener("ended", () => {
      const locals = items.filter((i) => i.src === "local");
      const n = locals[(locals.findIndex((i) => i.key === it.key) + 1) % locals.length];
      if (n && n.key !== it.key) select(n.key, true); else setPlaying("local", false);
    });
    if (autoplay) lo.audio.play().catch(() => {});
  }

  function select(key, autoplay = false) {
    const it = items.find((i) => i.key === key);
    if (!it) return;
    state.current[it.src] = key;
    save();
    listEl.querySelectorAll(".music-item").forEach((b) => b.classList.toggle("is-current", b.dataset.music === key));
    renderOpenLink();
    showSlot(it.src);
    if (autoplay) pauseOthers(it.src);
    if (it.src === "youtube") playYouTube(it, autoplay);
    else if (it.src === "spotify") playSpotify(it, autoplay);
    else playLocal(it, autoplay);
  }

  function setSource(src) {
    if (!SOURCES.includes(src)) return;
    state.source = src;
    save();
    srcBar.querySelectorAll(".music-src").forEach((b) => b.classList.toggle("is-on", b.dataset.src === src));
    renderList();
    renderNote();
    renderOpenLink();
    showSlot(src);

    const loaded = src === "youtube" ? yt.player || yt.queued : src === "spotify" ? sp.controller || sp.el?.innerHTML : lo.audio;
    if (!loaded && state.current[src]) select(state.current[src], false);
  }

  function scrollToCurrent() {
    const el = listEl.querySelector(".is-current");
    if (!el) return;
    const top = el.offsetTop - listEl.offsetTop;
    if (top < listEl.scrollTop || top + el.offsetHeight > listEl.scrollTop + listEl.clientHeight) {
      listEl.scrollTop = Math.max(0, top - listEl.clientHeight / 2 + el.offsetHeight / 2);
    }
  }
  function open(on = !box.classList.contains("is-open")) {
    box.classList.toggle("is-open", on);
    toggle.setAttribute("aria-expanded", String(on));
    if (on && !state.built) {
      state.built = true;
      setSource(state.source);
    }
    if (on) setTimeout(scrollToCurrent, 50);
  }

  toggle.addEventListener("click", (e) => { e.stopPropagation(); open(); });
  closeBtn.addEventListener("click", () => { open(false); toggle.focus(); });
  srcBar.addEventListener("click", (e) => { const b = e.target.closest("[data-src]"); if (b) setSource(b.dataset.src); });
  listEl.addEventListener("click", (e) => {
    const rm = e.target.closest("[data-remove]");
    if (rm) {
      const idx = Number(rm.dataset.remove);
      const removedKey = `yt-mine-${mine[idx]?.v || mine[idx]?.list}`;
      mine.splice(idx, 1);
      store(MINE_KEY, mine);
      items = buildItems();
      if (state.current.youtube === removedKey) state.current.youtube = items.find((i) => i.src === "youtube")?.key;
      renderList();
      return;
    }
    const b = e.target.closest("[data-music]");
    if (b) select(b.dataset.music, true);
  });
  listEl.addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    const input = form.querySelector("input");
    const msg = form.querySelector(".music-add-msg");
    const parsed = parseYouTube(input.value);
    if (!parsed) { msg.textContent = t().musicBadLink; return; }
    const id = parsed.v || parsed.list;
    let idx = mine.findIndex((m) => (m.v || m.list) === id);
    if (idx < 0) {
      mine.push({ title: parsed.v ? `YouTube · ${parsed.v}` : `Playlist · ${parsed.list}`, ...parsed });
      store(MINE_KEY, mine);
      items = buildItems();
      idx = mine.length - 1;
    }
    renderList();
    select(`yt-mine-${id}`, true);
    setTimeout(scrollToCurrent, 50);
  });

  document.addEventListener("click", (e) => { if (!box.contains(e.target)) open(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && box.classList.contains("is-open")) { e.stopPropagation(); open(false); toggle.focus(); }
  }, true);
  panel.addEventListener("keydown", (e) => e.stopPropagation());
  document.addEventListener("diary:lang", renderText);

  renderText();

  window.TravelersMusic = { open: () => open(true), close: () => open(false), select, setSource, parseYouTube, get items() { return items; } };
})();
