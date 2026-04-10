// HN Algolia polling service

export interface HNHit {
  objectID: string;
  title: string;
  url: string | null;
  author: string;
  story_text: string | null;
  created_at: string;
}

interface HNResponse {
  hits: HNHit[];
}

export async function searchHN(keywords: string[]): Promise<Map<string, HNHit[]>> {
  const results = new Map<string, HNHit[]>();

  // Batch: search for each keyword separately (HN Algolia doesn't support OR)
  // But we deduplicate API calls for identical keywords across customers
  const uniqueKeywords = [...new Set(keywords.map(k => k.toLowerCase()))];

  for (const keyword of uniqueKeywords) {
    try {
      const params = new URLSearchParams({
        query: keyword,
        tags: 'story',
        hitsPerPage: '20',
        numericFilters: `created_at_i>${Math.floor(Date.now() / 1000) - 900}`, // Last 15 min
      });

      const resp = await fetch(`https://hn.algolia.com/api/v1/search_by_date?${params}`);
      if (!resp.ok) {
        console.error(`HN API error for "${keyword}": ${resp.status}`);
        continue;
      }

      const data = (await resp.json()) as HNResponse;
      if (data.hits?.length > 0) {
        results.set(keyword, data.hits);
      }
    } catch (err) {
      console.error(`HN polling error for "${keyword}":`, err);
    }
  }

  return results;
}

export function hnHitToMention(hit: HNHit, keyword: string) {
  return {
    source: 'hackernews' as const,
    type: 'story' as const,
    title: hit.title || '',
    text: (hit.story_text || '').substring(0, 4096),
    author: hit.author || '',
    url: `https://news.ycombinator.com/item?id=${hit.objectID}`,
    source_url: hit.url || null,
    timestamp: hit.created_at,
    keyword,
    external_id: `hn_${hit.objectID}`,
  };
}
