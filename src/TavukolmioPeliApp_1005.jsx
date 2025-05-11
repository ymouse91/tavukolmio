import React, { useState, useEffect, useRef, useCallback } from 'react';
import { wordList } from './wordList';
//import { tavukolmiot } from './tavukolmiot';
import { tavukolmiot } from './generoiTavukolmiot';

const startKey = '10,6';
const [startQ, startR] = startKey.split(',').map(Number);


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


const generateHand = () => {
  const hand = [];
  while (hand.length < 6) {
    hand.push(getRandomTriangle());
  }
  return hand;
};
// uusi versi kädestä



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
  /*const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

    useEffect(() => {
    const updateHeight = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);*/
  const handlePlayerInput = () => {
  if (tempName.trim() === '') {
    if (playerNames.length > 0) {
      setShowNameDialog(false);
      setShowHandDialog(true);
      setPlayers(playerNames);
      setScores(Array(playerNames.length).fill(0));
      setHands(Array(playerNames.length).fill().map(() => generateHand()));
    }
  } else {
    setPlayerNames([...playerNames, tempName.trim()]);
    setTempName('');
    setCurrentNameIndex(currentNameIndex + 1);
  }
};

  const usedTriangles = useRef(new Set());

  const getRandomTriangle = () => {
    const used = usedTriangles.current;
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

const getFreshInitialBoard = useCallback(() => {
    usedTriangles.current = new Set();
    const triangle = getRandomTriangle();
    return {
      [startKey]: { ...triangle, orientation: 'down', justPlaced: true }
    };
  }, []);

  
  //const [info, setInfo] = useState(null);
  const [showNewHandDialog, setShowNewHandDialog] = useState(false);
  const [isLastHand, setIsLastHand] = useState(false);

  const [handsToPlay, setHandsToPlay] = useState(null);

const [board, setBoard] = useState(getFreshInitialBoard());
const [hands, setHands] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [selected, setSelected] = useState(null);
    const [lastMove, setLastMove] = useState(null);
  const [scores, setScores] = useState([0, 0, 0, 0]);
  const [gameOver, setGameOver] = useState(false);
  const [playerNames, setPlayerNames] = useState([]);
const [tempName, setTempName] = useState('');
const [currentNameIndex, setCurrentNameIndex] = useState(0);
const [showNameDialog, setShowNameDialog] = useState(true);
const [showHandDialog, setShowHandDialog] = useState(false);
  const [players, setPlayers] = useState([]);
const [handsLeft, setHandsLeft] = useState(null); // Käsiä jäljellä
const [, setPassesInARow] = useState(0); // korjaus!
//const [passesInARow, setPassesInARow] = useState(0); // Ohitusten laskuri



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
  if (scrollRef.current) {
    const container = scrollRef.current;
    //const centerX = 2200 / 2 - container.clientWidth / 2;
    //const centerY = 2200 / 2 - container.clientHeight / 2;
   container.scrollTo({
  left: 150 + startQ * (side / 2) - container.clientWidth / 2,
  top: 150 + startR * height - container.clientHeight / 2,
  behavior: 'instant'
});
  }
}, [height]);

useEffect(() => {
  const freshBoard = getFreshInitialBoard();
  setBoard(freshBoard);

  const container = scrollRef.current;
  if (container) {
    const tileWidth = side / 2;
    const tileHeight = height;
    const [startQ, startR] = startKey.split(',').map(Number);
    const x = 150 + startQ * tileWidth;
    const y = 150 + startR * tileHeight;

    // ✅ Keskitetään aloituskolmion visuaalinen keskipiste
    container.scrollLeft = x + side / 2 - container.clientWidth / 2;
    container.scrollTop = y - container.clientHeight / 2;
  }
}, [side, height, getFreshInitialBoard]);

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
    setShowNewHandDialog(true);
    setIsLastHand(handsLeft - 1 === 1);
        setHandsLeft(handsLeft - 1);
        setPassesInARow(0);
      } else {
        setGameOver(true);
      }
    }

    return newCount;
  }
  );
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
  const freshBoard = getFreshInitialBoard();
  setBoard(freshBoard);
  setHands([]);
  setScores([]);
  setPlayerNames([]);
  setPlayers([]);
  setCurrentPlayer(0);
  setSelected(null);
  setLastMove(null);
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
      //setInfo({ location: bestMatch.position, ...bestMatch.rotated });
      setScores(newScores);
      setLastMove({ word: bestWords.join(', '), earned: bestTotal, total: newScores[currentPlayer], player: currentPlayer, position: bestMatch.position });
      const everyoneOutOfCards = newHands.every(hand => hand.length === 0);
if (everyoneOutOfCards) {
  if (handsLeft > 1) {
    setHands(Array(players.length).fill().map(() => generateHand()));
    setShowNewHandDialog(true);
    setIsLastHand(handsLeft - 1 === 1);
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
  container: {
    fontFamily: 'Inter, sans-serif',
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
    backgroundColor: '#fff',
  },

  topBar: {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    backgroundColor: '#fef3c7',
    padding: '10px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #ddd',
    height: '50px'
  },

  handArea: {
    position: 'sticky',
    top: 52,
    zIndex: 900,
    backgroundColor: '#fff',
    padding: '8px 16px',
    borderBottom: '1px solid #ddd'
  },

  handRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap'
  },

  playerName: {
    fontWeight: 'bold',
    fontSize: '20px',
	textTransform: 'uppercase'
  },

  card: {
  padding: '8px 12px',
  fontSize: '16px',
  fontWeight: 'bold',
  fontFamily: 'Inter, sans-serif',
  backgroundColor: '#f9fafb',
  border: '2px solid #e5e7eb',
  borderRadius: '8px',
  cursor: 'pointer',
  color: '#1f2937', // tumma harmaa teksti
  whiteSpace: 'nowrap'
},

  selectedCard: {
    backgroundColor: '#dbeafe',
    borderColor: '#60a5fa'
  },

  moveBar: {
    position: 'sticky',
    top: 110,
    zIndex: 800,
    backgroundColor: '#d1fae5',
    color: '#065f46',
    padding: '10px 16px',
    fontSize: '16px',
    fontWeight: 'bold',
    borderBottom: '1px solid #ccc',
    textAlign: 'center'
  },

  boardBg: {
    backgroundColor: '#f3f4f6'
  },

  dialog: {
    position: 'fixed',
    top: '30%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '350px',
    backgroundColor: 'white',
    border: '2px solid #888',
    padding: 20,
    zIndex: 1000,
    textAlign: 'center',
    fontFamily: 'Inter, sans-serif'
  },

  input: {
    width: '100%',
    maxWidth: '240px',
    fontSize: '18px',
    fontFamily: 'Inter, sans-serif',
    padding: '8px',
    display: 'block',
    margin: '0 auto 16px auto'
  },
  
  button: {
  padding: '8px 16px',
  fontSize: '16px',
  fontWeight: 'bold',
  fontFamily: 'Inter, sans-serif',
  backgroundColor: '#d1fae5', // moveBar-tausta
  border: '2px solid #34d399', // justPlaced-kolmion väri
  borderRadius: '6px',
  cursor: 'pointer',
  color: '#065f46', // tummanvihreä teksti (sama kuin moveBar-teksti)
  transition: 'background-color 0.2s ease'
},
topBarName: {
  fontWeight: 'bold',
  fontSize: '16px',
  marginRight: '10px',
  textTransform: 'uppercase'
}
};


  const sortedScores = scores
    .map((score, idx) => ({ player: idx + 1, score }))
    .sort((a, b) => b.score - a.score);

  return (
  <div style={styles.container}>

    {/* 1. TopBar */}
    <div style={styles.topBar}>
     <div style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: 'Comic Neue, Comic Sans MS, cursive, sans-serif' }}>
  TAVUKOLMIO
</div>
      <div>
{players.map((name, idx) => (
  <span key={idx} style={styles.topBarName}>
    {name}: {scores[idx]} pistettä
  </span>
))}
        {players.length > 0 && <button style={styles.button} onClick={handleEndGame}>Lopeta peli</button>}
      </div>
    </div>

    {/* 2. Dialogit */}
    {showNameDialog && (
      <div style={styles.dialog}>
        <h3>Syötä pelaajan {currentNameIndex + 1} nimi:</h3>
        <input
          type="text"
          value={tempName}
          onChange={e => setTempName(e.target.value)}
		  onKeyDown={e => {
           if (e.key === 'Enter') handlePlayerInput();
          }}
          style={styles.input}
        />
        <button style={styles.button} onClick={handlePlayerInput}>OK</button>
      </div>
    )}


    {showHandDialog && (
      <div style={styles.dialog}>
        <h3>Kuinka monta kättä pelataan?</h3>
        {[1, 2, 3].map(n => (
          <button key={n} style={{ ...styles.button, margin: 10 }} onClick={() => {
            setHandsToPlay(n);
            setHandsLeft(n);
            setShowHandDialog(false);
          }}>{n} kä{n > 1 ? 'ttä' : 'si'}</button>
        ))}
      </div>
    )}

    {showNewHandDialog && (
      <div style={styles.dialog}>
        <h2>Uusi käsi alkaa</h2>
        <p>{isLastHand ? "Tämä on pelin viimeinen käsi." : "Pelaajille on jaettu uusi käsi."}</p>
        <button style={styles.button} onClick={() => setShowNewHandDialog(false)}>OK</button>
      </div>
    )}

    {gameOver && (
      <div style={styles.dialog}>
        <h2>Peli päättyi</h2>
        <ol style={{ padding: 0, listStylePosition: 'inside' }}>
          {sortedScores.map(({ player, score }) => (
            <li key={player} style={{ fontSize: '18px', marginBottom: '6px' }}>
              {players[player - 1] || `Pelaaja ${player}`}: {score} pistettä
            </li>
          ))}
        </ol>
        <button style={{ ...styles.button, marginTop: '16px' }} onClick={handleDialogClose}>OK</button>
      </div>
    )}

    {/* 3. HandArea ja MoveBar näkyviin vasta kun peli alkanut */}
    {players.length > 0 && hands.length > 0 && handsToPlay > 0 && (
      <>
        <div style={styles.handArea}>
          <div style={styles.handRow}>
            <span style={styles.playerName}>{players[currentPlayer]}:</span>
            {hands[currentPlayer].map((tri, i) => (
              <button
                key={i}
                style={selected === tri ? { ...styles.card, ...styles.selectedCard } : styles.card}
                onClick={() => handleSelect(tri)}
              >
                {tri.tavu1}, {tri.tavu2}, {tri.tavu3} ({tri.pisteet})
              </button>
            ))}
            <button style={styles.card} onClick={handlePass}>Ohita</button>
          </div>
        </div>

        <div style={styles.moveBar}>
          {lastMove ? (
            <>
              {players[lastMove.player] || `Pelaaja ${lastMove.player + 1}`} muodosti sanan:
              <strong> {lastMove.word}</strong> — Pisteitä: <strong>{lastMove.earned}</strong> — Yhteensä: <strong>{lastMove.total}</strong>
            </>
          ) : (
            <>Peli alkaa — odotetaan ensimmäistä siirtoa...</>
          )}
        </div>
      </>
    )}

    {/* 4. Pelilauta */}
    <div
      ref={scrollRef}
      style={{
        position: 'relative',
        width: '100%',
        height: 'calc(100vh - 170px)',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        backgroundColor: '#f9fafb'
      }}
    >
      <svg
        width="2200"
        height="2200"
        style={{ display: 'block', backgroundColor: '#f9fafb' }}
      >
 {[...Array(13)].map((_, r) => (
            [...Array(21)].map((_, q) => {
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
                      <text x={x + side * 0.33 + offset} y={y + height * 0.5} textAnchor="middle" fontSize="16" fontWeight="bold" fontFamily="Inter, sans-serif">{tavut[0]}</text>
                      <text x={x + side * 0.67 - offset} y={y + height * 0.5} textAnchor="middle" fontSize="16" fontWeight="bold" fontFamily="Inter, sans-serif">{tavut[1]}</text>
                      <text x={x + side / 2} y={isUp ? y + height * 0.9 : y + height * 0.15} textAnchor="middle" fontSize="16" fontWeight="bold" fontFamily="Inter, sans-serif">{tavut[2]}</text>
                      <text x={x + side / 2} y={isUp ? y + height * 0.75 : y + height * 0.40} textAnchor="middle" fontSize="24" fontWeight="bold" fontFamily="Inter, sans-serif" fill="#000" stroke="#000"  strokeWidth="0.5" paintOrder="stroke">{tri.pisteet}</text>
                    </>
                  )}
                </g>
              );
            })
          ))}

      </svg>
    </div>
  </div>
);


}