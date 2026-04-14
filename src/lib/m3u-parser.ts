import { parse } from 'iptv-playlist-parser';

export interface IPTVChannel {
  id: string;
  name: string;
  group: string;
  logo: string;
  url: string;
  tvgId: string;
  added?: string | number;
}

export interface IPTVPlaylist {
  header: any;
  items: IPTVChannel[];
}

export function parseM3U(content: string): IPTVPlaylist {
  const result = parse(content);
  
  const items: IPTVChannel[] = result.items.map((item: any, index: number) => ({
    id: item.tvg.id || `channel-${index}`,
    name: item.name || '',
    group: item.group?.title || 'Other',
    logo: item.tvg.logo || '',
    url: item.url,
    tvgId: item.tvg.id || '',
  }));

  return {
    header: result.header,
    items,
  };
}

export async function fetchAndParseM3U(url: string): Promise<IPTVPlaylist> {
  console.log(`[M3U-Parser] Fetching playlist from: ${url}`);
  try {
    const hostUrl = new URL(url);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate',
        'Referer': `${hostUrl.origin}/`,
        'Origin': hostUrl.origin,
      },
    });
    
    if (!response.ok) {
      console.error(`[M3U-Parser] Fetch failed with status ${response.status}: ${response.statusText}`);
      throw new Error(`Failed to fetch playlist (Status ${response.status}): ${response.statusText}`);
    }
    
    const content = await response.text();
    if (!content || !content.trim()) {
      throw new Error('Playlist is empty');
    }
    
    console.log(`[M3U-Parser] Successfully fetched ${content.length} bytes. Starting parse...`);
    return parseM3U(content);
  } catch (error: any) {
    console.error(`[M3U-Parser] Error:`, error);
    throw error;
  }
}
