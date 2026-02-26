export const EXAMPLE_MAP: Record<string, string> = {
  "deep-winter-analysis": "26a4b77e-c1d7-4749-ac38-a468fcc44ab1",
  "true-winter-analysis": "341e64a2-15a5-4b03-9de6-4044d90d42fb",
  "cool-winter-analysis": "3ca5dde6-f815-41b9-aa01-ace3b29cc192",
  "soft-autumn-analysis": "0087af50-44e8-4535-882d-3ed4b3ee9834",
  "true-autumn-analysis": "124c62d7-f29c-413a-8392-0f91630ddac2",
  "deep-autumn-analysis": "790eeaf3-b327-46c3-a7f7-e9d512a125f0",
  "light-summer-analysis": "8efb12d2-be91-4ce5-a492-c6e1ecbb3814",
  "soft-summer-analysis": "cec2e247-27d1-432c-a058-d6c7db53f4fc",
  "true-summer-analysis": "c78b72ea-ccd3-4509-8822-4f71724f59fa",
  "warm-spring-analysis": "af413445-5804-4371-b375-2ed33632e86d",
  "light-spring-analysis": "af1a972b-93af-46e2-8cb4-25c3f779f8a7",
  "true-spring-analysis": "258766e5-e68b-40fb-ac9b-474a61a77f18",
};

export type ExampleItem = {
  slug: string;
  season: string;
  category: 'Spring' | 'Summer' | 'Autumn' | 'Winter';
  headline: string;
  imageUrl: string;
}

export const SEO_EXAMPLES: ExampleItem[] = [
  // These 4 will be displayed on the Home Page
  {
    slug: "warm-spring-analysis",
    season: "Warm Spring",
    category: 'Spring',
    headline: "Golden Hour Incarnate",
    imageUrl:
      "https://pub-6ecbfcbc11a346deadf5251217b00520.r2.dev/draping/af413445-5804-4371-b375-2ed33632e86d/best_a678c08c-cb69-4f82-8c13-03bab53c6d0c.png",
  },
  {
    slug: "soft-summer-analysis",
    season: "Soft Summer",
    category: 'Summer',
    headline: "The Ethereal Sophisticate",
    imageUrl:
      "https://pub-6ecbfcbc11a346deadf5251217b00520.r2.dev/draping/cec2e247-27d1-432c-a058-d6c7db53f4fc/best_bae38c0e-5dae-47ac-b00b-5fd6e3bdbe16.png",
  },
  {
    slug: "true-autumn-analysis",
    season: "True Autumn",
    category: 'Autumn',
    headline: "The Golden Hour Muse",
    imageUrl:
      "https://pub-6ecbfcbc11a346deadf5251217b00520.r2.dev/draping/124c62d7-f29c-413a-8392-0f91630ddac2/best_30e92e53-1e65-46cb-b0df-b80add03f5bf.png",
  },
  {
    slug: "cool-winter-analysis",
    season: "Cool Winter",
    category: 'Winter',
    headline: "The Crystal Cool Icon",
    imageUrl:
      "https://pub-6ecbfcbc11a346deadf5251217b00520.r2.dev/draping/3ca5dde6-f815-41b9-aa01-ace3b29cc192/best_8d366820-cfb7-4a48-94ef-ac5e5ab451cc.png",
  },
  
  // Remaining examples for the Examples Gallery
  {
    slug: "deep-winter-analysis",
    season: "Deep Winter",
    category: 'Winter',
    headline: "The Noir Romantic",
    imageUrl:
      "https://pub-6ecbfcbc11a346deadf5251217b00520.r2.dev/draping/26a4b77e-c1d7-4749-ac38-a468fcc44ab1/best_403eecb5-e8bd-43b3-a624-e4419c5594dd.png",
  },
  {
    slug: "true-winter-analysis",
    season: "True Winter",
    category: 'Winter',
    headline: "The Icy Royal",
    imageUrl:
      "https://pub-6ecbfcbc11a346deadf5251217b00520.r2.dev/draping/341e64a2-15a5-4b03-9de6-4044d90d42fb/best_e04d39d2-2fcf-4183-af09-3aeade20bb8c.png",
  },
  {
    slug: "soft-autumn-analysis",
    season: "Soft Autumn",
    category: 'Autumn',
    headline: "The Rustic Romantic",
    imageUrl:
      "https://pub-6ecbfcbc11a346deadf5251217b00520.r2.dev/draping/0087af50-44e8-4535-882d-3ed4b3ee9834/best_086df296-b114-46a6-b270-e28d7100d041.png",
  },
  {
    slug: "deep-autumn-analysis",
    season: "Deep Autumn",
    category: 'Autumn',
    headline: "The Midnight Sun",
    imageUrl:
      "https://pub-6ecbfcbc11a346deadf5251217b00520.r2.dev/draping/790eeaf3-b327-46c3-a7f7-e9d512a125f0/best_d18e5773-56f4-40e1-96aa-5dd6c0ee784a.png",
  },
  {
    slug: "light-summer-analysis",
    season: "Light Summer",
    category: 'Summer',
    headline: "The Crystalline Muse",
    imageUrl:
      "https://pub-6ecbfcbc11a346deadf5251217b00520.r2.dev/draping/8efb12d2-be91-4ce5-a492-c6e1ecbb3814/best_54abc66d-3163-471f-a284-b1cc07a6bf3a.png",
  },
  {
    slug: "true-summer-analysis",
    season: "True Summer",
    category: 'Summer',
    headline: "The Cool Romantic",
    imageUrl:
      "https://pub-6ecbfcbc11a346deadf5251217b00520.r2.dev/draping/c78b72ea-ccd3-4509-8822-4f71724f59fa/best_4ac19592-1ea5-47e8-a218-a00b116b2b9a.png",
  },
  {
    slug: "light-spring-analysis",
    season: "Light Spring",
    category: 'Spring',
    headline: "The Sun-Kissed Ethereal",
    imageUrl:
      "https://pub-6ecbfcbc11a346deadf5251217b00520.r2.dev/draping/af1a972b-93af-46e2-8cb4-25c3f779f8a7/best_3e98c3ae-d711-4c90-a557-c49cde2387a2.png",
  },
  {
    slug: "true-spring-analysis",
    season: "True Spring",
    category: 'Spring',
    headline: "The Golden Radiance",
    imageUrl:
      "https://pub-6ecbfcbc11a346deadf5251217b00520.r2.dev/draping/258766e5-e68b-40fb-ac9b-474a61a77f18/best_cdeead2f-3e99-4cbc-86dc-a4344f4e6a25.png",
  }
];
