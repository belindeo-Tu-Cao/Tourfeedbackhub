import { cache } from "react";
import { getPayloadClient } from "@/lib/payload";
import { asLocale } from "@/lib/locale";
import { footerNavigationMenu, headerNavigationMenu } from "@/lib/data";
import type {
  NavigationArea,
  NavigationAudience,
  NavigationItemType,
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuKey,
} from "@/lib/types";

type Doc = Record<string, any>;

const FALLBACK_MENUS: Record<NavigationMenuKey, NavigationMenu> = {
  header: headerNavigationMenu,
  footer: footerNavigationMenu,
};

function toDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
    return undefined;
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }
  return undefined;
}

function cloneFlatItems(items: NavigationMenuItem[]): NavigationMenuItem[] {
  return items.map((item) => {
    const { children, ...rest } = item;
    return { ...rest };
  });
}

function sortNavigation(items: NavigationMenuItem[]): void {
  items.sort((a, b) => {
    if (a.order === b.order) {
      return a.label.localeCompare(b.label);
    }
    return a.order - b.order;
  });
  items.forEach((item) => {
    if (item.children && item.children.length) {
      sortNavigation(item.children);
    }
  });
}

export function buildNavigationTree(flatItems: NavigationMenuItem[]): NavigationMenuItem[] {
  const clones = flatItems.map((item) => ({
    ...item,
    children: [] as NavigationMenuItem[],
  }));

  const byId = new Map<string, NavigationMenuItem>();
  clones.forEach((item) => byId.set(item.id, item));

  const roots: NavigationMenuItem[] = [];
  clones.forEach((item) => {
    const parentId = item.parentId ?? null;
    if (parentId) {
      const parent = byId.get(parentId);
      if (parent) {
        parent.children = parent.children ?? [];
        parent.children.push(item);
      } else {
        roots.push(item);
      }
    } else {
      roots.push(item);
    }
  });

  sortNavigation(roots);
  return roots;
}

function cloneMenu(menu: NavigationMenu): NavigationMenu {
  const sourceFlatItems = menu.flatItems ?? flattenNavigationItems(menu.items ?? []);
  const flatItems = cloneFlatItems(sourceFlatItems);
  const items = buildNavigationTree(flatItems);
  return {
    id: menu.id,
    key: menu.key,
    locale: menu.locale ?? null,
    title: menu.title,
    published: menu.published,
    updatedAt: menu.updatedAt ? new Date(menu.updatedAt) : undefined,
    items,
    flatItems,
  };
}

function parseAudienceList(value: unknown): NavigationAudience[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const allowed: NavigationAudience[] = ["guest", "user", "admin"];
  const audiences = value
    .map((entry) =>
      typeof entry === "string" ? entry : entry && typeof entry === "object" ? (entry as Doc).audience : null
    )
    .filter((entry): entry is NavigationAudience => allowed.includes(entry as NavigationAudience));
  return audiences.length ? audiences : undefined;
}

function parseBadge(value: unknown): NavigationMenuItem["badge"] | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const badge = value as { text?: unknown; color?: unknown };
  if (typeof badge.text !== "string" || !badge.text.trim()) {
    return undefined;
  }
  return {
    text: badge.text.trim(),
    color: typeof badge.color === "string" && badge.color.trim() ? badge.color.trim() : undefined,
  };
}

function mapNavigationItem(item: Doc): NavigationMenuItem {
  const rowId = String(item.id ?? item.parentId ?? item.label ?? Math.random());
  const orderRaw = item.order ?? 0;
  const order = typeof orderRaw === "number" ? orderRaw : Number(orderRaw) || 0;
  const parentId =
    typeof item.parentId === "string" && item.parentId.trim().length
      ? item.parentId.trim()
      : null;

  const target = item.target === "_blank" ? "_blank" : "_self";

  const type: NavigationItemType =
    item.type === "external" || item.type === "hash" ? item.type : "internal";

  const area =
    typeof item.area === "string" && item.area.trim().length
      ? (item.area.trim() as NavigationArea)
      : undefined;

  return {
    id: rowId,
    label: typeof item.label === "string" && item.label.trim() ? item.label.trim() : rowId,
    href: typeof item.href === "string" && item.href.trim() ? item.href.trim() : "#",
    type,
    order,
    parentId,
    icon: typeof item.icon === "string" && item.icon.trim() ? item.icon.trim() : undefined,
    target,
    visibleFor: parseAudienceList(item.visibleFor),
    badge: parseBadge(item.badge),
    area,
    group: typeof item.group === "string" && item.group.trim() ? item.group.trim() : undefined,
  };
}

async function fetchNavigationMenuInternal(
  key: NavigationMenuKey,
  locale?: string | null
): Promise<NavigationMenu> {
  const loc = asLocale(locale ?? undefined);
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "navigation-menus",
      depth: 0,
      limit: 1,
      where: { and: [{ key: { equals: key } }, { published: { equals: true } }] },
      locale: loc,
    });

    const selectedDoc = result.docs[0];
    if (!selectedDoc) {
      return cloneMenu(FALLBACK_MENUS[key]);
    }

    const rawItems = Array.isArray(selectedDoc.items) ? selectedDoc.items : [];
    const flatItems = rawItems
      .map(mapNavigationItem)
      .sort((a, b) => a.order - b.order);

    const items = buildNavigationTree(flatItems);

    return {
      id: String(selectedDoc.id),
      key,
      locale: loc,
      title:
        typeof selectedDoc.title === "string" && selectedDoc.title.trim()
          ? selectedDoc.title.trim()
          : undefined,
      published: true,
      updatedAt: toDate(selectedDoc.updatedAt),
      items,
      flatItems,
    };
  } catch (error) {
    console.warn("Failed to load navigation menu, using fallback", error);
    return cloneMenu(FALLBACK_MENUS[key]);
  }
}

export async function fetchNavigationMenu(
  key: NavigationMenuKey,
  locale?: string | null
): Promise<NavigationMenu> {
  return fetchNavigationMenuInternal(key, locale);
}

export const getNavigationMenu = cache(fetchNavigationMenuInternal);

export function getFallbackNavigationMenu(key: NavigationMenuKey): NavigationMenu {
  return cloneMenu(FALLBACK_MENUS[key]);
}

export function flattenNavigationItems(items: NavigationMenuItem[]): NavigationMenuItem[] {
  const result: NavigationMenuItem[] = [];
  const visit = (node: NavigationMenuItem) => {
    const { children, ...rest } = node;
    result.push({ ...rest });
    if (children && children.length) {
      children.forEach(visit);
    }
  };
  items.forEach(visit);
  return result;
}
