import { NextResponse, type NextRequest } from "next/server";

// Conservative mobile-UA match. iPadOS Safari reports a desktop Mac UA, so
// tablets intentionally stay on the full dashboard. The `prefer-full` cookie is
// the escape hatch for any phone user who wants the full dashboard anyway.
const MOBILE_UA = /Android|iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini|Mobile Safari/i;

export function proxy(request: NextRequest) {
  if (request.cookies.get("prefer-full")?.value === "1") {
    return NextResponse.next();
  }

  const ua = request.headers.get("user-agent") ?? "";
  if (MOBILE_UA.test(ua)) {
    const url = request.nextUrl.clone();
    url.pathname = "/m/overview";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
