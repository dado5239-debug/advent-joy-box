import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Village {
  id: string;
  title: string;
  storage_path: string;
  created_at: string;
}

const MyVillages = () => {
  const navigate = useNavigate();
  const [villages, setVillages] = useState<Village[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }
    
    setUser(user);
    loadVillages(user.id);
  };

  const loadVillages = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("villages")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setVillages(data || []);
    } catch (error) {
      console.error("Error loading villages:", error);
      toast.error("Failed to load villages");
    } finally {
      setLoading(false);
    }
  };

  const deleteVillage = async (id: string, storagePath: string) => {
    try {
      const { error: storageError } = await supabase.storage
        .from("drawings")
        .remove([storagePath]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("villages")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      setVillages(villages.filter((v) => v.id !== id));
      toast.success("Village deleted");
    } catch (error) {
      console.error("Error deleting village:", error);
      toast.error("Failed to delete village");
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
        <p className="text-lg text-muted-foreground">Loading your villages...</p>
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
          <h1 className="text-4xl font-bold mb-2">My Christmas Villages</h1>
          <p className="text-muted-foreground">
            All your saved Christmas villages
          </p>
        </div>

        {villages.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-lg text-muted-foreground mb-4">
                No villages yet! Start building your Christmas village.
              </p>
              <Button onClick={() => navigate("/")}>
                Go to Village Maker
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {villages.map((village) => (
              <Card key={village.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{village.title}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteVillage(village.id, village.storage_path)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {new Date(village.created_at).toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent>
                  <img
                    src={getImageUrl(village.storage_path)}
                    alt={village.title}
                    className="w-full h-64 object-contain bg-white rounded-lg border"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyVillages;
