const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const apiKey = "AIzaSyB8IdeN1kE8hNd1yAXwPLVUbnUw3j4f20w"; // User provided key
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    // Note: The Node.js SDK doesn't expose listModels directly on the main class in all versions, 
    // but we can try to infer available models by making a simple request or using the model manager if available.
    // However, a standard "list models" script usually requires making a REST call if the SDK wrapper is minimal.
    // Let's try to simple generation with 'gemini-1.5-pro' to see if it works, 
    // effectively testing the key and connectivity.
    // A true "list models" requires the 'google-auth-library' and accessing the REST API directly 
    // or using the specific SDK method `getGenerativeModel` isn't for listing.
    
    // Let's actually use a direct fetch to the REST API for listing models, 
    // which is the most reliable way to answer "what models are available".
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Available Models:");
    data.models.forEach(model => {
        if (model.name.includes('gemini')) {
            console.log(`- ${model.name} (${model.displayName})`);
        }
    });

  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
