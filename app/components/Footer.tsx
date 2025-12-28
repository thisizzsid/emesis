import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full glass border-t border-[#F5C26B]/10 py-1.5 px-2 md:py-2 md:px-6 backdrop-blur-2xl flex-shrink-0">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between text-zinc-600 text-[10px] md:text-xs font-medium gap-1 md:gap-4">
        <p className="text-transparent bg-linear-to-r from-[#F5C26B] to-[#FFD56A] bg-clip-text font-bold tracking-wide text-[10px] md:text-xs">
          EMESIS © {new Date().getFullYear()}
        </p>

        <div className="flex gap-2 md:gap-6 flex-wrap justify-center">
          <Link href="/privacy" className="hover:text-[#F5C26B] transition-colors duration-300 tracking-tight whitespace-nowrap text-[10px] md:text-xs">
            Privacy
          </Link>

          <Link href="/terms" className="hover:text-[#F5C26B] transition-colors duration-300 tracking-tight whitespace-nowrap text-[10px] md:text-xs">
            Terms
          </Link>

          <Link href="/contact" className="hover:text-[#F5C26B] transition-colors duration-300 tracking-tight whitespace-nowrap text-[10px] md:text-xs">
            Contact
          </Link>
          
          <Link href="/about" className="hover:text-[#F5C26B] transition-colors duration-300 tracking-tight whitespace-nowrap text-[10px] md:text-xs">
            About
          </Link>
        </div>

        <Link href="/upcoming" className="flex items-center gap-1 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full border border-[#ec540e]/40 bg-[#ec540e]/5 hover:bg-[#ec540e]/10 transition-colors duration-300 group" title="Upcoming Features">
          <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-[#ec540e] animate-pulse"></span>
          <span className="text-[#ec540e] font-semibold tracking-tight text-[10px] md:text-xs whitespace-nowrap">Upcoming</span>
        </Link>
      </div>
    </footer>
  );
}
