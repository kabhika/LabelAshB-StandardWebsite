import Link from "next/link";
import { DISPLAY_CATEGORIES, KNOWN_MATERIALS } from "@/lib/shopify/catalog";

export function materialLabel(slug: string): string {
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

// Selected state uses accent-soft/accent, not a solid ink fill - chips are
// toggles, not buttons, and shouldn't compete with the primary CTA's solid
// treatment. Unselected/hover only move between the existing ink/ink-soft/
// ground-alt neutrals - no new colors.
const CHIP_BASE =
  "inline-flex min-h-11 items-center border px-4 text-labelashb-small font-semibold uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1";
const CHIP_SELECTED = "border-labelashb-accent bg-labelashb-accent-soft text-labelashb-accent";
const CHIP_UNSELECTED =
  "border-labelashb-border text-labelashb-ink-soft hover:border-labelashb-ink hover:bg-labelashb-ground-alt hover:text-labelashb-ink";

function chipClass(selected: boolean) {
  return `${CHIP_BASE} ${selected ? CHIP_SELECTED : CHIP_UNSELECTED}`;
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
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-3 text-labelashb-small font-semibold uppercase text-labelashb-ink-soft">
          Category
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={buildHref(current, { category: undefined })}
            className={chipClass(!activeCategory)}
          >
            All
          </Link>
          {DISPLAY_CATEGORIES.map((category) => (
            <Link
              key={category}
              href={buildHref(current, { category })}
              className={chipClass(activeCategory === category)}
            >
              {category}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-labelashb-small font-semibold uppercase text-labelashb-ink-soft">
          Material
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={buildHref(current, { material: undefined })}
            className={chipClass(!activeMaterial)}
          >
            All
          </Link>
          {KNOWN_MATERIALS.map((material) => (
            <Link
              key={material}
              href={buildHref(current, { material })}
              className={chipClass(activeMaterial === material)}
            >
              {materialLabel(material)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
