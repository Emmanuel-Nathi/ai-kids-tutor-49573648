import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type TransparentLogoProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string;
};

let processedCache = new Map<string, string>();
let pendingCache = new Map<string, Promise<string>>();

const makeTransparent = async (src: string) => {
  if (processedCache.has(src)) return processedCache.get(src)!;
  if (pendingCache.has(src)) return pendingCache.get(src)!;

  const work = new Promise<string>((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) {
        resolve(src);
        return;
      }

      context.drawImage(image, 0, 0);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];

        if (a === 0) continue;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const spread = max - min;
        const brightness = (r + g + b) / 3;

        const isNeutralBackground = spread <= 12 && brightness <= 30;
        if (isNeutralBackground) {
          pixels[i + 3] = 0;
        }
      }

      context.putImageData(imageData, 0, 0);
      const cleaned = canvas.toDataURL("image/png");
      processedCache.set(src, cleaned);
      resolve(cleaned);
    };

    image.onerror = () => resolve(src);
    image.src = src;
  });

  pendingCache.set(src, work);
  const result = await work;
  pendingCache.delete(src);
  return result;
};

const TransparentLogo = ({ src, alt = "AI Kids Tutor", className, style, ...props }: TransparentLogoProps) => {
  const [renderSrc, setRenderSrc] = useState(src);

  useEffect(() => {
    let active = true;

    makeTransparent(src).then((cleaned) => {
      if (active) setRenderSrc(cleaned);
    });

    return () => {
      active = false;
    };
  }, [src]);

  return (
    <img
      src={renderSrc}
      alt={alt}
      className={cn("transparent-asset", className)}
      style={{
        background: "transparent",
        backgroundColor: "transparent",
        backgroundImage: "none",
        mixBlendMode: "normal",
        ...style,
      }}
      {...props}
    />
  );
};

export default TransparentLogo;
