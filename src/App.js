import React, { useState } from 'react';
import TavukolmioPeliApp from './TavukolmioPeliApp';
import IntroAnimation from './introAnimation'; // UUSI
import './App.css';

function App() {
  const [introDone, setIntroDone] = useState(false);

  return (
    <div className="App">
      {!introDone && <IntroAnimation onDone={() => setIntroDone(true)} />}
      <TavukolmioPeliApp show={introDone} />
    </div>
  );
}

export default App;
