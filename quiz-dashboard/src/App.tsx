// src/App.tsx
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import StepProgress from './components/StepProgress';
import AnswerAnalytics from './components/AnswerAnalytics';

function App() {
  const [selectedView, setSelectedView] = useState<'progress' | 'answers'>('progress');

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar selected={selectedView} onSelect={setSelectedView} />
      <main className="flex-1 p-6 overflow-y-auto">
        {selectedView === 'progress' && <StepProgress />}
        {selectedView === 'answers' && <AnswerAnalytics />}
      </main>
    </div>
  );
}

export default App;
