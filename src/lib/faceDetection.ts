import * as faceapi from "face-api.js";

let modelsLoaded = false;

const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model";

export async function loadFaceModels(): Promise<void> {
  if (modelsLoaded) return;

  try {
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
    console.log("Face detection models loaded successfully");
  } catch (error) {
    console.error("Error loading face detection models:", error);
    throw new Error("Failed to load face detection models");
  }
}

export function areModelsLoaded(): boolean {
  return modelsLoaded;
}

export async function detectFace(
  imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>> | null> {
  if (!modelsLoaded) {
    throw new Error("Face models not loaded. Call loadFaceModels() first.");
  }

  const detection = await faceapi
    .detectSingleFace(imageElement)
    .withFaceLandmarks()
    .withFaceDescriptor();

  return detection || null;
}

export async function getFaceDescriptorFromDataUrl(
  dataUrl: string
): Promise<Float32Array | null> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = async () => {
      try {
        const detection = await detectFace(img);
        resolve(detection?.descriptor || null);
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
): Promise<Float32Array | null> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = async () => {
      try {
        const detection = await detectFace(img);
        resolve(detection?.descriptor || null);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = () => reject(new Error("Failed to load image from URL"));
    img.src = url;
  });
}

export function compareFaceDescriptors(
  descriptor1: Float32Array,
  descriptor2: Float32Array
): { match: boolean; distance: number; confidence: number } {
  const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
  
  // Typical threshold for face matching is 0.6
  // Lower distance = more similar faces
  const match = distance < 0.6;
  
  // Convert distance to confidence percentage (0.0 = 100%, 1.0+ = 0%)
  const confidence = Math.max(0, Math.min(100, Math.round((1 - distance) * 100)));

  return { match, distance, confidence };
}

export async function detectFaceInVideo(
  video: HTMLVideoElement
): Promise<boolean> {
  if (!modelsLoaded) return false;
  
  const detection = await faceapi.detectSingleFace(video);
  return !!detection;
}
