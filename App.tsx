import React, { useState } from 'react';
import Scene from './components/Scene';
import UI from './components/UI';
import { AppState } from './types';

const App: React.FC = () => {
  // Start in TREE_SHAPE for initial impact, or SCATTERED for drama. Let's do Tree.
  const [appState, setAppState] = useState<AppState>(AppState.TREE_SHAPE);

  return (
    <div className="w-full h-screen relative bg-[#000504]">
      <UI appState={appState} setAppState={setAppState} />
      <Scene appState={appState} />
    </div>
  );
};

export default App;