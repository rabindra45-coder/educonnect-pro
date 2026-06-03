import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { describeError } from "@/lib/safeFetch";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  title?: string;
  className?: string;
}

export function ErrorState({
  error,
  onRetry,
  title = "Couldn't load this",
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-6",
        className,
      )}
    >
      <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
        <AlertCircle className="w-7 h-7 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        {describeError(error)}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="mt-5">
          <RefreshCw className="w-4 h-4 mr-2" /> Try again
        </Button>
      )}
    </div>
  );
}
