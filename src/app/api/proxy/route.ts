import { NextRequest } from 'next/server';

// Netlify serverless functions have a 26s timeout (Pro) / 10s (Free)
// We use streaming responses to maximize what we can deliver
export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
    },
  });
}

export async function HEAD(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return new Response(null, { status: 400 });
  try {
    const res = await doFetch(url, null);
    return new Response(null, { status: res.status, headers: corsHeaders(url, res) });
  } catch {
    return new Response(null, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return new Response('Missing URL', { status: 400 });

  try {
    const range = req.headers.get('Range');
    let res = await doFetch(url, range);

    // Retry without Range if the server refuses it natively
    if ((res.status === 405 || res.status === 416) && range) {
      res = await doFetch(url, null);
    }

    return new Response(res.body, { status: res.status, headers: corsHeaders(url, res) });
  } catch (err: any) {
    console.error('[Proxy]', url, err.message);
    return new Response(`Proxy error: ${err.message}`, {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }
}

async function doFetch(url: string, range: string | null): Promise<Response> {
  const targetUrl = new URL(url);
  const headers: Record<string, string> = {
    'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18', // Industry standard for most IPTV providers
    'Accept': '*/*',
    'Connection': 'keep-alive',
    'Referer': `${targetUrl.origin}/`,
    'Origin': targetUrl.origin,
  };
  try { headers['Referer'] = new URL(url).origin + '/'; } catch (_) {}
  if (range) headers['Range'] = range;
  return fetch(url, { method: 'GET', headers, redirect: 'follow', cache: 'no-store' });
}

function corsHeaders(url: string, res: Response): Headers {
  const h = new Headers();
  for (const name of ['Content-Length', 'Content-Range', 'Accept-Ranges']) {
    const v = res.headers.get(name);
    if (v) h.set(name, v);
  }
  
  // Force Content-Type based on URL because providers often send wrong MIME types
  const lowerUrl = url.toLowerCase();
  let contentType = res.headers.get('Content-Type') || '';
  
  if (lowerUrl.includes('/live/') || lowerUrl.endsWith('.ts')) {
    contentType = 'video/mp2t';
  } else if (lowerUrl.endsWith('.mkv')) {
    contentType = 'video/x-matroska';
  } else if (lowerUrl.endsWith('.mp4') || lowerUrl.includes('/movie/') || lowerUrl.includes('/series/')) {
    contentType = 'video/mp4';
  }
  
  if (contentType) h.set('Content-Type', contentType);

  h.set('Access-Control-Allow-Origin', '*');
  h.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges, Content-Type');
  h.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  h.set('X-Content-Type-Options', 'nosniff');
  h.set('X-Frame-Options', 'SAMEORIGIN');
  h.set('Connection', 'keep-alive');
  return h;
}
