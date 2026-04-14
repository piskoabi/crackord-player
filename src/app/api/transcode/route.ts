import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Transcode endpoint — NOT available on Netlify.
 * FFmpeg requires a persistent server with binary execution support.
 * On Netlify, this returns a helpful error directing the user to use 
 * the direct stream instead.
 * 
 * For full transcoding support, deploy on Railway, Render, or a VPS.
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
    },
  });
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  
  return new Response(
    JSON.stringify({
      error: 'Transcoding is not available on Netlify',
      message: 'FFmpeg-based transcoding requires a persistent server. The stream will play directly without transcoding. If you need HEVC→H.264 conversion, deploy on Railway or a VPS.',
      fallback: url ? `/api/proxy?url=${encodeURIComponent(url)}` : null,
    }),
    {
      status: 501,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
