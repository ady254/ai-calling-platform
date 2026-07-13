"use client";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Play, Pause, RotateCcw, Volume2, AudioLines } from 'lucide-react';
import { AudioRecording } from '@/types/call-details';

export interface AudioPlayerHandle {
  seek: (seconds: number) => void;
  play: () => void;
}

interface AudioPlayerProps {
  recording: AudioRecording | null;
  onTimeUpdate?: (seconds: number) => void;
}

const SPEEDS = [0.5, 1, 1.5, 2] as const;
const BAR_COUNT = 72;

// Deterministic pseudo-waveform so the player looks real without an asset.
const BARS = Array.from({ length: BAR_COUNT }, (_, i) => {
  const v =
    Math.abs(Math.sin(i * 0.5) * 0.55 + Math.sin(i * 0.13) * 0.3 + Math.cos(i * 0.27) * 0.25);
  return 0.22 + (v % 1) * 0.78; // 0.22 .. 1.0
});

function fmt(t: number) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const AudioPlayer = forwardRef<AudioPlayerHandle, AudioPlayerProps>(function AudioPlayer(
  { recording, onTimeUpdate },
  ref
) {
  const duration = recording?.durationSeconds ?? 0;
  const hasUrl = !!recording?.url;
  const audioRef = useRef<HTMLAudioElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);

  // Report time upward for transcript sync.
  useEffect(() => {
    onTimeUpdate?.(currentTime);
  }, [currentTime, onTimeUpdate]);

  // Simulated playback clock when there is no real audio asset.
  useEffect(() => {
    if (!isPlaying || hasUrl || duration === 0) return;
    const id = setInterval(() => {
      setCurrentTime((t) => {
        const next = t + 0.1 * speed;
        if (next >= duration) {
          setIsPlaying(false);
          return duration;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(id);
  }, [isPlaying, hasUrl, duration, speed]);

  // Keep the real audio element's rate in sync.
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  const doSeek = useCallback(
    (seconds: number) => {
      const clamped = Math.max(0, Math.min(seconds, duration || seconds));
      setCurrentTime(clamped);
      if (audioRef.current) audioRef.current.currentTime = clamped;
    },
    [duration]
  );

  const play = useCallback(() => {
    if (duration === 0) return;
    if (currentTime >= duration) doSeek(0);
    setIsPlaying(true);
    if (audioRef.current) audioRef.current.play().catch(() => {});
  }, [currentTime, duration, doSeek]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (audioRef.current) audioRef.current.pause();
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      seek: (seconds: number) => {
        doSeek(seconds);
        play();
      },
      play,
    }),
    [doSeek, play]
  );

  const togglePlay = () => (isPlaying ? pause() : play());

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current || duration === 0) return;
    const rect = trackRef.current.getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    doSeek(fraction * duration);
  };

  const progress = duration > 0 ? currentTime / duration : 0;

  // ── Recording unavailable ────────────────────────────────────────────
  if (!recording) {
    return (
      <div className="bg-white/95 rounded-2xl p-6 border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)]">
        <h3 className="text-base font-semibold text-slate-800 font-sans tracking-tight mb-5">Conversation Player</h3>
        <div className="flex flex-col items-center justify-center text-center py-10 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
            <AudioLines className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-500">Recording not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/95 rounded-2xl p-6 border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)]">
      {hasUrl && (
        <audio
          ref={audioRef}
          src={recording.url ?? undefined}
          onTimeUpdate={(e) => setCurrentTime((e.target as HTMLAudioElement).currentTime)}
          onEnded={() => setIsPlaying(false)}
          preload="metadata"
        />
      )}

      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-slate-800 font-sans tracking-tight">Conversation Player</h3>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
          <Volume2 className="w-3.5 h-3.5" />
          Recording
        </span>
      </div>

      {/* Waveform */}
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        className="relative h-24 flex items-center gap-[3px] cursor-pointer select-none rounded-xl bg-slate-50/60 border border-slate-100 px-3"
        role="slider"
        aria-label="Seek"
        aria-valuenow={Math.round(currentTime)}
        aria-valuemax={Math.round(duration)}
      >
        {BARS.map((h, i) => {
          const played = i / BAR_COUNT <= progress;
          return (
            <div
              key={i}
              className="flex-1 rounded-full transition-colors duration-150"
              style={{
                height: `${h * 100}%`,
                background: played
                  ? 'linear-gradient(180deg,#6366f1,#8b5cf6)'
                  : '#e2e8f0',
              }}
            />
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4 mt-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => doSeek(0)}
            className="w-9 h-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center transition-colors"
            aria-label="Restart"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={togglePlay}
            className="w-11 h-11 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center shadow-sm transition-all active:scale-95"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <div className="text-sm font-semibold text-slate-700 tabular-nums">
            {fmt(currentTime)}
            <span className="text-slate-300 font-medium"> / {fmt(duration)}</span>
          </div>
        </div>

        {/* Playback speed */}
        <div className="bg-slate-100/80 p-0.5 rounded-xl flex items-center border border-slate-200/20">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all duration-200 ${
                speed === s ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

export default AudioPlayer;
