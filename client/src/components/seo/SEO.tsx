import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  keywords?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schemaMarkup?: Record<string, any>;
}

const SEO = ({ title, description, canonicalUrl, ogImage, keywords, schemaMarkup }: SEOProps) => {
  const siteUrl = "https://www.judicialstudycentre.com"; // Change to production domain
  const fullCanonicalUrl = canonicalUrl ? `${siteUrl}${canonicalUrl}` : siteUrl;
  const imageUrl = ogImage || `${siteUrl}/default-og-image.jpg`;

  const defaultKeywords = "PCS J Coaching, APO Coaching, Judiciary Coaching Prayagraj, Judicial Coaching Institute, Law Entrance Coaching";
  
  return (
    <Helmet>
      {/* Basic HTML Meta Tags */}
      <title>{title} | Judicial Study Centre</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords} />
      <link rel="canonical" href={fullCanonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullCanonicalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={imageUrl} />

      {/* Structured Schema (JSON-LD) */}
      {schemaMarkup && (
        <script type="application/ld+json">
          {JSON.stringify(schemaMarkup)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
