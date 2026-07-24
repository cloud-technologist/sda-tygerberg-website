type LogoProps = {
  size?: number;
  ringColor?: string;
};

/** CSS-drawn church mark: a rotated square ("drop"/pin) inside a navy circle. No bitmap logo file. */
export function Logo({ size = 38, ringColor = '#f6f2e9' }: LogoProps) {
  const dropSize = Math.round(size * 0.4);
  return (
    <div
      className="flex-none rounded-full bg-navy flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <div
        style={{
          width: dropSize,
          height: dropSize,
          border: `2px solid ${ringColor}`,
          borderRadius: '0 50% 50% 50%',
          transform: 'rotate(45deg)',
        }}
      />
    </div>
  );
}
