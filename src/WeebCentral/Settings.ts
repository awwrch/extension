import { DUIButton,
    SourceStateManager } from '@paperback/types'
import { setCachedSearchTags } from './Common'
export const clearSearchTagsButton = (stateManager: SourceStateManager): DUIButton => {
    return App.createDUIButton({
        id: 'clear_search_tags',
        label: 'Clear Cached Search Filters',
        onTap: () => setCachedSearchTags(stateManager, undefined)
    })
}
