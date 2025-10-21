import { Alumni_Sans, Alumni_Sans_Pinstripe } from "next/font/google";

export const alumniSans = Alumni_Sans({
  weight: ["500", "400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  subsets: ["latin"],
});

export const alumniSansPinstripe = Alumni_Sans_Pinstripe({
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
  subsets: ["latin"],
});
