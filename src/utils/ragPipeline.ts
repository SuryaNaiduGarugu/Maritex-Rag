import {
  MaritimeProject,
  ParsedChatMessage,
  ExtractedEntityData,
  RAGSearchResult,
  RAGQueryResponse
} from '../types/maritime';

/**
 * Standard English & generic stopwords to filter out from search queries
 */
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'can\'t', 'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing',
  'don\'t', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t',
  'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers',
  'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if',
  'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t',
  'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our',
  'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s',
  'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re',
  'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t',
  'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s',
  'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t',
  'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself',
  'yourselves', 'show', 'tell', 'want', 'give', 'details', 'detail', 'project', 'projects', 'expo'
]);

/**
 * Tokenize and normalize text into clean keywords
 */
export function tokenizeText(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

/**
 * Parse WhatsApp exported chat strings (supports iOS bracketed and Android hyphenated formats)
 */
export function parseWhatsAppChat(rawText: string): ParsedChatMessage[] {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText.split(/\r?\n/);
  const parsedMessages: ParsedChatMessage[] = [];

  // Format 1: [DD/MM/YY, HH:MM:SS] Sender: Message or [MM/DD/YYYY, HH:MM:SS AM/PM] Sender: Message
  const regexBracket = /^\[(\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4},?\s+\d{1,2}:\d{2}(?::\d{2})?(?:\s+[APMapm]{2})?)\]\s+([^:]+):\s*(.*)$/;
  
  // Format 2: DD/MM/YY, HH:MM - Sender: Message (Android standard export)
  const regexHyphen = /^(\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4},?\s+\d{1,2}:\d{2}(?::\d{2})?(?:\s+[APMapm]{2})?)\s+-\s+([^:]+):\s*(.*)$/;

  // Format 3: Slack/Teams format: Sender [HH:MM]: Message
  const regexSlack = /^([^[\n]+)\s*\[(\d{1,2}:\d{2}(?:\s*[APMapm]{2})?)\]:\s*(.*)$/;

  let currentMsg: ParsedChatMessage | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const matchBracket = trimmed.match(regexBracket);
    if (matchBracket) {
      if (currentMsg) parsedMessages.push(currentMsg);
      currentMsg = {
        raw: trimmed,
        timestamp: matchBracket[1].trim(),
        sender: matchBracket[2].trim(),
        message: matchBracket[3].trim(),
        sourceType: 'WhatsApp'
      };
      continue;
    }

    const matchHyphen = trimmed.match(regexHyphen);
    if (matchHyphen) {
      if (currentMsg) parsedMessages.push(currentMsg);
      currentMsg = {
        raw: trimmed,
        timestamp: matchHyphen[1].trim(),
        sender: matchHyphen[2].trim(),
        message: matchHyphen[3].trim(),
        sourceType: 'WhatsApp'
      };
      continue;
    }

    const matchSlack = trimmed.match(regexSlack);
    if (matchSlack) {
      if (currentMsg) parsedMessages.push(currentMsg);
      currentMsg = {
        raw: trimmed,
        timestamp: matchSlack[2].trim(),
        sender: matchSlack[1].trim(),
        message: matchSlack[3].trim(),
        sourceType: 'Slack'
      };
      continue;
    }

    // Append to previous message if it's a multi-line message
    if (currentMsg) {
      currentMsg.message += ' ' + trimmed;
      currentMsg.raw += '\n' + trimmed;
    } else {
      // Standalone line without header
      parsedMessages.push({
        raw: trimmed,
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
        sender: 'Chat Participant',
        message: trimmed,
        sourceType: 'Manual'
      });
    }
  }

  if (currentMsg) {
    parsedMessages.push(currentMsg);
  }

  return parsedMessages;
}

/**
 * Extract structured maritime data entities from parsed chat messages
 */
export function extractProjectEntities(
  messages: ParsedChatMessage[],
  existingProjects: MaritimeProject[]
): ExtractedEntityData {
  const fullText = messages.map(m => `${m.sender}: ${m.message}`).join('\n');
  const lowerText = fullText.toLowerCase();

  const extracted: ExtractedEntityData = {
    detectedKeywords: [],
    confidence: 0,
    sourceSnippet: fullText.slice(0, 300)
  };

  let confidencePoints = 0;

  // 1. Identify Target Project
  for (const proj of existingProjects) {
    const projNameMatch = lowerText.includes(proj.name.toLowerCase());
    const projCodeMatch = lowerText.includes(proj.code.toLowerCase());
    const imoMatch = proj.imoNumber && lowerText.includes(proj.imoNumber.toLowerCase());

    if (projNameMatch || projCodeMatch || imoMatch) {
      extracted.projectName = proj.name;
      extracted.projectCode = proj.code;
      confidencePoints += 30;
      break;
    }
  }

  // If no existing project matched, detect candidate project name: e.g. "Project X"
  if (!extracted.projectName) {
    const newProjMatch = fullText.match(/Project\s+([A-Za-z0-9_-]+(?:\s+[A-Za-z0-9_-]+)?)/i);
    if (newProjMatch) {
      extracted.projectName = newProjMatch[0].trim();
      extracted.projectCode = newProjMatch[1].toUpperCase().replace(/\s+/g, '-');
      confidencePoints += 20;
    }
  }

  // 2. Extract IMO Number: IMO 9874102 or IMO9874102
  const imoMatch = fullText.match(/IMO\s*(\d{7})/i);
  if (imoMatch) {
    extracted.imoNumber = `IMO ${imoMatch[1]}`;
    confidencePoints += 25;
  }

  // 3. Extract Contract Value / Budget: e.g. $245M, $245,000,000, 245 million
  const budgetMatch = fullText.match(/\$\s*(\d+(?:,\d{3})*(?:\.\d+)?)\s*(m|million|billion|k)?/i);
  if (budgetMatch) {
    let amount = parseFloat(budgetMatch[1].replace(/,/g, ''));
    const unit = budgetMatch[2]?.toLowerCase();
    if (unit === 'm' || unit === 'million') amount *= 1000000;
    else if (unit === 'billion') amount *= 1000000000;
    else if (unit === 'k') amount *= 1000;
    extracted.contractValue = amount;
    confidencePoints += 20;
  }

  // 4. Extract Delivery Date (YYYY-MM-DD or Month DD, YYYY)
  const isoDateMatch = fullText.match(/\b(202[4-9]-\d{2}-\d{2})\b/);
  if (isoDateMatch) {
    extracted.deliveryDate = isoDateMatch[1];
    confidencePoints += 15;
  }

  // 5. Extract Shipyard references
  const shipyards = [
    'Hyundai Heavy Industries', 'Damen', 'Meyer Werft', 'Navantia',
    'Fincantieri', 'Austal', 'Freire', 'VARD', 'CIMC Raffles'
  ];
  for (const s of shipyards) {
    if (lowerText.includes(s.toLowerCase())) {
      extracted.shipyard = s;
      confidencePoints += 15;
      break;
    }
  }

  // 6. Extract Technical Specs mentions
  const specs: Partial<ExtractedEntityData['technicalSpecs']> = {};
  const speedMatch = fullText.match(/(\d+(?:\.\d+)?)\s*knots/i);
  if (speedMatch) specs.speedKnots = `${speedMatch[1]} knots`;

  const lengthMatch = fullText.match(/(\d+(?:\.\d+)?)\s*(?:meters|m)\s*(?:length|loa)?/i);
  if (lengthMatch) specs.lengthOverall = `${lengthMatch[1]} meters`;

  const bollardMatch = fullText.match(/(\d+(?:\.\d+)?)\s*tons?\s*bollard/i);
  if (bollardMatch) specs.speedKnots = `${specs.speedKnots || ''} (${bollardMatch[1]}t bollard pull)`.trim();

  if (lowerText.includes('lng') || lowerText.includes('hydrogen') || lowerText.includes('electric') || lowerText.includes('methanol') || lowerText.includes('battery')) {
    if (lowerText.includes('hydrogen')) specs.fuelType = 'Liquid / Compressed Hydrogen Fuel Cell';
    else if (lowerText.includes('electric') || lowerText.includes('battery')) specs.fuelType = '100% Electric LFP Battery';
    else if (lowerText.includes('lng')) specs.fuelType = 'Dual-Fuel LNG';
    else if (lowerText.includes('methanol')) specs.fuelType = 'Methanol Dual-Fuel';
  }

  if (Object.keys(specs).length > 0) {
    extracted.technicalSpecs = specs;
    confidencePoints += 15;
  }

  // 7. Extract Action Items / Risks
  const riskMatches: Array<{ severity: 'High' | 'Medium' | 'Low'; description: string }> = [];
  for (const m of messages) {
    const mLower = m.message.toLowerCase();
    if (mLower.includes('delay') || mLower.includes('risk') || mLower.includes('issue') || mLower.includes('leak') || mLower.includes('failure')) {
      const severity: 'High' | 'Medium' | 'Low' = mLower.includes('critical') || mLower.includes('major') || mLower.includes('halt')
        ? 'High'
        : mLower.includes('delay') || mLower.includes('risk') ? 'Medium' : 'Low';
      riskMatches.push({
        severity,
        description: m.message
      });
    }
  }
  if (riskMatches.length > 0) {
    extracted.riskItems = riskMatches;
    confidencePoints += 10;
  }

  // Extract relevant keywords
  const keywords = Array.from(new Set(tokenizeText(fullText))).slice(0, 15);
  extracted.detectedKeywords = keywords;
  extracted.confidence = Math.min(100, Math.max(20, confidencePoints));

  return extracted;
}

export interface SearchFilterOptions {
  targetProjectId?: string;
  categoryFilter?: string;
  projectName?: string;
  startDate?: string;
  endDate?: string;
  dateField?: 'lastUpdated' | 'deliveryDate';
  selectedKeywords?: string[];
  dataSource?: string;
}

/**
 * Calculate keyword similarity & search matching across projects with advanced filters
 */
export function searchProjectsRAG(
  query: string,
  projects: MaritimeProject[],
  options?: SearchFilterOptions
): RAGSearchResult[] {
  // Pre-filter projects by advanced filters
  let candidateProjects = projects.filter(project => {
    // 1. Project Name filter
    if (options?.projectName && options.projectName.trim()) {
      if (project.name.toLowerCase() !== options.projectName.toLowerCase()) {
        return false;
      }
    }

    // 2. Category filter
    if (options?.categoryFilter && options.categoryFilter !== 'All') {
      if (project.category !== options.categoryFilter) {
        return false;
      }
    }

    // 3. Date range filter
    if (options?.startDate || options?.endDate) {
      const fieldToCheck = options.dateField === 'deliveryDate' ? project.deliveryDate : project.lastUpdated;
      if (fieldToCheck) {
        if (options.startDate && fieldToCheck < options.startDate) return false;
        if (options.endDate && fieldToCheck > options.endDate) return false;
      }
    }

    // 4. Data source filter
    if (options?.dataSource && options.dataSource !== 'All') {
      const hasSource = project.chatSources.some(c => c.source.toLowerCase() === options.dataSource?.toLowerCase());
      if (!hasSource) return false;
    }

    // 5. Selected keywords filter (must match at least one if specified)
    if (options?.selectedKeywords && options.selectedKeywords.length > 0) {
      const projKws = project.keywords.map(k => k.toLowerCase());
      const hasMatch = options.selectedKeywords.some(sk => 
        projKws.includes(sk.toLowerCase()) || 
        project.summary.toLowerCase().includes(sk.toLowerCase()) ||
        project.vesselType.toLowerCase().includes(sk.toLowerCase())
      );
      if (!hasMatch) return false;
    }

    return true;
  });

  if (!query || !query.trim()) {
    // If no query, return candidate projects with default score
    return candidateProjects.map(p => ({
      project: p,
      score: 1.0,
      matchType: 'exact',
      matchedKeywords: p.keywords.slice(0, 4),
      matchedSnippets: [{ field: 'Overview', text: p.summary }]
    }));
  }

  const queryTokens = tokenizeText(query);
  const normalizedQuery = query.toLowerCase().trim();

  const results: RAGSearchResult[] = [];

  for (const project of candidateProjects) {

    let score = 0;
    const matchedKeywords: string[] = [];
    const matchedSnippets: Array<{ field: string; text: string; sender?: string; timestamp?: string }> = [];

    // Prioritize if user explicitly selected this project
    if (options?.targetProjectId === project.id) {
      score += 40;
    }

    // Direct name or code match
    if (project.name.toLowerCase().includes(normalizedQuery)) {
      score += 60;
      matchedSnippets.push({ field: 'Project Name', text: project.name });
    }
    if (project.code.toLowerCase().includes(normalizedQuery)) {
      score += 55;
      matchedSnippets.push({ field: 'Project Code', text: project.code });
    }
    if (project.imoNumber && project.imoNumber.toLowerCase().includes(normalizedQuery)) {
      score += 70;
      matchedSnippets.push({ field: 'IMO Number', text: project.imoNumber });
    }

    // Shipyard match
    if (project.shipyard.toLowerCase().includes(normalizedQuery)) {
      score += 45;
      matchedSnippets.push({ field: 'Shipyard', text: project.shipyard });
    }

    // Keyword tokens match against project keywords
    for (const token of queryTokens) {
      if (project.keywords.some(k => k.toLowerCase().includes(token))) {
        score += 15;
        if (!matchedKeywords.includes(token)) matchedKeywords.push(token);
      }
      if (project.vesselType.toLowerCase().includes(token)) {
        score += 15;
        if (!matchedKeywords.includes(token)) matchedKeywords.push(token);
      }
      if (project.summary.toLowerCase().includes(token)) {
        score += 10;
        if (!matchedKeywords.includes(token)) matchedKeywords.push(token);
      }
    }

    // Search in technical specs
    const specs = project.technicalSpecs;
    for (const [key, value] of Object.entries(specs)) {
      if (typeof value === 'string' && value.toLowerCase().includes(normalizedQuery)) {
        score += 25;
        matchedSnippets.push({ field: `Technical Spec (${key})`, text: value });
      } else {
        for (const token of queryTokens) {
          if (typeof value === 'string' && value.toLowerCase().includes(token)) {
            score += 8;
            if (!matchedSnippets.some(s => s.field.includes(key))) {
              matchedSnippets.push({ field: `Technical Spec (${key})`, text: value });
            }
          }
        }
      }
    }

    // Search in WhatsApp / Chat logs
    for (const chat of project.chatSources) {
      const chatLower = chat.message.toLowerCase();
      let chatMatched = false;
      if (chatLower.includes(normalizedQuery)) {
        score += 30;
        chatMatched = true;
      } else {
        for (const token of queryTokens) {
          if (chatLower.includes(token)) {
            score += 12;
            chatMatched = true;
            if (!matchedKeywords.includes(token)) matchedKeywords.push(token);
          }
        }
      }

      if (chatMatched) {
        matchedSnippets.push({
          field: `${chat.source} Log (${chat.sender})`,
          text: chat.message,
          sender: chat.sender,
          timestamp: chat.timestamp
        });
      }
    }

    // Search in Milestones
    for (const m of project.milestones) {
      const mText = `${m.title} ${m.notes}`.toLowerCase();
      for (const token of queryTokens) {
        if (mText.includes(token)) {
          score += 10;
          matchedSnippets.push({ field: `Milestone (${m.date})`, text: `${m.title}: ${m.notes}` });
          break;
        }
      }
    }

    if (score > 0) {
      results.push({
        project,
        score,
        matchType: score >= 50 ? 'exact' : score >= 25 ? 'semantic' : 'keyword',
        matchedKeywords,
        matchedSnippets: matchedSnippets.slice(0, 4)
      });
    }
  }

  // Sort descending by score
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Synthesize intelligent RAG answer from retrieved maritime project chunks
 */
export function generateRAGAnswer(
  query: string,
  searchResults: RAGSearchResult[],
  selectedProject?: MaritimeProject
): RAGQueryResponse {
  if (searchResults.length === 0) {
    return {
      answer: `No direct project records found for "${query}". Try searching for keywords like "LNG", "autonomous", "hydrogen", "battery", "Damen", "Austal", or IMO numbers like "9874102".`,
      sources: [],
      relatedKeywords: ['autonomous vessel', 'dual-fuel', 'electric tug', 'IMO specs', 'expo booths'],
      suggestedFollowUps: [
        'Show details for Project Poseidon-X',
        'Compare green propulsion projects under $100M',
        'List all vessels scheduled for 2026 delivery'
      ]
    };
  }

  const topMatch = searchResults[0];
  const p = topMatch.project;
  const isTargeted = selectedProject?.id === p.id;

  const sources: RAGQueryResponse['sources'] = [];

  for (const match of searchResults.slice(0, 3)) {
    for (const snip of match.matchedSnippets.slice(0, 2)) {
      sources.push({
        projectId: match.project.id,
        projectName: match.project.name,
        field: snip.field,
        snippet: snip.text,
        sourceType: snip.sender ? 'WhatsApp Chat' : 'Technical Dossier',
        score: match.score
      });
    }
  }

  // Format currency
  const formattedBudget = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(p.contractValue);

  // Generate crisp context-augmented response
  const queryLower = query.toLowerCase();
  let answer = '';

  if (queryLower.includes('budget') || queryLower.includes('cost') || queryLower.includes('value') || queryLower.includes('price')) {
    answer = `**${p.name}** has a confirmed contract budget of **${formattedBudget}**, commissioned by **${p.client}** at **${p.shipyard}**. Progress is currently at **${p.progressPercent}%** (${p.status}).`;
  } else if (queryLower.includes('engine') || queryLower.includes('propulsion') || queryLower.includes('speed') || queryLower.includes('spec') || queryLower.includes('fuel')) {
    answer = `**${p.name}** (${p.vesselType}) features:
- **Propulsion**: ${p.technicalSpecs.propulsion}
- **Fuel System**: ${p.technicalSpecs.fuelType}
- **Speed & Dynamics**: ${p.technicalSpecs.speedKnots}
- **Autonomy**: ${p.technicalSpecs.autonomyLevel}
- **Dimensions**: ${p.technicalSpecs.lengthOverall} (LOA) x ${p.technicalSpecs.beam} (Beam), Draft ${p.technicalSpecs.draft}.`;
  } else if (queryLower.includes('delivery') || queryLower.includes('timeline') || queryLower.includes('milestone') || queryLower.includes('when')) {
    const nextMilestone = p.milestones.find(m => m.status === 'in-progress' || m.status === 'pending');
    answer = `**${p.name}** is scheduled for delivery on **${p.deliveryDate}**.
Current phase: **${p.status}** (${p.progressPercent}% complete).
Next milestone: *${nextMilestone ? `${nextMilestone.title} (${nextMilestone.date})` : 'Final commissioning'}*. Handover showcase will take place at Maritime Expo **${p.expoBoothNumber}**.`;
  } else if (queryLower.includes('whatsapp') || queryLower.includes('chat') || queryLower.includes('message') || queryLower.includes('update')) {
    const chats = p.chatSources.map(c => `• **${c.sender}** (${c.timestamp}): "${c.message}"`).join('\n');
    answer = `Recent ingested communications for **${p.name}**:\n${chats}`;
  } else {
    answer = `**${p.name} (${p.code})** — *${p.vesselType}*
- **Shipyard & Client**: Built by ${p.shipyard} for ${p.client}.
- **Identification**: ${p.imoNumber} | Expo Booth: ${p.expoBoothNumber}
- **Financials & Status**: ${formattedBudget} | ${p.status} (${p.progressPercent}% complete).
- **Core Spec**: ${p.technicalSpecs.propulsion} | ${p.technicalSpecs.fuelType}.
- **Summary**: ${p.summary}`;
  }

  // If there are other matching projects, add comparative note
  if (searchResults.length > 1 && !isTargeted) {
    const others = searchResults.slice(1, 3).map(r => `${r.project.name} (${r.project.category})`).join(', ');
    answer += `\n\n*Also matched in RAG pipeline:* ${others}.`;
  }

  const relatedKeywords = Array.from(new Set([
    ...p.keywords.slice(0, 5),
    'IMO audit',
    'Sea trials',
    'Contract value'
  ]));

  const suggestedFollowUps = [
    `What are the technical specs of ${p.name}?`,
    `Show WhatsApp discussions for ${p.name}`,
    `Export ${p.name} dossier to PDF`
  ];

  return {
    answer,
    sources,
    relatedKeywords,
    suggestedFollowUps
  };
}

/**
 * Export projects to standard CSV format
 */
export function exportProjectsToCSV(projects: MaritimeProject[]): string {
  const headers = [
    'Project ID',
    'Code',
    'Project Name',
    'Category',
    'Vessel Type',
    'IMO Number',
    'Shipyard',
    'Client',
    'Contract Value (USD)',
    'Status',
    'Progress (%)',
    'Delivery Date',
    'Propulsion',
    'Fuel Type',
    'Speed',
    'Autonomy Level',
    'Length Overall',
    'Expo Booth',
    'Lead Engineer'
  ];

  const rows = projects.map(p => [
    `"${p.id}"`,
    `"${p.code}"`,
    `"${p.name.replace(/"/g, '""')}"`,
    `"${p.category}"`,
    `"${p.vesselType.replace(/"/g, '""')}"`,
    `"${p.imoNumber}"`,
    `"${p.shipyard.replace(/"/g, '""')}"`,
    `"${p.client.replace(/"/g, '""')}"`,
    p.contractValue,
    `"${p.status}"`,
    p.progressPercent,
    `"${p.deliveryDate}"`,
    `"${p.technicalSpecs.propulsion.replace(/"/g, '""')}"`,
    `"${p.technicalSpecs.fuelType.replace(/"/g, '""')}"`,
    `"${p.technicalSpecs.speedKnots}"`,
    `"${p.technicalSpecs.autonomyLevel}"`,
    `"${p.technicalSpecs.lengthOverall}"`,
    `"${p.expoBoothNumber}"`,
    `"${p.leadEngineer.replace(/"/g, '""')}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/**
 * Export projects to formatted JSON string
 */
export function exportProjectsToJSON(projects: MaritimeProject[]): string {
  return JSON.stringify(projects, null, 2);
}
