import Link from "next/link";
import Countdown from "@/components/Countdown";
import Star from "@/components/Star";

export default function Home() {
  return (
    <main className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden bg-pine px-5 py-16 text-white">
      <div className="pattern absolute inset-0 -z-10" aria-hidden="true" />
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_38%,rgba(200,162,74,0.20),transparent)]"
        aria-hidden="true"
      />

      <section className="reveal flex flex-col items-center text-center">
        <Star className="h-16 w-16 text-gold sm:h-20 sm:w-20" />

        <p className="mt-6 text-base text-gold-300 sm:text-lg">বিসমিল্লাহির রাহমানির রাহিম</p>
        <p className="mt-8 text-lg text-white/85 sm:text-xl">সুন্নাতে খাতনা অনুষ্ঠান</p>

        <h1 className="mt-3 font-display text-6xl font-bold leading-[1.3] text-gold-300 sm:text-7xl md:text-8xl">
          সাইম ও ফাইম
        </h1>

        <div className="my-8 flex items-center gap-4" aria-hidden="true">
          <span className="h-px w-16 bg-gold/50 sm:w-28" />
          <span className="size-2 rotate-45 bg-gold" />
          <span className="h-px w-16 bg-gold/50 sm:w-28" />
        </div>

        <p className="font-display text-2xl sm:text-3xl">শুক্রবার, ২৫ সেপ্টেম্বর ২০২৬</p>
        <p className="mt-2 text-white/70">সবার দোয়া ও উপস্থিতি কাম্য</p>

        <div className="mt-10">
          <Countdown />
        </div>

        <Link href="/login" className="btn-gold mt-12 px-8">
          এডমিন লগইন
        </Link>
      </section>
    </main>
  );
}
