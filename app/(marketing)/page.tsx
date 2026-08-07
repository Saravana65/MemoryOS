import React from 'react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center flex-grow py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-3xl text-center space-y-8">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900">
          MemoryOS
        </h1>
        <p className="text-xl sm:text-2xl font-semibold text-blue-600">
          Your AI-powered personal knowledge vault.
        </p>
        <p className="max-w-2xl mx-auto text-lg text-gray-600 leading-relaxed">
          Securely store, organize, and query your notes, documents, and files. 
          MemoryOS uses advanced Retrieval-Augmented Generation (RAG) to let you 
          have a natural language chat over all your uploaded resources.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-3 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-center"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3 rounded-md font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors text-center"
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
