import React from 'react';
import { Search, Mic, FileText, Video, LayoutDashboard } from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

const NavItem = ({ 
    active, 
    onClick, 
    icon: Icon, 
    label 
}: { 
    active: boolean; 
    onClick: () => void; 
    icon: any; 
    label: string; 
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <Icon size={20} className={active ? 'text-white' : 'text-slate-500 group-hover:text-white'} />
    <span className="font-medium">{label}</span>
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-4 shrink-0">
      <div className="flex items-center gap-3 px-2 mb-8 mt-2">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="text-white w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">ColdCall Pro</h1>
      </div>

      <nav className="space-y-2 flex-1">
        <NavItem
            active={currentView === AppView.RESEARCH}
            onClick={() => onViewChange(AppView.RESEARCH)}
            icon={Search}
            label="Prospect Intel"
        />
        <NavItem
            active={currentView === AppView.SCRIPTING}
            onClick={() => onViewChange(AppView.SCRIPTING)}
            icon={FileText}
            label="Script Architect"
        />
        <NavItem
            active={currentView === AppView.ROLEPLAY}
            onClick={() => onViewChange(AppView.ROLEPLAY)}
            icon={Mic}
            label="Live Roleplay"
        />
        <NavItem
            active={currentView === AppView.ANALYSIS}
            onClick={() => onViewChange(AppView.ANALYSIS)}
            icon={Video}
            label="Call Analysis"
        />
      </nav>

      <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 mt-auto">
        <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">System Online</span>
        </div>
        <p className="text-xs text-slate-500">Gemini 3 Pro & Flash Active</p>
      </div>
    </div>
  );
};
