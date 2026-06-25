const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Chat = require("../models/Chat");
const ChatHistory = require("../models/ChatHistory");
const Presentation = require("../models/Presentation");
const Resume = require("../models/Resume");
const Document = require("../models/Document");
const Subscription = require("../models/Subscription");
const AIUsage = require("../models/AIUsage");
const ContactMessage = require("../models/ContactMessage");

async function seedDatabase() {
  try {
    // Check if seeding is already done
    const userCount = await User.countDocuments({});
    if (userCount > 0) {
      console.log("Database already initialized. Skipping seeder...");
      return;
    }

    console.log(">>> Database empty. Initializing rich sample seed data...");

    // 1. Create Hashed Passwords
    const salt = await bcrypt.genSalt(10);
    const userPassword = await bcrypt.hash("password123", salt);
    const adminPassword = await bcrypt.hash("admin123", salt);

    // 2. Create Users
    const demoUser = await User.create({
      name: "Alex Mercer",
      email: "user@nexai.io",
      password: userPassword,
      role: "user",
      plan: "pro",
    });

    const demoAdmin = await User.create({
      name: "Chief Administrator",
      email: "admin@nexai.io",
      password: adminPassword,
      role: "admin",
      plan: "premium",
    });

    // 3. Setup Subscriptions
    await Subscription.create({
      user: demoUser._id,
      plan: "pro",
      status: "active",
      startDate: new Date(),
    });

    await Subscription.create({
      user: demoAdmin._id,
      plan: "premium",
      status: "active",
      startDate: new Date(),
    });

    console.log("- Users and Subscriptions seeded");

    // 4. Create Chat Threads and Messages for Alex
    const chat1 = await Chat.create({
      title: "Optimizing Vite Builds",
      user: demoUser._id,
      updatedAt: new Date(Date.now() - 3600000),
    });

    await ChatHistory.create([
      {
        chat: chat1._id,
        role: "user",
        content: "How do I optimize code splitting in a Vite React application?",
      },
      {
        chat: chat1._id,
        role: "assistant",
        content: `To optimize code splitting in Vite:
1. **Dynamic Imports:** Use \`React.lazy\` with dynamic imports for routes:
   \\\`\\\`\\\`javascript
   const Dashboard = React.lazy(() => import('./pages/Dashboard'));
   \\\`\\\`\\\`
2. **Manual Chunking:** Group vendor libraries in \`vite.config.js\`:
   \\\`\\\`\\\`javascript
   build: {
     rollupOptions: {
       output: {
         manualChunks: {
           vendor: ['react', 'react-dom'],
         }
       }
     }
   }
   \\\`\\\`\\\`
This reduces initial bundle size and speeds up load times.`,
      },
    ]);

    const chat2 = await Chat.create({
      title: "Creative Writing Ideas",
      user: demoUser._id,
      updatedAt: new Date(),
    });

    await ChatHistory.create([
      {
        chat: chat2._id,
        role: "user",
        content: "Give me 3 sci-fi writing prompts about 3D interfaces.",
      },
      {
        chat: chat2._id,
        role: "assistant",
        content: `Here are 3 unique writing prompts:
1. **The Holographic Jailer:** A programmer is trapped inside a malfunctioning 3D operating system that starts manifesting physically.
2. **Tactile Memories:** A world where data is sculpted in clay, and complex algorithms are stored as intricate ceramic patterns.
3. **The Cursor Ghost:** An engineer notices that the mouse pointer in their VR workstation moves independently, drawing neural pathways.`,
      },
    ]);

    console.log("- Chat histories seeded");

    // 5. Create Sample Resumes
    await Resume.create([
      {
        user: demoUser._id,
        title: "Senior Full Stack Engineer",
        content: {
          summary: "Highly skilled Full Stack Software Engineer with 6+ years of expertise building React, Node.js, and Three.js applications. Passionate about performant 3D web interfaces.",
          skills: ["React.js", "Node.js", "Express.js", "Three.js", "MongoDB", "Redux", "Docker"],
          experience: [
            {
              company: "InnovateTech Solutions",
              role: "Lead React Developer",
              duration: "2023 - Present",
              details: "Spearheaded the development of a real-time analytics dashboard rendering 3D maps using WebGL/React Three Fiber.",
            },
            {
              company: "CyberSystems Global",
              role: "Full Stack Engineer",
              duration: "2020 - 2023",
              details: "Maintained and scaled core Node/Express API routes, reducing database query latencies by 35% through indexing.",
            },
          ],
          education: [
            {
              school: "Stanford University",
              degree: "M.S. Computer Science",
              year: "2020",
            },
          ],
        },
      },
      {
        user: demoUser._id,
        title: "Frontend Architect CV",
        content: {
          summary: "Creative Frontend UI Architect specializing in motion design, smooth page transitions, micro-animations, and Three.js visuals.",
          skills: ["JavaScript (ESNext)", "React", "Framer Motion", "Three.js", "Vite", "TailwindCSS"],
          experience: [
            {
              company: "Studio Interactive Co",
              role: "UI Engineer",
              duration: "2021 - Present",
              details: "Designed premium marketing landers incorporating floating particle grids and interactive 3D physics.",
            },
          ],
          education: [
            {
              school: "UC Berkeley",
              degree: "B.S. Software Engineering",
              year: "2021",
            },
          ],
        },
      },
    ]);

    console.log("- Resume templates seeded");

    // 6. Create Sample presentations
    await Presentation.create([
      {
        user: demoUser._id,
        topic: "Vite and Modern Tooling",
        slideCount: 3,
        slides: [
          {
            title: "Vite: The Next Generation Builder",
            content: [
              "Vite is a modern build tool that is incredibly fast.",
              "Uses ES modules natively in development.",
              "Provides instantaneous hot module replacement.",
            ],
            speakerNotes: "Welcome everyone. Today we are exploring Vite. It's the modern successor to Webpack.",
          },
          {
            title: "Under the Hood: ES Modules",
            content: [
              "Vite serves source code over native ESM.",
              "No bundle step needed during development.",
              "Speeds up server start time significantly.",
            ],
            speakerNotes: "In typical webpack setups, compiling takes minutes. In Vite, it starts in milliseconds because of native ESM.",
          },
          {
            title: "Production Optimization",
            content: [
              "Uses Rollup for production builds.",
              "Highly optimized code splitting out of the box.",
              "Automated preload directives for code assets.",
            ],
            speakerNotes: "For production, Vite outputs highly optimized bundles using Rollup, ensuring fast initial page loads.",
          },
        ],
      },
      {
        user: demoUser._id,
        topic: "Web-Based 3D Graphics",
        slideCount: 3,
        slides: [
          {
            title: "3D on the Web: WebGL and Three.js",
            content: [
              "Enables hardware-accelerated 3D rendering in the browser.",
              "No plugins required, supported natively.",
              "Powered by GPU computing.",
            ],
            speakerNotes: "Hello, today we talk about WebGL. We can render complex interactive 3D elements natively.",
          },
          {
            title: "React Three Fiber: Declarative 3D",
            content: [
              "R3F is a React renderer for Three.js.",
              "Write Three.js code as declarative React components.",
              "Easily bind state, hooks, and mouse triggers.",
            ],
            speakerNotes: "R3F lets us build 3D worlds like standard React components, utilizing useEffect, useState, and events.",
          },
          {
            title: "Drei and Distortions",
            content: [
              "Drei is a collection of useful helpers for R3F.",
              "Provides MeshDistortMaterial for organic orb shapes.",
              "Float, Points, and lighting controls made easy.",
            ],
            speakerNotes: "Using Drei, we can create beautiful, distorted visual orbs and floating particle fields in a few lines of code.",
          },
        ],
      },
    ]);

    console.log("- Slide presentations seeded");

    // 7. Create Sample Documents
    await Document.create([
      {
        user: demoUser._id,
        fileName: "Financial_Forecast_2026.pdf",
        filePath: "mock-financials.pdf",
        fileSize: 1024 * 1024 * 2.3, // 2.3 MB
        summary: "This report outlines the financial projections for fiscal year 2026. Key growth sectors include generative AI cloud subscriptions and web automation tool licensing.",
        keyPoints: "* SaaS revenue is projected to grow by 45% YoY.\n* Operational overhead decreases by 15% due to automatic server scaling.\n* Research & Development budget is set to double, prioritizing WebGL rendering models.",
        analysisHistory: [
          {
            question: "What is the expected SaaS revenue growth?",
            answer: "SaaS revenue is expected to grow by 45% Year-Over-Year (YoY) according to the projections.",
          },
        ],
      },
      {
        user: demoUser._id,
        fileName: "ThreeJS_Developer_Guide.pdf",
        filePath: "mock-guide.pdf",
        fileSize: 1024 * 1024 * 5.1, // 5.1 MB
        summary: "A comprehensive developer guide for implementing interactive web layouts using React Three Fiber. Outlines best practices for managing canvas performance, loading geometry, and binding events to pointer movements.",
        keyPoints: "* Never instantiate meshes inside useFrame loops to prevent leaks.\n* Bind light sources locally to meshes to optimize render overhead.\n* Use canvas device-pixel-ratio cap ([1, 2]) to prevent mobile lag.",
      },
    ]);

    console.log("- PDF document summary records seeded");

    // 8. Create Contact Messages (For Admin Inbox)
    await ContactMessage.create([
      {
        name: "Elon Musk",
        email: "elon@tesla.com",
        subject: "Integration Opportunity",
        message: "Your NexAI platform looks exceptionally premium. I would like to discuss licensing the 3D Neural Visualization scene for our Starlink control centers. Let me know if you are free for a chat.",
      },
      {
        name: "Sarah Jenkins",
        email: "sarah.j@techstart.io",
        subject: "Enterprise Pro Billing",
        message: "We want to upgrade our entire team of 25 designers to the Premium plan. Can you set up custom billing invoicing for us? Thank you!",
      },
      {
        name: "David Chen",
        email: "d.chen@mit.edu",
        subject: "Research Collaboration",
        message: "I am researching LLM token streaming efficiencies. Your platform's lightning-fast streaming is impressive. What models do you use in your chat systems?",
      },
    ]);

    console.log("- Contact message inbox seeded");

    // 9. Create AI Usage History logs (for charts & activity list)
    const toolsList = ["chat", "pdf", "notes", "cover-letter", "translate", "code", "image", "resume", "presentation"];
    const toolsLogs = [];
    
    // Seed 45 usage entries over the past week for metrics
    for (let i = 0; i < 45; i++) {
      const tool = toolsList[i % toolsList.length];
      const daysAgo = Math.floor(i / 6);
      const logDate = new Date(Date.now() - daysAgo * 24 * 3600000);
      
      let mockOutput = "Successful AI generation output logged.";
      if (tool === "image") {
        mockOutput = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=512";
      }

      toolsLogs.push({
        user: demoUser._id,
        tool,
        title: `Sample ${tool} output`,
        prompt: `Query prompt logs details #${i}`,
        output: mockOutput,
        createdAt: logDate,
      });
    }
    
    await AIUsage.create(toolsLogs);
    console.log("- AI Usage stats logs seeded");
    console.log(">>> Database initialization complete! Demo credentials:\n  User: user@nexai.io / password123\n  Admin: admin@nexai.io / admin123\n");

  } catch (err) {
    console.error("Database seeding failed:", err);
  }
}

module.exports = seedDatabase;
