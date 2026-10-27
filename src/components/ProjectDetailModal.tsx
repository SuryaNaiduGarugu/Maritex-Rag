import React from 'react';
import { 
  X, 
  FileDown, 
  Ship, 
  Cpu, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  ShieldAlert, 
  MapPin, 
  DollarSign 
} from 'lucide-react';
import { MaritimeProject } from '../types/maritime';
import { generateSingleProjectPDF } from '../utils/pdfGenerator';

interface ProjectDetailModalProps {
  project: MaritimeProject | null;
  onClose: () => void;
  onDiscussInRAG: (project: MaritimeProject) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
  onDiscussInRAG
}) => {
  if (!project) return null;

  const formatUSD = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between bg-slate-950/70">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                {project.code}
              </span>
              <span className="text-xs font-mono text-cyan-400">
                {project.imoNumber}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {project.category}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white">
              {project.name}
            </h2>
            <p className="text-xs text-slate-400">
              {project.vesselType} • {project.shipyard}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => generateSingleProjectPDF(project)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Key Numbers Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Contract Budget</span>
              <span className="text-base font-extrabold text-white block">{formatUSD(project.contractValue)}</span>
              <span className="text-[10px] text-slate-500">{project.client}</span>
            </div>

            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Build Progress</span>
              <span className="text-base font-extrabold text-emerald-400 block">{project.progressPercent}%</span>
              <span className="text-[10px] text-slate-500">{project.status}</span>
            </div>

            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Target Handover</span>
              <span className="text-base font-extrabold text-white block">{project.deliveryDate}</span>
              <span className="text-[10px] text-slate-500">Maritime Expo Delivery</span>
            </div>

            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Expo Pavilion</span>
              <span className="text-base font-extrabold text-amber-400 block">{project.expoBoothNumber.split('(')[0]}</span>
              <span className="text-[10px] text-slate-500">{project.expoBoothNumber}</span>
            </div>
          </div>

          {/* Summary */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Executive Summary</h4>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
              {project.summary}
            </p>
          </div>

          {/* Technical Specs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              <span>Full Vessel & Propulsion Specifications</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Length Overall (LOA)</span>
                <span className="font-semibold text-slate-200">{project.technicalSpecs.lengthOverall}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Beam (Width)</span>
                <span className="font-semibold text-slate-200">{project.technicalSpecs.beam}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Design Draft</span>
                <span className="font-semibold text-slate-200">{project.technicalSpecs.draft}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Deadweight Capacity</span>
                <span className="font-semibold text-slate-200">{project.technicalSpecs.deadweight}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Propulsion System</span>
                <span className="font-semibold text-slate-200">{project.technicalSpecs.propulsion}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Fuel Configuration</span>
                <span className="font-semibold text-slate-200">{project.technicalSpecs.fuelType}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Cruising / Sprint Speed</span>
                <span className="font-semibold text-slate-200">{project.technicalSpecs.speedKnots}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 col-span-2">
                <span className="text-[10px] text-slate-500 block">Autonomy Level & Navigation AI</span>
                <span className="font-semibold text-slate-200">{project.technicalSpecs.autonomyLevel}</span>
              </div>
            </div>
          </div>

          {/* Ingested WhatsApp Communications */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ingested WhatsApp & Chat Audit Trail ({project.chatSources.length} messages)</span>
            </h4>
            <div className="space-y-2">
              {project.chatSources.map((chat) => (
                <div key={chat.id} className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-slate-200">{chat.sender} ({chat.source})</span>
                    <span className="font-mono text-slate-500">{chat.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-300 italic">"{chat.message}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Sea Trials & Milestones</h4>
            <div className="space-y-2">
              {project.milestones.map((m) => (
                <div key={m.id} className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-200 block">{m.title}</span>
                    <span className="text-[11px] text-slate-400">{m.notes}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    m.status === 'completed' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                  }`}>
                    {m.status.toUpperCase()} ({m.date})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            Lead: {project.leadEngineer}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onDiscussInRAG(project);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-semibold cursor-pointer"
            >
              Open in RAG Discussion
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
