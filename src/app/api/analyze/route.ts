import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { generatePrompt } from "@/utils/prompt";
import { AnalyzeRequest, AnalyzeResponse } from "@/types";

// Create OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Parse request body
    const body = (await request.json()) as AnalyzeRequest;
    
    // Validate request
    if (!body.image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Generate the prompt
    const prompt = generatePrompt();

    // Create the API request
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: prompt,
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Please analyze this image and create a UI style guide." },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${body.image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 4000,
    });

    // Extract the generated style guide
    const styleGuide = response.choices[0]?.message?.content || "Error: No response generated";

    // Return the response
    const result: AnalyzeResponse = { styleGuide };
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Error processing request:", error);
    const errorMessage = error instanceof Error ? error.message : "An error occurred while processing the request";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}