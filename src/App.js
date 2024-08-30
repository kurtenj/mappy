import React from 'react';
import Board from './components/board';
import './app.css';

function App() {
  return (
    <div className="App">
      <div className="board-container">
        <Board />
      </div>
    </div>
  );
}

export default App;