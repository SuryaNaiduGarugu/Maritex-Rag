/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ProjectDiscussionRAG } from './components/ProjectDiscussionRAG';
import { ProjectCatalogGrid } from './components/ProjectCatalogGrid';
import { DataIngestionPanel } from './components/DataIngestionPanel';
import { ExpoFloorAndContacts } from './components/ExpoFloorAndContacts';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { VoiceConversationConsole } from './components/VoiceConversationConsole';
import { AudioTranscriber } from './components/AudioTranscriber';
import { SEED_PROJECTS } from './data/seedProjects';
import { MaritimeProject } from './types/maritime';
import { 
  auth, 
  db, 
  handleFirestoreError, 
  OperationType, 
  testConnection 
} from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, getDocs, collection } from 'firebase/firestore';

export default function App() {
  const [projects, setProjects] = useState<MaritimeProject[]>(SEED_PROJECTS);
  const [selectedProject, setSelectedProject] = useState<MaritimeProject>(SEED_PROJECTS[0]);
  const [activeTab, setActiveTab] = useState<'discuss' | 'voice' | 'transcribe' | 'catalog' | 'ingest' | 'booths'>('discuss');
  const [detailModalProject, setDetailModalProject] = useState<MaritimeProject | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [transcribedTextForIngest, setTranscribedTextForIngest] = useState<string | null>(null);

  // Monitor Firebase Auth state & test Firestore connectivity
  useEffect(() => {
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          await setDoc(userDocRef, {
            userId: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            lastLoginAt: new Date().toISOString()
          }, { merge: true });
        } catch (err) {
          console.warn('User profile sync notice:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Ingest update to an existing project (e.g. from WhatsApp chat parsing or audio transcript)
  const handleIngestProjectUpdate = async (updatedProject: MaritimeProject) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    if (selectedProject.id === updatedProject.id) {
      setSelectedProject(updatedProject);
    }

    // Persist to Firestore if user is authenticated
    if (currentUser) {
      try {
        const projDocRef = doc(db, 'projects', updatedProject.id);
        await setDoc(projDocRef, {
          ...updatedProject,
          ownerId: currentUser.uid,
          lastUpdated: new Date().toISOString().slice(0, 10)
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `projects/${updatedProject.id}`);
      }
    }
  };

  // Ingest newly detected project
  const handleAddNewProject = async (newProject: MaritimeProject) => {
    setProjects(prev => [newProject, ...prev]);
    setSelectedProject(newProject);
    setActiveTab('discuss');

    if (currentUser) {
      try {
        const projDocRef = doc(db, 'projects', newProject.id);
        await setDoc(projDocRef, {
          ...newProject,
          ownerId: currentUser.uid,
          lastUpdated: new Date().toISOString().slice(0, 10)
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `projects/${newProject.id}`);
      }
    }
  };

  const handleSelectProjectForDiscussion = (project: MaritimeProject) => {
    setSelectedProject(project);
    setActiveTab('discuss');
  };

  // Handler for receiving transcript from AudioTranscriber and routing to Ingestion Studio
  const handleSendTranscriptToRAG = (transcriptText: string) => {
    setTranscribedTextForIngest(transcriptText);
    setActiveTab('ingest');
  };

  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* App Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        projects={projects}
        currentUser={currentUser}
        onOpenIngest={() => setActiveTab('ingest')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'discuss' && (
          <ProjectDiscussionRAG
            projects={projects}
            selectedProject={selectedProject}
            onSelectProject={setSelectedProject}
            onOpenDetailModal={setDetailModalProject}
            onOpenVoiceConsole={() => setActiveTab('voice')}
          />
        )}

        {activeTab === 'voice' && (
          <VoiceConversationConsole
            currentProject={selectedProject}
            projects={projects}
          />
        )}

        {activeTab === 'transcribe' && (
          <AudioTranscriber
            onSendTranscriptToRAG={handleSendTranscriptToRAG}
          />
        )}

        {activeTab === 'catalog' && (
          <ProjectCatalogGrid
            projects={projects}
            onSelectProjectForDiscussion={handleSelectProjectForDiscussion}
            onOpenDetailModal={setDetailModalProject}
          />
        )}

        {activeTab === 'ingest' && (
          <DataIngestionPanel
            projects={projects}
            onIngestProjectUpdate={handleIngestProjectUpdate}
            onAddNewProject={handleAddNewProject}
            onDone={() => setActiveTab('discuss')}
          />
        )}

        {activeTab === 'booths' && (
          <ExpoFloorAndContacts
            projects={projects}
            onSelectProject={handleSelectProjectForDiscussion}
          />
        )}
      </main>

      {/* Project Detail Modal */}
      <ProjectDetailModal
        project={detailModalProject}
        onClose={() => setDetailModalProject(null)}
        onDiscussInRAG={handleSelectProjectForDiscussion}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Maritex RAG • Official Maritime Expo Intelligence, Audio Feeds & Voice Pipeline</span>
          <span className="font-mono text-cyan-400/80">10 Projects Active • Firestore Sync Enabled</span>
        </div>
      </footer>
    </div>
  );
}
