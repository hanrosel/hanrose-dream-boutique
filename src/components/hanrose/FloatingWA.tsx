import { MessageCircle } from "lucide-react";
import { WA_LINK } from "@/lib/hanrose";

export const FloatingWA = () => (
  <a
    href={WA_LINK}
    target="_blank"
    rel="noreferrer"
    aria-label="Chat WhatsApp"
    className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-[hsl(142_70%_45%)] text-white shadow-elegant flex items-center justify-center hover:scale-110 transition-smooth animate-float"
  >
    <MessageCircle className="h-6 w-6" />
  </a>
);
