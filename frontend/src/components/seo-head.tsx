import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import Head from 'expo-router/head';
import { usePathname } from 'expo-router';
import { getSeoForPathname, SEO_CONFIG } from '@/constants/seo';

interface SeoHeadProps {
  title?: string;
  description?: string;
  noIndex?: boolean;
}

export function SeoHead({ title, description, noIndex }: SeoHeadProps) {
  const pathname = usePathname();
  const routeSeo = getSeoForPathname(pathname);

  const resolvedTitle = title || routeSeo.title || SEO_CONFIG.defaultTitle;
  const resolvedDescription = description || routeSeo.description || SEO_CONFIG.description;
  const resolvedNoIndex = noIndex ?? routeSeo.noIndex ?? false;
  const canonicalUrl = `${SEO_CONFIG.siteUrl}${pathname === '/' ? '' : pathname || ''}`;

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = resolvedTitle;
    }
  }, [resolvedTitle]);

  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <Head>
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDescription} />
      <meta name="keywords" content={SEO_CONFIG.keywords} />
      <meta name="robots" content={resolvedNoIndex ? 'noindex, nofollow' : 'index, follow'} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SEO_CONFIG.siteName} />
      <meta property="og:locale" content={SEO_CONFIG.locale} />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={SEO_CONFIG.ogImagePath} />
      <meta
        property="og:image:alt"
        content="Logo Cezame — Maîtrise tes démarches et ta vie d'adulte"
      />

      {/* Twitter / X */}
      <meta name="twitter:card" content={SEO_CONFIG.twitterCard} />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={SEO_CONFIG.ogImagePath} />
    </Head>
  );
}
