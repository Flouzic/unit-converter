import OpenAI from "openai";
import {
  buildSearchContext,
  extractGramsFromText,
  searchWebForIngredient,
} from "@/lib/baking-search";
import { searchLocalIngredients, type CustomIngredient } from "@/lib/baking";

export const runtime = "nodejs";

interface LookupRequest {
  query: string;
}

interface LookupResponse {
  ingredient: CustomIngredient;
  method: "local" | "ai" | "heuristic";
}

function createCustomIngredient(
  name: string,
  gramsPerCup: number,
  source: string,
  confidence: CustomIngredient["confidence"],
): CustomIngredient {
  return {
    id: `custom-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name,
    group: "Custom",
    gramsPerCup,
    source,
    confidence,
  };
}

async function lookupWithAi(
  query: string,
  searchContext: string,
): Promise<CustomIngredient | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const client = new OpenAI({ apiKey });

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    temperature: 0.1,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: [
          "You extract baking conversion data from web search snippets.",
          "Return JSON with keys: name (string), gramsPerCup (number), confidence (high|medium|low), notes (string), sourceSummary (string).",
          "gramsPerCup must be grams for 1 US customary cup of the ingredient.",
          "If uncertain, set confidence to low and pick the most commonly cited value.",
          "Never invent extreme values; typical baking ingredients are 40-500 g per cup.",
        ].join(" "),
      },
      {
        role: "user",
        content: [
          `Ingredient: ${query}`,
          "",
          "Web search results:",
          searchContext,
        ].join("\n"),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) return null;

  const parsed = JSON.parse(content) as {
    name?: string;
    gramsPerCup?: number;
    confidence?: CustomIngredient["confidence"];
    notes?: string;
    sourceSummary?: string;
  };

  if (
    !parsed.gramsPerCup ||
    !Number.isFinite(parsed.gramsPerCup) ||
    parsed.gramsPerCup <= 0
  ) {
    return null;
  }

  return createCustomIngredient(
    parsed.name?.trim() || query,
    parsed.gramsPerCup,
    parsed.sourceSummary?.trim() || "AI analysis of web search results",
    parsed.confidence ?? "medium",
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LookupRequest;
    const query = body.query?.trim();

    if (!query || query.length < 2) {
      return Response.json({ error: "Enter an ingredient name to look up." }, { status: 400 });
    }

    if (query.length > 120) {
      return Response.json({ error: "Ingredient name is too long." }, { status: 400 });
    }

    const localMatches = searchLocalIngredients(query);
    const exactLocal = localMatches.find(
      (item) => item.name.toLowerCase() === query.toLowerCase(),
    );
    if (exactLocal) {
      const response: LookupResponse = {
        method: "local",
        ingredient: {
          ...exactLocal,
          source: "Built-in baking ingredient database",
          confidence: "high",
        },
      };
      return Response.json(response);
    }

    const snippets = await searchWebForIngredient(query);
    const searchContext = buildSearchContext(snippets);
    const combinedText = `${query}\n${searchContext}`;

    const aiResult = await lookupWithAi(query, searchContext);
    if (aiResult) {
      const response: LookupResponse = {
        method: "ai",
        ingredient: aiResult,
      };
      return Response.json(response);
    }

    const heuristicGrams = extractGramsFromText(combinedText);
    if (heuristicGrams) {
      const topSource = snippets[0];
      const response: LookupResponse = {
        method: "heuristic",
        ingredient: createCustomIngredient(
          query,
          heuristicGrams,
          topSource
            ? `Parsed from search result: ${topSource.title}`
            : "Parsed from web search text",
          "medium",
        ),
      };
      return Response.json(response);
    }

    if (localMatches[0]) {
      const response: LookupResponse = {
        method: "local",
        ingredient: {
          ...localMatches[0],
          source: "Closest match in built-in database",
          confidence: "medium",
        },
      };
      return Response.json(response);
    }

    return Response.json(
      {
        error:
          "Could not find a conversion for that ingredient. Try a more specific name, or add OPENAI_API_KEY for better AI lookup.",
      },
      { status: 404 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ingredient lookup failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
