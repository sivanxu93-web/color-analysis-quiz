import { ColorLabReport } from "~/libs/colorLabTypes";

export const buildMockReport = (locale: string): ColorLabReport => {
  return {
    season: "Deep Winter",
    headline: "The Dark Romantic",
    description: "Your primary characteristic is Deep, and your secondary characteristic is Cool. You shine in colors that are dark, vivid, and cool-toned. Your high contrast features require equally high contrast outfits to look your best.",
    characteristics: {
      skin: "Cool Undertone",
      eyes: "High Contrast",
      hair: "Deep Tone"
    },
    palette: {
      power: {
        colors: [
          { hex: "#2E1A47", name: "Royal Purple" }, 
          { hex: "#0F4C3A", name: "Emerald" },
          { hex: "#8B0000", name: "Deep Red" }, 
          { hex: "#000000", name: "Black" }
        ],
        usage_advice: "Wear these near your face to make your eyes pop and skin look luminous."
      },
      neutrals: {
        colors: [
          { hex: "#333333", name: "Charcoal" }, 
          { hex: "#FFFFFF", name: "Pure White" }
        ],
        usage_advice: "These should form the foundation of your investment pieces like coats and suits."
      },
      pastels: {
        colors: [
          { hex: "#E6E6FA", name: "Icy Lavender" }, 
          { hex: "#F0FFFF", name: "Icy Blue" }
        ],
        usage_advice: "Use these for a softer look, ideal for summer weight fabrics or casual knits."
      }
    },
    makeup: {
      lips: [
        { hex: "#800020", name: "Burgundy", brand_hint: "Like MAC 'Diva'" },
        { hex: "#E0115F", name: "Ruby Red", brand_hint: "Like Ruby Woo" }
      ],
      blush: [
        { hex: "#D10056", name: "Deep Berry", brand_hint: "Like NARS 'Aria'" }
      ],
      eyes: [
        { hex: "#191970", name: "Midnight Blue", brand_hint: "Like Chanel 'Marine'" }
      ]
    },
    makeup_recommendations: {
      summary: "Opt for cool, deep shades. A bold red lip is your signature look.",
      lipstick_guide: [
        "Stick to cool-toned reds and plums.",
        "Avoid warm corals and peachy nudes."
      ],
      specific_products: [
        { category: "Lipstick", shade: "Ruby Woo", recommendation: "Perfect matte red for high contrast." },
        { category: "Blush", shade: "Deep Berry", recommendation: "Apply lightly to mimic a natural flush." }
      ]
    },
    fashion_guide: {
      work: "Sharp charcoal suits paired with pure white shirts and emerald ties.",
      casual: "Deep navy knit sweaters with high-quality dark denim.",
      special_event: "A stunning floor-length gown in Royal Purple or a classic Black tuxedo."
    },
    styling: {
      metals: ["Silver", "Platinum"],
      fabrics: ["Heavy Silk", "Velvet", "Crisp Cotton"],
      keywords: ["Dramatic", "Bold", "Sharp"],
      accessories: "Opt for high-shine silver metals and geometric shapes to complement your contrast."
    },
    worst_colors: [
      { hex: "#DAA520", name: "Goldenrod", reason: "Too warm and muted, makes your skin look sallow." },
      { hex: "#FF8C00", name: "Dark Orange", reason: "Clashes aggressively with your cool undertones." }
    ],
    hair_color_recommendations: [
      { color: "Jet Black", desc: "Enhances your natural high contrast features." },
      { color: "Cool Dark Brown", desc: "A softer alternative that still maintains depth." }
    ],
    virtual_draping_prompts: {
      best_color_prompt: "User wearing a high-quality Royal Purple silk top, natural lighting.",
      worst_color_prompt: "User wearing a Goldenrod cotton top, flat lighting.",
      best_makeup_prompt: "Sheer ruby red lip tint, minimalist cool-toned look.",
      worst_makeup_prompt: "Keep original makeup to show the unflattering effect of the color."
    },
    celebrities: ["Anne Hathaway", "Kendall Jenner", "Lucy Liu"]
  };
};