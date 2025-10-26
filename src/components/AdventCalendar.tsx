import { useState, useEffect } from "react";
import { CalendarDoor } from "./CalendarDoor";

const dailyContent = [
  "What do you call an obnoxious reindeer? 🦌 Rude-olph!",
  "Why was the snowman looking through the carrots? 🥕 He was picking his nose!",
  "What do you call a broke Santa? 🎅 Saint-Nickel-less!",
  "What's Santa's favorite type of music? 🎵 Wrap music!",
  "Why did the Christmas tree go to the barber? ✂️ It needed a trim!",
  "What do elves learn in school? 📚 The elf-abet!",
  "What do snowmen eat for breakfast? ❄️ Frosted Flakes!",
  "Why don't you ever see Santa in the hospital? 🏥 He has private elf care!",
  "What do you get when you cross a snowman and a vampire? ⛄ Frostbite!",
  "How does a sheep say Merry Christmas? �양 Fleece Navidad!",
  "What's a Christmas tree's favorite candy? 🍭 Orna-mints!",
  "Why did Santa's helper see the doctor? 🩺 He had low elf esteem!",
  "What do you call a kid who doesn't believe in Santa? 🎅 A rebel without a Claus!",
  "How much did Santa pay for his sleigh? 💰 Nothing, it was on the house!",
  "What do you get if you eat Christmas decorations? 🎄 Tinselitis!",
  "Why is Christmas just like work? 🎁 You do all the work and the fat guy in the suit gets all the credit!",
  "What's the best Christmas present ever? 🤔 A broken drum - you can't beat it!",
  "What do you call Santa when he takes a break? ☕ Santa Pause!",
  "What does Santa suffer from if he gets stuck in a chimney? 🏠 Claustrophobia!",
  "Why don't crabs celebrate Christmas? 🦀 Because they're shell-fish!",
  "What do you call a scary-looking reindeer? 👻 A cari-boo!",
  "What's red, white and blue at Christmas? 🎅 A sad candy cane!",
  "Why did Rudolph get a bad report card? 📝 Because he went down in history!",
  "What says 'Oh Oh Oh'? 🎅 Santa walking backwards!",
];

export const AdventCalendar = () => {
  const [openedDoors, setOpenedDoors] = useState<Set<number>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem("advent-calendar-opened");
    if (saved) {
      setOpenedDoors(new Set(JSON.parse(saved)));
    }
  }, []);

  const handleOpenDoor = (day: number) => {
    const newOpened = new Set(openedDoors);
    newOpened.add(day);
    setOpenedDoors(newOpened);
    localStorage.setItem("advent-calendar-opened", JSON.stringify([...newOpened]));
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[...Array(24)].map((_, index) => {
          const day = index + 1;
          return (
            <CalendarDoor
              key={day}
              day={day}
              content={dailyContent[index]}
              isOpened={openedDoors.has(day)}
              onOpen={() => handleOpenDoor(day)}
            />
          );
        })}
      </div>
    </div>
  );
};
