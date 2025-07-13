import { useState } from 'react';
import Sidebar from './Sidebar';
import StepProgress from './StepProgress';
import AnswerAnalytics from './AnswerAnalytics';

type ScreenType = 'progress' | 'answers';

function App() {
  const [screen, setScreen] = useState<ScreenType>('progress');

  return (
    <div className="flex h-screen">
      <Sidebar selected={screen} onSelect={setScreen} />
      <div className="flex-1 p-6 overflow-y-auto bg-gray-100">
        {screen === 'progress' && <StepProgress />}
        {screen === 'answers' && <AnswerAnalytics />}
      </div>
    </div>
  );
}

export default App;
