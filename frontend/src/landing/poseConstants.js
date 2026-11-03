// MoveNet 17 keypoint mapping in exact runtime order
export const MOVENET_KEYPOINTS = [
  'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
  'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
  'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
  'left_knee', 'right_knee', 'left_ankle', 'right_ankle',
];

export const MOVENET_CONNECTIONS = [
  [0, 1], [0, 2], [1, 3], [2, 4], [0, 5], [0, 6],
  [5, 6], [5, 11], [6, 12], [11, 12],
  [5, 7], [7, 9], // Left arm
  [6, 8], [8, 10], // Right arm
  [11, 13], [13, 15], // Left leg
  [12, 14], [14, 16], // Right leg
];
