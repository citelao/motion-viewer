import React from 'react';
import './App.css';

function App() {
  const dummyCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const mixCanvasRef = React.useRef<HTMLCanvasElement>(null);
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
    // Adjust the width & height to the actual video size
    const width = videoRef.current!.videoWidth || 100;
    const height = videoRef.current!.videoHeight || 100;
    dummyCanvasRef.current!.width = width;
    dummyCanvasRef.current!.height = height;
    mixCanvasRef.current!.width = width;
    mixCanvasRef.current!.height = height;
    finalCanvasRef.current!.width = width;
    finalCanvasRef.current!.height = height;
    console.log(width, height);

    const finalCtx = finalCanvasRef.current?.getContext('2d')!;

    // Debug
    //
    // A nice pretty, pale, non-default blue as we load
    //
    // BTW I used this comment to try to get Copilot to generate a nice color,
    // but it refused.
    finalCtx.fillStyle = '#374f60';
    finalCtx.fillRect(0, 0, 100, 100);

    if (!videoRef.current!.videoWidth) {
      animRef.current = requestAnimationFrame(renderFrame);
      return;
    }

    const mixCtx = mixCanvasRef.current?.getContext('2d')!;

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
      mixCtx.putImageData(new ImageData(frames.current[delay.current], width, height), 0, 0);
    }

    // Draw to the video's size
    mixCtx.globalAlpha = 0.5;
    mixCtx.drawImage(videoRef.current!, 0, 0, width, height);
    mixCtx.globalAlpha = 1;
    
    // Final render
    const mixImage = mixCtx.getImageData(0, 0, width, height);
    finalCtx.putImageData(mixImage, 0, 0);

    // Save the current frame for next iteration
    // https://stackoverflow.com/questions/44218203/how-to-copy-canvas-image-data-to-some-other-variable
    const ctx = dummyCanvasRef.current?.getContext('2d')!;
    ctx.drawImage(videoRef.current!, 0, 0, width, height);
    const frameData = ctx.getImageData(0, 0, width, height);
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

      <canvas ref={finalCanvasRef} className="mainCanvas" width={500} height={500} />

      <section className="controls">
        {(!hasStarted) &&
        <>
          <h1>Hello!</h1>
          <p>Use your camera to detect motion:</p>
        </>
        }
        <button className="startButton" onClick={onStart}>{hasStarted ? "Started" : "Start"}</button>
        
        <label htmlFor="delay">Delay</label>
        <input type="text" id="delay" onChange={(e) => {
          delay.current = parseInt(e.target.value);
        }} placeholder={delay.current.toString()} />
      </section>


      <details>
        <summary>Debug</summary>
        <h2>Current delay: {delay.current}</h2>
        <canvas ref={dummyCanvasRef} width={500} height={500} />
        <video ref={videoRef} playsInline />
        <canvas ref={mixCanvasRef} width={500} height={500} />
      </details>
    </div>
    );
  }
  
  export default App;
  