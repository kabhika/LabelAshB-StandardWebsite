import Link from "next/link";
import { DISPLAY_CATEGORIES, KNOWN_MATERIALS } from "@/lib/shopify/catalog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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

const ALL_VALUE = "all";

// ToggleGroupItem composed with render={<Link/>} so it's still real
// navigation (URL search params drive the actual selection, server-side)
// - the "pressed" state is purely a reflection of activeCategory/
// activeMaterial via ToggleGroup's controlled `value`, never client toggle
// state. rounded-none overrides shadcn's default rounded-lg to match this
// brand's near-flat identity. Selected state is the same wine border-
// highlight pattern as the size pills (SizeSelector.tsx /
// ProductCardSizePicker.tsx: "border-labelashb-wine text-labelashb-wine",
// no fill) - not the solid accent fill this used to have. Uses
// data-pressed, not data-state=on - composing ToggleGroupItem with
// render={<Link/>} doesn't carry data-state through onto the rendered <a>
// (verified in the browser), but data-pressed and aria-pressed do.
const CHIP_CLASS =
  "min-h-11 rounded-none border border-labelashb-border bg-transparent px-4 text-labelashb-small font-semibold uppercase text-labelashb-ink-soft transition-colors duration-200 active:scale-[0.97] hover:border-labelashb-ink hover:bg-labelashb-ground-alt hover:text-labelashb-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1 data-pressed:border-labelashb-wine data-pressed:bg-transparent data-pressed:text-labelashb-wine data-pressed:hover:border-labelashb-wine data-pressed:hover:bg-transparent data-pressed:hover:text-labelashb-wine";

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
        <ToggleGroup
          value={[activeCategory ?? ALL_VALUE]}
          className="flex-wrap gap-2"
        >
          <ToggleGroupItem
            value={ALL_VALUE}
            nativeButton={false}
            className={CHIP_CLASS}
            render={<Link href={buildHref(current, { category: undefined })} />}
          >
            All
          </ToggleGroupItem>
          {DISPLAY_CATEGORIES.map((category) => (
            <ToggleGroupItem
              key={category}
              value={category}
              nativeButton={false}
              className={CHIP_CLASS}
              render={<Link href={buildHref(current, { category })} />}
            >
              {category}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div>
        <p className="mb-3 text-labelashb-small font-semibold uppercase text-labelashb-ink-soft">
          Material
        </p>
        <ToggleGroup
          value={[activeMaterial ?? ALL_VALUE]}
          className="flex-wrap gap-2"
        >
          <ToggleGroupItem
            value={ALL_VALUE}
            nativeButton={false}
            className={CHIP_CLASS}
            render={<Link href={buildHref(current, { material: undefined })} />}
          >
            All
          </ToggleGroupItem>
          {KNOWN_MATERIALS.map((material) => (
            <ToggleGroupItem
              key={material}
              value={material}
              nativeButton={false}
              className={CHIP_CLASS}
              render={<Link href={buildHref(current, { material })} />}
            >
              {materialLabel(material)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
}
