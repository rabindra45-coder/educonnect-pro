import { motion } from "framer-motion";
import { AlertCircle, UserPlus, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface NoStudentRecordCardProps {
  userEmail: string | undefined;
  onContactAdmin: () => void;
}

const NoStudentRecordCard = ({ userEmail, onContactAdmin }: NoStudentRecordCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-xl text-destructive">
            Student Record Not Found
          </CardTitle>
          <CardDescription>
            We couldn't find a student record linked to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-card rounded-lg p-4 border">
            <p className="text-sm text-muted-foreground mb-3">
              Your logged in email:
            </p>
            <div className="flex items-center gap-2 text-foreground font-medium">
              <Mail className="w-4 h-4 text-primary" />
              {userEmail || "Unknown"}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-foreground">This could happen because:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-0.5">•</span>
                Your admission application is still being processed
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-0.5">•</span>
                Your student record was created with a different email address
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-0.5">•</span>
                Your account hasn't been linked to a student profile yet
              </li>
            </ul>
          </div>

          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-primary" />
              What you can do:
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground mb-4">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">1.</span>
                Contact the school administration to verify your student record
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">2.</span>
                Ensure your admission application has been approved
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">3.</span>
                Confirm the email address used during admission matches your login email
              </li>
            </ul>
            <Button onClick={onContactAdmin} className="w-full gap-2">
              <Phone className="w-4 h-4" />
              Contact Administration
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default NoStudentRecordCard;
