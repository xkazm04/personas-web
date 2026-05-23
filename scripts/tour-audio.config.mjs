/**
 * Configuration for generating Personas guided-tour narration audio with
 * ElevenLabs. Consumed by the (future) generation script; the API key is read
 * from process.env.ELEVENLABS_API_KEY (set in .env, never committed).
 *
 * Each of the 10 tour narration lines (the `tour.*` keys in src/i18n/en.ts,
 * referenced by src/lib/tour-script.ts) is synthesized to an MP3 under
 * `outputDir`, then wired back into each step's `audioSrc`.
 */
export const tourAudioConfig = {
  // ElevenLabs voice that narrates the tour.
  voiceId: "oOXZ9p1pftLHGwVDq7hj",

  // "Eleven Multilingual v2" — confirmed model_id; covers the 14 tour locales.
  // https://elevenlabs.io/docs/overview/models
  modelId: "eleven_multilingual_v2",

  // Voice settings (each 0..1), mirroring the requested studio sliders:
  //   stability 70%, similarity 70%, style exaggeration 5%.
  // `use_speaker_boost` is a default companion setting — flip if undesired.
  voiceSettings: {
    stability: 0.7,
    similarity_boost: 0.7,
    style: 0.05,
    use_speaker_boost: true,
  },

  // Output: 44.1 kHz / 128 kbps MP3 is a good web default. Clips land in
  // public/tour/ so they serve from /tour/<step-id>.mp3.
  outputFormat: "mp3_44100_128",
  outputDir: "public/tour",

  // Env var holding the API key (set in .env, gitignored — never inline it).
  apiKeyEnv: "ELEVENLABS_API_KEY",
};

export default tourAudioConfig;
