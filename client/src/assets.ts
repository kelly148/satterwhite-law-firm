/**
 * assets.ts — single source of truth for site imagery.
 *
 * Every image used to be served from the old platform's CDN. That bucket now
 * returns 403, so all assets are served from this repo's own /public/assets
 * directory instead. To change any picture, drop a replacement file in
 * client/public/assets under the same name; nothing else needs to change.
 *
 * NOTE: logo.png is the real firm logo. The five photographs below are plain
 * brand-coloured placeholder panels — the originals were lost with the old CDN
 * and need to be replaced with real photography.
 */

export const LOGO_URL = "/assets/logo.png";
export const HERO_BG = "/assets/hero.jpg";
export const CONSULTATION_IMG = "/assets/consultation.jpg";
export const FAMILY_IMG = "/assets/family.jpg";
export const VA_LANDSCAPE = "/assets/virginia.jpg";
export const DOCS_IMG = "/assets/documents.jpg";
