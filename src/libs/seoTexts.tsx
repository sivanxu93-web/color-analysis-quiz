import React from 'react';

export const getSeoText = (slug: string) => {
  const data: Record<string, { title: string, characteristics: string, colors: string[], avoid: string, celebs: string, sibling: string, siblingDiff: string }> = {
    "soft-autumn-analysis": {
      title: "Soft Autumn",
      characteristics: "Soft Autumn sits at the intersection of warm and muted. Unlike True Autumn (which runs rich and golden) or Soft Summer (which is cool and dusty), Soft Autumn occupies a uniquely earthy, low-contrast space. Your coloring is gentle, blended, and desaturated with a warm undertone.",
      colors: ["Terracotta (#E2725B) — your power neutral", "Muted Moss Green (#8A9A5B) — enhances your eye color", "Mustard Gold (#C5994B) — warms without overwhelming", "Dusty Rose (#C4A09A) — the only pink that works", "Camel (#C19A6B) — your perfect base"],
      avoid: "Avoid stark black, pure white, and highly saturated neons (like hot pink or electric blue), which will overpower your delicate coloring and make you look washed out.",
      celebs: "Drew Barrymore, Gigi Hadid, and Elizabeth Olsen",
      sibling: "Soft Summer",
      siblingDiff: "While both are muted, Soft Autumn is distinctly warmer with golden undertones, whereas Soft Summer leans cool and grayish."
    },
    "true-winter-analysis": {
      title: "True Winter",
      characteristics: "True Winter is the epitome of high contrast and cool undertones. Your features are sharp, striking, and icy. There is absolutely no warmth or golden hue in your natural coloring.",
      colors: ["Pure Black (#000000) — your ultimate power color", "Optic White (#FFFFFF) — for maximum crisp contrast", "Royal Blue (#4169E1) — bright and regal", "Ruby Red (#E0115F) — a cool, blue-based red", "Emerald Green (#50C878) — jewel-toned perfection"],
      avoid: "Avoid warm, earthy colors like mustard, rust, or camel. These will clash with your cool undertones and make you appear sallow.",
      celebs: "Megan Fox, Katy Perry, and Lauren Graham",
      sibling: "True Summer",
      siblingDiff: "Both are entirely cool, but True Winter requires high contrast and deep, saturated colors, while True Summer needs soft, muted, and blended tones."
    },
    "warm-spring-analysis": {
      title: "Warm Spring",
      characteristics: "Warm Spring (or True Spring) is bright, warm, and radiant. Your coloring has a clear golden, peachy, or honey undertone with zero coolness. You glow in colors that resemble a tropical island or a spring garden.",
      colors: ["Warm Coral (#FF7F50) — bright and energetic", "Golden Yellow (#FFDF00) — like liquid sunshine", "Kelly Green (#4CBB17) — fresh and lively", "Peach (#FFE5B4) — your perfect pastel", "Turquoise (#40E0D0) — a bright, warm blue"],
      avoid: "Avoid muted, dusty colors like mauve or taupe, as well as extremely cool tones like icy blue, which will drain your natural vibrancy.",
      celebs: "Nicole Kidman, Jessica Chastain, and Cameron Diaz",
      sibling: "True Autumn",
      siblingDiff: "Both are fully warm, but Warm Spring is clear, bright, and fresh, whereas True Autumn is muted, rich, and earthy."
    },
    "deep-winter-analysis": {
      title: "Deep Winter",
      characteristics: "Deep Winter blends the high contrast of Winter with the darkness of Autumn. You have a deep, rich coloring with an underlying coolness. Your features are strong, dark, and slightly neutral-cool.",
      colors: ["Burgundy (#800020) — deep and luxurious", "Charcoal Grey (#36454F) — your best dark neutral next to black", "Pine Green (#01796F) — dark and cool", "Navy Blue (#000080) — sophisticated and sharp", "Plum (#8E4585) — rich and vibrant"],
      avoid: "Avoid light, warm pastels and earthy, muted tones like golden brown or pale peach, which will look disconnected from your depth.",
      celebs: "Anne Hathaway, Monica Bellucci, and Viola Davis",
      sibling: "Deep Autumn",
      siblingDiff: "Both share a deep value, but Deep Winter leans cool and requires crisp contrast, while Deep Autumn is warm, rich, and slightly more blended."
    },
    "soft-summer-analysis": {
      title: "Soft Summer",
      characteristics: "Soft Summer is cool, muted, and beautifully blended. Your coloring has a grayish or dusty quality that makes highly saturated colors look harsh on you. You shine in elegant, understated tones.",
      colors: ["Dusty Mauve (#E0B0FF) — soft and romantic", "Slate Blue (#708090) — your power neutral", "Rose Brown (#BC8F8F) — a complex, cool brown", "Sage Green (#9DC183) — muted and fresh", "Soft Lavender (#E6E6FA) — delicate and icy"],
      avoid: "Avoid intense, warm colors like bright orange or fiery red, and stay away from stark black, which will overpower your softness.",
      celebs: "Bella Hadid, Dakota Johnson, and Sarah Jessica Parker",
      sibling: "Soft Autumn",
      siblingDiff: "Both are muted, but Soft Summer has cool, grayish-blue undertones, whereas Soft Autumn has warm, golden-brown undertones."
    },
    "light-summer-analysis": {
      title: "Light Summer",
      characteristics: "Light Summer is cool, light, and delicate. Your coloring is very low in pigmentation, giving you an ethereal, pastel-like appearance. You look best in colors that are bright but soft.",
      colors: ["Powder Pink (#FFB6C1) — sweet and lifting", "Sky Blue (#87CEEB) — clear and cool", "Mint Green (#98FF98) — refreshing", "Light Lavender (#E6E6FA) — soft and elegant", "Soft White (#F5F5F5) — your best light neutral"],
      avoid: "Avoid dark, heavy colors like black or dark brown, and very warm, saturated colors like burnt orange.",
      celebs: "Reese Witherspoon, Margot Robbie, and Cate Blanchett",
      sibling: "Light Spring",
      siblingDiff: "Both are light, but Light Summer is cool and pink-based, while Light Spring is warm and peach-based."
    },
    "cool-winter-analysis": {
      title: "Cool Winter",
      characteristics: "Cool Winter (or True Winter) is intensely cool and highly contrasting. You have vivid, icy features with zero warm undertones. You are the classic 'Snow White' coloring.",
      colors: ["Fuchsia (#FF00FF) — bold and cool", "Sapphire Blue (#0F52BA) — brilliant and deep", "Pure White (#FFFFFF) — stark and crisp", "Icy Lemon (#FDFF00) — a cool, sharp yellow", "True Red (#FF0000) — classic and powerful"],
      avoid: "Avoid anything golden, yellow-based, or muted. Earth tones and warm pastels will instantly make you look tired.",
      celebs: "Zooey Deschanel, Lily Collins, and Krysten Ritter",
      sibling: "Cool Summer",
      siblingDiff: "Cool Winter handles high contrast and bright, jewel-like intensity, whereas Cool Summer requires soft, muted, and blended cool colors."
    },
    "true-autumn-analysis": {
      title: "True Autumn",
      characteristics: "True Autumn is completely warm, rich, and earthy. You have a distinct golden or copper glow. Your colors are the colors of a vibrant autumn forest.",
      colors: ["Rust (#B7410E) — warm and spicy", "Forest Green (#228B22) — deep and natural", "Copper (#B87333) — metallic and rich", "Mustard Yellow (#FFDB58) — golden and warm", "Chocolate Brown (#7B3F00) — your power neutral"],
      avoid: "Avoid entirely cool colors like icy blue, magenta, or stark black and white. These will drain the golden warmth from your skin.",
      celebs: "Julianne Moore, Shailene Woodley, and Debra Messing",
      sibling: "True Spring",
      siblingDiff: "Both are completely warm, but True Autumn is deep, muted, and rich, whereas True Spring is light, bright, and clear."
    },
    "deep-autumn-analysis": {
      title: "Deep Autumn",
      characteristics: "Deep Autumn is dark, warm, and highly contrasted. Your coloring is rich and intense, allowing you to wear heavy, dark colors without looking overwhelmed.",
      colors: ["Espresso (#4B3621) — your ultimate dark neutral", "Aubergine (#472C4C) — deep and mysterious", "Tomato Red (#FF6347) — warm and fiery", "Olive Green (#808000) — rich and earthy", "Dark Teal (#013220) — a complex warm blue/green"],
      avoid: "Avoid pale, cool pastels like baby blue or icy pink, which will look completely disconnected from your rich coloring.",
      celebs: "Natalie Portman, Jessica Alba, and Zendaya",
      sibling: "Deep Winter",
      siblingDiff: "Both are dark and high contrast, but Deep Autumn has an underlying golden warmth, while Deep Winter has a cool, bluish-black depth."
    },
    "light-spring-analysis": {
      title: "Light Spring",
      characteristics: "Light Spring is warm, light, and delicate. Your features are very low in contrast, giving you a peachy, golden, and ethereal appearance. You look beautiful in warm pastels.",
      colors: ["Peach (#FFE5B4) — soft and glowing", "Warm Aqua (#00FFFF) — light and fresh", "Butter Yellow (#FAFAD2) — sunny and soft", "Light Camel (#C19A6B) — your best light neutral", "Coral Pink (#F88379) — vibrant but light"],
      avoid: "Avoid dark, heavy colors like black and burgundy, as well as very cool, icy tones that will wash out your delicate warmth.",
      celebs: "Taylor Swift, Amanda Seyfried, and Blake Lively",
      sibling: "Light Summer",
      siblingDiff: "Both are light, but Light Spring requires peachy, golden undertones, whereas Light Summer needs cool, pinkish-blue undertones."
    },
    "true-spring-analysis": {
      title: "True Spring",
      characteristics: "True Spring is entirely warm, bright, and clear. Your coloring has a radiant, golden glow with no cool or muted influences. You look amazing in highly saturated, warm colors.",
      colors: ["Bright Coral (#FF7F50) — energetic and warm", "Turquoise (#40E0D0) — tropical and clear", "Sunshine Yellow (#FFEB00) — pure and bright", "Kelly Green (#4CBB17) — fresh and lively", "Warm Beige (#F5F5DC) — your perfect light neutral"],
      avoid: "Avoid muted, dusty colors and entirely cool tones like icy blue or fuchsia, which will dull your natural brightness.",
      celebs: "Amy Adams, Emma Stone, and Nicole Kidman",
      sibling: "True Autumn",
      siblingDiff: "Both are warm, but True Spring is bright, clear, and high-chroma, whereas True Autumn is rich, muted, and earthy."
    },
    "true-summer-analysis": {
      title: "True Summer",
      characteristics: "True Summer is completely cool, soft, and blended. Your coloring has a distinctive pink or grayish undertone with no warmth. You excel in elegant, cool, and slightly muted shades.",
      colors: ["Dusty Rose (#C4A09A) — romantic and cool", "Slate Blue (#708090) — a fantastic cool neutral", "Soft Navy (#000080) — your best dark neutral", "Mauve (#E0B0FF) — complex and elegant", "Seafoam Green (#2E8B57) — cool and refreshing"],
      avoid: "Avoid entirely warm, golden, or orange-based colors like rust or mustard. Also, avoid stark black and white, which are too harsh for your softness.",
      celebs: "Emily Blunt, Olivia Wilde, and Barbara Palvin",
      sibling: "True Winter",
      siblingDiff: "Both are fully cool, but True Summer is soft and blended, requiring muted colors, whereas True Winter is sharp and contrasted, requiring pure, intense colors."
    }
  };

  const item = data[slug];
  if (!item) return null;

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h2>What Is {item.title}? A Complete Guide to This Season</h2>
        <h3>Key Characteristics of {item.title}</h3>
        <p>{item.characteristics}</p>
      </div>

      <div className="space-y-4">
        <h3>The Complete {item.title} Color Palette</h3>
        <p><strong>Best Colors for {item.title}:</strong></p>
        <ul>
          {item.colors.map((c, i) => <li key={i}>{c}</li>)}
        </ul>
        <p><strong>Colors to Avoid:</strong></p>
        <p>{item.avoid}</p>
      </div>

      <div className="space-y-4">
        <h3>{item.title} Celebrities</h3>
        <p>Famous faces who share your seasonal color palette include {item.celebs}. Notice how they glow when styled in their correct colors.</p>
      </div>

      <div className="space-y-4">
        <h3>{item.title} vs. {item.sibling}</h3>
        <p>{item.siblingDiff}</p>
      </div>

      <div className="space-y-4">
        <h3>{item.title} Makeup & Wardrobe Guide</h3>
        <p>When building a wardrobe or choosing makeup as a {item.title}, consistency is key. Ensure your foundation perfectly matches your undertone, and use your recommended power neutrals (rather than defaulting to black) as the base of your capsule wardrobe. For lips and cheeks, stick to the hues in your best colors list to maintain chromatic harmony.</p>
      </div>

      <div className="mt-8 p-6 bg-[#FAF9F6] border border-gray-200 rounded-2xl">
        <h3 className="text-xl font-bold mb-4">Take the Quiz to Confirm Your Season</h3>
        <p className="mb-4">Not entirely sure if you are a {item.title}? The human eye is easily tricked by lighting. Use our AI Color Analysis tool to get a mathematically precise breakdown of your skin, hair, and eye contrast.</p>
        <a href="/quiz" className="inline-block px-8 py-3 bg-[#1A1A2E] text-white font-bold rounded-full text-sm uppercase tracking-widest">Start Free AI Scan</a>
      </div>
    </div>
  );
};
