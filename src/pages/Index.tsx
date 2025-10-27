import { AdventCalendar } from "@/components/AdventCalendar";
import { TutorialModal } from "@/components/TutorialModal";
import { VillageMaker } from "@/components/VillageMaker";
import { Button } from "@/components/ui/button";
import adventHero from "@/assets/advent-hero.jpg";
import { Sparkles, Gift } from "lucide-react";

const Index = () => {
  const resetCalendar = () => {
    localStorage.removeItem("advent-calendar-opened");
    localStorage.removeItem("advent-tutorial-seen");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <TutorialModal />
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={adventHero}
            alt="Festive winter scene with snow-covered trees and twinkling lights"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        </div>
        
        <div className="relative container mx-auto px-4 py-16 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gift className="w-8 h-8 text-primary animate-float" />
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Advent Calendar
            </h1>
            <Sparkles className="w-8 h-8 text-accent animate-sparkle" />
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Unwrap a daily Christmas joke with animated illustrations! Click each door to reveal hilarious holiday humor from December 1st to 24th. 🎅😂
          </p>
          <div className="flex gap-4 justify-center items-center flex-wrap">
            <div className="px-6 py-3 bg-card rounded-full border-2 border-primary/20 shadow-md">
              <span className="text-sm font-medium text-muted-foreground">
                🎄 Count down to Christmas with joy!
              </span>
            </div>
            <VillageMaker />
            <Button
              variant="outline"
              size="sm"
              onClick={resetCalendar}
              className="gap-2"
            >
              Reset Calendar
            </Button>
          </div>
        </div>
      </header>

      {/* Calendar Section */}
      <main className="container mx-auto px-4 pb-16">
        <AdventCalendar />
      </main>

      {/* Footer */}
      <footer className="text-center py-8 border-t border-border/50">
        <p className="text-sm text-muted-foreground">
          Made with ❤️ for the holiday season • 24 hilarious Christmas jokes with animated illustrations! 🎄
        </p>
      </footer>
    </div>
  );
};

export default Index;
