import React from 'react';
import { 
  Anchor, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  FileDown,
  ExternalLink
} from 'lucide-react';
import { MaritimeProject } from '../types/maritime';
import { generateSingleProjectPDF } from '../utils/pdfGenerator';

interface ExpoFloorAndContactsProps {
  projects: MaritimeProject[];
  onSelectProject: (project: MaritimeProject) => void;
}

export const ExpoFloorAndContacts: React.FC<ExpoFloorAndContactsProps> = ({
  projects,
  onSelectProject
}) => {
  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
            EXPO DIRECTORY
          </span>
          <span className="text-xs text-slate-400">
            Official Exhibition Floor Plan & Shipyard Delegations
          </span>
        </div>
        <h2 className="text-xl font-extrabold text-white">
          Maritime Expo Pavilions, Booths & Lead Engineers
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Locate all 10 projects on the Maritime Expo floor. Ingested WhatsApp communications are routed directly to these registered lead naval architects and shipyard directors.
        </p>
      </div>

      {/* Booths Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {project.expoBoothNumber}
                </span>
                <span className="text-xs font-mono text-cyan-400 font-semibold">
                  {project.code}
                </span>
              </div>

              <h3 className="text-base font-bold text-white mb-0.5">
                {project.name}
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                {project.vesselType} • {project.shipyard}
              </p>

              {/* Lead Architect & Contacts */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-slate-200">
                  <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="font-semibold">{project.leadEngineer}</span>
                </div>

                {project.contacts.map((contact, idx) => (
                  <div key={idx} className="pt-1.5 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-400">
                    <span className="font-medium text-slate-300">{contact.name} ({contact.role})</span>
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center gap-1 font-mono text-slate-400">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        {contact.phone}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-slate-400">
                        <Mail className="w-3 h-3 text-cyan-400" />
                        {contact.email}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => onSelectProject(project)}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Discuss in RAG Console</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => generateSingleProjectPDF(project)}
                className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-800 cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5 text-rose-400" />
                <span>PDF Dossier</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
