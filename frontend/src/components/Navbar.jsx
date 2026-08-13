import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/components/Logo";

export function Navbar() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6"
    >
      <div className="mx-auto mt-4 flex max-w-7xl items-center justify-between rounded-2xl glass px-5 py-3 border border-border/40">
        <Logo />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition cursor-pointer">
            Features
          </a>
          <a href="#tools" className="hover:text-foreground transition cursor-pointer">
            Tools
          </a>
          <a href="#pricing" className="hover:text-foreground transition cursor-pointer">
            Pricing
          </a>
          <Link to="/contact" className="hover:text-foreground transition cursor-pointer">
            Contact
          </Link>
        </nav>

        {/* Desktop & Mobile Actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <Link
              to="/dashboard"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition cursor-pointer flex items-center justify-center min-h-[40px]"
            >
              Open Workspace
            </Link>
          ) : (
            <>
              <Link
                to="/auth"
                className="hidden sm:inline-block text-sm text-muted-foreground hover:text-foreground px-3 py-2 cursor-pointer"
              >
                Sign in
              </Link>
              <Link
                to="/auth"
                className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition cursor-pointer flex items-center justify-center min-h-[40px]"
              >
                Get started
              </Link>
            </>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden mt-2 mx-auto max-w-7xl glass-strong rounded-2xl p-5 border border-border/50 shadow-2xl flex flex-col space-y-4 max-h-[85vh] overflow-y-auto"
          >
            <nav className="flex flex-col space-y-3 text-sm">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-white/[0.04] text-muted-foreground hover:text-foreground transition cursor-pointer min-h-[44px] flex items-center"
              >
                Features
              </a>
              <a
                href="#tools"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-white/[0.04] text-muted-foreground hover:text-foreground transition cursor-pointer min-h-[44px] flex items-center"
              >
                Tools
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-white/[0.04] text-muted-foreground hover:text-foreground transition cursor-pointer min-h-[44px] flex items-center"
              >
                Pricing
              </a>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-white/[0.04] text-muted-foreground hover:text-foreground transition cursor-pointer min-h-[44px] flex items-center"
              >
                Contact
              </Link>
            </nav>
            {!user && (
              <div className="pt-2 border-t border-border/40 flex flex-col gap-2">
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground min-h-[44px] flex items-center justify-center cursor-pointer"
                >
                  Get started
                </Link>
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm text-muted-foreground rounded-xl border border-border/40 min-h-[44px] flex items-center justify-center cursor-pointer"
                >
                  Sign in
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
