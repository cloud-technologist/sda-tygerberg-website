// Imported as raw markup rather than as an <img> src so the symbol inherits
// `currentColor`. It appears on cream in the headers and on navy in the
// footers, and the official identity has both a solid and a reversed treatment
// — one file that takes its colour from context serves both.
import symbol from '../../assets/sda-symbol.svg?raw';

type LogoProps = {
  size?: number;
  /** Colour of the mark. Navy on light surfaces, cream on dark ones. */
  color?: string;
};

/**
 * The official Seventh-day Adventist symbol: the open Bible, the cross, and
 * the flame of the Holy Spirit rising from it.
 *
 * The mark is a trademark of the General Conference of Seventh-day Adventists,
 * used here by a member congregation. It is reproduced from the official
 * artwork rather than redrawn — the identity system governs its proportions,
 * so an approximation that merely resembles it would be wrong on both counts.
 * Colour is the only permitted variation applied here; the geometry is
 * untouched.
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
