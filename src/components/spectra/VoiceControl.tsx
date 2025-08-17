import React, { useCallback, useEffect, useRef, useState } from 'react';
import { spectraAI } from './AIEngine';

// Voice Control UI using server-side STT/TTS.
// Records audio, sends to /voice/transcribe, gets AI response, then sends to /voice/tts for playback.

const VOICE_SERVER_BASE =
  (import.meta.env.VITE_VOICE_SERVER_BASE as string) || 'http://localhost:49231';

export default function VoiceControl() {
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState('idle');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const appendLog = useCallback(async (entry: { title: string; body: string }) => {
    try {
      await fetch(`${VOICE_SERVER_BASE}/voice/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'voice-interface', ...entry }),
      });
    } catch (err) {
      console.warn('Voice log failed:', err);
    }
  }, []);

  const speakText = useCallback(async (text: string) => {
    try {
      const response = await fetch(`${VOICE_SERVER_BASE}/voice/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error('TTS API request failed');
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
      }
    } catch (err) {
      console.error('TTS Error:', err);
    }
  }, []);

  const handleTranscript = useCallback(
    async (transcript: string) => {
      if (!transcript.trim()) {
        setStatus('idle');
        return;
      }
      setStatus('processing');
      await appendLog({ title: 'STT', body: transcript });

      const response = await spectraAI.generateResponse(transcript, []);
      const responseText = response?.text ?? String(response || '');
      await appendLog({ title: 'AI_RESPONSE', body: responseText });

      setStatus('speaking');
      await speakText(responseText);
      setStatus('idle');
    },
    [appendLog, speakText]
  );

  const startRecognition = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setStatus('transcribing');
        try {
          const formData = new FormData();
          formData.append('audio', audioBlob);
          const response = await fetch(`${VOICE_SERVER_BASE}/voice/transcribe`, {
            method: 'POST',
            body: formData,
          });
          if (!response.ok) throw new Error('Transcription request failed');
          const result = await response.json();
          await handleTranscript(result.transcript || '');
        } catch (err) {
          console.error('Transcription Error:', err);
          setStatus('error');
        }
      };

      recorder.start();
      setListening(true);
      setStatus('listening');
    } catch (err) {
      console.error('Microphone access error:', err);
      setStatus('error');
    }
  }, [handleTranscript]);

  const stopRecognition = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setListening(false);
  }, []);

  useEffect(() => {
    audioRef.current = new Audio();
    return () => {
      stopRecognition();
    };
  }, [stopRecognition]);

  const toggle = () => {
    if (listening) {
      stopRecognition();
    } else {
      startRecognition();
    }
  };

  return (
    <div className="voice-control">
      <div>
        <button onClick={toggle} className="btn">
          {listening ? 'Stop Listening' : 'Start Voice'}
        </button>
        <span style={{ marginLeft: 12 }}>{status}</span>
      </div>
      {status === 'error' && (
        <div style={{ marginTop: 8, color: 'red' }}>
          An error occurred. Check microphone permissions and ensure the voice server is running.
        </div>
      )}
    </div>
  );
}
