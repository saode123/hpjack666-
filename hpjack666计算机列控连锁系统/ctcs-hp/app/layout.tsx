import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '计算机联锁控制系统',
  description: 'Writed by hp'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
