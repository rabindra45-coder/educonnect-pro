import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, Loader2, ScanFace, Mail, AlertCircle, RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  loadFaceModels,
  areModelsLoaded,
  getFaceDescriptorFromDataUrl,
  getFaceDescriptorFromUrl,
  compareFaceDescriptors,
  detectFaceInVideo,
  type FaceDescriptor,
} from "@/lib/faceDetection";

interface FaceLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type Step = "email" | "loading-models" | "camera" | "verifying";

const FaceLoginDialog = ({ open, onOpenChange, onSuccess }: FaceLoginDialogProps) => {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [cameraTimedOut, setCameraTimedOut] = useState(false);
  const [modelLoadProgress, setModelLoadProgress] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [storedFaceUrl, setStoredFaceUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const faceDetectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Load face detection models when dialog opens
  useEffect(() => {
    if (!open) return;
    
    const loadModels = async () => {
      if (areModelsLoaded()) return;
      
      setStep("loading-models");
      setModelLoadProgress(0);
      
      // Simulate progress while loading
      const progressInterval = setInterval(() => {
        setModelLoadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      try {
        await loadFaceModels();
        setModelLoadProgress(100);
        clearInterval(progressInterval);
        setStep("email");
      } catch (err) {
        clearInterval(progressInterval);
        console.error("Failed to load face models:", err);
        setError("Failed to load face detection. Please try again.");
        setStep("email");
      }
    };

    loadModels();
  }, [open]);

  // Real-time face detection in video
  useEffect(() => {
    if (step !== "camera" || !isVideoReady || !videoRef.current) {
      if (faceDetectionIntervalRef.current) {
        clearTimeout(faceDetectionIntervalRef.current);
        faceDetectionIntervalRef.current = null;
      }
      return;
    }

    // Avoid overlapping detections (estimateFaces can be slow and concurrent calls can
    // cause persistent "no face" results on some devices).
    let cancelled = false;
    let inFlight = false;

    const tick = async () => {
      if (cancelled) return;
      if (!videoRef.current) return;

      if (!inFlight) {
        inFlight = true;
        try {
          const detected = await detectFaceInVideo(videoRef.current);
          if (!cancelled) setFaceDetected(detected);
        } finally {
          inFlight = false;
        }
      }

      // Slightly faster than 500ms for responsiveness, but still light enough.
      faceDetectionIntervalRef.current = setTimeout(tick, 300) as unknown as NodeJS.Timeout;
    };

    tick();

    return () => {
      cancelled = true;
      if (faceDetectionIntervalRef.current) {
        clearTimeout(faceDetectionIntervalRef.current);
        faceDetectionIntervalRef.current = null;
      }
    };
  }, [step, isVideoReady]);

  const fetchStoredFaceUrl = useCallback(async () => {
    try {
      // Get user by email first
      const { data, error: fetchError } = await supabase
        .from("student_face_data")
        .select("face_image_url, user_id")
        .eq("is_active", true);

      if (fetchError) throw fetchError;

      // We need to find the face data for this email
      // First get the user from auth
      const { data: userData } = await supabase.auth.admin?.listUsers?.() || { data: null };
      
      // Since we can't use admin API from client, we'll fetch during verification
      // For now, just proceed to camera
      return null;
    } catch (err) {
      console.error("Error fetching stored face:", err);
      return null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setCameraTimedOut(false);
      setFaceDetected(false);
      setStep("camera");
      setIsVideoReady(false);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      setStream(mediaStream);
      setError(null);

      timeoutRef.current = setTimeout(() => {
        setCameraTimedOut(true);
      }, 5000);
    } catch (err) {
      console.error("Camera error:", err);
      setError("Camera access denied. Please allow camera access.");
      setStep("email");
    }
  }, []);

  useEffect(() => {
    if (!stream || step !== "camera" || !videoRef.current) return;

    const video = videoRef.current;
    setIsVideoReady(false);
    video.srcObject = stream;

    const onReady = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        setIsVideoReady(true);
        setCameraTimedOut(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    };

    video.addEventListener("loadedmetadata", onReady);
    video.addEventListener("canplay", onReady);
    video.play().catch(console.error);

    return () => {
      video.removeEventListener("loadedmetadata", onReady);
      video.removeEventListener("canplay", onReady);
    };
  }, [stream, step]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsVideoReady(false);
    setCameraTimedOut(false);
    setFaceDetected(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (faceDetectionIntervalRef.current) {
      clearTimeout(faceDetectionIntervalRef.current);
      faceDetectionIntervalRef.current = null;
    }
  }, [stream]);

  const retryCamera = useCallback(() => {
    stopCamera();
    startCamera();
  }, [stopCamera, startCamera]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (faceDetectionIntervalRef.current) clearTimeout(faceDetectionIntervalRef.current);
    };
  }, []);

  const captureAndVerify = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!isVideoReady || video.videoWidth === 0 || video.videoHeight === 0) {
      setError("Camera not ready yet. Please wait a second and try again.");
      return;
    }

    if (!faceDetected) {
      setError("No face detected. Please position your face in the frame.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0);
    }

    const imageData = canvas.toDataURL("image/jpeg", 0.8);
    if (!imageData || imageData === "data:," || !imageData.includes("base64,")) {
      setError("Could not capture a clear image. Please try again.");
      return;
    }
    
    setCapturedImage(imageData);
    stopCamera();
    setStep("verifying");
    setError(null);

    try {
      // First, get the stored face URL for this user via edge function
      const { data: faceDataResponse, error: faceDataError } = await supabase.functions.invoke(
        "get-face-data",
        { body: { email } }
      );

      if (faceDataError || !faceDataResponse?.faceUrl) {
        setError(faceDataResponse?.message || "Face login not set up for this account.");
        setStep("camera");
        startCamera();
        return;
      }

      // Get face descriptor from captured image
      const capturedDescriptor = await getFaceDescriptorFromDataUrl(imageData);
      if (!capturedDescriptor) {
        setError("Could not detect face in captured image. Please try again.");
        setStep("camera");
        startCamera();
        return;
      }

      // Get face descriptor from stored image
      const storedDescriptor = await getFaceDescriptorFromUrl(faceDataResponse.faceUrl);
      if (!storedDescriptor) {
        setError("Could not process stored face data. Please re-register your face.");
        setStep("camera");
        startCamera();
        return;
      }

      // Compare faces locally
      const result = compareFaceDescriptors(capturedDescriptor, storedDescriptor);
      
      if (result.match && result.confidence >= 40) {
        // Face matched! Now get the login token from backend
        const response = await supabase.functions.invoke("verify-face", {
          body: { email, verified: true, confidence: result.confidence },
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        const data = response.data;

        if (data.error) {
          setError(data.error);
          setStep("camera");
          startCamera();
          return;
        }

        if (data.success && data.token_hash) {
          const { error: authError } = await supabase.auth.verifyOtp({
            email,
            token_hash: data.token_hash,
            type: "email",
          });

          if (authError) {
            setError("Login failed. Please try again.");
            setStep("camera");
            startCamera();
            return;
          }

          toast({
            title: "Welcome Back!",
            description: `Face verified with ${result.confidence}% confidence.`,
          });
          onSuccess();
          handleClose();
        } else {
          setError(data.message || "Face verification failed");
          setStep("camera");
          startCamera();
        }
      } else {
        setError(
          result.confidence < 40
            ? `Face match confidence too low (${result.confidence}%). Please try again with better lighting.`
            : "Face does not match. Please use password login."
        );
        setStep("camera");
        startCamera();
      }
    } catch (err) {
      console.error("Face login error:", err);
      setError("Verification failed. Please try again.");
      setStep("camera");
      startCamera();
    }
  }, [email, stopCamera, startCamera, toast, onSuccess, isVideoReady, faceDetected]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && areModelsLoaded()) {
      startCamera();
    }
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setEmail("");
    setStep("email");
    setError(null);
    setStoredFaceUrl(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanFace className="w-5 h-5 text-primary" />
            Face Login
          </DialogTitle>
          <DialogDescription>
            {step === "loading-models" && "Loading face detection models..."}
            {step === "email" && "Enter your email to start face verification."}
            {step === "camera" && "Look at the camera to verify your identity."}
            {step === "verifying" && "Verifying your face..."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {step === "loading-models" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Download className="w-12 h-12 text-primary animate-pulse" />
              <div className="w-full space-y-2">
                <Progress value={modelLoadProgress} className="h-2" />
                <p className="text-sm text-center text-muted-foreground">
                  Loading face detection models ({modelLoadProgress}%)
                </p>
              </div>
            </div>
          )}

          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="face-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="face-email"
                    type="email"
                    placeholder="student@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={!email.trim() || !areModelsLoaded()}>
                  <Camera className="w-4 h-4 mr-2" />
                  Continue
                </Button>
              </div>
            </form>
          )}

          {step === "camera" && (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden bg-black aspect-[4/3]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                <div className="absolute inset-0 pointer-events-none">
                  <div
                    className={`absolute inset-[15%] border-2 border-dashed rounded-full transition-colors ${
                      faceDetected ? "border-green-500" : "border-white/50"
                    }`}
                  />
                </div>
                {/* Face detection indicator */}
                {isVideoReady && (
                  <div
                    className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${
                      faceDetected
                        ? "bg-green-500/90 text-white"
                        : "bg-muted/90 text-muted-foreground"
                    }`}
                  >
                    {faceDetected ? "Face detected ✓" : "No face detected"}
                  </div>
                )}
                {/* Camera readiness indicator */}
                {!isVideoReady && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                    {cameraTimedOut ? (
                      <div className="text-center space-y-3">
                        <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
                        <p className="text-sm text-white">Camera not responding</p>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={retryCamera}
                          className="gap-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Retry
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center space-y-2">
                        <Loader2 className="w-8 h-8 text-white animate-spin mx-auto" />
                        <p className="text-sm text-white/80">Initializing camera…</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={captureAndVerify}
                  className="flex-1"
                  disabled={!isVideoReady || !faceDetected}
                >
                  <ScanFace className="w-4 h-4 mr-2" />
                  Verify Face
                </Button>
              </div>
            </div>
          )}

          {step === "verifying" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-primary">
                  {capturedImage && (
                    <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 p-2 bg-primary rounded-full">
                  <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Matching faces...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FaceLoginDialog;
