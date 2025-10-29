import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, MessageSquare, Trash2, User } from "lucide-react";
import { toast } from "sonner";

interface Drawing {
  id: string;
  title: string;
  storage_path: string;
  created_at: string;
  user_id: string;
}

interface Village {
  id: string;
  title: string;
  storage_path: string;
  created_at: string;
  user_id: string;
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

const LiveLibrary = () => {
  const navigate = useNavigate();
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    loadContent();
  };

  const loadContent = async () => {
    try {
      const [drawingsRes, villagesRes] = await Promise.all([
        supabase
          .from("drawings")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("villages")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      if (drawingsRes.error) throw drawingsRes.error;
      if (villagesRes.error) throw villagesRes.error;

      setDrawings(drawingsRes.data || []);
      setVillages(villagesRes.data || []);

      // Load comments for all items
      const allIds = [
        ...(drawingsRes.data || []).map((d) => d.id),
        ...(villagesRes.data || []).map((v) => v.id),
      ];

      const { data: commentsData } = await supabase
        .from("comments")
        .select("*")
        .in("item_id", allIds)
        .order("created_at", { ascending: true });

      if (commentsData) {
        const commentsByItem: Record<string, Comment[]> = {};
        commentsData.forEach((comment) => {
          if (!commentsByItem[comment.item_id]) {
            commentsByItem[comment.item_id] = [];
          }
          commentsByItem[comment.item_id].push(comment);
        });
        setComments(commentsByItem);
      }
    } catch (error) {
      console.error("Error loading content:", error);
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (itemId: string, itemType: "drawing" | "village") => {
    if (!user) {
      toast.error("Please sign in to comment");
      navigate("/auth");
      return;
    }

    const content = newComment[itemId]?.trim();
    if (!content) {
      toast.error("Please enter a comment");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          user_id: user.id,
          item_type: itemType,
          item_id: itemId,
          content: content,
        })
        .select()
        .single();

      if (error) throw error;

      setComments({
        ...comments,
        [itemId]: [...(comments[itemId] || []), data],
      });

      setNewComment({ ...newComment, [itemId]: "" });
      toast.success("Comment added!");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  const deleteComment = async (commentId: string, itemId: string) => {
    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      setComments({
        ...comments,
        [itemId]: comments[itemId].filter((c) => c.id !== commentId),
      });

      toast.success("Comment deleted");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  const getImageUrl = (storagePath: string) => {
    const { data } = supabase.storage
      .from("drawings")
      .getPublicUrl(storagePath);
    return data.publicUrl;
  };

  const renderItem = (item: Drawing | Village, type: "drawing" | "village") => (
    <Card key={item.id} className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{item.title}</CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{new Date(item.created_at).toLocaleDateString()}</span>
        </div>
      </CardHeader>
      <CardContent>
        <img
          src={getImageUrl(item.storage_path)}
          alt={item.title}
          className="w-full h-64 object-contain bg-white rounded-lg border mb-4"
        />

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setShowComments({
              ...showComments,
              [item.id]: !showComments[item.id],
            })
          }
          className="w-full gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          {comments[item.id]?.length || 0} Comments
        </Button>

        {showComments[item.id] && (
          <div className="mt-4 space-y-4">
            {/* Existing comments */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(comments[item.id] || []).map((comment) => (
                <div
                  key={comment.id}
                  className="bg-muted p-3 rounded-lg text-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">User</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-foreground">{comment.content}</p>
                    </div>
                    {user && user.id === comment.user_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteComment(comment.id, item.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add comment */}
            {user ? (
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment[item.id] || ""}
                  onChange={(e) =>
                    setNewComment({ ...newComment, [item.id]: e.target.value })
                  }
                  className="flex-1 min-h-[60px]"
                />
                <Button onClick={() => addComment(item.id, type)}>Post</Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center">
                <Button
                  variant="link"
                  onClick={() => navigate("/auth")}
                  className="p-0 h-auto"
                >
                  Sign in
                </Button>{" "}
                to comment
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading content...</p>
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
          <h1 className="text-4xl font-bold mb-2">Community Gallery</h1>
          <p className="text-muted-foreground">
            Explore Christmas drawings and villages from everyone! Comment and share your thoughts.
          </p>
        </div>

        <Tabs defaultValue="drawings" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="drawings">Drawings ({drawings.length})</TabsTrigger>
            <TabsTrigger value="villages">Villages ({villages.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="drawings" className="mt-6">
            {drawings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-lg text-muted-foreground">
                    No drawings yet! Be the first to share.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drawings.map((drawing) => renderItem(drawing, "drawing"))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="villages" className="mt-6">
            {villages.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-lg text-muted-foreground">
                    No villages yet! Be the first to share.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {villages.map((village) => renderItem(village, "village"))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LiveLibrary;
