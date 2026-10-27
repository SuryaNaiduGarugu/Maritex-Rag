export type ProjectStatus = 
  | 'Concept & Planning'
  | 'Engineering & Design'
  | 'Dry Dock Construction'
  | 'Sea Trials & Testing'
  | 'Commissioned & Delivered';

export interface TechnicalSpecs {
  lengthOverall: string;
  beam: string;
  draft: string;
  deadweight: string;
  propulsion: string;
  fuelType: string;
  speedKnots: string;
  autonomyLevel: string;
}

export interface Milestone {
  id: string;
  date: string;
  title: string;
  status: 'completed' | 'in-progress' | 'pending';
  notes: string;
}

export interface RiskItem {
  id: string;
  severity: 'High' | 'Medium' | 'Low';
  description: string;
  mitigation: string;
}

export interface ChatSourceItem {
  id: string;
  source: 'WhatsApp' | 'Slack' | 'Email' | 'Document';
  sender: string;
  timestamp: string;
  message: string;
  extractedAttributes?: string[];
}

export interface ContactPerson {
  name: string;
  role: string;
  phone: string;
  email: string;
}

export interface MaritimeProject {
  id: string;
  code: string;
  name: string;
  category: string;
  vesselType: string;
  imoNumber: string;
  shipyard: string;
  client: string;
  contractValue: number; // in USD
  status: ProjectStatus;
  progressPercent: number;
  deliveryDate: string;
  technicalSpecs: TechnicalSpecs;
  milestones: Milestone[];
  keyRisks: RiskItem[];
  chatSources: ChatSourceItem[];
  keywords: string[];
  summary: string;
  expoBoothNumber: string;
  leadEngineer: string;
  contacts: ContactPerson[];
  lastUpdated: string;
}

export interface ParsedChatMessage {
  raw: string;
  timestamp: string;
  sender: string;
  message: string;
  sourceType: 'WhatsApp' | 'Slack' | 'Email' | 'Manual';
}

export interface ExtractedEntityData {
  projectName?: string;
  projectCode?: string;
  vesselType?: string;
  imoNumber?: string;
  shipyard?: string;
  client?: string;
  contractValue?: number;
  deliveryDate?: string;
  technicalSpecs?: Partial<TechnicalSpecs>;
  milestones?: Array<{ title: string; date: string; notes?: string }>;
  riskItems?: Array<{ severity: 'High' | 'Medium' | 'Low'; description: string }>;
  detectedKeywords: string[];
  confidence: number;
  sourceSnippet: string;
}

export interface RAGSearchResult {
  project: MaritimeProject;
  score: number;
  matchType: 'keyword' | 'semantic' | 'exact' | 'chat_log';
  matchedKeywords: string[];
  matchedSnippets: Array<{
    field: string;
    text: string;
    sender?: string;
    timestamp?: string;
  }>;
}

export interface RAGQueryResponse {
  answer: string;
  sources: Array<{
    projectId: string;
    projectName: string;
    field: string;
    snippet: string;
    sourceType: string;
    score: number;
  }>;
  relatedKeywords: string[];
  suggestedFollowUps: string[];
}
