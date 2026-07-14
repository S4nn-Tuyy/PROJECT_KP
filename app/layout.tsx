import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default:  'Telkom Monitoring – Sulbagsel',
    template: '%s | Telkom Monitoring',
  },
  description:
    'Sistem Informasi Monitoring Kinerja Pelayanan Pelanggan Enterprise PT Telkom Indonesia Wilayah Sulbagsel',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
