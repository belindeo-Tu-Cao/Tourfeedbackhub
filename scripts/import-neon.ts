import { Client } from "pg";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const NEON_CONNECTION_STRING =
  "postgresql://neondb_owner:npg_RyIEpjG2sNm8@ep-misty-sun-au48wzn6.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require";

const EXPORT_DIR = join(__dirname, "firestore-export");

const client = new Client({ connectionString: NEON_CONNECTION_STRING });

function loadJson(filename: string): any[] {
  const path = join(EXPORT_DIR, filename);
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return [];
  }
}

function esc(val: any): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
  if (typeof val === "number") return String(val);
  if (typeof val === "string") return `'${val.replace(/'/g, "''")}'`;
  return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
}

function escArr(arr: any[] | undefined | null): string {
  if (!arr || arr.length === 0) return "NULL";
  const items = arr.map((v) => `'${String(v).replace(/'/g, "''")}'`).join(",");
  return `ARRAY[${items}]`;
}

async function runSql(sql: string) {
  try {
    await client.query(sql);
  } catch (err: any) {
    console.error(`  SQL Error: ${err.message}`);
    console.error(`  SQL: ${sql.substring(0, 200)}...`);
  }
}

// ============================================
// Import functions for each collection
// ============================================

async function importLanguages() {
  const docs = loadJson("languages.json");
  console.log(`  languages: ${docs.length} docs`);
  for (const d of docs) {
    await runSql(
      `INSERT INTO languages (id, name, code) VALUES (${esc(d.id)}, ${esc(d.name)}, ${esc(d.code)}) ON CONFLICT (id) DO NOTHING`
    );
  }
}

async function importNationalities() {
  const docs = loadJson("nationalities.json");
  console.log(`  nationalities: ${docs.length} docs`);
  for (const d of docs) {
    await runSql(
      `INSERT INTO nationalities (id, name, code) VALUES (${esc(d.id)}, ${esc(d.name)}, ${esc(d.code)}) ON CONFLICT (id) DO NOTHING`
    );
  }
}

async function importProvinces() {
  const docs = loadJson("provinces.json");
  console.log(`  provinces: ${docs.length} docs`);
  for (const d of docs) {
    await runSql(
      `INSERT INTO provinces (id, name, country) VALUES (${esc(d.id)}, ${esc(d.name)}, ${esc(d.country)}) ON CONFLICT (id) DO NOTHING`
    );
  }
}

async function importTourTypes() {
  const docs = loadJson("tourTypes.json");
  console.log(`  tour_types: ${docs.length} docs`);
  for (const d of docs) {
    await runSql(
      `INSERT INTO tour_types (id, title, description, icon, "order") VALUES (${esc(d.id)}, ${esc(d.title)}, ${esc(d.description)}, ${esc(d.icon)}, ${esc(d.order || 0)}) ON CONFLICT (id) DO NOTHING`
    );
  }
}

async function importGuides() {
  const docs = loadJson("guides.json");
  console.log(`  guides: ${docs.length} docs`);
  for (const d of docs) {
    await runSql(
      `INSERT INTO guides (id, name, phone, email) VALUES (${esc(d.id)}, ${esc(d.name)}, ${esc(d.phone)}, ${esc(d.email)}) ON CONFLICT (id) DO NOTHING`
    );
    // Junction tables
    if (d.languageIds) {
      for (const lid of d.languageIds) {
        await runSql(
          `INSERT INTO guide_languages (guide_id, language_id) VALUES (${esc(d.id)}, ${esc(lid)}) ON CONFLICT DO NOTHING`
        );
      }
    }
    if (d.provinceIds) {
      for (const pid of d.provinceIds) {
        await runSql(
          `INSERT INTO guide_provinces (guide_id, province_id) VALUES (${esc(d.id)}, ${esc(pid)}) ON CONFLICT DO NOTHING`
        );
      }
    }
    if (d.nationalityIds) {
      for (const nid of d.nationalityIds) {
        await runSql(
          `INSERT INTO guide_nationalities (guide_id, nationality_id) VALUES (${esc(d.id)}, ${esc(nid)}) ON CONFLICT DO NOTHING`
        );
      }
    }
  }
}

async function importUsers() {
  const docs = loadJson("users.json");
  console.log(`  users: ${docs.length} docs`);
  for (const d of docs) {
    await runSql(
      `INSERT INTO users (id, email, display_name, role, status, avatar_url, bio, website, social_links, permissions, created_at, updated_at)
       VALUES (${esc(d.id)}, ${esc(d.email)}, ${esc(d.displayName)}, ${esc(d.role)}, ${esc(d.status)},
               ${esc(d.avatarUrl)}, ${esc(d.bio)}, ${esc(d.website)}, ${esc(d.socialLinks)},
               ${escArr(d.permissions)}, ${esc(d.createdAt)}, ${esc(d.updatedAt)})
       ON CONFLICT (id) DO NOTHING`
    );
  }
}

async function importTours() {
  const docs = loadJson("tours.json");
  console.log(`  tours: ${docs.length} docs`);
  for (const d of docs) {
    await runSql(
      `INSERT INTO tours (id, code, name, summary, itinerary, start_date, end_date, client_count, client_country, client_city, guide_id, guide_name, status, show_feedback_form)
       VALUES (${esc(d.id)}, ${esc(d.code)}, ${esc(d.name)}, ${esc(d.summary)}, ${esc(d.itinerary)},
               ${esc(d.startDate)}, ${esc(d.endDate)}, ${esc(d.clientCount || 0)}, ${esc(d.clientCountry)},
               ${esc(d.clientCity)}, ${esc(d.guideId)}, ${esc(d.guideName)}, ${esc(d.status)},
               ${esc(d.showFeedbackForm ?? true)})
       ON CONFLICT (id) DO NOTHING`
    );
    // Photos
    if (d.photoUrls) {
      for (let i = 0; i < d.photoUrls.length; i++) {
        await runSql(
          `INSERT INTO tour_photos (tour_id, url, "order") VALUES (${esc(d.id)}, ${esc(d.photoUrls[i])}, ${esc(i)}) ON CONFLICT DO NOTHING`
        );
      }
    }
    // Videos
    if (d.videoUrls) {
      for (let i = 0; i < d.videoUrls.length; i++) {
        await runSql(
          `INSERT INTO tour_videos (tour_id, url, "order") VALUES (${esc(d.id)}, ${esc(d.videoUrls[i])}, ${esc(i)}) ON CONFLICT DO NOTHING`
        );
      }
    }
    // Provinces
    if (d.provinces) {
      for (const p of d.provinces) {
        await runSql(
          `INSERT INTO tour_provinces (tour_id, province_name) VALUES (${esc(d.id)}, ${esc(p)}) ON CONFLICT DO NOTHING`
        );
      }
    }
    // Tour types
    if (d.tourTypeIds) {
      for (const tid of d.tourTypeIds) {
        await runSql(
          `INSERT INTO tour_tour_types (tour_id, tour_type_id) VALUES (${esc(d.id)}, ${esc(tid)}) ON CONFLICT DO NOTHING`
        );
      }
    }
    // Nationalities
    if (d.clientNationalities) {
      for (const n of d.clientNationalities) {
        await runSql(
          `INSERT INTO tour_nationalities (tour_id, nationality_name) VALUES (${esc(d.id)}, ${esc(n)}) ON CONFLICT DO NOTHING`
        );
      }
    }
    // Guide languages
    if (d.guideLanguages) {
      for (const l of d.guideLanguages) {
        await runSql(
          `INSERT INTO tour_guide_languages (tour_id, language_name) VALUES (${esc(d.id)}, ${esc(l)}) ON CONFLICT DO NOTHING`
        );
      }
    }
    // Subcollection: comments
    if (d._subcollections?.comments) {
      for (const c of d._subcollections.comments) {
        await runSql(
          `INSERT INTO tour_comments (id, tour_id, author_name, rating, message, created_at) VALUES (${esc(c.id)}, ${esc(d.id)}, ${esc(c.authorName)}, ${esc(c.rating)}, ${esc(c.message)}, ${esc(c.createdAt)}) ON CONFLICT DO NOTHING`
        );
      }
    }
  }
}

async function importCategories() {
  const docs = loadJson("categories.json");
  console.log(`  categories: ${docs.length} docs`);

  // Drop FK constraint temporarily to handle self-referencing parent_id
  await client.query("ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_parent_id_fkey");

  // First pass: insert all without parent_id
  for (const d of docs) {
    await runSql(
      `INSERT INTO categories (id, name, slug, description, "order", count, created_at, updated_at)
       VALUES (${esc(d.id)}, ${esc(d.name)}, ${esc(d.slug)}, ${esc(d.description)},
               ${esc(d.order || 0)}, ${esc(d.count || 0)}, ${esc(d.createdAt)}, ${esc(d.updatedAt)})
       ON CONFLICT (id) DO NOTHING`
    );
  }

  // Second pass: update parent_id (only where parent exists)
  for (const d of docs) {
    if (d.parentId) {
      await runSql(
        `UPDATE categories SET parent_id = ${esc(d.parentId)} WHERE id = ${esc(d.id)} AND EXISTS (SELECT 1 FROM categories WHERE id = ${esc(d.parentId)})`
      );
    }
  }

  // Re-add FK constraint
  await client.query("ALTER TABLE categories ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES categories(id)");
}

async function importTags() {
  const docs = loadJson("tags.json");
  console.log(`  tags: ${docs.length} docs`);
  for (const d of docs) {
    await runSql(
      `INSERT INTO tags (id, name, slug, description, count, created_at)
       VALUES (${esc(d.id)}, ${esc(d.name)}, ${esc(d.slug)}, ${esc(d.description)}, ${esc(d.count || 0)}, ${esc(d.createdAt)})
       ON CONFLICT (id) DO NOTHING`
    );
  }
}

async function importPosts() {
  const docs = loadJson("posts.json");
  console.log(`  posts: ${docs.length} docs`);
  for (const d of docs) {
    await runSql(
      `INSERT INTO posts (id, type, title, slug, content, excerpt, status, author_id, author_name, featured_image_id, featured_image, locale, scheduled_for, published_at, view_count, comment_count, allow_comments, seo, created_at, updated_at)
       VALUES (${esc(d.id)}, ${esc(d.type || "post")}, ${esc(d.title)}, ${esc(d.slug)}, ${esc(d.content)}, ${esc(d.excerpt)},
               ${esc(d.status)}, ${esc(d.authorId)}, ${esc(d.authorName)}, ${esc(d.featuredImageId)}, ${esc(d.featuredImage)},
               ${esc(d.locale)}, ${esc(d.scheduledFor)}, ${esc(d.publishedAt)}, ${esc(d.viewCount || 0)}, ${esc(d.commentCount || 0)},
               ${esc(d.allowComments ?? true)}, ${esc(d.seo)}, ${esc(d.createdAt)}, ${esc(d.updatedAt)})
       ON CONFLICT (id) DO NOTHING`
    );
    // Category junction
    if (d.categoryIds) {
      for (const cid of d.categoryIds) {
        await runSql(
          `INSERT INTO post_categories (post_id, category_id) VALUES (${esc(d.id)}, ${esc(cid)}) ON CONFLICT DO NOTHING`
        );
      }
    }
    // Tag junction
    if (d.tagIds) {
      for (const tid of d.tagIds) {
        await runSql(
          `INSERT INTO post_tags (post_id, tag_id) VALUES (${esc(d.id)}, ${esc(tid)}) ON CONFLICT DO NOTHING`
        );
      }
    }
  }
}

async function importSiteSettings() {
  const docs = loadJson("siteSettings.json");
  console.log(`  site_settings: ${docs.length} docs`);
  for (const d of docs) {
    await runSql(
      `INSERT INTO site_settings (id, site_name, logo_url_light, logo_url_dark, hero_title, hero_subtitle, hero_cta_label, hero_media_url, about_title, about_description, about_image_url, mission_statement, values, contact, social, copyright, languages, default_language, primary_color, accent_color, updated_at)
       VALUES (${esc(d.id)}, ${esc(d.siteName)}, ${esc(d.logoUrlLight)}, ${esc(d.logoUrlDark)},
               ${esc(d.heroTitle)}, ${esc(d.heroSubtitle)}, ${esc(d.heroCtaLabel)}, ${esc(d.heroMediaUrl)},
               ${esc(d.aboutTitle)}, ${esc(d.aboutDescription)}, ${esc(d.aboutImageUrl)}, ${esc(d.missionStatement)},
               ${escArr(d.values)}, ${esc(d.contact)}, ${esc(d.social)}, ${esc(d.copyright)},
               ${escArr(d.languages)}, ${esc(d.defaultLanguage)}, ${esc(d.primaryColor)}, ${esc(d.accentColor)},
               ${esc(d.updatedAt)})
       ON CONFLICT (id) DO NOTHING`
    );
  }
}

async function importThemeSettings() {
  const docs = loadJson("themeSettings.json");
  console.log(`  theme_settings: ${docs.length} docs`);
  for (const d of docs) {
    await runSql(
      `INSERT INTO theme_settings (id, primary_font, secondary_font, primary_color, secondary_color, accent_color, background_color, text_color, link_color, header_style, footer_style, custom_css, custom_js, updated_at)
       VALUES (${esc(d.id || "default")}, ${esc(d.primaryFont)}, ${esc(d.secondaryFont)},
               ${esc(d.primaryColor)}, ${esc(d.secondaryColor)}, ${esc(d.accentColor)},
               ${esc(d.backgroundColor)}, ${esc(d.textColor)}, ${esc(d.linkColor)},
               ${esc(d.headerStyle)}, ${esc(d.footerStyle)}, ${esc(d.customCSS)}, ${esc(d.customJS)},
               ${esc(d.updatedAt)})
       ON CONFLICT (id) DO NOTHING`
    );
  }
}

async function importSiteContentSlides() {
  const docs = loadJson("siteContentSlides.json");
  console.log(`  site_content_slides: ${docs.length} docs`);
  for (const d of docs) {
    await runSql(
      `INSERT INTO site_content_slides (id, locale, title, subtitle, button_text, button_link, image_url, "order", active, status, overlay_opacity, alt, start_at, end_at, updated_by, updated_at)
       VALUES (${esc(d.id)}, ${esc(d.locale)}, ${esc(d.title)}, ${esc(d.subtitle)}, ${esc(d.buttonText)},
               ${esc(d.buttonLink)}, ${esc(d.imageUrl)}, ${esc(d.order || 0)}, ${esc(d.active ?? true)},
               ${esc(d.status)}, ${esc(d.overlayOpacity)}, ${esc(d.alt)}, ${esc(d.startAt)},
               ${esc(d.endAt)}, ${esc(d.updatedBy)}, ${esc(d.updatedAt)})
       ON CONFLICT (id) DO NOTHING`
    );
  }
}

async function importNavigationMenus() {
  const docs = loadJson("navigationMenus.json");
  console.log(`  navigation_menus: ${docs.length} docs`);
  for (const d of docs) {
    await runSql(
      `INSERT INTO navigation_menus (id, key, locale, title, published, updated_at)
       VALUES (${esc(d.id)}, ${esc(d.key)}, ${esc(d.locale)}, ${esc(d.title)}, ${esc(d.published ?? true)}, ${esc(d.updatedAt)})
       ON CONFLICT (id) DO NOTHING`
    );
    // Subcollection: items
    if (d._subcollections?.items) {
      for (const item of d._subcollections.items) {
        await runSql(
          `INSERT INTO navigation_menu_items (id, menu_id, label, href, type, "order", parent_id, icon, target, visible_for, badge, area, "group")
           VALUES (${esc(item.id)}, ${esc(d.id)}, ${esc(item.label)}, ${esc(item.href)}, ${esc(item.type)},
                   ${esc(item.order || 0)}, ${esc(item.parentId)}, ${esc(item.icon)}, ${esc(item.target)},
                   ${escArr(item.visibleFor)}, ${esc(item.badge)}, ${esc(item.area)}, ${esc(item.group)})
           ON CONFLICT DO NOTHING`
        );
      }
    }
  }
}

async function importStories() {
  const docs = loadJson("stories.json");
  console.log(`  stories: ${docs.length} docs`);
  for (const d of docs) {
    await runSql(
      `INSERT INTO stories (id, title, excerpt, cover_image_url, published_at, read_time_minutes, tags, category, created_at)
       VALUES (${esc(d.id)}, ${esc(d.title)}, ${esc(d.excerpt)}, ${esc(d.coverImageUrl)},
               ${esc(d.publishedAt)}, ${esc(d.readTimeMinutes)}, ${escArr(d.tags)}, ${esc(d.category)}, ${esc(d.createdAt)})
       ON CONFLICT (id) DO NOTHING`
    );
  }
}

async function importFeedback() {
  const docs = loadJson("feedback.json");
  console.log(`  feedback: ${docs.length} docs`);
  for (const d of docs) {
    await runSql(
      `INSERT INTO feedback (id, name, country, language, rating, message, tour_id, photo_url, status, submitted_at, feedback_summary, detected_language, source, external_url, review_title, visible, featured, source_url, source_review_id, guide_ref, tour_ref, author_display, title, tour_name, content, tags, upload_id, approved_at, review_id, rejected_at, rejected_by, rejection_reason, created_at, updated_at)
       VALUES (${esc(d.id)}, ${esc(d.name)}, ${esc(d.country)}, ${esc(d.language)}, ${esc(d.rating)},
               ${esc(d.message)}, ${esc(d.tourId)}, ${esc(d.photoUrl)}, ${esc(d.status)}, ${esc(d.submittedAt)},
               ${esc(d.feedbackSummary)}, ${esc(d.detectedLanguage)}, ${esc(d.source)}, ${esc(d.externalUrl)},
               ${esc(d.reviewTitle)}, ${esc(d.visible ?? true)}, ${esc(d.featured ?? false)}, ${esc(d.sourceUrl)},
               ${esc(d.sourceReviewId)}, ${esc(d.guideRef)}, ${esc(d.tourRef)}, ${esc(d.authorDisplay)},
               ${esc(d.title)}, ${esc(d.tourName)}, ${esc(d.content)}, ${escArr(d.tags)}, ${esc(d.uploadId)},
               ${esc(d.approvedAt)}, ${esc(d.reviewId)}, ${esc(d.rejectedAt)}, ${esc(d.rejectedBy)},
               ${esc(d.rejectionReason)}, ${esc(d.createdAt)}, ${esc(d.updatedAt)})
       ON CONFLICT (id) DO NOTHING`
    );
  }
}

async function importReviews() {
  const docs = loadJson("reviews.json");
  console.log(`  reviews: ${docs.length} docs`);
  for (const d of docs) {
    await runSql(
      `INSERT INTO reviews (id, author_display, country, language, rating, message, tour_id, tour_name, photo_urls, status, summary, review_type, approved_at, feedback_id, created_at)
       VALUES (${esc(d.id)}, ${esc(d.authorDisplay)}, ${esc(d.country)}, ${esc(d.language)}, ${esc(d.rating)},
               ${esc(d.message)}, ${esc(d.tourId)}, ${esc(d.tourName)}, ${escArr(d.photoUrls)}, ${esc(d.status)},
               ${esc(d.summary)}, ${esc(d.reviewType)}, ${esc(d.approvedAt)}, ${esc(d.feedbackId)}, ${esc(d.createdAt)})
       ON CONFLICT (id) DO NOTHING`
    );
  }
}

async function importMedia() {
  const docs = loadJson("media.json");
  console.log(`  media: ${docs.length} docs`);
  for (const d of docs) {
    await runSql(
      `INSERT INTO media (id, file_name, title, alt_text, caption, description, mime_type, file_size, media_type, url, storage_path, uploaded_by, uploaded_at, updated_at)
       VALUES (${esc(d.id)}, ${esc(d.fileName)}, ${esc(d.title)}, ${esc(d.altText)}, ${esc(d.caption)},
               ${esc(d.description)}, ${esc(d.mimeType)}, ${esc(d.fileSize)}, ${esc(d.mediaType)},
               ${esc(d.url)}, ${esc(d.storagePath)}, ${esc(d.uploadedBy)}, ${esc(d.uploadedAt)}, ${esc(d.updatedAt)})
       ON CONFLICT (id) DO NOTHING`
    );
  }
}

async function importMail() {
  const docs = loadJson("mail.json");
  console.log(`  mail: ${docs.length} docs`);
  for (const d of docs) {
    await runSql(
      `INSERT INTO mail (id, to_email, subject, html, text, status, created_at)
       VALUES (${esc(d.id)}, ${esc(d.to)}, ${esc(d.subject)}, ${esc(d.html)}, ${esc(d.text)},
               ${esc(d.status)}, ${esc(d.createdAt)})
       ON CONFLICT (id) DO NOTHING`
    );
  }
}

// ============================================
// Main
// ============================================

async function main() {
  console.log("Connecting to Neon...\n");
  await client.connect();

  // Read and execute schema
  console.log("Creating schema...");
  const schema = readFileSync(join(__dirname, "schema.sql"), "utf-8");
  await client.query(schema);
  console.log("Schema created!\n");

  // Import data in dependency order
  console.log("Importing data...");
  await importLanguages();
  await importNationalities();
  await importProvinces();
  await importTourTypes();
  await importGuides();
  await importUsers();
  await importTours();
  await importCategories();
  await importTags();
  await importPosts();
  await importSiteSettings();
  await importThemeSettings();
  await importSiteContentSlides();
  await importNavigationMenus();
  await importStories();
  await importFeedback();
  await importReviews();
  await importMedia();
  await importMail();

  console.log("\nImport complete!");
  await client.end();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  client.end();
  process.exit(1);
});
