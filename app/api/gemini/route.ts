import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = body.text;
    const mode = body.mode;

    if (!text || !mode) {
      return NextResponse.json(
        { error: "Missing text or mode" },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing Gemini API key" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt = "";

    switch (mode) {
      case "emotion":
        prompt = `
Act like an emotional therapist. 
Reply in 2–3 supportive sentences:
"${text}"`;
        break;

      case "moderate":
        prompt = `
Return SAFE or UNSAFE for this:
"${text}"`;
        break;

      case "tags":
        prompt = `
Return comma tags for:
"${text}"`;
        break;

      case "title":
        prompt = `
Return a 3–5 word title:
"${text}"`;
        break;

      default:
        return NextResponse.json(
          { error: "Invalid mode" },
          { status: 400 }
        );
    }

    const result = await model.generateContent(prompt);

    const output =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    return NextResponse.json({ output });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Server processing error" },
      { status: 500 }
    );
  }
}
