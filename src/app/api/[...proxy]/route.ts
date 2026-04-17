import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL || "http://localhost:3000";

async function handler(req: NextRequest) {
  // Strip the /api prefix to get the real backend
  const path = req.nextUrl.pathname.replace(/^\/api/, "");
  const search = req.nextUrl.search;
  const url = `${BACKEND_URL}${path}${search}`;

  const headers = new Headers(req.headers);
  headers.delete("host");

  let body: string | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.text();
  }

  try {
    const backendRes = await fetch(url, {
      method: req.method,
      headers,
      body,
      // @ts-expect-error — Node 18+ fetch supports duplex
      duplex: "half",
    });

    const responseHeaders = new Headers(backendRes.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("transfer-encoding");
    responseHeaders.delete("content-length");
    responseHeaders.set("Access-Control-Allow-Origin", "*");

    const responseBody = await backendRes.text();

    return new NextResponse(responseBody, {
      status: backendRes.status,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error("[Proxy Error]", err);
    return NextResponse.json(
      { message: "Could not reach backend server. Is it running on port 3000?" },
      { status: 502 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
