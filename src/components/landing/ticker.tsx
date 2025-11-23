"use client";

export function Ticker() {
  const items = [
    "SPLIT BILLS",
    "TRACK EXPENSES",
    "CROSS-CHAIN",
    "INSTANT SETTLE",
    "ENS IDENTITY",
    "USDC",
    "ZERO FEES",
    "SELF-CUSTODY",
    "NO BANKS",
    "CRYPTO NATIVE",
  ];

  return (
    <div className="bg-yellow-500 border-y-4 border-black py-4 overflow-hidden">
      <div className="flex animate-scroll">
        {/* Repeat items 3 times for seamless loop */}
        {[...Array(3)].map((_, setIndex) => (
          <div key={setIndex} className="flex shrink-0">
            {items.map((item, index) => (
              <div key={`${setIndex}-${index}`} className="flex items-center shrink-0 px-8">
                <span className="text-2xl md:text-3xl font-bold text-black whitespace-nowrap">
                  {item}
                </span>
                <span className="text-3xl ml-8">🧾</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Add CSS animation */}
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
