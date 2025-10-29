import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DrawingCanvas } from "@/components/DrawingCanvas";
import { ArrowLeft, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

interface Drawing {
  id: string;
  title: string;
  storage_path: string;
  created_at: string;
}

const Library = () => {
  const navigate = useNavigate();
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [editingDrawing, setEditingDrawing] = useState<Drawing | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    checkAuth();
  }, [refreshKey]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }
    
    setUser(user);
    loadDrawings(user.id);
  };

  const loadDrawings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("drawings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setDrawings(data || []);
    } catch (error) {
      console.error("Error loading drawings:", error);
      toast.error("Failed to load drawings");
    } finally {
      setLoading(false);
    }
  };

  const deleteDrawing = async (id: string, storagePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("drawings")
        .remove([storagePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("drawings")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      setDrawings(drawings.filter((d) => d.id !== id));
      toast.success("Drawing deleted");
    } catch (error) {
      console.error("Error deleting drawing:", error);
      toast.error("Failed to delete drawing");
    }
  };

  const getImageUrl = (storagePath: string) => {
    const { data } = supabase.storage
      .from("drawings")
      .getPublicUrl(storagePath);
    return data.publicUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading your drawings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Calendar
          </Button>
          <h1 className="text-4xl font-bold mb-2">My Drawing Library</h1>
          <p className="text-muted-foreground">
            All your saved Christmas character drawings
          </p>
        </div>

        {drawings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-lg text-muted-foreground mb-4">
                No drawings yet! Start creating some Christmas characters.
              </p>
              <Button onClick={() => navigate("/")}>
                Go to Drawing Canvas
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drawings.map((drawing) => (
              <Card key={drawing.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{drawing.title}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditingDrawing(drawing)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteDrawing(drawing.id, drawing.storage_path)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {new Date(drawing.created_at).toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent>
                  <img
                    src={getImageUrl(drawing.storage_path)}
                    alt={drawing.title}
                    className="w-full h-64 object-contain bg-white rounded-lg border"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingDrawing} onOpenChange={(open) => {
        if (!open) {
          setEditingDrawing(null);
          setRefreshKey(prev => prev + 1); // Refresh drawings after editing
        }
      }}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
          {editingDrawing && (
            <DrawingCanvas editingDrawing={editingDrawing} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Library;
