export interface XtreamCredentials {
  host: string;
  username: string;
  password: string;
}

export interface XtreamCategory {
  category_id: string;
  category_name: string;
  parent_id: number;
}

export interface XtreamStream {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string;
  added: string;
  category_id: string;
  custom_sid: string;
  tv_archive: number;
  direct_source: string;
  tv_archive_duration: number;
}

export class XtreamClient {
  private credentials: XtreamCredentials;
  private host: string;
  private encodedUsername: string;
  private encodedPassword: string;

  constructor(credentials: XtreamCredentials) {
    this.credentials = credentials;
    // Normalize host: remove trailing slash(es) to avoid double-slash in URLs
    this.host = credentials.host.replace(/\/+$/, '');
    // URL-encode credentials to handle special characters like #, &, +, etc.
    this.encodedUsername = encodeURIComponent(credentials.username);
    this.encodedPassword = encodeURIComponent(credentials.password);
  }

  private getBaseUrl(): string {
    return `${this.host}/player_api.php?username=${this.encodedUsername}&password=${this.encodedPassword}`;
  }

  private async fetchWithHeaders(url: string, retryCount = 1): Promise<Response> {
    const hostUrl = new URL(this.host);
    const headers: Record<string, string> = {
      'User-Agent': 'IPTVSmartersPlayer',
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate',
      'X-Requested-With': 'com.nst.iptvsmarterstvbox',
      'Referer': `${hostUrl.origin}/`,
      'Origin': hostUrl.origin,
    };
    
    try {
      const response = await fetch(url, { headers });
      
      if (response.status === 503 && retryCount > 0) {
        console.warn(`[Xtream] 503 detected, retrying in 1000ms... (Attempts left: ${retryCount})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.fetchWithHeaders(url, retryCount - 1);
      }

      if (!response.ok) {
        console.error(`[Xtream] Fetch failed: ${url} Status: ${response.status}`);
        throw new Error(`Server responded with ${response.status}`);
      }
      return response;
    } catch (error: any) {
      if (retryCount > 0) {
        console.warn(`[Xtream] Fetch error, retrying in 1000ms...: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.fetchWithHeaders(url, retryCount - 1);
      }
      throw error;
    }
  }

  async authenticate() {
    const response = await this.fetchWithHeaders(this.getBaseUrl());
    const data = await response.json();
    if (data.user_info?.auth === 0) throw new Error('Invalid credentials');
    return data;
  }

  async getLiveCategories(): Promise<XtreamCategory[]> {
    const response = await this.fetchWithHeaders(`${this.getBaseUrl()}&action=get_live_categories`);
    return response.json();
  }

  async getLiveStreams(categoryId?: string): Promise<XtreamStream[]> {
    const url = categoryId 
      ? `${this.getBaseUrl()}&action=get_live_streams&category_id=${categoryId}`
      : `${this.getBaseUrl()}&action=get_live_streams`;
    const response = await this.fetchWithHeaders(url);
    return response.json();
  }

  async getVodStreams(): Promise<XtreamStream[]> {
    const response = await this.fetchWithHeaders(`${this.getBaseUrl()}&action=get_vod_streams`);
    return response.json();
  }

  async getVodCategories(): Promise<XtreamCategory[]> {
    const response = await this.fetchWithHeaders(`${this.getBaseUrl()}&action=get_vod_categories`);
    return response.json();
  }

  async getSeries(): Promise<any[]> {
    const response = await this.fetchWithHeaders(`${this.getBaseUrl()}&action=get_series`);
    return response.json();
  }

  async getSeriesCategories(): Promise<XtreamCategory[]> {
    const response = await this.fetchWithHeaders(`${this.getBaseUrl()}&action=get_series_categories`);
    return response.json();
  }

  async getSeriesInfo(seriesId: string | number): Promise<any> {
    const response = await this.fetchWithHeaders(`${this.getBaseUrl()}&action=get_series_info&series_id=${seriesId}`);
    return response.json();
  }

  getStreamUrl(streamId: string | number, type: 'live' | 'movie' | 'series' = 'live', extension: string = ''): string {
    const category = type === 'movie' ? 'movie' : type === 'series' ? 'series' : 'live';
    
    // For VOD (movies/series), most providers prefer no extension in the path or it results in 405 Method Not Allowed.
    if (type !== 'live') {
      return `${this.host}/${category}/${this.encodedUsername}/${this.encodedPassword}/${streamId}`;
    }

    let ext = extension || 'ts';
    // Remove leading dot if present
    ext = ext.startsWith('.') ? ext.slice(1) : ext;
    
    return `${this.host}/${category}/${this.encodedUsername}/${this.encodedPassword}/${streamId}.${ext}`;
  }
}
