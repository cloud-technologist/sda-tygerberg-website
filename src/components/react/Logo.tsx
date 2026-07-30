// Raw markup, not an <img>, so the symbol inherits `currentColor` — C-25.
import symbol from '../../assets/sda-symbol.svg?raw';

type LogoProps = {
  size?: number;
  /** Colour of the mark. Navy on light surfaces, cream on dark ones. */
  color?: string;
};

/**
 * The official Seventh-day Adventist symbol. A General Conference trademark:
 * colour is the only permitted variation — CONCERNS.md C-25.
 */
export function Logo({ size = 38, color = 'var(--color-navy)' }: LogoProps) {
  return (
    <span
      aria-hidden
      className="flex-none inline-flex items-center justify-center"
      style={{ width: size, height: size, color }}
      dangerouslySetInnerHTML={{ __html: symbol }}
    />
  );
}
