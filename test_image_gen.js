const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testImageGen() {
  const apiKey = "AIzaSyB8IdeN1kE8hNd1yAXwPLVUbnUw3j4f20w"; // User's key
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Try the image generation model if available, or standard gemini-3-pro-preview with image generation prompt
  // Based on docs, usually image generation is a separate method or model.
  // But let's try prompting the multimodal model first.
  
  const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

  try {
    console.log("Testing text-to-image generation...");
    const result = await model.generateContent("Generate an image of a fashionable woman wearing a deep emerald silk blouse.");
    console.log("Response:", result.response.text());
    // Check if response contains image data (unlikely for text model, but let's see if it refuses or points to another model)
  } catch (error) {
    console.error("Error:", error);
  }
}

testImageGen();
