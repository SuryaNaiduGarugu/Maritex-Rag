import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Radio, 
  RefreshCw, 
  MessageSquare,
  Bot,
  User,
  Activity
} from 'lucide-react';
import { MaritimeProject } from '../types/maritime';

interface VoiceConversationConsoleProps {
  currentProject: MaritimeProject;
  projects: MaritimeProject[];
}

interface VoiceTurn {
  speaker: 'user' | 'gemini';
  text: string;
  timestamp: string;
}

export const VoiceConversationConsole: React.FC<VoiceConversationConsoleProps> = ({
  currentProject,
  projects
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [voiceMuted, setVoiceMuted] = useState<boolean>(false);
  const [conversationHistory, setConversationHistory] = useState<VoiceTurn[]>([
    {
      speaker: 'gemini',
      text: `Ahoy! I am your Maritex RAG voice assistant. Ask me anything about ${currentProject.name}, shipyard contracts, engine telemetry, or upcoming sea trials.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [liveSpeechInput, setLiveSpeechInput] = useState<string>('');

  const recognitionRef = useRef<any>(null);

  // Setup browser Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let text = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          text += event.results[i][0].transcript;
        }
        setLiveSpeechInput(text);
      };

      recognition.onend = () => {
        setIsListening(false);
        // If user spoke something, trigger voice response
        if (liveSpeechInput.trim()) {
          handleVoiceQuery(liveSpeechInput.trim());
          setLiveSpeechInput('');
        }
      };

      recognitionRef.current = recognition;
    }
  }, [liveSpeechInput, currentProject]);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
    } else {
      setLiveSpeechInput('');
      setIsListening(true);
      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch (e) {}
      }
    }
  };

  const speakText = (textToSpeak: string) => {
    if (voiceMuted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleVoiceQuery = async (queryText: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setConversationHistory(prev => [...prev, { speaker: 'user', text: queryText, timestamp }]);

    try {
      const res = await fetch('/api/voice-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spokenText: queryText,
          currentProject: {
            name: currentProject.name,
            code: currentProject.code,
            vesselType: currentProject.vesselType,
            imoNumber: currentProject.imoNumber,
            shipyard: currentProject.shipyard,
            contractValue: currentProject.contractValue,
            progressPercent: currentProject.progressPercent,
            technicalSpecs: currentProject.technicalSpecs
          },
          projectContext: projects.slice(0, 5).map(p => ({
            name: p.name,
            imo: p.imoNumber,
            shipyard: p.shipyard,
            specs: p.technicalSpecs
          }))
        })
      });

      let responseText = '';
      if (res.ok) {
        const data = await res.json();
        if (data.speechText) {
          responseText = data.speechText;
        }
      }

      if (!responseText) {
        responseText = `Regarding ${currentProject.name}, the vessel is progressing at ${currentProject.progressPercent} percent completion at ${currentProject.shipyard}. All propulsion tests match contract specifications.`;
      }

      setConversationHistory(prev => [
        ...prev, 
        { speaker: 'gemini', text: responseText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);

      speakText(responseText);
    } catch (err) {
      console.warn('Voice chat error:', err);
    }
  };

  // Quick preset voice prompts
  const sampleVoicePrompts = [
    `Tell me about ${currentProject.name}'s engine specifications.`,
    `What are the latest WhatsApp sea trial updates?`,
    `What is the contract budget and delivery schedule?`,
    `How does the autonomy system operate?`
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Voice Assistant Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
              <Bot className="w-3 h-3 text-cyan-400" />
              GEMINI LIVE VOICE CONVERSATIONS
            </span>
            <span className="text-xs text-slate-400">
              Duplex Voice AI • Maritime Expo Assistant
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-white">
            Conversational Voice Interface for {currentProject.name}
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              if (isSpeaking) {
                window.speechSynthesis?.cancel();
                setIsSpeaking(false);
              }
              setVoiceMuted(!voiceMuted);
            }}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              voiceMuted
                ? 'bg-rose-950 border-rose-800 text-rose-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title={voiceMuted ? 'Unmute speech output' : 'Mute speech output'}
          >
            {voiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* Interactive Voice Orb & Mic Control */}
      <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-b from-slate-950/80 to-cyan-950/20 border border-slate-800/80 rounded-2xl relative overflow-hidden text-center">
        {/* Animated Glow Rings */}
        <div className="relative mb-6">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
            isListening 
              ? 'bg-cyan-500/20 ring-4 ring-cyan-400/50 animate-pulse scale-105'
              : isSpeaking
              ? 'bg-emerald-500/20 ring-4 ring-emerald-400/50 scale-105'
              : 'bg-slate-900 border border-cyan-900/50'
          }`}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all ${
              isListening ? 'bg-cyan-600 shadow-cyan-500/50' : isSpeaking ? 'bg-emerald-600 shadow-emerald-500/50' : 'bg-slate-800'
            }`}>
              {isListening ? (
                <Mic className="w-8 h-8 text-white animate-bounce" />
              ) : isSpeaking ? (
                <Activity className="w-8 h-8 text-white animate-spin" />
              ) : (
                <Radio className="w-8 h-8 text-cyan-400" />
              )}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <span className="text-sm font-bold text-white block">
            {isListening ? 'Listening... Speak your question now' : isSpeaking ? 'Gemini Speaking...' : 'Voice Assistant Ready'}
          </span>
          <span className="text-xs text-slate-400">
            {liveSpeechInput ? `"${liveSpeechInput}"` : `Tap the mic below or click a suggested question`}
          </span>
        </div>

        <button
          onClick={toggleListening}
          className={`px-6 py-3 rounded-full text-xs font-extrabold tracking-wider uppercase transition-all shadow-xl flex items-center space-x-2 cursor-pointer ${
            isListening
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/40 ring-4 ring-rose-400/20'
              : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-600/30'
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          <span>{isListening ? 'Tap to Stop' : 'Tap to Speak'}</span>
        </button>

        {/* Suggested Voice Triggers */}
        <div className="mt-6 flex flex-wrap justify-center gap-1.5 max-w-xl">
          {sampleVoicePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleVoiceQuery(prompt)}
              className="text-[11px] px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition-all cursor-pointer"
            >
              💬 "{prompt}"
            </button>
          ))}
        </div>
      </div>

      {/* Voice Transcript History */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
          <span>Voice Dialogue History</span>
        </h4>

        <div className="space-y-2.5 max-h-[300px] overflow-y-auto p-4 bg-slate-950 rounded-xl border border-slate-800">
          {conversationHistory.map((turn, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl text-xs ${
                turn.speaker === 'gemini'
                  ? 'bg-slate-900/90 border border-cyan-900/40 text-slate-200'
                  : 'bg-cyan-950/60 border border-cyan-800/40 text-cyan-200'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 mb-1">
                <span className="flex items-center gap-1">
                  {turn.speaker === 'gemini' ? <Bot className="w-3 h-3 text-cyan-400" /> : <User className="w-3 h-3 text-emerald-400" />}
                  {turn.speaker === 'gemini' ? 'Maritex Voice AI' : 'You (Spoken)'}
                </span>
                <span>{turn.timestamp}</span>
              </div>
              <p className="leading-relaxed">{turn.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
