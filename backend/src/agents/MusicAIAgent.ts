import Groq from 'groq-sdk';

/**
 * MusicAIAgent - Singleton pattern para inteligencia musical con IA
 * Usa Groq (GRATIS) con llama-3.3-70b-versatile
 *
 * Cómo obtener clave gratuita:
 *   1. https://console.groq.com → Sign up (sin tarjeta)
 *   2. API Keys → Create API Key
 *   3. Agrega GROQ_API_KEY en .env
 *
 * Límites gratuitos:
 *   - 30 requests/minuto
 *   - 6,000 tokens/minuto
 *   - 500,000 tokens/día
 */
export class MusicAIAgent {
  private static instance: MusicAIAgent;
  private client: Groq;
  private readonly MODEL = 'llama-3.3-70b-versatile';
  private conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  private constructor() {
    this.client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  static getInstance(): MusicAIAgent {
    if (!MusicAIAgent.instance) MusicAIAgent.instance = new MusicAIAgent();
    return MusicAIAgent.instance;
  }

  async detectMoodFromHistory(recentSongs: Array<{ title: string; artist: string; genre?: string }>): Promise<{
    mood: string; themeColor: string; recommendation: string; energyLevel: number;
  }> {
    const songList = recentSongs.slice(0, 10)
      .map(s => `- "${s.title}" by ${s.artist}${s.genre ? ` (${s.genre})` : ''}`).join('\n');

    const prompt = `Analiza estas canciones y determina el estado emocional del usuario:
${songList}

Responde ÚNICAMENTE con JSON válido (sin texto extra, sin markdown):
{"mood":"happy","themeColor":"#F59E0B","recommendation":"Sigue con música alegre","energyLevel":8}

mood puede ser: happy, energetic, calm, melancholic, focused, romantic, default
themeColor: color hex VIBRANTE (NO negro)
energyLevel: 1-10`;

    try {
      const res = await this.client.chat.completions.create({
        model: this.MODEL, messages: [{ role: 'user', content: prompt }],
        max_tokens: 150, temperature: 0.3,
      });
      const text = res.choices[0]?.message?.content?.trim() || '';
      const m = text.match(/\{[^}]+\}/);
      if (m) return JSON.parse(m[0]);
    } catch (err) { console.error('[AI] detectMood:', err); }
    return { mood: 'default', themeColor: '#7C3AED', recommendation: 'Explora nueva música', energyLevel: 5 };
  }

  async getPersonalizedRecommendations(userProfile: {
    favoriteGenres: string[]; recentArtists: string[]; mood: string; timeOfDay: number;
  }): Promise<Array<{ query: string; reason: string; searchTerm: string }>> {
    const hour = userProfile.timeOfDay;
    const timeCtx = hour < 6 ? 'madrugada' : hour < 12 ? 'mañana' : hour < 17 ? 'tarde' : 'noche';

    const prompt = `Sugiere 6 canciones específicas para este perfil:
- Géneros: ${userProfile.favoriteGenres.join(', ') || 'variados'}
- Artistas recientes: ${userProfile.recentArtists.slice(0, 5).join(', ') || 'varios'}
- Mood: ${userProfile.mood}
- Hora: ${timeCtx}

Responde ÚNICAMENTE con array JSON (sin texto extra):
[{"query":"Título - Artista","reason":"Razón en español (máx 8 palabras)","searchTerm":"titulo artista"},...]

Incluye música latina e internacional. Usa artistas y títulos reales.`;

    try {
      const res = await this.client.chat.completions.create({
        model: this.MODEL, messages: [{ role: 'user', content: prompt }],
        max_tokens: 500, temperature: 0.7,
      });
      const text = res.choices[0]?.message?.content?.trim() || '';
      const m = text.match(/\[[\s\S]*\]/);
      if (m) { const p = JSON.parse(m[0]); if (Array.isArray(p)) return p.slice(0, 6); }
    } catch (err) { console.error('[AI] recommendations:', err); }
    return [];
  }

  async chat(userMessage: string, context: {
    currentSong?: string; mood?: string; playlist?: string[];
  }): Promise<string> {
    const system = `Eres Harmonia, un asistente musical apasionado e inteligente. Ayudas a descubrir música, entender canciones y crear playlists.
${context.currentSong ? `Canción actual: ${context.currentSong}` : ''}${context.mood ? ` | Mood: ${context.mood}` : ''}
Responde en español, conversacional, máximo 3 oraciones salvo que pidan más.`;

    this.conversationHistory.push({ role: 'user', content: userMessage });
    if (this.conversationHistory.length > 10) this.conversationHistory = this.conversationHistory.slice(-10);

    try {
      const res = await this.client.chat.completions.create({
        model: this.MODEL,
        messages: [{ role: 'system', content: system }, ...this.conversationHistory],
        max_tokens: 250, temperature: 0.8,
      });
      const reply = res.choices[0]?.message?.content?.trim() || '¡Dime qué música quieres escuchar!';
      this.conversationHistory.push({ role: 'assistant', content: reply });
      return reply;
    } catch (err) { console.error('[AI] chat:', err); }
    return '¡Aquí para ayudarte con música! ¿Qué quieres escuchar?';
  }

  async generatePlaylistName(songs: Array<{ title: string; artist: string }>): Promise<string> {
    if (songs.length === 0) return 'Mi Playlist';
    const sample = songs.slice(0, 5).map(s => `"${s.title}" de ${s.artist}`).join(', ');
    const prompt = `Canciones: ${sample}\nGenera UN nombre creativo para esta playlist (máx 4 palabras, español o inglés, sin comillas). Solo el nombre.`;
    try {
      const res = await this.client.chat.completions.create({
        model: this.MODEL, messages: [{ role: 'user', content: prompt }],
        max_tokens: 20, temperature: 0.9,
      });
      return res.choices[0]?.message?.content?.trim().replace(/^["']|["']$/g, '') || 'Mi Playlist';
    } catch { return 'Mi Playlist'; }
  }

  async analyzeSong(title: string, artist: string): Promise<{
    description: string; mood: string; similarArtists: string[];
  }> {
    const prompt = `Analiza la canción "${title}" de ${artist}.
JSON válido (sin markdown): {"description":"descripción en español máx 20 palabras","mood":"happy|energetic|calm|melancholic|focused|romantic|default","similarArtists":["A1","A2","A3"]}`;
    try {
      const res = await this.client.chat.completions.create({
        model: this.MODEL, messages: [{ role: 'user', content: prompt }],
        max_tokens: 150, temperature: 0.4,
      });
      const text = res.choices[0]?.message?.content?.trim() || '';
      const m = text.match(/\{[\s\S]*\}/);
      if (m) return JSON.parse(m[0]);
    } catch { /* silent */ }
    return { description: 'Una gran canción', mood: 'default', similarArtists: [] };
  }

  resetConversation(): void { this.conversationHistory = []; }
}
