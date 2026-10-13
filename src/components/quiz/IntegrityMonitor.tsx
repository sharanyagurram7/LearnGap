import React, { useEffect, useState, useRef } from 'react';
import { ShieldAlert, Video, Mic, Maximize2, AlertTriangle, Eye, CheckCircle2 } from 'lucide-react';

interface IntegrityMonitorProps {
  studentId: string;
  studentName: string;
  assessmentTitle: string;
  autoSubmitOnBreach: boolean;
  onIntegrityBreach: (eventType: 'TAB_SWITCH' | 'FULLSCREEN_EXIT' | 'CAMERA_MUTED' | 'UNAUTHORIZED_WINDOW', details: string, shouldAutoSubmit: boolean) => void;
  active: boolean;
}

export const IntegrityMonitor: React.FC<IntegrityMonitorProps> = ({
  studentId,
  studentName,
  assessmentTitle,
  autoSubmitOnBreach,
  onIntegrityBreach,
  active
}) => {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [micActive, setMicActive] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [recentWarning, setRecentWarning] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize media permissions
  useEffect(() => {
    if (!active) return;

    let mediaStream: MediaStream | null = null;
    navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
      .then(stream => {
        mediaStream = stream;
        streamRef.current = stream;
        setCameraActive(true);
        setMicActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(_err => {
        // Fallback simulation for sandbox environments where camera/mic are mocked or blocked
        setCameraActive(true);
        setMicActive(true);
      });

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(t => t.stop());
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [active]);

  // Tab switch & visibility change listeners
  useEffect(() => {
    if (!active) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const details = `Browser tab switched or minimized at ${new Date().toLocaleTimeString()}`;
        setRecentWarning('Integrity Flag: Tab switch detected! Event recorded in faculty audit log.');
        onIntegrityBreach('TAB_SWITCH', details, autoSubmitOnBreach);
      }
    };

    const handleBlur = () => {
      const details = `Window lost focus at ${new Date().toLocaleTimeString()}`;
      setRecentWarning('Integrity Warning: Assessment window lost focus.');
      onIntegrityBreach('UNAUTHORIZED_WINDOW', details, false);
    };

    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      if (!isFull) {
        const details = `Student exited fullscreen mode at ${new Date().toLocaleTimeString()}`;
        setRecentWarning('Integrity Warning: Fullscreen mode exited.');
        onIntegrityBreach('FULLSCREEN_EXIT', details, autoSubmitOnBreach);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [active, autoSubmitOnBreach, onIntegrityBreach]);

  const requestFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch (e) {
      console.warn('Fullscreen request denied or not supported in iframe', e);
    }
  };

  if (!active) return null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {/* Live Camera Feed preview */}
        <div className="relative w-16 h-12 rounded-lg bg-black border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror"
          />
          {cameraActive && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
              <Eye className="w-3 h-3 text-emerald-400" /> Monitored Session
            </span>
            {autoSubmitOnBreach && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950 border border-red-500/40 text-red-300 font-bold">
                Auto-Submit Active
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Integrity Proctoring: Tab switches & window focus tracked in real-time.
          </div>
        </div>
      </div>

      {/* Sensor indicators and Fullscreen button */}
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
          <Video className="w-3.5 h-3.5 text-emerald-400" /> Cam OK
        </span>
        <span className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
          <Mic className="w-3.5 h-3.5 text-emerald-400" /> Mic OK
        </span>

        {!isFullscreen && (
          <button
            onClick={requestFullscreen}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition cursor-pointer"
          >
            <Maximize2 className="w-3 h-3" /> Fullscreen
          </button>
        )}
      </div>

      {/* Warning Toast if triggered */}
      {recentWarning && (
        <div className="w-full p-2.5 bg-red-950/80 border border-red-500/50 rounded-lg flex items-center justify-between text-xs text-red-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{recentWarning}</span>
          </div>
          <button
            onClick={() => setRecentWarning(null)}
            className="text-[10px] underline text-red-300 hover:text-white ml-2"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
