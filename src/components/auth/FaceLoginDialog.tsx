import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, Loader2, ScanFace, RotateCcw, Mail, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FaceLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const FaceLoginDialog = ({ open, onOpenChange, onSuccess }: FaceLoginDialogProps) => {
  const [step, setStep] = useState<"email" | "camera" | "verifying">("email");
  const [email, setEmail] = useState("");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [cameraTimedOut, setCameraTimedOut] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const startCamera = useCallback(async () => {
    try {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setCameraTimedOut(false);
      // Render the camera UI first so the <video> element exists before attaching the stream.
      setStep("camera");
      setIsVideoReady(false);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      setStream(mediaStream);
      setError(null);

      // Start a 5-second timeout for camera readiness
      timeoutRef.current = setTimeout(() => {
        setCameraTimedOut(true);
      }, 5000);
    } catch (error) {
      console.error("Camera error:", error);
      setError("Camera access denied. Please allow camera access.");
      setStep("email");
    }
  }, []);

  // Attach stream to video element when both are available (prevents empty frames like `data:,`).
  useEffect(() => {
    if (!stream || step !== "camera" || !videoRef.current) return;

    const video = videoRef.current;
    setIsVideoReady(false);
    video.srcObject = stream;

    const onReady = () => {
      // videoWidth/Height become available after metadata is loaded.
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        setIsVideoReady(true);
        setCameraTimedOut(false);
        // Clear timeout since camera is ready
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
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [stream]);

  const retryCamera = useCallback(() => {
    stopCamera();
    startCamera();
  }, [stopCamera, startCamera]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const captureAndVerify = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Prevent sending empty frames (canvas.toDataURL() becomes `data:,` when width/height are 0).
    if (!isVideoReady || video.videoWidth === 0 || video.videoHeight === 0) {
      setError("Camera not ready yet. Please wait a second and try again.");
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
      const response = await supabase.functions.invoke("verify-face", {
        body: { email, faceImage: imageData },
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

      if (data.success && data.token) {
        // Verify the OTP token
        const { error: authError } = await supabase.auth.verifyOtp({
          email,
          token: data.token,
          type: "magiclink",
        });

        if (authError) {
          setError("Login failed. Please try again.");
          setStep("camera");
          startCamera();
          return;
        }

        toast({
          title: "Welcome Back!",
          description: `Face verified with ${data.confidence}% confidence.`,
        });
        onSuccess();
        handleClose();
      } else {
        setError(data.message || "Face verification failed");
        setStep("camera");
        startCamera();
      }
    } catch (error) {
      console.error("Face login error:", error);
      setError("Verification failed. Please try again.");
      setStep("camera");
      startCamera();
    }
  }, [email, stopCamera, startCamera, toast, onSuccess, isVideoReady]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      startCamera();
    }
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setEmail("");
    setStep("email");
    setError(null);
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
                <Button type="submit" className="flex-1" disabled={!email.trim()}>
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
                  <div className="absolute inset-[15%] border-2 border-dashed border-white/50 rounded-full" />
                </div>
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
                <Button onClick={captureAndVerify} className="flex-1" disabled={!isVideoReady}>
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
              <p className="text-sm text-muted-foreground">Verifying your identity...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FaceLoginDialog;
