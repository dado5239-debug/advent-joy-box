import { useState, useEffect } from "react";
import { CalendarDoor } from "./CalendarDoor";
import joke1 from "@/assets/jokes/joke-1.jpg";
import joke2 from "@/assets/jokes/joke-2.jpg";
import joke3 from "@/assets/jokes/joke-3.jpg";
import joke4 from "@/assets/jokes/joke-4.jpg";
import joke5 from "@/assets/jokes/joke-5.jpg";
import joke6 from "@/assets/jokes/joke-6.jpg";

const dailyContent = [
  {
    text: "What do you call an obnoxious reindeer? 🦌 Rude-olph!",
    image: joke1,
  },
  {
    text: "Why was the snowman looking through the carrots? 🥕 He was picking his nose!",
    image: joke2,
  },
  {
    text: "What do you call a broke Santa? 🎅 Saint-Nickel-less!",
    image: joke3,
  },
  {
    text: "What's Santa's favorite type of music? 🎵 Wrap music!",
    image: joke4,
  },
  {
    text: "Why did the Christmas tree go to the barber? ✂️ It needed a trim!",
    image: joke5,
  },
  {
    text: "What do elves learn in school? 📚 The elf-abet!",
    image: joke6,
  },
  {
    text: "What do snowmen eat for breakfast? ❄️ Frosted Flakes!",
    image: joke2,
  },
  {
    text: "Why don't you ever see Santa in the hospital? 🏥 He has private elf care!",
    image: joke3,
  },
  {
    text: "What do you get when you cross a snowman and a vampire? ⛄ Frostbite!",
    image: joke2,
  },
  {
    text: "How does a sheep say Merry Christmas? 🐑 Fleece Navidad!",
    image: joke1,
  },
  {
    text: "What's a Christmas tree's favorite candy? 🍭 Orna-mints!",
    image: joke5,
  },
  {
    text: "Why did Santa's helper see the doctor? 🩺 He had low elf esteem!",
    image: joke6,
  },
  {
    text: "What do you call a kid who doesn't believe in Santa? 🎅 A rebel without a Claus!",
    image: joke3,
  },
  {
    text: "How much did Santa pay for his sleigh? 💰 Nothing, it was on the house!",
    image: joke4,
  },
  {
    text: "What do you get if you eat Christmas decorations? 🎄 Tinselitis!",
    image: joke5,
  },
  {
    text: "Why is Christmas just like work? 🎁 You do all the work and the fat guy in the suit gets all the credit!",
    image: joke3,
  },
  {
    text: "What's the best Christmas present ever? 🤔 A broken drum - you can't beat it!",
    image: joke4,
  },
  {
    text: "What do you call Santa when he takes a break? ☕ Santa Pause!",
    image: joke3,
  },
  {
    text: "What does Santa suffer from if he gets stuck in a chimney? 🏠 Claustrophobia!",
    image: joke3,
  },
  {
    text: "Why don't crabs celebrate Christmas? 🦀 Because they're shell-fish!",
    image: joke2,
  },
  {
    text: "What do you call a scary-looking reindeer? 👻 A cari-boo!",
    image: joke1,
  },
  {
    text: "What's red, white and blue at Christmas? 🎅 A sad candy cane!",
    image: joke3,
  },
  {
    text: "Why did Rudolph get a bad report card? 📝 Because he went down in history!",
    image: joke1,
  },
  {
    text: "What says 'Oh Oh Oh'? 🎅 Santa walking backwards!",
    image: joke3,
  },
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
        {dailyContent.map((content, index) => {
          const day = index + 1;
          return (
            <CalendarDoor
              key={day}
              day={day}
              content={content.text}
              image={content.image}
              isOpened={openedDoors.has(day)}
              onOpen={() => handleOpenDoor(day)}
            />
          );
        })}
      </div>
    </div>
  );
};
