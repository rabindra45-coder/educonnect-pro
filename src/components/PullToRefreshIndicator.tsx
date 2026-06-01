import { Loader2, ArrowDown } from "lucide-react";

interface Props {
  pull: number;
  refreshing: boolean;
  threshold?: number;
}

const PullToRefreshIndicator = ({ pull, refreshing, threshold = 70 }: Props) => {
  if (pull <= 0 && !refreshing) return null;
  const ready = pull >= threshold;
  return (
    <div
      className="md:hidden fixed top-0 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
      style={{ transform: `translate(-50%, ${Math.min(pull, 90) - 40}px)` }}
    >
      <div className="bg-card border border-border rounded-full shadow-lg h-10 w-10 flex items-center justify-center">
        {refreshing ? (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        ) : (
          <ArrowDown
            className={`w-4 h-4 transition-transform ${ready ? "rotate-180 text-primary" : "text-muted-foreground"}`}
          />
        )}
      </div>
    </div>
  );
};

export default PullToRefreshIndicator;
