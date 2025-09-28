import { match as matchLocale } from "@formatjs/intl-localematcher";
import { NextResponse } from "next/server";
import type { NextRequest, NextFetchEvent } from "next/server";
import Negotiator from "negotiator";
import { withAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";

import { i18n } from "~/config/i18n-config";

const publicRoute = [
  "/(\\w{2}/)?signin(.*)",
  "/(\\w{2}/)?terms(.*)",
  "/(\\w{2}/)?privacy(.*)",
  "/(\\w{2}/)?docs(.*)",
  "/(\\w{2}/)?blog(.*)",
  "/(\\w{2}/)?pricing(.*)",
  "^/\\w{2}$", // root with locale
];

const noNeedProcessRoute = [".*\\.png", ".*\\.jpg", ".*\\.opengraph-image.png"];

const noRedirectRoute = ["/api(.*)", "/trpc(.*)", "/admin"];

function getLocale(request: NextRequest): string | undefined {
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

function isNoRedirect(request: NextRequest): boolean {
  const pathname = request.nextUrl.pathname;
  return noRedirectRoute.some((route) => new RegExp(route).test(pathname));
}

function isPublicPage(request: NextRequest): boolean {
  const pathname = request.nextUrl.pathname;
  return publicRoute.some((route) => new RegExp(route).test(pathname));
}

function isNoNeedProcess(request: NextRequest): boolean {
  const pathname = request.nextUrl.pathname;
  return noNeedProcessRoute.some((route) => new RegExp(route).test(pathname));
}

interface NextRequestWithAuth extends NextRequest {
  nextauth?: unknown;
}

const authMiddleware = withAuth(
  async function middlewares(req: NextRequestWithAuth) {
    const token = await getToken({ req });
    const isAuth = !!token;
    const isAdmin = token?.isAdmin;
    const isAuthPage = /^\/[a-zA-Z]{2,}\/(login|register|login-clerk)/.test(
      req.nextUrl.pathname,
    );
    const isAuthRoute = req.nextUrl.pathname.startsWith("/api/trpc/");
    const locale = getLocale(req);

    if (isAuthRoute && isAuth) {
      return NextResponse.next();
    }
    if (req.nextUrl.pathname.startsWith("/admin/dashboard")) {
      if (!isAuth || !isAdmin)
        return NextResponse.redirect(new URL(`/admin/login`, req.url));
      return NextResponse.next();
    }
    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
      }
      return null;
    }
    if (!isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }
      return NextResponse.redirect(
        new URL(`/${locale}/login?from=${encodeURIComponent(from)}`, req.url),
      );
    }
  },
  {
    callbacks: {
      authorized() {
        return true;
      },
    },
  },
);

/**
 * 1、 if the request is public page and don't have locale, redirect to locale page
 * 2、 if the request is not public page and don't have locale, redirect to login page
 * 3、
 * @param request
 * @returns
 */
export default async function middleware(
  request: NextRequest,
  event: NextFetchEvent,
) {
  if (isNoNeedProcess(request)) {
    return null;
  }
  const isWebhooksRoute = request.nextUrl.pathname.startsWith("/api/webhooks/");
  if (isWebhooksRoute) {
    return NextResponse.next();
  }
  const pathname = request.nextUrl.pathname;
  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) =>
      !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
  );
  // Redirect if there is no locale
  if (!isNoRedirect(request) && pathnameIsMissingLocale) {
    const locale = getLocale(request);
    return NextResponse.redirect(
      new URL(
        `/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`,
        request.url,
      ),
    );
  }

  if (isPublicPage(request)) {
    return null;
  }
  return authMiddleware(request as NextRequestWithAuth, event);
}
