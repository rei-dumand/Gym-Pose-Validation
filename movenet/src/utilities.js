// These helper functions have been ported from @tensorflow-models/posenet/keypoints.js
// As well as Nicholas Renotte's PosenetRealtime project: 
// https://github.com/nicknochnack/PosenetRealtime/blob/master/src/utilities.js

const color = "aqua";
const lineWidth = 3;
const pointRadius = 5;

let partNames = [
    'nose', 'leftEye', 'rightEye', 'leftEar', 'rightEar', 'leftShoulder',
    'rightShoulder', 'leftElbow', 'rightElbow', 'leftWrist', 'rightWrist',
    'leftHip', 'rightHip', 'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle'
];

let connectedPartNames = [
    ['leftHip', 'leftShoulder'], ['leftElbow', 'leftShoulder'],
    ['leftElbow', 'leftWrist'], ['leftHip', 'leftKnee'],
    ['leftKnee', 'leftAnkle'], ['rightHip', 'rightShoulder'],
    ['rightElbow', 'rightShoulder'], ['rightElbow', 'rightWrist'],
    ['rightHip', 'rightKnee'], ['rightKnee', 'rightAnkle'],
    ['leftShoulder', 'rightShoulder'], ['leftHip', 'rightHip']
];

let partIds = partNames.reduce(function (result, jointName, i) {
    result[jointName] = i;
    return result;
}, {});

let connectedPartIndices = connectedPartNames.map(function (_a) {
    var jointNameA = _a[0], jointNameB = _a[1];
    return ([partIds[jointNameA], partIds[jointNameB]]);
});


function toTuple({ y, x }) {
    return [y, x];
}

export function drawPoint(ctx, y, x, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}

/**
 * Draws a line on a canvas, i.e. a joint
 */
export function drawSegment([ay, ax], [by, bx], color, scale, ctx) {
    ctx.beginPath();
    ctx.moveTo(ax * scale, ay * scale);
    ctx.lineTo(bx * scale, by * scale);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.stroke();
}

/**
 * Draws a pose skeleton by looking up all adjacent keypoints/joints
 */
export function drawSkeleton(keypoints, minConfidence, ctx, scale = 1) {
    const adjacentKeyPoints = getAdjacentKeyPoints(
        keypoints,
        minConfidence
    );

    adjacentKeyPoints.forEach((keypoints) => {
        drawSegment(
            toTuple(keypoints[0]),
            toTuple(keypoints[1]),
            color,
            scale,
            ctx
        );
    });
}

export function getAdjacentKeyPoints(keypoints, minConfidence) {
    return connectedPartIndices.reduce(
        (result, [leftJoint, rightJoint]) => {
            if (eitherPointDoesntMeetConfidence(
                keypoints[leftJoint].score, keypoints[rightJoint].score,
                minConfidence)) {
                return result;
            }
            result.push([keypoints[leftJoint], keypoints[rightJoint]]);

            return result;
        }, []);
}

function eitherPointDoesntMeetConfidence(a, b, minConfidence) {
    return (a < minConfidence || b < minConfidence);
}

/**
 * Draw pose keypoints onto a canvas
 */
export function drawKeypoints(keypoints, minConfidence, ctx, scale = 1) {
    for (let i = 0; i < keypoints.length; i++) {
        const keypoint = keypoints[i];

        if (keypoint.score < minConfidence) {
            continue;
        }
        let { y, x } = keypoint;

        drawPoint(ctx, y * scale, x * scale, pointRadius, color);
    }
}

export function flipHorizontal(pose, minConfidence, canvasWidth) {
    let keypoints = pose[0]["keypoints"]

    for (let i = 0; i < keypoints.length; i++) {
        const keypoint = keypoints[i];

        if (keypoint.score < minConfidence) {
            continue;
        }

        let { x } = keypoint;
        let mid = canvasWidth / 2

        if (x < canvasWidth / 2) {
            pose[0]["keypoints"][i].x = mid + (mid - x);
        } else {
            pose[0]["keypoints"][i].x = mid - (x - mid);
        }
    }

    return pose;
}

export function updateArmAngle(pose, tolerance, O, A, B) {
    let keypoints = pose[0]["keypoints"]
    /*
    rightWrist = poses[0].keypoints[10];
    rightShoulder = poses[0].keypoints[6];
    rightElbow = poses[0].keypoints[8];
    */

    let Pivot = keypoints[partNames.indexOf(O)];
    let PointA = keypoints[partNames.indexOf(A)];
    let PointB = keypoints[partNames.indexOf(B)];
    // console.log(partNames.indexOf(A))
    // let leftWrist = keypoints[9];
    // let leftShoulder = keypoints[5];
    // let leftElbow = keypoints[7];
    if (!PointA || !PointB || !Pivot) {
        return
    }

    let angle = (
        Math.atan2(
            PointA.y - Pivot.y,
            PointA.x - Pivot.x
        ) - Math.atan2(
            PointB.y - Pivot.y,
            PointB.x - Pivot.x
        )
    ) * (180 / Math.PI);

    if (angle < 0) {
        //angle = angle + 360;
    }

    if (PointA.score > tolerance && Pivot.score > tolerance && PointB.score > tolerance) {
        console.log(angle);
        let elbowAngle = angle;
    }
    else {
        //console.log('Cannot see elbow');
    }

    // Use this function and pass 3 extra arguments, 'leftWrist' 'leftShoulder & 'leftElbow'

}
