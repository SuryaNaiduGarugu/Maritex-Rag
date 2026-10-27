import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Layers, 
  ArrowRight,
  Database,
  RefreshCw,
  Plus,
  Send
} from 'lucide-react';
import { MaritimeProject, ParsedChatMessage, ExtractedEntityData } from '../types/maritime';
import { parseWhatsAppChat, extractProjectEntities } from '../utils/ragPipeline';
import { SAMPLE_WHATSAPP_LOGS } from '../data/seedProjects';

interface DataIngestionPanelProps {
  projects: MaritimeProject[];
  onIngestProjectUpdate: (updatedProject: MaritimeProject) => void;
  onAddNewProject?: (newProject: MaritimeProject) => void;
  onDone?: () => void;
}

export const DataIngestionPanel: React.FC<DataIngestionPanelProps> = ({
  projects,
  onIngestProjectUpdate,
  onAddNewProject,
  onDone
}) => {
  const [rawChatText, setRawChatText] = useState<string>(SAMPLE_WHATSAPP_LOGS[0].text);
  const [selectedSampleIndex, setSelectedSampleIndex] = useState<number>(0);
  const [sourceType, setSourceType] = useState<'WhatsApp' | 'Slack' | 'Document'>('WhatsApp');
  const [parsedMessages, setParsedMessages] = useState<ParsedChatMessage[]>(() => parseWhatsAppChat(SAMPLE_WHATSAPP_LOGS[0].text));
  const [extractedData, setExtractedData] = useState<ExtractedEntityData>(() => extractProjectEntities(parseWhatsAppChat(SAMPLE_WHATSAPP_LOGS[0].text), projects));
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [ingestSuccessMessage, setIngestSuccessMessage] = useState<string | null>(null);

  const handleTextChange = (text: string) => {
    setRawChatText(text);
    const parsed = parseWhatsAppChat(text);
    setParsedMessages(parsed);
    const extracted = extractProjectEntities(parsed, projects);
    setExtractedData(extracted);
  };

  const handleSelectSample = (idx: number) => {
    setSelectedSampleIndex(idx);
    const sample = SAMPLE_WHATSAPP_LOGS[idx];
    handleTextChange(sample.text);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        handleTextChange(content);
      }
    };
    reader.readAsText(file);
  };

  // Perform AI or Deep Extraction
  const handleDeepExtraction = async () => {
    setIsExtracting(true);
    setIngestSuccessMessage(null);

    try {
      // Call backend Gemini extraction endpoint
      const response = await fetch('/api/rag-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawChat: rawChatText,
          existingProjects: projects
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const geminiData = result.data;
          setExtractedData({
            projectName: geminiData.projectName || extractedData.projectName,
            projectCode: geminiData.projectCode || extractedData.projectCode,
            vesselType: geminiData.vesselType || extractedData.vesselType,
            imoNumber: geminiData.imoNumber || extractedData.imoNumber,
            shipyard: geminiData.shipyard || extractedData.shipyard,
            client: geminiData.client || extractedData.client,
            contractValue: geminiData.contractValue || extractedData.contractValue,
            deliveryDate: geminiData.deliveryDate || extractedData.deliveryDate,
            technicalSpecs: {
              ...extractedData.technicalSpecs,
              ...geminiData.technicalSpecs
            },
            riskItems: geminiData.riskItems || extractedData.riskItems,
            detectedKeywords: geminiData.detectedKeywords || extractedData.detectedKeywords,
            confidence: geminiData.confidence || 96,
            sourceSnippet: geminiData.summary || rawChatText.slice(0, 300)
          });
          return;
        }
      }
    } catch (err) {
      console.warn('Backend extract notice, applying local RAG parser');
    } finally {
      setIsExtracting(false);
    }

    // Fallback: rule-based local extraction
    const parsed = parseWhatsAppChat(rawChatText);
    setParsedMessages(parsed);
    setExtractedData(extractProjectEntities(parsed, projects));
  };

  // Commit ingested data into application state
  const handleCommitIngestion = () => {
    if (!extractedData.projectName) {
      alert('Could not determine a matching project. Please verify project name or IMO.');
      return;
    }

    // Find existing project or create new
    const target = projects.find(p => 
      p.name.toLowerCase() === extractedData.projectName?.toLowerCase() ||
      p.code.toLowerCase() === extractedData.projectCode?.toLowerCase() ||
      (extractedData.imoNumber && p.imoNumber.toLowerCase() === extractedData.imoNumber.toLowerCase())
    );

    if (target) {
      // Append newly parsed messages to target project's chatSources
      const newChats = parsedMessages.map((m, idx) => ({
        id: `ingested-${Date.now()}-${idx}`,
        source: sourceType,
        sender: m.sender,
        timestamp: m.timestamp,
        message: m.message,
        extractedAttributes: extractedData.detectedKeywords.slice(0, 3)
      }));

      const updated: MaritimeProject = {
        ...target,
        contractValue: extractedData.contractValue || target.contractValue,
        deliveryDate: extractedData.deliveryDate || target.deliveryDate,
        shipyard: extractedData.shipyard || target.shipyard,
        imoNumber: extractedData.imoNumber || target.imoNumber,
        technicalSpecs: {
          ...target.technicalSpecs,
          ...(extractedData.technicalSpecs?.speedKnots ? { speedKnots: extractedData.technicalSpecs.speedKnots } : {}),
          ...(extractedData.technicalSpecs?.fuelType ? { fuelType: extractedData.technicalSpecs.fuelType } : {}),
          ...(extractedData.technicalSpecs?.lengthOverall ? { lengthOverall: extractedData.technicalSpecs.lengthOverall } : {})
        },
        chatSources: [...newChats, ...target.chatSources],
        keywords: Array.from(new Set([...target.keywords, ...extractedData.detectedKeywords])),
        lastUpdated: new Date().toISOString().slice(0, 10)
      };

      onIngestProjectUpdate(updated);
      setIngestSuccessMessage(`Successfully updated "${updated.name}" with ${newChats.length} ingested chat records! RAG index synchronized.`);
    } else {
      // Create new candidate project
      const newProj: MaritimeProject = {
        id: `PRJ-${String(projects.length + 1).padStart(2, '0')}`,
        code: extractedData.projectCode || `PRJ-${projects.length + 1}`,
        name: extractedData.projectName || 'Newly Ingested Maritime Project',
        category: 'Ingested Project',
        vesselType: extractedData.vesselType || 'Maritime Vessel',
        imoNumber: extractedData.imoNumber || 'IMO Pending',
        shipyard: extractedData.shipyard || 'Shipyard TBA',
        client: extractedData.client || 'Client TBA',
        contractValue: extractedData.contractValue || 50000000,
        status: 'Concept & Planning',
        progressPercent: 35,
        deliveryDate: extractedData.deliveryDate || '2027-12-31',
        technicalSpecs: {
          lengthOverall: extractedData.technicalSpecs?.lengthOverall || '120 meters',
          beam: '22 meters',
          draft: '6.5 meters',
          deadweight: '5,000 DWT',
          propulsion: 'Marine Propulsion TBA',
          fuelType: extractedData.technicalSpecs?.fuelType || 'Clean Marine Fuel',
          speedKnots: extractedData.technicalSpecs?.speedKnots || '16 knots',
          autonomyLevel: 'IMO Degree 2'
        },
        milestones: [
          { id: 'm-new-1', title: 'Data Ingestion & Extraction Milestone', date: new Date().toISOString().slice(0, 10), status: 'completed', notes: 'Extracted from WhatsApp chat stream.' }
        ],
        keyRisks: extractedData.riskItems?.map((r, i) => ({
          id: `r-${i}`,
          severity: r.severity,
          description: r.description,
          mitigation: 'Monitored via Maritex RAG pipeline'
        })) || [],
        chatSources: parsedMessages.map((m, idx) => ({
          id: `new-${Date.now()}-${idx}`,
          source: sourceType,
          sender: m.sender,
          timestamp: m.timestamp,
          message: m.message
        })),
        keywords: extractedData.detectedKeywords,
        summary: `Maritime project extracted via WhatsApp chat ingestion: ${extractedData.sourceSnippet.slice(0, 140)}...`,
        expoBoothNumber: `Hall B - Booth ${200 + projects.length}`,
        leadEngineer: 'Chief Technical Officer',
        contacts: [],
        lastUpdated: new Date().toISOString().slice(0, 10)
      };

      if (onAddNewProject) {
        onAddNewProject(newProj);
        setIngestSuccessMessage(`Created and indexed new project "${newProj.name}" into RAG pipeline!`);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                DATA INGESTION PIPELINE
              </span>
              <span className="text-xs text-slate-400">
                WhatsApp • Slack • Teams • TXT Export
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white">
              Maritime Communications Extractor & RAG Ingestion
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Upload exported chat files or paste raw discussion logs. The NLP engine parses timestamps, stakeholders, contracts, IMO numbers, and vessel technical parameters.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer text-xs font-semibold transition-all">
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>Upload WhatsApp .txt</span>
              <input
                type="file"
                accept=".txt,.csv,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Pre-Loaded Quick Samples */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Load Pre-Engineered Maritime Chat Exports:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {SAMPLE_WHATSAPP_LOGS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSample(idx)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedSampleIndex === idx
                    ? 'bg-cyan-950/70 border-cyan-500 text-white shadow-md'
                    : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <span className="text-xs font-bold block text-cyan-300">{sample.title}</span>
                <span className="text-[11px] text-slate-400 block mt-0.5 truncate">{sample.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Working Area: Raw Input (Left) + Extracted Intelligence (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: RAW CHAT INPUT */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Raw Chat & Export Stream</span>
            </h3>
            <span className="text-xs font-mono text-slate-500">
              {parsedMessages.length} Messages Detected
            </span>
          </div>

          <textarea
            value={rawChatText}
            onChange={(e) => handleTextChange(e.target.value)}
            rows={15}
            placeholder="Paste exported WhatsApp chat logs here... e.g. [25/10/26, 09:12] Capt: update on Poseidon-X..."
            className="w-full flex-1 p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 leading-relaxed focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />

          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              onClick={handleDeepExtraction}
              disabled={isExtracting || !rawChatText.trim()}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/30 cursor-pointer"
            >
              {isExtracting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Extracting Entities...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run NLP Extraction</span>
                </>
              )}
            </button>

            <span className="text-[11px] text-slate-500">
              Auto-parses timestamps, sender identities & numbers
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: EXTRACTED ENTITY REPORT */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Cpu className="w-4 h-4" />
                <span>Extracted Project Intelligence</span>
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Confidence:</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {extractedData.confidence}%
                </span>
              </div>
            </div>

            {/* Extracted Fields Table */}
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Target Project:</span>
                <span className="font-bold text-white text-right">
                  {extractedData.projectName || 'Unidentified Project'} 
                  {extractedData.projectCode && ` (${extractedData.projectCode})`}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">IMO Identification:</span>
                <span className="font-mono font-bold text-cyan-400">
                  {extractedData.imoNumber || 'Not specified in chat'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Contract Value / Budget:</span>
                <span className="font-bold text-emerald-400">
                  {extractedData.contractValue 
                    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(extractedData.contractValue)
                    : 'Not specified'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Shipyard / Builder:</span>
                <span className="font-semibold text-slate-200">
                  {extractedData.shipyard || 'Not mentioned'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Delivery Milestone:</span>
                <span className="font-mono text-slate-200">
                  {extractedData.deliveryDate || 'Not mentioned'}
                </span>
              </div>

              {/* Technical Specs */}
              {extractedData.technicalSpecs && Object.keys(extractedData.technicalSpecs).length > 0 && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block mb-1 font-semibold">Extracted Specifications:</span>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    {extractedData.technicalSpecs.speedKnots && (
                      <span className="text-slate-300">Speed: <strong className="text-white">{extractedData.technicalSpecs.speedKnots}</strong></span>
                    )}
                    {extractedData.technicalSpecs.fuelType && (
                      <span className="text-slate-300">Fuel: <strong className="text-white">{extractedData.technicalSpecs.fuelType}</strong></span>
                    )}
                    {extractedData.technicalSpecs.lengthOverall && (
                      <span className="text-slate-300">Length: <strong className="text-white">{extractedData.technicalSpecs.lengthOverall}</strong></span>
                    )}
                  </div>
                </div>
              )}

              {/* Detected Keywords */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-1">Extracted Search Keywords:</span>
                <div className="flex flex-wrap gap-1">
                  {extractedData.detectedKeywords.map((k, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {k}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Items / Risks */}
              {extractedData.riskItems && extractedData.riskItems.length > 0 && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-amber-900/50">
                  <span className="text-amber-400 font-bold block mb-1">Identified Action Items / Risks:</span>
                  {extractedData.riskItems.map((r, i) => (
                    <div key={i} className="text-[11px] text-slate-300">
                      • [{r.severity}] {r.description}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {ingestSuccessMessage && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/80 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{ingestSuccessMessage}</span>
              </div>
            )}
          </div>

          {/* Ingest Action Button */}
          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={handleCommitIngestion}
              disabled={!extractedData.projectName}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <Database className="w-4 h-4" />
              <span>Ingest Into RAG Pipeline & Update Project Data</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
