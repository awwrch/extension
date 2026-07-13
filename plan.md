# WeebCentral Paperback 0.8 Extension — Implementation Plan

## Context

Build a new Paperback source extension for weebcentral.com, adding full manga reading support (discovery, search with genre/status/type filters and sort toggle, chapter viewing) to a Paperback 0.8 iOS manga reader app. The extension will be added as a sibling source folder (`src/WeebCentral/`) in an existing multi-source Paperback extension project that currently contains only a Komga source (`src/Paperback/`).

weebcentral.com is an HTML-rendered, Cloudflare-protected site with no public API. The extension must handle Cloudflare challenge mitigation via Paperback's native bypass flow (`getCloudflareBypassRequestAsync`). It will support browse/read only (no progress tracking). Search filtering will expose genre, series status, series type, and sort-order controls that are scraped dynamically from the site's `/search` page.

---

## Architecture Overview

**Folder structure** (`src/WeebCentral/`):
```
WeebCentral.ts              (SourceInfo + Source class + interceptor)
Common.ts                   (shared parsing, scraping, state helpers)
Settings.ts                 (minimal: "clear cached tags" button)
includes/icon.png           (placeholder, reused from src/Paperback/includes/)
```

**No new files needed** beyond these (no `Languages.ts` — hardcode `'EN'` since site is English-only; no `data-contracts.ts` — hand-write minimal cheerio-based parsing instead of auto-generated API types).

**Build integration**: `@paperback/toolchain` auto-discovers the new source folder and bundles it alongside Paperback on `npm run bundle` — no central registry changes needed.

---

## Implementation Details

### 1. SourceInfo & Interceptor (WeebCentral.ts)

```ts
export const WeebCentralInfo: SourceInfo = {
    version: '1.0.0',
    name: 'WeebCentral',
    icon: 'icon.png',
    author: '<author>',
    description: 'Extension that pulls manga from weebcentral.com',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: 'https://weebcentral.com',
    sourceTags: [],
    intents: SourceIntents.MANGA_CHAPTERS
        | SourceIntents.HOMEPAGE_SECTIONS
        | SourceIntents.CLOUDFLARE_BYPASS_REQUIRED
        | SourceIntents.SETTINGS_UI  // only for "clear cached tags" button
}
```

**WeebCentralRequestInterceptor** pattern (mirrors `KomgaRequestInterceptor`):
- Injects browser-like headers (User-Agent, Referer) on every request to reduce Cloudflare mitigation likelihood.
- Only sets defaults; never overrides caller-supplied headers.
- **Must reassign** `request.headers = headers` (not mutate in place) — required for native Swift bridge.

**getCloudflareBypassRequestAsync()**: returns a simple GET request to `https://weebcentral.com` for the app to solve in a webview; the app harvests cookies and retries source requests automatically.

**Cloudflare detection** (in Common.ts::isCloudflareChallenge):
- Check `response.headers['cf-mitigated']` for 'challenge' substring.
- Fallback: status 403/503 + body contains 'Just a moment' / 'cf-chl' / 'challenge-platform'.

**scheduleAndUnwrap(requestManager, request)** wrapper: executes `requestManager.schedule(request, 1)`, detects Cloudflare challenges, and throws with descriptive error so the app's bypass flow kicks in. Use this instead of raw `schedule()` everywhere.

---

### 2. Core Source Methods

#### getMangaDetails(mangaId)
- Fetch `{WEEBCENTRAL_BASE_URL}/series/{mangaId}` as HTML.
- Parse via cheerio: title, image, description, author, artist, status text, genre tags.
- Status text → Paperback status enum (Ongoing/Completed/Cancelled/Hiatus).
- Return `SourceManga` with normalized `MangaInfo`.

#### getChapters(mangaId)
- Fetch `{WEEBCENTRAL_BASE_URL}/series/{mangaId}/full-chapter-list` as HTML.
- Extract `<a href="/chapters/...">` links; parse chapter id, number (regex from title), publish datetime, official-translation marker.
- Return `Chapter[]` with langCode='EN'.

#### getChapterDetails(mangaId, chapterId)
- Fetch `{WEEBCENTRAL_BASE_URL}/chapters/{chapterId}/images?reading_style=long_strip` as HTML.
- Extract `<img src|data-src>` URLs from reading content section.
- Return `ChapterDetails` with page URL array (absolute or relative, verified at serve time).

---

### 3. Search & Discovery

#### getSearchTags()
- Scrape `/search` page HTML once; parse genre/status/type/sort facets from `<fieldset>` or `<label>` elements.
- Cache in `SourceStateManager` (state key: `'searchTagsCache'`) — site facets change rarely.
- On parse failure or network error, return placeholder `TagSection` (don't throw).
- **Tag ID prefixing scheme** (matches Komga's pattern):
  - `genre-{value}` → genre facet
  - `status-{value}` → series status facet
  - `type-{value}` → series type facet
  - `sort-asc` / `sort-desc` → modeled as a 4th pseudo-tag section (no native sort field in SearchRequest 0.8)

#### getSearchResults(searchQuery, metadata)
- Dispatch `searchQuery.includedTags` by prefix: extract filter values, build query params.
- Encode sort direction from `sort-asc` / `sort-desc` tag presence (or via `order=Ascending|Descending` query param — verify against live site).
- Fetch `/search?text=...&included_tag=...&status=...&type=...&order=...&page=...` as HTML.
- Parse result tiles (same as homepage tiles).
- Return `PagedResults`; metadata is `{page: page+1}` or `undefined` if no results.
- On error, return placeholder tiles (don't throw).

---

### 4. Homepage & Pagination

#### getHomePageSections(sectionCallback)
- Define **Latest Updates** section (paginated, `containsMoreItems: true`).
- Optionally define **Featured** section if homepage HTML supports it (verify at serve time — drop if selectors find nothing).
- Wrap each in try/catch; on error, leave section empty and log (don't throw).
- Fetch `/latest-updates/1` and parse tiles using shared `parseMangaTileList()`.
- Call `sectionCallback(section)` once empty, again after populating.

#### getViewMoreItems(sectionId, metadata)
- If sectionId is 'latest', fetch `/latest-updates/{page}` where page = `metadata?.page ?? 1`.
- Parse tiles, return `PagedResults` with `metadata: {page: page+1}` (or `undefined` if zero results = last page).

---

### 5. Common.ts Helpers

**Constants & parsing utilities:**
- `WEEBCENTRAL_BASE_URL` constant
- `parseMangaStatus(raw: string): string` — maps status text to Paperback enum values
- `parseMangaIdFromHref(href: string): string` — extracts id/slug from href
- `parseChapterId(href: string): string` — extracts chapter id from chapter link

**HTML parsing functions** (all accept cheerio: CheerioAPI, html: string):
- `parseMangaDetails()` → `SourceManga`
- `parseChapterList()` → `Chapter[]`
- `parseChapterImages()` → `string[]` (page URLs)
- `parseMangaTileList()` → `PartialSourceManga[]` (reused by homepage, search, view-more)
- `parseSearchFacets()` → `TagSection[]` (genres, statuses, types, sort)

**Network & state:**
- `scheduleAndUnwrap(requestManager, request)` → `Response` (wraps schedule, throws on CF challenge)
- `isCloudflareChallenge(response)` → `boolean`
- `getCachedSearchTags(stateManager)` → `TagSection[] | undefined`
- `setCachedSearchTags(stateManager, sections)` → `Promise<void>`
- `getLatestUpdatesTiles(requestManager, page)` → `PartialSourceManga[]` (helper for homepage/view-more)
- `getServerUnavailableMangaTiles()` → `PartialSourceManga[]` (placeholder tile, copy from Paperback's Common.ts)
- `searchRequest(query, metadata, requestManager, cheerio)` → `PagedResults` (full search dispatcher)

---

### 6. Settings.ts (Minimal)

**Single button**: "Clear Cached Search Filters"
- Calls `setCachedSearchTags(stateManager, undefined)` to evict cache.
- No credentials, no server URL settings — pure placeholder.

**Option to cut entirely** on first pass (replace with empty `getSourceMenu()` returning empty section) — cache would just live per app session with no manual eviction. Note this trade-off in PR description if omitted.

---

### 7. Icon & Styling

Copy `src/Paperback/includes/icon.png` to `src/WeebCentral/includes/icon.png` as a generic placeholder.

---

## Critical Decisions & Deviations

1. **Cheerio selector details are placeholder**: CSS selector paths in `parseMangaDetails`, `parseChapterList`, `parseSearchFacets`, etc. are pseudocode based on common DOM patterns (h1, article, fieldset, etc.). Real selectors **must be verified** against live site HTML during `npm run serve` and adjusted if they return empty.

2. **mangaId shape is TBD**: Task facts say `/series/{mangaId}` where mangaId is "a slug/hash". Actual shape may be `/series/{id}` or `/series/{id}/{slug}`. Extract and store consistently (likely `id` alone or `id/slug` combined), then adjust URL templates in all methods. **Single fix point**: `parseMangaIdFromHref()`.

3. **Sort order is a pseudo-tag**: `SearchRequest` 0.8 has no native sort field. Sort direction (asc/desc) is modeled as tags `sort-asc` / `sort-desc` in a dedicated "Sort Order" `TagSection`, reusing the tag-selection UI. Alternative: stuff into `SearchRequest.parameters` + implement `getSearchFields()` separately (heavier; left as future enhancement).

4. **Cloudflare bypass flow is app-managed**: `getCloudflareBypassRequestAsync()` returns a request; the **app** (not the source) solves the challenge in a webview and retries. Source simply needs to detect challenges and throw/let them bubble (via `scheduleAndUnwrap`). Verify exact error/retry behavior during serve testing.

5. **Languages.ts omitted**: Site is English-only; hardcode `langCode: 'EN'` inline in `parseChapterList()` and skip the Languages module entirely.

6. **No tracking/progress**: Browse/read only — no `getMangaProgressManagementForm()` / `processChapterReadActionQueue()` / `MANGA_TRACKING` intent.

---

## Verification Steps

1. **Type-check & lint** (before serve):
   - `npx tsc --noEmit` — ensure all Source method overrides use `override` keyword.
   - `npx eslint src/WeebCentral --ext .ts` — fix import-per-line, 4-space indent, single quotes, no semicolons.

2. **Serve & manual testing** (`npm run serve`):
   - **Homepage**: confirm Latest Updates section populates with tiles.
   - **Cloudflare bypass**: first request triggers in-app bypass flow (watch console for "Cloudflare challenge detected...").
   - **Search filters**: Genres/Status/Type sections populate from `getSearchTags()`, filter combinations work.
   - **Manga details**: title, cover, description, author, genres render correctly.
   - **Chapter list**: chapters appear in correct order, numbers parse correctly.
   - **Chapter pages**: all page images load in order (no missing/duplicate pages).
   - **Pagination**: Latest Updates and search results paginate correctly, terminate at last page.

3. **Bundle test** (pre-push):
   - `npm run bundle -- --folder=stable` succeeds locally — confirms all sources, including new WeebCentral, compile without errors.

---

## File Paths

**New files to create:**
- `src/WeebCentral/WeebCentral.ts`
- `src/WeebCentral/Common.ts`
- `src/WeebCentral/Settings.ts`
- `src/WeebCentral/includes/icon.png` (copy from `src/Paperback/includes/icon.png`)

**Reference files (read-only, pattern lookup):**
- `src/Paperback/Paperback.ts` — SourceInterceptor pattern, SourceInfo structure, homepage section flow
- `src/Paperback/Common.ts` — tag ID prefixing, search pagination, state manager pattern
- `src/Paperback/Settings.ts` — DUI section/form/binding patterns
- `.eslintrc.js`, `tsconfig.json`, `package.json` — style/build conventions
