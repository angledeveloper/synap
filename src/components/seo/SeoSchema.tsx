import React from "react";

type SeoSchemaProps = {
  schemas?: string[];
};

export default function SeoSchema({ schemas }: SeoSchemaProps) {
  if (!schemas || schemas.length === 0) return null;

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={`seo-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
          suppressHydrationWarning
        />
      ))}
    </>
  );
}
