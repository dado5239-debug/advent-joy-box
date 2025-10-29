import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Palette, Sparkles, Trash2, Eraser, PaintBucket } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export default function ProfileSetup() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [aiDescription, setAiDescription] = useState("");
  const [generatingAI, setGeneratingAI] = useState(false);
  const [currentColor, setCurrentColor] = useState("#000000");
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEraser, setIsEraser] = useState(false);
  const [isFillMode, setIsFillMode] = useState(false);
  const [brushSize, setBrushSize] = useState(5);
  const [avatarData, setAvatarData] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 400;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setName(profile.name);
        if (profile.avatar_url) {
          navigate("/");
        }
      }
    };
    loadProfile();
  }, [navigate]);

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

  const handleGenerateWithAI = async () => {
    if (!aiDescription.trim()) {
      toast.error("Please describe your desired profile picture");
      return;
    }

    setGeneratingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke("advero-generate", {
        body: { description: aiDescription },
      });

      if (error) throw error;

      if (data.imageUrl) {
        setAvatarData(data.imageUrl);
        toast.success("Avatar generated by Advero!");
      }
    } catch (error: any) {
      console.error("Error generating with AI:", error);
      toast.error(error.message || "Failed to generate avatar");
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas && !avatarData) {
      toast.error("Please draw or generate an avatar");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let avatarUrl = avatarData;

      if (!avatarData && canvas) {
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob!);
          }, "image/png");
        });

        const fileName = `${user.id}/${Date.now()}.png`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, blob, {
            contentType: "image/png",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);

        avatarUrl = urlData.publicUrl;
      } else if (avatarData) {
        const base64Data = avatarData.split(",")[1];
        const blob = await fetch(`data:image/png;base64,${base64Data}`).then(r => r.blob());
        
        const fileName = `${user.id}/${Date.now()}.png`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, blob, {
            contentType: "image/png",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);

        avatarUrl = urlData.publicUrl;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          name: name.trim(),
          avatar_url: avatarUrl,
        })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      toast.success("Profile created successfully!");
      navigate("/");
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast.error(error.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Create Your Profile</h1>

        <div className="bg-card rounded-lg shadow-lg p-6 space-y-6">
          <div>
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <Label>Profile Picture</Label>
            <Tabs defaultValue="draw" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="draw">
                  <Palette className="w-4 h-4 mr-2" />
                  Draw Avatar
                </TabsTrigger>
                <TabsTrigger value="ai">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate with Advero
                </TabsTrigger>
              </TabsList>

              <TabsContent value="draw" className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-48 space-y-4 p-4 bg-muted rounded-lg">
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
                      Clear
                    </Button>
                  </div>

                  <div className="flex-1 flex items-center justify-center bg-muted/30 rounded-lg p-4">
                    <canvas
                      ref={canvasRef}
                      onMouseDown={startDrawing}
                      onMouseUp={stopDrawing}
                      onMouseMove={draw}
                      onMouseLeave={stopDrawing}
                      className={`bg-white rounded-lg shadow-lg border-2 border-border ${
                        isFillMode ? 'cursor-pointer' : 'cursor-crosshair'
                      }`}
                      style={{ maxWidth: "100%", maxHeight: "400px" }}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ai" className="space-y-4">
                <div>
                  <Label htmlFor="ai-description">Describe Your Profile Picture</Label>
                  <Textarea
                    id="ai-description"
                    placeholder="Example: A friendly cartoon character with blue hair and glasses"
                    value={aiDescription}
                    onChange={(e) => setAiDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button
                  onClick={handleGenerateWithAI}
                  disabled={generatingAI}
                  className="w-full"
                >
                  {generatingAI ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Advero is generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate with Advero
                    </>
                  )}
                </Button>

                {avatarData && (
                  <div className="flex justify-center">
                    <img
                      src={avatarData}
                      alt="Generated avatar"
                      className="w-64 h-64 rounded-lg shadow-lg"
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <Button
            onClick={handleSaveProfile}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Profile"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
