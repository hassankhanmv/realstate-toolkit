import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import type { PropertyFormValues } from "@/validations/property";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ImagePlus,
  Link2,
  X,
  Trash2,
  Plus,
  ExternalLink,
  Upload,
  Loader2,
} from "lucide-react";

interface StagedFile {
  id: string;
  file: File;
  preview: string;
  status: "staged" | "uploading" | "done" | "error";
  error?: string;
  resultUrl?: string;
}

const MAX_FILES = 5;

export function PropertyMedia() {
  const { t } = useTranslation();
  const form = useFormContext<PropertyFormValues>();
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);

  // Current values from form state
  const mediaUrls = form.watch("media.media_urls") || [];
  const externalUrls = form.watch("media.urls") || [];

  const totalImages = mediaUrls.length + externalUrls.length;
  const doneCount = stagedFiles.filter((f) => f.status === "done").length;
  const availableSlots = MAX_FILES - totalImages - doneCount;

  // ── File Selection (staging only, no upload) ──
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;

      const remaining =
        availableSlots -
        stagedFiles.filter((f) => f.status === "staged").length;
      const toAdd = files.slice(0, Math.max(0, remaining));

      const newStaged: StagedFile[] = toAdd
        .filter((file) => {
          const validTypes = [
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp",
          ];
          return validTypes.includes(file.type) && file.size <= 5 * 1024 * 1024;
        })
        .map((file) => ({
          id: crypto.randomUUID(),
          file,
          preview: URL.createObjectURL(file),
          status: "staged" as const,
        }));

      setStagedFiles((prev) => [...prev, ...newStaged]);
      // Reset input so same file can be re-selected
      e.target.value = "";
    },
    [availableSlots, stagedFiles],
  );

  // ── Drop handler ──
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      if (!files.length) return;

      const remaining =
        availableSlots -
        stagedFiles.filter((f) => f.status === "staged").length;
      const toAdd = files.slice(0, Math.max(0, remaining));

      const newStaged: StagedFile[] = toAdd
        .filter((file) => {
          const validTypes = [
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp",
          ];
          return validTypes.includes(file.type) && file.size <= 5 * 1024 * 1024;
        })
        .map((file) => ({
          id: crypto.randomUUID(),
          file,
          preview: URL.createObjectURL(file),
          status: "staged" as const,
        }));

      setStagedFiles((prev) => [...prev, ...newStaged]);
    },
    [availableSlots, stagedFiles],
  );

  // ── Remove staged file ──
  const removeStaged = useCallback((id: string) => {
    setStagedFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  // ── Upload single file ──
  const uploadSingleFile = useCallback(
    async (staged: StagedFile) => {
      setStagedFiles((prev) =>
        prev.map((f) =>
          f.id === staged.id ? { ...f, status: "uploading" as const } : f,
        ),
      );

      try {
        const formData = new FormData();
        formData.append("files", staged.file);

        const res = await fetch("/api/properties/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || "Upload failed");
        }

        const json = await res.json();
        const uploadedUrl = json.urls[0] as string;

        // Mark as done
        setStagedFiles((prev) =>
          prev.map((f) =>
            f.id === staged.id
              ? { ...f, status: "done" as const, resultUrl: uploadedUrl }
              : f,
          ),
        );

        // Add to form
        const current = form.getValues("media.media_urls") || [];
        form.setValue("media.media_urls", [...current, uploadedUrl], {
          shouldDirty: true,
        });
      } catch (err) {
        setStagedFiles((prev) =>
          prev.map((f) =>
            f.id === staged.id
              ? {
                  ...f,
                  status: "error" as const,
                  error: err instanceof Error ? err.message : "Upload failed",
                }
              : f,
          ),
        );
      }
    },
    [form],
  );

  // ── Upload all staged files ──
  const handleUploadAll = useCallback(async () => {
    const toUpload = stagedFiles.filter(
      (f) => f.status === "staged" || f.status === "error",
    );
    if (!toUpload.length) return;

    setIsUploading(true);
    for (const staged of toUpload) {
      await uploadSingleFile(staged);
    }
    setIsUploading(false);

    // Clean up completed files from staging
    setStagedFiles((prev) => prev.filter((f) => f.status !== "done"));
  }, [stagedFiles, uploadSingleFile]);

  // ── External URL Handlers ──
  const isValidUrl = useCallback((str: string) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }, []);

  const handleAddUrl = useCallback(() => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    if (!isValidUrl(trimmed)) {
      setUrlError(t("properties.media_invalid_url"));
      return;
    }

    const current = form.getValues("media.urls") || [];
    if (current.includes(trimmed)) {
      setUrlError(t("properties.media_duplicate_url"));
      return;
    }

    form.setValue("media.urls", [...current, trimmed], { shouldDirty: true });
    setUrlInput("");
    setUrlError("");
  }, [urlInput, form, isValidUrl, t]);

  const handleRemoveUrl = useCallback(
    (url: string) => {
      const current = form.getValues("media.urls") || [];
      form.setValue(
        "media.urls",
        current.filter((u) => u !== url),
        { shouldDirty: true },
      );
    },
    [form],
  );

  const handleRemoveMediaUrl = useCallback(
    async (url: string) => {
      setDeletingUrl(url);
      try {
        await fetch("/api/properties/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: url }),
        });
      } catch {
        // Still remove from form even if storage delete fails
      }
      const current = form.getValues("media.media_urls") || [];
      form.setValue(
        "media.media_urls",
        current.filter((u) => u !== url),
        { shouldDirty: true },
      );
      setDeletingUrl(null);
    },
    [form],
  );

  const allImages = [...mediaUrls, ...externalUrls];
  const stagedReady = stagedFiles.filter(
    (f) => f.status === "staged" || f.status === "error",
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* ── Upload Section ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImagePlus className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold text-foreground">
              {t("properties.media_upload_title")}
            </h4>
          </div>
          <span className="text-xs text-muted-foreground">
            {totalImages + doneCount}/{MAX_FILES}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("properties.media_upload_hint")}
        </p>

        {/* Drop Zone (selection only) */}
        {availableSlots > 0 && (
          <label
            className="flex flex-col items-center gap-2 min-h-[140px] justify-center border-dashed border-2 rounded-xl bg-secondary/20 hover:bg-secondary/30 transition-colors cursor-pointer p-6"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
              <ImagePlus className="h-5 w-5 text-accent" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">
                {t("properties.media_drop_text")}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                PNG, JPG, JPEG, WEBP • Max 5MB
              </p>
            </div>
            <input
              type="file"
              className="sr-only"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              multiple
              onChange={handleFileSelect}
            />
          </label>
        )}

        {/* Staged Files Preview */}
        {stagedFiles.length > 0 && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {stagedFiles.map((sf) => (
                <div
                  key={sf.id}
                  className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-secondary/20"
                >
                  <img
                    src={sf.preview}
                    alt={sf.file.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Status overlay */}
                  {sf.status === "uploading" && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    </div>
                  )}
                  {sf.status === "done" && (
                    <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                      <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                        <svg
                          className="h-3.5 w-3.5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                  {sf.status === "error" && (
                    <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
                      <p className="text-[9px] text-white font-bold bg-red-600 px-1.5 py-0.5 rounded">
                        Error
                      </p>
                    </div>
                  )}

                  {/* Remove button (only for staged/error) */}
                  {(sf.status === "staged" || sf.status === "error") && (
                    <button
                      type="button"
                      onClick={() => removeStaged(sf.id)}
                      className="absolute top-1 end-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}

                  {/* File name */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                    <p className="text-[9px] text-white truncate">
                      {sf.file.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Upload Button */}
            {stagedReady.length > 0 && (
              <Button
                type="button"
                onClick={handleUploadAll}
                disabled={isUploading}
                className="w-full h-10 rounded-lg font-semibold bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm transition-colors"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin me-2" />
                    {t("properties.media_uploading")}
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 me-2" />
                    {t("properties.media_upload_btn")} ({stagedReady.length})
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ── External URL Section ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold text-foreground">
            {t("properties.media_external_title")}
          </h4>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("properties.media_external_hint")}
        </p>

        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value);
              setUrlError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddUrl();
              }
            }}
            placeholder={t("properties.media_url_placeholder")}
            className="h-10 rounded-lg border-border bg-transparent focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-accent transition-colors"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddUrl}
            className="h-10 px-4 shrink-0 rounded-lg font-medium"
          >
            <Plus className="h-4 w-4 me-1.5" />
            {t("properties.media_add_url")}
          </Button>
        </div>
        {urlError && (
          <p className="text-[11px] font-semibold text-destructive">
            {urlError}
          </p>
        )}

        {/* External URL List */}
        {externalUrls.length > 0 && (
          <div className="space-y-1.5">
            {externalUrls.map((url, i) => (
              <div
                key={`ext-${i}`}
                className="flex items-center gap-2 rounded-lg bg-secondary/30 border border-border/50 px-3 py-2"
              >
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs text-foreground truncate flex-1 min-w-0">
                  {url}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveUrl(url)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive shrink-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Already-uploaded Image Previews ── */}
      {allImages.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">
            {t("properties.media_preview")} ({allImages.length})
          </h4>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {allImages.map((url, i) => {
              const isUploaded = mediaUrls.includes(url);
              return (
                <div
                  key={`preview-${i}`}
                  className={`relative group aspect-square rounded-lg overflow-hidden border border-border bg-secondary/20 ${
                    deletingUrl === url ? "pointer-events-none" : ""
                  }`}
                >
                  <img
                    src={url}
                    alt={`Property ${i + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='1.5'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Cpath d='M3 16l5-5c.6-.6 1.4-.6 2 0l7 7'/%3E%3Cpath d='M14 14l1-1c.6-.6 1.4-.6 2 0l4 4'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3C/svg%3E";
                    }}
                  />

                  {/* Deleting overlay */}
                  {deletingUrl === url ? (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          isUploaded
                            ? handleRemoveMediaUrl(url)
                            : handleRemoveUrl(url)
                        }
                        className="h-8 w-8 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <div
                    className={`absolute top-1.5 start-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      isUploaded
                        ? "bg-accent/90 text-white"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {isUploaded
                      ? t("properties.media_uploaded")
                      : t("properties.media_linked")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
