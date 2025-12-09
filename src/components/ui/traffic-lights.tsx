import { cn } from "@/lib/utils";

interface TrafficLightsProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
  orientation?: "horizontal" | "vertical";
}

export function TrafficLights({
  className,
  size = "md",
  animated = false,
  orientation = "horizontal"
}: TrafficLightsProps) {
  const sizeClasses = {
    sm: "h-2 w-8",
    md: "h-3 w-12",
    lg: "h-4 w-16",
    xl: "h-6 w-24"
  };

  const barSizes = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
    xl: "h-6"
  };

  const containerClass = orientation === "vertical"
    ? "flex flex-col space-y-1"
    : "flex space-x-1";

  const barClass = orientation === "vertical"
    ? `w-3 ${barSizes[size]}`
    : `${sizeClasses[size]} flex-1`;

  return (
    <div className={cn(containerClass, className)}>
      <div
        className={cn(
          barClass,
          "bg-gradient-to-r from-green-400 to-green-500 rounded-full",
          animated && "animate-pulse"
        )}
        style={{ animationDelay: "0s" }}
      />

      <div
        className={cn(
          barClass,
          "bg-gradient-to-r from-orange-400 to-orange-500 rounded-full",
          animated && "animate-pulse"
        )}
        style={{ animationDelay: "0.5s" }}
      />

      <div
        className={cn(
          barClass,
          "bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-full",
          animated && "animate-pulse"
        )}
        style={{ animationDelay: "1s" }}
      />
    </div>
  );
}

interface ESGIndicatorProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  scores?: {
    environmental: number;
    social: number;
    governance: number;
  };
  animated?: boolean;
  showLabels?: boolean;
}

export function ESGIndicator({
  className,
  size = "md",
  scores,
  animated = false,
  showLabels = false
}: ESGIndicatorProps) {
  const defaultScores = { environmental: 85, social: 78, governance: 92 };
  const actualScores = scores || defaultScores;

  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4"
  };

  const getScoreColor = (score: number, type: 'environmental' | 'social' | 'governance') => {
    const baseColors = {
      environmental: score >= 80 ? 'from-green-400 to-green-600' : score >= 60 ? 'from-yellow-400 to-yellow-600' : 'from-red-400 to-red-600',
      social: score >= 80 ? 'from-orange-400 to-orange-600' : score >= 60 ? 'from-yellow-400 to-yellow-600' : 'from-red-400 to-red-600',
      governance: score >= 80 ? 'from-cyan-400 to-cyan-600' : score >= 60 ? 'from-yellow-400 to-yellow-600' : 'from-red-400 to-red-600'
    };
    return baseColors[type];
  };

  return (
    <div className={cn("space-y-2", className)}>
      {showLabels && (
        <div className="text-xs font-medium text-gray-600 mb-2">ESG Performance</div>
      )}

      <div className="flex space-x-1">
        <div className="flex-1">
          {showLabels && <div className="text-xs text-green-600 mb-1">E</div>}
          <div className={cn("w-full bg-gray-200 rounded-full", sizeClasses[size])}>
            <div
              className={cn(
                sizeClasses[size],
                "bg-gradient-to-r rounded-full transition-all duration-1000",
                getScoreColor(actualScores.environmental, 'environmental'),
                animated && "animate-pulse"
              )}
              style={{
                width: `${actualScores.environmental}%`,
                animationDelay: "0s"
              }}
            />
          </div>
        </div>

        <div className="flex-1">
          {showLabels && <div className="text-xs text-orange-600 mb-1">S</div>}
          <div className={cn("w-full bg-gray-200 rounded-full", sizeClasses[size])}>
            <div
              className={cn(
                sizeClasses[size],
                "bg-gradient-to-r rounded-full transition-all duration-1000",
                getScoreColor(actualScores.social, 'social'),
                animated && "animate-pulse"
              )}
              style={{
                width: `${actualScores.social}%`,
                animationDelay: "0.3s"
              }}
            />
          </div>
        </div>

        <div className="flex-1">
          {showLabels && <div className="text-xs text-cyan-600 mb-1">G</div>}
          <div className={cn("w-full bg-gray-200 rounded-full", sizeClasses[size])}>
            <div
              className={cn(
                sizeClasses[size],
                "bg-gradient-to-r rounded-full transition-all duration-1000",
                getScoreColor(actualScores.governance, 'governance'),
                animated && "animate-pulse"
              )}
              style={{
                width: `${actualScores.governance}%`,
                animationDelay: "0.6s"
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
