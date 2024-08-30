import React from 'react';
import Board from './components/Board';
import './components/Board.css';

function App() {
  return (
    <div className="App">
      <h1 style={{ margin: 0, padding: '10px', height: '40px' }}>Mappy</h1>
      <div className="board-container">
        <Board />
      </div>
    </div>
  );
}

export default App;