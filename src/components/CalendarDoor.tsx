import { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Gift } from "lucide-react";

interface CalendarDoorProps {
  day: number;
  content: string;
  image: string;
  isOpened: boolean;
  onOpen: () => void;
}

export const CalendarDoor = ({ day, content, image, isOpened, onOpen }: CalendarDoorProps) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [showGift, setShowGift] = useState(false);

  const handleClick = () => {
    if (!isOpened && !isFlipping) {
      setIsFlipping(true);
      // Show gift animation after door starts flipping
      setTimeout(() => setShowGift(true), 300);
      setTimeout(() => {
        onOpen();
        setIsFlipping(false);
        // Hide gift after it "flies away"
        setTimeout(() => setShowGift(false), 800);
      }, 600);
    }
  };

  return (
    <div className="relative group perspective-1000">
      {/* Gift animation popping out */}
      {showGift && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none animate-[scale-in_0.4s_ease-out,float_0.8s_ease-out]">
          <Gift
            className="text-primary"
            size={32}
            style={{
              filter: "drop-shadow(0 0 15px rgba(220, 38, 38, 0.6))",
              animation: "scale-in 0.4s ease-out, float 0.8s ease-out forwards",
            }}
          />
        </div>
      )}
      
      <Card
        onClick={handleClick}
        className={cn(
          "relative h-32 cursor-pointer transition-all duration-300",
          "hover:scale-105 hover:shadow-lg",
          isOpened && "shadow-[0_0_20px_rgba(255,215,0,0.3)]",
          isFlipping && "animate-flip"
        )}
      >
        {/* Front of door */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center backface-hidden",
            "bg-gradient-to-br from-primary to-secondary rounded-lg",
            "border-2 border-accent/30",
            isOpened && "opacity-0"
          )}
        >
          <div className="text-center">
            <span className="text-4xl font-bold text-primary-foreground">{day}</span>
            {!isOpened && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-sparkle" />
              </div>
            )}
          </div>
        </div>

        {/* Back of door (revealed content with animated image) */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center p-2 overflow-hidden",
            "bg-gradient-to-br from-card to-muted rounded-lg border-2 border-accent",
            "transition-opacity duration-300",
            isOpened ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="text-center space-y-1 w-full">
            {/* Animated illustration */}
            <div className="relative w-full h-16 mb-1 flex items-center justify-center">
              <img
                src={image}
                alt="Joke illustration"
                className={cn(
                  "max-h-full max-w-full object-contain rounded-lg",
                  "animate-[scale-in_0.5s_ease-out] hover:scale-110 transition-transform"
                )}
                style={{
                  filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.1))",
                  animation: "scale-in 0.5s ease-out, float-gentle 2s ease-in-out infinite",
                }}
              />
            </div>
            {/* Joke text */}
            <p className="text-[10px] leading-tight text-card-foreground font-medium px-1">
              {content}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
