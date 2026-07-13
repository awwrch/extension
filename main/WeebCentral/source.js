(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Sources = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadgeColor = void 0;
var BadgeColor;
(function (BadgeColor) {
    BadgeColor["BLUE"] = "default";
    BadgeColor["GREEN"] = "success";
    BadgeColor["GREY"] = "info";
    BadgeColor["YELLOW"] = "warning";
    BadgeColor["RED"] = "danger";
})(BadgeColor = exports.BadgeColor || (exports.BadgeColor = {}));

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeSectionType = void 0;
var HomeSectionType;
(function (HomeSectionType) {
    HomeSectionType["singleRowNormal"] = "singleRowNormal";
    HomeSectionType["singleRowLarge"] = "singleRowLarge";
    HomeSectionType["doubleRow"] = "doubleRow";
    HomeSectionType["featured"] = "featured";
})(HomeSectionType = exports.HomeSectionType || (exports.HomeSectionType = {}));

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],5:[function(require,module,exports){
"use strict";
/**
 * Request objects hold information for a particular source (see sources for example)
 * This allows us to to use a generic api to make the calls against any source
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlEncodeObject = exports.convertTime = exports.Source = void 0;
/**
* @deprecated Use {@link PaperbackExtensionBase}
*/
class Source {
    constructor(cheerio) {
        this.cheerio = cheerio;
    }
    /**
     * @deprecated use {@link Source.getSearchResults getSearchResults} instead
     */
    searchRequest(query, metadata) {
        return this.getSearchResults(query, metadata);
    }
    /**
     * @deprecated use {@link Source.getSearchTags} instead
     */
    async getTags() {
        // @ts-ignore
        return this.getSearchTags?.();
    }
}
exports.Source = Source;
// Many sites use '[x] time ago' - Figured it would be good to handle these cases in general
function convertTime(timeAgo) {
    let time;
    let trimmed = Number((/\d*/.exec(timeAgo) ?? [])[0]);
    trimmed = (trimmed == 0 && timeAgo.includes('a')) ? 1 : trimmed;
    if (timeAgo.includes('minutes')) {
        time = new Date(Date.now() - trimmed * 60000);
    }
    else if (timeAgo.includes('hours')) {
        time = new Date(Date.now() - trimmed * 3600000);
    }
    else if (timeAgo.includes('days')) {
        time = new Date(Date.now() - trimmed * 86400000);
    }
    else if (timeAgo.includes('year') || timeAgo.includes('years')) {
        time = new Date(Date.now() - trimmed * 31556952000);
    }
    else {
        time = new Date(Date.now());
    }
    return time;
}
exports.convertTime = convertTime;
/**
 * When a function requires a POST body, it always should be defined as a JsonObject
 * and then passed through this function to ensure that it's encoded properly.
 * @param obj
 */
function urlEncodeObject(obj) {
    let ret = {};
    for (const entry of Object.entries(obj)) {
        ret[encodeURIComponent(entry[0])] = encodeURIComponent(entry[1]);
    }
    return ret;
}
exports.urlEncodeObject = urlEncodeObject;

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentRating = exports.SourceIntents = void 0;
var SourceIntents;
(function (SourceIntents) {
    SourceIntents[SourceIntents["MANGA_CHAPTERS"] = 1] = "MANGA_CHAPTERS";
    SourceIntents[SourceIntents["MANGA_TRACKING"] = 2] = "MANGA_TRACKING";
    SourceIntents[SourceIntents["HOMEPAGE_SECTIONS"] = 4] = "HOMEPAGE_SECTIONS";
    SourceIntents[SourceIntents["COLLECTION_MANAGEMENT"] = 8] = "COLLECTION_MANAGEMENT";
    SourceIntents[SourceIntents["CLOUDFLARE_BYPASS_REQUIRED"] = 16] = "CLOUDFLARE_BYPASS_REQUIRED";
    SourceIntents[SourceIntents["SETTINGS_UI"] = 32] = "SETTINGS_UI";
})(SourceIntents = exports.SourceIntents || (exports.SourceIntents = {}));
/**
 * A content rating to be attributed to each source.
 */
var ContentRating;
(function (ContentRating) {
    ContentRating["EVERYONE"] = "EVERYONE";
    ContentRating["MATURE"] = "MATURE";
    ContentRating["ADULT"] = "ADULT";
})(ContentRating = exports.ContentRating || (exports.ContentRating = {}));

},{}],7:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Source"), exports);
__exportStar(require("./ByteArray"), exports);
__exportStar(require("./Badge"), exports);
__exportStar(require("./interfaces"), exports);
__exportStar(require("./SourceInfo"), exports);
__exportStar(require("./HomeSectionType"), exports);
__exportStar(require("./PaperbackExtensionBase"), exports);

},{"./Badge":1,"./ByteArray":2,"./HomeSectionType":3,"./PaperbackExtensionBase":4,"./Source":5,"./SourceInfo":6,"./interfaces":15}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],15:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./ChapterProviding"), exports);
__exportStar(require("./CloudflareBypassRequestProviding"), exports);
__exportStar(require("./HomePageSectionsProviding"), exports);
__exportStar(require("./MangaProgressProviding"), exports);
__exportStar(require("./MangaProviding"), exports);
__exportStar(require("./RequestManagerProviding"), exports);
__exportStar(require("./SearchResultsProviding"), exports);

},{"./ChapterProviding":8,"./CloudflareBypassRequestProviding":9,"./HomePageSectionsProviding":10,"./MangaProgressProviding":11,"./MangaProviding":12,"./RequestManagerProviding":13,"./SearchResultsProviding":14}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],39:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],43:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],46:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],47:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],49:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],50:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],51:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],52:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],53:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],54:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],55:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],56:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],57:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],58:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],59:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],60:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./DynamicUI/Exports/DUIBinding"), exports);
__exportStar(require("./DynamicUI/Exports/DUIForm"), exports);
__exportStar(require("./DynamicUI/Exports/DUIFormRow"), exports);
__exportStar(require("./DynamicUI/Exports/DUISection"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIButton"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIHeader"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIInputField"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUILabel"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUILink"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIMultilineLabel"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUINavigationButton"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIOAuthButton"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUISecureInputField"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUISelect"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIStepper"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUISwitch"), exports);
__exportStar(require("./Exports/ChapterDetails"), exports);
__exportStar(require("./Exports/Chapter"), exports);
__exportStar(require("./Exports/Cookie"), exports);
__exportStar(require("./Exports/HomeSection"), exports);
__exportStar(require("./Exports/IconText"), exports);
__exportStar(require("./Exports/MangaInfo"), exports);
__exportStar(require("./Exports/MangaProgress"), exports);
__exportStar(require("./Exports/PartialSourceManga"), exports);
__exportStar(require("./Exports/MangaUpdates"), exports);
__exportStar(require("./Exports/PBCanvas"), exports);
__exportStar(require("./Exports/PBImage"), exports);
__exportStar(require("./Exports/PagedResults"), exports);
__exportStar(require("./Exports/RawData"), exports);
__exportStar(require("./Exports/Request"), exports);
__exportStar(require("./Exports/SourceInterceptor"), exports);
__exportStar(require("./Exports/RequestManager"), exports);
__exportStar(require("./Exports/Response"), exports);
__exportStar(require("./Exports/SearchField"), exports);
__exportStar(require("./Exports/SearchRequest"), exports);
__exportStar(require("./Exports/SourceCookieStore"), exports);
__exportStar(require("./Exports/SourceManga"), exports);
__exportStar(require("./Exports/SecureStateManager"), exports);
__exportStar(require("./Exports/SourceStateManager"), exports);
__exportStar(require("./Exports/Tag"), exports);
__exportStar(require("./Exports/TagSection"), exports);
__exportStar(require("./Exports/TrackedMangaChapterReadAction"), exports);
__exportStar(require("./Exports/TrackerActionQueue"), exports);

},{"./DynamicUI/Exports/DUIBinding":17,"./DynamicUI/Exports/DUIForm":18,"./DynamicUI/Exports/DUIFormRow":19,"./DynamicUI/Exports/DUISection":20,"./DynamicUI/Rows/Exports/DUIButton":21,"./DynamicUI/Rows/Exports/DUIHeader":22,"./DynamicUI/Rows/Exports/DUIInputField":23,"./DynamicUI/Rows/Exports/DUILabel":24,"./DynamicUI/Rows/Exports/DUILink":25,"./DynamicUI/Rows/Exports/DUIMultilineLabel":26,"./DynamicUI/Rows/Exports/DUINavigationButton":27,"./DynamicUI/Rows/Exports/DUIOAuthButton":28,"./DynamicUI/Rows/Exports/DUISecureInputField":29,"./DynamicUI/Rows/Exports/DUISelect":30,"./DynamicUI/Rows/Exports/DUIStepper":31,"./DynamicUI/Rows/Exports/DUISwitch":32,"./Exports/Chapter":33,"./Exports/ChapterDetails":34,"./Exports/Cookie":35,"./Exports/HomeSection":36,"./Exports/IconText":37,"./Exports/MangaInfo":38,"./Exports/MangaProgress":39,"./Exports/MangaUpdates":40,"./Exports/PBCanvas":41,"./Exports/PBImage":42,"./Exports/PagedResults":43,"./Exports/PartialSourceManga":44,"./Exports/RawData":45,"./Exports/Request":46,"./Exports/RequestManager":47,"./Exports/Response":48,"./Exports/SearchField":49,"./Exports/SearchRequest":50,"./Exports/SecureStateManager":51,"./Exports/SourceCookieStore":52,"./Exports/SourceInterceptor":53,"./Exports/SourceManga":54,"./Exports/SourceStateManager":55,"./Exports/Tag":56,"./Exports/TagSection":57,"./Exports/TrackedMangaChapterReadAction":58,"./Exports/TrackerActionQueue":59}],61:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./generated/_exports"), exports);
__exportStar(require("./base/index"), exports);
__exportStar(require("./compat/DyamicUI"), exports);

},{"./base/index":7,"./compat/DyamicUI":16,"./generated/_exports":60}],62:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchRequest = exports.getLatestUpdatesTiles = exports.setCachedSearchTags = exports.getCachedSearchTags = exports.scheduleAndUnwrap = exports.isCloudflareChallenge = exports.getServerUnavailableMangaTiles = exports.parseSearchFacets = exports.parseMangaTileList = exports.parseChapterImages = exports.parseChapterList = exports.parseMangaDetails = exports.parseChapterId = exports.parseMangaIdFromHref = exports.parseMangaStatus = exports.WEEBCENTRAL_BASE_URL = void 0;
exports.WEEBCENTRAL_BASE_URL = 'https://weebcentral.com';
// Cover images are served from a separate CDN and referenced directly in the HTML
const SEARCH_PAGE_SIZE = 32;
const SEARCH_TAGS_STATE_KEY = 'searchTagsCache';
//
// PARSING UTILITIES
//
function parseMangaStatus(status) {
    switch (status.trim().toLowerCase()) {
        case 'ongoing':
            return 'Ongoing';
        case 'complete':
        case 'completed':
            return 'Completed';
        case 'hiatus':
            return 'Hiatus';
        case 'canceled':
        case 'cancelled':
            return 'Cancelled';
        default:
            return status.trim();
    }
}
exports.parseMangaStatus = parseMangaStatus;
function parseMangaIdFromHref(href) {
    // href looks like https://weebcentral.com/series/{ULID}/{slug}
    const match = href.match(/\/series\/([^/?#]+)/);
    return match?.[1] ?? '';
}
exports.parseMangaIdFromHref = parseMangaIdFromHref;
function parseChapterId(href) {
    // href looks like https://weebcentral.com/chapters/{ULID}
    const match = href.match(/\/chapters\/([^/?#]+)/);
    return match?.[1] ?? '';
}
exports.parseChapterId = parseChapterId;
//
// HTML PARSING
//
function parseMangaDetails($, mangaId) {
    const title = $('h1').first().text().trim()
        || $('meta[property="og:title"]').attr('content')?.replace(/\s*\|\s*Weeb Central\s*$/i, '').trim()
        || mangaId;
    const image = $('meta[property="og:image"]').attr('content')
        ?? $('picture img').first().attr('src')
        ?? '';
    const authors = [];
    const genres = [];
    let statusText = '';
    let description = '';
    // Metadata is rendered as <li> items prefixed with a <strong> label
    $('li').each((_, el) => {
        const label = $(el).find('strong').first().text().trim().toLowerCase();
        if (label.startsWith('author')) {
            $(el).find('a').each((__, a) => {
                const name = $(a).text().trim();
                if (name !== '') {
                    authors.push(name);
                }
            });
        }
        else if (label.startsWith('status')) {
            statusText = $(el).find('a').first().text().trim();
        }
        else if (label.startsWith('tag')) {
            $(el).find('a').each((__, a) => {
                const name = $(a).text().trim();
                if (name !== '') {
                    genres.push(name);
                }
            });
        }
        else if (label.startsWith('description')) {
            description = $(el).find('p').first().text().trim();
        }
    });
    const tagSection = App.createTagSection({
        id: 'genres',
        label: 'Genres',
        tags: genres.map((genre) => App.createTag({ id: `genre-${genre}`, label: genre }))
    });
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
    });
}
exports.parseMangaDetails = parseMangaDetails;
function parseChapterList($) {
    const chapters = [];
    const anchors = $('a[href*="/chapters/"]').toArray();
    anchors.forEach((el, index) => {
        const href = $(el).attr('href') ?? '';
        const chapterId = parseChapterId(href);
        if (chapterId === '') {
            return;
        }
        const name = ($(el).find('span.grow > span').first().text().trim())
            || $(el).find('span').first().text().trim();
        const numMatch = name.match(/(\d+(?:\.\d+)?)/);
        const chapNum = numMatch ? parseFloat(numMatch[1] ?? '0') : 0;
        const dateAttr = $(el).find('time').first().attr('datetime');
        const time = dateAttr ? new Date(dateAttr) : new Date();
        chapters.push(App.createChapter({
            id: chapterId,
            chapNum: chapNum,
            langCode: 'EN',
            name: name !== '' ? name : `Chapter ${chapNum}`,
            time: time,
            // Chapters are listed newest first; keep that ordering in the app
            sortingIndex: anchors.length - index
        }));
    });
    return chapters;
}
exports.parseChapterList = parseChapterList;
function parseChapterImages($) {
    const pages = [];
    for (const el of $('img').toArray()) {
        const src = $(el).attr('src') ?? $(el).attr('data-src') ?? '';
        if (src === '' || src.includes('broken_image') || src.includes('/static/')) {
            continue;
        }
        pages.push(src);
    }
    return pages;
}
exports.parseChapterImages = parseChapterImages;
function parseMangaTileList($) {
    const tiles = [];
    const seen = new Set();
    for (const el of $('a[href*="/series/"]').toArray()) {
        const href = $(el).attr('href') ?? '';
        const mangaId = parseMangaIdFromHref(href);
        if (mangaId === '' || mangaId === 'random' || seen.has(mangaId)) {
            continue;
        }
        // Only the cover anchor carries the <img>; title-only anchors are skipped
        const img = $(el).find('img').first();
        if (img.length === 0) {
            continue;
        }
        const image = img.attr('src') ?? img.attr('data-src') ?? '';
        let title = (img.attr('alt') ?? '').replace(/\s*cover\s*$/i, '').trim();
        if (title === '') {
            title = $(el).closest('article').attr('data-tip')?.trim()
                ?? $(el).text().trim();
        }
        if (title === '') {
            continue;
        }
        seen.add(mangaId);
        tiles.push(App.createPartialSourceManga({
            mangaId: mangaId,
            title: title,
            image: image,
            subtitle: undefined
        }));
    }
    return tiles;
}
exports.parseMangaTileList = parseMangaTileList;
function collectFacetValues($, selector) {
    const values = [];
    const seen = new Set();
    for (const el of $(selector).toArray()) {
        const value = ($(el).attr('value') ?? '').trim();
        if (value === '' || seen.has(value)) {
            continue;
        }
        seen.add(value);
        values.push(value);
    }
    return values;
}
function buildTagSection(id, label, prefix, values) {
    const tags = values.map((value) => App.createTag({ id: `${prefix}${value}`, label: value }));
    return App.createTagSection({ id: id, label: label, tags: tags });
}
function parseSearchFacets($) {
    // Genres are rendered as tri-state checkboxes with a hidden `{id}-value` input
    const genres = collectFacetValues($, '[id^="tag-"][id$="-value"]');
    const statuses = collectFacetValues($, 'input[name="included_status"]');
    const types = collectFacetValues($, 'input[name="included_type"]');
    const sorts = collectFacetValues($, 'input[name="sort"]');
    const orders = collectFacetValues($, 'input[name="order"]');
    const sections = [];
    if (genres.length > 0) {
        sections.push(buildTagSection('genres', 'Genres', 'genre-', genres));
    }
    if (statuses.length > 0) {
        sections.push(buildTagSection('status', 'Status', 'status-', statuses));
    }
    if (types.length > 0) {
        sections.push(buildTagSection('type', 'Type', 'type-', types));
    }
    if (sorts.length > 0) {
        sections.push(buildTagSection('sort', 'Sort By', 'sort-', sorts));
    }
    if (orders.length > 0) {
        sections.push(buildTagSection('order', 'Sort Order', 'order-', orders));
    }
    return sections;
}
exports.parseSearchFacets = parseSearchFacets;
//
// PLACEHOLDER TILE
//
function getServerUnavailableMangaTiles() {
    // This tile is used as a placeholder when the site is unreachable or Cloudflare blocks us
    return [
        App.createPartialSourceManga({
            title: 'WeebCentral',
            image: '',
            mangaId: 'placeholder-id',
            subtitle: 'unavailable'
        }),
    ];
}
exports.getServerUnavailableMangaTiles = getServerUnavailableMangaTiles;
//
// CLOUDFLARE & NETWORK
//
function isCloudflareChallenge(response) {
    const mitigated = response.headers?.['cf-mitigated'] ?? response.headers?.['Cf-Mitigated'];
    if (typeof mitigated === 'string' && mitigated.toLowerCase().includes('challenge')) {
        return true;
    }
    if (response.status === 403 || response.status === 503) {
        const body = response.data ?? '';
        if (body.includes('Just a moment') || body.includes('cf-chl') || body.includes('challenge-platform')) {
            return true;
        }
    }
    return false;
}
exports.isCloudflareChallenge = isCloudflareChallenge;
async function scheduleAndUnwrap(requestManager, request) {
    const response = await requestManager.schedule(request, 1);
    if (isCloudflareChallenge(response)) {
        throw new Error('Cloudflare challenge detected. Please solve it through the in-app bypass flow and retry.');
    }
    return response;
}
exports.scheduleAndUnwrap = scheduleAndUnwrap;
//
// STATE (CACHED SEARCH TAGS)
//
async function getCachedSearchTags(stateManager) {
    const raw = await stateManager.retrieve(SEARCH_TAGS_STATE_KEY);
    if (raw === undefined || raw === null) {
        return undefined;
    }
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!Array.isArray(data) || data.length === 0) {
        return undefined;
    }
    return data.map((section) => App.createTagSection({
        id: section.id,
        label: section.label,
        tags: (section.tags ?? []).map((tag) => App.createTag({ id: tag.id, label: tag.label }))
    }));
}
exports.getCachedSearchTags = getCachedSearchTags;
async function setCachedSearchTags(stateManager, sections) {
    if (sections === undefined) {
        await stateManager.store(SEARCH_TAGS_STATE_KEY, undefined);
        return;
    }
    const data = sections.map((section) => ({
        id: section.id,
        label: section.label,
        tags: section.tags.map((tag) => ({ id: tag.id, label: tag.label }))
    }));
    await stateManager.store(SEARCH_TAGS_STATE_KEY, data);
}
exports.setCachedSearchTags = setCachedSearchTags;
//
// SHARED REQUEST HELPERS
//
async function getLatestUpdatesTiles(requestManager, cheerio, page) {
    const request = App.createRequest({
        url: `${exports.WEEBCENTRAL_BASE_URL}/latest-updates/${page}`,
        method: 'GET'
    });
    const response = await scheduleAndUnwrap(requestManager, request);
    const $ = cheerio.load(response.data ?? '');
    return parseMangaTileList($);
}
exports.getLatestUpdatesTiles = getLatestUpdatesTiles;
async function searchRequest(searchQuery, metadata, requestManager, cheerio) {
    const page = metadata?.page ?? 0;
    // `official` and `display_mode` are required by /search/data; omitting either
    // makes the endpoint 307-redirect to /400 and search silently returns nothing.
    const params = [
        `limit=${SEARCH_PAGE_SIZE}`,
        `offset=${page * SEARCH_PAGE_SIZE}`,
        'official=Any',
        `display_mode=${encodeURIComponent('Full Display')}`
    ];
    let sort = 'Best Match';
    let order = 'Descending';
    if (searchQuery.title !== undefined && searchQuery.title !== '') {
        params.push(`text=${encodeURIComponent(searchQuery.title)}`);
    }
    for (const tag of searchQuery.includedTags ?? []) {
        const id = tag.id;
        if (id.startsWith('genre-')) {
            params.push(`included_tag=${encodeURIComponent(id.substring(6))}`);
        }
        else if (id.startsWith('status-')) {
            params.push(`included_status=${encodeURIComponent(id.substring(7))}`);
        }
        else if (id.startsWith('type-')) {
            params.push(`included_type=${encodeURIComponent(id.substring(5))}`);
        }
        else if (id.startsWith('sort-')) {
            sort = id.substring(5);
        }
        else if (id.startsWith('order-')) {
            order = id.substring(6);
        }
    }
    params.push(`sort=${encodeURIComponent(sort)}`);
    params.push(`order=${encodeURIComponent(order)}`);
    const request = App.createRequest({
        url: `${exports.WEEBCENTRAL_BASE_URL}/search/data`,
        method: 'GET',
        param: `?${params.join('&')}`
    });
    // This is also called when searching in another source, so never throw
    let response;
    try {
        response = await scheduleAndUnwrap(requestManager, request);
    }
    catch (error) {
        console.log(`searchRequest failed with error: ${error}`);
        return App.createPagedResults({
            results: getServerUnavailableMangaTiles()
        });
    }
    const $ = cheerio.load(response.data ?? '');
    const tiles = parseMangaTileList($);
    return App.createPagedResults({
        results: tiles,
        metadata: tiles.length === 0 ? undefined : { page: page + 1 }
    });
}
exports.searchRequest = searchRequest;

},{}],63:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearSearchTagsButton = void 0;
const Common_1 = require("./Common");
const clearSearchTagsButton = (stateManager) => {
    return App.createDUIButton({
        id: 'clear_search_tags',
        label: 'Clear Cached Search Filters',
        onTap: () => (0, Common_1.setCachedSearchTags)(stateManager, undefined)
    });
};
exports.clearSearchTagsButton = clearSearchTagsButton;

},{"./Common":62}],64:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeebCentral = exports.WeebCentralRequestInterceptor = exports.WeebCentralInfo = void 0;
const types_1 = require("@paperback/types");
const Settings_1 = require("./Settings");
const Common_1 = require("./Common");
exports.WeebCentralInfo = {
    version: '1.0.0',
    name: 'WeebCentral',
    icon: 'icon.png',
    author: 'Paperback Community',
    description: 'Extension that pulls manga from weebcentral.com',
    contentRating: types_1.ContentRating.EVERYONE,
    websiteBaseURL: Common_1.WEEBCENTRAL_BASE_URL,
    sourceTags: [],
    // NOTE: CLOUDFLARE_BYPASS_REQUIRED is intentionally omitted. weebcentral.com
    // currently serves normal 200 responses with no Cloudflare challenge, so
    // declaring the intent made the app run its proactive bypass flow on add and
    // wait forever for a cf_clearance cookie that never arrives (the "add extension
    // page times out" symptom). Challenges, if they ever return, are still handled
    // reactively via scheduleAndUnwrap() + getCloudflareBypassRequestAsync().
    intents: types_1.SourceIntents.MANGA_CHAPTERS
        | types_1.SourceIntents.HOMEPAGE_SECTIONS
        | types_1.SourceIntents.SETTINGS_UI
};
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
class WeebCentralRequestInterceptor {
    async interceptResponse(response) {
        return response;
    }
    async interceptRequest(request) {
        const headers = request.headers ?? {};
        // Only set browser-like defaults; never override caller-supplied headers
        if (headers['user-agent'] === undefined && headers['User-Agent'] === undefined) {
            headers['user-agent'] = USER_AGENT;
        }
        if (headers['referer'] === undefined && headers['Referer'] === undefined) {
            headers['referer'] = `${Common_1.WEEBCENTRAL_BASE_URL}/`;
        }
        // Reassigning the base object is required for the native Swift bridge to see the change
        request.headers = headers;
        return request;
    }
}
exports.WeebCentralRequestInterceptor = WeebCentralRequestInterceptor;
class WeebCentral extends types_1.Source {
    constructor() {
        super(...arguments);
        this.stateManager = App.createSourceStateManager();
        this.requestManager = App.createRequestManager({
            requestsPerSecond: 4,
            requestTimeout: 20000,
            interceptor: new WeebCentralRequestInterceptor()
        });
    }
    async getCloudflareBypassRequestAsync() {
        return App.createRequest({
            url: Common_1.WEEBCENTRAL_BASE_URL,
            method: 'GET',
            headers: { 'user-agent': USER_AGENT }
        });
    }
    async getSourceMenu() {
        return App.createDUISection({
            id: 'main',
            header: 'Source Settings',
            isHidden: false,
            rows: async () => [
                (0, Settings_1.clearSearchTagsButton)(this.stateManager),
            ]
        });
    }
    async getMangaDetails(mangaId) {
        const request = App.createRequest({
            url: `${Common_1.WEEBCENTRAL_BASE_URL}/series/${mangaId}`,
            method: 'GET'
        });
        const response = await (0, Common_1.scheduleAndUnwrap)(this.requestManager, request);
        const $ = this.cheerio.load(response.data ?? '');
        return (0, Common_1.parseMangaDetails)($, mangaId);
    }
    async getChapters(mangaId) {
        const request = App.createRequest({
            url: `${Common_1.WEEBCENTRAL_BASE_URL}/series/${mangaId}/full-chapter-list`,
            method: 'GET'
        });
        const response = await (0, Common_1.scheduleAndUnwrap)(this.requestManager, request);
        const $ = this.cheerio.load(response.data ?? '');
        return (0, Common_1.parseChapterList)($);
    }
    async getChapterDetails(mangaId, chapterId) {
        const request = App.createRequest({
            url: `${Common_1.WEEBCENTRAL_BASE_URL}/chapters/${chapterId}/images`,
            method: 'GET',
            param: '?reading_style=long_strip'
        });
        const response = await (0, Common_1.scheduleAndUnwrap)(this.requestManager, request);
        const $ = this.cheerio.load(response.data ?? '');
        return App.createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: (0, Common_1.parseChapterImages)($)
        });
    }
    async getSearchTags() {
        // Called on the search screen; must never throw
        const cached = await (0, Common_1.getCachedSearchTags)(this.stateManager);
        if (cached !== undefined) {
            return cached;
        }
        try {
            const request = App.createRequest({
                url: `${Common_1.WEEBCENTRAL_BASE_URL}/search`,
                method: 'GET'
            });
            const response = await (0, Common_1.scheduleAndUnwrap)(this.requestManager, request);
            const $ = this.cheerio.load(response.data ?? '');
            const sections = (0, Common_1.parseSearchFacets)($);
            if (sections.length > 0) {
                await (0, Common_1.setCachedSearchTags)(this.stateManager, sections);
            }
            return sections;
        }
        catch (error) {
            console.log(`getSearchTags failed with error: ${error}`);
            return [];
        }
    }
    async getSearchResults(searchQuery, metadata) {
        // Also called when searching in another source; must never throw
        return (0, Common_1.searchRequest)(searchQuery, metadata, this.requestManager, this.cheerio);
    }
    async getHomePageSections(sectionCallback) {
        const section = App.createHomeSection({
            id: 'latest',
            title: 'Latest Updates',
            containsMoreItems: true,
            type: 'singleRowNormal'
        });
        // Let the app render an empty section first
        sectionCallback(section);
        try {
            section.items = await (0, Common_1.getLatestUpdatesTiles)(this.requestManager, this.cheerio, 1);
        }
        catch (error) {
            console.log(`getHomePageSections failed with error: ${error}`);
            section.items = (0, Common_1.getServerUnavailableMangaTiles)();
        }
        sectionCallback(section);
    }
    async getViewMoreItems(homepageSectionId, metadata) {
        if (homepageSectionId !== 'latest') {
            return App.createPagedResults({ results: [] });
        }
        const page = metadata?.page ?? 1;
        let tiles;
        try {
            tiles = await (0, Common_1.getLatestUpdatesTiles)(this.requestManager, this.cheerio, page);
        }
        catch (error) {
            console.log(`getViewMoreItems failed with error: ${error}`);
            return App.createPagedResults({ results: [] });
        }
        // If no tiles were returned we are on the last page
        return App.createPagedResults({
            results: tiles,
            metadata: tiles.length === 0 ? undefined : { page: page + 1 }
        });
    }
    getMangaShareUrl(mangaId) {
        return `${Common_1.WEEBCENTRAL_BASE_URL}/series/${mangaId}`;
    }
}
exports.WeebCentral = WeebCentral;

},{"./Common":62,"./Settings":63,"@paperback/types":61}]},{},[64])(64)
});
