const { GoogleGenerativeAI } = require("@google/generative-ai");

// Test the API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function testAPI() {
  try {
    console.log("Testing API key:", process.env.GEMINI_API_KEY ? "Present" : "Missing");
    const result = await model.generateContent("Hello, test message");
    const response = result.response;
    const text = response.text();
    console.log("API test successful:", text);
  } catch (error) {
    console.error("API test failed:", error.message);
  }
}

testAPI();
