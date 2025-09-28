import { match as matchLocale } from "@formatjs/intl-localematcher";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import Negotiator from "negotiator";

import { i18n } from "~/config/i18n-config";
import { env } from "@saasfly/auth/env.mjs";

const noNeedProcessRoute = [".*\\.png", ".*\\.jpg", ".*\\.opengraph-image.png"];

const noRedirectRoute = ["/api(.*)", "/trpc(.*)", "/admin"];

export const isPublicRoute = createRouteMatcher([
  new RegExp("/(\\w{2}/)?signin(.*)"),
  new RegExp("/(\\w{2}/)?terms(.*)"),
  new RegExp("/(\\w{2}/)?privacy(.*)"),
  new RegExp("/(\\w{2}/)?docs(.*)"),
  new RegExp("/(\\w{2}/)?blog(.*)"),
  new RegExp("/(\\w{2}/)?pricing(.*)"),
  new RegExp("/(\\w{2}/)?image-to-prompt(.*)"), // 图片转提示词页面
  new RegExp("/api/generate-prompt(.*)"), // API路由
  new RegExp("^/\\w{2}$"), // root with locale
]);

export function getLocale(request: NextRequest): string | undefined {
  // Negotiator expects plain object so we need to transform headers
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));
  const locales = Array.from(i18n.locales);
  // Use negotiator and intl-localematcher to get best locale
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages(
    locales,
  );
  return matchLocale(languages, locales, i18n.defaultLocale);
}

export function isNoRedirect(request: NextRequest): boolean {
  const pathname = request.nextUrl.pathname;
  return noRedirectRoute.some((route) => new RegExp(route).test(pathname));
}

export function isNoNeedProcess(request: NextRequest): boolean {
  const pathname = request.nextUrl.pathname;
  return noNeedProcessRoute.some((route) => new RegExp(route).test(pathname));
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export const middleware = async (req: NextRequest) => {
  if (isNoNeedProcess(req)) {
    return null;
  }

  const isWebhooksRoute = req.nextUrl.pathname.startsWith("/api/webhooks/");
  if (isWebhooksRoute) {
    return NextResponse.next();
  }
  const pathname = req.nextUrl.pathname;
  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) =>
      !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
  );
  // Redirect if there is no locale
  if (!isNoRedirect(req) && pathnameIsMissingLocale) {
    const locale = getLocale(req);
    return NextResponse.redirect(
      new URL(
        `/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`,
        req.url,
      ),
    );
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  if (isPublicRoute(req)) {
    return null;
  }

  // Skip authentication for now to avoid Clerk errors
  return NextResponse.next();
};
