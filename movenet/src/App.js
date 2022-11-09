import './App.css';
import React, { useRef, useState, useEffect } from 'react';

import * as poseDetection from '@tensorflow-models/pose-detection';
// import * as tf from '@tensorflow/tfjs-core';
// Register one of the TF.js backends.
import '@tensorflow/tfjs-backend-webgl';
// import '@tensorflow/tfjs-backend-wasm';
// import * as posenet from '@tensorflow-models/posenet';


import { drawKeypoints, drawSkeleton, flipHorizontal, updateAngle } from './utilities';


import Webcam from "react-webcam";
import { scatter_util } from '@tensorflow/tfjs-core';

function App() {

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [width] = useState(640 / 1.5);
  const [height] = useState(480 / 1.5);
  const [movenet, setMovenet] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("Live feedback with appear here.");

  let goodJobCounter = useRef(0);

  const tolerance = 0.3;

  const runMovenet = async () => {

    const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
    const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);

    const movenetInterval = setInterval(() => {
      detect(detector)
    }, 50);

    // if (movenet = false) {
    //   clearInterval(movenetInterval)
    // }

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

        // let RightArmAngle = updateAngle(pose, tolerance, 'rightElbow', 'rightWrist', 'rightShoulder')
        let leftShoulderAngle = updateAngle(pose, tolerance, 'leftShoulder', 'leftHip', 'leftElbow')
        let leftArmAngle = updateAngle(pose, tolerance, 'leftElbow', 'leftWrist', 'leftShoulder')
        // if (leftArmAngle !== undefined) {
        //   console.log(leftArmAngle)
        // }

        const isPositionCorrect = (angle, lowTolerAngle, highTolerAngle) => {
          if (lowTolerAngle < angle && angle < highTolerAngle) {
            return true;
          } else {
            return false;
          }
        }

        let isShoulderOK = isPositionCorrect(leftShoulderAngle, -13, 20)
        let isArmOK = isPositionCorrect(leftArmAngle, 0, 170)

        if (isShoulderOK !== undefined && isArmOK !== undefined && isShoulderOK && isArmOK) {
          // goodJobCounter++;
          // console.log(goodJobCounter)
          setFeedbackMsg("that's a good curl 🌟")
          // console.log("nice")
        } else {
          setFeedbackMsg("check your technique 😠")
        }
        isShoulderOK = undefined;
        isArmOK = undefined;

        drawKeypoints(poseFlip[0]["keypoints"], tolerance, ctx, 1);
        drawSkeleton(poseFlip[0]["keypoints"], tolerance, ctx, 1);
      }
    }
  };

  runMovenet();


  return (
    <main className="container__main">
      <h1 className='main__title'>Left-Arm Curl Tutor</h1>
      <p className='main__subtitle'>Knows a good left-arm curl from a bad one, pretty niche...</p>

      <div className='feedback__box'>
        <p className='feedback__msg'>{feedbackMsg}</p>
      </div>

      <p className='source__text'> 
      {`This demo is heavily based on the work of `} 
      <a href="https://github.com/harshbhatt7585/YogaIntelliJ/tree/main/frontend/src">harshbhatt7585/YogaIntelliJ</a>
      {` & `}  
      <a href="https://github.com/shamjam/my_push_up_counter/blob/main/webcam.js">shamjam/my_push_up_counter</a>
      {`.`}      
      <br></br>
      {`Built in React using Movenet with Tensorflow.`}
      <br></br>
      {`Author: `}
      <a href='https://github.com/rei-dumand'>rei-dumand</a>
      </p>

      <Webcam mirrored={true}
        ref={webcamRef}
        style={{
          width: width,
          height: height,
        }} />

      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",

          width: width,
          height: height,
        }} />
    </main>
  );
}

export default App;
