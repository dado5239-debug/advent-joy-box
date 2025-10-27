import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Home, Trees, Snowflake, Star, Church, Gift, User, Users, Baby, Dog, Cat, Bird, Rabbit, Squirrel } from "lucide-react";
import { toast } from "sonner";

interface VillageItem {
  id: string;
  type: string;
  x: number;
  y: number;
  icon: any;
}

const ITEMS = [
  { type: "house", icon: Home, label: "House", color: "text-red-500" },
  { type: "tree", icon: Trees, label: "Tree", color: "text-green-600" },
  { type: "church", icon: Church, label: "Church", color: "text-amber-700" },
  { type: "gift", icon: Gift, label: "Gift", color: "text-pink-500" },
  { type: "snowflake", icon: Snowflake, label: "Snowflake", color: "text-blue-300" },
  { type: "star", icon: Star, label: "Star", color: "text-yellow-400" },
  { type: "person", icon: User, label: "Person", color: "text-blue-500" },
  { type: "family", icon: Users, label: "Family", color: "text-purple-500" },
  { type: "baby", icon: Baby, label: "Baby", color: "text-pink-400" },
  { type: "dog", icon: Dog, label: "Dog", color: "text-amber-600" },
  { type: "cat", icon: Cat, label: "Cat", color: "text-orange-500" },
  { type: "bird", icon: Bird, label: "Bird", color: "text-sky-400" },
  { type: "rabbit", icon: Rabbit, label: "Rabbit", color: "text-gray-400" },
  { type: "squirrel", icon: Squirrel, label: "Squirrel", color: "text-amber-500" },
];

export const VillageMaker = () => {
  const [placedItems, setPlacedItems] = useState<VillageItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

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

  return (
    <Dialog>
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
              return (
                <div
                  key={item.id}
                  className="absolute cursor-pointer hover:scale-110 transition-transform"
                  style={{ left: item.x - 16, top: item.y - 16 }}
                  onClick={() => {
                    setPlacedItems(placedItems.filter(i => i.id !== item.id));
                    toast.info("Item removed");
                  }}
                >
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
