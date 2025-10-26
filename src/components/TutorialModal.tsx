import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles, MousePointerClick } from "lucide-react";

export const TutorialModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showGift, setShowGift] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem("advent-tutorial-seen");
    if (!hasSeenTutorial) {
      // Delay to let page load
      setTimeout(() => {
        setIsOpen(true);
        // Trigger gift animation
        setTimeout(() => setShowGift(true), 300);
      }, 500);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("advent-tutorial-seen", "true");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md overflow-hidden border-2 border-primary/20">
        {/* Animated background sparkles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <Sparkles
              key={i}
              className="absolute text-accent animate-sparkle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.2}s`,
                opacity: 0.6,
              }}
              size={16}
            />
          ))}
        </div>

        <div className="relative text-center space-y-6 py-4">
          {/* Door Animation */}
          <div className="relative w-full h-48 flex items-center justify-center">
            {/* Door frame */}
            <div className="relative w-32 h-40 perspective-1000">
              {/* Closed door that opens */}
              <div
                className={`absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-lg border-4 border-accent/30 flex items-center justify-center transition-all duration-1000 origin-left ${
                  showGift ? "rotate-y-[-120deg] opacity-30" : ""
                }`}
                style={{
                  transformStyle: "preserve-3d",
                  transform: showGift ? "perspective(1000px) rotateY(-120deg)" : "none",
                }}
              >
                <span className="text-4xl font-bold text-primary-foreground">24</span>
              </div>

              {/* Gift coming out */}
              <div
                className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${
                  showGift
                    ? "translate-y-0 opacity-100 scale-100"
                    : "translate-y-12 opacity-0 scale-50"
                }`}
              >
                <Gift
                  className="text-primary animate-float"
                  size={64}
                  style={{ filter: "drop-shadow(0 0 20px rgba(220, 38, 38, 0.5))" }}
                />
              </div>
            </div>
          </div>

          {/* Tutorial text */}
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: "1s" }}>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Welcome to Your Advent Calendar!
            </h2>
            
            <div className="space-y-3 text-left bg-muted/50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <MousePointerClick className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <p className="text-sm text-foreground">
                  <strong>Click any door</strong> to reveal a hilarious Christmas joke with animated illustration
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Gift className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
                <p className="text-sm text-foreground">
                  <strong>24 unique jokes</strong> with fun cartoons to make you laugh through December
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                <p className="text-sm text-foreground">
                  <strong>Animated illustrations</strong> that float and bring each joke to life!
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleClose}
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
          >
            Start Unwrapping! 🎁
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
