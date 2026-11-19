import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';
import { getStructuredDataJsonLd, SEO_CONFIG } from '@/constants/seo';

export default function Root({ children }: PropsWithChildren) {
  const jsonLd = getStructuredDataJsonLd();

  return (
    <html lang={SEO_CONFIG.lang}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        {/* Titre & Métadonnées SEO principales */}
        <title>{SEO_CONFIG.defaultTitle}</title>
        <meta name="description" content={SEO_CONFIG.description} />
        <meta name="keywords" content={SEO_CONFIG.keywords} />
        <meta name="author" content={SEO_CONFIG.siteName} />
        <meta name="application-name" content={SEO_CONFIG.siteName} />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content={SEO_CONFIG.themeColor} />
        <meta name="format-detection" content="telephone=no" />

        {/* PWA & Mobile Web App */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={SEO_CONFIG.siteName} />
        <link rel="manifest" href="/manifest.json" />

        {/* Icônes & Favicons */}
        <link rel="icon" type="image/png" href={SEO_CONFIG.faviconPath} />
        <link rel="shortcut icon" type="image/png" href={SEO_CONFIG.faviconPath} />
        <link rel="apple-touch-icon" href={SEO_CONFIG.appleTouchIconPath} />

        {/* Open Graph / Facebook / LinkedIn / Discord / WhatsApp */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SEO_CONFIG.siteName} />
        <meta property="og:locale" content={SEO_CONFIG.locale} />
        <meta property="og:title" content={SEO_CONFIG.defaultTitle} />
        <meta property="og:description" content={SEO_CONFIG.description} />
        <meta property="og:url" content={SEO_CONFIG.siteUrl} />
        <meta property="og:image" content={SEO_CONFIG.ogImagePath} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1024" />
        <meta property="og:image:height" content="1024" />
        <meta
          property="og:image:alt"
          content="Logo Cezame — Maîtrise tes démarches et ta vie d'adulte"
        />

        {/* Twitter / X Cards */}
        <meta name="twitter:card" content={SEO_CONFIG.twitterCard} />
        <meta name="twitter:title" content={SEO_CONFIG.defaultTitle} />
        <meta name="twitter:description" content={SEO_CONFIG.description} />
        <meta name="twitter:image" content={SEO_CONFIG.ogImagePath} />
        <meta
          name="twitter:image:alt"
          content="Logo Cezame — Maîtrise tes démarches et ta vie d'adulte"
        />

        {/* Données structurées Schema.org (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
