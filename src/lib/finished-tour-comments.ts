import { cache } from "react";
import { getPayloadClient } from "@/lib/payload";
import { asLocale } from "@/lib/locale";
import type { FinishedTourComment } from "@/lib/types";

function toDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === "number" || typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

function relId(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object" && value !== null && "id" in value) {
    return String((value as { id: unknown }).id);
  }
  return String(value);
}

export const getFinishedTourComments = cache(
  async (tourId: string, locale?: string): Promise<FinishedTourComment[]> => {
    try {
      const payload = await getPayloadClient();
      const result = await payload.find({
        collection: "reviews",
        depth: 0,
        limit: 200,
        where: {
          and: [
            { reviewType: { equals: "finishedTour" } },
            { status: { equals: "approved" } },
            { tour: { equals: tourId } },
          ],
        },
        locale: asLocale(locale),
      });

      return result.docs
        .map((doc: Record<string, any>) => ({
          id: String(doc.id),
          tourId: doc.tour ? relId(doc.tour) : tourId,
          authorName: doc.authorDisplay ?? "Anonymous",
          rating: typeof doc.rating === "number" ? doc.rating : Number(doc.rating) || 0,
          message: doc.message ?? "",
          createdAt: toDate(doc.approvedAt ?? doc.createdAt ?? Date.now()),
        }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error("Failed to load finished tour comments", error);
      return [];
    }
  }
);
