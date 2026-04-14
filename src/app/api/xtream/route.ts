import { NextRequest, NextResponse } from 'next/server';
import { XtreamClient, type XtreamCredentials } from '@/lib/xtream';

export async function POST(request: NextRequest) {
  const credentials = await request.json() as XtreamCredentials;
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action') || 'live';

  if (!credentials.host || !credentials.username || !credentials.password) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
  }

  const client = new XtreamClient(credentials);

  try {
    console.log(`[Xtream API] Action: ${action} for host: ${credentials.host}`);
    if (action === 'auth') {
      const info = await client.authenticate();
      return NextResponse.json(info);
    } else if (action === 'live') {
      const streams = await client.getLiveStreams();
      const categories = await client.getLiveCategories();
      console.log(`[Xtream API] Found ${streams?.length || 0} streams and ${categories?.length || 0} categories`);
      return NextResponse.json({ items: streams, categories });
    } else if (action === 'vod') {
      const streams = await client.getVodStreams();
      const categories = await client.getVodCategories();
      console.log(`[Xtream API] Found ${streams?.length || 0} VODs and ${categories?.length || 0} categories`);
      return NextResponse.json({ items: streams, categories });
    } else if (action === 'series') {
      const series = await client.getSeries();
      const categories = await client.getSeriesCategories();
      console.log(`[Xtream API] Found ${series?.length || 0} series and ${categories?.length || 0} categories`);
      return NextResponse.json({ items: series, categories });
    } else if (action === 'series_info') {
      const seriesId = searchParams.get('series_id');
      if (!seriesId) return NextResponse.json({ error: 'Missing series_id' }, { status: 400 });
      const info = await client.getSeriesInfo(seriesId);
      return NextResponse.json(info);
    }
  } catch (error: any) {
    console.error('[Xtream API] Error:', error.message);
    return NextResponse.json({ error: error.message || 'Failed to fetch from Xtream API' }, { status: 500 });
  }
}
