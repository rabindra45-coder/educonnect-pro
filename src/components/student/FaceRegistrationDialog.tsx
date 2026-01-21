import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, Loader2, CheckCircle, X, ScanFace, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface FaceRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const FaceRegistrationDialog = ({ open, onOpenChange, onSuccess }: FaceRegistrationDialogProps) => {
  const [step, setStep] = useState<"intro" | "camera" | "preview" | "saving">("intro");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Attach stream to video element when both are available
  useEffect(() => {
    if (stream && videoRef.current && step === "camera") {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(console.error);
    }
  }, [stream, step]);

  const startCamera = useCallback(async () => {
    try {
      setStep("camera"); // Change step first so video element renders
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      setStream(mediaStream);
    } catch (error) {
      console.error("Camera error:", error);
      setStep("intro");
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to use face login.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Mirror the image for selfie-style
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0);
    }

    const imageData = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(imageData);
    stopCamera();
    setStep("preview");
  }, [stopCamera]);

  const retake = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const saveFaceData = async () => {
    if (!capturedImage || !user) return;

    setStep("saving");
    try {
      // Upload face image to storage
      const fileName = `face-data/${user.id}/${Date.now()}.jpg`;
      const base64Data = capturedImage.split(",")[1];
      const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

      const { error: uploadError } = await supabase.storage
        .from("content-images")
        .upload(fileName, binaryData, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("content-images")
        .getPublicUrl(fileName);

      // Save or update face data in database
      const { error: dbError } = await supabase
        .from("student_face_data")
        .upsert({
          user_id: user.id,
          face_image_url: urlData.publicUrl,
          is_active: true,
        }, { onConflict: "user_id" });

      if (dbError) throw dbError;

      toast({
        title: "Face Login Enabled!",
        description: "You can now use face recognition to log in.",
      });
      
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Save face data error:", error);
      toast({
        title: "Failed to Save",
        description: "Could not save face data. Please try again.",
        variant: "destructive",
      });
      setStep("preview");
    }
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setStep("intro");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanFace className="w-5 h-5 text-primary" />
            Set Up Face Login
          </DialogTitle>
          <DialogDescription>
            {step === "intro" && "Use your face to log in quickly and securely."}
            {step === "camera" && "Position your face in the frame and look at the camera."}
            {step === "preview" && "Review your photo before saving."}
            {step === "saving" && "Saving your face data..."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {step === "intro" && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <h4 className="font-medium">How it works:</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Take a clear photo of your face
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    AI securely verifies your identity
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Log in with just your face and email
                  </li>
                </ul>
              </div>
              <Button onClick={startCamera} className="w-full">
                <Camera className="w-4 h-4 mr-2" />
                Start Camera
              </Button>
            </div>
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
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={capturePhoto} className="flex-1">
                  <Camera className="w-4 h-4 mr-2" />
                  Capture
                </Button>
              </div>
            </div>
          )}

          {step === "preview" && capturedImage && (
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden bg-black aspect-[4/3]">
                <img src={capturedImage} alt="Captured face" className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={retake} className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake
                </Button>
                <Button onClick={saveFaceData} className="flex-1">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          )}

          {step === "saving" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Setting up face login...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FaceRegistrationDialog;
