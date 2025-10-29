import { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Gift, Lock } from "lucide-react";
import { useChristmasMusic } from "@/hooks/useChristmasMusic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Door25Props {
  isOpened: boolean;
  onOpen: () => void;
  isVip: boolean;
}

export const Door25 = ({ isOpened, onOpen, isVip }: Door25Props) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [showGift, setShowGift] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const { playRandomMelody } = useChristmasMusic();

  const handleClick = () => {
    if (!isVip) {
      return; // Can't open if not VIP
    }
    
    if (!isOpened && !isFlipping) {
      setIsFlipping(true);
      playRandomMelody();
      setTimeout(() => setShowGift(true), 300);
      setTimeout(() => {
        onOpen();
        setIsFlipping(false);
        setTimeout(() => {
          setShowGift(false);
          setShowContent(true);
        }, 800);
      }, 600);
    } else if (isOpened) {
      setShowContent(true);
    }
  };

  return (
    <>
      <div className="relative group perspective-1000 col-span-2 row-span-2">
        {showGift && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none animate-[scale-in_0.4s_ease-out,float_0.8s_ease-out]">
            <Gift
              className="text-primary"
              size={64}
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
            "relative h-full min-h-[272px] cursor-pointer transition-all duration-300",
            "hover:scale-105 hover:shadow-lg",
            isOpened && "shadow-[0_0_30px_rgba(255,215,0,0.5)]",
            isFlipping && "animate-flip",
            !isVip && "cursor-not-allowed opacity-75"
          )}
        >
          {/* Front of door */}
          <div
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center backface-hidden",
              "bg-gradient-to-br from-yellow-500 via-yellow-400 to-amber-500 rounded-lg",
              "border-4 border-yellow-600/50",
              isOpened && "opacity-0"
            )}
          >
            <div className="text-center space-y-4">
              <span className="text-8xl font-bold text-white drop-shadow-lg">25</span>
              {!isVip && (
                <div className="flex flex-col items-center gap-2 px-4">
                  <Lock className="w-8 h-8 text-white animate-pulse" />
                  <span className="text-sm font-bold text-white bg-black/30 px-3 py-1 rounded-full">
                    VIP ONLY
                  </span>
                </div>
              )}
              {!isOpened && (
                <div className="absolute top-4 right-4">
                  <div className="w-4 h-4 rounded-full bg-white animate-sparkle" />
                </div>
              )}
            </div>
          </div>

          {/* Back of door */}
          <div
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center p-4",
              "bg-gradient-to-br from-card to-muted rounded-lg border-4 border-yellow-500",
              "transition-opacity duration-300",
              isOpened ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="text-center space-y-2">
              <Gift className="w-16 h-16 mx-auto text-primary animate-float" />
              <p className="text-lg font-bold text-primary">
                🎄 Merry Christmas! 🎄
              </p>
              <p className="text-sm text-card-foreground">
                Click to watch the special video!
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Dialog open={showContent} onOpenChange={setShowContent}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-3xl text-center bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              🎄 Christmas Day Special! 🎁
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="aspect-video w-full">
              <iframe
                className="w-full h-full rounded-lg"
                src="https://www.youtube.com/embed/yXQViqx6GMY"
                title="Christmas Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="text-center space-y-2 p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg">
              <p className="text-xl font-bold text-primary">
                🎅 Special Christmas Joke 🎅
              </p>
              <p className="text-lg text-card-foreground">
                What's the absolute best Christmas present? 🎁<br />
                <span className="text-primary font-semibold">A broken drum - you just can't beat it! 🥁</span>
              </p>
              <p className="text-2xl mt-4">
                🎄 Merry Christmas Everyone! 🎄
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
