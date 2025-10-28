import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Palette, Eraser, Trash2, PaintBucket, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const COLORS = [
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Yellow", value: "#eab308" },
  { name: "Green", value: "#22c55e" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
  { name: "Brown", value: "#92400e" },
  { name: "Beige", value: "#d4a574" },
  { name: "Gray", value: "#6b7280" },
  { name: "Black", value: "#000000" },
];

export const DrawingCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState("#000000");
  const [isEraser, setIsEraser] = useState(false);
  const [isFillMode, setIsFillMode] = useState(false);
  const [brushSize, setBrushSize] = useState(5);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size (much bigger canvas)
    canvas.width = 1600;
    canvas.height = 1000;

    // Fill with white background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const floodFill = (startX: number, startY: number, fillColor: string) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    const startPos = (Math.floor(startY) * canvas.width + Math.floor(startX)) * 4;
    const startR = data[startPos];
    const startG = data[startPos + 1];
    const startB = data[startPos + 2];
    const startA = data[startPos + 3];

    // Convert hex color to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    const fillRgb = hexToRgb(fillColor);
    if (!fillRgb) return;

    // If clicking on the same color, do nothing
    if (startR === fillRgb.r && startG === fillRgb.g && startB === fillRgb.b) {
      return;
    }

    const pixelStack: [number, number][] = [[Math.floor(startX), Math.floor(startY)]];
    
    const matchesStartColor = (pos: number) => {
      return data[pos] === startR &&
             data[pos + 1] === startG &&
             data[pos + 2] === startB &&
             data[pos + 3] === startA;
    };

    const setPixel = (pos: number) => {
      data[pos] = fillRgb.r;
      data[pos + 1] = fillRgb.g;
      data[pos + 2] = fillRgb.b;
      data[pos + 3] = 255;
    };

    while (pixelStack.length > 0) {
      const [x, y] = pixelStack.pop()!;
      
      if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;
      
      const pos = (y * canvas.width + x) * 4;
      
      if (!matchesStartColor(pos)) continue;
      
      setPixel(pos);
      
      pixelStack.push([x + 1, y]);
      pixelStack.push([x - 1, y]);
      pixelStack.push([x, y + 1]);
      pixelStack.push([x, y - 1]);
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    // Handle fill mode
    if (isFillMode) {
      floodFill(coords.x, coords.y, currentColor);
      return;
    }

    setIsDrawing(true);

    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (isEraser) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = currentColor;
    }

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      ctx.closePath();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    toast.success("Canvas cleared!");
  };

  const selectColor = (color: string) => {
    setCurrentColor(color);
    setIsEraser(false);
    setIsFillMode(false);
  };

  const selectEraser = () => {
    setIsEraser(true);
    setIsFillMode(false);
  };

  const selectFill = () => {
    setIsFillMode(true);
    setIsEraser(false);
  };

  const saveDrawing = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please sign in to save your drawing");
        return;
      }

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, "image/png");
      });

      // Generate unique filename
      const fileName = `${user.id}/${Date.now()}.png`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("drawings")
        .upload(fileName, blob, {
          contentType: "image/png",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Save metadata to database
      const { error: dbError } = await supabase
        .from("drawings")
        .insert({
          user_id: user.id,
          storage_path: fileName,
          title: `Drawing ${new Date().toLocaleDateString()}`,
        });

      if (dbError) throw dbError;

      toast.success("Drawing saved to your library!");
    } catch (error) {
      console.error("Error saving drawing:", error);
      toast.error("Failed to save drawing");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="blue" className="gap-2">
          <Palette className="w-4 h-4" />
          Draw Christmas Characters
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Christmas Drawing Canvas</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Toolbox */}
          <div className="w-48 space-y-4 overflow-y-auto p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-semibold mb-2">Colors:</p>
              <div className="grid grid-cols-3 gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => selectColor(color.value)}
                    className={`w-12 h-12 rounded-lg border-2 transition-all hover:scale-110 ${
                      currentColor === color.value && !isEraser
                        ? "border-primary ring-2 ring-primary"
                        : "border-border"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2">Tools:</p>
              <div className="space-y-2">
                <Button
                  variant={isFillMode ? "default" : "outline"}
                  size="sm"
                  onClick={selectFill}
                  className="w-full gap-2"
                >
                  <PaintBucket className="w-4 h-4" />
                  Fill
                </Button>
                <Button
                  variant={isEraser ? "default" : "outline"}
                  size="sm"
                  onClick={selectEraser}
                  className="w-full gap-2"
                >
                  <Eraser className="w-4 h-4" />
                  Eraser
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2">Brush Size:</p>
              <input
                type="range"
                min="1"
                max="50"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground text-center mt-1">
                {brushSize}px
              </p>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={clearCanvas}
              className="w-full gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear Canvas
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={saveDrawing}
              className="w-full gap-2"
            >
              <Save className="w-4 h-4" />
              Save Drawing
            </Button>
          </div>

          {/* Canvas */}
          <div className="flex-1 flex items-center justify-center bg-muted/30 rounded-lg p-4">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseUp={stopDrawing}
              onMouseMove={draw}
              onMouseLeave={stopDrawing}
              className={`bg-white rounded-lg shadow-lg border-2 border-border ${isFillMode ? 'cursor-pointer' : 'cursor-crosshair'}`}
              style={{ maxWidth: "100%", maxHeight: "100%" }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
