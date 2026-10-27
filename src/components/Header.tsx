import React from 'react';
import { 
  Anchor, 
  Search, 
  FileDown, 
  FileText, 
  PlusCircle, 
  Cpu, 
  Ship, 
  Database,
  Radio,
  Mic,
  Bot,
  LogIn,
  LogOut,
  UserCheck,
  ShieldCheck
} from 'lucide-react';
import { MaritimeProject } from '../types/maritime';
import { generateExpoCatalogPDF } from '../utils/pdfGenerator';
import { exportProjectsToCSV, exportProjectsToJSON } from '../utils/ragPipeline';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut as fbSignOut, User } from 'firebase/auth';

interface HeaderProps {
  activeTab: 'discuss' | 'voice' | 'transcribe' | 'catalog' | 'ingest' | 'booths';
  setActiveTab: (tab: 'discuss' | 'voice' | 'transcribe' | 'catalog' | 'ingest' | 'booths') => void;
  projects: MaritimeProject[];
  currentUser: User | null;
  onOpenIngest: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  projects,
  currentUser,
  onOpenIngest
}) => {
  const totalBudget = projects.reduce((sum, p) => sum + p.contractValue, 0);
  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(totalBudget);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.warn('Google sign-in popup notice:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await fbSignOut(auth);
    } catch (err) {
      console.warn('Sign out notice:', err);
    }
  };

  const handleDownloadAllPDF = () => {
    generateExpoCatalogPDF(projects);
  };

  const handleDownloadCSV = () => {
    const csvContent = exportProjectsToCSV(projects);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Maritex_Expo_10_Projects_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <header className="border-b border-cyan-900/40 bg-slate-950/85 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar with Branding, Auth and Global Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3 gap-3 border-b border-slate-800/60">
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Anchor className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight text-white font-mono">
                  MARITEX <span className="text-cyan-400">RAG</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  Expo Intelligence
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Maritime Project Extraction, RAG Pipeline & Live Voice Feeds
              </p>
            </div>
          </div>

          {/* User Auth & Actions */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            {/* Firestore Status */}
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">Firestore:</span>
              <span className="font-semibold text-emerald-300">Persisted</span>
            </div>

            {/* Google Sign In / User Profile */}
            {currentUser ? (
              <div className="flex items-center space-x-2 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="User" className="w-6 h-6 rounded-full border border-cyan-400" />
                ) : (
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                )}
                <span className="text-xs font-semibold text-white max-w-[100px] truncate">
                  {currentUser.displayName || currentUser.email?.split('@')[0]}
                </span>
                <button
                  onClick={handleSignOut}
                  className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold transition-all cursor-pointer shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                <span>Google Sign-In</span>
              </button>
            )}

            {/* Ingestion & Downloads */}
            <button
              onClick={onOpenIngest}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Ingest Chat</span>
            </button>

            <button
              onClick={handleDownloadAllPDF}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
              title="Download entire 10-project portfolio as PDF"
            >
              <FileDown className="w-3.5 h-3.5 text-rose-400" />
              <span>PDF</span>
            </button>

            <button
              onClick={handleDownloadCSV}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
              title="Export to CSV"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 py-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('discuss')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'discuss'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Search className="w-4 h-4 text-cyan-400" />
            <span>Project Discussion & RAG</span>
          </button>

          <button
            onClick={() => setActiveTab('voice')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'voice'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Bot className="w-4 h-4 text-emerald-400" />
            <span>Voice Conversations (Gemini Live)</span>
          </button>

          <button
            onClick={() => setActiveTab('transcribe')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'transcribe'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Mic className="w-4 h-4 text-amber-400" />
            <span>Live Audio Transcriber</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Ship className="w-4 h-4 text-blue-400" />
            <span>All 10 Projects</span>
          </button>

          <button
            onClick={() => setActiveTab('ingest')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'ingest'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>Data Ingestion</span>
          </button>

          <button
            onClick={() => setActiveTab('booths')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'booths'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Anchor className="w-4 h-4 text-rose-400" />
            <span>Expo Floor & Contacts</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
