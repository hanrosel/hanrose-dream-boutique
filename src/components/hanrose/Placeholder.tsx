import { Crown, Sparkles, Heart } from "lucide-react";

const icons = { crown: Crown, sparkles: Sparkles, heart: Heart };

export const Placeholder = ({
  label,
  className = "",
  variant = "pink",
  icon = "sparkles",
}: {
  label: string;
  className?: string;
  variant?: "pink" | "blue" | "mixed" | "cream";
  icon?: keyof typeof icons;
}) => {
  const Icon = icons[icon];
  const bg =
    variant === "pink"
      ? "bg-gradient-to-br from-pink-soft via-white to-pink/30"
      : variant === "blue"
      ? "bg-gradient-to-br from-blue-soft via-white to-blue/30"
      : variant === "cream"
      ? "bg-gradient-to-br from-cream via-white to-pink-soft"
      : "bg-gradient-card";
  return (
    <div
      className={`relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/60 ${bg} ${className}`}
    >
      <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{
        backgroundImage:
          "radial-gradient(circle at 20% 20%, white 0%, transparent 40%), radial-gradient(circle at 80% 70%, white 0%, transparent 40%)",
      }} />
      <Icon className="h-8 w-8 text-pink/70 mb-3 animate-sparkle" strokeWidth={1.2} />
      <span className="font-serif text-sm tracking-wider text-foreground/60 italic px-4 text-center">
        {label}
      </span>
    </div>
  );
};
