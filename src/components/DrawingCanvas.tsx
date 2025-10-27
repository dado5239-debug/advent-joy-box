import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Palette, Eraser, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
  const [brushSize, setBrushSize] = useState(5);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Fill with white background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== "mousedown") return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
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
  };

  const selectEraser = () => {
    setIsEraser(true);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
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
          </div>

          {/* Canvas */}
          <div className="flex-1 flex items-center justify-center bg-muted/30 rounded-lg p-4">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseUp={stopDrawing}
              onMouseMove={draw}
              onMouseLeave={stopDrawing}
              className="bg-white rounded-lg shadow-lg cursor-crosshair border-2 border-border max-w-full max-h-full"
              style={{ width: "800px", height: "600px" }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
