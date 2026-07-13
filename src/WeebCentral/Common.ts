import { CheerioAPI } from 'cheerio'
import { Chapter,
    PagedResults,
    PartialSourceManga,
    Request,
    RequestManager,
    Response,
    SearchRequest,
    SourceManga,
    SourceStateManager,
    Tag,
    TagSection } from '@paperback/types'
export const WEEBCENTRAL_BASE_URL = 'https://weebcentral.com'
// Cover images are served from a separate CDN and referenced directly in the HTML
const SEARCH_PAGE_SIZE = 32
const SEARCH_TAGS_STATE_KEY = 'searchTagsCache'
//
// PARSING UTILITIES
//
export function parseMangaStatus(status: string): string {
    switch (status.trim().toLowerCase()) {
        case 'ongoing':
            return 'Ongoing'
        case 'complete':
        case 'completed':
            return 'Completed'
        case 'hiatus':
            return 'Hiatus'
        case 'canceled':
        case 'cancelled':
            return 'Cancelled'
        default:
            return status.trim()
    }
}
export function parseMangaIdFromHref(href: string): string {
    // href looks like https://weebcentral.com/series/{ULID}/{slug}
    const match = href.match(/\/series\/([^/?#]+)/)
    return match?.[1] ?? ''
}
export function parseChapterId(href: string): string {
    // href looks like https://weebcentral.com/chapters/{ULID}
    const match = href.match(/\/chapters\/([^/?#]+)/)
    return match?.[1] ?? ''
}
//
// HTML PARSING
//
export function parseMangaDetails($: CheerioAPI, mangaId: string): SourceManga {
    const title = $('h1').first().text().trim()
        || $('meta[property="og:title"]').attr('content')?.replace(/\s*\|\s*Weeb Central\s*$/i, '').trim()
        || mangaId
    const image = $('meta[property="og:image"]').attr('content')
        ?? $('picture img').first().attr('src')
        ?? ''
    const authors: string[] = []
    const genres: string[] = []
    let statusText = ''
    let description = ''
    // Metadata is rendered as <li> items prefixed with a <strong> label
    $('li').each((_, el) => {
        const label = $(el).find('strong').first().text().trim().toLowerCase()
        if (label.startsWith('author')) {
            $(el).find('a').each((__, a) => {
                const name = $(a).text().trim()
                if (name !== '') {
                    authors.push(name)
                }
            })
        } else if (label.startsWith('status')) {
            statusText = $(el).find('a').first().text().trim()
        } else if (label.startsWith('tag')) {
            $(el).find('a').each((__, a) => {
                const name = $(a).text().trim()
                if (name !== '') {
                    genres.push(name)
                }
            })
        } else if (label.startsWith('description')) {
            description = $(el).find('p').first().text().trim()
        }
    })
    const tagSection = App.createTagSection({
        id: 'genres',
        label: 'Genres',
        tags: genres.map((genre) => App.createTag({ id: `genre-${genre}`, label: genre }))
    })
    return App.createSourceManga({
        id: mangaId,
        mangaInfo: App.createMangaInfo({
            titles: [title],
            image: image,
            status: parseMangaStatus(statusText),
            author: authors.join(', '),
            artist: '',
            desc: description,
            tags: [tagSection]
        })
    })
}
export function parseChapterList($: CheerioAPI): Chapter[] {
    const chapters: Chapter[] = []
    const anchors = $('a[href*="/chapters/"]').toArray()
    anchors.forEach((el, index) => {
        const href = $(el).attr('href') ?? ''
        const chapterId = parseChapterId(href)
        if (chapterId === '') {
            return
        }
        const name = ($(el).find('span.grow > span').first().text().trim())
            || $(el).find('span').first().text().trim()
        const numMatch = name.match(/(\d+(?:\.\d+)?)/)
        const chapNum = numMatch ? parseFloat(numMatch[1] ?? '0') : 0
        const dateAttr = $(el).find('time').first().attr('datetime')
        const time = dateAttr ? new Date(dateAttr) : new Date()
        chapters.push(App.createChapter({
            id: chapterId,
            chapNum: chapNum,
            langCode: 'EN',
            name: name !== '' ? name : `Chapter ${chapNum}`,
            time: time,
            // Chapters are listed newest first; keep that ordering in the app
            sortingIndex: anchors.length - index
        }))
    })
    return chapters
}
export function parseChapterImages($: CheerioAPI): string[] {
    const pages: string[] = []
    for (const el of $('img').toArray()) {
        const src = $(el).attr('src') ?? $(el).attr('data-src') ?? ''
        if (src === '' || src.includes('broken_image') || src.includes('/static/')) {
            continue
        }
        pages.push(src)
    }
    return pages
}
export function parseMangaTileList($: CheerioAPI): PartialSourceManga[] {
    const tiles: PartialSourceManga[] = []
    const seen = new Set<string>()
    for (const el of $('a[href*="/series/"]').toArray()) {
        const href = $(el).attr('href') ?? ''
        const mangaId = parseMangaIdFromHref(href)
        if (mangaId === '' || mangaId === 'random' || seen.has(mangaId)) {
            continue
        }
        // Only the cover anchor carries the <img>; title-only anchors are skipped
        const img = $(el).find('img').first()
        if (img.length === 0) {
            continue
        }
        const image = img.attr('src') ?? img.attr('data-src') ?? ''
        let title = (img.attr('alt') ?? '').replace(/\s*cover\s*$/i, '').trim()
        if (title === '') {
            title = $(el).closest('article').attr('data-tip')?.trim()
                ?? $(el).text().trim()
        }
        if (title === '') {
            continue
        }
        seen.add(mangaId)
        tiles.push(App.createPartialSourceManga({
            mangaId: mangaId,
            title: title,
            image: image,
            subtitle: undefined
        }))
    }
    return tiles
}
function collectFacetValues($: CheerioAPI, selector: string): string[] {
    const values: string[] = []
    const seen = new Set<string>()
    for (const el of $(selector).toArray()) {
        const value = ($(el).attr('value') ?? '').trim()
        if (value === '' || seen.has(value)) {
            continue
        }
        seen.add(value)
        values.push(value)
    }
    return values
}
function buildTagSection(id: string, label: string, prefix: string, values: string[]): TagSection {
    const tags: Tag[] = values.map((value) => App.createTag({ id: `${prefix}${value}`, label: value }))
    return App.createTagSection({ id: id, label: label, tags: tags })
}
export function parseSearchFacets($: CheerioAPI): TagSection[] {
    // Genres are rendered as tri-state checkboxes with a hidden `{id}-value` input
    const genres = collectFacetValues($, '[id^="tag-"][id$="-value"]')
    const statuses = collectFacetValues($, 'input[name="included_status"]')
    const types = collectFacetValues($, 'input[name="included_type"]')
    const sorts = collectFacetValues($, 'input[name="sort"]')
    const orders = collectFacetValues($, 'input[name="order"]')
    const sections: TagSection[] = []
    if (genres.length > 0) {
        sections.push(buildTagSection('genres', 'Genres', 'genre-', genres))
    }
    if (statuses.length > 0) {
        sections.push(buildTagSection('status', 'Status', 'status-', statuses))
    }
    if (types.length > 0) {
        sections.push(buildTagSection('type', 'Type', 'type-', types))
    }
    if (sorts.length > 0) {
        sections.push(buildTagSection('sort', 'Sort By', 'sort-', sorts))
    }
    if (orders.length > 0) {
        sections.push(buildTagSection('order', 'Sort Order', 'order-', orders))
    }
    return sections
}
//
// PLACEHOLDER TILE
//
export function getServerUnavailableMangaTiles(): PartialSourceManga[] {
    // This tile is used as a placeholder when the site is unreachable or Cloudflare blocks us
    return [
        App.createPartialSourceManga({
            title: 'WeebCentral',
            image: '',
            mangaId: 'placeholder-id',
            subtitle: 'unavailable'
        }),
    ]
}
//
// CLOUDFLARE & NETWORK
//
export function isCloudflareChallenge(response: Response): boolean {
    const mitigated = response.headers?.['cf-mitigated'] ?? response.headers?.['Cf-Mitigated']
    if (typeof mitigated === 'string' && mitigated.toLowerCase().includes('challenge')) {
        return true
    }
    if (response.status === 403 || response.status === 503) {
        const body = response.data ?? ''
        if (body.includes('Just a moment') || body.includes('cf-chl') || body.includes('challenge-platform')) {
            return true
        }
    }
    return false
}
export async function scheduleAndUnwrap(requestManager: RequestManager, request: Request): Promise<Response> {
    const response = await requestManager.schedule(request, 1)
    if (isCloudflareChallenge(response)) {
        throw new Error('Cloudflare challenge detected. Please solve it through the in-app bypass flow and retry.')
    }
    return response
}
//
// STATE (CACHED SEARCH TAGS)
//
export async function getCachedSearchTags(stateManager: SourceStateManager): Promise<TagSection[] | undefined> {
    const raw = await stateManager.retrieve(SEARCH_TAGS_STATE_KEY)
    if (raw === undefined || raw === null) {
        return undefined
    }
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!Array.isArray(data) || data.length === 0) {
        return undefined
    }
    return data.map((section: { id: string; label: string; tags: { id: string; label: string }[] }) => App.createTagSection({
        id: section.id,
        label: section.label,
        tags: (section.tags ?? []).map((tag) => App.createTag({ id: tag.id, label: tag.label }))
    }))
}
export async function setCachedSearchTags(stateManager: SourceStateManager, sections: TagSection[] | undefined): Promise<void> {
    if (sections === undefined) {
        await stateManager.store(SEARCH_TAGS_STATE_KEY, undefined)
        return
    }
    const data = sections.map((section) => ({
        id: section.id,
        label: section.label,
        tags: section.tags.map((tag) => ({ id: tag.id, label: tag.label }))
    }))
    await stateManager.store(SEARCH_TAGS_STATE_KEY, data)
}
//
// SHARED REQUEST HELPERS
//
export async function getLatestUpdatesTiles(requestManager: RequestManager, cheerio: CheerioAPI, page: number): Promise<PartialSourceManga[]> {
    const request = App.createRequest({
        url: `${WEEBCENTRAL_BASE_URL}/latest-updates/${page}`,
        method: 'GET'
    })
    const response = await scheduleAndUnwrap(requestManager, request)
    const $ = cheerio.load(response.data ?? '')
    return parseMangaTileList($)
}
export async function searchRequest(searchQuery: SearchRequest, metadata: any, requestManager: RequestManager, cheerio: CheerioAPI): Promise<PagedResults> {
    const page: number = metadata?.page ?? 0
    // `official` and `display_mode` are required by /search/data; omitting either
    // makes the endpoint 307-redirect to /400 and search silently returns nothing.
    const params: string[] = [
        `limit=${SEARCH_PAGE_SIZE}`,
        `offset=${page * SEARCH_PAGE_SIZE}`,
        'official=Any',
        `display_mode=${encodeURIComponent('Full Display')}`
    ]
    let sort = 'Best Match'
    let order = 'Descending'
    if (searchQuery.title !== undefined && searchQuery.title !== '') {
        params.push(`text=${encodeURIComponent(searchQuery.title)}`)
    }
    for (const tag of searchQuery.includedTags ?? []) {
        const id = tag.id
        if (id.startsWith('genre-')) {
            params.push(`included_tag=${encodeURIComponent(id.substring(6))}`)
        } else if (id.startsWith('status-')) {
            params.push(`included_status=${encodeURIComponent(id.substring(7))}`)
        } else if (id.startsWith('type-')) {
            params.push(`included_type=${encodeURIComponent(id.substring(5))}`)
        } else if (id.startsWith('sort-')) {
            sort = id.substring(5)
        } else if (id.startsWith('order-')) {
            order = id.substring(6)
        }
    }
    params.push(`sort=${encodeURIComponent(sort)}`)
    params.push(`order=${encodeURIComponent(order)}`)
    const request = App.createRequest({
        url: `${WEEBCENTRAL_BASE_URL}/search/data`,
        method: 'GET',
        param: `?${params.join('&')}`
    })
    // This is also called when searching in another source, so never throw
    let response: Response
    try {
        response = await scheduleAndUnwrap(requestManager, request)
    } catch (error) {
        console.log(`searchRequest failed with error: ${error}`)
        return App.createPagedResults({
            results: getServerUnavailableMangaTiles()
        })
    }
    const $ = cheerio.load(response.data ?? '')
    const tiles = parseMangaTileList($)
    return App.createPagedResults({
        results: tiles,
        metadata: tiles.length === 0 ? undefined : { page: page + 1 }
    })
}
