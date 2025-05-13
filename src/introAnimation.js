import { useEffect, useRef, useState } from 'react';

export default function IntroAnimation({ onDone }) {
  const canvasRef = useRef();
  const containerRef = useRef();
  const [fadingOut, setFadingOut] = useState(false);
  const startedRef = useRef(false); // lisätty counter

  useEffect(() => {
    
	if (startedRef.current) return;
    startedRef.current = true;

	
	const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const center = { x: 250, y: 250 };
    const radius = 130;
    const startTime = performance.now();
	
	const sideColors = ['#60a5fa', '#f87171', '#facc15']; // vasen, oikea, kanta
    const tavuColors = { kol: '#60a5fa', mi: '#f87171', o: '#facc15' };


    const points = [
      { x: center.x, y: center.y - radius },
      { x: center.x - radius * Math.sin(Math.PI / 3), y: center.y + radius / 2 },
      { x: center.x + radius * Math.sin(Math.PI / 3), y: center.y + radius / 2 }
    ];

    const tavuPos = [
      { text: 'kol', x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 },
      { text: 'mi',  x: (points[1].x + points[2].x) / 2, y: (points[1].y + points[2].y) / 2 },
      { text: 'o',   x: (points[2].x + points[0].x) / 2, y: (points[2].y + points[0].y) / 2 }
    ];

    function draw(time) {
      const elapsed = (time - startTime) / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const lift = 0 ;//Math.min(elapsed, 3) * -10;

      if (elapsed < 1) {
        const r = 5 + Math.sin(elapsed * 4 * Math.PI) * 2;
        ctx.beginPath();
        ctx.arc(center.x, center.y + lift, r, 0, 2 * Math.PI);
        ctx.fillStyle = '#333';
        ctx.fill();
      }

      if (elapsed >= 1) {
ctx.lineWidth = 8;
ctx.lineCap = 'round';
for (let i = 0; i < 3; i++) {
  if (elapsed >= 1 + (i * 0.33)) {
    const a = points[i];
    const b = points[(i + 1) % 3];
    ctx.beginPath();
    ctx.moveTo(a.x, a.y + lift);
    ctx.lineTo(b.x, b.y + lift);
    ctx.strokeStyle = sideColors[i];
    ctx.stroke();
  }
}


      }

      if (elapsed >= 2) {
        ctx.fillStyle = '#000';
        ctx.font = 'bold 20px "Comic Neue", sans-serif';
		ctx.fillStyle = '#000';
        tavuPos.forEach((t, i) => {
          if (elapsed >= 2 + i * 0.15) {
			
			tavuPos.forEach((t) => {
  let offsetY = 0;
  let offsetX = 0;

  if (t.text === 'kol') {
    offsetY = +20;
    offsetX = +5;
  } else if (t.text === 'mi') {
    offsetY = -20;
    offsetX = -10;
  } else if (t.text === 'o') {
    offsetY = +20;
    offsetX = -20;
  }

  ctx.fillStyle = tavuColors[t.text]; // asetetaan väri tavuittain
 ctx.fillText(t.text.toUpperCase(), t.x + offsetX, t.y + lift + offsetY);
 
});
          }
        });
      }

  if (elapsed >= 2.5) {
  let score = 1;
  if (elapsed >= 4.5) score = 3;
  else if (elapsed >= 3.5) score = 2;

  const bounce = Math.sin((elapsed - 2.5) * Math.PI * 2) * 10;
  ctx.font = 'bold 36px "Comic Neue", sans-serif';
  ctx.fillStyle = '#000'; // aina musta väri numerolle
  ctx.fillText(score.toString(), center.x -5 , center.y + 10 + bounce + lift);
}


if (elapsed < 5.5) {
  requestAnimationFrame(draw);
} else {
  if (!fadingOut) {
    setFadingOut(true);
    containerRef.current.style.opacity = 0;
    setTimeout(() => {
      onDone();
    }, 500); // fade duration
  }
}

    }

    requestAnimationFrame(draw);
  }, [onDone, fadingOut]);

  return (
    <div
      ref={containerRef}
      style={{
        transition: 'opacity 0.5s ease',
        opacity: 1,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f9f9f9',
      }}
    >
      <canvas ref={canvasRef} width={500} height={500} />
    </div>
  );
}
