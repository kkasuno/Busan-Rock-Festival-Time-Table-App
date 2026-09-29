import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "부산락페 MY TIMETABLE",
  description: "부산국제록페스티벌 공연을 고르고 나만의 타임테이블을 공유하세요.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
