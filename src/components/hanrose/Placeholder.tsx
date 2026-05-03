import { Crown, Sparkles, Heart } from "lucide-react";
import logo from "@/assets/hanrose-logo.png";

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
      <img
        src={logo}
        alt="Hanrose Atelier"
        className="relative w-2/3 max-w-[260px] object-contain drop-shadow-sm"
      />
      <span className="relative mt-2 font-serif text-xs tracking-[0.2em] uppercase text-foreground/50 italic px-4 text-center">
        {label}
      </span>
      <Icon className="hidden" />
    </div>
  );
};
