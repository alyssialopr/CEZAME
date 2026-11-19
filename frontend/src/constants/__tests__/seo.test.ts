import fs from 'fs';
import path from 'path';
import { getSeoForPathname, getStructuredDataJsonLd, SEO_CONFIG } from '../seo';

describe('SEO & Metadata configuration', () => {
  it('définit les métadonnées principales de Cezame en français', () => {
    expect(SEO_CONFIG.siteName).toBe('Cezame');
    expect(SEO_CONFIG.lang).toBe('fr');
    expect(SEO_CONFIG.locale).toBe('fr_FR');
    expect(SEO_CONFIG.defaultTitle).toContain('Cezame');
    expect(SEO_CONFIG.description).toContain('démarches administratives');
    expect(SEO_CONFIG.logoPath).toBe('/logo.png');
    expect(SEO_CONFIG.faviconPath).toBe('/favicon.png');
  });

  it('retourne les métadonnées adaptées à chaque route', () => {
    expect(getSeoForPathname('/')).toEqual({
      title: SEO_CONFIG.defaultTitle,
      description: SEO_CONFIG.description,
    });

    const loginSeo = getSeoForPathname('/login');
    expect(loginSeo.title).toContain('Connexion');
    expect(loginSeo.noIndex).toBeUndefined();

    const profileSeo = getSeoForPathname('/profile');
    expect(profileSeo.title).toContain('Profil');
    expect(profileSeo.noIndex).toBe(true);

    const categorySeo = getSeoForPathname('/category/sante');
    expect(categorySeo.title).toContain('Parcours Thématique');

    const fallbackSeo = getSeoForPathname(undefined);
    expect(fallbackSeo.title).toBe(SEO_CONFIG.defaultTitle);
  });

  it('génère des données structurées JSON-LD Schema.org valides', () => {
    const raw = getStructuredDataJsonLd();
    const parsed = JSON.parse(raw);
    expect(parsed['@context']).toBe('https://schema.org');
    expect(parsed['@type']).toBe('EducationalApplication');
    expect(parsed.name).toBe('Cezame');
    expect(parsed.inLanguage).toBe('fr-FR');
  });

  it('fournit tous les fichiers statiques SEO et logos dans public/', () => {
    const publicDir = path.resolve(__dirname, '../../../public');
    expect(fs.existsSync(path.join(publicDir, 'index.html'))).toBe(true);
    expect(fs.existsSync(path.join(publicDir, 'manifest.json'))).toBe(true);
    expect(fs.existsSync(path.join(publicDir, 'robots.txt'))).toBe(true);
    expect(fs.existsSync(path.join(publicDir, 'sitemap.xml'))).toBe(true);
    expect(fs.existsSync(path.join(publicDir, 'logo.png'))).toBe(true);
    expect(fs.existsSync(path.join(publicDir, 'favicon.png'))).toBe(true);
    expect(fs.existsSync(path.join(publicDir, 'apple-touch-icon.png'))).toBe(true);
    expect(fs.existsSync(path.join(publicDir, 'og-image.png'))).toBe(true);
  });
});
