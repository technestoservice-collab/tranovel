import React, { useState, useEffect } from 'react';
import { Upload, FileText, X, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PDFReader from './components/PDFReader';
import LanguageSelector from './components/LanguageSelector';
import { translateText } from './services/gemini';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [targetLanguage, setTargetLanguage] = useState<string>('চলমান বাংলা ভাষার');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [showTranslation, setShowTranslation] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      if (files[0].type === 'application/pdf') {
        setFile(files[0]);
      } else {
        alert('Please upload a valid PDF file.');
      }
    }
  };

  const handleTextSelected = async (text: string) => {
    if (!text || text.trim().length === 0) return;
    
    setSelectedText(text);
    setShowTranslation(true);
    setIsTranslating(true);
    setTranslatedText(''); // Clear previous

    try {
      const result = await translateText(text, targetLanguage);
      setTranslatedText(result);
    } catch (error) {
      setTranslatedText('Failed to translate. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const closeTranslation = () => {
    setShowTranslation(false);
    setSelectedText('');
    setTranslatedText('');
    // Clear selection in window
    window.getSelection()?.removeAllRanges();
  };

  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-20">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Sparkles className="text-white" size={20} />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
            Novel Translator
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500 hidden sm:inline">Translate to:</span>
          <LanguageSelector 
            selectedLanguage={targetLanguage} 
            onSelectLanguage={(lang) => {
              setTargetLanguage(lang);
              // If there's already selected text, re-translate it
              if (selectedText && showTranslation) {
                handleTextSelected(selectedText);
              }
            }} 
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        {!file ? (
          <div className="h-full flex flex-col items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center"
            >
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="text-indigo-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Upload your Novel</h2>
              <p className="text-slate-500 mb-8">
                Select a PDF file to start reading. Highlight any text to instantly translate it into {targetLanguage}.
              </p>
              
              <label className="block w-full">
                <input 
                  type="file" 
                  accept="application/pdf" 
                  onChange={handleFileChange}
                  className="hidden" 
                />
                <div className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">
                  <FileText size={20} />
                  <span>Choose PDF File</span>
                </div>
              </label>
              
              <p className="mt-4 text-xs text-slate-400">
                Supported format: PDF only
              </p>
            </motion.div>
          </div>
        ) : (
          <PDFReader 
            file={file} 
            onTextSelected={handleTextSelected}
            onReset={() => setFile(null)}
          />
        )}

        {/* Translation Panel/Modal */}
        <AnimatePresence>
          {showTranslation && (
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-30 max-h-[50vh] flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <Sparkles size={16} className="text-indigo-500" />
                  <span>AI Translation</span>
                </div>
                <button 
                  onClick={closeTranslation}
                  className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Source Text */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Original Text</h3>
                  <p className="text-slate-700 leading-relaxed border-l-2 border-slate-200 pl-4 italic">
                    "{selectedText}"
                  </p>
                </div>

                {/* Translated Text */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-500">{targetLanguage}</h3>
                    {isTranslating && <span className="text-xs text-slate-400 animate-pulse">Translating...</span>}
                  </div>
                  
                  <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 min-h-[100px]">
                    {isTranslating ? (
                      <div className="space-y-2">
                        <div className="h-4 bg-indigo-100 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-indigo-100 rounded w-1/2 animate-pulse"></div>
                      </div>
                    ) : (
                      <p className="text-indigo-950 font-medium leading-relaxed text-lg">
                        {translatedText}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
