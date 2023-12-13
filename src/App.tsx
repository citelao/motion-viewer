import React from 'react';
import './App.css';

function App() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  
  // const [ctx, setCtx] = React.useState<CanvasRenderingContext2D | null>(null);
  const onStart = React.useCallback(async () => {
    const ctx = canvasRef.current?.getContext('2d')!;
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 100, 100);
    
    // https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API/Taking_still_photos
    const stream = await navigator.mediaDevices
    .getUserMedia({ video: true, audio: false });
    
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }
  }, []);
  
  return (
    <div className="App">
    <h1>Hello</h1>
    <video ref={videoRef} />
    <button onClick={onStart}>Start</button>
    <canvas ref={canvasRef} width={500} height={500} />
    </div>
    );
  }
  
  export default App;
  