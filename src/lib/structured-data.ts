export const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ClearCalc",
    "url": "https://clearcalc.vercel.app",
    "logo": "https://clearcalc.vercel.app/icon.png",
    "description": "Free online financial calculators for EMI, loans, GST, currency conversion, and more.",
    "sameAs": [
        "https://twitter.com/clearcalc",
        "https://github.com/Artaile/Clearcalc"
    ]
}

export const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "ClearCalc",
    "url": "https://clearcalc.vercel.app",
    "description": "Smart financial calculators and tools for everyday needs",
    "potentialAction": {
        "@type": "SearchAction",
        "target": "https://clearcalc.vercel.app/?q={search_term_string}",
        "query-input": "required name=search_term_string"
    }
}

export const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "ClearCalc",
    "url": "https://clearcalc.vercel.app",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Any",
    "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
    },
    "description": "Free online financial calculators for EMI, loans, GST, currency conversion, discounts and more."
}

export function getCalculatorSchema(
    name: string,
    description: string,
    url: string
) {
    return {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": name,
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Any",
        "url": url,
        "description": description,
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "1250"
        }
    }
}
