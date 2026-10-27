import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseWhatsAppChat,
  extractProjectEntities,
  searchProjectsRAG,
  generateRAGAnswer,
  exportProjectsToCSV,
  tokenizeText
} from './ragPipeline';
import { SEED_PROJECTS } from '../data/seedProjects';

test('parseWhatsAppChat correctly parses standard bracketed timestamps', () => {
  const rawChat = `[25/10/26, 09:12:18] Chief Engineer Miller: Good morning team. Here is the latest WhatsApp update on Project Poseidon-X.
[25/10/26, 09:14:40] Naval Architect Sarah Lin: WinGD engine completed 100 hours.`;

  const parsed = parseWhatsAppChat(rawChat);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].sender, 'Chief Engineer Miller');
  assert.equal(parsed[0].sourceType, 'WhatsApp');
  assert.match(parsed[0].message, /Poseidon-X/);
  assert.equal(parsed[1].sender, 'Naval Architect Sarah Lin');
});

test('parseWhatsAppChat handles hyphenated Android WhatsApp exports', () => {
  const rawAndroidChat = `26/10/26, 14:20 - Capt. Henrik: Polar ice trials confirmed in Alesund.
26/10/26, 14:22 - Astrid Holm: Budget update $310M confirmed.`;

  const parsed = parseWhatsAppChat(rawAndroidChat);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].sender, 'Capt. Henrik');
  assert.match(parsed[0].message, /Polar ice trials/);
  assert.equal(parsed[1].sender, 'Astrid Holm');
});

test('tokenizeText normalizes words and discards stopwords', () => {
  const tokens = tokenizeText('Show me all details about the hydrogen fuel cell container vessel!');
  assert.ok(tokens.includes('hydrogen'));
  assert.ok(tokens.includes('fuel'));
  assert.ok(tokens.includes('cell'));
  assert.ok(tokens.includes('container'));
  assert.ok(tokens.includes('vessel'));
  assert.ok(!tokens.includes('the'));
  assert.ok(!tokens.includes('about'));
  assert.ok(!tokens.includes('me'));
});

test('extractProjectEntities accurately extracts IMO, budget and target project', () => {
  const sampleMessages = [
    {
      raw: 'update',
      timestamp: '2026-10-25 10:00',
      sender: 'Elena',
      message: 'Signed contract for Project Poseidon-X (IMO 9874102) with budget $245,000,000 and delivery 2026-11-15.',
      sourceType: 'WhatsApp' as const
    }
  ];

  const extracted = extractProjectEntities(sampleMessages, SEED_PROJECTS);
  assert.equal(extracted.projectName, 'Project Poseidon-X');
  assert.equal(extracted.imoNumber, 'IMO 9874102');
  assert.equal(extracted.contractValue, 245000000);
  assert.equal(extracted.deliveryDate, '2026-11-15');
  assert.ok(extracted.confidence >= 80);
});

test('searchProjectsRAG ranks matching maritime projects by similarity', () => {
  const query = 'autonomous LNG carrier Hyundai';
  const results = searchProjectsRAG(query, SEED_PROJECTS);
  assert.ok(results.length > 0);
  assert.equal(results[0].project.name, 'Project Poseidon-X');
  assert.ok(results[0].score > 50);
});

test('searchProjectsRAG matches WhatsApp chat contents', () => {
  const query = 'Starlink telemetry delay';
  const results = searchProjectsRAG(query, SEED_PROJECTS);
  assert.ok(results.length > 0);
  assert.equal(results[0].project.name, 'Project Poseidon-X');
  assert.ok(results[0].matchedSnippets.some(s => s.text.includes('Starlink')));
});

test('generateRAGAnswer produces contextual synthesized answer with source citations', () => {
  const query = 'What is the budget and shipyard for Project BlueHarbor?';
  const results = searchProjectsRAG(query, SEED_PROJECTS);
  const ragResponse = generateRAGAnswer(query, results, results[0].project);
  
  assert.match(ragResponse.answer, /BlueHarbor/);
  assert.match(ragResponse.answer, /85,000,000/);
  assert.ok(ragResponse.sources.length > 0);
});

test('searchProjectsRAG filters accurately by date range and data source', () => {
  // Test filtering by data source 'WhatsApp'
  const whatsAppResults = searchProjectsRAG('', SEED_PROJECTS, {
    dataSource: 'WhatsApp'
  });
  assert.ok(whatsAppResults.length > 0);
  assert.ok(whatsAppResults.every(r => r.project.chatSources.some(c => c.source === 'WhatsApp')));

  // Test filtering by project name
  const filteredByName = searchProjectsRAG('', SEED_PROJECTS, {
    projectName: 'Project BlueHarbor'
  });
  assert.equal(filteredByName.length, 1);
  assert.equal(filteredByName[0].project.name, 'Project BlueHarbor');

  // Test filtering by 2026 delivery date
  const deliveries2026 = searchProjectsRAG('', SEED_PROJECTS, {
    dateField: 'deliveryDate',
    startDate: '2026-01-01',
    endDate: '2026-12-31'
  });
  assert.ok(deliveries2026.length > 0);
  assert.ok(deliveries2026.every(r => r.project.deliveryDate.startsWith('2026')));
});

