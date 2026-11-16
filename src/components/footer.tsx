function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-fg-muted sm:flex-row sm:px-6 lg:px-8">
        <span className="font-mono font-semibold tracking-widest text-fg uppercase">
          AFUSTA-FINDORA
        </span>
        <p>© {new Date().getFullYear()} AFUSTA-FINDORA. Built for campus communities.</p>
      </div>
    </footer>
  );
}

export default Footer;
