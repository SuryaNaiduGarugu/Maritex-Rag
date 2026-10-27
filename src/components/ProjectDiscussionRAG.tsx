import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  Ship, 
  FileDown, 
  FileText, 
  ExternalLink, 
  MessageSquare, 
  Cpu, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Send, 
  RefreshCw,
  Layers,
  ShieldAlert,
  ArrowRight,
  Filter,
  X,
  Calendar,
  Database
} from 'lucide-react';
import { MaritimeProject, RAGSearchResult } from '../types/maritime';
import { searchProjectsRAG, generateRAGAnswer, exportProjectsToJSON } from '../utils/ragPipeline';
import { generateSingleProjectPDF } from '../utils/pdfGenerator';
import { AdvancedSearchModal, AdvancedSearchFilters } from './AdvancedSearchModal';

interface ProjectDiscussionRAGProps {
  projects: MaritimeProject[];
  selectedProject: MaritimeProject;
  onSelectProject: (project: MaritimeProject) => void;
  onOpenDetailModal: (project: MaritimeProject) => void;
  onOpenVoiceConsole?: () => void;
}

export const ProjectDiscussionRAG: React.FC<ProjectDiscussionRAGProps> = ({
  projects,
  selectedProject,
  onSelectProject,
  onOpenDetailModal,
  onOpenVoiceConsole
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [chatInput, setChatInput] = useState<string>('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedSearchFilters>({
    projectName: '',
    startDate: '',
    endDate: '',
    dateField: 'lastUpdated',
    selectedKeywords: [],
    dataSource: 'All',
    category: 'All'
  });

  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string; sources?: any[] }>>([
    {
      role: 'assistant',
      text: `Hello! I am your **Maritex RAG Intelligence Engine**. You are currently focusing on **${selectedProject.name}** (${selectedProject.vesselType}). You can type similar keywords or ask questions about shipyard status, WhatsApp communication updates, engine specs, budgets, or milestones.`,
      sources: []
    }
  ]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Suggested keywords tailored to the current selected project & maritime tech
  const suggestedKeywords = useMemo(() => {
    const list = [...selectedProject.keywords.slice(0, 5)];
    if (selectedProject.imoNumber) list.push(selectedProject.imoNumber);
    if (selectedProject.shipyard) list.push(selectedProject.shipyard.split(' ')[0]);
    list.push('budget', 'sea trials', 'propulsion');
    return Array.from(new Set(list));
  }, [selectedProject]);

  // Execute RAG Search based on keywords input & advanced filters
  const ragSearchResults: RAGSearchResult[] = useMemo(() => {
    return searchProjectsRAG(searchQuery, projects, {
      targetProjectId: selectedProject.id,
      projectName: advancedFilters.projectName,
      categoryFilter: advancedFilters.category,
      startDate: advancedFilters.startDate,
      endDate: advancedFilters.endDate,
      dateField: advancedFilters.dateField,
      selectedKeywords: advancedFilters.selectedKeywords,
      dataSource: advancedFilters.dataSource
    });
  }, [searchQuery, projects, selectedProject.id, advancedFilters]);

  // Count active advanced filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (advancedFilters.projectName) count++;
    if (advancedFilters.startDate || advancedFilters.endDate) count++;
    if (advancedFilters.dataSource !== 'All') count++;
    if (advancedFilters.category !== 'All') count++;
    if (advancedFilters.selectedKeywords.length > 0) count += advancedFilters.selectedKeywords.length;
    return count;
  }, [advancedFilters]);

  // Top extracted project matching current query or default to selectedProject
  const displayedProject = useMemo(() => {
    if ((searchQuery.trim() || activeFilterCount > 0) && ragSearchResults.length > 0) {
      return ragSearchResults[0].project;
    }
    return selectedProject;
  }, [searchQuery, ragSearchResults, selectedProject, activeFilterCount]);

  const handleKeywordClick = (kw: string) => {
    setSearchQuery(kw);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setAdvancedFilters({
      projectName: '',
      startDate: '',
      endDate: '',
      dateField: 'lastUpdated',
      selectedKeywords: [],
      dataSource: 'All',
      category: 'All'
    });
  };

  const handleAskQuestion = async (questionText?: string) => {
    const queryToAsk = questionText || chatInput;
    if (!queryToAsk.trim() || isProcessing) return;

    const userMsg = queryToAsk.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsProcessing(true);

    try {
      // 1. Perform RAG retrieval
      const results = searchProjectsRAG(userMsg, projects, {
        targetProjectId: displayedProject.id
      });

      // 2. Attempt backend server endpoint with Gemini
      let answer = '';
      let sources: any[] = [];

      try {
        const response = await fetch('/api/rag-query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: userMsg,
            retrievedContext: results.slice(0, 3).map(r => ({
              project: r.project.name,
              vesselType: r.project.vesselType,
              imo: r.project.imoNumber,
              budget: r.project.contractValue,
              snippets: r.matchedSnippets
            })),
            selectedProject: displayedProject
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.answer) {
            answer = data.answer;
          }
        }
      } catch (err) {
        console.info('Client RAG fallback in progress');
      }

      // If backend didn't answer with Gemini, use client-side deterministic RAG engine
      if (!answer) {
        const localRag = generateRAGAnswer(userMsg, results, displayedProject);
        answer = localRag.answer;
        sources = localRag.sources;
      }

      setChatHistory(prev => [
        ...prev,
        {
          role: 'assistant',
          text: answer,
          sources
        }
      ]);
    } catch (error) {
      setChatHistory(prev => [
        ...prev,
        {
          role: 'assistant',
          text: 'An error occurred while querying the RAG pipeline. Please try rephrasing your keywords.'
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPDF = () => {
    generateSingleProjectPDF(displayedProject);
  };

  const handleDownloadJSON = () => {
    const jsonStr = exportProjectsToJSON([displayedProject]);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${displayedProject.code}_RAG_Data.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatUSD = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: 10-PROJECT SELECTOR CAROUSEL */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Select Initial Project To Discuss (10 Maritime Projects Indexed)
            </h2>
          </div>
          <span className="text-xs text-cyan-400 font-mono">
            Active: <strong className="text-white">{selectedProject.name}</strong>
          </span>
        </div>

        {/* 10 Project Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {projects.map((proj, idx) => {
            const isSelected = proj.id === selectedProject.id;
            return (
              <button
                key={proj.id}
                onClick={() => {
                  onSelectProject(proj);
                  setSearchQuery('');
                }}
                className={`flex flex-col p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/80 border-cyan-500/80 shadow-md shadow-cyan-900/40 ring-1 ring-cyan-400'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-cyan-900 text-cyan-200' : 'bg-slate-800 text-slate-400'
                  }`}>
                    #{idx + 1} {proj.code}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    {proj.progressPercent}%
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-200 truncate w-full">
                  {proj.name}
                </span>
                <span className="text-[10px] text-slate-400 truncate w-full">
                  {proj.category}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: KEYWORD & ADVANCED RAG SEARCH BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/50 border border-cyan-900/50 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Type Similar Keywords & Search RAG Pipeline</span>
            </h3>
            <p className="text-xs text-slate-400">
              Extracts matching vessel specs, shipyard records, WhatsApp discussions, and IMO data.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                activeFilterCount > 0
                  ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Advanced Filters</span>
              {activeFilterCount > 0 && (
                <span className="ml-1 w-4 h-4 rounded-full bg-white text-slate-950 text-[10px] font-extrabold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {(searchQuery || activeFilterCount > 0) && (
              <button
                onClick={handleClearSearch}
                className="text-xs text-slate-400 hover:text-cyan-300 underline cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Input Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type similar keywords (e.g. 'LNG', 'autonomous', 'wingd', 'bollard pull', 'Damen', 'hydrogen', 'icebreaker', 'IMO 9874102')..."
            className="w-full pl-11 pr-28 py-3.5 bg-slate-950/90 border border-cyan-800/60 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent font-medium shadow-inner"
          />
          <Search className="w-5 h-5 text-cyan-400 absolute left-3.5 top-3.5" />
          
          <div className="absolute right-2 top-2 flex items-center">
            <span className="text-[11px] font-mono px-2 py-1 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-md">
              {ragSearchResults.length} Matches
            </span>
          </div>
        </div>

        {/* Active Filters Pill Bar */}
        {activeFilterCount > 0 && (
          <div className="mt-2.5 flex items-center flex-wrap gap-1.5 text-xs">
            <span className="text-[11px] text-slate-400 font-semibold">Active:</span>
            {advancedFilters.projectName && (
              <span className="px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
                Project: {advancedFilters.projectName}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setAdvancedFilters(prev => ({ ...prev, projectName: '' }))} />
              </span>
            )}
            {(advancedFilters.startDate || advancedFilters.endDate) && (
              <span className="px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
                Date: {advancedFilters.startDate || 'start'} to {advancedFilters.endDate || 'now'}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setAdvancedFilters(prev => ({ ...prev, startDate: '', endDate: '' }))} />
              </span>
            )}
            {advancedFilters.dataSource !== 'All' && (
              <span className="px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
                Source: {advancedFilters.dataSource}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setAdvancedFilters(prev => ({ ...prev, dataSource: 'All' }))} />
              </span>
            )}
            {advancedFilters.selectedKeywords.map(kw => (
              <span key={kw} className="px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
                #{kw}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setAdvancedFilters(prev => ({ ...prev, selectedKeywords: prev.selectedKeywords.filter(k => k !== kw) }))} />
              </span>
            ))}
          </div>
        )}

        {/* Similar Keywords Chips */}
        <div className="mt-3 flex items-center flex-wrap gap-1.5">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Similar Keywords:
          </span>
          {suggestedKeywords.map(kw => (
            <button
              key={kw}
              onClick={() => handleKeywordClick(kw)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                searchQuery.toLowerCase().includes(kw.toLowerCase())
                  ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                  : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 border-slate-700/80 hover:border-cyan-700'
              }`}
            >
              +{kw}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 3: 2-COLUMN DISPLAY (EXTRACTED PROJECT DETAILS + INTERACTIVE RAG DISCUSSION) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: EXTRACTED PROJECT DOSSIER (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative">
            {/* Header with Title & Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {displayedProject.code}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {displayedProject.category}
                  </span>
                  <span className="text-xs font-mono text-cyan-400">
                    {displayedProject.imoNumber}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-white tracking-tight">
                  {displayedProject.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {displayedProject.vesselType}
                </p>
              </div>

              {/* Action Buttons: PDF, JSON, Modal */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
                  title="Export this project directly to PDF"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Convert to PDF</span>
                </button>

                <button
                  onClick={handleDownloadJSON}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
                  title="Download JSON data"
                >
                  <FileText className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onOpenDetailModal(displayedProject)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
                  title="View full specs & engineering audit"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Metric Highlights Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Contract Budget</span>
                <span className="text-sm font-bold text-white block mt-0.5">{formatUSD(displayedProject.contractValue)}</span>
                <span className="text-[10px] text-slate-500 truncate block">{displayedProject.client}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Shipyard Handover</span>
                <span className="text-sm font-bold text-white block mt-0.5">{displayedProject.deliveryDate}</span>
                <span className="text-[10px] text-slate-500 truncate block">{displayedProject.shipyard}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Build Status</span>
                <span className="text-sm font-bold text-emerald-400 block mt-0.5">{displayedProject.progressPercent}% Complete</span>
                <span className="text-[10px] text-slate-500 truncate block">{displayedProject.status}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Expo Booth</span>
                <span className="text-sm font-bold text-amber-400 block mt-0.5">{displayedProject.expoBoothNumber.split('(')[0]}</span>
                <span className="text-[10px] text-slate-500 truncate block">Official Pavilion</span>
              </div>
            </div>

            {/* Summary */}
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 mb-4">
              {displayedProject.summary}
            </p>

            {/* Technical Specs Grid */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                <span>Extracted Vessel Specifications</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Length Overall</span>
                  <span className="font-semibold text-slate-200">{displayedProject.technicalSpecs.lengthOverall}</span>
                </div>
                <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Beam / Draft</span>
                  <span className="font-semibold text-slate-200">{displayedProject.technicalSpecs.beam} / {displayedProject.technicalSpecs.draft}</span>
                </div>
                <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Propulsion</span>
                  <span className="font-semibold text-slate-200 truncate block" title={displayedProject.technicalSpecs.propulsion}>
                    {displayedProject.technicalSpecs.propulsion}
                  </span>
                </div>
                <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Fuel System</span>
                  <span className="font-semibold text-slate-200 truncate block" title={displayedProject.technicalSpecs.fuelType}>
                    {displayedProject.technicalSpecs.fuelType}
                  </span>
                </div>
                <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Cruising Speed</span>
                  <span className="font-semibold text-slate-200">{displayedProject.technicalSpecs.speedKnots}</span>
                </div>
                <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Autonomy Level</span>
                  <span className="font-semibold text-slate-200 truncate block" title={displayedProject.technicalSpecs.autonomyLevel}>
                    {displayedProject.technicalSpecs.autonomyLevel}
                  </span>
                </div>
                <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800 col-span-2">
                  <span className="text-[10px] text-slate-400 block">Deadweight Capacity</span>
                  <span className="font-semibold text-slate-200">{displayedProject.technicalSpecs.deadweight}</span>
                </div>
              </div>
            </div>

            {/* Ingested WhatsApp Communications Extract */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ingested WhatsApp & Chat Sources (RAG Audited)</span>
                </h4>
                <span className="text-[10px] text-slate-400">
                  {displayedProject.chatSources.length} messages parsed
                </span>
              </div>

              <div className="space-y-2">
                {displayedProject.chatSources.map(chat => (
                  <div 
                    key={chat.id}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                        <span className="font-bold text-slate-300">{chat.sender}</span>
                        <span className="text-slate-500 font-mono">({chat.source})</span>
                      </div>
                      <span className="text-slate-500 font-mono text-[10px]">{chat.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-200 italic">
                      "{chat.message}"
                    </p>
                    {chat.extractedAttributes && chat.extractedAttributes.length > 0 && (
                      <div className="mt-1.5 flex items-center flex-wrap gap-1">
                        <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Extracted:</span>
                        {chat.extractedAttributes.map((attr, idx) => (
                          <span key={idx} className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/50">
                            {attr}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE RAG DISCUSSION & QUERY CONSOLE (5 COLS) */}
        <div className="lg:col-span-5 flex flex-col h-[740px] bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  RAG Pipeline Discussion Console
                </h3>
                <p className="text-[10px] text-slate-400">
                  Contextual RAG querying with cited WhatsApp sources
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setChatHistory([
                  {
                    role: 'assistant',
                    text: `Discussion cleared. You are discussing **${displayedProject.name}**. Ask any question or query technical metrics.`,
                    sources: []
                  }
                ]);
              }}
              className="text-[11px] text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
              title="Reset conversation"
            >
              Reset
            </button>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans">
            {chatHistory.map((msg, idx) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[92%] rounded-2xl p-3 text-xs leading-relaxed ${
                      isAssistant
                        ? 'bg-slate-950 border border-slate-800 text-slate-200 shadow-md'
                        : 'bg-cyan-600 text-white font-medium shadow-md shadow-cyan-600/20'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">
                      {msg.text}
                    </div>

                    {/* Sources citations */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1">
                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                          Retrieved RAG Sources:
                        </span>
                        {msg.sources.map((src, sIdx) => (
                          <div key={sIdx} className="text-[10px] text-slate-400 bg-slate-900/60 p-1.5 rounded border border-slate-800">
                            <span className="text-slate-300 font-semibold">{src.projectName}</span> • {src.field}: "{src.snippet}"
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isProcessing && (
              <div className="flex items-center space-x-2 text-xs text-cyan-400 p-2 bg-slate-950/60 rounded-xl border border-slate-800 w-fit">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>RAG pipeline querying vector index & generating response...</span>
              </div>
            )}
          </div>

          {/* Quick Prompt Starters */}
          <div className="p-2 bg-slate-950/40 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => handleAskQuestion(`What are the technical specs and propulsion of ${displayedProject.name}?`)}
              className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap cursor-pointer"
            >
              Engine Specs
            </button>
            <button
              onClick={() => handleAskQuestion(`Show me WhatsApp updates and chat messages for ${displayedProject.name}`)}
              className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap cursor-pointer"
            >
              WhatsApp Logs
            </button>
            <button
              onClick={() => handleAskQuestion(`What is the confirmed budget and shipyard for ${displayedProject.name}?`)}
              className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap cursor-pointer"
            >
              Budget & Shipyard
            </button>
            <button
              onClick={() => handleAskQuestion(`What are the delivery date and milestones for ${displayedProject.name}?`)}
              className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap cursor-pointer"
            >
              Milestones
            </button>
          </div>

          {/* Chat Input Box */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
              placeholder={`Ask anything about ${displayedProject.name} or type keywords...`}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
            <button
              onClick={() => handleAskQuestion()}
              disabled={!chatInput.trim() || isProcessing}
              className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white transition-all cursor-pointer shadow-md shadow-cyan-600/20"
              title="Submit question to RAG pipeline"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Advanced Search Filter Modal */}
      <AdvancedSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        projects={projects}
        currentFilters={advancedFilters}
        onApplyFilters={setAdvancedFilters}
        onResetFilters={() => {
          setAdvancedFilters({
            projectName: '',
            startDate: '',
            endDate: '',
            dateField: 'lastUpdated',
            selectedKeywords: [],
            dataSource: 'All',
            category: 'All'
          });
        }}
      />
    </div>
  );
};
