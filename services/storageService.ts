import { createClient } from "@/lib/supabaseClient";

const supabase = createClient();

export async function uploadPaymentProof(params: {
  requestId: string;
  file: File;
}): Promise<{ publicUrl: string; storagePath: string }> {
  const ext = (() => {
    const t = params.file.type.toLowerCase();
    if (t.includes("png")) return "png";
    if (t.includes("webp")) return "webp";
    if (t.includes("jpeg") || t.includes("jpg")) return "jpg";
    return "jpg";
  })();

  const storagePath = `${params.requestId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("payment-proofs")
    .upload(storagePath, params.file, { upsert: false, contentType: params.file.type });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("payment-proofs").getPublicUrl(storagePath);
  const publicUrl = data.publicUrl;
  if (!publicUrl) throw new Error("Unable to get public URL for uploaded file");

  return { publicUrl, storagePath };
}

