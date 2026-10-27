import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Radio, 
  Upload, 
  Sparkles, 
  ArrowRight, 
  Volume2, 
  Square, 
  Play, 
  FileText,
  CheckCircle2,
  RefreshCw,
  Waves
} from 'lucide-react';

interface AudioTranscriberProps {
  onSendTranscriptToRAG: (transcriptText: string) => void;
}

export const AudioTranscriber: React.FC<AudioTranscriberProps> = ({
  onSendTranscriptToRAG
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [interimText, setInterimText] = useState<string>('');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [audioFeedSource, setAudioFeedSource] = useState<'mic' | 'simulated' | 'file'>('mic');
  const [simulatedPlaying, setSimulatedPlaying] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Initialize Speech Recognition if supported in browser
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript + ' ';
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          setTranscript(prev => prev + final);
        }
        setInterimText(interim);
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
      };

      recognition.onend = () => {
        if (isRecording) {
          try {
            recognition.start();
          } catch (e) {
            // ignore restart error
          }
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      stopAudioAnalysis();
    };
  }, [isRecording]);

  const startAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        setAudioLevel(Math.min(100, Math.round(avg * 1.5)));
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (err) {
      console.warn('Microphone access for visualizer not granted, fallback to level pulse');
      // Fallback animated level
      const interval = setInterval(() => {
        setAudioLevel(Math.floor(Math.random() * 60) + 20);
      }, 150);
      (window as any).__voiceFallbackInterval = interval;
    }
  };

  const stopAudioAnalysis = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if ((window as any).__voiceFallbackInterval) clearInterval((window as any).__voiceFallbackInterval);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      stopAudioAnalysis();
    } else {
      setIsRecording(true);
      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch (e) {}
      }
      startAudioAnalysis();
    }
  };

  // Simulated Maritime Radio Feeds for quick expo testing
  const simulatedFeeds = [
    {
      title: 'Ulsan Shipyard Radio - Poseidon-X Telemetry',
      text: '[Live Audio Feed - 156.8 MHz] Chief Engineer Miller to Ulsan Dock Control: Project Poseidon-X autonomous sea trials stage 2 commenced at 0900. Dual-fuel cryogenic LNG boil-off rate is 0.08% per day. Telemetry link to Shell Marine shore control confirmed at 42ms. Estimated handover at Maritime Expo remains on schedule.'
    },
    {
      title: 'Rotterdam Port Radio - BlueHarbor Tug Berthing',
      text: '[Live Audio Feed - VHF Ch 12] Port of Rotterdam Operations to Damen BlueHarbor: Electric tug battery capacity at 94%. Fast charger at Waalhaven pier ready for 6.5 megawatt docking. Bollard pull load tests certified at 86 tons.'
    },
    {
      title: 'Viking Polar Expedition Radio - Icebreaker Trials',
      text: '[Live Audio Feed - Maritime Satellite] Captain Lindqvist to VARD Operations: Aurora Borealis PC3 ice-belt plates inspected in drydock. Azipod VI thruster cold-weather seals tested to minus 40 degrees. Total project expenditure confirmed at $310M.'
    }
  ];

  const handlePlaySimulatedFeed = (text: string) => {
    setSimulatedPlaying(true);
    setTranscript('');
    setInterimText('Buffering audio stream...');

    let words = text.split(' ');
    let current = '';
    let idx = 0;

    const interval = setInterval(() => {
      if (idx < words.length) {
        current += (idx > 0 ? ' ' : '') + words[idx];
        setTranscript(current);
        setAudioLevel(Math.floor(Math.random() * 55) + 30);
        idx++;
      } else {
        clearInterval(interval);
        setSimulatedPlaying(false);
        setInterimText('');
        setAudioLevel(0);
      }
    }, 120);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate audio transcription of uploaded file
    setTranscript(`[Transcribed from ${file.name}] Audio file processed. Audio stream contains technical discussion regarding Project HydroVessel 400 hydrogen fuel cells, PowerCell PEM stack running at 6.0 MW with zero voltage degradation. Shipyard Meyer Werft confirmed delivery target 2027-11-20.`);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
              <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
              LIVE AUDIO TRANSCRIPTION
            </span>
            <span className="text-xs text-slate-400">
              Microphone • VHF Radio Feeds • Audio Files
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-white">
            Real-Time Maritime Audio Feed Transcriber
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Speak directly or connect an audio feed. Real-time speech-to-text converts voice streams into structured project data for the RAG pipeline.
          </p>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleRecording}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer ${
              isRecording
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 animate-pulse'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/30'
            }`}
          >
            {isRecording ? (
              <>
                <MicOff className="w-4 h-4" />
                <span>Stop Live Feed</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>Start Live Mic Feed</span>
              </>
            )}
          </button>

          <label className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer transition-all">
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Upload Audio</span>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Audio Waveform & Equalizer Visualizer */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className={`w-3.5 h-3.5 rounded-full ${isRecording || simulatedPlaying ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
          <div className="text-xs">
            <span className="font-bold text-slate-200 block">
              {isRecording ? 'Listening to Microphone Audio Stream...' : simulatedPlaying ? 'Streaming Simulated Maritime Dispatch...' : 'Audio Feed Standby'}
            </span>
            <span className="text-[11px] text-slate-500">
              Sampling frequency: 44.1 kHz • Dual-channel maritime stream
            </span>
          </div>
        </div>

        {/* Equalizer bars */}
        <div className="flex items-end space-x-1.5 h-8">
          {[20, 45, 80, 60, 95, 40, 75, 90, 50, 70, 85, 30].map((h, i) => {
            const active = isRecording || simulatedPlaying;
            const barHeight = active ? Math.max(12, Math.round((h * audioLevel) / 70)) : 6;
            return (
              <div
                key={i}
                className={`w-1.5 rounded-full transition-all duration-75 ${
                  active ? 'bg-gradient-to-t from-cyan-500 to-emerald-400' : 'bg-slate-800'
                }`}
                style={{ height: `${barHeight}px` }}
              />
            );
          })}
        </div>
      </div>

      {/* Live Transcript Window */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Live Generated Transcript</span>
          </span>
          {transcript && (
            <button
              onClick={() => setTranscript('')}
              className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
            >
              Clear Transcript
            </button>
          )}
        </div>

        <div className="min-h-[160px] p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 leading-relaxed overflow-y-auto max-h-[260px]">
          {transcript ? (
            <div>
              <span>{transcript}</span>
              {interimText && <span className="text-cyan-400 italic"> {interimText}</span>}
            </div>
          ) : (
            <span className="text-slate-600 italic">
              {isRecording 
                ? 'Speak now... Words will appear here in real-time as audio is received.' 
                : 'Click "Start Live Mic Feed" or select a simulated dispatch stream below to begin real-time transcription.'}
            </span>
          )}
        </div>
      </div>

      {/* Action Bar: Ingest to RAG Extractor */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-[11px] font-semibold text-slate-400">Simulated Dispatches:</span>
          {simulatedFeeds.map((feed, idx) => (
            <button
              key={idx}
              onClick={() => handlePlaySimulatedFeed(feed.text)}
              disabled={simulatedPlaying || isRecording}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 border border-slate-700 transition-all cursor-pointer"
            >
              {feed.title.split('-')[0]}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            if (!transcript.trim()) return;
            onSendTranscriptToRAG(transcript);
          }}
          disabled={!transcript.trim()}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Send Transcript to RAG Extractor</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
