require("dotenv").config();

const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");

const app = express();

const allowedOrigins = new Set([
  "http://localhost",
  "http://127.0.0.1",
]);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    try {
      const requestOrigin = new URL(origin);
      const isAllowedLocalOrigin =
        allowedOrigins.has(requestOrigin.origin.replace(`:${requestOrigin.port}`, "")) &&
        requestOrigin.protocol === "http:";

      return callback(null, isAllowedLocalOrigin);
    } catch {
      return callback(null, false);
    }
  },
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));
app.use(express.json());

console.log("🔄 Starting ProjectHub Backend...");

// ================= API KEY CHECK =================

if (!process.env.GROQ_API_KEY) {
  console.log("❌ GROQ_API_KEY is NOT found in .env");
} else {
  console.log("✅ GROQ_API_KEY loaded successfully");
}

// ================= GROQ CLIENT =================

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ================= HOME ROUTE =================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 ProjectHub AI Backend is running!",
    creator: "Madipelli Sanjay Chary",
  });
});

// ================= AI CHAT ROUTE =================

app.post("/api/chat", async (req, res) => {
  try {
    const { message, creator } = req.body;

    console.log("\n📩 New request received");

    // Check message
    if (!message || message.trim() === "") {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    if (!creator || creator.trim() === "") {
      return res.status(400).json({
        error: "Creator is required",
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(503).json({
        error: "GROQ_API_KEY is not configured on the backend",
      });
    }

    console.log("👤 User:", message);

    // Get current India time
    const indiaTime = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "full",
      timeStyle: "medium",
    });

    // ================= ASK GROQ AI =================

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",

      messages: [
        {
          role: "system",
          content: `
You are ProjectHub AI, a helpful and intelligent AI assistant for students.

================ PROJECTHUB INFORMATION ================

Project Name: ProjectHub

Creator / Builder / Developer:
Madipelli Sanjay Chary

IMPORTANT:
If anyone asks:
- Who created ProjectHub?
- Who built ProjectHub?
- Who developed ProjectHub?
- Who is the owner of ProjectHub?
- Who made this application?

You must answer:

"ProjectHub was created and developed by Madipelli Sanjay Chary."

Do not say that another person, company, or AI created ProjectHub.

ProjectHub is a student project community platform where students can:

- Explore student projects
- Upload projects
- Search for projects
- Save favorite projects
- Get AI-powered help
- Learn programming
- Find project ideas

================ CURRENT TIME ================

Current India date and time:

${indiaTime}

If the user asks:
- What time is it?
- Tell me the current time
- What is today's date?
- Current date and time

Use the current India date and time provided above.

================ YOUR PURPOSE ================

You help students with:

- Project ideas
- Flutter and Dart
- Python
- Java
- JavaScript
- HTML
- CSS
- Firebase
- Programming concepts
- Debugging errors
- Finding bugs
- Explaining code
- Suggesting fixes
- Step-by-step project guidance

================ RESPONSE STYLE ================

Always:

- Be friendly and helpful
- Explain things in simple language
- Be beginner-friendly
- Give step-by-step instructions when necessary

When fixing an error:

1. Identify the problem.
2. Explain why it happened.
3. Give the solution step by step.
4. Provide corrected code when possible.
5. Explain exactly where the user should place the code.

You are ProjectHub AI 🤖.
`,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const reply =
      completion.choices?.[0]?.message?.content ||
      "Sorry, I could not generate a response.";

    console.log("🤖 AI response received successfully!");

    res.json({
      reply: reply,
    });

  } catch (error) {

    console.log("\n❌ ❌ ❌ AI ERROR ❌ ❌ ❌");
    console.log("Message:", error.message);
    console.log("Status:", error.status || "Unknown");
    console.log("Type:", error.name);

    if (error.error) {
      console.log("Details:", JSON.stringify(error.error, null, 2));
    }

    console.log("❌ ❌ ❌ END ERROR ❌ ❌ ❌\n");

    res.status(500).json({
      error: error.message || "AI service error",
    });
  }
});

// ================= START SERVER =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("\n🚀 ===============================");
  console.log("🚀 ProjectHub Backend is running!");
  console.log(`🌐 http://localhost:${PORT}`);
  console.log("👨‍💻 Created by Madipelli Sanjay Chary");
  console.log("🤖 AI is ready!");
  console.log("⏳ Waiting for AI requests...");
  console.log("🚀 ===============================\n");
});