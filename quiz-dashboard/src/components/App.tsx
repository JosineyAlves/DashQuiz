import { useState } from 'react';
import Sidebar from './components/Sidebar';
import StepProgress from './components/StepProgress';
import AnswerAnalytics from './components/AnswerAnalytics';

function App() {
  const [screen, setScreen] = useState('etapas');

  return (
    <div className="flex h-screen">
      <Sidebar selected={screen} onSelect={setScreen} />
      <div className="flex-1 p-6 overflow-y-auto bg-gray-100">
        {screen === 'etapas' && <StepProgress />}
        {screen === 'respostas' && <AnswerAnalytics />}
      </div>
    </div>
  );
}

export default App;
