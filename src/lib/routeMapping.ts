export const routeMapping: Record<string, string> = {
    'market-reports': '/reports',
    'custom-research': '/contact',
    'forecast-models': '/reports',
    'industries-we-serve': '/#home_section4_reports',
    'insights-blog': '/',
    'case-studies': '/#casestudiessection',
    'faqs': '/',
    'download-samples': '/',
    'about-us': '/about',
    'careers': '/',
    'contact-us': '/contact',
    'privacy-policy': '/privacy',
    'terms-of-use': '/terms-of-service',
    'cookie-policy': '/privacy',
    'sitemap': '/',
};

export const getRouteFromSlug = (slug: string): string => {
    return routeMapping[slug] || '/';
};
