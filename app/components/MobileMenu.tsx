interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const links = [
  ["Services", "#services"],
  ["Process", "#process"],
  ["About", "#about"],
  ["Contact", "#contact"],
] as const;

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/80" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 h-full w-72 bg-neutral-950 p-6 shadow-xl">
        <button onClick={onClose} className="absolute right-4 top-4 text-2xl text-white" aria-label="Close menu">
          &times;
        </button>
        <div className="mt-10 flex flex-col gap-5">
          {links.map(([label, href]) => (
            <a key={label} href={href} onClick={onClose} className="text-sm font-bold uppercase tracking-wider text-neutral-400 hover:text-amber-500">
              {label}
            </a>
          ))}
          <a href="#contact" onClick={onClose} className="mt-2 rounded-sm bg-red-600 px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-white hover:bg-red-500">
            Request Consultation
          </a>
        </div>
      </aside>
    </>
  );
}
