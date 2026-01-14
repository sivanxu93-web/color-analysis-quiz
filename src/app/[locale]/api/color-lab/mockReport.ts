import {ColorLabReport} from "~/libs/colorLabTypes";

export const buildMockReport = (locale: string): ColorLabReport => {
  const now = new Date().toISOString();
  return {
    meta: {
      version: "1.0",
      locale,
      model: "mock",
      generated_at: now,
    },
    input_summary: {
      age_range: "25-34",
      gender_expression: "feminine",
      goals: ["professional wardrobe", "special occasions"],
    },
    classification: {
      season: "Deep Winter",
      season_group: "Winter",
      alt_season: "Cool Winter",
      confidence: 0.86,
      undertone: "cool",
      contrast_level: "high",
      value_level: "deep",
      chroma_level: "high",
      key_observations: [
        "Dark hair and eyes with lighter skin create strong natural contrast.",
        "Skin and features lean cool rather than golden or peachy.",
      ],
    },
    headline_advice: {
      one_sentence:
        "You are a Deep Winter: high contrast, cool intensity, best in clear jewel tones and crisp neutrals.",
      instant_wins: [
        "Swap beige trench coats for deep navy or charcoal.",
        "Choose cool cherry or berry lipstick instead of warm coral.",
        "Pick bright white or cool off‑white near your face instead of creamy ivory.",
      ],
    },
    palette: {
      core_neutrals: [
        {
          name: "Ink Navy",
          hex: "#101827",
          usage: ["coats", "blazers", "trousers"],
        },
        {
          name: "Cool Charcoal",
          hex: "#3A3F4C",
          usage: ["suits", "knitwear"],
        },
        {
          name: "Soft Black",
          hex: "#111827",
          usage: ["tops", "dresses"],
        },
      ],
      everyday_colors: [
        {
          name: "Blueberry",
          hex: "#294C8F",
          usage: ["tops", "dresses"],
        },
        {
          name: "Deep Teal",
          hex: "#0F4C5C",
          usage: ["knitwear", "dresses"],
        },
        {
          name: "Plum",
          hex: "#5B2245",
          usage: ["tops", "accessories"],
        },
      ],
      accent_colors: [
        {
          name: "Ruby",
          hex: "#A0103A",
          usage: ["dresses", "lipstick", "accessories"],
        },
        {
          name: "Fuchsia",
          hex: "#C026D3",
          usage: ["tops", "accessories"],
        },
        {
          name: "Cobalt",
          hex: "#1D4ED8",
          usage: ["jackets", "dresses"],
        },
      ],
      avoid_colors: [
        {
          name: "Warm Camel",
          hex: "#C89A56",
          reason:
            "Too warm and muted; it can make your skin look sallow and tired.",
        },
        {
          name: "Dusty Peach",
          hex: "#E5A58A",
          reason:
            "Low contrast and warm undertone clash with your cool, high‑contrast coloring.",
        },
        {
          name: "Soft Olive",
          hex: "#A3A36A",
          reason:
            "Muted yellow‑green tones fight your clear, cool color direction.",
        },
      ],
    },
    wardrobe_tips: {
      neutrals_usage: [
        "Use ink navy and charcoal as your main base colors for jackets, trousers and outerwear.",
        "Reserve pure black for sharp, modern looks or evening wear rather than everyday basics.",
      ],
      tops_and_dresses: [
        "Choose cool, clear colors such as blue‑red, fuchsia, teal and deep emerald near your face.",
        "Avoid dusty, muted shades that sit between grey and beige.",
      ],
      patterns_and_contrast: [
        "High‑contrast patterns (e.g. black‑and‑white, navy‑and‑fuchsia) mirror your natural contrast.",
        "Small, busy prints in soft colors can look dull on you; choose bolder, cleaner patterns.",
      ],
      accessories: [
        "Silver, white gold and platinum jewelry harmonize best with your cool undertone.",
        "Choose statement accessories in your accent colors to bring focus to your face.",
      ],
    },
    makeup_tips: {
      base: [
        "Choose foundation with cool or neutral undertones; avoid formulas described as warm, golden or peachy.",
      ],
      blush: [
        "Cool pink, rose and raspberry blushes mimic your natural flush better than warm coral or apricot.",
      ],
      lips: [
        "Best shades: blue‑based reds, deep berry, wine and raspberry.",
        "Avoid: orange‑red, brick and peachy nudes which clash with your cool undertones.",
      ],
      eyes: [
        "Cool taupe, charcoal, navy and deep plum eyeshadows enhance your eye color.",
        "Avoid warm browns and golden olives which can make your eyes look dull.",
      ],
      brows: [
        "Keep brow color close to your natural hair (cool dark brown or soft black); avoid warm or reddish brow pens.",
      ],
    },
    hair_tips: {
      recommended: [
        "Cool dark brown, espresso or soft black with minimal red or golden tones.",
        "Subtle cool highlights (ash brown, blue‑black lowlights) can add dimension without warmth.",
      ],
      avoid: [
        "Warm caramel, honey blonde or copper highlights which fight your cool undertone.",
      ],
    },
    theory_section: {
      short_explanation: [
        "Deep Winters belong to the Winter family: cool undertones, clear colors and higher contrast.",
        "Within Winter, Deep means your hair and eyes are darker than your skin, which suits rich, deep colors.",
      ],
      season_neighbors: [
        {
          season: "Cool Winter",
          note: "If your contrast softens or your features appear slightly lighter, you may lean Cool Winter.",
        },
        {
          season: "Deep Autumn",
          note: "If your undertone appears warmer with more golden tones, Deep Autumn could be considered.",
        },
      ],
    },
    debug_info: {
      warnings: [
        "This is a mock report for UI development and does not reflect real analysis.",
      ],
    },
  };
};

