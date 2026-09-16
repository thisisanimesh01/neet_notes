/**
 * Storage abstraction for NEET Notes 2027.
 *
 * STORAGE_PROVIDER=local    → local filesystem (development)
 * STORAGE_PROVIDER=supabase → Supabase private bucket (production)
 *
 * All private PDFs are stored in a private bucket/directory that is NEVER
 * publicly accessible. Signed/streamed access is always gated by server-side
 * purchase verification before any URL or bytes are returned to the client.
 */

import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Local filesystem paths (dev only)
// ---------------------------------------------------------------------------

export const PRIVATE_STORAGE_DIR = path.join(
  process.cwd(),
  "storage",
  "private",
);

export const PREVIEW_STORAGE_DIR = path.join(
  process.cwd(),
  "storage",
  "previews",
);

// ---------------------------------------------------------------------------
// Provider detection
// ---------------------------------------------------------------------------

function getProvider(): "local" | "supabase" {
  const provider = (process.env.STORAGE_PROVIDER ?? "local").toLowerCase();

  return provider === "supabase" ? "supabase" : "local";
}

// ---------------------------------------------------------------------------
// Supabase client (lazy, server-only)
// ---------------------------------------------------------------------------

function getSupabaseClient() {
  const rawUrl = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!rawUrl || !key) {
    throw new Error(
      "Supabase storage is enabled but SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.",
    );
  }

  /**
   * Normalize SUPABASE_URL.
   *
   * If provided as:
   *
   *   https://<project>.supabase.co/rest/v1/
   *
   * normalize it to:
   *
   *   https://<project>.supabase.co
   *
   * so Supabase Storage requests are correctly constructed as:
   *
   *   https://<project>.supabase.co/storage/v1/...
   */
  const cleanUrl = rawUrl
    .replace(/\/rest\/v1\/?$/i, "")
    .replace(/\/+$/, "");

  /**
   * Service-role client.
   *
   * This function is server-only.
   * The service-role key must NEVER be exposed to the browser.
   */
  return createClient(cleanUrl, key, {
    auth: {
      persistSession: false,
    },
  });
}

// ---------------------------------------------------------------------------
// Supabase storage configuration
// ---------------------------------------------------------------------------

function getStorageBucket() {
  return (
    process.env.SUPABASE_STORAGE_BUCKET ?? "neet-notes-private"
  );
}

/**
 * Path prefix inside the Supabase bucket for full/private PDFs.
 */
const SUPABASE_PRIVATE_PREFIX = "private/";

/**
 * Path prefix inside the Supabase bucket for 2-page preview PDFs.
 */
const SUPABASE_PREVIEW_PREFIX = "previews/";

// ---------------------------------------------------------------------------
// Path traversal guard (local filesystem)
// ---------------------------------------------------------------------------

function resolveStoragePath(
  rootDir: string,
  storageKey: string,
) {
  const sanitized = storageKey
    .replace(/\\/g, "/")
    .split("/")
    .filter(Boolean)
    .join("/");

  if (!sanitized || sanitized.includes("..")) {
    throw new Error(`Invalid storage key: ${storageKey}`);
  }

  const candidate = path.join(rootDir, sanitized);

  if (!candidate.startsWith(rootDir)) {
    throw new Error(`Path traversal blocked: ${storageKey}`);
  }

  return candidate;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export async function ensureStorageDirs() {
  await fs.mkdir(PRIVATE_STORAGE_DIR, {
    recursive: true,
  });

  await fs.mkdir(PREVIEW_STORAGE_DIR, {
    recursive: true,
  });
}

export function makeStorageKey(ext = ".pdf") {
  return `${randomUUID()}${ext}`;
}

// ---------------------------------------------------------------------------
// Write operations
// ---------------------------------------------------------------------------

export async function writePrivatePdf(
  buffer: Buffer,
): Promise<string> {
  const fileName = makeStorageKey();

  if (getProvider() === "supabase") {
    const supabase = getSupabaseClient();

    const objectPath =
      `${SUPABASE_PRIVATE_PREFIX}${fileName}`;

    const { error } = await supabase.storage
      .from(getStorageBucket())
      .upload(objectPath, buffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (error) {
      throw new Error(
        `Supabase upload failed (private): ${error.message}`,
      );
    }

    return fileName;
  }

  // Local fallback
  await ensureStorageDirs();

  const filePath = resolveStoragePath(
    PRIVATE_STORAGE_DIR,
    fileName,
  );

  await fs.writeFile(filePath, buffer);

  return fileName;
}

export async function writePreviewPdf(
  buffer: Buffer,
): Promise<string> {
  const fileName = makeStorageKey();

  if (getProvider() === "supabase") {
    const supabase = getSupabaseClient();

    const objectPath =
      `${SUPABASE_PREVIEW_PREFIX}${fileName}`;

    const { error } = await supabase.storage
      .from(getStorageBucket())
      .upload(objectPath, buffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (error) {
      throw new Error(
        `Supabase upload failed (preview): ${error.message}`,
      );
    }

    return fileName;
  }

  // Local fallback
  await ensureStorageDirs();

  const filePath = resolveStoragePath(
    PREVIEW_STORAGE_DIR,
    fileName,
  );

  await fs.writeFile(filePath, buffer);

  return fileName;
}

// ---------------------------------------------------------------------------
// Read operations
// ---------------------------------------------------------------------------

export async function readPrivateFile(
  storageKey: string,
): Promise<Buffer> {
  if (getProvider() === "supabase") {
    const supabase = getSupabaseClient();

    const objectPath =
      `${SUPABASE_PRIVATE_PREFIX}${storageKey}`;

    const { data, error } = await supabase.storage
      .from(getStorageBucket())
      .download(objectPath);

    if (error || !data) {
      throw new Error(
        `Supabase download failed (private/${storageKey}): ${
          error?.message ?? "no data"
        }`,
      );
    }

    return Buffer.from(
      await data.arrayBuffer(),
    );
  }

  // Local fallback
  const filePath = resolveStoragePath(
    PRIVATE_STORAGE_DIR,
    storageKey,
  );

  return fs.readFile(filePath);
}

export async function readPreviewFile(
  storageKey: string,
): Promise<Buffer> {
  if (getProvider() === "supabase") {
    const supabase = getSupabaseClient();

    const objectPath =
      `${SUPABASE_PREVIEW_PREFIX}${storageKey}`;

    const { data, error } = await supabase.storage
      .from(getStorageBucket())
      .download(objectPath);

    if (error || !data) {
      throw new Error(
        `Supabase download failed (previews/${storageKey}): ${
          error?.message ?? "no data"
        }`,
      );
    }

    return Buffer.from(
      await data.arrayBuffer(),
    );
  }

  // Local fallback
  const filePath = resolveStoragePath(
    PREVIEW_STORAGE_DIR,
    storageKey,
  );

  return fs.readFile(filePath);
}

// ---------------------------------------------------------------------------
// Existence checks
// ---------------------------------------------------------------------------

export async function previewFileExists(
  storageKey: string | null | undefined,
): Promise<boolean> {
  if (!storageKey) {
    return false;
  }

  if (getProvider() === "supabase") {
    try {
      const supabase = getSupabaseClient();

      const { data } = await supabase.storage
        .from(getStorageBucket())
        .list(SUPABASE_PREVIEW_PREFIX, {
          search: storageKey,
        });

      return (
        Array.isArray(data) &&
        data.some(
          (file) => file.name === storageKey,
        )
      );
    } catch {
      return false;
    }
  }

  try {
    const filePath = resolveStoragePath(
      PREVIEW_STORAGE_DIR,
      storageKey,
    );

    await fs.access(filePath);

    return true;
  } catch {
    return false;
  }
}

export async function privateFileExists(
  storageKey: string | null | undefined,
): Promise<boolean> {
  if (!storageKey) {
    return false;
  }

  if (getProvider() === "supabase") {
    try {
      const supabase = getSupabaseClient();

      const { data } = await supabase.storage
        .from(getStorageBucket())
        .list(SUPABASE_PRIVATE_PREFIX, {
          search: storageKey,
        });

      return (
        Array.isArray(data) &&
        data.some(
          (file) => file.name === storageKey,
        )
      );
    } catch {
      return false;
    }
  }

  try {
    const filePath = resolveStoragePath(
      PRIVATE_STORAGE_DIR,
      storageKey,
    );

    await fs.access(filePath);

    return true;
  } catch {
    return false;
  }
}
// ---------------------------------------------------------------------------
// Direct browser upload support
// ---------------------------------------------------------------------------

/**
 * Creates a short-lived signed upload URL for an admin PDF upload.
 *
 * The service-role key stays server-side.
 * The returned signed URL is safe to give to the authenticated admin browser
 * because it only permits uploading to this specific generated path.
 */
export async function createPrivatePdfUploadUrl(): Promise<{
  storageKey: string;
  signedUrl: string;
}> {
  if (getProvider() !== "supabase") {
    throw new Error(
      "Direct signed uploads are only available with Supabase storage.",
    );
  }

  const fileName = makeStorageKey();
  const storageKey = `${SUPABASE_PRIVATE_PREFIX}${fileName}`;

  const supabase = getSupabaseClient();

  const { data, error } = await supabase.storage
    .from(getStorageBucket())
    .createSignedUploadUrl(storageKey, {
      upsert: false,
    });

  if (error || !data) {
    throw new Error(
      `Supabase signed upload URL failed: ${
        error?.message ?? "no data"
      }`,
    );
  }

  return {
    storageKey: fileName,
    signedUrl: data.signedUrl,
  };
}

/**
 * Deletes a private PDF.
 *
 * Used to clean up an uploaded PDF if the subsequent database/preview
 * processing fails.
 */
export async function deletePrivateFile(
  storageKey: string,
): Promise<void> {
  if (getProvider() === "supabase") {
    const supabase = getSupabaseClient();

    const objectPath = `${SUPABASE_PRIVATE_PREFIX}${storageKey}`;

    const { error } = await supabase.storage
      .from(getStorageBucket())
      .remove([objectPath]);

    if (error) {
      throw new Error(
        `Supabase delete failed (private/${storageKey}): ${error.message}`,
      );
    }

    return;
  }

  const filePath = resolveStoragePath(
    PRIVATE_STORAGE_DIR,
    storageKey,
  );

  try {
    await fs.unlink(filePath);
  } catch {
    // Ignore missing local files during cleanup.
  }
}
export async function deletePreviewFile(
  storageKey: string,
): Promise<void> {
  if (getProvider() === "supabase") {
    const supabase = getSupabaseClient();

    const objectPath =
      `${SUPABASE_PREVIEW_PREFIX}${storageKey}`;

    const { error } = await supabase.storage
      .from(getStorageBucket())
      .remove([objectPath]);

    if (error) {
      throw new Error(
        `Supabase delete failed (preview/${storageKey}): ${error.message}`,
      );
    }

    return;
  }

  const filePath = resolveStoragePath(
    PREVIEW_STORAGE_DIR,
    storageKey,
  );

  try {
    await fs.unlink(filePath);
  } catch {
    // Ignore missing local files during cleanup.
  }
}