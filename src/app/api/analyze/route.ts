import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { generatePrompt } from "@/utils/prompt";
import { AnalyzeRequest, AnalyzeResponse } from "@/types";

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = (await request.json()) as AnalyzeRequest;
    
    // Validate request
    if (!body.image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Validate API key
    if (!body.apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key is required" },
        { status: 400 }
      );
    }

    // Create OpenAI client with user-provided key
    const openai = new OpenAI({
      apiKey: body.apiKey,
    });

    // Generate the prompt
    const prompt = generatePrompt();

    try {
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
      // Handle OpenAI API errors specifically
      console.error("OpenAI API Error:", error);
      
      // Type guard and extract properties safely
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const openaiError = error as Record<string, any>;
      
      // Check for common API key issues
      if (openaiError?.status === 401) {
        return NextResponse.json(
          { error: "Invalid API key. Please check your OpenAI API key and try again." },
          { status: 401 }
        );
      } else if (openaiError?.status === 429) {
        return NextResponse.json(
          { error: "Rate limit exceeded or insufficient quota. Please check your OpenAI account billing." },
          { status: 429 }
        );
      } else {
        const errorMessage = typeof openaiError?.message === 'string' 
          ? openaiError.message 
          : "Error communicating with OpenAI API";
          
        const errorStatus = typeof openaiError?.status === 'number' 
          ? openaiError.status 
          : 500;
          
        return NextResponse.json(
          { error: errorMessage },
          { status: errorStatus }
        );
      }
    }
  } catch (error: unknown) {
    console.error("Error processing request:", error);
    const errorMessage = error instanceof Error ? error.message : "An error occurred while processing the request";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}