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
      <label className="rev-public-identity__toggle">
        <input
          type="checkbox"
          checked={value.anonimo}
          onChange={(e) => update({ anonimo: e.target.checked })}
          disabled={disabled}
        />
        <span>
          <span className="rev-public-identity__toggle-title">Reporte anónimo</span>
          <span className="rev-public-identity__toggle-desc">
            Activado por defecto. Desmárquelo para dejar sus datos de contacto.
          </span>
        </span>
      </label>

      {!value.anonimo && (
        <div className="rev-public-identity__fields">
          <div className="rev-public-identity__grid">
            <div className="rev-public-form__field">
              <label className="rev-field__label" htmlFor="reportante-nombre">
                Nombre
              </label>
              <input
                id="reportante-nombre"
                className="rev-public-form__input"
                value={value.nombre}
                onChange={(e) => update({ nombre: e.target.value })}
                disabled={disabled}
              />
            </div>
            <div className="rev-public-form__field">
              <label className="rev-field__label" htmlFor="reportante-apellido">
                Apellido
              </label>
              <input
                id="reportante-apellido"
                className="rev-public-form__input"
                value={value.apellido}
                onChange={(e) => update({ apellido: e.target.value })}
                disabled={disabled}
              />
            </div>
            <div className="rev-public-form__field">
              <label className="rev-field__label" htmlFor="reportante-rut">
                RUT (opcional)
              </label>
              <input
                id="reportante-rut"
                className="rev-public-form__input"
                value={value.rut}
                onChange={(e) => update({ rut: e.target.value })}
                disabled={disabled}
              />
            </div>
            <div className="rev-public-form__field">
              <label className="rev-field__label" htmlFor="reportante-contacto">
                Teléfono o email
              </label>
              <input
                id="reportante-contacto"
                className="rev-public-form__input"
                value={value.contacto}
                onChange={(e) => update({ contacto: e.target.value })}
                disabled={disabled}
              />
            </div>
          </div>

          <label className="rev-public-identity__toggle">
            <input
              type="checkbox"
              checked={value.registrarme}
              onChange={(e) => update({ registrarme: e.target.checked })}
              disabled={disabled}
            />
            <span>
              <span className="rev-public-identity__toggle-title">Crear cuenta Ciudadano REV</span>
              <span className="rev-public-identity__toggle-desc">
                Podrá ingresar después para ver el estado de sus reportes.
              </span>
            </span>
          </label>

          {value.registrarme && (
            <div className="rev-public-identity__register">
              <div className="rev-public-form__field">
                <label className="rev-field__label" htmlFor="registro-username">
                  Usuario *
                </label>
                <input
                  id="registro-username"
                  className="rev-public-form__input"
                  value={value.registroUsername}
                  onChange={(e) => update({ registroUsername: e.target.value })}
                  disabled={disabled}
                  required={value.registrarme}
                />
              </div>
              <div className="rev-public-form__field">
                <label className="rev-field__label" htmlFor="registro-email">
                  Email
                </label>
                <input
                  id="registro-email"
                  type="email"
                  className="rev-public-form__input"
                  value={value.registroEmail}
                  onChange={(e) => update({ registroEmail: e.target.value })}
                  disabled={disabled}
                />
              </div>
              <div className="rev-public-form__field">
                <label className="rev-field__label" htmlFor="registro-password">
                  Clave *
                </label>
                <input
                  id="registro-password"
                  type="password"
                  className="rev-public-form__input"
                  value={value.registroPassword}
                  onChange={(e) => update({ registroPassword: e.target.value })}
                  disabled={disabled}
                  required={value.registrarme}
                  minLength={6}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
