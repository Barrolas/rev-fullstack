export interface ReporterIdentityValue {
  anonimo: boolean;
  nombre: string;
  apellido: string;
  rut: string;
  contacto: string;
  registrarme: boolean;
  registroUsername: string;
  registroPassword: string;
  registroEmail: string;
}

interface ReporterIdentitySectionProps {
  value: ReporterIdentityValue;
  onChange: (value: ReporterIdentityValue) => void;
  disabled?: boolean;
}

export default function ReporterIdentitySection({
  value,
  onChange,
  disabled = false,
}: ReporterIdentitySectionProps) {
  const update = (patch: Partial<ReporterIdentityValue>) => onChange({ ...value, ...patch });

  return (
    <div className="rev-public-identity">
      <label className="rev-public-identity__check d-flex align-items-start gap-2 mb-3">
        <input
          type="checkbox"
          checked={value.anonimo}
          onChange={(e) => update({ anonimo: e.target.checked })}
          disabled={disabled}
        />
        <span>
          <strong>Reporte anónimo</strong>
          <span className="d-block small text-muted">
            Si lo desmarca, puede indicar sus datos de contacto de forma opcional.
          </span>
        </span>
      </label>

      {!value.anonimo && (
        <>
          <div className="row g-2 mb-2">
            <div className="col-sm-6">
              <label className="rev-field__label" htmlFor="reportante-nombre">
                Nombre
              </label>
              <input
                id="reportante-nombre"
                className="rev-field__input w-100"
                value={value.nombre}
                onChange={(e) => update({ nombre: e.target.value })}
                disabled={disabled}
              />
            </div>
            <div className="col-sm-6">
              <label className="rev-field__label" htmlFor="reportante-apellido">
                Apellido
              </label>
              <input
                id="reportante-apellido"
                className="rev-field__input w-100"
                value={value.apellido}
                onChange={(e) => update({ apellido: e.target.value })}
                disabled={disabled}
              />
            </div>
          </div>

          <div className="row g-2 mb-2">
            <div className="col-sm-6">
              <label className="rev-field__label" htmlFor="reportante-rut">
                RUT (opcional)
              </label>
              <input
                id="reportante-rut"
                className="rev-field__input w-100"
                value={value.rut}
                onChange={(e) => update({ rut: e.target.value })}
                disabled={disabled}
              />
            </div>
            <div className="col-sm-6">
              <label className="rev-field__label" htmlFor="reportante-contacto">
                Teléfono o email
              </label>
              <input
                id="reportante-contacto"
                className="rev-field__input w-100"
                value={value.contacto}
                onChange={(e) => update({ contacto: e.target.value })}
                disabled={disabled}
              />
            </div>
          </div>

          <label className="rev-public-identity__check d-flex align-items-start gap-2 mb-2">
            <input
              type="checkbox"
              checked={value.registrarme}
              onChange={(e) => update({ registrarme: e.target.checked })}
              disabled={disabled}
            />
            <span>
              <strong>Crear cuenta Ciudadano REV</strong>
              <span className="d-block small text-muted">
                Podrá ingresar después para ver el estado de sus reportes.
              </span>
            </span>
          </label>

          {value.registrarme && (
            <div className="rev-public-identity__register p-3 mb-2">
              <div className="mb-2">
                <label className="rev-field__label" htmlFor="registro-username">
                  Usuario *
                </label>
                <input
                  id="registro-username"
                  className="rev-field__input w-100"
                  value={value.registroUsername}
                  onChange={(e) => update({ registroUsername: e.target.value })}
                  disabled={disabled}
                  required={value.registrarme}
                />
              </div>
              <div className="mb-2">
                <label className="rev-field__label" htmlFor="registro-email">
                  Email
                </label>
                <input
                  id="registro-email"
                  type="email"
                  className="rev-field__input w-100"
                  value={value.registroEmail}
                  onChange={(e) => update({ registroEmail: e.target.value })}
                  disabled={disabled}
                />
              </div>
              <div>
                <label className="rev-field__label" htmlFor="registro-password">
                  Clave *
                </label>
                <input
                  id="registro-password"
                  type="password"
                  className="rev-field__input w-100"
                  value={value.registroPassword}
                  onChange={(e) => update({ registroPassword: e.target.value })}
                  disabled={disabled}
                  required={value.registrarme}
                  minLength={6}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
