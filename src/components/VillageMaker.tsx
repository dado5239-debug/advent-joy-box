import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home, Trees, Snowflake, Star, Church, Gift, User, Users, Baby, Dog, Cat, Bird, Rabbit, Squirrel, Save, Apple, Droplet, Gamepad2, Play, Hammer, Moon, Sun, Armchair, Lamp, Bed, TentTree, Edit2, MapPin, Tv, Frame, Refrigerator, Smartphone, School, BookOpen, Pencil, Calculator, Map } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { useVillageSounds } from "@/hooks/useVillageSounds";
import { PhoneModal } from "./PhoneModal";

interface VillageItem {
  id: string;
  type: string;
  x: number;
  y: number;
  icon: any;
  speech?: string;
  showSpeech?: boolean;
  age?: number; // 0 = baby, 100 = adult
  size?: number; // 0.5 = baby, 1 = adult
  wood?: number; // wood inventory
  food?: number; // food inventory
  water?: number; // water inventory
  hunger?: number; // 100 = full, 0 = starving
  thirst?: number; // 100 = hydrated, 0 = dehydrated
  toys?: number; // toys inventory
  interior?: VillageItem[]; // items inside this house/school
  currentHouse?: string; // id of house the person is in
  currentSchool?: string; // id of school the person is in
  name?: string; // name for living items
  lifeYears?: number; // years lived
  gender?: 'male' | 'female'; // gender
  emotion?: 'happy' | 'sad' | 'neutral' | 'excited' | 'tired'; // current emotion
  familyId?: string; // family identifier
  isMarried?: boolean; // married status
  ageStage?: 'baby' | 'kid' | 'teenager' | 'adult'; // current age stage
}

interface HouseInteriorItem {
  id: string;
  type: string;
  x: number;
  y: number;
  icon: any;
}

const ITEMS = [
  { type: "house", icon: Home, label: "House", color: "text-red-500", isLiving: false },
  { type: "school", icon: School, label: "School", color: "text-indigo-600", isLiving: false },
  { type: "tree", icon: Trees, label: "Tree", color: "text-green-600", isLiving: false, canBeChopped: true },
  { type: "church", icon: Church, label: "Church", color: "text-amber-700", isLiving: false },
  { type: "gift", icon: Gift, label: "Gift", color: "text-pink-500", isLiving: false, canBeOpened: true },
  { type: "snowflake", icon: Snowflake, label: "Snowflake", color: "text-blue-300", isLiving: false },
  { type: "snow", icon: Snowflake, label: "Snow", color: "text-blue-200", isLiving: false },
  { type: "snowman", icon: Snowflake, label: "Snowman", color: "text-white", isLiving: false },
  { type: "star", icon: Star, label: "Star", color: "text-yellow-400", isLiving: false },
  { type: "lake", icon: Snowflake, label: "Lake", color: "text-blue-500", isLiving: false, isWaterSource: true },
  { type: "food-item", icon: Apple, label: "Food", color: "text-red-400", isLiving: false, isFood: true },
  { type: "water-item", icon: Droplet, label: "Water", color: "text-blue-400", isLiving: false, isWater: true },
  { type: "toy", icon: Gamepad2, label: "Toy", color: "text-purple-400", isLiving: false, isToy: true },
  { type: "park", icon: TentTree, label: "Park", color: "text-green-500", isLiving: false, isPark: true },
  { type: "teacher", icon: User, label: "Teacher", color: "text-purple-700", isLiving: true, babyType: "baby" },
  { type: "man", icon: User, label: "Man", color: "text-blue-600", isLiving: true, babyType: "baby" },
  { type: "woman", icon: User, label: "Woman", color: "text-pink-600", isLiving: true, babyType: "baby" },
  { type: "kid", icon: User, label: "Kid", color: "text-cyan-500", isLiving: true, growsInto: "teenager" },
  { type: "teenager", icon: User, label: "Teenager", color: "text-indigo-500", isLiving: true, growsInto: "person" },
  { type: "person", icon: User, label: "Person", color: "text-blue-500", isLiving: true, babyType: "baby" },
  { type: "family", icon: Users, label: "Family", color: "text-purple-500", isLiving: true, babyType: "baby" },
  { type: "baby", icon: Baby, label: "Baby", color: "text-pink-400", isLiving: true, growsInto: "kid" },
  { type: "dog", icon: Dog, label: "Dog", color: "text-amber-600", isLiving: true, babyType: "puppy" },
  { type: "puppy", icon: Dog, label: "Puppy", color: "text-amber-400", isLiving: true, growsInto: "dog" },
  { type: "cat", icon: Cat, label: "Cat", color: "text-orange-500", isLiving: true, babyType: "kitten" },
  { type: "kitten", icon: Cat, label: "Kitten", color: "text-orange-300", isLiving: true, growsInto: "cat" },
  { type: "bird", icon: Bird, label: "Bird", color: "text-sky-400", isLiving: true, babyType: "chick" },
  { type: "chick", icon: Bird, label: "Chick", color: "text-yellow-300", isLiving: true, growsInto: "bird" },
  { type: "rabbit", icon: Rabbit, label: "Rabbit", color: "text-gray-400", isLiving: true, babyType: "bunny" },
  { type: "bunny", icon: Rabbit, label: "Bunny", color: "text-gray-300", isLiving: true, growsInto: "rabbit" },
  { type: "squirrel", icon: Squirrel, label: "Squirrel", color: "text-amber-500", isLiving: true, babyType: "kit" },
  { type: "kit", icon: Squirrel, label: "Kit", color: "text-amber-300", isLiving: true, growsInto: "squirrel" },
];

const INTERIOR_ITEMS = [
  { type: "bed", icon: Bed, label: "Bed", color: "text-blue-600" },
  { type: "chair", icon: Armchair, label: "Chair", color: "text-amber-600" },
  { type: "lamp", icon: Lamp, label: "Lamp", color: "text-yellow-500" },
  { type: "tree-decor", icon: Trees, label: "Xmas Tree", color: "text-green-500" },
  { type: "star-decor", icon: Star, label: "Star Decor", color: "text-yellow-400" },
  { type: "gift-decor", icon: Gift, label: "Gift Decor", color: "text-pink-400" },
  { type: "fridge", icon: Refrigerator, label: "Fridge", color: "text-slate-400" },
  { type: "tv", icon: Tv, label: "TV", color: "text-gray-700" },
  { type: "painting", icon: Frame, label: "Painting", color: "text-amber-500" },
  { type: "phone", icon: Smartphone, label: "Mobile Phone", color: "text-blue-500" },
];

const SCHOOL_ITEMS = [
  { type: "desk", icon: Armchair, label: "Desk", color: "text-brown-600" },
  { type: "blackboard", icon: BookOpen, label: "Blackboard", color: "text-slate-700" },
  { type: "book", icon: BookOpen, label: "Book", color: "text-blue-600" },
  { type: "pencil", icon: Pencil, label: "Pencil", color: "text-yellow-600" },
  { type: "calculator", icon: Calculator, label: "Calculator", color: "text-gray-600" },
];

const SPEECH_OPTIONS = [
  "Merry Christmas! 🎄",
  "Happy Holidays! ⛄",
  "Ho Ho Ho! 🎅",
  "Jingle Bells! 🔔",
  "Joy to the World! ✨",
  "Fa La La! 🎶",
  "Peace on Earth! ☮️",
  "Season's Greetings! 🎁",
  "Deck the Halls! 🌟",
  "Let it Snow! ❄️",
];

const PERSON_NAMES = [
  "Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason",
  "Isabella", "William", "Mia", "James", "Charlotte", "Benjamin", "Amelia",
  "Lucas", "Harper", "Henry", "Evelyn", "Alexander", "Abigail", "Michael",
  "Emily", "Daniel", "Elizabeth", "Matthew", "Sofia", "David", "Avery"
];

const ANIMAL_NAMES = [
  "Max", "Bella", "Charlie", "Luna", "Buddy", "Daisy", "Rocky", "Lucy",
  "Cooper", "Sadie", "Duke", "Molly", "Bear", "Lola", "Tucker", "Bailey",
  "Jack", "Maggie", "Oliver", "Sophie", "Zeus", "Chloe", "Bentley", "Penny"
];

const generateName = (type: string): string => {
  const isAnimal = ["dog", "puppy", "cat", "kitten", "bird", "chick", "rabbit", "bunny", "squirrel", "kit"].includes(type);
  const names = isAnimal ? ANIMAL_NAMES : PERSON_NAMES;
  return names[Math.floor(Math.random() * names.length)];
};

const getEmotionEmoji = (emotion?: string): string => {
  switch(emotion) {
    case 'happy': return '😊';
    case 'sad': return '😢';
    case 'excited': return '😃';
    case 'tired': return '😴';
    default: return '😐';
  }
};

const randomEmotion = (): 'happy' | 'sad' | 'neutral' | 'excited' | 'tired' => {
  const emotions: ('happy' | 'sad' | 'neutral' | 'excited' | 'tired')[] = ['happy', 'sad', 'neutral', 'excited', 'tired'];
  return emotions[Math.floor(Math.random() * emotions.length)];
};

export const VillageMaker = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [placedItems, setPlacedItems] = useState<VillageItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState("My Christmas Village");
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [startingYear, setStartingYear] = useState(new Date().getFullYear());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [exploreMode, setExploreMode] = useState(false);
  const [playerPos, setPlayerPos] = useState({ x: 400, y: 300 });
  const [viewingHouse, setViewingHouse] = useState<string | null>(null);
  const [viewingSchool, setViewingSchool] = useState<string | null>(null);
  const [timeOfDay, setTimeOfDay] = useState(12); // 0-24 hours, 12 = noon
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [tvNewsOpen, setTvNewsOpen] = useState(false);
  const [villageNews, setVillageNews] = useState<string[]>([]);
  const { playSound } = useVillageSounds();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // WASD controls for explore mode
  useEffect(() => {
    if (!exploreMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const speed = 10;
      setPlayerPos(prev => {
        let newX = prev.x;
        let newY = prev.y;

        switch(e.key.toLowerCase()) {
          case 'w':
            newY = Math.max(50, prev.y - speed);
            break;
          case 'a':
            newX = Math.max(50, prev.x - speed);
            break;
          case 's':
            newY = Math.min(550, prev.y + speed);
            break;
          case 'd':
            newX = Math.min(750, prev.x + speed);
            break;
        }

        return { x: newX, y: newY };
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [exploreMode]);

  // Animation loop for living items
  useEffect(() => {
    const interval = setInterval(() => {
      // Increment year every cycle (2 seconds = 1 year in village time)
      setCurrentYear(prev => prev + 1);
      
      // Advance time of day (2 hours per cycle)
      setTimeOfDay(prev => (prev + 2) % 24);
      
      setPlacedItems(prev => {
        let newItems = [...prev];
        const livingItems = newItems.filter(item => ITEMS.find(i => i.type === item.type)?.isLiving);
        const trees = newItems.filter(item => item.type === "tree");
        const lakes = newItems.filter(item => item.type === "lake");
        const foodItems = newItems.filter(item => item.type === "food-item");
        const waterItems = newItems.filter(item => item.type === "water-item");
        const presents = newItems.filter(item => item.type === "gift");
        const toyItems = newItems.filter(item => item.type === "toy");
        const houses = newItems.filter(item => item.type === "house");
        const schools = newItems.filter(item => item.type === "school");
        const parks = newItems.filter(item => item.type === "park");
        
        const isNight = timeOfDay >= 20 || timeOfDay < 6;
        const isSchoolTime = timeOfDay >= 8 && timeOfDay < 15 && !isNight;
        
        // Update existing items
        newItems = newItems.map(item => {
          const itemConfig = ITEMS.find(i => i.type === item.type);
          if (!itemConfig?.isLiving) return item;

          // Initialize resources if not present
          const currentHunger = item.hunger ?? 100;
          const currentThirst = item.thirst ?? 100;
          const currentWood = item.wood ?? 0;
          const currentFood = item.food ?? 0;
          const currentWater = item.water ?? 0;
          const currentToys = item.toys ?? 0;
          const currentLifeYears = item.lifeYears ?? 0;

          // Decrease hunger and thirst over time
          let newHunger = Math.max(0, currentHunger - 1);
          let newThirst = Math.max(0, currentThirst - 2);
          let newWood = currentWood;
          let newFood = currentFood;
          let newWater = currentWater;
          let newToys = currentToys;
          let newLifeYears = currentLifeYears + 1;
          let newEmotion = item.emotion || randomEmotion();
          
          // Randomly change emotion
          if (Math.random() < 0.1) {
            newEmotion = randomEmotion();
          }

          // Die if starving or dehydrated
          if (newHunger <= 0 || newThirst <= 0) {
            toast.error(`${item.name || 'Someone'} died from ${newHunger <= 0 ? 'starvation' : 'dehydration'}! 💀`);
            return null; // Mark for removal
          }

          // Dogs die at 87 years
          if ((item.type === "dog" || item.type === "puppy") && newLifeYears >= 87) {
            toast.error(`${item.name || 'A dog'} died of old age at 87! 🐕💀`);
            return null;
          }

          // People die at 93 years old and drop 30 food
          if ((item.type === "person" || item.type === "man" || item.type === "woman" || item.type === "teenager" || item.type === "kid") && newLifeYears >= 93) {
            toast.error(`${item.name || 'Someone'} died of old age at 93! 💀`);
            // Drop 30 food at death location (3 items x 10 food each)
            for (let i = 0; i < 3; i++) {
              const foodDrop: VillageItem = {
                id: `food-drop-${Date.now()}-${Math.random()}`,
                type: "food-item",
                x: item.x + (Math.random() - 0.5) * 40,
                y: item.y + (Math.random() - 0.5) * 40,
                icon: Apple,
              };
              newItems.push(foodDrop);
            }
            return null; // Mark for removal
          }

          // Age stage transitions: kid at 13 -> teenager
          if (item.type === "kid" && newLifeYears >= 13) {
            return {
              ...item,
              type: "teenager",
              ageStage: "teenager",
              lifeYears: newLifeYears,
              hunger: newHunger,
              thirst: newThirst,
              emotion: newEmotion,
              speech: "🎉 I'm a teenager now!",
              showSpeech: true,
            };
          }

          // School time behavior - kids, teenagers (under 18), and teachers go to school
          if (isSchoolTime && (item.type === "kid" || (item.type === "teenager" && newLifeYears < 18) || item.type === "teacher") && !item.currentSchool) {
            const nearbySchool = schools.find(school => {
              const distance = Math.sqrt(Math.pow(school.x - item.x, 2) + Math.pow(school.y - item.y, 2));
              return distance < 60;
            });
            
            if (nearbySchool) {
              return {
                ...item,
                currentSchool: nearbySchool.id,
                speech: item.type === "teacher" ? "👩‍🏫 Time to teach!" : "📚 Going to school...",
                showSpeech: true,
                hunger: newHunger,
                thirst: newThirst,
                lifeYears: newLifeYears,
                emotion: newEmotion,
              };
            } else {
              const nearestSchool = schools.reduce((nearest, school) => {
                const distance = Math.sqrt(Math.pow(school.x - item.x, 2) + Math.pow(school.y - item.y, 2));
                const nearestDistance = nearest ? Math.sqrt(Math.pow(nearest.x - item.x, 2) + Math.pow(nearest.y - item.y, 2)) : Infinity;
                return distance < nearestDistance ? school : nearest;
              }, null as VillageItem | null);
              
              if (nearestSchool) {
                const dx = nearestSchool.x - item.x;
                const dy = nearestSchool.y - item.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const moveX = (dx / distance) * 15;
                const moveY = (dy / distance) * 15;
                
                return {
                  ...item,
                  x: Math.max(50, Math.min(item.x + moveX, 750)),
                  y: Math.max(50, Math.min(item.y + moveY, 550)),
                  speech: "📖 Time for school...",
                  showSpeech: Math.random() < 0.2,
                  hunger: newHunger,
                  thirst: newThirst,
                  lifeYears: newLifeYears,
                  emotion: newEmotion,
                };
              }
            }
          }
          
          // Leave school after school time OR when turning 18
          if (((!isSchoolTime || newLifeYears >= 18) && item.currentSchool) || (item.type === "teenager" && newLifeYears >= 18 && item.currentSchool)) {
            const school = schools.find(s => s.id === item.currentSchool);
            if (school) {
              return {
                ...item,
                currentSchool: undefined,
                x: school.x + (Math.random() - 0.5) * 50,
                y: school.y + (Math.random() - 0.5) * 50,
                speech: newLifeYears >= 18 ? "🎓 I'm done with school!" : "🎒 School's out!",
                showSpeech: true,
                hunger: newHunger,
                thirst: newThirst,
                lifeYears: newLifeYears,
                emotion: newEmotion,
              };
            }
          }
          
          // If in school during school time, learn math
          if (item.currentSchool && isSchoolTime) {
            const speech = item.type === "teacher" 
              ? (Math.random() < 0.1 ? "👩‍🏫 Teaching math!" : undefined)
              : (Math.random() < 0.1 ? "🧮 Learning math!" : undefined);
            return {
              ...item,
              hunger: newHunger,
              thirst: newThirst,
              speech,
              showSpeech: !!speech,
              lifeYears: newLifeYears,
              emotion: newEmotion,
            };
          }

          // Night time behavior - seek house to sleep
          if (isNight && !item.currentHouse && !item.currentSchool) {
            const nearbyHouse = houses.find(house => {
              const distance = Math.sqrt(Math.pow(house.x - item.x, 2) + Math.pow(house.y - item.y, 2));
              return distance < 60;
            });
            
            if (nearbyHouse) {
              // Enter house to sleep
              return {
                ...item,
                currentHouse: nearbyHouse.id,
                speech: "😴 Going to sleep...",
                showSpeech: true,
                hunger: newHunger,
                thirst: newThirst,
                lifeYears: newLifeYears,
                emotion: newEmotion,
              };
            } else {
              // Move towards nearest house
              const nearestHouse = houses.reduce((nearest, house) => {
                const distance = Math.sqrt(Math.pow(house.x - item.x, 2) + Math.pow(house.y - item.y, 2));
                const nearestDistance = nearest ? Math.sqrt(Math.pow(nearest.x - item.x, 2) + Math.pow(nearest.y - item.y, 2)) : Infinity;
                return distance < nearestDistance ? house : nearest;
              }, null as VillageItem | null);
              
              if (nearestHouse) {
                const dx = nearestHouse.x - item.x;
                const dy = nearestHouse.y - item.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const moveX = (dx / distance) * 15;
                const moveY = (dy / distance) * 15;
                
                return {
                  ...item,
                  x: Math.max(50, Math.min(item.x + moveX, 750)),
                  y: Math.max(50, Math.min(item.y + moveY, 550)),
                  speech: "🌙 Time for bed...",
                  showSpeech: Math.random() < 0.2,
                  hunger: newHunger,
                  thirst: newThirst,
                  lifeYears: newLifeYears,
                  emotion: newEmotion,
                };
              }
            }
          }
          
          // Day time - dynamic house exit/entry
          if (!isNight && item.currentHouse) {
            // Some people stay inside playing with toys
            if (newToys > 0 && Math.random() < 0.4) {
              return {
                ...item,
                hunger: newHunger,
                thirst: newThirst,
                speech: "🎮 Playing with toys!",
                showSpeech: Math.random() < 0.1,
                lifeYears: newLifeYears,
                emotion: newEmotion,
              };
            }
            
            // Random chance to leave house during day
            if (Math.random() < 0.3) {
              const house = houses.find(h => h.id === item.currentHouse);
              if (house) {
                return {
                  ...item,
                  currentHouse: undefined,
                  x: house.x + (Math.random() - 0.5) * 50,
                  y: house.y + (Math.random() - 0.5) * 50,
                  speech: "☀️ Going outside!",
                  showSpeech: true,
                  hunger: newHunger,
                  thirst: newThirst,
                  lifeYears: newLifeYears,
                  emotion: newEmotion,
                };
              }
            }
          }
          
          // During day, people can randomly enter houses
          if (!isNight && !item.currentHouse && !item.currentSchool && !isSchoolTime && Math.random() < 0.05) {
            const nearbyHouse = houses.find(house => {
              const distance = Math.sqrt(Math.pow(house.x - item.x, 2) + Math.pow(house.y - item.y, 2));
              return distance < 60;
            });
            
            if (nearbyHouse) {
              return {
                ...item,
                currentHouse: nearbyHouse.id,
                speech: "🏠 Going inside...",
                showSpeech: true,
                hunger: newHunger,
                thirst: newThirst,
                lifeYears: newLifeYears,
                emotion: newEmotion,
              };
            }
          }
          
          // If inside house, skip all outdoor activities
          if (item.currentHouse) {
            return {
              ...item,
              hunger: newHunger,
              thirst: newThirst,
              lifeYears: newLifeYears,
            };
          }

          // Random movement (walking) - only during day
          let moveX = (Math.random() - 0.5) * 20;
          let moveY = (Math.random() - 0.5) * 20;
          
          // Sometimes go to park to play
          if (!isNight && Math.random() < 0.1) {
            const nearbyPark = parks.find(park => {
              const distance = Math.sqrt(Math.pow(park.x - item.x, 2) + Math.pow(park.y - item.y, 2));
              return distance < 60;
            });
            
            if (nearbyPark && Math.random() < 0.3) {
              return {
                ...item,
                speech: "🎮 Playing in the park!",
                showSpeech: true,
                x: nearbyPark.x + (Math.random() - 0.5) * 30,
                y: nearbyPark.y + (Math.random() - 0.5) * 30,
                hunger: newHunger,
                thirst: newThirst,
                wood: newWood,
                food: newFood,
                water: newWater,
                toys: newToys,
                lifeYears: newLifeYears,
              };
            }
          }

          // Find nearest tree to chop
          if (item.type === "person" || item.type === "family") {
            const nearestTree = trees.find(tree => {
              const distance = Math.sqrt(Math.pow(tree.x - item.x, 2) + Math.pow(tree.y - item.y, 2));
              return distance < 40;
            });

            if (nearestTree && Math.random() < 0.3) {
              // Chop tree for wood
              const treeIndex = newItems.findIndex(i => i.id === nearestTree.id);
              if (treeIndex !== -1) {
                newItems.splice(treeIndex, 1);
                newWood += 3;
                toast.success("🪓 Chopped tree for wood!");
              }
            }

            // Build house if enough wood
            if (newWood >= 5 && Math.random() < 0.2) {
              const newHouse: VillageItem = {
                id: `house-${Date.now()}-${Math.random()}`,
                type: "house",
                x: item.x + 30,
                y: item.y + 30,
                icon: Home,
                interior: [], // Empty interior initially
              };
              newItems.push(newHouse);
              newWood -= 5;
              toast.success("🏠 Built a house!");
            }
            
            // Decorate houses automatically
            if (newToys > 0 && Math.random() < 0.15) {
              const nearbyHouse = houses.find(house => {
                const distance = Math.sqrt(Math.pow(house.x - item.x, 2) + Math.pow(house.y - item.y, 2));
                return distance < 50;
              });
              
              if (nearbyHouse && (!nearbyHouse.interior || nearbyHouse.interior.length < 10)) {
                const houseIndex = newItems.findIndex(h => h.id === nearbyHouse.id);
                if (houseIndex !== -1) {
                  const decorItem = INTERIOR_ITEMS[Math.floor(Math.random() * INTERIOR_ITEMS.length)];
                  const interior = nearbyHouse.interior || [];
                  interior.push({
                    id: `decor-${Date.now()}-${Math.random()}`,
                    type: decorItem.type,
                    x: 100 + Math.random() * 400,
                    y: 100 + Math.random() * 300,
                    icon: decorItem.icon,
                  });
                  newItems[houseIndex] = { ...nearbyHouse, interior };
                  newToys -= 1;
                  toast.success("🎨 Decorated house!");
                }
              }
            }

            // Break presents for toys
            const nearestPresent = presents.find(present => {
              const distance = Math.sqrt(Math.pow(present.x - item.x, 2) + Math.pow(present.y - item.y, 2));
              return distance < 40;
            });

            if (nearestPresent && Math.random() < 0.3) {
              const presentIndex = newItems.findIndex(i => i.id === nearestPresent.id);
              if (presentIndex !== -1) {
                newItems.splice(presentIndex, 1);
                newToys += 2;
                toast.success("🎁 Opened present and found toys!");
              }
            }
          }

          // Find nearest lake for water
          const nearestLake = lakes.find(lake => {
            const distance = Math.sqrt(Math.pow(lake.x - item.x, 2) + Math.pow(lake.y - item.y, 2));
            return distance < 40;
          });

          if (nearestLake && newThirst < 80) {
            newWater += 20;
            newThirst = Math.min(100, newThirst + 20);
          }

          // Pick up food items
          const nearbyFood = foodItems.find(food => {
            const distance = Math.sqrt(Math.pow(food.x - item.x, 2) + Math.pow(food.y - item.y, 2));
            return distance < 40;
          });

          if (nearbyFood) {
            const foodIndex = newItems.findIndex(i => i.id === nearbyFood.id);
            if (foodIndex !== -1) {
              newItems.splice(foodIndex, 1);
              newFood += 30;
              toast.success("🍎 Picked up food!");
            }
          }

          // Pick up water items
          const nearbyWater = waterItems.find(water => {
            const distance = Math.sqrt(Math.pow(water.x - item.x, 2) + Math.pow(water.y - item.y, 2));
            return distance < 40;
          });

          if (nearbyWater) {
            const waterIndex = newItems.findIndex(i => i.id === nearbyWater.id);
            if (waterIndex !== -1) {
              newItems.splice(waterIndex, 1);
              newWater += 30;
              newThirst = Math.min(100, newThirst + 30);
              toast.success("💧 Picked up water!");
            }
          }

          // Pick up toy items
          const nearbyToy = toyItems.find(toy => {
            const distance = Math.sqrt(Math.pow(toy.x - item.x, 2) + Math.pow(toy.y - item.y, 2));
            return distance < 40;
          });

          if (nearbyToy) {
            const toyIndex = newItems.findIndex(i => i.id === nearbyToy.id);
            if (toyIndex !== -1) {
              newItems.splice(toyIndex, 1);
              newToys += 1;
              toast.success("🎮 Picked up toy!");
            }
          }

          // Try to find food from trees
          const nearbyTree = trees.find(tree => {
            const distance = Math.sqrt(Math.pow(tree.x - item.x, 2) + Math.pow(tree.y - item.y, 2));
            return distance < 40;
          });

          if (nearbyTree && Math.random() < 0.1) {
            newFood += 10;
            toast.success("🍎 Found food from tree!");
          }

          // Consume food if hungry
          if (newHunger < 80 && newFood > 0) {
            const foodToEat = Math.min(newFood, 30);
            newFood -= foodToEat;
            newHunger = Math.min(100, newHunger + foodToEat);
          }

          // Grow babies and transform them into adults
          const currentAge = item.age ?? 100;
          const currentSize = item.size ?? 1;
          const newAge = Math.min(100, currentAge + 2);
          const newSize = Math.min(1, 0.5 + (newAge / 200));
          
          // Check if baby should grow into adult
          if (newAge >= 100 && itemConfig.growsInto) {
            const adultConfig = ITEMS.find(i => i.type === itemConfig.growsInto);
            if (adultConfig) {
              return {
                ...item,
                type: adultConfig.type,
                icon: adultConfig.icon,
                age: 100,
                size: 1,
                x: Math.max(50, Math.min(item.x + moveX, 750)),
                y: Math.max(50, Math.min(item.y + moveY, 550)),
              };
            }
          }
          
          // Random speech
          const shouldSpeak = Math.random() < 0.3;
          
          // Animal-specific sounds
          let speech = "";
          if (shouldSpeak) {
            // Play the sound
            playSound(item.type);
            
            switch (item.type) {
              case "dog":
                speech = "Woof woof! 🐕";
                break;
              case "cat":
                speech = "Meow meow! 🐱";
                break;
              case "bird":
                speech = "Cheep cheep! 🐦";
                break;
              case "rabbit":
                speech = "Eek eek! 🐰";
                break;
              default:
                speech = SPEECH_OPTIONS[Math.floor(Math.random() * SPEECH_OPTIONS.length)];
            }
          }
          
          return {
            ...item,
            x: Math.max(50, Math.min(item.x + moveX, 750)),
            y: Math.max(50, Math.min(item.y + moveY, 550)),
            speech: shouldSpeak ? speech : item.speech,
            showSpeech: shouldSpeak ? true : false,
            age: newAge,
            size: newSize,
            wood: newWood,
            food: newFood,
            water: newWater,
            hunger: newHunger,
            thirst: newThirst,
            toys: newToys,
            lifeYears: newLifeYears,
            emotion: newEmotion,
          };
        }).filter(item => item !== null) as VillageItem[];

        // Check for breeding (when two compatible adults are close)
        const adults = newItems.filter(item => (item.age ?? 100) >= 100);
        for (let i = 0; i < adults.length; i++) {
          for (let j = i + 1; j < adults.length; j++) {
            const item1 = adults[i];
            const item2 = adults[j];
            
            // Check if same species and close together
            if (item1.type === item2.type) {
              const distance = Math.sqrt(
                Math.pow(item1.x - item2.x, 2) + Math.pow(item1.y - item2.y, 2)
              );
              
              // If close enough, 10% chance to create baby
              if (distance < 50 && Math.random() < 0.1) {
                const parentConfig = ITEMS.find(i => i.type === item1.type);
                const babyType = parentConfig?.babyType || item1.type;
                const babyConfig = ITEMS.find(i => i.type === babyType);
                
                if (babyConfig) {
                  const babyX = (item1.x + item2.x) / 2;
                  const babyY = (item1.y + item2.y) / 2;
                  
                  const baby: VillageItem = {
                    id: `${babyType}-${Date.now()}-${Math.random()}`,
                    type: babyType,
                    x: babyX,
                    y: babyY,
                    icon: babyConfig.icon,
                    age: 0,
                    size: 0.5,
                    speech: "👶",
                    showSpeech: true,
                    name: generateName(babyType),
                    lifeYears: 1,
                    ageStage: "baby",
                    emotion: randomEmotion(),
                    familyId: item1.familyId || item2.familyId,
                  };
                  
                  newItems.push(baby);
                  toast.success(`A ${babyConfig.label.toLowerCase()} was born! 👶`);
                }
              }
            }
          }
        }

        // Marriage logic: man + woman = family
        const men = newItems.filter(item => item.type === "man" && !item.isMarried && !item.familyId);
        const women = newItems.filter(item => item.type === "woman" && !item.isMarried && !item.familyId);
        
        for (let i = 0; i < men.length; i++) {
          for (let j = 0; j < women.length; j++) {
            const man = men[i];
            const woman = women[j];
            
            const distance = Math.sqrt(
              Math.pow(man.x - woman.x, 2) + Math.pow(man.y - woman.y, 2)
            );
            
            // If close enough, 5% chance to marry
            if (distance < 50 && Math.random() < 0.05) {
              const familyId = `family-${Date.now()}-${Math.random()}`;
              
              // Update both to be married with same family ID
              const manIndex = newItems.findIndex(item => item.id === man.id);
              const womanIndex = newItems.findIndex(item => item.id === woman.id);
              
              if (manIndex !== -1) {
                newItems[manIndex] = {
                  ...newItems[manIndex],
                  isMarried: true,
                  familyId,
                  speech: "💍 We're married!",
                  showSpeech: true,
                };
              }
              
              if (womanIndex !== -1) {
                newItems[womanIndex] = {
                  ...newItems[womanIndex],
                  isMarried: true,
                  familyId,
                  speech: "💍 We're married!",
                  showSpeech: true,
                };
              }
              
              toast.success(`${man.name} and ${woman.name} got married! 💑`);
            }
          }
        }
        
        // Crafting: Snowflakes -> Snow
        const snowflakes = newItems.filter(item => item.type === "snowflake");
        const snowflakeGroups: string[][] = [];
        
        snowflakes.forEach((flake1, i) => {
          const nearbyFlakes = [flake1.id];
          snowflakes.forEach((flake2, j) => {
            if (i !== j) {
              const distance = Math.sqrt(
                Math.pow(flake1.x - flake2.x, 2) + Math.pow(flake1.y - flake2.y, 2)
              );
              if (distance < 60) {
                nearbyFlakes.push(flake2.id);
              }
            }
          });
          
          if (nearbyFlakes.length >= 3) {
            const groupKey = nearbyFlakes.sort().join(',');
            if (!snowflakeGroups.some(g => g.sort().join(',') === groupKey)) {
              snowflakeGroups.push(nearbyFlakes.slice(0, 3));
            }
          }
        });
        
        snowflakeGroups.forEach(group => {
          const flakesToRemove = newItems.filter(item => group.includes(item.id));
          if (flakesToRemove.length >= 3) {
            const centerX = flakesToRemove.reduce((sum, f) => sum + f.x, 0) / flakesToRemove.length;
            const centerY = flakesToRemove.reduce((sum, f) => sum + f.y, 0) / flakesToRemove.length;
            
            // Remove snowflakes
            newItems = newItems.filter(item => !group.includes(item.id));
            
            // Create snow
            const snow: VillageItem = {
              id: `snow-${Date.now()}-${Math.random()}`,
              type: "snow",
              x: centerX,
              y: centerY,
              icon: Snowflake,
            };
            
            newItems.push(snow);
            toast.success("❄️ Snowflakes combined into snow!");
          }
        });
        
        // Crafting: Snow -> Snowman
        const snowItems = newItems.filter(item => item.type === "snow");
        const snowGroups: string[][] = [];
        
        snowItems.forEach((snow1, i) => {
          const nearbySnow = [snow1.id];
          snowItems.forEach((snow2, j) => {
            if (i !== j) {
              const distance = Math.sqrt(
                Math.pow(snow1.x - snow2.x, 2) + Math.pow(snow1.y - snow2.y, 2)
              );
              if (distance < 60) {
                nearbySnow.push(snow2.id);
              }
            }
          });
          
          if (nearbySnow.length >= 3) {
            const groupKey = nearbySnow.sort().join(',');
            if (!snowGroups.some(g => g.sort().join(',') === groupKey)) {
              snowGroups.push(nearbySnow.slice(0, 3));
            }
          }
        });
        
        snowGroups.forEach(group => {
          const snowToRemove = newItems.filter(item => group.includes(item.id));
          if (snowToRemove.length >= 3) {
            const centerX = snowToRemove.reduce((sum, s) => sum + s.x, 0) / snowToRemove.length;
            const centerY = snowToRemove.reduce((sum, s) => sum + s.y, 0) / snowToRemove.length;
            
            // Remove snow
            newItems = newItems.filter(item => !group.includes(item.id));
            
            // Create snowman
            const snowman: VillageItem = {
              id: `snowman-${Date.now()}-${Math.random()}`,
              type: "snowman",
              x: centerX,
              y: centerY,
              icon: Snowflake,
            };
            
            newItems.push(snowman);
            toast.success("⛄ Snow combined into a snowman!");
          }
        });
        
        return newItems;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [playSound]);

  const handleDragStart = (type: string) => {
    setDraggedItem(type);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const item = ITEMS.find(i => i.type === draggedItem);
    if (!item) return;

    // Check tree limit (max 10 trees)
    if (draggedItem === "tree") {
      const currentTreeCount = placedItems.filter(i => i.type === "tree").length;
      if (currentTreeCount >= 10) {
        toast.error("Maximum 10 trees allowed in village!");
        setDraggedItem(null);
        return;
      }
    }

    const newItem: VillageItem = {
      id: `${draggedItem}-${Date.now()}`,
      type: draggedItem,
      x,
      y,
      icon: item.icon,
      age: 100,
      size: 1,
    };
    
    // Initialize house/school with empty interior
    if (draggedItem === "house" || draggedItem === "school") {
      newItem.interior = [];
    }

    // Initialize resources for living items
    if (item.isLiving) {
      newItem.hunger = 100;
      newItem.thirst = 100;
      newItem.wood = 0;
      newItem.food = 50; // Start with 50 food
      newItem.water = 0;
      newItem.toys = 0;
      newItem.name = generateName(draggedItem);
      newItem.emotion = randomEmotion();
      
      // Set starting age and age stage based on type
      if (draggedItem === "baby") {
        newItem.lifeYears = 1;
        newItem.ageStage = "baby";
      } else if (draggedItem === "kid") {
        newItem.lifeYears = 7;
        newItem.ageStage = "kid";
      } else if (draggedItem === "teenager") {
        newItem.lifeYears = 13;
        newItem.ageStage = "teenager";
      } else if (draggedItem === "man" || draggedItem === "woman" || draggedItem === "person" || draggedItem === "teacher") {
        newItem.lifeYears = 20;
        newItem.ageStage = "adult";
      } else {
        newItem.lifeYears = 0;
      }
      
      // Set gender
      if (draggedItem === "man") {
        newItem.gender = "male";
      } else if (draggedItem === "woman") {
        newItem.gender = "female";
      } else if (draggedItem === "person" || draggedItem === "kid" || draggedItem === "teenager" || draggedItem === "teacher") {
        newItem.gender = Math.random() < 0.5 ? "male" : "female";
      }
    }

    setPlacedItems([...placedItems, newItem]);

    setDraggedItem(null);
    toast.success(`${item.label} added to village!`);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const clearVillage = () => {
    setPlacedItems([]);
    setCurrentYear(startingYear);
    setTimeOfDay(12);
    setViewingHouse(null);
    setViewingSchool(null);
    toast.info("Village cleared!");
  };
  
  const handleHouseClick = (houseId: string) => {
    if (!exploreMode) return;
    setViewingHouse(houseId);
    toast.info("Viewing house interior. Click outside to exit.");
  };
  
  const handleSchoolClick = (schoolId: string) => {
    if (!exploreMode) return;
    setViewingSchool(schoolId);
    toast.info("Viewing school interior. Watch students learn!");
  };
  
  const handleInteriorDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const buildingId = viewingHouse || viewingSchool;
    if (!draggedItem || !buildingId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const itemList = viewingSchool ? SCHOOL_ITEMS : INTERIOR_ITEMS;
    const item = itemList.find(i => i.type === draggedItem);
    if (!item) return;

    const newInteriorItem: HouseInteriorItem = {
      id: `${draggedItem}-${Date.now()}`,
      type: draggedItem,
      x,
      y,
      icon: item.icon,
    };

    setPlacedItems(prev => prev.map(building => {
      if (building.id === buildingId) {
        const interior = building.interior || [];
        return { ...building, interior: [...interior, newInteriorItem] };
      }
      return building;
    }));

    setDraggedItem(null);
    toast.success(`${item.label} added to ${viewingSchool ? 'school' : 'house'}!`);
  };

  const saveVillage = async () => {
    if (!user) {
      toast.error("Please sign in to save your village");
      navigate("/auth");
      return;
    }

    if (placedItems.length === 0) {
      toast.error("Please add some items to your village first!");
      return;
    }

    setIsSaving(true);
    try {
      // Capture canvas as image
      if (!canvasRef.current) return;
      
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), "image/png");
      });

      // Upload to storage
      const fileName = `${user.id}/${Date.now()}.png`;
      const { error: uploadError } = await supabase.storage
        .from("drawings")
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      // Save to database
      const villageDataToSave = placedItems.map(({ icon, interior, ...item }) => ({
        ...item,
        interior: interior?.map(({ icon: interiorIcon, ...interiorItem }) => interiorItem) || []
      })) as any;
      const { error: dbError } = await supabase
        .from("villages")
        .insert([{
          storage_path: fileName,
          title: title,
          user_id: user.id,
          village_data: {
            items: villageDataToSave,
            startingYear: startingYear,
            currentYear: currentYear,
          } as any,
        }]);

      if (dbError) throw dbError;

      toast.success("Village saved successfully!");
      setIsOpen(false);
      setPlacedItems([]);
      setTitle("My Christmas Village");
      const newYear = new Date().getFullYear();
      setStartingYear(newYear);
      setCurrentYear(newYear);
    } catch (error) {
      console.error("Error saving village:", error);
      toast.error("Failed to save village");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <Home className="w-4 h-4" />
          Build Christmas Village
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Christmas Village Maker</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 mb-2">
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Village title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={() => setExploreMode(!exploreMode)}
              variant={exploreMode ? "default" : "outline"}
              className="gap-2"
            >
              {exploreMode ? <Hammer className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {exploreMode ? "Build Mode" : "Explore Mode"}
            </Button>
            <Button
              onClick={saveVillage}
              disabled={isSaving || placedItems.length === 0}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Village"}
            </Button>
            <Button
              onClick={() => setShowMinimap(!showMinimap)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Map className="w-4 h-4" />
              {showMinimap ? "Hide" : "Show"} Map
            </Button>
          </div>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              placeholder="Starting year..."
              value={startingYear}
              onChange={(e) => {
                const year = parseInt(e.target.value) || new Date().getFullYear();
                setStartingYear(year);
                setCurrentYear(year);
              }}
              className="w-40"
              min="1000"
              max="9999"
            />
            <div className="flex-1 text-sm text-muted-foreground">
              Year: <span className="font-bold text-foreground">{currentYear}</span>
              {" • "}
              Time: <span className="font-bold text-foreground">
                {timeOfDay >= 20 || timeOfDay < 6 ? <Moon className="w-4 h-4 inline text-blue-400" /> : <Sun className="w-4 h-4 inline text-yellow-400" />}
                {" "}{timeOfDay}:00
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Toolbox */}
          {!exploreMode && !viewingHouse && !viewingSchool && (
          <div className="w-48 space-y-2 overflow-y-auto p-2 bg-muted rounded-lg">
            <p className="text-sm font-semibold mb-3">Drag items to canvas:</p>
            {ITEMS.map((item) => (
              <div
                key={item.type}
                draggable
                onDragStart={() => handleDragStart(item.type)}
                className="flex items-center gap-2 p-3 bg-card rounded-lg cursor-move hover:bg-accent transition-colors border-2 border-border"
              >
                <item.icon className={`w-6 h-6 ${item.color}`} />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={clearVillage}
              className="w-full mt-4"
            >
              Clear Village
            </Button>
          </div>
          )}
          
          {/* People List Panel */}
          {!viewingHouse && !viewingSchool && placedItems.some(item => ITEMS.find(i => i.type === item.type)?.isLiving) && (
          <div className="w-64 space-y-2 overflow-y-auto p-3 bg-muted rounded-lg max-h-[500px]">
            <p className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              People & Animals ({placedItems.filter(item => ITEMS.find(i => i.type === item.type)?.isLiving).length})
            </p>
            {placedItems
              .filter(item => ITEMS.find(i => i.type === item.type)?.isLiving)
              .map((person) => {
                const personConfig = ITEMS.find(i => i.type === person.type);
                const PersonIcon = person.icon;
                const house = placedItems.find(h => h.id === person.currentHouse);
                const houseIndex = house ? placedItems.filter(i => i.type === "house").findIndex(h => h.id === house.id) + 1 : null;
                
                return (
                  <div
                    key={person.id}
                    className="p-2 bg-card rounded-lg border border-border space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <PersonIcon className={`w-5 h-5 ${personConfig?.color}`} />
                      {editingPersonId === person.id ? (
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onBlur={() => {
                            if (editingName.trim()) {
                              setPlacedItems(prev => prev.map(p => 
                                p.id === person.id ? { ...p, name: editingName.trim() } : p
                              ));
                            }
                            setEditingPersonId(null);
                            setEditingName("");
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              if (editingName.trim()) {
                                setPlacedItems(prev => prev.map(p => 
                                  p.id === person.id ? { ...p, name: editingName.trim() } : p
                                ));
                              }
                              setEditingPersonId(null);
                              setEditingName("");
                            }
                          }}
                          className="h-6 text-sm flex-1"
                          autoFocus
                        />
                      ) : (
                        <>
                          <span className="text-sm font-medium flex-1">{person.name || "Unnamed"}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => {
                              setEditingPersonId(person.id);
                              setEditingName(person.name || "");
                            }}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <div className="flex items-center gap-1">
                        <Home className="w-3 h-3" />
                        {house ? `House #${houseIndex}` : "Outside"}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        ({Math.round(person.x)}, {Math.round(person.y)})
                      </div>
                      {person.lifeYears !== undefined && (
                        <div className="text-xs font-bold text-blue-600">
                          Age: {person.lifeYears} years {person.ageStage && `(${person.ageStage})`}
                        </div>
                      )}
                      {person.gender && (
                        <div className="text-xs">
                          {person.gender === 'male' ? '♂️ Male' : '♀️ Female'}
                        </div>
                      )}
                      {person.emotion && (
                        <div className="text-xs">
                          {getEmotionEmoji(person.emotion)} {person.emotion}
                        </div>
                      )}
                      {person.familyId && (
                        <div className="text-xs text-purple-600">
                          👨‍👩‍👧 Family: {person.familyId.slice(-6)}
                        </div>
                      )}
                      {person.isMarried && (
                        <div className="text-xs text-pink-600">
                          💍 Married
                        </div>
                      )}
                      <div className="flex gap-2 text-[10px]">
                        {person.hunger !== undefined && `🍖${Math.round(person.hunger)}`}
                        {person.thirst !== undefined && ` 💧${Math.round(person.thirst)}`}
                        {person.toys !== undefined && person.toys > 0 && ` 🎮${person.toys}`}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
          )}
          
          {/* Interior Decoration Toolbox */}
          {viewingHouse && (
          <div className="w-48 space-y-2 overflow-y-auto p-2 bg-muted rounded-lg">
            <p className="text-sm font-semibold mb-3">Decorate house:</p>
            {INTERIOR_ITEMS.map((item) => (
              <div
                key={item.type}
                draggable
                onDragStart={() => handleDragStart(item.type)}
                className="flex items-center gap-2 p-3 bg-card rounded-lg cursor-move hover:bg-accent transition-colors border-2 border-border"
              >
                <item.icon className={`w-6 h-6 ${item.color}`} />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewingHouse(null)}
              className="w-full mt-4"
            >
              Exit House
            </Button>
          </div>
          )}
          
          {/* School Interior Toolbox */}
          {viewingSchool && (
          <div className="w-48 space-y-2 overflow-y-auto p-2 bg-muted rounded-lg">
            <p className="text-sm font-semibold mb-3">Furnish school:</p>
            {SCHOOL_ITEMS.map((item) => (
              <div
                key={item.type}
                draggable
                onDragStart={() => handleDragStart(item.type)}
                className="flex items-center gap-2 p-3 bg-card rounded-lg cursor-move hover:bg-accent transition-colors border-2 border-border"
              >
                <item.icon className={`w-6 h-6 ${item.color}`} />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewingSchool(null)}
              className="w-full mt-4"
            >
              Exit School
            </Button>
          </div>
          )}

          {/* Canvas or Building Interior */}
          {viewingHouse ? (
            <div
              onDrop={handleInteriorDrop}
              onDragOver={handleDragOver}
              className="flex-1 relative bg-amber-100 dark:bg-amber-950 rounded-lg border-2 border-dashed border-primary/30 overflow-hidden"
              style={{ minHeight: "400px" }}
              onClick={() => setViewingHouse(null)}
            >
              <div className="absolute top-2 left-2 bg-black/70 text-white px-3 py-2 rounded-lg text-sm z-10">
                <Home className="w-4 h-4 inline mr-2" />
                House Interior - Drag decorations from left
              </div>
              
              {/* Interior items */}
              {placedItems.find(h => h.id === viewingHouse)?.interior?.map((item) => {
                const ItemIcon = item.icon;
                const itemConfig = INTERIOR_ITEMS.find(i => i.type === item.type);
                
                return (
                  <div
                    key={item.id}
                    className="absolute cursor-pointer hover:scale-110 transition-transform"
                    style={{ left: item.x - 16, top: item.y - 16 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      
                      // Phone functionality
                      if (item.type === "phone") {
                        setPhoneOpen(true);
                        return;
                      }
                      
                      // TV functionality - show village news
                      if (item.type === "tv") {
                        const livingCount = placedItems.filter(i => ITEMS.find(t => t.type === i.type)?.isLiving).length;
                        const houseCount = placedItems.filter(i => i.type === "house").length;
                        const treeCount = placedItems.filter(i => i.type === "tree").length;
                        const currentTime = timeOfDay >= 20 || timeOfDay < 6 ? "night" : "day";
                        
                        const news = [
                          `📺 VILLAGE NEWS - Year ${currentYear}`,
                          `🏘️ Population: ${livingCount} residents`,
                          `🏠 Housing: ${houseCount} homes`,
                          `🌲 Nature: ${treeCount} trees`,
                          `⏰ Current time: ${timeOfDay}:00 (${currentTime})`,
                          `🎄 Season: Christmas season is here!`,
                          placedItems.some(i => i.isMarried) ? `💍 Recent marriages in the village!` : '',
                          placedItems.some(i => i.type === "baby") ? `👶 New babies born recently!` : '',
                        ].filter(Boolean);
                        
                        setVillageNews(news);
                        setTvNewsOpen(true);
                        toast.info("📺 Watching village news...");
                        return;
                      }
                      
                      // Remove item
                      setPlacedItems(prev => prev.map(house => {
                        if (house.id === viewingHouse) {
                          return {
                            ...house,
                            interior: house.interior?.filter(i => i.id !== item.id) || []
                          };
                        }
                        return house;
                      }));
                      toast.info("Item removed");
                    }}
                  >
                    <ItemIcon className={`w-8 h-8 ${itemConfig?.color}`} />
                  </div>
                );
              })}
              
              {/* People inside this house */}
              {placedItems.filter(p => p.currentHouse === viewingHouse).map((person) => {
                const PersonIcon = person.icon;
                const personConfig = ITEMS.find(i => i.type === person.type);
                const scale = person.size ?? 1;
                const iconSize = 32 * scale;
                
                return (
                  <div
                    key={person.id}
                    className="absolute transition-all duration-1000"
                    style={{ 
                      left: 200 + Math.random() * 200,
                      top: 150 + Math.random() * 150,
                      transform: `scale(${scale})`
                    }}
                  >
                    {person.showSpeech && person.speech && (
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 px-3 py-1 rounded-full text-xs whitespace-nowrap shadow-lg border-2 border-primary/20 animate-fade-in">
                        {person.speech}
                      </div>
                    )}
                    <PersonIcon className={`w-8 h-8 ${personConfig?.color}`} />
                    {person.lifeYears !== undefined && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] bg-blue-500 text-white px-1 rounded font-bold whitespace-nowrap">
                        {person.lifeYears}y {person.emotion && getEmotionEmoji(person.emotion)}
                      </div>
                    )}
                    {personConfig?.isLiving && (
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[8px] whitespace-nowrap bg-black/70 text-white px-1 rounded">
                        {person.hunger !== undefined && `🍖${Math.round(person.hunger)}`}
                        {person.thirst !== undefined && ` 💧${Math.round(person.thirst)}`}
                        {person.toys !== undefined && person.toys > 0 && ` 🎮${person.toys}`}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {(!placedItems.find(h => h.id === viewingHouse)?.interior || 
                placedItems.find(h => h.id === viewingHouse)?.interior?.length === 0) && (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <p className="text-center">
                    Drag decorations from the left to furnish!<br />
                    <span className="text-sm">Click items to remove them</span>
                  </p>
                </div>
              )}
            </div>
          ) : viewingSchool ? (
            <div
              onDrop={handleInteriorDrop}
              onDragOver={handleDragOver}
              className="flex-1 relative bg-slate-200 dark:bg-slate-800 rounded-lg border-2 border-dashed border-primary/30 overflow-hidden"
              style={{ minHeight: "400px" }}
              onClick={() => setViewingSchool(null)}
            >
              <div className="absolute top-2 left-2 bg-black/70 text-white px-3 py-2 rounded-lg text-sm z-10">
                <School className="w-4 h-4 inline mr-2" />
                School Interior - Students learning math
              </div>
              
              {/* School interior items */}
              {placedItems.find(s => s.id === viewingSchool)?.interior?.map((item) => {
                const ItemIcon = item.icon;
                const itemConfig = SCHOOL_ITEMS.find(i => i.type === item.type);
                
                return (
                  <div
                    key={item.id}
                    className="absolute cursor-pointer hover:scale-110 transition-transform"
                    style={{ left: item.x - 16, top: item.y - 16 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPlacedItems(prev => prev.map(school => {
                        if (school.id === viewingSchool) {
                          return {
                            ...school,
                            interior: school.interior?.filter(i => i.id !== item.id) || []
                          };
                        }
                        return school;
                      }));
                      toast.info("Item removed");
                    }}
                  >
                    <ItemIcon className={`w-8 h-8 ${itemConfig?.color}`} />
                  </div>
                );
              })}
              
              {/* Students and teachers inside school */}
              {placedItems.filter(p => p.currentSchool === viewingSchool).map((person) => {
                const PersonIcon = person.icon;
                const personConfig = ITEMS.find(i => i.type === person.type);
                const scale = person.size ?? 1;
                
                return (
                  <div
                    key={person.id}
                    className="absolute transition-all duration-1000"
                    style={{ 
                      left: 200 + Math.random() * 200,
                      top: 150 + Math.random() * 150,
                      transform: `scale(${scale})`
                    }}
                  >
                    {person.showSpeech && person.speech && (
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 px-3 py-1 rounded-full text-xs whitespace-nowrap shadow-lg border-2 border-primary/20 animate-fade-in">
                        {person.speech}
                      </div>
                    )}
                    <PersonIcon className={`w-8 h-8 ${personConfig?.color}`} />
                    {person.lifeYears !== undefined && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] bg-blue-500 text-white px-1 rounded font-bold">
                        {person.lifeYears}y {person.emotion && getEmotionEmoji(person.emotion)}
                      </div>
                    )}
                    {person.type === "teacher" && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] bg-purple-600 text-white px-2 rounded font-bold">
                        👩‍🏫 Teacher
                      </div>
                    )}
                    {personConfig?.isLiving && (
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[8px] whitespace-nowrap bg-black/70 text-white px-1 rounded">
                        {person.hunger !== undefined && `🍖${Math.round(person.hunger)}`}
                        {person.thirst !== undefined && ` 💧${Math.round(person.thirst)}`}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {(!placedItems.find(s => s.id === viewingSchool)?.interior || 
                placedItems.find(s => s.id === viewingSchool)?.interior?.length === 0) && (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <p className="text-center">
                    Drag school items from the left!<br />
                    <span className="text-sm">Watch students learn math 🧮</span>
                  </p>
                </div>
              )}
            </div>
          ) : (
          <div
            ref={canvasRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="flex-1 relative bg-gradient-to-b from-blue-100 to-white dark:from-blue-950 dark:to-slate-900 rounded-lg border-2 border-dashed border-primary/30 overflow-hidden"
            style={{ minHeight: "400px" }}
            tabIndex={0}
          >
            {exploreMode && (
              <div className="absolute top-2 left-2 bg-black/70 text-white px-3 py-2 rounded-lg text-sm z-10">
                Use <span className="font-bold">WASD</span> to move around the village
              </div>
            )}
            
            {/* Minimap */}
            {showMinimap && (
              <div className="absolute top-2 right-2 w-48 h-36 bg-black/70 rounded-lg border-2 border-white/30 overflow-hidden z-10">
                <div className="absolute top-1 left-1 text-white text-[10px] font-bold">MAP</div>
                <div className="relative w-full h-full scale-[0.2] origin-top-left">
                  {placedItems.map((item) => {
                    const itemConfig = ITEMS.find(i => i.type === item.type);
                    if (item.currentHouse || item.currentSchool) return null;
                    
                    let color = "bg-gray-400";
                    if (item.type === "house") color = "bg-red-500";
                    if (item.type === "school") color = "bg-indigo-500";
                    if (item.type === "tree") color = "bg-green-500";
                    if (itemConfig?.isLiving) color = "bg-yellow-400";
                    
                    return (
                      <div
                        key={item.id}
                        className={`absolute w-8 h-8 rounded-full ${color}`}
                        style={{ left: item.x, top: item.y }}
                      />
                    );
                  })}
                  {exploreMode && (
                    <div
                      className="absolute w-8 h-8 rounded-full bg-blue-400 border-2 border-white animate-pulse"
                      style={{ left: playerPos.x, top: playerPos.y }}
                    />
                  )}
                </div>
              </div>
            )}
            {/* Snow ground */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent dark:from-slate-100 dark:to-transparent" />
            
            {/* Player in explore mode */}
            {exploreMode && (
              <div
                className="absolute z-20"
                style={{
                  left: playerPos.x - 16,
                  top: playerPos.y - 16,
                }}
              >
                <User className="w-8 h-8 text-yellow-400 animate-pulse" />
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                  YOU
                </div>
              </div>
            )}

            {placedItems.map((item) => {
              // Don't render people who are inside houses
              const itemConfig = ITEMS.find(i => i.type === item.type);
              if (item.currentHouse) return null;
              
              const ItemIcon = item.icon;
              const scale = item.size ?? 1;
              const iconSize = 32 * scale;
              const offset = iconSize / 2;
              
              return (
                <div
                  key={item.id}
                  className={`absolute transition-all duration-1000 ease-in-out ${
                    exploreMode && (item.type === 'house' || item.type === 'school') ? 'cursor-pointer hover:scale-110 hover:ring-4 hover:ring-yellow-400' : 
                    !exploreMode ? 'cursor-pointer hover:scale-110' : ''
                  }`}
                  style={{ 
                    left: item.x - offset, 
                    top: item.y - offset,
                    transform: `scale(${scale})`
                  }}
                  onClick={() => {
                    if (exploreMode && item.type === 'house') {
                      handleHouseClick(item.id);
                    } else if (exploreMode && item.type === 'school') {
                      handleSchoolClick(item.id);
                    } else if (!exploreMode) {
                      setPlacedItems(placedItems.filter(i => i.id !== item.id));
                      toast.info("Item removed");
                    }
                  }}
                >
                  {item.showSpeech && item.speech && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 px-3 py-1 rounded-full text-xs whitespace-nowrap shadow-lg border-2 border-primary/20 animate-fade-in">
                      {item.speech}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white dark:bg-slate-800 rotate-45 border-r-2 border-b-2 border-primary/20"></div>
                    </div>
                  )}
                  {itemConfig?.isLiving && item.lifeYears !== undefined && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] bg-blue-500 text-white px-1 rounded font-bold whitespace-nowrap">
                      {item.lifeYears}y {item.emotion && getEmotionEmoji(item.emotion)}
                      {item.familyId && ' 👨‍👩‍👧'}
                    </div>
                  )}
                  {itemConfig?.isLiving && (item.hunger !== undefined || item.wood !== undefined) && (
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[8px] whitespace-nowrap bg-black/70 text-white px-1 rounded">
                      {item.hunger !== undefined && `🍖${Math.round(item.hunger)}`}
                      {item.thirst !== undefined && ` 💧${Math.round(item.thirst)}`}
                      {item.wood !== undefined && item.wood > 0 && ` 🪵${item.wood}`}
                      {item.food !== undefined && item.food > 0 && ` 🍎${item.food}`}
                      {item.toys !== undefined && item.toys > 0 && ` 🎮${item.toys}`}
                    </div>
                  )}
                  <ItemIcon className={`w-8 h-8 ${itemConfig?.color}`} />
                  {item.type === "lake" && (
                    <div className="absolute inset-0 bg-blue-400/30 rounded-full -z-10 scale-[3]" />
                  )}
                  {item.type === "park" && (
                    <div className="absolute inset-0 bg-green-400/20 rounded-lg -z-10 scale-[4]" />
                  )}
                  {(item.type === "house" || item.type === "school") && item.interior && item.interior.length > 0 && (
                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-black rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                      {item.interior.length}
                    </div>
                  )}
                </div>
              );
            })}

            {placedItems.length === 0 && !exploreMode && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                <p className="text-center">
                  Drag items from the left to build your village!<br />
                  <span className="text-sm">Click placed items to remove them</span>
                </p>
              </div>
            )}
          </div>
          )}
        </div>
      </DialogContent>
      <PhoneModal isOpen={phoneOpen} onClose={() => setPhoneOpen(false)} />
      
      {/* TV News Dialog */}
      <Dialog open={tvNewsOpen} onOpenChange={setTvNewsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tv className="w-5 h-5" />
              Village News Channel
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {villageNews.map((newsItem, idx) => (
              <div key={idx} className="text-sm py-1 border-b border-slate-300 dark:border-slate-600 last:border-0">
                {newsItem}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
