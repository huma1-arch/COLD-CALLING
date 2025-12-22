import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ResearchTool } from './components/ResearchTool';
import { ScriptBot } from './components/ScriptBot';
import { RoleplaySim } from './components/RoleplaySim';
import { AnalysisTool } from './components/AnalysisTool';
import { AppView } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.RESEARCH);

  const renderContent = () => {
    switch (currentView) {
      case AppView.RESEARCH:
        return <ResearchTool />;
      case AppView.SCRIPTING:
        return <ScriptBot />;
      case AppView.ROLEPLAY:
        return <RoleplaySim />;
      case AppView.ANALYSIS:
        return <AnalysisTool />;
      default:
        return <ResearchTool />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0f172a] overflow-hidden text-slate-100 font-sans">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
             {/* Decorative gradients */}
            <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]" />
        </div>
        
        <div className="relative z-10 h-full">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
