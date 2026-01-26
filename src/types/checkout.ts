export interface ReportData {
    id: number;
    title: string;
    subtitle: string;
    report_id: string;
    format: string;
    industry: string;
    pages: number;
    last_updated: string;
    image: string;
    report_reference_title?: string;
    base_year?: string;
    forecast_period?: string;
    publish_date?: string;
    toc?: string;
}

export interface LicenseOption {
    id: string;
    title: string;
    description: string;
    price: number | string;
    discount?: number;
    features: string[];
    highlight?: boolean;
    icon?: string;
    discountPercent?: string | number;
    buyButtonText?: string;
    buyButtonIcon?: string;
    disclaimer?: string;
    actualPrice?: string | number;
    currencySymbol?: string;
    disclaimerHeading?: string;
    mostPopularText?: string;
}
