"use client";

import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { COMPANY_CATALOG_STORAGE_PATH } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type Props = {
  currentUrl: string | null;
};

const MAX_PDF_BYTES = 70 * 1024 * 1024; // 70 MB

export function CompanyCatalogUpload({ currentUrl }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(currentUrl);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;

    const file = files[0];
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast({
        title: "Invalid file",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > MAX_PDF_BYTES) {
      toast({
        title: "File too large",
        description: "Catalog PDF must be 70 MB or smaller.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("You must be signed in to upload. Please log in again.");
      }

      const path = COMPANY_CATALOG_STORAGE_PATH;
      const { error } = await supabase.storage.from("pdf-catalogs").upload(path, file, {
        upsert: true,
        contentType: "application/pdf",
        cacheControl: "3600",
      });

      if (error) {
        throw new Error(error.message);
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("pdf-catalogs").getPublicUrl(path);

      const publicDownloadUrl = `${publicUrl}?v=${Date.now()}`;
      setUrl(publicDownloadUrl);
      toast({
        title: "Catalog uploaded",
        description: "The Download catalog button on /catalog now uses this PDF.",
      });
    } catch (e) {
      toast({
        title: "Upload failed",
        description: e instanceof Error ? e.message : "Upload failed",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-4 rounded-lg border bg-white p-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-steel">
          Full company catalog PDF
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload your master product catalog (PDF, up to 70 MB). Visitors can
          download it instantly from the Catalog page.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="max-w-xs"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading}
        />
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading..." : "Upload PDF"}
        </Button>
      </div>

      {url && (
        <div className="rounded-md bg-muted px-3 py-2 text-xs break-all">
          <p className="font-medium text-steel">Public download URL</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-primary hover:underline"
          >
            <Download className="h-3.5 w-3.5 shrink-0" />
            {url}
          </a>
          <p className="mt-2 text-muted-foreground">
            Optional: set{" "}
            <code className="rounded bg-white px-1">NEXT_PUBLIC_CATALOG_PDF_URL</code>{" "}
            in <code className="rounded bg-white px-1">.env.local</code> to
            override this default Storage URL.
          </p>
        </div>
      )}
    </div>
  );
}
