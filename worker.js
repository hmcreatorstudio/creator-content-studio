export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/generate" && request.method === "POST") {
      try {
        const { topic } = await request.json();

        if (!topic || !topic.trim()) {
          return Response.json(
            { error: "Please enter a topic." },
            { status: 400 }
          );
        }

        const prompt = `You are an expert YouTube content strategist.

Topic: ${topic}

Generate:
1. 5 strong video ideas
2. 5 attention-grabbing hooks
3. 5 clickable YouTube titles
4. 1 short-form video script

Make the content practical, original, engaging, and suitable for creators.

Return the answer with clear headings and numbered lists.`;

        const response = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": env.GEMINI_API_KEY
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt }]
                }
              ]
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          return Response.json(
            { error: data?.error?.message || "Gemini API error." },
            { status: response.status }
          );
        }

        const text =
          data?.candidates?.[0]?.content?.parts
            ?.map(part => part.text || "")
            .join("") || "";

        return Response.json({ result: text });

      } catch (error) {
        return Response.json(
          { error: "Server error: " + error.message },
          { status: 500 }
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};
