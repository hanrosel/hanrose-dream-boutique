import { Link } from "react-router-dom";
import logo from "@/assets/hanrose-logo.png";

export const Logo = ({ className = "" }: { className?: string }) => (
  <Link to="/" className={`flex items-center gap-2 ${className}`} aria-label="Hanrose Atelier">
    <img
      src={logo}
      alt="Hanrose Atelier logo"
      className="h-16 md:h-20 w-auto object-contain"
      loading="eager"
      decoding="async"
    />
  </Link>
);
