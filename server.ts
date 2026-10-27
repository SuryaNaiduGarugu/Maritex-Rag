import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json({ limit: '25mb' }));

const PORT = 3000;
const isProd = process.env.NODE_ENV === 'production';

// Initialize Gemini SDK if API key is present
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
  } catch (err) {
    console.warn('Gemini client initialization notice:', err);
  }
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Maritex RAG Server',
    hasGeminiKey: Boolean(geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY'),
    timestamp: new Date().toISOString()
  });
});

// Endpoint: Extract structured data from WhatsApp or raw chat via Gemini / NLP
app.post('/api/rag-extract', async (req: Request, res: Response) => {
  try {
    const { rawChat, existingProjects } = req.body;
    if (!rawChat || typeof rawChat !== 'string') {
      res.status(400).json({ error: 'rawChat text is required' });
      return;
    }

    if (aiClient) {
      try {
        const prompt = `You are the lead AI Data Extractor for Maritex Maritime Expo RAG Pipeline.
Analyze the following chat log (WhatsApp or communications stream) and extract maritime project intelligence:

CHAT LOG:
${rawChat}

KNOWN PROJECTS CONTEXT:
${JSON.stringify((existingProjects || []).map((p: any) => ({ id: p.id, name: p.name, imo: p.imoNumber, code: p.code })))}

Extract and return a valid JSON object with the following schema ONLY:
{
  "projectName": "Identified project name or new project title",
  "projectCode": "Code e.g. PSDX-LNG",
  "vesselType": "Vessel classification",
  "imoNumber": "IMO 7-digit number if present",
  "shipyard": "Shipyard name",
  "client": "Client or stakeholder",
  "contractValue": number (in USD, null if not mentioned),
  "deliveryDate": "YYYY-MM-DD if mentioned",
  "technicalSpecs": {
    "speedKnots": "speed if mentioned",
    "fuelType": "fuel/propulsion if mentioned",
    "lengthOverall": "length if mentioned"
  },
  "riskItems": [
    { "severity": "High" | "Medium" | "Low", "description": "risk summary" }
  ],
  "detectedKeywords": ["keyword1", "keyword2", "keyword3"],
  "confidence": number between 1 and 100,
  "summary": "2-sentence extraction summary"
}`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const text = response.text?.trim();
        if (text) {
          const parsed = JSON.parse(text);
          res.json({ success: true, method: 'gemini-2.5-flash', data: parsed });
          return;
        }
      } catch (geminiError) {
        console.warn('Gemini extraction fallback triggered:', geminiError);
      }
    }

    res.json({ success: false, method: 'fallback_to_client_rag', message: 'Using client-side RAG engine' });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Extraction failed' });
  }
});

// Endpoint: AI-Augmented RAG Query across projects
app.post('/api/rag-query', async (req: Request, res: Response) => {
  try {
    const { query, retrievedContext, selectedProject } = req.body;
    if (!query) {
      res.status(400).json({ error: 'Query is required' });
      return;
    }

    if (aiClient) {
      try {
        const prompt = `You are Maritex RAG, the specialized AI Intelligence Pipeline for a Maritime Expo.
The user is asking a question about maritime expo projects. Answer accurately, citing retrieved context, IMO numbers, shipyards, specs, and WhatsApp sources where applicable.

USER QUERY:
${query}

SELECTED PROJECT:
${selectedProject ? JSON.stringify(selectedProject) : 'None (Searching all projects)'}

RETRIEVED KNOWLEDGE CHUNKS:
${JSON.stringify(retrievedContext || [])}

Provide a concise, professional answer with bullet points if helpful.`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });

        const answer = response.text;
        res.json({ success: true, method: 'gemini-2.5-flash', answer });
        return;
      } catch (geminiError) {
        console.warn('Gemini query fallback triggered:', geminiError);
      }
    }

    res.json({ success: false, method: 'fallback_to_client_rag' });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Query failed' });
  }
});

// Endpoint: Voice Conversation response via Gemini
app.post('/api/voice-chat', async (req: Request, res: Response) => {
  try {
    const { spokenText, currentProject, projectContext } = req.body;
    if (!spokenText) {
      res.status(400).json({ error: 'spokenText is required' });
      return;
    }

    if (aiClient) {
      try {
        const prompt = `You are the voice of Maritex RAG, the voice AI assistant at the Maritime Expo.
Speak naturally and concisely (1-3 sentences suitable for text-to-speech audio playback).
Respond directly to the attendee's spoken question about maritime projects.

ACTIVE PROJECT CONTEXT:
${currentProject ? JSON.stringify(currentProject) : 'None'}

EXPO DATA CONTEXT:
${JSON.stringify(projectContext || [])}

USER SPOKE:
"${spokenText}"

Provide a direct, conversational speech response (avoid markdown asterisks or bullet characters so the speech synthesizer reads it smoothly):`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });

        const speechText = response.text?.replace(/[*#_`]/g, '').trim();
        res.json({ success: true, speechText });
        return;
      } catch (err) {
        console.warn('Gemini voice fallback notice:', err);
      }
    }

    // Deterministic fallback for voice response
    res.json({
      success: true,
      speechText: `Regarding ${currentProject?.name || 'the expo projects'}: The vessel is registered under ${currentProject?.imoNumber || 'IMO registry'}, built at ${currentProject?.shipyard || 'partner shipyards'}, with a budget of ${currentProject?.contractValue ? '$' + (currentProject.contractValue / 1e6) + ' million' : 'contract specs'}. Build status is ${currentProject?.progressPercent || 85} percent complete.`
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Voice chat failed' });
  }
});

// Mount Vite middleware in development or serve static in production
async function startServer() {
  if (!isProd) {
    const fsModule = await import('node:fs');
    const pathModule = await import('node:path');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });
    app.use(vite.middlewares);

    app.use('*', async (req: Request, res: Response, next) => {
      const url = req.originalUrl;
      try {
        let template = fsModule.readFileSync(pathModule.resolve('./index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Maritex RAG Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
