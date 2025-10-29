import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { description, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!description) {
      return new Response(
        JSON.stringify({ error: "Description is required" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Handle song generation (text only)
    if (type === "song") {
      console.log("Generating Christmas song with AI for:", description);
      
      const songResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: "You are a Christmas carol writer. Generate short, festive Christmas songs with a title, 2 verses, and a chorus. Keep it concise, joyful, and under 200 words. Format with clear sections using line breaks.",
            },
            {
              role: "user",
              content: description,
            },
          ],
        }),
      });

      if (!songResponse.ok) {
        const errorText = await songResponse.text();
        console.error("Song generation error:", songResponse.status, errorText);
        return new Response(
          JSON.stringify({ error: "Failed to generate song" }),
          {
            status: songResponse.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const songData = await songResponse.json();
      const songText = songData.choices?.[0]?.message?.content;

      if (!songText) {
        console.error("No song text in response:", songData);
        return new Response(
          JSON.stringify({ error: "No song generated" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      console.log("Christmas song generated successfully!");

      return new Response(
        JSON.stringify({ text: songText }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Handle video generation (animated image)
    if (type === "video") {
      console.log("Generating Christmas video frame with AI for:", description);
      
      const videoResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [
            {
              role: "user",
              content: `Create a dynamic, cinematic Christmas scene that looks like a video frame: ${description}. Make it look animated, with motion blur, depth, and a sense of movement. High quality, festive, magical atmosphere.`,
            },
          ],
          modalities: ["image", "text"],
        }),
      });

      if (!videoResponse.ok) {
        const errorText = await videoResponse.text();
        console.error("Video generation error:", videoResponse.status, errorText);
        return new Response(
          JSON.stringify({ error: "Failed to generate video" }),
          {
            status: videoResponse.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const videoData = await videoResponse.json();
      const imageUrl = videoData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (!imageUrl) {
        console.error("No video frame URL in response:", videoData);
        return new Response(
          JSON.stringify({ error: "No video generated" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      console.log("Christmas video frame generated successfully!");

      return new Response(
        JSON.stringify({ imageUrl }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Handle drawing generation (image)
    console.log("Generating image with Advero AI for description:", description);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: description,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate image" }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      console.error("No image URL in response:", data);
      return new Response(
        JSON.stringify({ error: "No image generated" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Image generated successfully");

    return new Response(
      JSON.stringify({ imageUrl }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in advero-generate function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
