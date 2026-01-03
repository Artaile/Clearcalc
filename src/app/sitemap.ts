import { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://clearcalc.vercel.app'

    const calculators = [
        'emi',
        'loan',
        'gst',
        'discount',
        'currency',
        'banking',
        'cash',
        'units',
        'words',
        'eligibility',
        'compare-loans',
        'profiles',
        'profit'
    ]

    const calculatorPages = calculators.map((calc) => ({
        url: `${baseUrl}/${calc}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...calculatorPages,
    ]
}
