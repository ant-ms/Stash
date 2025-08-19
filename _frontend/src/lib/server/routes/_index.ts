import * as credentials from "./credentials"
import * as gks from "./gks"
import * as groups from "./groups"
import * as jobs from "./jobs"
import * as media from "./media"
import * as mediaQuery from "./media-query"
import * as settings from "./settings"
import * as stories from "./stories"
import * as tags from "./tags"
import * as transmission from "./transmission"

export default {
    ...tags,
    ...media,
    ...mediaQuery,
    ...gks,
    ...stories,
    ...jobs,
    ...credentials,
    ...transmission,
    ...groups,
    ...settings
}
