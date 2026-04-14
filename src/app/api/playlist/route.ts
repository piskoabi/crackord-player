import { NextRequest, NextResponse } from 'next/server';
import { fetchAndParseM3U } from '@/lib/m3u-parser';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'M3U URL is required' }, { status: 400 });
  }

  try {
    const playlist = await fetchAndParseM3U(url);
    return NextResponse.json(playlist);
  } catch (error: any) {
    console.error('Error parsing M3U:', error);
    return NextResponse.json({ error: error.message || 'Failed to parse M3U' }, { status: 500 });
  }
}
