import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home, Trees, Snowflake, Star, Church, Gift, User, Users, Baby, Dog, Cat, Bird, Rabbit, Squirrel, Save } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { useVillageSounds } from "@/hooks/useVillageSounds";

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
}

const ITEMS = [
  { type: "house", icon: Home, label: "House", color: "text-red-500", isLiving: false },
  { type: "tree", icon: Trees, label: "Tree", color: "text-green-600", isLiving: false },
  { type: "church", icon: Church, label: "Church", color: "text-amber-700", isLiving: false },
  { type: "gift", icon: Gift, label: "Gift", color: "text-pink-500", isLiving: false },
  { type: "snowflake", icon: Snowflake, label: "Snowflake", color: "text-blue-300", isLiving: false },
  { type: "star", icon: Star, label: "Star", color: "text-yellow-400", isLiving: false },
  { type: "person", icon: User, label: "Person", color: "text-blue-500", isLiving: true, babyType: "baby" },
  { type: "family", icon: Users, label: "Family", color: "text-purple-500", isLiving: true, babyType: "baby" },
  { type: "baby", icon: Baby, label: "Baby", color: "text-pink-400", isLiving: true, growsInto: "person" },
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

export const VillageMaker = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [placedItems, setPlacedItems] = useState<VillageItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState("My Christmas Village");
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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

  // Animation loop for living items
  useEffect(() => {
    const interval = setInterval(() => {
      setPlacedItems(prev => {
        let newItems = [...prev];
        
        // Update existing items
        newItems = newItems.map(item => {
          const itemConfig = ITEMS.find(i => i.type === item.type);
          if (!itemConfig?.isLiving) return item;

          // Random movement (walking)
          const moveX = (Math.random() - 0.5) * 20;
          const moveY = (Math.random() - 0.5) * 20;

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
          };
        });

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
                  };
                  
                  newItems.push(baby);
                  toast.success(`A ${babyConfig.label.toLowerCase()} was born! 👶`);
                }
              }
            }
          }
        }
        
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

    setPlacedItems([
      ...placedItems,
      {
        id: `${draggedItem}-${Date.now()}`,
        type: draggedItem,
        x,
        y,
        icon: item.icon,
        age: 100,
        size: 1,
      },
    ]);

    setDraggedItem(null);
    toast.success(`${item.label} added to village!`);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const clearVillage = () => {
    setPlacedItems([]);
    toast.info("Village cleared!");
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
      const villageDataToSave = placedItems.map(({ icon, ...item }) => item);
      const { error: dbError } = await supabase
        .from("villages")
        .insert([{
          storage_path: fileName,
          title: title,
          user_id: user.id,
          village_data: villageDataToSave,
        }]);

      if (dbError) throw dbError;

      toast.success("Village saved successfully!");
      setIsOpen(false);
      setPlacedItems([]);
      setTitle("My Christmas Village");
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

        <div className="flex gap-2 items-center mb-2">
          <Input
            placeholder="Village title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={saveVillage}
            disabled={isSaving || placedItems.length === 0}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Village"}
          </Button>
        </div>

        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Toolbox */}
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

          {/* Canvas */}
          <div
            ref={canvasRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="flex-1 relative bg-gradient-to-b from-blue-100 to-white dark:from-blue-950 dark:to-slate-900 rounded-lg border-2 border-dashed border-primary/30 overflow-hidden"
            style={{ minHeight: "400px" }}
          >
            {/* Snow ground */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent dark:from-slate-100 dark:to-transparent" />
            
            {placedItems.map((item) => {
              const ItemIcon = item.icon;
              const itemConfig = ITEMS.find(i => i.type === item.type);
              const scale = item.size ?? 1;
              const iconSize = 32 * scale;
              const offset = iconSize / 2;
              
              return (
                <div
                  key={item.id}
                  className="absolute cursor-pointer hover:scale-110 transition-all duration-1000 ease-in-out"
                  style={{ 
                    left: item.x - offset, 
                    top: item.y - offset,
                    transform: `scale(${scale})`
                  }}
                  onClick={() => {
                    setPlacedItems(placedItems.filter(i => i.id !== item.id));
                    toast.info("Item removed");
                  }}
                >
                  {item.showSpeech && item.speech && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 px-3 py-1 rounded-full text-xs whitespace-nowrap shadow-lg border-2 border-primary/20 animate-fade-in">
                      {item.speech}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white dark:bg-slate-800 rotate-45 border-r-2 border-b-2 border-primary/20"></div>
                    </div>
                  )}
                  <ItemIcon className={`w-8 h-8 ${itemConfig?.color}`} />
                </div>
              );
            })}

            {placedItems.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                <p className="text-center">
                  Drag items from the left to build your village!<br />
                  <span className="text-sm">Click placed items to remove them</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
