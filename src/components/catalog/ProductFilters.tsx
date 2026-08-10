import Link from "next/link";
import { DISPLAY_CATEGORIES, KNOWN_MATERIALS } from "@/lib/shopify/catalog";

function materialLabel(slug: string): string {
  return slug
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function buildHref(
  current: { category?: string; material?: string },
  next: { category?: string; material?: string },
): string {
  const params = new URLSearchParams();
  const category = "category" in next ? next.category : current.category;
  const material = "material" in next ? next.material : current.material;
  if (category) params.set("category", category);
  if (material) params.set("material", material);
  const qs = params.toString();
  return qs ? `/products?${qs}` : "/products";
}

export function ProductFilters({
  activeCategory,
  activeMaterial,
}: {
  activeCategory?: string;
  activeMaterial?: string;
}) {
  const current = { category: activeCategory, material: activeMaterial };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-labelashb-eyebrow uppercase text-labelashb-ink-soft mb-2">
          Category
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={buildHref(current, { category: undefined })}
            className={`border px-3 py-1.5 text-labelashb-small ${
              !activeCategory
                ? "border-labelashb-ink bg-labelashb-ink text-labelashb-ground"
                : "border-labelashb-border text-labelashb-ink-soft"
            }`}
          >
            All
          </Link>
          {DISPLAY_CATEGORIES.map((category) => (
            <Link
              key={category}
              href={buildHref(current, { category })}
              className={`border px-3 py-1.5 text-labelashb-small ${
                activeCategory === category
                  ? "border-labelashb-ink bg-labelashb-ink text-labelashb-ground"
                  : "border-labelashb-border text-labelashb-ink-soft"
              }`}
            >
              {category}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <p className="text-labelashb-eyebrow uppercase text-labelashb-ink-soft mb-2">
          Material
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={buildHref(current, { material: undefined })}
            className={`border px-3 py-1.5 text-labelashb-small ${
              !activeMaterial
                ? "border-labelashb-ink bg-labelashb-ink text-labelashb-ground"
                : "border-labelashb-border text-labelashb-ink-soft"
            }`}
          >
            All
          </Link>
          {KNOWN_MATERIALS.map((material) => (
            <Link
              key={material}
              href={buildHref(current, { material })}
              className={`border px-3 py-1.5 text-labelashb-small ${
                activeMaterial === material
                  ? "border-labelashb-ink bg-labelashb-ink text-labelashb-ground"
                  : "border-labelashb-border text-labelashb-ink-soft"
              }`}
            >
              {materialLabel(material)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
