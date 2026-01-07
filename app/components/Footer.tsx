import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full glass border-t border-[#F5C26B]/10 sticky bottom-0 z-40 backdrop-blur-2xl">
      <div className="md:hidden h-10 px-3 flex items-center justify-center">
        <Link href="/feed" className="text-transparent bg-linear-to-r from-[#F5C26B] to-[#FFD56A] bg-clip-text font-extrabold tracking-wide text-xs">
          EMESIS
        </Link>
      </div>

      <div className="hidden md:flex max-w-6xl mx-auto items-center justify-between text-zinc-600 text-xs font-medium gap-4 py-2 px-6">
        <p className="text-transparent bg-linear-to-r from-[#F5C26B] to-[#FFD56A] bg-clip-text font-bold tracking-wide text-xs">
          EMESIS © {new Date().getFullYear()}
        </p>

        <div className="flex gap-6 flex-wrap justify-center">
          <Link href="/privacy" className="hover:text-[#F5C26B] transition-colors duration-300 tracking-tight whitespace-nowrap">
            Privacy
          </Link>

          <Link href="/terms" className="hover:text-[#F5C26B] transition-colors duration-300 tracking-tight whitespace-nowrap">
            Terms
          </Link>
          
          <Link href="/contact" className="hover:text-[#F5C26B] transition-colors duration-300 tracking-tight whitespace-nowrap">
            Contact
          </Link>
          
          <Link href="/about" className="hover:text-[#F5C26B] transition-colors duration-300 tracking-tight whitespace-nowrap">
            About
          </Link>
        </div>

        <Link href="/upcoming" className="flex items-center gap-2 px-2 py-1 rounded-full border border-[#ec540e]/40 bg-[#ec540e]/5 hover:bg-[#ec540e]/10 transition-colors duration-300 group" title="Upcoming Features">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ec540e] animate-pulse"></span>
          <span className="text-[#ec540e] font-semibold tracking-tight whitespace-nowrap">Upcoming</span>
        </Link>
      </div>
    </footer>
  );
}
