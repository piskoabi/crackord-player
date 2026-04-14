import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');
  const name = searchParams.get('name') || 'Playlist';

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  // Create M3U Content
  const m3uContent = `#EXTM3U\n#EXTINF:-1,${name}\n${url}`;

  // Use a safe filename
  const safeName = name.replace(/[^a-z0-9]/gi, '_').substring(0, 30);

  // Return as a downloadable file
  return new Response(m3uContent, {
    headers: {
      'Content-Type': 'application/x-mpegurl',
      'Content-Disposition': `attachment; filename="${safeName}.m3u"`,
      'Cache-Control': 'no-cache',
    },
  });
}
