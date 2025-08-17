import React, { useEffect, useState } from 'react';

const VOICE_SETTINGS_KEY = 'spectra:voice_settings_v1';

export type VoiceSettings = {
  model: string;
  ttsVoiceId: string;
  serverBase: string;
};

const defaultSettings: VoiceSettings = {
  model: 'OpenAssistant/oa-OpenHermes-1.0',
  ttsVoiceId: 'EXAVITQu4vr4xnSDxMaL',
  serverBase: (import.meta.env.VITE_VOICE_SERVER_BASE as string) || 'http://localhost:49231',
};

export default function VoiceSettingsPanel({
  onChange,
}: {
  onChange?: (s: VoiceSettings) => void;
}) {
  const [settings, setSettings] = useState<VoiceSettings>(() => {
    try {
      const raw = localStorage.getItem(VOICE_SETTINGS_KEY);
      return raw ? JSON.parse(raw) : defaultSettings;
    } catch (e) {
      return defaultSettings;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(VOICE_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      // Ignore storage errors
    }
    onChange?.(settings);
  }, [settings, onChange]);

  return (
    <div className="p-4 rounded border bg-card/60">
      <h3 className="text-sm font-semibold mb-2">Voice & Model Settings</h3>
      <div className="space-y-2">
        <label className="text-xs">Model (Hugging Face ID)</label>
        <input
          className="w-full p-2 rounded bg-background border"
          value={settings.model}
          onChange={(e) => setSettings({ ...settings, model: e.target.value })}
        />

        <label className="text-xs">TTS Voice ID</label>
        <input
          className="w-full p-2 rounded bg-background border"
          value={settings.ttsVoiceId}
          onChange={(e) => setSettings({ ...settings, ttsVoiceId: e.target.value })}
        />

        <label className="text-xs">Voice Server Base URL</label>
        <input
          className="w-full p-2 rounded bg-background border"
          value={settings.serverBase}
          onChange={(e) => setSettings({ ...settings, serverBase: e.target.value })}
        />
      </div>
    </div>
  );
}
