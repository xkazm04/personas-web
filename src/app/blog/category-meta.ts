import { BLOG_CATEGORIES, type BlogCategory } from "@/data/blog";
import { hexToBrand, type BrandKey } from "@/lib/brand-theme";

export interface CategoryMeta {
  id: BlogCategory;
  label: string;
  brand: BrandKey;
}

/**
 * Resolves a blog category id to its display label and theme-adaptive brand
 * key, so card renderers don't have to walk the BLOG_CATEGORIES array every
 * render.
 */
export function categoryOf(id: BlogCategory): CategoryMeta {
  const cat = BLOG_CATEGORIES.find((c) => c.id === id);
  if (!cat) return { id, label: id, brand: "cyan" };
  return { id: cat.id, label: cat.label, brand: hexToBrand(cat.color) };
}
