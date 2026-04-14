import axios from 'axios';

export interface SearchResult {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  coverArt?: string;
  source: 'youtube' | 'spotify' | 'soundcloud' | 'deezer';
  sourceUrl?: string;
  youtubeId?: string;
  spotifyId?: string;
  previewUrl?: string;
}

/**
 * MusicSearchService - Aggregates multiple music APIs
 * Pattern: Adapter + Strategy for multi-source music search
 */
export class MusicSearchService {
  private static instance: MusicSearchService;
  private spotifyToken: string = '';
  private spotifyTokenExpiry: number = 0;

  static getInstance(): MusicSearchService {
    if (!MusicSearchService.instance) MusicSearchService.instance = new MusicSearchService();
    return MusicSearchService.instance;
  }

  // ─── Spotify Auth ──────────────────────────────────────────────────────────

  private async getSpotifyToken(): Promise<string> {
    if (this.spotifyToken && Date.now() < this.spotifyTokenExpiry) return this.spotifyToken;

    const credentials = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64');

    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      { headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    this.spotifyToken = response.data.access_token;
    this.spotifyTokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
    return this.spotifyToken;
  }

  // ─── YouTube Search ────────────────────────────────────────────────────────

  async searchYouTube(query: string, maxResults = 10): Promise<SearchResult[]> {
    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          key: process.env.YOUTUBE_API_KEY,
          q: query + ' official audio',
          type: 'video',
          part: 'snippet',
          maxResults,
          videoCategoryId: '10', // Music category
        },
      });

      const videoIds = response.data.items.map((i: any) => i.id.videoId).join(',');
      const detailsRes = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: { key: process.env.YOUTUBE_API_KEY, id: videoIds, part: 'contentDetails,snippet' },
      });

      return detailsRes.data.items.map((item: any) => {
        const duration = this.parseISO8601Duration(item.contentDetails.duration);
        return {
          id: `yt_${item.id}`,
          title: item.snippet.title,
          artist: item.snippet.channelTitle.replace(' - Topic', ''),
          duration,
          coverArt: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
          source: 'youtube' as const,
          youtubeId: item.id,
          sourceUrl: `https://www.youtube.com/watch?v=${item.id}`,
        };
      });
    } catch (err) {
      console.error('YouTube search error:', err);
      return [];
    }
  }

  private parseISO8601Duration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    return ((parseInt(match[1] || '0') * 3600) + (parseInt(match[2] || '0') * 60) + parseInt(match[3] || '0'));
  }

  // ─── Spotify Search ────────────────────────────────────────────────────────

  async searchSpotify(query: string, limit = 10): Promise<SearchResult[]> {
    try {
      const token = await this.getSpotifyToken();
      const response = await axios.get('https://api.spotify.com/v1/search', {
        params: { q: query, type: 'track', limit },
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.tracks.items.map((track: any) => ({
        id: `sp_${track.id}`,
        title: track.name,
        artist: track.artists.map((a: any) => a.name).join(', '),
        album: track.album.name,
        duration: Math.floor(track.duration_ms / 1000),
        coverArt: track.album.images[0]?.url,
        source: 'spotify' as const,
        spotifyId: track.id,
        previewUrl: track.preview_url,
        sourceUrl: track.external_urls.spotify,
      }));
    } catch (err) {
      console.error('Spotify search error:', err);
      return [];
    }
  }

  // ─── Deezer Search ────────────────────────────────────────────────────────

  async searchDeezer(query: string, limit = 10): Promise<SearchResult[]> {
    try {
      const response = await axios.get(`https://api.deezer.com/search`, {
        params: { q: query, limit },
      });

      return response.data.data.map((track: any) => ({
        id: `dz_${track.id}`,
        title: track.title,
        artist: track.artist.name,
        album: track.album.title,
        duration: track.duration,
        coverArt: track.album.cover_xl || track.album.cover_big,
        source: 'deezer' as const,
        previewUrl: track.preview,
        sourceUrl: track.link,
      }));
    } catch (err) {
      console.error('Deezer search error:', err);
      return [];
    }
  }

  // ─── Aggregated Search ─────────────────────────────────────────────────────

  async searchAll(query: string): Promise<{
    youtube: SearchResult[];
    spotify: SearchResult[];
    deezer: SearchResult[];
  }> {
    const [youtube, spotify, deezer] = await Promise.allSettled([
      this.searchYouTube(query, 8),
      this.searchSpotify(query, 8),
      this.searchDeezer(query, 8),
    ]);

    return {
      youtube: youtube.status === 'fulfilled' ? youtube.value : [],
      spotify: spotify.status === 'fulfilled' ? spotify.value : [],
      deezer: deezer.status === 'fulfilled' ? deezer.value : [],
    };
  }

  // ─── Get Spotify Track Audio Features ─────────────────────────────────────

  async getSpotifyAudioFeatures(spotifyId: string): Promise<{ energy: number; valence: number; bpm: number; key: string } | null> {
    try {
      const token = await this.getSpotifyToken();
      const response = await axios.get(`https://api.spotify.com/v1/audio-features/${spotifyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      return {
        energy: response.data.energy,
        valence: response.data.valence,
        bpm: Math.round(response.data.tempo),
        key: keys[response.data.key] || 'Unknown',
      };
    } catch {
      return null;
    }
  }
}
