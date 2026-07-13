import { Chapter,
    ChapterDetails,
    ContentRating,
    DUISection,
    HomeSection,
    PagedResults,
    Request,
    Response,
    SearchRequest,
    Source,
    SourceInfo,
    SourceIntents,
    SourceInterceptor,
    SourceManga,
    TagSection } from '@paperback/types'
import { clearSearchTagsButton } from './Settings'
import { getCachedSearchTags,
    getLatestUpdatesTiles,
    getServerUnavailableMangaTiles,
    parseChapterImages,
    parseChapterList,
    parseMangaDetails,
    parseSearchFacets,
    scheduleAndUnwrap,
    searchRequest,
    setCachedSearchTags,
    WEEBCENTRAL_BASE_URL } from './Common'
export const WeebCentralInfo: SourceInfo = {
    version: '1.0.0',
    name: 'WeebCentral',
    icon: 'icon.png',
    author: 'Paperback Community',
    description: 'Extension that pulls manga from weebcentral.com',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: WEEBCENTRAL_BASE_URL,
    sourceTags: [],
    // NOTE: CLOUDFLARE_BYPASS_REQUIRED is intentionally omitted. weebcentral.com
    // currently serves normal 200 responses with no Cloudflare challenge, so
    // declaring the intent made the app run its proactive bypass flow on add and
    // wait forever for a cf_clearance cookie that never arrives (the "add extension
    // page times out" symptom). Challenges, if they ever return, are still handled
    // reactively via scheduleAndUnwrap() + getCloudflareBypassRequestAsync().
    intents: SourceIntents.MANGA_CHAPTERS
        | SourceIntents.HOMEPAGE_SECTIONS
        | SourceIntents.SETTINGS_UI
}
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
export class WeebCentralRequestInterceptor implements SourceInterceptor {
    async interceptResponse(response: Response): Promise<Response> {
        return response
    }
    async interceptRequest(request: Request): Promise<Request> {
        const headers = request.headers ?? {}
        // Only set browser-like defaults; never override caller-supplied headers
        if (headers['user-agent'] === undefined && headers['User-Agent'] === undefined) {
            headers['user-agent'] = USER_AGENT
        }
        if (headers['referer'] === undefined && headers['Referer'] === undefined) {
            headers['referer'] = `${WEEBCENTRAL_BASE_URL}/`
        }
        // Reassigning the base object is required for the native Swift bridge to see the change
        request.headers = headers
        return request
    }
}
export class WeebCentral extends Source {
    stateManager = App.createSourceStateManager();
    requestManager = App.createRequestManager({
        requestsPerSecond: 4,
        requestTimeout: 20000,
        interceptor: new WeebCentralRequestInterceptor()
    });
    override async getCloudflareBypassRequestAsync(): Promise<Request> {
        return App.createRequest({
            url: WEEBCENTRAL_BASE_URL,
            method: 'GET',
            headers: { 'user-agent': USER_AGENT }
        })
    }
    override async getSourceMenu(): Promise<DUISection> {
        return App.createDUISection({
            id: 'main',
            header: 'Source Settings',
            isHidden: false,
            rows: async () => [
                clearSearchTagsButton(this.stateManager),
            ]
        })
    }
    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const request = App.createRequest({
            url: `${WEEBCENTRAL_BASE_URL}/series/${mangaId}`,
            method: 'GET'
        })
        const response = await scheduleAndUnwrap(this.requestManager, request)
        const $ = this.cheerio.load(response.data ?? '')
        return parseMangaDetails($, mangaId)
    }
    async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = App.createRequest({
            url: `${WEEBCENTRAL_BASE_URL}/series/${mangaId}/full-chapter-list`,
            method: 'GET'
        })
        const response = await scheduleAndUnwrap(this.requestManager, request)
        const $ = this.cheerio.load(response.data ?? '')
        return parseChapterList($)
    }
    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = App.createRequest({
            url: `${WEEBCENTRAL_BASE_URL}/chapters/${chapterId}/images`,
            method: 'GET',
            param: '?reading_style=long_strip'
        })
        const response = await scheduleAndUnwrap(this.requestManager, request)
        const $ = this.cheerio.load(response.data ?? '')
        return App.createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: parseChapterImages($)
        })
    }
    override async getSearchTags(): Promise<TagSection[]> {
        // Called on the search screen; must never throw
        const cached = await getCachedSearchTags(this.stateManager)
        if (cached !== undefined) {
            return cached
        }
        try {
            const request = App.createRequest({
                url: `${WEEBCENTRAL_BASE_URL}/search`,
                method: 'GET'
            })
            const response = await scheduleAndUnwrap(this.requestManager, request)
            const $ = this.cheerio.load(response.data ?? '')
            const sections = parseSearchFacets($)
            if (sections.length > 0) {
                await setCachedSearchTags(this.stateManager, sections)
            }
            return sections
        } catch (error) {
            console.log(`getSearchTags failed with error: ${error}`)
            return []
        }
    }
    override async getSearchResults(searchQuery: SearchRequest, metadata: any): Promise<PagedResults> {
        // Also called when searching in another source; must never throw
        return searchRequest(searchQuery, metadata, this.requestManager, this.cheerio)
    }
    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const section = App.createHomeSection({
            id: 'latest',
            title: 'Latest Updates',
            containsMoreItems: true,
            type: 'singleRowNormal'
        })
        // Let the app render an empty section first
        sectionCallback(section)
        try {
            section.items = await getLatestUpdatesTiles(this.requestManager, this.cheerio, 1)
        } catch (error) {
            console.log(`getHomePageSections failed with error: ${error}`)
            section.items = getServerUnavailableMangaTiles()
        }
        sectionCallback(section)
    }
    override async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        if (homepageSectionId !== 'latest') {
            return App.createPagedResults({ results: [] })
        }
        const page: number = metadata?.page ?? 1
        let tiles
        try {
            tiles = await getLatestUpdatesTiles(this.requestManager, this.cheerio, page)
        } catch (error) {
            console.log(`getViewMoreItems failed with error: ${error}`)
            return App.createPagedResults({ results: [] })
        }
        // If no tiles were returned we are on the last page
        return App.createPagedResults({
            results: tiles,
            metadata: tiles.length === 0 ? undefined : { page: page + 1 }
        })
    }
    override getMangaShareUrl(mangaId: string): string {
        return `${WEEBCENTRAL_BASE_URL}/series/${mangaId}`
    }
}
