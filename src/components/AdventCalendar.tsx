import { useState, useEffect } from "react";
import { CalendarDoor } from "./CalendarDoor";

const dailyContent = [
  "May your days be merry and bright! 🎄",
  "Believe in the magic of the season ✨",
  "Spread joy and kindness today 💝",
  "Hot cocoa and cozy vibes ☕",
  "Every snowflake is unique, just like you ❄️",
  "The best way to spread cheer is singing loud 🎵",
  "Make someone smile today 😊",
  "Twinkling lights bring warm delights 💡",
  "Cookie baking time! 🍪",
  "Family, friends, and festive fun 👨‍👩‍👧‍👦",
  "Let it snow, let it snow! ⛄",
  "Jingle all the way 🔔",
  "Peace, love, and hot chocolate 🤍",
  "Santa's workshop is busy tonight 🎅",
  "Make memories, not just moments 📸",
  "Cozy sweaters and warm hearts 🧣",
  "The magic is real if you believe 🌟",
  "Gingerbread house building day 🏠",
  "Caroling brings hearts together 🎶",
  "Wrapped with love 🎁",
  "Count your blessings, not just presents 🙏",
  "The season of giving begins 💖",
  "Almost here! Can you feel the magic? ✨",
  "Merry Christmas Eve! Tomorrow's the big day! 🎄🎅",
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
