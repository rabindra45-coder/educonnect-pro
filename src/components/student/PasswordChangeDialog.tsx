import { Loader2, Key, Eye, EyeOff, ShieldCheck } from "lucide-react";
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

interface PasswordChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mustChangePassword: boolean;
  passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  setPasswordData: React.Dispatch<React.SetStateAction<{
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }>>;
  showPasswords: {
    current: boolean;
    new: boolean;
    confirm: boolean;
  };
  setShowPasswords: React.Dispatch<React.SetStateAction<{
    current: boolean;
    new: boolean;
    confirm: boolean;
  }>>;
  isChangingPassword: boolean;
  onPasswordChange: () => void;
}

const PasswordChangeDialog = ({
  open,
  onOpenChange,
  mustChangePassword,
  passwordData,
  setPasswordData,
  showPasswords,
  setShowPasswords,
  isChangingPassword,
  onPasswordChange,
}: PasswordChangeDialogProps) => {
  const passwordStrength = () => {
    const password = passwordData.newPassword;
    if (!password) return { strength: 0, label: "", color: "" };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 1) return { strength: 25, label: "Weak", color: "bg-red-500" };
    if (strength === 2) return { strength: 50, label: "Fair", color: "bg-orange-500" };
    if (strength === 3) return { strength: 75, label: "Good", color: "bg-yellow-500" };
    return { strength: 100, label: "Strong", color: "bg-green-500" };
  };

  const { strength, label, color } = passwordStrength();

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!mustChangePassword || !isOpen) {
          onOpenChange(isOpen);
        }
      }}
    >
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => {
          if (mustChangePassword) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-full bg-primary/10">
              <Key className="w-5 h-5 text-primary" />
            </div>
            Change Your Password
          </DialogTitle>
          <DialogDescription>
            {mustChangePassword
              ? "For security, you must change your default password before continuing."
              : "Update your password to keep your account secure."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Security Tips */}
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
              <ShieldCheck className="w-4 h-4" />
              Password Tips
            </div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• At least 8 characters long</li>
              <li>• Include uppercase & lowercase letters</li>
              <li>• Add numbers and special characters</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords.new ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter new password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full hover:bg-transparent"
                onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
              >
                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            {/* Password Strength Indicator */}
            {passwordData.newPassword && (
              <div className="space-y-1">
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${color}`}
                    style={{ width: `${strength}%` }}
                  />
                </div>
                <p className={`text-xs ${color.replace("bg-", "text-")}`}>{label}</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full hover:bg-transparent"
                onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
              >
                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
              <p className="text-xs text-destructive">Passwords do not match</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            {!mustChangePassword && (
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            )}
            <Button
              onClick={onPasswordChange}
              disabled={
                isChangingPassword ||
                !passwordData.newPassword ||
                passwordData.newPassword !== passwordData.confirmPassword
              }
            >
              {isChangingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Change Password
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordChangeDialog;
