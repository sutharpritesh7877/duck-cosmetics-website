import { MetadataRoute } from "next";
import { dbService } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://duckcosmetics.com";

  const staticPages = [
    "",
    "/shop",
    "/about",
    "/contact",
    "/faq",
    "/privacy",
    "/shipping",
    "/returns",
    "/terms",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  try {
    const categories = await dbService.getCategories();
    const categoryPages = categories
      .filter((c) => !c.parentCategoryId)
      .map((cat) => ({
        url: `${baseUrl}/shop/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.9,
      }));

    return [...staticPages, ...categoryPages];
  } catch {
    return staticPages;
  }
}