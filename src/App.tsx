import React from 'react';
import './App.css';

function App() {
  const dummyCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const finalCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  
  const animRef = React.useRef<number | null>(null);

  const [hasStarted, setHasStarted] = React.useState(false);
  const frames = React.useRef<Uint8ClampedArray[]>([]);
  const delay = React.useRef<number>(2);

  // const renderFrame = (time: number) => {
  //   setTest(test + 5);
  // };

  const renderFrame = (time: number) => {
    const finalCtx = finalCanvasRef.current?.getContext('2d')!;

    // Debug
    finalCtx.fillStyle = 'red';
    finalCtx.fillRect(0, 0, 100, 100);

    // console.log(frames);
    if ((frames.current || []).length > delay.current)
    {
      // https://stackoverflow.com/questions/39048227/html5-canvas-invert-color-of-pixels
      // TODO: https://stackoverflow.com/questions/7721898/is-putimagedata-faster-than-drawimage
      const data = frames.current[delay.current];
      for (var i = 0; i < data.length; i += (i % 4 === 2 ? 2 : 1)) {
        // if (i % 4 === 3) {
        //   data[i] = 20;
        //   continue;
        // }
        data[i] = 255 - data[i];
      }
      finalCtx.putImageData(new ImageData(frames.current[delay.current], 500, 500), 0, 0);
    }

    finalCtx.globalAlpha = 0.5;
    finalCtx.drawImage(videoRef.current!, 0, 0, 500, 500);
    finalCtx.globalAlpha = 1;


    // Debug
    finalCtx.fillStyle = 'blue';
    finalCtx.fillRect(20, 0, 100, 100);

    // Save the current frame for next iteration
    // https://stackoverflow.com/questions/44218203/how-to-copy-canvas-image-data-to-some-other-variable
    const ctx = dummyCanvasRef.current?.getContext('2d')!;
    ctx.drawImage(videoRef.current!, 0, 0, 500, 500);
    const frameData = ctx.getImageData(0, 0, 500, 500);
    const copy = Uint8ClampedArray.from(frameData.data);
    frames.current = [copy, ...(frames.current || [])];
    if (frames.current.length > delay.current + 1) {
      frames.current.pop();
    }

    animRef.current = requestAnimationFrame(renderFrame);
  };

  const onStart = async () => {
    if (hasStarted) {
      return;
    }

    setHasStarted(true);
    const ctx = dummyCanvasRef.current?.getContext('2d')!;
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 100, 100);
    
    // https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API/Taking_still_photos
    // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Manipulating_video_using_canvas
    const stream = await navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();

      const finalCtx = finalCanvasRef.current?.getContext('2d')!;
      console.log(finalCtx);

      animRef.current = requestAnimationFrame(renderFrame);
    }
  };
  
  return (
    <div className="App">
    <h1>Hello</h1>
    <button onClick={onStart}>{hasStarted ? "Started" : "Start"}</button>

    <input type="text" onChange={(e) => {
      delay.current = parseInt(e.target.value);
    }} />

    <br />

    <canvas ref={finalCanvasRef} width={500} height={500} />
    <h2>debug {delay.current}</h2>
    <canvas ref={dummyCanvasRef} width={500} height={500} />
    <video ref={videoRef} playsInline />
    </div>
    );
  }
  
  export default App;
  