import Link from "next/link";
import { alumniSansPinstripe } from "@/lib/font";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen p-4  dark:bg-primary">
      <div className="flex flex-col items-center justify-center flex-grow dark:text-white pb-16">
        <div
          className={`text-5xl md:text-8xl ${alumniSansPinstripe.className}`}
        >
          Simple Talk<span className="animate-blink pb-10">|</span>
        </div>
        <p
          className={`text-xl md:text-4xl font-extrabold ${alumniSansPinstripe.className} italic`}
        >
          simple web socket based chat service
        </p>
        <Link
          href="/login"
          className="relative font-bold inline-block cursor-pointer mt-2 md:mt-4 text-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-current after:absolute after:left-0 after:bottom-0 after:h-[1px] after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100 dark:text-white"
        >
          Get Started
        </Link>
      </div>
    </main>
  );
}
