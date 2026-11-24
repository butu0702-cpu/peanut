import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = {title:'田邊好日｜雲林花生小農',description:'濁水溪畔日曬熟成，產地直送的台灣花生好味道。'};
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="zh-Hant"><body>{children}</body></html>; }
