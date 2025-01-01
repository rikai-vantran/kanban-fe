import { NextRequest, NextResponse } from "next/server";
import { i18n } from "@/config/i18n-config";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { cookies } from "next/headers";

const PUBLIC_ROUTES = ["login", "register"];

function getLocale(request: NextRequest): string | undefined {
    const negotiatorHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));
    // @ts-expect-error locales are readonly
    const locales: string[] = i18n.locales;
    const languages = new Negotiator({ headers: negotiatorHeaders }).languages(
        locales,
    );
    const locale = matchLocale(languages, locales, i18n.defaultLocale);
    return locale;
}

function isPublicRoute(pathname: string): boolean {
    return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
    const cookieStore = await cookies();
    const isLogin = cookieStore.get("access-token")?.value ? true : false;

    const { pathname } = request.nextUrl;

    const pathnameHasLocale = i18n.locales.some(
        (locale) =>
            pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
    );

    if (pathnameHasLocale) {
        const pathWithoutLocale = pathname.split('/').slice(2).join('/')
        if (!isPublicRoute(pathWithoutLocale) && !isLogin) {
            request.nextUrl.pathname = `/${pathname.split('/')[1]}/login`;
            return NextResponse.redirect(request.nextUrl);
        }
        if (isPublicRoute(pathWithoutLocale) && isLogin) {
            request.nextUrl.pathname = `/${pathname.split('/')[1]}/`;
            return NextResponse.redirect(request.nextUrl);
        }
        return 
    }

    const locale = getLocale(request);
    if (!isPublicRoute(pathname) && !isLogin) {
        request.nextUrl.pathname = `/${locale}${'/login'}`
        return NextResponse.redirect(request.nextUrl);
    }
    if (isPublicRoute(pathname) && isLogin) {
        request.nextUrl.pathname = `/${locale}${'/'}`
        return NextResponse.redirect(request.nextUrl);
    }
    request.nextUrl.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
}

export const config = {
    matcher: ["/((?!_next|api|.*\\.).*)"],
};
