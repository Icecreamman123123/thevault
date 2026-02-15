import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Copy, Eye, EyeOff, Edit3, Trash2, Globe, ExternalLink, Check } from 'lucide-react';
import { useState } from 'react';
import { PasswordEntry } from '../lib/crypto';
import { listItem } from '../lib/motion-variants';

interface DashboardEntryProps {
  entry: PasswordEntry;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function DashboardEntry({ entry, isExpanded, onToggle, onEdit, onDelete }: DashboardEntryProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      variants={listItem}
      layout
      className={`bg-slate-800/40 border ${isExpanded ? 'border-emerald-500/30 ring-1 ring-emerald-500/20' : 'border-slate-700/50'} rounded-xl overflow-hidden transition-all hover:bg-slate-800/60`}
    >
      <div 
        className="p-4 flex items-center gap-4 cursor-pointer"
        onClick={onToggle}
      >
        <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-400">
          {entry.url ? <Globe className="w-5 h-5" /> : <div className="w-5 h-5 font-bold text-xs flex items-center justify-center">{entry.title[0].toUpperCase()}</div>}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium truncate">{entry.title}</h4>
          <p className="text-slate-400 text-sm truncate">{entry.username}</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); handleCopy(entry.password); }}
            className="p-2 text-slate-400 hover:text-emerald-400 transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
          {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-500" /> : <ChevronRight className="w-5 h-5 text-slate-500" />}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-t border-slate-700/50 bg-slate-900/20"
          >
            <div className="p-4 space-y-4">
              {entry.url && (
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Website</label>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-slate-300 truncate">{entry.url}</span>
                    <a href={entry.url.startsWith('http') ? entry.url : `https://${entry.url}`} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={onEdit}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
                >
                  <Edit3 className="w-4 h-4" /> Edit
                </button>
                <button 
                  onClick={onDelete}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
