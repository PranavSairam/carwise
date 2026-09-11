import { DISCLAIMER_TEXT } from "@/lib/defaults";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="text-lg font-semibold tracking-tight">
          Car<span className="text-accent">Wise</span>
        </p>
        <p className="mt-3 max-w-2xl text-xs leading-relaxed text-muted-foreground">
          {DISCLAIMER_TEXT}
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} CarWise. Educational use only.
        </p>
      </div>
    </footer>
  );
}
