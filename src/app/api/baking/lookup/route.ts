import Anthropic from "@anthropic-ai/sdk";
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

function parseJsonFromText(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() ?? trimmed;
  return JSON.parse(candidate);
}

const RETIRED_MODEL_ALIASES: Record<string, string> = {
  "claude-3-5-haiku-20241022": "claude-haiku-4-5",
  "claude-3-7-sonnet-20250219": "claude-sonnet-5",
  "claude-sonnet-4-20250514": "claude-sonnet-5",
  "claude-3-5-sonnet-20241022": "claude-sonnet-5",
  "claude-3-5-sonnet-20240620": "claude-sonnet-5",
};

function resolveAnthropicModel(): string {
  const requested = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5";
  return RETIRED_MODEL_ALIASES[requested] ?? requested;
}

async function lookupWithAi(
  query: string,
  searchContext: string,
): Promise<CustomIngredient | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: resolveAnthropicModel(),
    max_tokens: 512,
    temperature: 0.1,
    system: [
      "You extract baking conversion data from web search snippets.",
      "Respond with JSON only, no markdown or extra text.",
      "JSON keys: name (string), gramsPerCup (number), confidence (high|medium|low), notes (string), sourceSummary (string).",
      "gramsPerCup must be grams for 1 US customary cup of the ingredient.",
      "If uncertain, set confidence to low and pick the most commonly cited value.",
      "Never invent extreme values; typical baking ingredients are 40-500 g per cup.",
    ].join(" "),
    messages: [
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

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") return null;

  let parsed: {
    name?: string;
    gramsPerCup?: number;
    confidence?: CustomIngredient["confidence"];
    notes?: string;
    sourceSummary?: string;
  };

  try {
    parsed = parseJsonFromText(textBlock.text) as typeof parsed;
  } catch {
    return null;
  }

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
          "Could not find a conversion for that ingredient. Try a more specific name, or add ANTHROPIC_API_KEY for better AI lookup.",
      },
      { status: 404 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ingredient lookup failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
