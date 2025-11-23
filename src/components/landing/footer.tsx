import { Logo } from "@/components/branding/logo";

export function Footer() {
  return (
    <footer className="bg-black text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <Logo size="md" className="text-white mb-2" />
            <p className="text-sm mt-2">made with love by MVP Labs</p>
          </div>

          <div className="flex gap-8">
            <a
              href="#"
              className="hover:text-violet-400 transition-colors"
            >
              Support
            </a>
            <a
              href="#"
              className="hover:text-violet-400 transition-colors"
            >
              Docs
            </a>
            <a
              href="#"
              className="hover:text-violet-400 transition-colors"
            >
              Terms
            </a>
            <a
              href="#"
              className="hover:text-violet-400 transition-colors"
            >
              Jobs
            </a>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-400">
          <p>© 2025 SplitFare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
