import { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CalendarDoorProps {
  day: number;
  content: string;
  isOpened: boolean;
  onOpen: () => void;
}

export const CalendarDoor = ({ day, content, isOpened, onOpen }: CalendarDoorProps) => {
  const [isFlipping, setIsFlipping] = useState(false);

  const handleClick = () => {
    if (!isOpened && !isFlipping) {
      setIsFlipping(true);
      setTimeout(() => {
        onOpen();
        setIsFlipping(false);
      }, 600);
    }
  };

  return (
    <div className="relative group perspective-1000">
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

        {/* Back of door (revealed content) */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center p-4",
            "bg-card rounded-lg border-2 border-accent",
            "transition-opacity duration-300",
            isOpened ? "opacity-100" : "opacity-0"
          )}
        >
          <p className="text-sm text-center text-card-foreground font-medium">{content}</p>
        </div>
      </Card>
    </div>
  );
};
