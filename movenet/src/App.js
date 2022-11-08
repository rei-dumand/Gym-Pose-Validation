import './App.css';
import React, { useRef, useState, useEffect } from 'react';

import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
// Register one of the TF.js backends.
import '@tensorflow/tfjs-backend-webgl';
// import '@tensorflow/tfjs-backend-wasm';
import * as posenet from '@tensorflow-models/posenet';


import { drawKeypoints, drawSkeleton, flipHorizontal, updateArmAngle } from './utilities';


import Webcam from "react-webcam";
import { scatter_util } from '@tensorflow/tfjs-core';

function App() {

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [width] = useState(640 / 1.5);
  const [height] = useState(480 / 1.5);

  const tolerance = 0.3;

  const runMovenet = async () => {

    const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
    const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
    
    setInterval(() => {
      detect(detector)
    }, 50);
  };

  const detect = async (detector) => {
    if (typeof webcamRef.current !== "undefined" && webcamRef.current !== null && webcamRef.current.state.hasUserMedia === true) {
      const video = webcamRef.current.video;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      
      const pose = await detector.estimatePoses(video);
      // console.log(pose);
      
      drawCanvas(pose, video, videoWidth, videoHeight, canvasRef);
    };
  };
  
  const drawCanvas = (pose, video, videoWidth, videoHeight, canvas) => {
    const ctx = canvas.current.getContext("2d");
    canvas.current.width = videoWidth;
    canvas.current.height = videoHeight;

    if (pose[0] !== undefined) {
      if (pose[0]["keypoints"] !== undefined) {
          let poseFlip = flipHorizontal(pose, tolerance, videoWidth)
      
          updateArmAngle(pose, tolerance, 'leftElbow', 'leftWrist', 'leftShoulder')
          drawKeypoints(poseFlip[0]["keypoints"], tolerance, ctx, 1);
          drawSkeleton(poseFlip[0]["keypoints"], tolerance, ctx, 1);
      }
  }
  };
  
  runMovenet();

    
  return (
    <div className="App">
      <header className="App-header">
        <Webcam mirrored={true}
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: width,
            height: height,
          }} />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: width,
            height: height,
          }} />
      </header>
    </div>
  );
}

export default App;
