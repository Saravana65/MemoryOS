'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface DemoSlide {
  query: string;
  sourceName: string;
  sourceType: string;
  sourceText: string;
  highlightedText: string;
  answer: string;
}

const DEMO_SLIDES: DemoSlide[] = [
  {
    query: "What did I save about the Tokyo trip?",
    sourceName: "Nezu_Shrine_Notes.pdf",
    sourceType: "Document",
    sourceText: "Tokyo Travel Guide (page 4): Visited the Nezu Shrine in the afternoon. Very quiet moss garden, recommend returning around 3 PM for the best light.",
    highlightedText: "Nezu Shrine... quiet moss garden, recommend returning around 3 PM for the best light.",
    answer: "You saved that the Nezu Shrine features a quiet moss garden, and you recommended visiting around 3:00 PM to catch the best lighting.",
  },
  {
    query: "Who recommended that book on memory palaces?",
    sourceName: "Screenshot_2026-05-12.png",
    sourceType: "Image",
    sourceText: "Sarah: Hey, you should read 'Moonwalking with Einstein' by Joshua Foer. It explains memory palaces perfectly.",
    highlightedText: "read 'Moonwalking with Einstein' by Joshua Foer. It explains memory palaces",
    answer: "Sarah recommended the book 'Moonwalking with Einstein' by Joshua Foer, mentioning that it explains memory palaces perfectly.",
  },
  {
    query: "Where was that quote about memory being a library?",
    sourceName: "Reading_Log.txt",
    sourceType: "Note",
    sourceText: "Augustine: 'I come to the fields and spacious palaces of my memory, where are the treasures of innumerable images...' It's like a library that never shuts.",
    highlightedText: "fields and spacious palaces of my memory, where are the treasures of innumerable images",
    answer: "The quote is from Augustine, comparing memory to 'fields and spacious palaces' containing treasures of innumerable images, resembling a library.",
  }
];

export default function LandingPage() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [typedQuery, setTypedQuery] = useState('');
  const [demoState, setDemoState] = useState<'typing' | 'searching' | 'showing'>('typing');

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Handle slide transitions & typing effect
  useEffect(() => {
    if (reducedMotion) {
      // If motion is reduced, immediately show the fully loaded slide state
      setTypedQuery(DEMO_SLIDES[slideIndex].query);
      setDemoState('showing');
      
      const interval = setInterval(() => {
        setSlideIndex((prev) => (prev + 1) % DEMO_SLIDES.length);
      }, 7000);
      
      return () => clearInterval(interval);
    }

    const currentSlide = DEMO_SLIDES[slideIndex];
    let typingTimer: NodeJS.Timeout;
    let transitionTimer: NodeJS.Timeout;
    
    if (demoState === 'typing') {
      let charIndex = 0;
      setTypedQuery('');
      
      const type = () => {
        if (charIndex < currentSlide.query.length) {
          setTypedQuery(currentSlide.query.substring(0, charIndex + 1));
          charIndex++;
          typingTimer = setTimeout(type, 50 + Math.random() * 30);
        } else {
          // Finished typing, move to searching
          typingTimer = setTimeout(() => {
            setDemoState('searching');
          }, 800);
        }
      };
      
      typingTimer = setTimeout(type, 500);
    } else if (demoState === 'searching') {
      transitionTimer = setTimeout(() => {
        setDemoState('showing');
      }, 1200);
    } else if (demoState === 'showing') {
      transitionTimer = setTimeout(() => {
        setDemoState('typing');
        setSlideIndex((prev) => (prev + 1) % DEMO_SLIDES.length);
      }, 6000);
    }

    return () => {
      clearTimeout(typingTimer);
      clearTimeout(transitionTimer);
    };
  }, [demoState, slideIndex, reducedMotion]);

  const activeSlide = DEMO_SLIDES[slideIndex];

  // Helper to render highlights in text
  const renderHighlightedText = (fullText: string, highlight: string) => {
    const parts = fullText.split(highlight);
    if (parts.length > 1) {
      return (
        <span>
          {parts[0]}
          <mark className="bg-ochre/25 text-ink py-0.5 px-1 rounded-sm transition-all duration-300">
            {highlight}
          </mark>
          {parts[1]}
        </span>
      );
    }
    return <span>{fullText}</span>;
  };

  return (
    <div className="flex flex-col flex-grow bg-paper text-ink font-sans">
      
      {/* 1. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 text-center space-y-10">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-6xl font-serif tracking-tight leading-tight text-ink">
            Everything you've ever read, <br />
            <span className="italic text-sage font-normal">instantly recallable.</span>
          </h1>
          <p className="text-lg sm:text-xl text-sage/95 max-w-2xl mx-auto font-sans leading-relaxed">
            MemoryOS is your private personal library. Upload PDFs, notes, documents, and screenshots. Ask questions in natural language and retrieve exact answers anchored directly to your sources.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-md font-medium text-white bg-sage hover:bg-sage/90 focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 outline-none transition-all shadow-sm text-center"
            >
              Build Your Vault
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-md font-medium text-sage bg-linen hover:bg-linen/85 focus-visible:ring-2 focus-visible:ring-linen focus-visible:ring-offset-2 outline-none transition-all text-center"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* SIGNATURE VISUAL: Hero Query & RAG Demo */}
        <div className="max-w-3xl mx-auto border border-linen rounded-xl bg-paper shadow-md overflow-hidden text-left mt-12 transition-all duration-500 hover:shadow-lg">
          
          {/* Top Panel (Search Interface Header) */}
          <div className="bg-linen/40 border-b border-linen/80 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="h-3.5 w-3.5 rounded-full bg-red-400/60"></span>
              <span className="h-3.5 w-3.5 rounded-full bg-yellow-400/60"></span>
              <span className="h-3.5 w-3.5 rounded-full bg-green-400/60"></span>
            </div>
            <span className="text-xs text-sage/70 font-mono">vault://personal.memory</span>
          </div>

          {/* Search Box Input Area */}
          <div className="p-6 border-b border-linen bg-white">
            <div className="relative flex items-center border border-linen rounded-md bg-paper p-3 shadow-inner">
              <svg className="h-5 w-5 text-sage mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <div className="text-sm text-ink font-sans flex-1 min-h-[1.5rem] flex items-center">
                {typedQuery}
                {demoState === 'typing' && !reducedMotion && (
                  <span className="inline-block w-2 h-4 bg-sage ml-1 animate-pulse" />
                )}
              </div>
            </div>
          </div>

          {/* Result Content Area */}
          <div className="p-6 bg-paper/30 min-h-[16rem] flex flex-col justify-center space-y-6">
            {demoState === 'searching' && (
              <div className="flex flex-col items-center justify-center space-y-3 py-8">
                <svg className="animate-spin h-6 w-6 text-sage" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-xs text-sage/80 font-mono tracking-wider">RECALLING MEMORIES...</span>
              </div>
            )}

            {demoState === 'showing' && (
              <div className="space-y-5 animate-fade-in">
                
                {/* Captured Source Snippet Card */}
                <div className="border border-linen rounded-lg p-5 bg-white shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-linen text-sage border border-linen">
                      {activeSlide.sourceType}
                    </span>
                    <span className="text-xs text-sage/75 font-mono truncate max-w-[200px]" title={activeSlide.sourceName}>
                      {activeSlide.sourceName}
                    </span>
                  </div>
                  <blockquote className="text-sm italic text-ink/90 border-l-2 border-sage/60 pl-3 leading-relaxed font-serif">
                    {renderHighlightedText(activeSlide.sourceText, activeSlide.highlightedText)}
                  </blockquote>
                </div>

                {/* AI Synthesized Answer */}
                <div className="space-y-1 pl-1">
                  <div className="flex items-center space-x-1.5 text-xs text-sage font-mono font-semibold uppercase tracking-wider">
                    <span>Synthesized Recall</span>
                  </div>
                  <p className="text-sm text-ink leading-relaxed font-sans font-medium">
                    {activeSlide.answer}
                  </p>
                </div>
              </div>
            )}
            
            {demoState === 'typing' && (
              <div className="text-center text-xs text-sage/60 font-mono py-12">
                Waiting for query entry...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section className="bg-linen/25 border-y border-linen py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <h2 className="text-3xl font-serif text-ink">How it works</h2>
            <p className="text-sm sm:text-base text-sage/80 font-sans max-w-xl mx-auto">
              MemoryOS processes files into your own private knowledge index. Follow three direct steps to rebuild your external memory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-linen p-8 rounded-lg space-y-4 shadow-sm relative overflow-hidden">
              <span className="text-5xl font-serif font-black text-linen absolute top-4 right-6 select-none">1</span>
              <div className="h-10 w-10 bg-linen/50 rounded-full flex items-center justify-center text-sage font-bold">
                ↓
              </div>
              <h3 className="text-lg font-serif font-bold text-ink">Gather</h3>
              <p className="text-sm text-sage/90 leading-relaxed font-sans">
                Upload PDFs, notes, receipts, articles, or screenshots. Select files directly or drag them into your vault interface.
              </p>
            </div>

            <div className="bg-white border border-linen p-8 rounded-lg space-y-4 shadow-sm relative overflow-hidden">
              <span className="text-5xl font-serif font-black text-linen absolute top-4 right-6 select-none">2</span>
              <div className="h-10 w-10 bg-linen/50 rounded-full flex items-center justify-center text-sage font-bold">
                ⚙
              </div>
              <h3 className="text-lg font-serif font-bold text-ink">Ingest & Chunk</h3>
              <p className="text-sm text-sage/90 leading-relaxed font-sans">
                Our pipeline extracts document text, segments it into readable chunks, constructs deep embeddings, and indexes them securely.
              </p>
            </div>

            <div className="bg-white border border-linen p-8 rounded-lg space-y-4 shadow-sm relative overflow-hidden">
              <span className="text-5xl font-serif font-black text-linen absolute top-4 right-6 select-none">3</span>
              <div className="h-10 w-10 bg-linen/50 rounded-full flex items-center justify-center text-sage font-bold">
                ✓
              </div>
              <h3 className="text-lg font-serif font-bold text-ink">Ask & Recall</h3>
              <p className="text-sm text-sage/90 leading-relaxed font-sans">
                Search or chat with your archive in plain language. Get summarized syntheses rooted entirely in your uploads, complete with file links.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SUPPORTED CONTENT TYPES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <h2 className="text-3xl font-serif text-ink font-semibold">Supported Content</h2>
          <p className="text-sm sm:text-base text-sage/80 font-sans max-w-xl mx-auto">
            Bring all formats of reading material, notes, and digital snaps. MemoryOS handles structured and unstructured text.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* PDFs */}
          <div className="border border-linen bg-white p-6 rounded-lg text-center flex flex-col items-center justify-center space-y-3 shadow-sm hover:border-sage/40 transition-colors">
            <div className="h-12 w-12 bg-linen rounded-md flex items-center justify-center text-sage font-mono text-xs font-bold uppercase">
              PDF
            </div>
            <h4 className="text-base font-serif font-bold text-ink">Books & Documents</h4>
            <p className="text-xs text-sage/90 leading-relaxed font-sans">
              Scan research papers, long travel guides, manual instructions, or books.
            </p>
          </div>

          {/* Screenshots */}
          <div className="border border-linen bg-white p-6 rounded-lg text-center flex flex-col items-center justify-center space-y-3 shadow-sm hover:border-sage/40 transition-colors">
            <div className="h-12 w-12 bg-linen rounded-md flex items-center justify-center text-sage font-mono text-xs font-bold uppercase">
              IMG
            </div>
            <h4 className="text-base font-serif font-bold text-ink">Screenshots & Clips</h4>
            <p className="text-xs text-sage/90 leading-relaxed font-sans">
              Save web clippings, text messages, whiteboard snapshots, or scanned receipts.
            </p>
          </div>

          {/* Notes */}
          <div className="border border-linen bg-white p-6 rounded-lg text-center flex flex-col items-center justify-center space-y-3 shadow-sm hover:border-sage/40 transition-colors">
            <div className="h-12 w-12 bg-linen rounded-md flex items-center justify-center text-sage font-mono text-xs font-bold uppercase">
              TXT
            </div>
            <h4 className="text-base font-serif font-bold text-ink">Plain Text Notes</h4>
            <p className="text-xs text-sage/90 leading-relaxed font-sans">
              Preserve journal logs, meeting summaries, brain dumps, or markdown drafts.
            </p>
          </div>

          {/* Microsoft Word Docs */}
          <div className="border border-linen bg-white p-6 rounded-lg text-center flex flex-col items-center justify-center space-y-3 shadow-sm hover:border-sage/40 transition-colors">
            <div className="h-12 w-12 bg-linen rounded-md flex items-center justify-center text-sage font-mono text-xs font-bold uppercase">
              DOCX
            </div>
            <h4 className="text-base font-serif font-bold text-ink">Word Files</h4>
            <p className="text-xs text-sage/90 leading-relaxed font-sans">
              Import project briefs, letters, manuscripts, and reports natively.
            </p>
          </div>

        </div>
      </section>

      {/* 4. PRIVACY / TRUST SECTION */}
      <section className="bg-linen/10 border-t border-linen py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-sage/30 bg-white rounded-xl shadow-md p-8 sm:p-12 space-y-8 relative overflow-hidden">
            
            {/* Background Accent Lines */}
            <div className="absolute top-0 right-0 h-40 w-40 bg-linen/25 rounded-bl-full pointer-events-none" />
            
            <div className="space-y-4 max-w-2xl">
              <span className="text-xs font-mono font-bold text-sage uppercase tracking-widest bg-linen/50 px-2.5 py-1 rounded">
                Personal Safe
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-ink leading-tight">
                Your memory, entirely yours.
              </h2>
              <p className="text-sm text-sage leading-relaxed font-sans">
                MemoryOS is designed for personal retrieval. Unlike enterprise platforms and productivity startups, your catalog is an extension of your own mind, shielded from data telemetry.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-linen">
              <div className="space-y-2">
                <h4 className="text-sm font-serif font-bold text-ink">Zero Model Training</h4>
                <p className="text-xs text-sage/90 leading-relaxed font-sans">
                  We never use your documents, notes, or chat queries to train, adjust, or refine public AI models.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-serif font-bold text-ink">Isolated Vaults</h4>
                <p className="text-xs text-sage/90 leading-relaxed font-sans">
                  Your files are stored in individual collections, securely separated at the infrastructure level.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-serif font-bold text-ink">Local-First Architecture</h4>
                <p className="text-xs text-sage/90 leading-relaxed font-sans">
                  Build locally with Docker. Keep control of your storage volumes (MinIO) and search indexes (Qdrant).
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. FINAL CTA */}
      <section className="bg-linen py-20 text-center border-t border-linen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <h2 className="text-3xl sm:text-4xl font-serif tracking-tight text-ink">
            Begin your personal library today
          </h2>
          <p className="text-sm sm:text-base text-sage/95 max-w-lg mx-auto font-sans leading-relaxed">
            Consolidate your screenshots, papers, and files. Query them anytime from a clean, secure space built for you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-md font-medium text-white bg-sage hover:bg-sage/90 focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 outline-none transition-all shadow-sm text-center"
            >
              Get Started for Free
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-md font-medium text-sage bg-paper border border-linen hover:bg-paper/90 focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 outline-none transition-all text-center"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
