import ThemeToggle from "./ThemeToggle";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const links = [
  ["Services", "#services", "hover:text-rd-red"],
  ["Process", "#process", "hover:text-rd-amber"],
  ["About", "#about", "hover:text-rd-green"],
  ["Contact", "#contact", "hover:text-rd-blue"],
] as const;

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 h-dvh w-[min(22rem,88vw)] overflow-y-auto border-l border-border bg-surface p-6 shadow-xl">
        <div className="absolute inset-y-0 left-0 w-1 bg-rainbow" />
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted">Menu</span>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={onClose}
              className="text-2xl text-foreground"
              aria-label="Close menu"
            >
              &times;
            </button>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-5">
          {links.map(([label, href, hoverClass]) => (
            <a
              key={label}
              href={href}
              onClick={onClose}
              className={`text-sm font-bold uppercase tracking-wider text-muted-strong transition-colors ${hoverClass}`}
            >
              {label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={onClose}
            className="mt-2 rounded-sm bg-rd-red px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-white hover:bg-rd-pink"
          >
            Request Consultation
          </a>
        </div>
      </aside>
    </>
  );
}
