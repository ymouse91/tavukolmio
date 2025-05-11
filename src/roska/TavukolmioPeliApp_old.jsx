import React, { useState, useEffect, useRef } from 'react';
import { wordList } from './wordList';
//import { tavukolmiot } from './tavukolmiot';
import { tavukolmiot } from './generoiTavukolmiot';

const usedTriangles = useRef(new Set());

const getFreshInitialBoard = () => {
  usedTriangles.current = new Set(); // tyhjennä käytetyt kolmiot
  const triangle = getRandomTriangle(usedTriangles.current);
  return {
    '8,4': { ...triangle, orientation: 'down', justPlaced: true }
  };
};

const getRandomTriangle = (used = new Set()) => {
  let index;
  do {
    index = Math.floor(Math.random() * tavukolmiot.length);
  } while (used.has(index) && used.size < tavukolmiot.length);
  used.add(index);
  const triangle = tavukolmiot[index];
  return {
    tavu1: triangle.tavut[0],
    tavu2: triangle.tavut[1],
    tavu3: triangle.tavut[2],
    pisteet: triangle.pisteet
  };
};

//const usedTriangles = new Set();

// Täysin yhteensopiva aiemman kanssa
const initialBoard = {
  '8,4': { ...getRandomTriangle(usedTriangles), orientation: 'down', justPlaced: true }
};

const generateHand = () => {
  const hand = [];
  while (hand.length < 6) {
    hand.push(getRandomTriangle(usedTriangles.current));
  }
  return hand;
};



function rotateTriangle(triangle) {
  return [
    { tavu1: triangle.tavu1, tavu2: triangle.tavu2, tavu3: triangle.tavu3, pisteet: triangle.pisteet },
    { tavu1: triangle.tavu3, tavu2: triangle.tavu1, tavu3: triangle.tavu2, pisteet: triangle.pisteet },
    { tavu1: triangle.tavu2, tavu2: triangle.tavu3, tavu3: triangle.tavu1, pisteet: triangle.pisteet },
  ];
}

const getNeighborOffsets = (orientation) => orientation === 'up'
  ? [ [-1, 0, 'left'], [1, 0, 'right'], [0, 1, 'base'] ]
  : [ [-1, 0, 'left'], [1, 0, 'right'], [0, -1, 'base'] ];

export default function TavukolmioPeliApp() {
//  const [board, setBoard] = useState(initialBoard);
const [board, setBoard] = useState(getFreshInitialBoard());

const [hands, setHands] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [selected, setSelected] = useState(null);
  const [info, setInfo] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  const [scores, setScores] = useState([0, 0, 0, 0]);
  const [gameOver, setGameOver] = useState(false);
  const [playerNames, setPlayerNames] = useState([]);
const [tempName, setTempName] = useState('');
const [currentNameIndex, setCurrentNameIndex] = useState(0);
const [showNameDialog, setShowNameDialog] = useState(true);
const [showHandDialog, setShowHandDialog] = useState(false);
const [handsToPlay, setHandsToPlay] = useState(null);
  const [players, setPlayers] = useState([]);
const [handsLeft, setHandsLeft] = useState(null); // Käsiä jäljellä
const [passesInARow, setPassesInARow] = useState(0); // Ohitusten laskuri



  const scrollRef = useRef(null);
  const side = 150;
  const height = Math.sqrt(3) / 2 * side;
useEffect(() => {
  const style = document.createElement('style');
  style.innerHTML = `
    html, body, #root {
      margin: 0;
      padding: 0;
      height: 100%;
    }
  `;
  document.head.appendChild(style);
  return () => {
    document.head.removeChild(style);
  };
}, []);

  useEffect(() => {
    setInfo({ location: '8,4', ...initialBoard['8,4'] });
    const container = scrollRef.current;
    if (container) {
      const tileWidth = side / 2;
      const tileHeight = height;
      const x = 150 + 8 * tileWidth;
      const y = 150 + 4 * tileHeight;
      container.scrollLeft = x - container.clientWidth / 2;
      container.scrollTop = y - container.clientHeight / 2;
    }
  }, [side, height]);

  const handleSelect = (triangle) => {
    setSelected(triangle);
  };

  const handlePass = () => {
  setSelected(null);
  const nextPlayer = (currentPlayer + 1) % players.length;
  setCurrentPlayer(nextPlayer);

  setPassesInARow(prev => {
    const newCount = prev + 1;

    // Jos kaikki ohittavat
    if (newCount >= players.length) {
      if (handsLeft > 1) {
        setHands(Array(players.length).fill().map(() => generateHand()));
        setHandsLeft(handsLeft - 1);
        setPassesInARow(0);
      } else {
        setGameOver(true);
      }
    }

    return newCount;
  });
};

  const handleEndGame = () => {
  if (players.length === 0) {
    // Ei pelaajia → palataan alkuun
    setShowNameDialog(true);
    setShowHandDialog(false);
    return;
  }

  const hasAnyPoints = scores.some(score => score > 0);
  if (!hasAnyPoints) {
    // Pelaajat on annettu mutta kukaan ei pelannut → palataan alkuun
 //setBoard(initialBoard);
 const freshBoard = getFreshInitialBoard();
setBoard(freshBoard);
setInfo({ location: '8,4', ...freshBoard['8,4'] });

setHands([]);
setScores([]);
setPlayerNames([]);
setPlayers([]);
setCurrentPlayer(0);
setSelected(null);
setLastMove(null);
setInfo(null);
setGameOver(false);
setShowNameDialog(true);
setShowHandDialog(false);
setTempName('');
setCurrentNameIndex(0);
setHandsToPlay(null);
setHandsLeft(null);
setPassesInARow(0);

    return;
  }

  // Muuten näytetään normaalisti tulosdialogi
  setGameOver(true);
};

  const handleDialogClose = () => {
    window.location.reload();
  };

  const oppositeSide = { left: 'right', right: 'left', base: 'base' };

  const handleBoardClick = (q, r) => {
    const orientation = (q + r) % 2 === 0 ? 'up' : 'down';
    const key = `${q},${r}`;
    if (board[key] || !selected) return;

    let bestMatch = null;
    let bestTotal = 0;
    let bestWords = [];

    for (let i = 0; i < 3; i++) {
      const rotation = rotateTriangle(selected)[i];
      const triSides = orientation === 'up'
        ? { left: rotation.tavu1, right: rotation.tavu2, base: rotation.tavu3 }
        : { left: rotation.tavu2, right: rotation.tavu1, base: rotation.tavu3 };

      const neighborOffsets = getNeighborOffsets(orientation);
      for (const [dq, dr, ownSide] of neighborOffsets) {
        const nq = q + dq;
        const nr = r + dr;
        const nkey = `${nq},${nr}`;
        const neighbor = board[nkey];
        if (!neighbor) continue;

        const neighborOrientation = (nq + nr) % 2 === 0 ? 'up' : 'down';
        const nSides = neighborOrientation === 'up'
          ? { left: neighbor.tavu1, right: neighbor.tavu2, base: neighbor.tavu3 }
          : { left: neighbor.tavu2, right: neighbor.tavu1, base: neighbor.tavu3 };

        const a = triSides[ownSide];
        const neighborSide = oppositeSide[ownSide];
        const b = nSides[neighborSide];
        const word1 = a + b;
        const word2 = b + a;

        if (wordList.has(word1) || wordList.has(word2)) {
          const total = rotation.pisteet + neighbor.pisteet;
          if (total > bestTotal) {
            bestMatch = {
              rotated: rotation,
              orientation,
              position: key
            };
            bestTotal = total;
            bestWords = [word1, word2].filter(w => wordList.has(w));
          }
        }
      }
    }

    if (bestMatch) {
      setPassesInARow(0); // Nollaa ohitukset kun joku pelasi
      const newBoard = { ...board };
      Object.keys(newBoard).forEach(k => newBoard[k].justPlaced = false);
      newBoard[bestMatch.position] = { ...bestMatch.rotated, orientation: bestMatch.orientation, justPlaced: true };

      const newHands = [...hands];
      newHands[currentPlayer] = newHands[currentPlayer].filter(t => t !== selected);
      const newScores = [...scores];
      newScores[currentPlayer] += bestTotal;

      setBoard(newBoard);
      setHands(newHands);
      setSelected(null);
      setInfo({ location: bestMatch.position, ...bestMatch.rotated });
      setScores(newScores);
      setLastMove({ word: bestWords.join(', '), earned: bestTotal, total: newScores[currentPlayer], player: currentPlayer, position: bestMatch.position });
      const everyoneOutOfCards = newHands.every(hand => hand.length === 0);
if (everyoneOutOfCards) {
  if (handsLeft > 1) {
    setHands(Array(players.length).fill().map(() => generateHand()));
    setHandsLeft(handsLeft - 1);
  } else {
    setGameOver(true);
  }
}

      setCurrentPlayer((currentPlayer + 1) % players.length);
    }
  };

  const trianglePoints = (x, y, orientation, side) => {
    const height = Math.sqrt(3) / 2 * side;
    return orientation === 'up'
      ? `${x},${y + height} ${x + side / 2},${y} ${x + side},${y + height}`
      : `${x},${y} ${x + side / 2},${y + height} ${x + side},${y}`;
  };

  const styles = {
    container: { fontFamily: 'sans-serif' },
    topBar: { position: 'sticky', top: 0, backgroundColor: '#fef08a', padding: 10, zIndex: 10, display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ccc' },
    moveBar: { position: 'sticky', top: 40, backgroundColor: '#bbf7d0', padding: 8, zIndex: 9 },
    handArea: { position: 'sticky', top: 80, background: '#fff', padding: 8, zIndex: 8, borderBottom: '1px solid #ccc' },
    boardArea: { width: '100%', height: '70vh', overflow: 'scroll', backgroundColor: '#f9fafb' },
    handCards: { display: 'flex', gap: 8, flexWrap: 'wrap' },
    card: { border: '1px solid #ccc', padding: '6px 10px', backgroundColor: 'white', borderRadius: 4, cursor: 'pointer' },
    selectedCard: { backgroundColor: '#dbeafe', borderColor: '#60a5fa' },
    boardBg: { backgroundColor: '#f3f4f6' }
  };

  const sortedScores = scores
    .map((score, idx) => ({ player: idx + 1, score }))
    .sort((a, b) => b.score - a.score);

  return (
    <div style={styles.container}>
	{showNameDialog && (
  <div style={{
    position: 'fixed', top: '30%', left: '30%', width: '40%',
    backgroundColor: 'white', border: '2px solid #888',
    padding: 20, zIndex: 1000
  }}>
    <h3>Syötä pelaajan {currentNameIndex + 1} nimi:</h3>
    <input
      type="text"
      value={tempName}
      onChange={e => setTempName(e.target.value)}
      style={{ width: '100%', marginBottom: 10 }}
    />
 <button
  onClick={() => {
    if (tempName.trim() === '') {
      // Nimensyöttö loppuu, jos jotain nimiä on jo annettu
      if (playerNames.length > 0) {
        setShowNameDialog(false);
        setShowHandDialog(true);
        setPlayers(playerNames); // oikea lista
        setScores(Array(playerNames.length).fill(0));
        setHands(Array(playerNames.length).fill().map(() => generateHand()));
      }
    } else {
      // Lisää nimi listaan ja siirry seuraavaan
      setPlayerNames([...playerNames, tempName.trim()]);
      setTempName('');
      setCurrentNameIndex(currentNameIndex + 1);
    }
  }}
>
  OK
</button>


   

  </div>
)}

{showHandDialog && (
  <div style={{
    position: 'fixed', top: '30%', left: '30%', width: '40%',
    backgroundColor: 'white', border: '2px solid #888',
    padding: 20, zIndex: 1000
  }}>
    <h3>Kuinka monta kättä pelataan?</h3>
    {[1, 2, 3].map(n => (
      <button
        key={n}
        style={{ margin: 10 }}
      onClick={() => {
        setHandsToPlay(n);
        setHandsLeft(n); // <-- TÄMÄ LISÄTÄÄN
        setShowHandDialog(false);
}}

      >
        {n} kä{n > 1 ? 'ttä' : 'si'}
      </button>
    ))}
  </div>
)}

      <div style={styles.topBar}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'Comic Sans MS, cursive, sans-serif' }}>
  TAVUKOLMIO
</div>

        <div>
   {players.map((name, idx) => (
  <span
    key={idx}
    style={{
      marginRight: 10,
      fontWeight: 'bold',
      fontFamily: 'Comic Sans MS, cursive, sans-serif',
      fontSize: '16px'
    }}
  >
    {name}: {scores[idx]} pistettä
  </span>
))}


          <button onClick={handleEndGame}>Lopeta peli</button>
        </div>
      </div>

      <div style={styles.moveBar}>
        {lastMove && (
          <>{players[lastMove.player] || `Pelaaja ${lastMove.player + 1}`} muodosti sanan: <strong>{lastMove.word}</strong> — Pisteitä: <strong>{lastMove.earned}</strong> — Yhteensä: <strong>{lastMove.total}</strong></>
        )}
      </div>

{players.length > 0 && hands.length > currentPlayer && (
  <div style={styles.handArea}>
    <div><strong>{players[currentPlayer]}</strong></div>
    <div style={styles.handCards}>
      {hands[currentPlayer].map((tri, i) => (
        <button
          key={i}
          style={selected === tri ? { ...styles.card, ...styles.selectedCard } : styles.card}
          onClick={() => handleSelect(tri)}>
          {tri.tavu1}, {tri.tavu2}, {tri.tavu3} ({tri.pisteet})
        </button>
      ))}
      <button style={styles.card} onClick={handlePass}>Ohita</button>
    </div>
  </div>
)}



      <div ref={scrollRef} style={styles.boardArea}>
        <svg width="2200" height="2200" style={styles.boardBg}>
          {[...Array(9)].map((_, r) => (
            [...Array(17)].map((_, q) => {
              const key = `${q},${r}`;
              const tri = board[key];
              const isMatched = lastMove?.position === key;
              const orientation = (q + r) % 2 === 0 ? 'up' : 'down';
              const isUp = orientation === 'up';
              const x = 150 + q * (side / 2);
              const y = 150 + r * height;
              const points = trianglePoints(x, y, orientation, side);

              let tavut = isUp
                ? [tri?.tavu1, tri?.tavu2, tri?.tavu3]
                : [tri?.tavu2, tri?.tavu1, tri?.tavu3];

              const fillColor = tri?.justPlaced ? '#34d399' : tri ? '#fef08a' : '#f3f4f6';
              const strokeColor = isMatched ? '#065f46' : '#ccc';

              const offset = isUp ? 12 : 6;
              return (
                <g key={key} onClick={() => handleBoardClick(q, r)}>
                  <polygon points={points} fill={fillColor} stroke={strokeColor} strokeWidth={isMatched ? 3 : 1} />
                  {tri && (
                    <>
                      <text x={x + side * 0.33 + offset} y={y + height * 0.5} textAnchor="middle" fontSize="16">{tavut[0]}</text>
                      <text x={x + side * 0.67 - offset} y={y + height * 0.5} textAnchor="middle" fontSize="16">{tavut[1]}</text>
                      <text x={x + side / 2} y={isUp ? y + height * 0.9 : y + height * 0.15} textAnchor="middle" fontSize="16">{tavut[2]}</text>
                      <text x={x + side / 2} y={isUp ? y + height * 0.7 : y + height * 0.45} textAnchor="middle" fontSize="24" fontWeight="bold">{tri.pisteet}</text>
                    </>
                  )}
                </g>
              );
            })
          ))}
        </svg>
      </div>

      {gameOver && (
        <div style={{ position: 'fixed', top: '20%', left: '25%', width: '50%', backgroundColor: 'white', border: '2px solid #888', padding: 20, zIndex: 100 }}>
          <h2>Peli päättyi</h2>
          <ol>
            {sortedScores.map(({ player, score }) => (
  <li key={player}>
    {players[player - 1] || `Pelaaja ${player}`}:
    {score} pistettä
  </li>
))}

          </ol>
          <button onClick={handleDialogClose}>OK</button>
        </div>
      )}
    </div>
  );
}
