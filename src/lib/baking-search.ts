interface SearchSnippet {
  title: string;
  snippet: string;
  url: string;
}

export async function searchWebForIngredient(query: string): Promise<SearchSnippet[]> {
  const searchQuery = `${query} grams per US cup baking conversion`;
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; UnitConverterBot/1.0; +https://localhost)",
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`Web search failed (${response.status})`);
  }

  const html = await response.text();
  return parseDuckDuckGoResults(html).slice(0, 6);
}

function parseDuckDuckGoResults(html: string): SearchSnippet[] {
  const results: SearchSnippet[] = [];
  const resultPattern =
    /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;

  for (const match of html.matchAll(resultPattern)) {
    results.push({
      url: decodeURIComponent(match[1].replace(/.*uddg=/, "").split("&")[0]),
      title: stripHtml(match[2]),
      snippet: stripHtml(match[3]),
    });
  }

  if (results.length > 0) return results;

  const fallbackPattern = /<a class="result__a"[^>]*>([\s\S]*?)<\/a>/g;
  for (const match of html.matchAll(fallbackPattern)) {
    results.push({
      url: "",
      title: stripHtml(match[1]),
      snippet: "",
    });
    if (results.length >= 6) break;
  }

  return results;
}

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractGramsFromText(text: string): number | null {
  const patterns = [
    /1\s*(?:US\s*)?cup[^.\d]{0,40}?(\d+(?:\.\d+)?)\s*(?:g|grams?)/i,
    /(\d+(?:\.\d+)?)\s*(?:g|grams?)[^.\d]{0,40}?1\s*(?:US\s*)?cup/i,
    /1\s*cup[^.\d]{0,40}?(\d+(?:\.\d+)?)\s*(?:g|grams?)/i,
    /(\d+(?:\.\d+)?)\s*(?:g|grams?)\s*\/\s*(?:cup|c)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const grams = Number.parseFloat(match[1]);
      if (Number.isFinite(grams) && grams > 0 && grams < 2000) {
        return grams;
      }
    }
  }

  return null;
}

export function buildSearchContext(snippets: SearchSnippet[]): string {
  if (snippets.length === 0) return "No search results found.";

  return snippets
    .map(
      (item, index) =>
        `[${index + 1}] ${item.title}\n${item.snippet}\n${item.url}`.trim(),
    )
    .join("\n\n");
}
