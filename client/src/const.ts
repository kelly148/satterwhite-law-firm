export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Where to send a visitor who needs to authenticate.
 *
 * This used to build a Manus OAuth portal URL. Login is now handled entirely by
 * this app at /admin/login, so the redirect is a plain local path.
 */
export const getLoginUrl = () => "/admin/login";
