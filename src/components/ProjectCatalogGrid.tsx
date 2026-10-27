import React, { useState, useMemo } from 'react';
import { 
  Ship, 
  FileDown, 
  Search, 
  ArrowRight, 
  Cpu, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Layers,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { MaritimeProject } from '../types/maritime';
import { generateSingleProjectPDF } from '../utils/pdfGenerator';

interface ProjectCatalogGridProps {
  projects: MaritimeProject[];
  onSelectProjectForDiscussion: (project: MaritimeProject) => void;
  onOpenDetailModal: (project: MaritimeProject) => void;
}

export const ProjectCatalogGrid: React.FC<ProjectCatalogGridProps> = ({
  projects,
  onSelectProjectForDiscussion,
  onOpenDetailModal
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(projects.map(p => p.category)));
    return ['All', ...cats];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchCat = filterCategory === 'All' || p.category === filterCategory;
      const term = searchTerm.toLowerCase();
      const matchSearch = !term || 
        p.name.toLowerCase().includes(term) ||
        p.code.toLowerCase().includes(term) ||
        p.imoNumber.toLowerCase().includes(term) ||
        p.shipyard.toLowerCase().includes(term) ||
        p.keywords.some(k => k.toLowerCase().includes(term));
      return matchCat && matchSearch;
    });
  }, [projects, filterCategory, searchTerm]);

  const formatUSD = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Search Controls */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects by vessel name, shipyard, IMO, or spec..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap ${
                filterCategory === cat
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 10 Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((project, idx) => (
          <div
            key={project.id}
            className="bg-slate-900/80 border border-slate-800 hover:border-cyan-800/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all group"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {project.code}
                </span>
                <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {project.progressPercent}% Build
                </span>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                {project.name}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-1 mb-3">
                {project.vesselType}
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mb-3">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${project.progressPercent}%` }}
                />
              </div>

              {/* Key Specs Pills */}
              <div className="space-y-1.5 text-xs text-slate-300 mb-4 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
                <div className="flex justify-between">
                  <span className="text-slate-500">IMO Number:</span>
                  <span className="font-mono text-cyan-400">{project.imoNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contract Value:</span>
                  <span className="font-bold text-white">{formatUSD(project.contractValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Shipyard:</span>
                  <span className="text-slate-200 truncate max-w-[160px]">{project.shipyard}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Expo Booth:</span>
                  <span className="text-amber-400 font-semibold">{project.expoBoothNumber.split('(')[0]}</span>
                </div>
              </div>

              {/* Ingested Chat preview */}
              <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mb-4">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>{project.chatSources.length} WhatsApp updates indexed</span>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => onSelectProjectForDiscussion(project)}
                className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-semibold transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Discuss in RAG</span>
              </button>

              <button
                onClick={() => generateSingleProjectPDF(project)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
                title="Convert this project to PDF dossier"
              >
                <FileDown className="w-4 h-4 text-rose-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
