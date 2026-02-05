# CLEVIQ — Master AI Learning Orchestrator

**CLEVIQ** (Codename: *SABI*) is a world-class AI agent platform that transforms any prompt into a high-fidelity, multimodal educational course. It leverages a sophisticated multi-agent orchestration layer to handle instructional design, content research, and asset generation in parallel.

## 🚀 Project Overview
In an era of information overload, finding a structured path to mastery is difficult. CLEVIQ acts as a **Master Instructional Designer**, taking a raw learning intent and outputting a comprehensive "Personal Academy" complete with technical study guides, audio lectures, deep-dive podcasts, and interactive assessments.

### 🧠 The Problem Statement
Standard LLMs provide answers, but not **Education**. Learners currently face:
- **Fragmentation**: Hunting for disjointed videos, blogs, and docs.
- **Surface-Level Learning**: Lack of structured progression and depth.
- **Passive Consumption**: Reading without verification or active recall.

### 💎 Value Proposition
> "Transform any concept into a world-class, multi-modal learning experience in minutes."

---

## 🛠 Technical Frameworks
- **Core UI**: React 19 (ES6 Modules)
- **Styling**: Tailwind CSS (Glassmorphism Aesthetic)
- **AI SDK**: `@google/genai` (Gemini 2.5/3.0 Series)
- **Audio Engine**: Web Audio API with PCM Raw Stream Decoding
- **Fallback Orchestrator**: Custom Tiered Logic (Groq, OpenAI, Gemini)

---

## 🏗 System Architecture: The Multi-Agent Workflow
CLEVIQ simulates a production-grade educational studio using specialized virtual agents:
1.  **Course Architect**: Scaffolds the curriculum and module hierarchy.
2.  **Researcher**: Injects verified facts and technical depth into the content.
3.  **Content Writer**: Transforms data into engaging, professional narratives.
4.  **Visual Sourcing**: Generates semantic prompts for dynamic imagery.
5.  **Audio Scripting**: Crafts distinct voices for Academic Lectures vs. Conversational Podcasts.
6.  **Quality Audit**: Ensures instructional coherence and quiz accuracy.

---

## ⚙️ Environment Variables
The application requires an API key to communicate with the GenAI models. Ensure your environment has:

| Variable | Description | Requirement |
| :--- | :--- | :--- |
| `API_KEY` | Google Gemini API Key | **Required** (Primary Model & TTS) |
| `GROQ_API_KEY` | Groq Cloud API Key | *Optional* (Used for high-speed fallback) |
| `OPENAI_API_KEY` | OpenAI API Key | *Optional* (Used for fallback consistency) |

---

## 📖 Usage Guide
1.  **Define Your Goal**: Enter a topic like "Quantum Computing for CFOs" or "History of the Silk Road."
2.  **Select Complexity**: Choose between *Beginner* (Zero to One), *Intermediate*, or *Advanced*.
3.  **Orchestrate**: Watch the multi-agent system deploy across global clusters to build your course.
4.  **Immerse**: 
    - **Study Guide**: Read deep-dive markdown content with dynamic visuals.
    - **Audio Lecture**: Listen to a professional narration of the core concepts.
    - **Insight Podcast**: Experience a conversational deep-dive between AI hosts.
5.  **Verify**: Pass the interactive assessments to lock in your mastery and "complete" the course.

---

## 🛠 Setup Instructions
Since this project uses modern ES6 modules and imports directly from ESM providers:

1.  Clone the repository.
2.  Ensure you have a local development server (e.g., `Live Server`, `Vite`, or `servor`).
3.  Set your environment variables in your local shell or `.env` file (if supported by your runner).
4.  Open `index.html` via your local server.

---
*Developed by Medus Technologies — Shaping the Future of Autonomous Education.*