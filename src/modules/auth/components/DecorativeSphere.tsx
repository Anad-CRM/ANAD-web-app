import { clsx } from "clsx";

interface DecorativeSphereProps {
  size?: string;
  className?: string;
  color?: string;
  blur?: string;
  backdropBlur?: string;
  opacity?: number;
}

const DecorativeSphere: React.FC<DecorativeSphereProps> = ({
  size = "300px",
  className,
  color = "radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 70%)",
  blur,
  backdropBlur,
  opacity = 1,
}) => {
  return (
    <div
      className={clsx("absolute rounded-full pointer-events-none", className)}
      style={{
        width: size,
        height: size,
        background: color,
        filter: blur ? `blur(${blur})` : undefined,
        backdropFilter: backdropBlur ? `blur(${backdropBlur})` : undefined,
        opacity: opacity,
      }}
    />
  );
};

export default DecorativeSphere;
