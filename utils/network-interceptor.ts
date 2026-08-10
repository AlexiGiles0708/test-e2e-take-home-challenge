
export interface ApiProduct {
    id: string;
    name: string;
    price: number;
  }
  
  export function extractProductsFromResponse(body: unknown): ApiProduct[] {
    const rawProducts = (body as { products?: unknown[] })?.products;
    if (!Array.isArray(rawProducts)) return [];
  
    return rawProducts
      .map((raw: any) => ({
        id: String(raw?.id ?? raw?.productId ?? ''),
        name: String(raw?.recordTitle ?? raw?.title ?? '').trim(),
        price: raw?.minimumPromoPrice ?? raw?.variants?.[0]?.prices?.salePrice ?? NaN,
      }))
      .filter(p => p.id && p.name);
  }
  
  export function normalize(text: string): string {
    return text.trim().toLowerCase().replace(/\s+/g, ' ');
  }