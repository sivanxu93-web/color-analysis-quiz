export type SeasonName =
  | "Light Spring"
  | "True Spring"
  | "Bright Spring"
  | "Light Summer"
  | "True Summer"
  | "Soft Summer"
  | "Soft Autumn"
  | "True Autumn"
  | "Deep Autumn"
  | "Deep Winter"
  | "True Winter"
  | "Cool Winter";

export type Undertone = "cool" | "warm" | "neutral";
export type ContrastLevel = "low" | "medium" | "high";
export type ValueLevel = "light" | "medium" | "deep";
export type ChromaLevel = "low" | "medium" | "high";

export type ColorUsage =
  | "coats"
  | "jackets"
  | "suits"
  | "blazers"
  | "trousers"
  | "knitwear"
  | "tops"
  | "dresses"
  | "accessories"
  | "lipstick"
  | "makeup";

export type PaletteGroup = {
  colors: { hex: string; name: string }[];
  usage_advice: string;
};

export type ColorLabReport = {
  season: SeasonName;
  headline: string;
  description: string;
  characteristics: {
    skin: string;
    eyes: string;
    hair: string;
  };
  palette: {
    neutrals: PaletteGroup;
    power: PaletteGroup;
    pastels: PaletteGroup;
  };
  makeup: {
    lips: { hex: string; name: string; brand_hint: string }[];
    blush: { hex: string; name: string; brand_hint: string }[];
    eyes: { hex: string; name: string; brand_hint: string }[];
  };
  makeup_recommendations: {
    summary: string;
    lipstick_guide: string[];
    specific_products: { category: string; shade: string; recommendation: string }[];
  };
  hair_color_recommendations: { color: string; desc: string }[];
  fashion_guide: {
    work: string;
    casual: string;
    special_event: string;
  };
  styling: {
    metals: string[];
    fabrics: string[];
    keywords: string[];
    accessories: string;
  };
  worst_colors: { hex: string; name: string; reason: string }[];
  virtual_draping_prompts: {
    best_color_prompt: string;
    worst_color_prompt: string;
    best_makeup_prompt: string;
    worst_makeup_prompt: string;
  };
  celebrities: string[];
};


