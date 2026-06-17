"use client";

import { useRef } from "react";
import { CameraIcon, CheckIcon, CloseIcon } from "@/components/ui/icons";
import { downscaleImage } from "@/lib/photo";

/** Presentational thumbnail: photo or a dashed camera placeholder. */
export function PhotoThumb({
  photo,
  size,
  radius,
  doneBadge = false,
}: {
  photo: string | null;
  size: number;
  radius: number;
  doneBadge?: boolean;
}) {
  const large = size >= 70;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt=""
          className="h-full w-full object-cover"
          style={{ borderRadius: radius }}
        />
      ) : (
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-0.5 border-[1.5px] border-dashed bg-fill-2 text-eyebrow"
          style={{ borderRadius: radius, borderColor: "#cfccc3" }}
        >
          <CameraIcon size={large ? 22 : 21} />
          {large ? <span className="text-[10px] font-bold text-eyebrow">Foto</span> : null}
        </div>
      )}
      {doneBadge ? (
        <span
          className="absolute -bottom-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-app text-white"
          style={{ background: "var(--accent)" }}
        >
          <CheckIcon size={9} />
        </span>
      ) : null}
    </div>
  );
}

/** Tappable photo tile with upload (camera on mobile) + remove. */
export function PhotoUpload({
  photo,
  size,
  radius,
  onChange,
  onRemove,
}: {
  photo: string | null;
  size: number;
  radius: number;
  onChange: (dataUrl: string) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const url = await downscaleImage(file);
      onChange(url);
    } catch {
      // ignore non-images / decode errors
    }
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="block h-full w-full"
        aria-label="Foto aufnehmen oder hochladen"
      >
        <PhotoThumb photo={photo} size={size} radius={radius} />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      {photo ? (
        <button
          type="button"
          onClick={onRemove}
          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-line bg-surface text-ink-2 shadow-sm"
          aria-label="Foto entfernen"
        >
          <CloseIcon size={13} />
        </button>
      ) : null}
    </div>
  );
}
