export type ICallback = 
    { type: 'NAV_EXT', details: { url: string }} |
    { type: 'NAV_IN_APP', details: { route: string; method: 'PUSH' | 'REPLACE' }} |
    { type: 'NAV_IN_PAGE', details: { callback: string, callback_args?: unknown[] }}
