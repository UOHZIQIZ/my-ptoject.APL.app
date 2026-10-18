# Genshin Impact Reference Website

A static reference website for browsing regions, characters, weapons, artifacts, materials, food, domains, elements, enemies and weekly bosses.

## Run
Open the folder in VS Code and use Live Server, or run `python3 -m http.server 8000`. Open http://localhost:8000. For GitHub Pages, publish the repository root. YouTube playback requires HTTP or HTTPS.

## Features
Browse categories, search by English name, filter available star ratings, and open detail pages. Entries sort by ascending rarity and then name. Artifact sets use maximum rarity. Search, filter and page state survive navigation within the current visit. Reloading resets that browsing state.

English is the default interface language. Chinese, French, Japanese and Korean remain available. Explicit language selections are saved locally. API reference information is English; curated region introductions follow the interface language. The music player supports YouTube, Spotify and configured local audio.

## Files
- `index.html`: page structure and toolbar
- `reference.js`: category navigation, search, filters and detail rendering
- `reference.css`: responsive reference layout
- `style.css`: base appearance, background, language menu and music player
- `api.js`: REST requests, caching and GitHub fallback
- `codex.js`: API data conversion
- `i18n.js`: interface translations and language preferences
- `data/diary-data.js`: curated region introductions
- `data/image-catalog.js` / `image-resolver.js`: verified image paths and fallbacks
- `music.js` / `data/music.js`: player and track configuration
- `assets/`: background, region photos and supplementary images
- `IMAGE-SOURCES.md`: image attribution

## Data
Primary REST API: https://genshin.jmp.blue
Source and documentation: https://github.com/genshindev/api
GitHub fallback: UOHZIQIZ/Genshin-Impact-API, branch mistress.

JSON is fetched on demand. Search and filtering operate on loaded category data. Images use verified source paths or local supplementary artwork. Some legacy records have no confirmed artwork and retain a placeholder. Family-level enemy images identify a representative variant.

This is a community reference project, not an official HoYoverse product. It does not access game accounts or player progress. Image and music rights belong to their respective owners.
