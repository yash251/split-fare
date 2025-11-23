import { Hero } from "@/components/landing/hero";
import { Ticker } from "@/components/landing/ticker";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Ticker />
      <Features />
      <Ticker />
      <Footer />
    </main>
  );
}
