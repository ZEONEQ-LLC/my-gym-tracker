// Client-side photo handling — downscales to max 720px and stores as a
// compressed JPEG data URL (~quality 0.82), matching the prototype. In a
// future Supabase setup this would upload to storage and persist a hosted URL
// instead; keep the call site (the PhotoUpload component) the only thing that
// changes then.

const MAX = 720;
const QUALITY = 0.82;

export function downscaleImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\//.test(file.type)) {
      reject(new Error("not an image"));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error("image decode failed"));
      img.onload = () => {
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const ctx = c.getContext("2d");
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        try {
          resolve(c.toDataURL("image/jpeg", QUALITY));
        } catch {
          resolve(dataUrl);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}
