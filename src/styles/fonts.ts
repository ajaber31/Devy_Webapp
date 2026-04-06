import { Inter, Lora } from 'next/font/google'

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600'],
})

export const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700'],
})
