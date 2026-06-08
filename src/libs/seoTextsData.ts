export interface SeoSeasonData {
  title: string;
  hue: "Warm" | "Cool" | "Neutral-Warm" | "Neutral-Cool";
  value: "Light" | "Medium" | "Dark" | "High Contrast" | "Low Contrast";
  chroma: "Clear/Bright" | "Muted/Soft" | "Balanced";
  characteristics: string;
  colors: string[];
  avoid: string;
  celebs: string;
  sibling: string;
  siblingDiff: string;
  wardrobeRule: string;
  makeupGuide: string;
}

export const SEO_SEASONS_DATA: Record<string, SeoSeasonData> = {
  "soft-autumn-analysis": {
    title: "Soft Autumn",
    hue: "Neutral-Warm",
    value: "Medium",
    chroma: "Muted/Soft",
    characteristics: "Soft Autumn represents the gentle transition from the warm summer sun into the cool autumn shadows. Sitting adjacent to Soft Summer, this season has an underlying golden warmth that is highly blended with cool, sandy, and grayish tones. Your skin undertone is neutral-warm, lacking intense yellow or peach pigments, which is why your overall facial contrast remains low to medium. Your eye color is typically soft hazel, olive green, or warm amber, lacking any sharp borders around the pupil. Your hair is usually mousey brown, soft chestnut, or honey blonde. The overall visual essence is gentle, sophisticated, and earthy, resembling a dry woodland during late September.",
    colors: [
      "Terracotta (#E2725B) — A soft, burnt orange that warms your face without overwhelming your gentle contrast.",
      "Muted Moss Green (#8A9A5B) — An earthy green that harmonizes with hazel or olive eyes, bringing out natural gold highlights.",
      "Mustard Gold (#C5994B) — A warm, rich gold that provides warmth without the glaring intensity of bright yellow.",
      "Dusty Rose (#C4A09A) — One of the few pinks that work perfectly, blending warm peach pigments with a cool, dusty rose undertone.",
      "Camel (#C19A6B) — Your ultimate neutral base color. It should replace stark white in your t-shirts and daily outerwear."
    ],
    avoid: "Avoid highly saturated primaries, neon shades, and high-contrast combinations. Stark black (#000000) and pure white (#FFFFFF) will immediately overpower your muted features, casting gray shadows under your eyes and highlighting redness or skin fatigue. Opt for warm charcoal or off-white instead.",
    celebs: "Gigi Hadid, Drew Barrymore, Elizabeth Olsen, and Mischa Barton.",
    sibling: "Soft Summer",
    siblingDiff: "While both share a muted, low-contrast primary trait (Chroma), Soft Autumn is grounded in golden, sandy undertones, whereas Soft Summer is built on grayish-blue, dusty undertones. Soft Autumn feels warm and velvety, while Soft Summer feels cool and watercolor-like.",
    wardrobeRule: "Aim for a soft-contrast wardrobe using tonal gradients. Instead of a high-contrast top and bottom, pair an olive trouser with a camel cashmere sweater. Use a 60% neutral camel, 30% moss green accent, and 10% terracotta jewelry color ratio.",
    makeupGuide: "Choose makeup with a matte, velvet finish. Avoid glitter or high-gloss products. For foundation, look for neutral-warm liquid bases. For lips, stick to warm terracotta, dusty rose, or peach MLBB (My Lips But Better) velvet tints."
  },
  "true-winter-analysis": {
    title: "True Winter",
    hue: "Cool",
    value: "High Contrast",
    chroma: "Clear/Bright",
    characteristics: "True Winter is the classic 'Snow White' archetype, characterized by completely cool undertones and a high contrast between skin, hair, and eyes. There is absolutely no warmth, gold, or copper in your natural coloring. Your skin is typically porcelain white, cool olive, or deep espresso, with distinct blueish undertones. Your eyes are piercingly bright—often royal blue, violet, cool gray, or dark black-brown, with a sharp contrast between the white of the eyes and the pupil. Your hair is jet black, dark ash brown, or silver-white. The overall visual energy is vivid, dramatic, and icy.",
    colors: [
      "Stark Black (#000000) — Your ultimate power neutral, which you can wear head-to-toe without looking washed out.",
      "Optic White (#FFFFFF) — Crisp, clean white that provides the perfect contrast against your dark hair or eyes.",
      "Royal Blue (#4169E1) — A brilliant, saturated cool blue that brings out the clarity in your eyes.",
      "Ruby Red (#E0115F) — A classic, blue-based red that highlights the natural cool flush of your cheeks.",
      "Emerald Green (#50C878) — A rich jewel tone that harmonizes beautifully with your high-contrast cool features."
    ],
    avoid: "Stay away from warm, earthy shades such as mustard, copper, rust, olive, and camel. These warm tones will instantly clash with your cool blood undertones, making your complexion look sallow, tired, and aged. Avoid muted, dusty pastels which will dilute your natural sharpness.",
    celebs: "Megan Fox, Lily Collins, Katy Perry, and Lauren Graham.",
    sibling: "True Summer",
    siblingDiff: "While both share a fully cool undertone (Hue), True Winter requires maximum saturation, high contrast, and crisp, bright jewel tones (Chroma). True Summer, on the other hand, is completely soft and muted, requiring dusty, blended, and watercolor-like tones.",
    wardrobeRule: "Embrace high-contrast block styling. A crisp white silk shirt paired with a sharp black blazer and ruby red lipstick is your ultimate signature look. Keep your wardrobe color ratio at 70% black/white, 20% royal blue or emerald, and 10% bold red accents.",
    makeupGuide: "Embrace high contrast and clear pigmentation. Use cool, blue-based red lipsticks (such as MAC Ruby Woo) rather than warm corals. Keep your foundation entirely cool-toned. For eyes, a clean black wing liner works far better than warm brown shadow gradients."
  },
  "warm-spring-analysis": {
    title: "Warm Spring",
    hue: "Warm",
    value: "Medium",
    chroma: "Clear/Bright",
    characteristics: "Warm Spring is a burst of radiant sunshine. Being the warmest of the spring seasons, your coloring has a clear golden, peachy, or honey overtone with absolutely zero coolness. Your skin is golden-beige, peach-pink, or ivory, often presenting light golden freckles. Your eyes are bright and warm—typically topaz hazel, warm green, or light turquoise blue. Your hair runs warm golden blonde, copper red, or strawberry blonde. The overall visual essence is energetic, clear, and warm, resembling a field of spring flowers under mid-morning sunlight.",
    colors: [
      "Warm Coral (#FF7F50) — A bright, vibrant shade that brings an instant glow to your lips and cheeks.",
      "Golden Yellow (#FFDF00) — Liquid gold that complements your skin's undertone, making you look exceptionally healthy.",
      "Kelly Green (#4CBB17) — A lively, fresh green that highlights the green or golden flakes in your iris.",
      "Turquoise (#40E0D0) — A brilliant, warm-leaning blue that offers the perfect bright contrast for your wardrobe.",
      "Warm Beige (#F5F5DC) — A soft, creamy neutral base that should replace cold gray in your casual shirts."
    ],
    avoid: "Avoid dusty, muted, gray-based shades like mauve, taupe, slate gray, and lavender, which will extinguish your natural fire. Furthermore, steer clear of stark black and optic white, as these cool, heavy tones will make your bright peachy complexion look pale and disconnected.",
    celebs: "Jessica Chastain, Nicole Kidman, Cameron Diaz, and Amy Adams.",
    sibling: "True Autumn",
    siblingDiff: "Both are completely warm (Hue), but Warm Spring has clear, bright, and high-chroma features, whereas True Autumn is soft, muted, and earthy. Warm Spring is sunny and light; True Autumn is forest-like.",
    wardrobeRule: "Choose high-chroma, warm color combinations. A coral top paired with a warm beige trouser works beautifully. Avoid dark, gloomy colors; instead, use a ratio of 50% warm beige/cream, 30% bright coral/turquoise, and 20% golden yellow accents.",
    makeupGuide: "Opt for warm, glowy finishes. Use cream blushes in peach or coral tones, and lipsticks with a warm, glossy orange-red base. Avoid cool fuchsia lipsticks and cold silver glitters. Highlight your features with warm champagne gold highlighter."
  },
  "deep-winter-analysis": {
    title: "Deep Winter",
    hue: "Neutral-Cool",
    value: "Dark",
    chroma: "Clear/Bright",
    characteristics: "Deep Winter stands at the threshold where the cool ice of winter meets the dark earth of autumn. You have dark features with a neutral-cool undertone, allowing you to wear deep, heavy colors with ease. Your skin is typically light olive, cold beige, chocolate brown, or porcelain white, contrasting strongly against dark hair. Your eyes are deep and dark—almost black, dark hazel, or deep cool brown. Your hair is dark chocolate, black, or very dark charcoal brown. The overall visual style is intense, rich, mysterious, and highly contrasted.",
    colors: [
      "Burgundy (#800020) — A deep, luxurious red that highlights the cool depth of your features.",
      "Charcoal Grey (#36454F) — Your best dark neutral, which serves as a softer alternative to stark black.",
      "Pine Green (#01796F) — A deep, cool forest green that brings out the cool highlights in dark eyes.",
      "Navy Blue (#000080) — A classic, sophisticated dark neutral that provides a sharp, clean silhouette.",
      "Plum (#8E4585) — A rich, blue-based dark purple that enhances your skin's natural translucent clarity."
    ],
    avoid: "Avoid light, warm pastels and earthy, muted tones such as pale orange, peach, yellow-beige, and mustard. These warm, dusty tones will clash with your neutral-cool undertones and deep values, making you look sallow and washed out.",
    celebs: "Anne Hathaway, Monica Bellucci, Viola Davis, and Selena Gomez.",
    sibling: "Deep Autumn",
    siblingDiff: "Both share the same dark value (Value), but Deep Winter is cool and requires crisp, high-chroma contrast, while Deep Autumn is warm, rich, and has a softer, earthy glow. Deep Winter handles jewel tones; Deep Autumn handles spice tones.",
    wardrobeRule: "Focus on deep-contrast styling. Pair deep burgundy or pine green with charcoal grey or black. Use a 70% deep neutral (navy, charcoal, black), 20% rich jewel accents (burgundy, deep plum), and 10% optic white details for contrast.",
    makeupGuide: "Go for deep, rich pigmentation. Dark plum, berry, or cool burgundy lipsticks look spectacular on you. Avoid peach or nude lipsticks with yellow undertones. Use dark charcoal brown or black for eyeliner rather than warm gold shadows."
  },
  "soft-summer-analysis": {
    title: "Soft Summer",
    hue: "Neutral-Cool",
    value: "Medium",
    chroma: "Muted/Soft",
    characteristics: "Soft Summer is the season of mist, shadow, and watercolor hues. Sitting adjacent to Soft Autumn, your cool undertone is heavily blended with dusty, grayish, and neutral pigments. Your skin is neutral-cool, often appearing beige, light olive, or ash-rose. Your eyes are soft and blended—typically dusty blue, cool hazel, or gray-green, lacking any sharp borders. Your hair is ash blonde, mousey ash brown, or soft gray-brown. The overall visual essence is understated, elegant, cool, and soft, resembling a misty sea beach at dawn.",
    colors: [
      "Dusty Mauve (#E0B0FF) — A soft, grayish purple that matches the natural cool, muted quality of your skin.",
      "Slate Blue (#708090) — A cool, dusty blue that serves as your most flattering neutral outerwear color.",
      "Rose Brown (#BC8F8F) — A unique, cool-toned brown with pink undertones, far superior to warm chocolate browns.",
      "Sage Green (#9DC183) — A soft, muted green with cool, grayish undertones that enhances soft hazel eyes.",
      "Soft Lavender (#E6E6FA) — A delicate, cool pastel that provides a light contrast without being stark."
    ],
    avoid: "Avoid highly saturated primary colors, neons, and warm earth tones. Stark black (#000000) and pure white (#FFFFFF) will overwhelm your soft features, making you look exhausted and pale. Avoid warm orange, copper, and golden yellow, which will look completely disconnected.",
    celebs: "Bella Hadid, Dakota Johnson, Sarah Jessica Parker, and Jennifer Aniston.",
    sibling: "Soft Autumn",
    siblingDiff: "Both share a muted Chroma, but Soft Summer has cool, grayish-blue undertones, whereas Soft Autumn has warm, golden-sandy undertones. Soft Summer is cool and dusty; Soft Autumn is warm and earthy.",
    wardrobeRule: "Embrace low-contrast, tonally blended outfits. Pair slate blue with dusty mauve or rose brown. Use a color ratio of 60% slate blue/rose brown, 30% soft sage green or lavender, and 10% silver jewelry details.",
    makeupGuide: "Opt for a completely matte or velvet finish. Glitter and high-shine products clash with your soft features. Use cool, dusty mauve or rose-wood lip tints. Avoid warm peach and fiery red lipsticks. For eyes, a soft gray or taupe shadow works best."
  },
  "light-summer-analysis": {
    title: "Light Summer",
    hue: "Neutral-Cool",
    value: "Light",
    chroma: "Muted/Soft",
    characteristics: "Light Summer is cool, light, and delicate. Your coloring has very low pigmentation and a cool undertone, giving you an ethereal, pastel-like quality. Your skin is porcelain, ivory, or pale pinkish-beige, burning easily in the sun. Your eyes are light blue, cool gray, or soft hazel-green. Your hair is light ash blonde, platinum, or soft ash brown. The overall visual contrast is low, resembling a clear summer sky filled with light pastel pinks and soft blues.",
    colors: [
      "Powder Pink (#FFB6C1) — A soft, cool pink that lifts your complexion and adds a healthy flush.",
      "Sky Blue (#87CEEB) — A clear, cool blue that matches the light value of your eyes.",
      "Mint Green (#98FF98) — A refreshing, cool-leaning pastel green that complements your delicate contrast.",
      "Light Lavender (#E6E6FA) — A classic, elegant violet-blue that highlights the cool ash tones in your hair.",
      "Soft White (#F5F5F5) — An off-white neutral base that replaces stark paper-white for a softer look."
    ],
    avoid: "Avoid dark, heavy, and saturated colors like black, navy, and deep burgundy, which will visually overwhelm your light contrast. Also, stay away from warm, fiery earth tones like burnt orange, rust, mustard, and golden beige.",
    celebs: "Margot Robbie, Reese Witherspoon, Cate Blanchett, and Elle Fanning.",
    sibling: "Light Spring",
    siblingDiff: "Both share a light value (Value), but Light Summer has cool, pinkish-blue undertones, while Light Spring has warm, golden-peach undertones. Light Summer is cool and icy; Light Spring is warm and peachy.",
    wardrobeRule: "Choose a light-value wardrobe. Keep your tops and bottoms in pastel tones, avoiding dark blocks near your face. Use a color ratio of 60% soft white/gray, 30% sky blue/powder pink, and 10% silver accessories.",
    makeupGuide: "Keep makeup light, fresh, and slightly cool. Use cool pink blush and sheer pink lip gloss. Avoid heavy black eyeliners and dark burgundy lips; instead, choose charcoal gray or cool brown for subtle definition."
  },
  "cool-winter-analysis": {
    title: "Cool Winter",
    hue: "Cool",
    value: "High Contrast",
    chroma: "Clear/Bright",
    characteristics: "Cool Winter represents the coldest point of the winter season. Your undertone is entirely cool with zero warmth, and you have highly contrasted features. Your skin has a distinctive cool, pinkish-blue or icy olive undertone. Your eyes are ice blue, violet-blue, cool dark brown, or bright gray. Your hair is medium to dark ash brown, blue-black, or silver. The overall visual style is crisp, bright, vivid, and completely cool-toned.",
    colors: [
      "Fuchsia (#FF00FF) — A bold, vibrant cool pink that highlights the cool undertones of your skin.",
      "Sapphire Blue (#0F52BA) — A brilliant, jewel-toned cool blue that enhances the clarity of your eyes.",
      "Pure White (#FFFFFF) — Stark, crisp white that provides high contrast against your dark features.",
      "Icy Lemon (#FDFF00) — A cool, sharp, green-based yellow that brings a vibrant splash to your wardrobe.",
      "True Red (#FF0000) — A primary cool red that emphasizes the contrast of your skin and hair."
    ],
    avoid: "Avoid any colors with a golden, yellow-orange base or a muted, dusty quality. Earth tones like rust, olive, mustard, gold, and warm beige will immediately make your complexion look tired, yellowish, and dull.",
    celebs: "Zooey Deschanel, Lily Collins, Krysten Ritter, and Jahi Di'Allo Winston.",
    sibling: "Cool Summer",
    siblingDiff: "Both share an entirely cool undertone (Hue), but Cool Winter handles high-contrast, saturated, and bright jewel tones (Chroma), while Cool Summer requires soft, muted, and blended cool colors.",
    wardrobeRule: "Use crisp, high-contrast cool colors. Pair fuchsia or sapphire blue with pure black or white. Keep a color ratio of 65% cool neutrals (black, white, slate), 25% fuchsia/sapphire/true red, and 10% silver jewelry.",
    makeupGuide: "Focus on cool, vivid pigmentation. Use fuchsia or cool plum lipsticks. Keep your eyeshadow cool (silver, charcoal, cool violet). Avoid warm bronzers, warm orange blushes, and copper shadow palettes."
  },
  "true-autumn-analysis": {
    title: "True Autumn",
    hue: "Warm",
    value: "Medium",
    chroma: "Muted/Soft",
    characteristics: "True Autumn is the gold standard of warmth, rich depth, and earthy colors. Your skin has a distinct golden, bronze, or copper glow with zero coolness. Your eyes are warm hazel, forest green, warm amber, or golden-brown. Your hair runs warm copper red, rich auburn, golden brown, or dark golden blonde. The overall visual essence is rich, warm, muted, and earthy, evoking the complete color palette of a deep forest in October.",
    colors: [
      "Rust (#B7410E) — A warm, spicy red-orange that perfectly complements the golden glow of your skin.",
      "Forest Green (#228B22) — A deep, warm green that brings out the natural mossy hues in your eyes.",
      "Copper (#B87333) — A rich, metallic warm orange-gold that serves as your best accessory color.",
      "Mustard Yellow (#FFDB58) — A golden yellow that warms your complexion, making you look exceptionally healthy.",
      "Chocolate Brown (#7B3F00) — Your ultimate power neutral, which should completely replace black in your wardrobe."
    ],
    avoid: "Avoid completely cool colors like icy blue, fuchsia, magenta, and stark black or white. These cold, sharp tones will clash with the golden warmth of your skin, making you look pale, sallow, and tired.",
    celebs: "Julianne Moore, Shailene Woodley, Debra Messing, and Madelaine Petsch.",
    sibling: "True Spring",
    siblingDiff: "Both share a fully warm undertone (Hue), but True Autumn is deep, muted, and earthy (Chroma), whereas True Spring is light, bright, and clear. True Autumn is forest-like; True Spring is tropical.",
    wardrobeRule: "Style yourself in warm, tonal earth colors. Pair chocolate brown with forest green or rust. Use a color ratio of 60% warm chocolate brown/camel, 30% rust/forest green, and 10% gold or copper jewelry.",
    makeupGuide: "Embrace warm, earthy tones. Choose lipsticks with a terracotta, warm copper, or peach-brown base. Avoid cool pinks and silver shimmers. Use warm gold highlighter and olive-bronze eyeshadows."
  },
  "deep-autumn-analysis": {
    title: "Deep Autumn",
    hue: "Neutral-Warm",
    value: "Dark",
    chroma: "Muted/Soft",
    characteristics: "Deep Autumn is dark, warm, and highly contrasted. Located at the boundary where autumn fades into winter, your neutral-warm undertones are blended with dark, rich, and slightly neutral-cool pigments. Your skin is golden-beige, dark olive, warm beige, or deep bronze. Your eyes are dark brown, black, or deep hazel-green. Your hair is dark auburn, dark brown, or black. The overall visual style is intense, heavy, warm, and highly contrasted.",
    colors: [
      "Espresso (#4B3621) — A deep, rich warm brown that serves as your most flattering neutral base.",
      "Aubergine (#472C4C) — A deep, warm-leaning purple that highlights the depth of your eyes.",
      "Tomato Red (#FF6347) — A warm, fiery red that brings out the natural golden flush in your cheeks.",
      "Olive Green (#808000) — A rich, earthy olive that harmonizes perfectly with hazel or dark eyes.",
      "Dark Teal (#013220) — A complex, warm blue-green that offers a rich contrast to your wardrobe."
    ],
    avoid: "Avoid light, cool pastels like baby blue, icy pink, and lavender, which will look completely disconnected from your rich coloring. Stay away from stark optic white, which will wash out the natural warmth of your skin.",
    celebs: "Natalie Portman, Jessica Alba, Zendaya, and Meghan Markle.",
    sibling: "Deep Winter",
    siblingDiff: "Both share a dark value (Value), but Deep Autumn has golden warmth and a softer, earthy chroma, while Deep Winter has a cool, blue-black undertone and a sharp, clear chroma.",
    wardrobeRule: "Choose rich, deep-contrast combinations. Pair espresso with tomato red or olive green. Maintain a color ratio of 70% deep warm neutrals (espresso, dark teal), 20% tomato red or aubergine, and 10% warm gold jewelry.",
    makeupGuide: "Embrace deep, warm colors. Lipsticks in terracotta, warm brick-red, or deep bronze-nude look exceptional. Avoid cool pinks and silver glitters. Highlight eyes with warm gold or copper shadows."
  },
  "light-spring-analysis": {
    title: "Light Spring",
    hue: "Neutral-Warm",
    value: "Light",
    chroma: "Clear/Bright",
    characteristics: "Light Spring is warm, light, and delicate. Your features are very low in contrast, giving you a peachy, golden, and ethereal appearance. Your skin is porcelain, ivory, or warm peach-beige, often with light golden freckles. Your eyes are light blue, warm green, or light hazel. Your hair is golden blonde, honey, or strawberry blonde. The overall visual style is warm, soft, and light, resembling a sunny morning in early April.",
    colors: [
      "Peach (#FFE5B4) — A soft, warm orange-pink that brings a healthy, peach-like glow to your cheeks.",
      "Warm Aqua (#00FFFF) — A light, clear blue-green that highlights the warm undertones of your skin.",
      "Butter Yellow (#FAFAD2) — A soft, warm yellow that reflects the natural brightness of your season.",
      "Light Camel (#C19A6B) — Your best light neutral base, which replaces harsh black or charcoal.",
      "Coral Pink (#F88379) — A vibrant but light pink-orange that warms your complexion beautifully."
    ],
    avoid: "Avoid dark, heavy, and cool colors like black, dark navy, charcoal, and burgundy, which will completely overpower your light, delicate features. Also, stay away from cold, icy blue or fuchsia pastels.",
    celebs: "Taylor Swift, Amanda Seyfried, Blake Lively, and Gigi Hadid (when styled bright).",
    sibling: "Light Summer",
    siblingDiff: "Both are light (Value), but Light Spring has warm, golden-peach undertones, whereas Light Summer has cool, pink-pink undertones. Light Spring is warm and peachy; Light Summer is cool and icy.",
    wardrobeRule: "Style yourself in light, warm tones. Avoid high-contrast black blocks; instead, pair light camel with warm aqua or peach. Maintain a ratio of 60% light neutrals (camel, warm beige), 30% pastels (peach, aqua), and 10% gold jewelry.",
    makeupGuide: "Keep makeup light, warm, and shimmery. Use peach or light coral blushes and warm, glossy coral pink lipsticks. Avoid dark plum lips and cold silver highlights. Choose light warm bronze for eyeshadow."
  },
  "true-spring-analysis": {
    title: "True Spring",
    hue: "Warm",
    value: "Medium",
    chroma: "Clear/Bright",
    characteristics: "True Spring is entirely warm, bright, and clear. Your coloring has a radiant, golden glow with no cool or muted influences. Your skin is golden-beige, ivory, or warm bronze, glowing under gold jewelry. Your eyes are bright hazel, light green, or clear warm blue. Your hair is golden blonde, auburn, strawberry blonde, or copper red. The overall visual contrast is medium to high, resembling a tropical garden under bright sunshine.",
    colors: [
      "Bright Coral (#FF7F50) — A warm, clear orange-red that serves as your most vibrant power color.",
      "Turquoise (#40E0D0) — A tropical, warm-leaning blue that offers a rich, clear contrast to your look.",
      "Sunshine Yellow (#FFEB00) — A pure, bright yellow that brings out the golden clarity of your skin.",
      "Kelly Green (#4CBB17) — A fresh, warm green that highlights the golden hues in your eyes.",
      "Warm Beige (#F5F5DC) — A soft, sandy neutral base that replaces stark cold white in your wardrobe."
    ],
    avoid: "Avoid muted, dusty colors like mauve or slate gray, and completely cool colors like icy blue or fuchsia, which will wash out your natural brightness. Stay away from stark black, which will look heavy and dark.",
    celebs: "Emma Stone, Amy Adams, Ellie Kemper, and Prince Harry.",
    sibling: "True Autumn",
    siblingDiff: "Both are fully warm (Hue), but True Spring is bright, clear, and high-chroma, whereas True Autumn is rich, muted, and earthy. True Spring is clear and light; True Autumn is dark and smoky.",
    wardrobeRule: "Choose saturated, warm color combinations. Pair bright coral with warm beige or turquoise. Maintain a color ratio of 55% warm beige/cream, 35% bright coral/turquoise, and 10% warm gold accessories.",
    makeupGuide: "Go for warm, clear, and glowing finishes. Use bright peach blushes and lipsticks with a warm coral or poppy-red base. Avoid cool, dark violet colors and silver shimmers. Accentuate with champagne gold highlight."
  },
  "true-summer-analysis": {
    title: "True Summer",
    hue: "Cool",
    value: "Medium",
    chroma: "Muted/Soft",
    characteristics: "True Summer is completely cool, soft, and blended. Your coloring has a distinctive pink, cool beige, or grayish undertone with absolutely zero warmth. Your eyes are cool blue, gray, or gray-green, looking soft rather than piercing. Your hair is ash blonde, medium ash brown, or cool gray-brown. The overall visual style is elegant, understated, and completely cool-toned, resembling a shady cool garden in mid-July.",
    colors: [
      "Dusty Rose (#C4A09A) — A romantic, cool-leaning pink that perfectly matches the cool softness of your skin.",
      "Slate Blue (#708090) — Your ultimate neutral base color, far more flattering than black or charcoal.",
      "Soft Navy (#000080) — A classic cool neutral that provides a sophisticated base for daily wear.",
      "Mauve (#E0B0FF) — A complex, cool purple with gray undertones that enhances your soft contrast.",
      "Seafoam Green (#2E8B57) — A cool, refreshing green that complements ash hair and blue-gray eyes."
    ],
    avoid: "Avoid entirely warm, golden, or orange-based colors like rust, copper, mustard, and golden beige. Also, steer clear of stark black and optic white, which are too harsh and high-contrast for your soft features.",
    celebs: "Emily Blunt, Olivia Wilde, Barbara Palvin, and Paul Newman.",
    sibling: "True Winter",
    siblingDiff: "Both are completely cool (Hue), but True Summer is soft and muted (Chroma), requiring dusty colors, whereas True Winter is sharp and contrasted, requiring pure, intense jewel colors.",
    wardrobeRule: "Build a wardrobe around soft cool neutrals. Pair slate blue with soft navy or dusty rose. Use a color ratio of 60% slate blue/soft navy, 30% mauve/dusty rose, and 10% silver jewelry details.",
    makeupGuide: "Opt for matte, cool-toned makeup. Choose cool pink blushes and lipsticks with a dusty mauve or berry-rose base. Avoid warm peach and bronze highlights. Keep eyeshadows in soft gray or cool taupe."
  }
};
