import * as tf from "@tensorflow/tfjs";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";

let detector: faceLandmarksDetection.FaceLandmarksDetector | null = null;
let modelsLoaded = false;

export async function loadFaceModels(): Promise<void> {
  if (modelsLoaded && detector) return;

  try {
    // Set TensorFlow.js backend
    await tf.setBackend("webgl");
    await tf.ready();

    // Load the MediaPipe FaceMesh model
    detector = await faceLandmarksDetection.createDetector(
      faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
      {
        runtime: "tfjs",
        refineLandmarks: true,
        maxFaces: 1,
      }
    );

    modelsLoaded = true;
    console.log("TensorFlow.js Face detection models loaded successfully");
  } catch (error) {
    console.error("Error loading face detection models:", error);
    throw new Error("Failed to load face detection models");
  }
}

export function areModelsLoaded(): boolean {
  return modelsLoaded && detector !== null;
}

export interface FaceDescriptor {
  landmarks: number[][];
  boundingBox: {
    xMin: number;
    yMin: number;
    xMax: number;
    yMax: number;
    width: number;
    height: number;
  };
}

async function detectFace(
  imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<FaceDescriptor | null> {
  if (!detector) {
    throw new Error("Face models not loaded. Call loadFaceModels() first.");
  }

  try {
    const faces = await detector.estimateFaces(imageElement);

    if (faces.length === 0) return null;

    const face = faces[0];
    const keypoints = face.keypoints;

    // Extract key landmarks for comparison (using subset of 468 landmarks)
    // Focus on stable facial features: eyes, nose, mouth corners, face outline
    const keyIndices = [
      // Left eye
      33, 133, 159, 145,
      // Right eye
      362, 263, 386, 374,
      // Nose
      1, 2, 98, 327,
      // Mouth corners
      61, 291, 0, 17,
      // Face outline
      10, 152, 234, 454,
      // Forehead
      67, 297, 109, 338,
      // Cheeks
      116, 345, 127, 356,
    ];

    const landmarks: number[][] = keyIndices.map((idx) => {
      const point = keypoints[idx];
      return point ? [point.x, point.y, point.z || 0] : [0, 0, 0];
    });

    const box = face.box;

    return {
      landmarks,
      boundingBox: {
        xMin: box.xMin,
        yMin: box.yMin,
        xMax: box.xMax,
        yMax: box.yMax,
        width: box.width,
        height: box.height,
      },
    };
  } catch (error) {
    console.error("Face detection error:", error);
    return null;
  }
}

export async function getFaceDescriptorFromDataUrl(
  dataUrl: string
): Promise<FaceDescriptor | null> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = async () => {
      try {
        const descriptor = await detectFace(img);
        resolve(descriptor);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
}

export async function getFaceDescriptorFromUrl(
  url: string
): Promise<FaceDescriptor | null> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = async () => {
      try {
        const descriptor = await detectFace(img);
        resolve(descriptor);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = () => reject(new Error("Failed to load image from URL"));
    img.src = url;
  });
}

function normalizeDescriptor(descriptor: FaceDescriptor): number[][] {
  const { landmarks, boundingBox } = descriptor;
  const { width, height, xMin, yMin } = boundingBox;

  // Normalize landmarks relative to bounding box
  return landmarks.map(([x, y, z]) => [
    (x - xMin) / width,
    (y - yMin) / height,
    z / Math.max(width, height),
  ]);
}

function calculateDistance(landmarks1: number[][], landmarks2: number[][]): number {
  if (landmarks1.length !== landmarks2.length) {
    return 1; // Maximum distance if landmarks don't match
  }

  let sumSquaredDiff = 0;
  for (let i = 0; i < landmarks1.length; i++) {
    for (let j = 0; j < 3; j++) {
      const diff = landmarks1[i][j] - landmarks2[i][j];
      sumSquaredDiff += diff * diff;
    }
  }

  return Math.sqrt(sumSquaredDiff / landmarks1.length);
}

export function compareFaceDescriptors(
  descriptor1: FaceDescriptor,
  descriptor2: FaceDescriptor
): { match: boolean; distance: number; confidence: number } {
  const normalized1 = normalizeDescriptor(descriptor1);
  const normalized2 = normalizeDescriptor(descriptor2);

  const distance = calculateDistance(normalized1, normalized2);

  // Threshold for matching (lower = stricter)
  // TensorFlow landmarks are more precise, so we use a tighter threshold
  const threshold = 0.35;
  const match = distance < threshold;

  // Convert distance to confidence percentage
  const confidence = Math.max(0, Math.min(100, Math.round((1 - distance / 0.5) * 100)));

  return { match, distance, confidence };
}

export async function detectFaceInVideo(
  video: HTMLVideoElement
): Promise<boolean> {
  if (!detector) return false;

  try {
    // Some browsers/devices can return empty results when passing a video element
    // directly. We try video first, then fall back to drawing a frame to a canvas.
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      return false;
    }

    const faces = await detector.estimateFaces(video, { flipHorizontal: true } as any);
    if (faces.length > 0) return true;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;

    // Mirror to match the user-facing camera preview
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const facesFromCanvas = await detector.estimateFaces(canvas, { flipHorizontal: false } as any);
    return facesFromCanvas.length > 0;
  } catch {
    return false;
  }
}
