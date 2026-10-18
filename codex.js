(() => {
  "use strict";

  const G = () => window.DiaryAPI.genshin;

  const SLUG = /^[a-z][a-z0-9'_-]*$/;

  const titleCase = (slug = "") =>
    String(slug).split(/[-_]/).filter(Boolean)
      .map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")
      .replace(/ S /g, "'s ").replace(/ S$/, "'s");

  function humanize(key) {
    const LABELS = {
      skillTalents: "Talents", passiveTalents: "Passive Talents", constellations: "Constellations",
      ascension_materials: "Ascension Materials", specialDish: "Special Dish", outfits: "Outfits",
      baseAttack: "Base ATK", subStat: "Sub-stat", passiveName: "Passive", passiveDesc: "Passive Effect",
      ascensionMaterial: "Ascension Material", max_rarity: "Max Rarity", hasRecipe: "Has Recipe",
      "elemental-description": "Elemental Variants", "mora-gained": "Mora Gained",
      adventureRank: "Adventure Rank", recommendedLevel: "Recommended Level", leyLineDisorder: "Ley Line Disorder",
      adventureExperience: "Adventure EXP", companionshipExperience: "Companionship EXP",
      drop_min: "Min", drop_max: "Max", "minimum-level": "Min. Level", controllingEntity: "Governed by",
    };
    if (LABELS[key]) return LABELS[key];
    const pc = /^(\d)-piece_bonus$/.exec(key);
    if (pc) return `${pc[1]}-Piece Bonus`;
    const lv = /^level_(\d+)$/.exec(key);
    if (lv) return `Level ${lv[1]}`;
    return String(key)
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .split(/[-_\s]+/).filter(Boolean)
      .map((w) => (/^\d/.test(w) ? w : w[0].toUpperCase() + w.slice(1)))
      .join(/^\d/.test(key) ? "-" : " ")
      .replace(/^(\d)-(\w)/, "$1-$2");
  }

  const isScalar = (v) => v === null || ["string", "number", "boolean"].includes(typeof v);
  const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);

  function fmtScalar(v, key = "") {
    if (typeof v === "boolean") return v ? "Yes" : "No";
    if (key === "rarity" && typeof v === "number") return "★".repeat(v);
    if (key === "birthday" && /^0000-\d\d-\d\d$/.test(v)) {
      const [, m, d] = v.split("-");
      return new Date(Date.UTC(2000, m - 1, d)).toLocaleDateString("en", { month: "long", day: "numeric", timeZone: "UTC" });
    }
    if (typeof v === "number") return v.toLocaleString("en");
    if (typeof v === "string" && SLUG.test(v) && v.includes("-")) return titleCase(v);
    return v == null ? "" : String(v);
  }
  function fmtList(arr) {
    if (arr.every((x) => typeof x === "string" && SLUG.test(x))) return arr.map(titleCase).join(", ");
    return arr.map((x) => fmtScalar(x)).join(", ");
  }

  function pairRows(arr) {
    const first = arr[0] || {};
    const nameKey = ["name", "item"].find((k) => k in first);
    if (!nameKey) return null;
    const keys = Object.keys(first).filter((k) => k !== nameKey);
    if (!keys.length || keys.some((k) => !isScalar(first[k]))) return null;

    if (arr.some((o) => isObj(o) && ["description", "effect", "text", "unlock"].some((k) => k in o))) return null;
    if (!arr.every((o) => isObj(o) && Object.keys(o).every((k) => k === nameKey || isScalar(o[k])))) return null;
    return arr.map((o) => {
      const rest = Object.keys(o).filter((k) => k !== nameKey);
      let val;
      if ("drop_min" in o && "drop_max" in o) val = `${o.drop_min}–${o.drop_max}`;
      else if (rest.length === 1 && /value|quantity|count/i.test(rest[0])) {
        val = typeof o[rest[0]] === "number" ? `× ${fmtScalar(o[rest[0]])}` : fmtScalar(o[rest[0]]);
      }
      else val = rest.map((k) => (k === "rarity" ? fmtScalar(o[k], k) : `${humanize(k)} ${fmtScalar(o[k], k)}`)).join(" · ");
      return [o[nameKey], val];
    });
  }

  function toCard(obj, fallbackTitle = "", depth = 0) {
    const TITLE_KEYS = ["name", "item", "element", "day"];
    const TEXT_KEYS = ["description", "effect", "text"];
    const SUB_KEYS = ["unlock", "type", "source", "set"];
    const tk = TITLE_KEYS.find((k) => typeof obj[k] === "string");
    let title = tk ? obj[tk] : fallbackTitle;
    if (tk === "day") title = titleCase(obj.day);
    if (!tk && typeof obj.level === "number") title = `Level ${obj.level}`;
    const card = { title: title || "", sub: "", text: "", rows: [], sections: [] };
    const used = new Set([tk]);
    if (!tk && typeof obj.level === "number") used.add("level");

    const sk = SUB_KEYS.find((k) => typeof obj[k] === "string" && !used.has(k));
    if (sk) { card.sub = obj[sk]; used.add(sk); }
    const xk = TEXT_KEYS.find((k) => typeof obj[k] === "string" && !used.has(k));
    if (xk) { card.text = obj[xk]; used.add(xk); }

    for (const [k, v] of Object.entries(obj)) {
      if (used.has(k) || v == null || v === "") continue;
      if (k === "image" || k === "id") continue;
      if (typeof v === "string" && /^[A-Z][A-Z_]+$/.test(v)) continue;
      if (isScalar(v)) card.rows.push([humanize(k), fmtScalar(v, k)]);
      else if (Array.isArray(v) && v.every(isScalar)) card.rows.push([humanize(k), fmtList(v)]);
      else if (Array.isArray(v)) {
        const pr = pairRows(v);
        if (pr) card.rows.push(...pr.map(([a, b]) => [a, b]));
        else if (depth < 2) card.sections.push({ label: humanize(k), items: v.filter(isObj).map((o) => toCard(o, "", depth + 1)) });
      } else if (isObj(v) && depth < 2) {
        card.sections.push(toSection(k, v, depth + 1));
      }
    }
    return card;
  }

  function toSection(key, value, depth = 0) {
    const label = humanize(key);
    if (Array.isArray(value)) {
      const pr = pairRows(value);
      if (pr) return { label, items: [{ title: "", sub: "", text: "", rows: pr, sections: [] }] };
      return { label, items: value.map((v) => (isObj(v) ? toCard(v, "", depth) : { title: fmtScalar(v), rows: [], sections: [] })) };
    }
    if (isObj(value) && typeof value.name === "string") return { label, items: [toCard(value, "", depth)] };
    if (isObj(value)) {

      const items = Object.entries(value).map(([k, v]) => {
        if (Array.isArray(v)) {
          const pr = pairRows(v);
          if (pr) return { title: humanize(k), sub: "", text: "", rows: pr, sections: [] };
          return { title: humanize(k), sub: "", text: "", rows: [[humanize(k), fmtList(v.map((x) => (isObj(x) ? x.name || "" : x)))]], sections: [] };
        }
        if (isObj(v)) return toCard(v, humanize(k), depth);
        return { title: humanize(k), sub: "", text: fmtScalar(v, k), rows: [], sections: [] };
      });
      return { label, items };
    }
    return { label, items: [{ title: "", sub: "", text: fmtScalar(value, key), rows: [], sections: [] }] };
  }

  function toDetail(data, { skip = [], factsFirst = [], textKey = "description" } = {}) {
    const facts = [];
    const sections = [];
    const variants = [];
    const skipSet = new Set(["name", "id", "key", "name_key", "vision_key", "weapon_type", "image", textKey, ...skip]);
    const keys = [...factsFirst.filter((k) => k in data), ...Object.keys(data).filter((k) => !factsFirst.includes(k))];
    for (const k of keys) {
      const v = data[k];
      if (skipSet.has(k) || v == null || v === "" || (Array.isArray(v) && !v.length)) continue;
      if (isScalar(v)) facts.push([humanize(k), fmtScalar(v, k)]);
      else if (Array.isArray(v) && v.every(isScalar)) facts.push([humanize(k), fmtList(v)]);
      else if (isObj(v) && typeof v.name === "string" && k !== "specialDish") variants.push(toCard(v));
      else sections.push(toSection(k, v));
    }
    if (variants.length) sections.push({ label: "Variants", items: variants });
    const body = typeof data[textKey] === "string" ? data[textKey].split(/\n{2,}/) : [];
    return { facts, sections, body };
  }

  async function pickImage(path, prefs) {
    const imgs = await G().listImages(path);
    const kind = prefs.find((p) => imgs.includes(p)) || (prefs.length ? null : imgs[0]);
    return kind ? G().imageUrl(path, kind) : (imgs[0] ? G().imageUrl(path, imgs[0]) : G().imageUrl(path, prefs[0]));
  }

  async function imageIf(path, kind) {
    const imgs = await G().listImages(path);
    if (imgs.length && !imgs.includes(kind)) return null;
    return G().imageUrl(path, kind);
  }
  async function gallery(path, exclude = [], labeler = titleCase) {
    const imgs = (await G().listImages(path)).filter((k) => !exclude.some((e) => (e instanceof RegExp ? e.test(k) : e === k)));
    return imgs.map((k) => ({ src: G().imageUrl(path, k), label: labeler(k) }));
  }

  const getEN = (path) => G().get(path, "en");

  function folderType({ type, icon, sketch }) {
    return {
      sketch,
      async list() {
        const ids = await G().listIds(type);
        const results = new Array(ids.length);
        let cursor = 0;
        await Promise.all(Array.from({length: Math.min(8, ids.length)}, async () => {
          while (cursor < ids.length) {
            const index = cursor++; const id = ids[index];
            const data = await getEN(`${type}/${id}`).then(r => r.data).catch(() => null);
            results[index] = ({
          key: id,
          name: data?.name || titleCase(id),
          rarity: Number(data?.rarity ?? data?.max_rarity) || null,
          icon: window.DiaryImages?.resolve(`${type}/${id}`,id,icon||[]).primary || null,
            });
          }
        }));
        return results;
      },
      async name(key) { return (await getEN(`${type}/${key}`)).data.name; },
    };
  }

  function collectItems(json, group, imagePath) {
    const out = [];
    const walk = (node, keyHint, ctx, crumbs) => {
      const crumb = keyHint && keyHint !== "items" ? [...crumbs, keyHint] : crumbs;
      if (Array.isArray(node)) { node.forEach((n) => walk(n, null, ctx, crumb)); return; }
      if (!isObj(node)) return;

      const own = {};
      for (const [k, v] of Object.entries(node)) {
        if (k === "items" || k === "name" || k === "id") continue;
        if (isScalar(v) || (Array.isArray(v) && v.every(isScalar))) own[k] = v;
      }
      if (typeof node.name === "string") {
        const id = node.id || keyHint;
        out.push({ key: `${group}/${id}`, id, group, name: node.name, data: { ...ctx, ...node }, crumbs, imagePath });
        if (Array.isArray(node.items)) walk(node.items, null, { ...ctx, ...own }, crumbs);
        return;
      }
      const nextCtx = { ...ctx, ...own };
      for (const [k, v] of Object.entries(node)) {
        if (isObj(v) || Array.isArray(v)) walk(v, k, nextCtx, crumb);
      }
    };
    walk(json, null, {}, []);
    return out;
  }

  function groupedType({ type, groups, sketch, fallbackIcon }) {
    let cache = null;
    async function all() {
      if (!cache) {
        cache = (async () => {
          const ids = groups || (await G().listIds(type));
          const lists = await Promise.all(ids.map(async (g) => {
            try {
              const { data } = await getEN(`${type}/${g}`);
              return collectItems(data, g, `${type}/${g}`);
            } catch (_) { return []; }
          }));
          const items = lists.flat();

          const byGroup = {};
          for (const g of ids) byGroup[g] = await G().listImages(`${type}/${g}`);
          for (const it of items) {
            const imgs = byGroup[it.group] || [];
            it.icon = window.DiaryImages?.resolve(it.imagePath, it.name, [it.id]).primary || fallbackIcon || null;

            it.icon = (window.DiaryImageCatalog?.api[it.imagePath] || imgs).includes(it.id) ? (window.DiaryImages?.original(it.imagePath,[it.id]) || G().imageUrl(it.imagePath,it.id)) : (window.DiaryImages?.supplement(it.imagePath,it.name)?.url || null);
          }
          return items;
        })().catch((e) => { cache = null; throw e; });
      }
      return cache;
    }
    return {
      sketch,
      grouped: true,
      async list() {
        return (await all()).map((it) => ({ key: it.key, name: it.name, icon: it.icon, rarity: Number(it.data.rarity) || null, group: titleCase(it.group) }));
      },
      async name(key) { return (await all()).find((i) => i.key === key)?.name || titleCase(key); },
      async detail(key) {
        const it = (await all()).find((i) => i.key === key);
        if (!it) throw new Error(`${type} ${key} not found`);
        const d = toDetail(it.data, { factsFirst: ["rarity", "type", "effect"] });
        const where = [titleCase(it.group), ...it.crumbs.map(titleCase)].join(" · ");
        return {
          key, title: it.name, sub: where,
          image: it.icon, imageFit: "contain",
          stars: typeof it.data.rarity === "number" ? it.data.rarity : null,
          ...d, fallback: false,
        };
      },
    };
  }

  const TALENT_ICON = { NORMAL_ATTACK: "talent-na", ELEMENTAL_SKILL: "talent-skill", ELEMENTAL_BURST: "talent-burst" };

  const DEFS = {

    characters: {
      ...folderType({ type: "characters", icon: ["icon-big", "icon", "icon-side"], sketch: "wings" }),
      async detail(key) {
        const path = `characters/${key}`;
        const { data } = await getEN(path);
        const imgs = await G().listImages(path);
        const has = (k) => imgs.length === 0 || imgs.includes(k);
        const d = toDetail(data, {
          skip: ["title", "rarity"],
          factsFirst: ["vision", "weapon", "gender", "nation", "affiliation", "birthday", "release", "constellation"],
        });

        for (const s of d.sections) {
          if (s.label === "Talents") {
            (data.skillTalents || []).forEach((t, i) => {
              const k = TALENT_ICON[t.type];
              if (s.items[i] && k && has(k)) s.items[i].icon = G().imageUrl(path, k);
            });
          }
          if (s.label === "Passive Talents") {
            s.items.forEach((it, i) => { if (has(`talent-passive-${i}`)) it.icon = G().imageUrl(path, `talent-passive-${i}`); });
          }
          if (s.label === "Constellations") {
            (data.constellations || []).forEach((c, i) => {
              const k = `constellation-${c.level || i + 1}`;
              if (s.items[i] && has(k)) s.items[i].icon = G().imageUrl(path, k);
            });
          }
          if (s.label === "Outfits") {
            (data.outfits || []).forEach((o, i) => {
              if (s.items[i] && o.image && has(o.image)) s.items[i].icon = G().imageUrl(path, o.image);
            });
          }
        }
        const gal = await gallery(path, [/^talent-/, /^constellation-\d/, /^outfit-/, "icon-side"]);
        if (gal.length) d.sections.push({ label: "Gallery", gallery: gal });
        return {
          key, title: data.name, sub: data.title || "",
          image: await pickImage(path, ["portrait", "card", "icon-big"]), imageFit: "cover",
          stars: data.rarity, ...d, fallback: false,
        };
      },
    },

    weapons: {
      ...folderType({ type: "weapons", icon: ["icon"], sketch: "sword" }),
      async detail(key) {
        const path = `weapons/${key}`;
        const { data } = await getEN(path);
        const d = toDetail(data, { skip: ["passiveName", "passiveDesc", "rarity"], factsFirst: ["type", "baseAttack", "subStat", "location", "ascensionMaterial"] });
        if (data.passiveName || data.passiveDesc) {
          d.sections.unshift({ label: "Passive", items: [{ title: data.passiveName || "", sub: "", text: data.passiveDesc || "", rows: [], sections: [] }] });
        }
        const gal = await gallery(path, ["icon"]);
        if (gal.length) d.sections.push({ label: "Gallery", gallery: gal });
        return {
          key, title: data.name, sub: data.type || "",
          image: await pickImage(path, ["icon"]), imageFit: "contain",
          stars: data.rarity, ...d, fallback: false,
        };
      },
    },

    artifacts: {
      ...folderType({ type: "artifacts", icon: ["flower-of-life", "plume-of-death", "circlet-of-logos", "sands-of-eon", "goblet-of-eonothem"], sketch: "flower" }),
      async detail(key) {
        const path = `artifacts/${key}`;
        const { data } = await getEN(path);
        const bonus = Object.keys(data).filter((k) => /piece_bonus$/.test(k)).sort();
        const d = toDetail(data, { skip: ["max_rarity", ...bonus] });
        d.sections.unshift({
          label: "Set Bonus",
          items: bonus.map((k) => ({ title: humanize(k), sub: "", text: data[k], rows: [], sections: [] })),
        });
        const PIECES = ["flower-of-life", "plume-of-death", "sands-of-eon", "goblet-of-eonothem", "circlet-of-logos"];
        const gal = (await gallery(path)).sort((a, b) => PIECES.indexOf(a.label.toLowerCase().replace(/ /g, "-")) - PIECES.indexOf(b.label.toLowerCase().replace(/ /g, "-")));
        if (gal.length) d.sections.push({ label: "Pieces", gallery: gal, open: true });
        d.facts.unshift(["Max Rarity", "★".repeat(data.max_rarity || 0)]);
        return {
          key, title: data.name, sub: "",
          image: await pickImage(path, PIECES), imageFit: "contain",
          stars: data.max_rarity, ...d, fallback: false,
        };
      },
    },

    materials: groupedType({ type: "materials", sketch: "herb" }),

    consumables: groupedType({ type: "consumables", groups: ["food", "potions"], sketch: "herb" }),

    domains: {
      ...folderType({ type: "domains", icon: null, sketch: "peaks" }),
      noImages: true,
      perPage: 14,
      async list() {
        const ids = await G().listIds("domains");
        return Promise.all(ids.map(async (id) => {
          try {
            const { data } = await getEN(`domains/${id}`);
            return { key: id, name: data.name || titleCase(id), icon: window.DiaryImages?.resolve(`domains/${id}`, data.name).primary, meta: [data.type, data.nation].filter(Boolean).join(" · ") };
          } catch (_) {
            return { key: id, name: titleCase(id), meta: "" };
          }
        }));
      },
      async detail(key) {
        const { data } = await getEN(`domains/${key}`);
        const d = toDetail(data, { factsFirst: ["type", "nation", "location", "recommendedElements"] });
        return { key, title: data.name, sub: data.type || "", image: null, imageFit: "contain", stars: null, ...d, fallback: false };
      },
    },

    elements: {
      ...folderType({ type: "elements", icon: ["icon"], sketch: "wind" }),
      async detail(key) {
        const path = `elements/${key}`;
        const { data } = await getEN(path);
        const d = toDetail(data);
        return { key, title: data.name, sub: "", image: await pickImage(path, ["icon"]), imageFit: "contain", stars: null, ...d, fallback: false };
      },
    },

    enemies: {
      ...folderType({ type: "enemies", icon: ["icon", "portrait"], sketch: "volcano" }),
      async detail(key) {
        const path = `enemies/${key}`;
        const { data } = await getEN(path);
        const d = toDetail(data, { factsFirst: ["type", "family", "faction", "region", "elements", "mora-gained"] });
        const gal = await gallery(path, ["icon"]);
        if (gal.length) d.sections.push({ label: "Gallery", gallery: gal });
        return {
          key, title: data.name, sub: data.type || "",
          image: (await G().listImages(path)).length ? await pickImage(path, ["portrait", "icon"]) : null,
          imageFit: "contain", stars: null, ...d, fallback: false,
        };
      },
    },

    bosses: {
      ...folderType({ type: "boss/weekly-boss", icon: ["icon", "portrait"], sketch: "volcano" }),
      async detail(key) {
        const path = `boss/weekly-boss/${key}`;
        const { data } = await getEN(path);
        const d = toDetail(data);

        const drops = await gallery(path, ["icon", "portrait"]);
        if (drops.length) d.sections.unshift({ label: "Drop Gallery", gallery: drops, open: true });
        return {
          key, title: data.name, sub: "Weekly Boss",
          image: await pickImage(path, ["portrait", "icon"]), imageFit: "contain",
          stars: null, ...d, fallback: false,
        };
      },
    },
  };

  window.DiaryCodex = {
    defs: DEFS,
    has: (id) => Boolean(DEFS[id]),
    list: (id) => DEFS[id].list(),
    name: (id, key) => DEFS[id].name(key),
    detail: (id, key) => DEFS[id].detail(key),

    utils: { toDetail, toSection, toCard, humanize, titleCase },
  };
})();
