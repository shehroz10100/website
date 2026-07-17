"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { uploadFileAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  bucket: "product-images" | "category-images" | "pdf-catalogs";
  name: string;
  accept?: string;
  multiple?: boolean;
  defaultUrls?: string[];
  label?: string;
};

export function FileUploadField({
  bucket,
  name,
  accept = "image/*",
  multiple = false,
  defaultUrls = [],
  label = "Upload",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [urls, setUrls] = useState<string[]>(defaultUrls);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);

    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("bucket", bucket);
      const result = await uploadFileAction(fd);
      if (result.success && result.url) {
        uploaded.push(result.url);
      } else {
        setError(result.message);
      }
    }

    setUrls((prev) => (multiple ? [...prev, ...uploaded] : uploaded));
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeUrl(url: string) {
    setUrls((prev) => prev.filter((u) => u !== url));
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={urls.join(",")} />
      <div className="flex flex-wrap items-center gap-2">
        <Input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="max-w-xs"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading..." : label}
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {urls.length > 0 && (
        <ul className="space-y-1">
          {urls.map((url) => (
            <li
              key={url}
              className="flex items-center gap-2 rounded-md bg-muted px-2 py-1.5 text-xs"
            >
              <span className="flex-1 truncate">{url}</span>
              <button type="button" onClick={() => removeUrl(url)} aria-label="Remove">
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
