import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://zebridge.vercel.app'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/admin/',
          '/v1/',
          '/mcp',
          '/update-password',
          '/auth',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
