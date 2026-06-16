import { NextResponse, type NextRequest } from "next/server";

// Conservative mobile-UA match. iPadOS Safari reports a desktop Mac UA, so
// tablets intentionally stay on the full dashboard. The `prefer-full` cookie is
// the escape hatch for any phone user who wants the full dashboard anyway.
const MOBILE_UA = /Android|iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini|Mobile Safari/i;

// Map a requested /dashboard subpath to the closest purpose-built /m view, so a
// deep link (from an email, push notification, or shared URL) lands where the
// user was headed instead of always dumping them on the overview. First match
// wins; anything unmatched falls through to /m/overview. The mobile Alerts page
// consolidates incidents / health / SLA / observability.
const MOBILE_ROUTE_MAP: ReadonlyArray<readonly [RegExp, string]> = [
  [/^\/dashboard\/messages(\/|$)/, "/m/messages"],
  [/^\/dashboard\/reviews(\/|$)/, "/m/reviews"],
  [/^\/dashboard\/(incidents|health|sla|observability)(\/|$)/, "/m/alerts"],
];

function mobilePathFor(pathname: string): string {
  for (const [pattern, target] of MOBILE_ROUTE_MAP) {
    if (pattern.test(pathname)) return target;
  }
  return "/m/overview";
}

export function proxy(request: NextRequest) {
  if (request.cookies.get("prefer-full")?.value === "1") {
    return NextResponse.next();
  }

  const ua = request.headers.get("user-agent") ?? "";
  if (MOBILE_UA.test(ua)) {
    const url = request.nextUrl.clone();
    url.pathname = mobilePathFor(url.pathname);
    // Keep url.search intact so deep-link ids and UTM / attribution params
    // survive the redirect (analytics reads them on the mobile landing page).
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
