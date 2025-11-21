import React, { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface InputFormProps {
  onProcess: (text: string) => void;
  isProcessing: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onProcess, isProcessing }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onProcess(text);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in-up">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-1 rounded-xl shadow-lg border border-slate-200">
          <div className="bg-slate-50/50 rounded-lg p-4">
            <label htmlFor="email-text" className="block text-sm font-semibold text-slate-600 mb-3 ml-1">
              Paste Shipment Email Content
            </label>
            <textarea
              id="email-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Example: 'Pickup in Miami, FL, deliver to Austin, TX. Weight is 40,000 lbs, 10 skids 48x40x48...'"
              className="w-full h-52 p-4 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-slate-800 placeholder-slate-400 transition-all text-base"
              disabled={isProcessing}
            />
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isProcessing || !text.trim()}
            className={`
              group relative flex items-center gap-3 px-8 py-3.5 rounded-full font-semibold text-lg shadow-md transition-all duration-300
              ${isProcessing || !text.trim() 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5'}
            `}
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Files
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};