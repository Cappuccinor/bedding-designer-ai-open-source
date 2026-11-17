import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Use Lovable AI Gateway with google/gemini-3-pro-image-preview
const LOVABLE_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const IMAGE_MODEL = "google/gemini-3-pro-image-preview";

// Professional fabric design suffix for high-quality textile rendering
const FABRIC_DESIGN_SUFFIX = `
Rendering requirements:
- Realistic fabric texture and material simulation
- 4K resolution quality
- Seamless pattern integration
- Professional bedding photography style
- Photorealistic textile rendering
- Natural fabric folds and shadows
- High-quality material details`;

// Variation styles to ensure <50% similarity between generated images
const VARIATION_STYLES = [
  { colorScheme: "warm earth tones (terracotta, rust, amber)", arrangement: "organic scattered", scale: "large bold motifs", density: "sparse with breathing room" },
  { colorScheme: "cool ocean hues (navy, teal, seafoam)", arrangement: "geometric grid", scale: "small intricate details", density: "dense and rich" },
  { colorScheme: "soft pastels (blush, lavender, mint)", arrangement: "diagonal flowing", scale: "medium balanced elements", density: "moderate coverage" },
  { colorScheme: "deep jewel tones (emerald, sapphire, ruby)", arrangement: "radial symmetrical", scale: "mixed sizes contrast", density: "layered overlapping" },
  { colorScheme: "neutral monochrome (cream, gray, charcoal)", arrangement: "horizontal stripes", scale: "varied gradation", density: "structured sections" },
  { colorScheme: "vibrant tropical (coral, lime, turquoise)", arrangement: "random artistic", scale: "oversized statement", density: "bold concentrated" },
  { colorScheme: "muted vintage (dusty rose, sage, mustard)", arrangement: "vertical columns", scale: "delicate fine", density: "airy minimal" },
  { colorScheme: "bold contrast (black, white, gold)", arrangement: "circular medallion", scale: "dramatic focal point", density: "balanced negative space" }
];

// Build the complete prompt with all layers
function buildPrompt(params: {
  userPrompt: string;
  negativePrompt?: string;
  variationSeed?: number;
}): string {
  const { userPrompt, negativePrompt, variationSeed } = params;

  const styleIndex = variationSeed ? (variationSeed - 1) % VARIATION_STYLES.length : 0;
  const style = VARIATION_STYLES[styleIndex];

  // Variation instructions for batch generation
  const variationInstructions = variationSeed && variationSeed > 1
    ? `

CRITICAL REQUIREMENT: This is variation #${variationSeed}. You MUST create a COMPLETELY DIFFERENT design with LESS THAN 50% similarity to other variations.

MANDATORY STYLE FOR THIS VARIATION:
- Color Scheme: Use ${style.colorScheme}
- Arrangement: ${style.arrangement} layout
- Scale: ${style.scale}
- Density: ${style.density}

These specifications are NON-NEGOTIABLE. The result must look like an entirely different design concept, not a minor tweak.`
    : '';

  // Negative prompt section
  const negativeSection = negativePrompt
    ? `

IMPORTANT - Avoid the following in the generated image: ${negativePrompt}`
    : '';

  // Complete structured prompt
  return `You are a professional textile designer specializing in bedding patterns.

TASK: Based on the provided bedding photo, generate a new version with a different pattern design.

PRESERVE EXACTLY:
- Camera angle and perspective
- Lighting conditions
- Room environment
- Bedding layout and arrangement
- Overall composition

NEW PATTERN DESIGN: ${userPrompt}
${FABRIC_DESIGN_SUFFIX}
${variationInstructions}

SCOPE: Only change the fabric pattern/design on the bedding items (sheets, pillowcases, duvet cover). Keep everything else exactly the same.${negativeSection}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, negativePrompt, imageBase64, variationSeed } = await req.json();

    if (!prompt || !imageBase64) {
      return new Response(
        JSON.stringify({ error: "Missing prompt or image" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use LOVABLE_API_KEY (auto-provisioned by Lovable Cloud)
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating pattern with prompt:", prompt);
    console.log("Negative prompt:", negativePrompt || "none");
    console.log("Variation seed:", variationSeed || 1);

    // Build the complete prompt using the refactored function
    const fullPromptText = buildPrompt({
      userPrompt: prompt,
      negativePrompt,
      variationSeed
    });

    console.log("Full prompt:", fullPromptText.substring(0, 200) + "...");

    // Use Lovable AI Gateway with retry logic
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${maxRetries}`);

        const response = await fetch(LOVABLE_GATEWAY_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: IMAGE_MODEL,
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: fullPromptText
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: imageBase64
                    }
                  }
                ]
              }
            ],
            modalities: ["image", "text"]
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API error (attempt ${attempt}):`, response.status, errorText);

          if (response.status === 429) {
            if (attempt < maxRetries) {
              // Wait before retry with exponential backoff
              await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
              continue;
            }
            return new Response(
              JSON.stringify({ error: "请求过于频繁，请稍后再试。Lovable AI 有速率限制，请等待一分钟后重试。" }),
              { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          if (response.status === 402) {
            return new Response(
              JSON.stringify({ error: "AI 额度不足，请在 Lovable 设置中添加额度。" }),
              { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          lastError = new Error(`API error: ${response.status} - ${errorText}`);
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;
          }
        } else {
          const data = await response.json();
          console.log("API response received");

          // Try to extract image from Lovable AI Gateway response format
          let generatedImage: string | undefined;
          let textResponse: string | undefined;

          // Format 1: images array (Lovable gateway format)
          if (data.choices?.[0]?.message?.images?.[0]?.image_url?.url) {
            generatedImage = data.choices[0].message.images[0].image_url.url;
            textResponse = data.choices[0].message.content;
          }
          // Format 2: content array with image_url
          else if (Array.isArray(data.choices?.[0]?.message?.content)) {
            const contents = data.choices[0].message.content;
            for (const item of contents) {
              if (item.type === "image_url" && item.image_url?.url) {
                generatedImage = item.image_url.url;
              } else if (item.type === "text" && item.text) {
                textResponse = item.text;
              }
            }
          }
          // Format 3: Base64 in text response
          else if (typeof data.choices?.[0]?.message?.content === "string") {
            const content = data.choices[0].message.content;
            const match = content.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
            if (match) {
              generatedImage = match[0];
            }
            textResponse = content;
          }

          if (!generatedImage) {
            console.error("No image in response:", JSON.stringify(data).substring(0, 800));
            lastError = new Error("未能从响应中提取图片");
            if (attempt < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
              continue;
            }
          } else {
            return new Response(
              JSON.stringify({
                image: generatedImage,
                description: textResponse || "Pattern generated successfully"
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      } catch (fetchError) {
        console.error(`Fetch error (attempt ${attempt}):`, fetchError);
        lastError = fetchError instanceof Error ? fetchError : new Error(String(fetchError));
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
      }
    }

    // All retries exhausted
    console.error("All retries exhausted:", lastError);
    return new Response(
      JSON.stringify({ error: "生成失败，请重试。详情: " + (lastError?.message || "未知错误") }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-pattern:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "未知错误" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
