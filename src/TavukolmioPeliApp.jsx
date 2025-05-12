// Täydellinen TavukolmioPeliApp – sisältää pelilaudan, pisteet ja vuorot

import React, { useState, useEffect, useRef } from 'react';
import { wordList } from './wordList';
import { tavukolmiot } from './generoiTavukolmiot';
import './TavukolmioPeliApp.css'; // Lisätty tyylitiedosto


const startKey = '10,6';
const [startQ, startR] = startKey.split(',').map(Number);



const rotateTriangle = (triangle) => [
  { tavu1: triangle.tavu1, tavu2: triangle.tavu2, tavu3: triangle.tavu3, pisteet: triangle.pisteet },
  { tavu1: triangle.tavu3, tavu2: triangle.tavu1, tavu3: triangle.tavu2, pisteet: triangle.pisteet },
  { tavu1: triangle.tavu2, tavu2: triangle.tavu3, tavu3: triangle.tavu1, pisteet: triangle.pisteet }
];

const getNeighborOffsets = (orientation) => orientation === 'up'
  ? [[-1, 0, 'left'], [1, 0, 'right'], [0, 1, 'base']]
  : [[-1, 0, 'left'], [1, 0, 'right'], [0, -1, 'base']];

const trianglePoints = (x, y, orientation, side) => {
  const height = Math.sqrt(3) / 2 * side;
  return orientation === 'up'
    ? `${x},${y + height} ${x + side / 2},${y} ${x + side},${y + height}`
    : `${x},${y} ${x + side / 2},${y + height} ${x + side},${y}`;
};

const oppositeSide = { left: 'right', right: 'left', base: 'base' };

export default function TavukolmioPeliApp({ show }) {

  const [löydetytSanat, setLöydetytSanat] = useState([]);
  const [näytäSanatDialog, setNäytäSanatDialog] = useState(false);

  const usedTriangles = useRef(new Set());
  const nameInputRef = useRef(null);
  const [hasCenteredOnce, setHasCenteredOnce] = useState(false);

  const getRandomTriangle = (used = new Set(), onlyLowValue = false) => {
    let index;
    let attempts = 0;
    do {
      index = Math.floor(Math.random() * tavukolmiot.length);
      const tri = tavukolmiot[index];
      if (onlyLowValue && tri.pisteet > 2) continue;
      if (!used.has(index)) break;
      attempts++;
    } while (attempts < 500);
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
    let lowCount = 0;
    while (hand.length < 6) {
      const tri = getRandomTriangle(usedTriangles.current, lowCount < 3);
      hand.push(tri);
      if (tri.pisteet <= 2) lowCount++;
    }
    return hand;
  };
  const scrollRef = useRef(null);

  const [board, setBoard] = useState({});
  const [hands, setHands] = useState([]);
  const [scores, setScores] = useState([]);
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [selected, setSelected] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [tempName, setTempName] = useState('');
  const [playerNames, setPlayerNames] = useState([]);
  const [currentNameIndex, setCurrentNameIndex] = useState(0);
  const [showNameDialog, setShowNameDialog] = useState(true);
  const [showHandDialog, setShowHandDialog] = useState(false);
  const [handsToPlay, setHandsToPlay] = useState(null);
  const [handsLeft, setHandsLeft] = useState(null);
  const [passesInARow, setPassesInARow] = useState(0);
  const [showNewHandDialog, setShowNewHandDialog] = useState(false);
  const [showTriangleLimitDialog, setShowTriangleLimitDialog] = useState(false);

  const side = 150;
  const height = Math.sqrt(3) / 2 * side;
  
useEffect(() => {
    console.log("Kaikki tavukolmiot pelin alussa:", tavukolmiot);
  }, []);


useEffect(() => {
  if (hasCenteredOnce || !board[`${startQ},${startR}`]) return;

  const container = scrollRef.current;
  if (container) {
    const tileWidth = side / 2;
    const tileHeight = height;
    const x = 150 + startQ * tileWidth;
    const y = 150 + startR * tileHeight;
    container.scrollLeft = x + side / 2 - container.clientWidth / 2;
    container.scrollTop = y - container.clientHeight / 2;
    setHasCenteredOnce(true); // merkkaa että keskitys tehtiin
  }
}, [board, hasCenteredOnce, height]);

  
  useEffect(() => {
  if (showNameDialog && nameInputRef.current) {
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 100); // 100 ms on hyvä lähtökohta
  }
}, [showNameDialog]);
//
	  if (!show) return null; // Estää ennenaikaisen näkymisen

  const handlePlayerInput = () => {
    if (tempName.trim() === '') {
      if (playerNames.length > 0) {
        setShowNameDialog(false);
        setShowHandDialog(true);
        setPlayers(playerNames);
        setScores(Array(playerNames.length).fill(0));

      }
    } else {
      setPlayerNames([...playerNames, tempName.trim()]);
      setTempName('');
      setCurrentNameIndex(currentNameIndex + 1);
    }
  };

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
        const b = nSides[oppositeSide[ownSide]];
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
			bestWords.forEach(word => {
  if (!löydetytSanat.includes(word)) {
    setLöydetytSanat(prev => [...prev, word]);
  }
});

          }
        }
      }
    }

    if (bestMatch) {
      setPassesInARow(0);
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
      setScores(newScores);
      setLastMove({ word: bestWords.join(', '), earned: bestTotal, total: newScores[currentPlayer], player: currentPlayer, position: bestMatch.position });

    const everyoneOut = newHands.every(h => h.length === 0);
     /* if (everyoneOut) {
        if (handsLeft > 1) {
          const remainingTriangles = tavukolmiot.length - usedTriangles.current.size;
          const trianglesNeeded = players.length * 6;
          if (remainingTriangles >= trianglesNeeded) {
            const remainingTriangles = tavukolmiot.length - usedTriangles.current.size;
            const trianglesNeeded = players.length * 6;
            if (remainingTriangles >= trianglesNeeded) {
              const remainingTriangles = tavukolmiot.length - usedTriangles.current.size;
            const trianglesNeeded = players.length * 6;
            if (remainingTriangles >= trianglesNeeded) {
              setHands(Array(players.length).fill().map(() => generateHand()));
              setHandsLeft(handsLeft - 1);
              setShowNewHandDialog(true);
              setPassesInARow(0);
              return;
            } else {
              setShowTriangleLimitDialog(true);
              return;
            }
              setShowNewHandDialog(true);
              setPassesInARow(0);
              return;
            } else {
              setShowTriangleLimitDialog(true);
              return;
            }
            setShowNewHandDialog(true);
            return;
          } else {
            setShowTriangleLimitDialog(true);
            return;
          }
        } else {
          setGameOver(true);
        }
      }
*/
if (everyoneOut) {
  if (handsLeft > 1) {
    const remainingTriangles = tavukolmiot.length - usedTriangles.current.size;
    const trianglesNeeded = players.length * 6;

    if (remainingTriangles >= trianglesNeeded) {
      setHands(Array(players.length).fill().map(() => generateHand()));
      setHandsLeft(handsLeft - 1);
      setShowNewHandDialog(true);
      setPassesInARow(0);
    } else {
      setShowTriangleLimitDialog(true);
    }
  } else {
    setGameOver(true);
  }
}

      setCurrentPlayer((currentPlayer + 1) % players.length);
    }
  };

  return (
    <div className="game-wrapper" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>

      {(showNameDialog || showHandDialog) ? (
        <>
          {showNameDialog && (
            <div className="dialog">
			<h1>TAVUKOLMIO</h1>
            <h2>Syötä pelaajien nimet</h2>
<input
  ref={nameInputRef}
  type="text"
  value={tempName}
  onChange={(e) => setTempName(e.target.value)}
  onKeyDown={(e) => e.key === 'Enter' && handlePlayerInput()}
  placeholder={`Pelaaja ${playerNames.length + 1}`}
/>
              <br />
              <button onClick={handlePlayerInput}>OK</button>
              {playerNames.length > 0 && <p>Enter ilman nimeä lopettaa lisäyksen</p>}
            </div>
          )}

          {showHandDialog && (
            <div className="dialog">
              <h2>Kuinka monta kättä pelataan?</h2>
              {[1, 2, 3].map(n => (
                <button key={n} onClick={() => {
                  setHandsToPlay(n);
                  setHandsLeft(n);
                  setShowHandDialog(false);
				  
				  const newHands = Array(playerNames.length).fill().map(() => generateHand());
                  setHands(newHands);
                  const triangle = getRandomTriangle(usedTriangles.current, true);
                  setBoard({ [startKey]: { ...triangle, orientation: 'down', justPlaced: true } });
				  
                }}>{n} kä{n > 1 ? 'ttä' : 'si'}</button>
              ))}
            </div>
          )}
        </>
      ) : null}

     {!showNameDialog && !showHandDialog && !gameOver && players.length > 0 && (
        <div className="top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>
        Pisteet: {players.map((p, i) => `${p.toUpperCase()} ${scores[i]}`).join(' | ')}
       </span>

       <button onClick={() => setGameOver(true)}>Lopeta peli</button>
        </div>
      )}
	  
	  
	      <div className="app-container">
      {/* Peli päättyi -dialogi */}
      {gameOver && (
        <div className="dialog">
          <h2>Peli päättyi</h2>
          <ol>
            {players.map((name, idx) => (
              <li key={idx}>{name}: {scores[idx]} pistettä</li>
            ))}
          </ol>
          <button onClick={() => setNäytäSanatDialog(true)}>Näytä sanat</button>
          <button onClick={() => window.location.reload()}>Aloita uusi peli</button>
        </div>
      )}

      {/* Sanalista-dialogi */}
      {näytäSanatDialog && (
        <div className="dialog">
          <h2>Löydetyt sanat</h2>
          <div style={{ maxHeight: '300px', overflowY: 'auto', textAlign: 'left' }}>
            {löydetytSanat.map((sana, i) => (
              <div key={i}>{sana}</div>
            ))}
          </div>
          <button onClick={() => setNäytäSanatDialog(false)}>OK</button>
        </div>
      )}
    </div>
{players.length > 0 && handsToPlay > 0 && (

      <div ref={scrollRef} style={{ height: '80vh', overflow: 'auto' }}>
        <svg width={2200} height={2200}>
          {[...Array(13)].map((_, r) => (
            [...Array(21)].map((_, q) => {
              const key = `${q},${r}`;
              const tri = board[key];
              const orientation = (q + r) % 2 === 0 ? 'up' : 'down';
              const x = 150 + q * (side / 2);
              const y = 150 + r * height;
              const points = trianglePoints(x, y, orientation, side);
              const isMatched = lastMove?.position === key;
              let tavut = orientation === 'up'
                ? [tri?.tavu1, tri?.tavu2, tri?.tavu3]
                : [tri?.tavu2, tri?.tavu1, tri?.tavu3];

              const fill = tri?.justPlaced ? '#34d399' : tri ? '#fef08a' : '#f3f4f6';
              const stroke = isMatched ? '#065f46' : '#ccc';

              return (
                <g key={key} onClick={() => handleBoardClick(q, r)}>
                  <polygon points={points} fill={fill} stroke={stroke} strokeWidth={isMatched ? 3 : 1} />
                  {tri && (
                    <>
                      <text x={x + side * 0.34} y={y + height * 0.55} textAnchor="middle" fontSize="16" fontWeight="bold">{tavut[0]}</text>
                      <text x={x + side * 0.66} y={y + height * 0.55} textAnchor="middle" fontSize="16" fontWeight="bold">{tavut[1]}</text>
                      <text x={x + side / 2} y={orientation === 'up' ? y + height * 0.9 : y + height * 0.15} textAnchor="middle" fontSize="16" fontWeight="bold">{tavut[2]}</text>
                      <text x={x + side / 2} y={orientation === 'up' ? y + height * 0.75 : y + height * 0.4} textAnchor="middle" fontSize="24" fontWeight="bold" fill="#000" stroke="#000" strokeWidth="0.5">{tri.pisteet}</text>
                    </>
                  )}
                </g>
              );
            })
          ))}
        </svg>
      {showNewHandDialog && (
        <div className="dialog">
          <h2>Uusi käsi alkaa</h2>
          <p>{handsLeft === 1 ? "Tämä on pelin viimeinen käsi." : "Pelaajille on jaettu uusi käsi."}</p>
          <button onClick={() => setShowNewHandDialog(false)} onKeyDown={(e) => { if (e.key === 'Enter') setShowNewHandDialog(false); }}>OK</button>
        </div>
      )}

      {showTriangleLimitDialog && (
        <div className="dialog">
          <h2>Peli päättyi</h2>
          <p>Kolmioita ei ollut tarpeeksi uuteen käteen. Peli päättyy tähän.</p>
          <button onClick={() => { setGameOver(true); setShowTriangleLimitDialog(false); }} onKeyDown={(e) => { if (e.key === 'Enter') { setGameOver(true); setShowTriangleLimitDialog(false); } }}>OK</button>
        </div>
      )}

      </div>
	  
	  )} 

    {!gameOver && hands.length > 0 && !showNewHandDialog && (
  <div className="move-bar-wrapper">
  <div className="move-bar" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
<span style={{ fontWeight: 'bold' }}>
  {players[currentPlayer].toUpperCase()+':'}
</span>

    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {hands[currentPlayer] && hands[currentPlayer].map((tri, idx) => (
        <button
          key={idx}
          className={selected === tri ? 'selected' : ''}
          onClick={() => setSelected(tri)}
        >
          {tri.tavu1}-{tri.tavu2}-{tri.tavu3} ({tri.pisteet})
        </button>
      ))}
    </div>
    <button onClick={() => {
      const nextPlayer = (currentPlayer + 1) % players.length;
      const newPasses = passesInARow + 1;
      const everyoneOut = hands.every(h => h.length === 0);

      if (newPasses >= players.length && !everyoneOut) {
        const remainingTriangles = tavukolmiot.length - usedTriangles.current.size;
        const trianglesNeeded = players.length * 6;

        if (handsLeft > 1 && remainingTriangles >= trianglesNeeded) {
          setHands(Array(players.length).fill().map(() => generateHand()));
          setHandsLeft(handsLeft - 1);
          setShowNewHandDialog(true);
          setPassesInARow(0);
          return;
        } else if (handsLeft > 1) {
          setShowTriangleLimitDialog(true);
          return;
        } else {
          setGameOver(true);
          return;
        }
      } else {
        setPassesInARow(newPasses);
      }

      setSelected(null);
      setCurrentPlayer(nextPlayer);
    }}>Ohita vuoro</button>
  </div>
    {lastMove && (
    <div className="last-move-info">
      Edellinen: {players[lastMove.player]} sai {lastMove.earned} pistettä sanasta: {lastMove.word}
    </div>
     )}
  </div>

    )}
    </div>
  ); // return loppuu tähän
}
