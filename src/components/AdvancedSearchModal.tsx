import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Calendar, 
  Tag, 
  Database, 
  RotateCcw, 
  Filter,
  Check,
  Ship
} from 'lucide-react';
import { MaritimeProject } from '../types/maritime';

export interface AdvancedSearchFilters {
  projectName: string;
  startDate: string;
  endDate: string;
  dateField: 'lastUpdated' | 'deliveryDate';
  selectedKeywords: string[];
  dataSource: string;
  category: string;
}

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: MaritimeProject[];
  currentFilters: AdvancedSearchFilters;
  onApplyFilters: (filters: AdvancedSearchFilters) => void;
  onResetFilters: () => void;
}

export const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  isOpen,
  onClose,
  projects,
  currentFilters,
  onApplyFilters,
  onResetFilters
}) => {
  const [filters, setFilters] = useState<AdvancedSearchFilters>(currentFilters);

  if (!isOpen) return null;

  // Extract all unique keywords across projects
  const allKeywords = Array.from(
    new Set(projects.flatMap(p => p.keywords))
  ).slice(0, 24);

  // Extract all categories
  const allCategories = ['All', ...Array.from(new Set(projects.map(p => p.category)))];

  // Data sources available
  const dataSources = ['All', 'WhatsApp', 'Slack', 'Email', 'AudioTranscription', 'Document'];

  const toggleKeyword = (kw: string) => {
    setFilters(prev => {
      const exists = prev.selectedKeywords.includes(kw);
      return {
        ...prev,
        selectedKeywords: exists 
          ? prev.selectedKeywords.filter(k => k !== kw)
          : [...prev.selectedKeywords, kw]
      };
    });
  };

  const handleApplyPreset = (preset: 'last7' | 'last30' | '2026' | 'all') => {
    const today = new Date();
    if (preset === 'last7') {
      const past = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      setFilters(prev => ({
        ...prev,
        dateField: 'lastUpdated',
        startDate: past.toISOString().slice(0, 10),
        endDate: today.toISOString().slice(0, 10)
      }));
    } else if (preset === 'last30') {
      const past = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      setFilters(prev => ({
        ...prev,
        dateField: 'lastUpdated',
        startDate: past.toISOString().slice(0, 10),
        endDate: today.toISOString().slice(0, 10)
      }));
    } else if (preset === '2026') {
      setFilters(prev => ({
        ...prev,
        dateField: 'deliveryDate',
        startDate: '2026-01-01',
        endDate: '2026-12-31'
      }));
    } else if (preset === 'all') {
      setFilters(prev => ({
        ...prev,
        startDate: '',
        endDate: ''
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-extrabold text-white">
                Advanced RAG Pipeline Filters
              </h3>
              <p className="text-xs text-slate-400">
                Filter by project name, modification / delivery dates, keywords & original chat sources
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Filter Form */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* 1. Project Name */}
          <div>
            <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Ship className="w-3.5 h-3.5 text-cyan-400" />
              <span>Target Project Name</span>
            </label>
            <select
              value={filters.projectName}
              onChange={e => setFilters(prev => ({ ...prev, projectName: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-medium focus:ring-1 focus:ring-cyan-400"
            >
              <option value="">All Projects (Search Across Entire Expo Portfolio)</option>
              {projects.map(p => (
                <option key={p.id} value={p.name}>
                  {p.name} ({p.code}) — {p.vesselType}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Date Range & Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Date Range & Presets</span>
              </label>

              {/* Presets */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleApplyPreset('last7')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                >
                  Last 7 Days
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('last30')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                >
                  Last 30 Days
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('2026')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                >
                  2026 Deliveries
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Filter Date Field</span>
                <select
                  value={filters.dateField}
                  onChange={e => setFilters(prev => ({ ...prev, dateField: e.target.value as any }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                >
                  <option value="lastUpdated">Last Modified / Chat Date</option>
                  <option value="deliveryDate">Target Handover Date</option>
                </select>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Start Date</span>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={e => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">End Date</span>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={e => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />
              </div>
            </div>
          </div>

          {/* 3. Original Data Source Filter */}
          <div>
            <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Original Ingestion Data Source</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {dataSources.map(ds => {
                const isSelected = filters.dataSource === ds;
                return (
                  <button
                    key={ds}
                    type="button"
                    onClick={() => setFilters(prev => ({ ...prev, dataSource: ds }))}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-600 text-white border-cyan-500 shadow-md shadow-cyan-600/30'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {ds === 'All' ? 'All Sources' : ds}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Specific Keywords Multi-Select */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
                <span>Specific Maritime Keywords</span>
              </label>
              {filters.selectedKeywords.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFilters(prev => ({ ...prev, selectedKeywords: [] }))}
                  className="text-[10px] text-slate-400 hover:text-white"
                >
                  Clear Tags ({filters.selectedKeywords.length})
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800">
              {allKeywords.map(kw => {
                const selected = filters.selectedKeywords.includes(kw);
                return (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => toggleKeyword(kw)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                      selected
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {selected ? '✓ ' : ''}{kw}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Category Filter */}
          <div>
            <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5">
              Vessel Category
            </label>
            <select
              value={filters.category}
              onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
            >
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onResetFilters();
              setFilters({
                projectName: '',
                startDate: '',
                endDate: '',
                dateField: 'lastUpdated',
                selectedKeywords: [],
                dataSource: 'All',
                category: 'All'
              });
            }}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-slate-400 hover:text-white text-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onApplyFilters(filters);
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30 cursor-pointer"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
