import { ChangeEvent, useState } from 'react';
import { sha256Hex } from '../../utils/fileHash';

const MAX_PHOTOS = 3;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];

export interface MediaCaptureValue {
  fotos: File[];
  video: File | null;
}

interface IncidentMediaCaptureProps {
  value: MediaCaptureValue;
  onChange: (value: MediaCaptureValue) => void;
  disabled?: boolean;
}

export default function IncidentMediaCapture({
  value,
  onChange,
  disabled = false,
}: IncidentMediaCaptureProps) {
  const [error, setError] = useState('');
  const [hashing, setHashing] = useState(false);

  const validateAndAddPhoto = async (file: File) => {
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setError('Formato de foto no permitido. Use JPG, PNG o WebP.');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError('Cada foto debe pesar menos de 10 MB.');
      return;
    }
    if (value.fotos.length >= MAX_PHOTOS) {
      setError(`Máximo ${MAX_PHOTOS} fotos por reporte.`);
      return;
    }

    setHashing(true);
    try {
      const hash = await sha256Hex(file);
      const duplicate = value.fotos.some((f) => (f as File & { _hash?: string })._hash === hash);
      if (duplicate) {
        setError('Esta imagen ya fue adjuntada a este reporte.');
        return;
      }
      const tagged = file as File & { _hash?: string };
      tagged._hash = hash;
      onChange({ ...value, fotos: [...value.fotos, file] });
      setError('');
    } finally {
      setHashing(false);
    }
  };

  const validateAndSetVideo = async (file: File) => {
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      setError('Formato de video no permitido. Use MP4 o WebM.');
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setError('El video debe pesar menos de 50 MB.');
      return;
    }
    setHashing(true);
    try {
      const hash = await sha256Hex(file);
      if (value.video && (value.video as File & { _hash?: string })._hash === hash) {
        setError('Este video ya fue adjuntado.');
        return;
      }
      const tagged = file as File & { _hash?: string };
      tagged._hash = hash;
      onChange({ ...value, video: file });
      setError('');
    } finally {
      setHashing(false);
    }
  };

  const onPhotosChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    for (const file of files) {
      await validateAndAddPhoto(file);
    }
  };

  const onVideoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) await validateAndSetVideo(file);
  };

  const removePhoto = (index: number) => {
    onChange({ ...value, fotos: value.fotos.filter((_, i) => i !== index) });
  };

  const removeVideo = () => onChange({ ...value, video: null });

  return (
    <div className="rev-public-media">
      <p className="rev-field__label mb-2">Evidencia multimedia (opcional)</p>
      <p className="small text-muted mb-3">
        Hasta {MAX_PHOTOS} fotos y 1 video. En celular puede usar la cámara directamente.
      </p>

      <div className="d-flex flex-wrap gap-2 mb-3">
        <label className={`rev-public-media__btn${disabled || hashing ? ' rev-public-media__btn--disabled' : ''}`}>
          <i className="bi bi-camera me-1" />
          Agregar foto ({value.fotos.length}/{MAX_PHOTOS})
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/*"
            capture="environment"
            multiple
            hidden
            disabled={disabled || hashing || value.fotos.length >= MAX_PHOTOS}
            onChange={onPhotosChange}
          />
        </label>

        <label className={`rev-public-media__btn${disabled || hashing ? ' rev-public-media__btn--disabled' : ''}`}>
          <i className="bi bi-camera-video me-1" />
          {value.video ? 'Cambiar video' : 'Agregar video'}
          <input
            type="file"
            accept="video/mp4,video/webm,video/*"
            capture="environment"
            hidden
            disabled={disabled || hashing}
            onChange={onVideoChange}
          />
        </label>
      </div>

      {hashing && <p className="small text-muted">Verificando archivos…</p>}
      {error && (
        <p className="small text-warning mb-2" role="alert">
          {error}
        </p>
      )}

      {value.fotos.length > 0 && (
        <ul className="rev-public-media__list list-unstyled mb-2">
          {value.fotos.map((foto, index) => (
            <li key={`${foto.name}-${index}`} className="rev-public-media__item">
              <span>
                <i className="bi bi-image me-1" />
                {foto.name} ({(foto.size / 1024 / 1024).toFixed(1)} MB)
              </span>
              <button
                type="button"
                className="rev-public-media__remove"
                onClick={() => removePhoto(index)}
                disabled={disabled}
                aria-label="Quitar foto"
              >
                <i className="bi bi-x-lg" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {value.video && (
        <div className="rev-public-media__item mb-0">
          <span>
            <i className="bi bi-film me-1" />
            {value.video.name} ({(value.video.size / 1024 / 1024).toFixed(1)} MB)
          </span>
          <button
            type="button"
            className="rev-public-media__remove"
            onClick={removeVideo}
            disabled={disabled}
            aria-label="Quitar video"
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>
      )}
    </div>
  );
}
