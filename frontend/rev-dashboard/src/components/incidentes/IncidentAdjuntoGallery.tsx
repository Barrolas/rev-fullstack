import { useEffect, useState } from 'react';
import { Badge, Col, Row } from 'react-bootstrap';
import { AdjuntoMeta, adjuntoUrl, getToken } from '../../api';

interface IncidentAdjuntoGalleryProps {
  incidenteId: string;
  adjuntos: AdjuntoMeta[];
}

function AuthenticatedMedia({
  incidenteId,
  adjunto,
}: {
  incidenteId: string;
  adjunto: AdjuntoMeta;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const isImage = adjunto.mimeType?.startsWith('image/') ?? adjunto.tipo === 'FOTO';
  const isVideo = adjunto.mimeType?.startsWith('video/') ?? adjunto.tipo === 'VIDEO';

  useEffect(() => {
    let objectUrl: string | null = null;
    const token = getToken();
    if (!token) return;

    fetch(adjuntoUrl(incidenteId, adjunto.id), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('No se pudo cargar el adjunto');
        return res.blob();
      })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => setSrc(null));

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [incidenteId, adjunto.id, adjunto.mimeType, adjunto.tipo]);

  if (!src) {
    return (
      <div className="rev-adjunto-placeholder small text-muted p-3">
        <i className="bi bi-file-earmark me-1" />
        {adjunto.nombreArchivo}
      </div>
    );
  }

  if (isVideo) {
    return <video src={src} controls className="rev-adjunto-media" />;
  }

  if (isImage) {
    return <img src={src} alt={adjunto.nombreArchivo} className="rev-adjunto-media" />;
  }

  return (
    <a href={src} download={adjunto.nombreArchivo} className="small">
      Descargar {adjunto.nombreArchivo}
    </a>
  );
}

export default function IncidentAdjuntoGallery({
  incidenteId,
  adjuntos,
}: IncidentAdjuntoGalleryProps) {
  if (!adjuntos.length) return null;

  return (
    <div className="mt-4">
      <h3 className="h6 mb-3">Evidencia adjunta</h3>
      <Row className="g-3">
        {adjuntos.map((adjunto) => (
          <Col key={adjunto.id} xs={12} sm={6} md={4}>
            <div className="rev-adjunto-card">
              <AuthenticatedMedia incidenteId={incidenteId} adjunto={adjunto} />
              <p className="small text-muted mb-0 mt-2">{adjunto.nombreArchivo}</p>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
}
