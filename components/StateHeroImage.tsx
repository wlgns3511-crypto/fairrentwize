/**
 * Above-the-fold state photo with Wikimedia Commons attribution.
 *
 * Static <picture> (AVIF + JPEG fallback), no Next.js /_next/image runtime.
 * LCP candidate: fetchPriority="high", explicit width/height, no CLS.
 *
 * Forked from salarybycity/components/StateHeroImage.tsx — manifest + asset
 * pool are shared across all state-anchored sites.
 */
import type { StateImage } from '@/lib/state-images';

interface Props {
  img: StateImage;
}

export function StateHeroImage({ img }: Props) {
  return (
    <figure className="mb-6 rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
      <picture>
        <source type="image/avif" srcSet={img.avifPath} />
        <img
          src={img.jpgPath}
          alt={`Image of ${img.name}`}
          width={img.finalWidth}
          height={img.finalHeight}
          decoding="async"
          fetchPriority="high"
          className="max-h-[500px] max-w-full w-auto h-auto mx-auto block"
        />
      </picture>
      <figcaption className="text-xs text-slate-500 px-3 py-2 bg-slate-50 border-t border-slate-200 leading-relaxed">
        Image
        {img.artistText && img.artistText.toLowerCase() !== 'own work' && (
          <> by <span className="text-slate-600">{img.artistText.slice(0, 80)}</span></>
        )}
        {' · '}
        <a
          href={img.commonsFileUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="underline hover:text-slate-700"
        >
          Wikimedia Commons
        </a>
        {' · '}
        {img.licenseUrl ? (
          <a
            href={img.licenseUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="underline hover:text-slate-700"
          >
            {img.licenseShort}
          </a>
        ) : (
          <span>{img.licenseShort}</span>
        )}
        {' · resized'}
      </figcaption>
    </figure>
  );
}
