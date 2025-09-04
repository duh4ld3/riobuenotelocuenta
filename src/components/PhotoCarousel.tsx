import React from 'react';
import type { Photo } from '../types';
import { normalizeImageUrl, thumbnailImageUrl, PLACEHOLDER } from '../lib/images';

type Props = {
  photos: Photo[];
};

const PhotoCarousel: React.FC<Props> = ({ photos }) => {
  // Nada que mostrar
  if (!photos || photos.length === 0) {
    return (
      <div className="bg-darkCard border border-darkBorder rounded-lg p-6 text-center text-gray-400">
        No hay fotos para este mes.
      </div>
    );
  }

  // Puedes cambiar 1280 por el ancho que prefieras para la imagen "grande"
  const bigWidth = 1280;

  return (
    <div className="bg-darkCard border border-darkBorder rounded-lg overflow-hidden">
      <div className="relative w-full">
        {/* Por simplicidad, mostramos la primera foto; si quieres flechas, dots, etc. puedes
           añadir estado local para mover el índice actual */}
        {photos.map((p, idx) => {
          // Primero intentamos una miniatura grande; si no aplica, normalizamos la URL
          const src =
            p?.src
              ? thumbnailImageUrl(p.src, bigWidth) || normalizeImageUrl(p.src)
              : PLACEHOLDER;

          const alt = p?.alt?.trim() || 'Foto del proyecto';

          return (
            <img
              key={`${idx}-${p?.src ?? 'placeholder'}`}
              src={src}
              alt={alt}
              className={idx === 0 ? 'block w-full object-cover' : 'hidden'}
              loading="lazy"
              onError={(e) => {
                if (e.currentTarget.src !== PLACEHOLDER) {
                  e.currentTarget.src = PLACEHOLDER;
                }
              }}
            />
          );
        })}
      </div>

      {/* Tira de miniaturas (si hay varias fotos) */}
      {photos.length > 1 && (
        <div className="flex gap-2 p-2 overflow-x-auto bg-darkBg/40">
          {photos.map((p, idx) => {
            const thumb =
              p?.src
                ? thumbnailImageUrl(p.src, 320) || normalizeImageUrl(p.src)
                : PLACEHOLDER;

            const alt = p?.alt?.trim() || `Foto ${idx + 1}`;

            return (
              <img
                key={`thumb-${idx}-${p?.src ?? 'placeholder'}`}
                src={thumb}
                alt={alt}
                className="h-16 w-28 object-cover rounded-md border border-darkBorder shrink-0"
                loading="lazy"
                onError={(e) => {
                  if (e.currentTarget.src !== PLACEHOLDER) {
                    e.currentTarget.src = PLACEHOLDER;
                  }
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PhotoCarousel;
