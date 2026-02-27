import { createClient } from "@/lib/supabaseClient";

const supabase = createClient();

const BUCKET = "payment-proofs";

let bucketVerified = false;

async function ensureBucket(): Promise<void> {
  if (bucketVerified) return;
  try {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (error && !error.message?.includes("already exists")) {
      console.warn("Could not auto-create storage bucket:", error.message);
    }
  } catch {
    // Bucket may already exist or user lacks permission — either is fine.
  }
  bucketVerified = true;
}

export async function uploadPaymentProof(params: {
  requestId: string;
  file: File;
}): Promise<{ publicUrl: string; storagePath: string }> {
  await ensureBucket();

  const ext = (() => {
    const t = params.file.type.toLowerCase();
    if (t.includes("png")) return "png";
    if (t.includes("webp")) return "webp";
    if (t.includes("jpeg") || t.includes("jpg")) return "jpg";
    return "jpg";
  })();

  const storagePath = `${params.requestId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, params.file, { upsert: false, contentType: params.file.type });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  const publicUrl = data.publicUrl;
  if (!publicUrl) throw new Error("Unable to get public URL for uploaded file");

  return { publicUrl, storagePath };
}

export async function getSignedProofUrl(path: string): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 3600);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

