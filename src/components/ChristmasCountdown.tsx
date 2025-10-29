import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const ChristmasCountdown = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const christmas = new Date(currentYear, 11, 25); // December 25

      // If Christmas has passed this year, calculate for next year
      if (now > christmas) {
        christmas.setFullYear(currentYear + 1);
      }

      const difference = christmas.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-2 border-primary/20">
      <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
        🎄 Time Until Christmas 🎄
      </h2>
      <div className="grid grid-cols-4 gap-4">
        <div className="flex flex-col items-center">
          <div className="text-4xl md:text-5xl font-bold text-primary">
            {timeLeft.days}
          </div>
          <div className="text-sm md:text-base text-muted-foreground font-medium">
            Days
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-4xl md:text-5xl font-bold text-secondary">
            {timeLeft.hours}
          </div>
          <div className="text-sm md:text-base text-muted-foreground font-medium">
            Hours
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-4xl md:text-5xl font-bold text-accent">
            {timeLeft.minutes}
          </div>
          <div className="text-sm md:text-base text-muted-foreground font-medium">
            Minutes
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-4xl md:text-5xl font-bold text-primary">
            {timeLeft.seconds}
          </div>
          <div className="text-sm md:text-base text-muted-foreground font-medium">
            Seconds
          </div>
        </div>
      </div>
    </Card>
  );
};
