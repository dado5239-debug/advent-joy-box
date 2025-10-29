import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Music, Palette, Sparkles, Save, Video } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ChristmasAI = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string>("");
  const [generationType, setGenerationType] = useState<"song" | "drawing" | "video">("song");
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkAuth();
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a description");
      return;
    }

    setGenerating(true);
    setResult("");

    try {
      const description = generationType === "song" 
        ? `Generate a Christmas carol or song with these characteristics: ${prompt}. Include title, verses, and chorus. Format it beautifully with clear sections.`
        : generationType === "video"
        ? `Generate a cinematic Christmas video scene based on: ${prompt}`
        : `Generate a Christmas-themed drawing based on: ${prompt}`;

      const { data, error } = await supabase.functions.invoke("advero-generate", {
        body: { 
          description,
          type: generationType
        }
      });

      if (error) throw error;

      if (generationType === "song") {
        setResult(data.text || "Generated song will appear here");
      } else if (data.imageUrl) {
        setResult(data.imageUrl);
      }

      toast.success(`Christmas ${generationType} generated successfully!`);
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate content. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("Please sign in to save");
      navigate("/auth");
      return;
    }

    if (!result) {
      toast.error("Nothing to save yet");
      return;
    }

    setSaving(true);

    try {
      if (generationType === "song") {
        const { error } = await supabase.from("songs").insert({
          user_id: user.id,
          title: prompt.slice(0, 50) || "Untitled Song",
          content: result,
        });

        if (error) throw error;
        toast.success("Song saved to your library!");
      } else if (generationType === "video") {
        // For videos, save the image URL to storage first
        const fileName = `${user.id}/${Date.now()}.png`;
        
        // Fetch the image data
        const response = await fetch(result);
        const blob = await response.blob();
        
        const { error: uploadError } = await supabase.storage
          .from("videos")
          .upload(fileName, blob);

        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase.from("videos").insert({
          user_id: user.id,
          title: prompt.slice(0, 50) || "Untitled Video",
          storage_path: fileName,
        });

        if (dbError) throw dbError;
        toast.success("Video saved to your library!");
      } else {
        // For drawings, save the image URL to storage first
        const fileName = `${user.id}/${Date.now()}.png`;
        
        // Fetch the image data
        const response = await fetch(result);
        const blob = await response.blob();
        
        const { error: uploadError } = await supabase.storage
          .from("drawings")
          .upload(fileName, blob);

        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase.from("drawings").insert({
          user_id: user.id,
          title: prompt.slice(0, 50) || "Untitled Drawing",
          storage_path: fileName,
        });

        if (dbError) throw dbError;
        toast.success("Drawing saved to your library!");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Calendar
        </Button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-pink-500 animate-sparkle" />
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-pink-500 via-red-500 to-green-500 bg-clip-text text-transparent">
              Advento AI
            </h1>
            <Sparkles className="w-8 h-8 text-pink-500 animate-sparkle" />
          </div>
          <p className="text-xl text-muted-foreground">
            Your magical Christmas creativity companion
          </p>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex gap-2 mb-6 justify-center flex-wrap">
            <Button
              variant={generationType === "song" ? "default" : "outline"}
              onClick={() => setGenerationType("song")}
              className="gap-2"
            >
              <Music className="w-4 h-4" />
              Christmas Songs
            </Button>
            <Button
              variant={generationType === "drawing" ? "default" : "outline"}
              onClick={() => setGenerationType("drawing")}
              className="gap-2"
            >
              <Palette className="w-4 h-4" />
              Christmas Drawings
            </Button>
            <Button
              variant={generationType === "video" ? "default" : "outline"}
              onClick={() => setGenerationType("video")}
              className="gap-2"
            >
              <Video className="w-4 h-4" />
              Christmas Videos
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {generationType === "song" 
                  ? "Describe your Christmas song or carol"
                  : generationType === "video"
                  ? "Describe your Christmas video scene"
                  : "Describe your Christmas drawing"}
              </label>
              <Textarea
                placeholder={
                  generationType === "song"
                    ? "e.g., A joyful carol about snow falling on Christmas Eve..."
                    : generationType === "video"
                    ? "e.g., Santa flying through a snowy night sky with reindeer..."
                    : "e.g., A cozy fireplace with stockings and a Christmas tree..."
                }
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full gap-2 bg-pink-500 hover:bg-pink-600 text-white"
              size="lg"
            >
              <Sparkles className="w-5 h-5" />
              {generating ? "Generating..." : `Generate ${generationType === "song" ? "Song" : generationType === "video" ? "Video" : "Drawing"}`}
            </Button>
          </div>
        </Card>

        {result && (
          <Card className="p-6 relative overflow-hidden">
            {generationType === "song" && (
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-20"
              >
                <source
                  src="https://cdn.pixabay.com/video/2022/12/09/142571-779622095_large.mp4"
                  type="video/mp4"
                />
              </video>
            )}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {generationType === "song" ? "🎵 Your Christmas Carol:" : generationType === "video" ? "🎬 Your Christmas Video:" : "🎨 Your Christmas Drawing:"}
                </h3>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save to Library"}
                </Button>
              </div>
              {generationType === "song" ? (
                <div className="whitespace-pre-wrap text-foreground font-medium text-base md:text-lg leading-relaxed max-h-[500px] overflow-y-auto p-4 bg-background/50 backdrop-blur-sm rounded-lg">
                  {result}
                </div>
              ) : (
                <div className="flex justify-center">
                  <img 
                    src={result} 
                    alt={`Generated Christmas ${generationType}`}
                    className="max-w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ChristmasAI;
