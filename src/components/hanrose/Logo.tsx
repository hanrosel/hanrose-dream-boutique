import { Crown } from "lucide-react";

export const Logo = ({ className = "" }: { className?: string }) => (
  <a href="#top" className={`flex items-center gap-2 ${className}`}>
    <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-pink-blue shadow-soft">
      <Crown className="h-5 w-5 text-white" strokeWidth={1.5} />
    </span>
    <span className="flex flex-col leading-none">
      <span className="font-serif text-xl tracking-wide text-foreground">Hanrose</span>
      <span className="text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">Atelier</span>
    </span>
  </a>
);
