window.DiaryAPI = {};

(() => {
  "use strict";

  const GENSHIN = {
    enabled: true,
    source: "server",
    github: { owner: "UOHZIQIZ", repo: "Genshin-Impact-API", branch: "mistress" },
    server: "https://genshin.jmp.blue",

    langMap: { zh: "zh-CN", en: "en", fr: "fr", ja: "jp", ko: "ko" },
    fallbackLang: "en",
    timeout: 10000,
  };

  const rawBase = () => {
    const g = GENSHIN.github;
    return `https://raw.githubusercontent.com/${g.owner}/${g.repo}/${g.branch}/assets`;
  };

  async function fetchJSON(url) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), GENSHIN.timeout);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }

  const SESSION_KEY = () => `travelers-diary.gi-index.${GENSHIN.github.owner}/${GENSHIN.github.repo}@${GENSHIN.github.branch}`;
  let indexPromise = null;

  function buildIndex(paths) {
    const data = {};
    const images = {};
    for (const p of paths) {
      let m = p.match(/^assets\/data\/(.+)\/([^/]+)\.json$/);
      if (m) { (data[m[1]] ||= []).push(m[2]); continue; }
      m = p.match(/^assets\/images\/(.+)\/([^/]+)$/);
      if (m) (images[m[1]] ||= []).push(m[2].replace(/\.(png|jpe?g|webp)$/i, ""));
    }
    return { data, images };
  }

  function githubIndex() {
    if (indexPromise) return indexPromise;
    indexPromise = (async () => {
      try {
        const saved = sessionStorage.getItem(SESSION_KEY());
        if (saved) return JSON.parse(saved);
      } catch (_) {              }
      const g = GENSHIN.github;
      const tree = await fetchJSON(`https://api.github.com/repos/${g.owner}/${g.repo}/git/trees/${g.branch}?recursive=1`);
      const index = buildIndex((tree.tree || []).filter((n) => n.type === "blob").map((n) => n.path));
      try { sessionStorage.setItem(SESSION_KEY(), JSON.stringify(index)); } catch (_) {               }
      return index;
    })().catch((e) => { indexPromise = null; throw e; });
    return indexPromise;
  }

  const sources = {
    github: {
      async listIds(type) {
        const { data } = await githubIndex();
        const prefix = `${type}/`;
        return Object.keys(data)
          .filter((k) => k.startsWith(prefix) && !k.slice(prefix.length).includes("/"))
          .map((k) => k.slice(prefix.length))
          .sort();
      },
      async langsOf(path) {
        const { data } = await githubIndex();
        return data[path] || [];
      },
      async getRaw(path, apiLang) {
        return fetchJSON(`${rawBase()}/data/${path}/${apiLang}.json`);
      },
      async listImages(path) {
        const { images } = await githubIndex();
        return images[path] || [];
      },
      imageUrl: (path, kind) => `${rawBase()}/images/${path}/${kind}`,
    },
    server: {
      async listIds(type) {
        const r = await fetchJSON(`${GENSHIN.server}/${type}`);
        return Array.isArray(r) ? r.sort() : [];
      },
      async langsOf() { return null; },
      async getRaw(path, apiLang) {
        return fetchJSON(`${GENSHIN.server}/${path}?lang=${encodeURIComponent(apiLang)}`);
      },
      async listImages(path) {
        const r = await fetchJSON(`${GENSHIN.server}/${path}/list`);
        return Array.isArray(r) ? r : [];
      },
      imageUrl: (path, kind) => `${GENSHIN.server}/${path}/${kind}`,
    },
  };

  let active = null;
  async function run(method, ...args) {
    const primary = active || GENSHIN.source;
    try {
      return await sources[primary][method](...args);
    } catch (err) {
      const other = primary === "github" ? "server" : "github";
      if (active) throw err;
      console.warn(`[Genshin API] ${primary} unavailable; trying ${other}:`, err.message);
      const r = await sources[other][method](...args);
      active = other;
      return r;
    }
  }

  const jsonCache = new Map();

  async function get(path, lang) {
    const want = GENSHIN.langMap[lang] || GENSHIN.fallbackLang;
    const key = `${path}|${want}`;
    if (jsonCache.has(key)) return jsonCache.get(key);

    const p = (async () => {
      const langs = await run("langsOf", path).catch(() => null);
      const order = [want, GENSHIN.fallbackLang].filter((l, i, a) => a.indexOf(l) === i);
      const tryOrder = langs ? order.filter((l) => langs.includes(l)) : order;
      let lastErr = new Error(`No data for ${path}`);
      for (const l of tryOrder) {
        try {
          const data = await run("getRaw", path, l);
          if (data && data.error) throw new Error(data.error);
          return { data, lang: l, fallback: l !== want };
        } catch (e) { lastErr = e; }
      }
      throw lastErr;
    })();
    jsonCache.set(key, p);
    p.catch(() => jsonCache.delete(key));
    return p;
  }

  window.DiaryAPI.genshin = {
    config: GENSHIN,
    get enabled() { return GENSHIN.enabled; },
    listIds: (type) => run("listIds", type),
    listImages: (path) => run("listImages", path).catch(() => []),
    imageUrl: (path, kind) => window.DiaryImageCatalog?.api[path]?.includes(kind)
      ? `https://raw.githubusercontent.com/genshindev/api/mistress/assets/images/${path}/${kind}`
      : sources[active || GENSHIN.source].imageUrl(path, kind),
    get,

    configure(opts = {}) {
      Object.assign(GENSHIN, opts, { github: { ...GENSHIN.github, ...(opts.github || {}) } });
      jsonCache.clear(); indexPromise = null; active = null;
    },
  };
})();
