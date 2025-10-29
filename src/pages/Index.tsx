import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdventCalendar } from "@/components/AdventCalendar";
import { TutorialModal } from "@/components/TutorialModal";
import { VillageMaker } from "@/components/VillageMaker";
import { DrawingCanvas } from "@/components/DrawingCanvas";
import { MiniCalendar } from "@/components/MiniCalendar";
import { ChristmasCountdown } from "@/components/ChristmasCountdown";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import adventHero from "@/assets/advent-hero.jpg";
import { Sparkles, Gift, LogOut, User, Library, Home, Users } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      setProfile(null);
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    setProfile(data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
  };
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
            
            {user ? (
              <div className="flex gap-2 items-center flex-wrap">
                {profile && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border-2 border-primary/20">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={profile.avatar_url} alt={profile.name} />
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{profile.name}</span>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/library")}
                  className="gap-2"
                >
                  <Library className="w-4 h-4" />
                  My Drawings
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/my-villages")}
                  className="gap-2"
                >
                  <Home className="w-4 h-4" />
                  My Villages
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                variant="green"
                size="lg"
                onClick={() => navigate("/auth")}
                className="gap-2"
              >
                <User className="w-4 h-4" />
                Sign Up
              </Button>
            )}
          </div>
          
          <div className="flex gap-4 justify-center items-center flex-wrap mt-4">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate("/community")}
              className="gap-2"
            >
              <Users className="w-4 h-4" />
              Community Gallery
            </Button>
            <MiniCalendar />
            <VillageMaker />
            <DrawingCanvas />
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

      {/* Countdown Section */}
      <div className="container mx-auto px-4 py-8">
        <ChristmasCountdown />
      </div>

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
