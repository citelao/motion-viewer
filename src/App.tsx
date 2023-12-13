import React from 'react';
import './App.css';

function App() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // const [ctx, setCtx] = React.useState<CanvasRenderingContext2D | null>(null);
  const onStart = React.useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d')!;
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 100, 100);
  }, []);

  return (
    <div className="App">
      <h1>Hello</h1>
      <button onClick={onStart}>Start</button>
      <canvas ref={canvasRef} width={500} height={500} />
    </div>
  );
}

export default App;
