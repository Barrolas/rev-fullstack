import {
  REV_BRAND,
  REV_LOGOS,
  type RevLogoVariant,
} from '../../branding/logos';

const SIZE_PRESETS = {
  xs: 28,
  sm: 36,
  md: 56,
  lg: 80,
  xl: 120,
} as const;

export type RevLogoSize = keyof typeof SIZE_PRESETS | number;

export interface RevLogoProps {
  variant?: RevLogoVariant;
  size?: RevLogoSize;
  alt?: string;
  className?: string;
  title?: string;
}

function resolveSize(size: RevLogoSize): number {
  return typeof size === 'number' ? size : SIZE_PRESETS[size];
}

export default function RevLogo({
  variant = 'emblemColor',
  size = 'md',
  alt,
  className = '',
  title,
}: RevLogoProps) {
  const px = resolveSize(size);
  const src = REV_LOGOS[variant];
  const isHorizontal = variant.startsWith('horizontal');
  const width = isHorizontal ? Math.round(px * 2.8) : px;
  const height = px;

  return (
    <img
      src={src}
      alt={alt ?? REV_BRAND.shortName}
      title={title ?? REV_BRAND.name}
      className={`rev-logo${isHorizontal ? ' rev-logo--horizontal' : ' rev-logo--emblem'} ${className}`.trim()}
      width={width}
      height={height}
      loading="eager"
      decoding="async"
    />
  );
}
