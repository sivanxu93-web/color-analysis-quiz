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

export type PaletteColor = {
  name: string;
  hex: string;
  usage: ColorUsage[];
};

export type AvoidColor = {
  name: string;
  hex: string;
  reason: string;
};

export type ColorLabReport = {
  meta: {
    version: string;
    locale: string;
    model: string;
    generated_at: string;
  };
  input_summary: {
    age_range?: string;
    gender_expression?: string;
    goals?: string[];
  };
  classification: {
    season: SeasonName;
    season_group: "Spring" | "Summer" | "Autumn" | "Winter";
    alt_season?: SeasonName | "";
    confidence: number;
    undertone: Undertone;
    contrast_level: ContrastLevel;
    value_level: ValueLevel;
    chroma_level: ChromaLevel;
    key_observations: string[];
  };
  headline_advice: {
    one_sentence: string;
    instant_wins: string[];
  };
  palette: {
    core_neutrals: PaletteColor[];
    everyday_colors: PaletteColor[];
    accent_colors: PaletteColor[];
    avoid_colors: AvoidColor[];
  };
  wardrobe_tips: {
    neutrals_usage: string[];
    tops_and_dresses: string[];
    patterns_and_contrast: string[];
    accessories: string[];
  };
  makeup_tips: {
    base: string[];
    blush: string[];
    lips: string[];
    eyes: string[];
    brows: string[];
  };
  hair_tips: {
    recommended: string[];
    avoid: string[];
  };
  theory_section: {
    short_explanation: string[];
    season_neighbors: {
      season: SeasonName;
      note: string;
    }[];
  };
  debug_info?: {
    warnings?: string[];
  };
};

