export function Avatar({
  src,
  name,
  size = "md",
}: {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const px = size === "sm" ? "h-9 w-9 text-xs" : size === "lg" ? "h-20 w-20 text-xl" : "h-12 w-12 text-sm";
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={`${px} rounded-full object-cover ring-2 ring-white`}
      />
    );
  }

  return (
    <span
      className={`${px} inline-flex items-center justify-center rounded-full bg-brand-soft font-semibold text-brand-dark`}
    >
      {initials}
    </span>
  );
}

export function TruckPhotos({
  photos,
  alt,
  className = "h-44",
}: {
  photos: string[];
  alt: string;
  className?: string;
}) {
  const shots = (photos ?? []).filter(Boolean).slice(0, 2);
  if (!shots.length) {
    return (
      <div
        className={`${className} flex items-center justify-center rounded-2xl bg-navy/8 text-sm text-muted`}
      >
        No photos yet
      </div>
    );
  }

  return (
    <div className={`grid overflow-hidden rounded-2xl ${shots.length > 1 ? "grid-cols-2 gap-1" : "grid-cols-1"}`}>
      {shots.map((src) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt={alt}
          className={`${className} w-full object-cover`}
        />
      ))}
    </div>
  );
}

export function readImageFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
