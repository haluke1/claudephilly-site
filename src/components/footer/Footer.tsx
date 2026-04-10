export default function Footer() {
  return (
    <footer className="border-t border-glass-border py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="font-heading font-bold text-xl">
          Claude<span className="text-accent">Philly</span>
        </div>

        <div className="flex items-center gap-8 text-text-muted text-sm">
          <a
            href="#manifesto"
            className="cursor-pointer transition-colors duration-200 hover:text-text"
          >
            Manifesto
          </a>
          <a
            href="#waitlist"
            className="cursor-pointer transition-colors duration-200 hover:text-text"
          >
            Join
          </a>
        </div>

        <p className="text-text-muted text-sm">
          &copy; {new Date().getFullYear()} ClaudePhilly. Built by builders, for
          builders.
        </p>
      </div>
    </footer>
  );
}
