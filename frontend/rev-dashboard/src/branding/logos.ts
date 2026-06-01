export const REV_BRAND = {
  name: 'Red de Emergencia Valle',
  shortName: 'REV',
  tagline: 'Innovación que resguarda el mañana',
  municipality: 'Municipalidad de Valle del Sol',
} as const;

/** Variantes de logo disponibles en /public/assets/logos */
export const REV_LOGOS = {
  /** Emblema claro (blanco/naranja) — ideal sobre fondos oscuros */
  emblemLight: '/assets/logos/emblem-light.png',
  /** Emblema a color (azul/naranja) */
  emblemColor: '/assets/logos/emblem-color.png',
  /** Emblema a color — variante alternativa */
  emblemColorAlt: '/assets/logos/emblem-color-alt.png',
  /** Emblema monocromático azul */
  emblemMonochromeBlue: '/assets/logos/emblem-monochrome-blue.png',
  /** Logo horizontal a color con nombre y eslogan */
  horizontalColor: '/assets/logos/logo-horizontal-color.png',
  /** Logo horizontal claro con barra azul */
  horizontalLight: '/assets/logos/logo-horizontal-light.png',
  /** Logo horizontal claro con eslogan */
  horizontalLightTagline: '/assets/logos/logo-horizontal-light-tagline.png',
} as const;

export type RevLogoVariant = keyof typeof REV_LOGOS;

export const REV_LOGO_META: Record<
  RevLogoVariant,
  { label: string; aspectRatio: 'square' | 'horizontal' }
> = {
  emblemLight: { label: 'Emblema claro', aspectRatio: 'square' },
  emblemColor: { label: 'Emblema a color', aspectRatio: 'square' },
  emblemColorAlt: { label: 'Emblema a color (alt.)', aspectRatio: 'square' },
  emblemMonochromeBlue: { label: 'Emblema azul', aspectRatio: 'square' },
  horizontalColor: { label: 'Logo horizontal a color', aspectRatio: 'horizontal' },
  horizontalLight: { label: 'Logo horizontal claro', aspectRatio: 'horizontal' },
  horizontalLightTagline: {
    label: 'Logo horizontal con eslogan',
    aspectRatio: 'horizontal',
  },
};

export const REV_FAVICON = REV_LOGOS.emblemColor;

/** Coordenadas de referencia municipal (Valle del Sol) */
export const REV_GEO = {
  lat: -33.5,
  lng: -70.5,
  label: 'Valle del Sol',
} as const;

/** Imágenes de marca / UI */
export const REV_IMAGES = {
  loginHero: '/assets/images/login-hero.jpg',
  /** Dispositivo REV en espacio público */
  deviceField: '/assets/images/rev-device.png',
  /** Brigada y ciudadanía coordinando en terreno */
  fieldTeam: '/assets/images/rev-field-team.png',
  /** Pilares REV — sección Acerca de (Inicio) */
  aboutDispatch: '/assets/images/rev-about-dispatch.png',
  aboutMap: '/assets/images/rev-about-map.png',
  aboutPortal: '/assets/images/rev-about-portal.png',
} as const;
