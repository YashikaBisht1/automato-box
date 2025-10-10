# GenAI Multi-Agent Platform

A sophisticated AI-powered platform featuring specialized agents for market analysis, branding, content creation, and outreach. Built with advanced RAG (Retrieval-Augmented Generation), conversation memory, and intelligent orchestration.

## 🚀 Features

### Specialized AI Agents
- **Market Analyst**: Competitive intelligence, market research, and strategic analysis
- **Branding Agent**: Brand identity development, tagline generation, and positioning strategies
- **Content Agent**: Content creation for blogs, social media, and marketing materials
- **Outreach Agent**: Personalized email campaigns and partnership outreach

### Advanced AI Capabilities
- **AI Orchestrator**: Coordinates multiple agents to work together on complex workflows
- **RAG (Retrieval-Augmented Generation)**: Context-aware responses using vector embeddings
- **Conversation Memory**: Maintains context across sessions for personalized interactions
- **Learning System**: Improves over time based on user feedback and preferences
- **Knowledge Base**: Stores and retrieves domain-specific knowledge with confidence scoring

### Security & Authentication
- Secure user authentication with email/password
- Row-Level Security (RLS) policies protecting all user data
- Private conversations, preferences, and knowledge entries
- User profile management

### Backend Infrastructure
- **Lovable Cloud**: Fully managed Supabase backend
- **Vector Database**: Semantic search with pgvector
- **Edge Functions**: Serverless AI processing and tool execution
- **Real-time Data**: Live updates across the application

## 🛠️ Technical Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** with custom design system
- **shadcn-ui** component library
- **React Router** for navigation
- **Zustand** for state management

### Backend (Lovable Cloud)
- **Supabase** (PostgreSQL database)
- **pgvector** for vector embeddings
- **Edge Functions** (Deno runtime)
- **Lovable AI Gateway** (Gemini & GPT models)

### AI Features
- Tool calling and execution (calculator, web search, data analysis)
- Chain-of-thought reasoning
- Multi-agent collaboration
- Structured output generation
- Feedback learning loops

## Project info

**URL**: https://lovable.dev/projects/b6587642-912e-4a3b-80d0-9abc83b00034

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/b6587642-912e-4a3b-80d0-9abc83b00034) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm i

# Start development server
npm run dev
```

### Environment Variables
The project automatically configures the following via Lovable Cloud:
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Supabase anon key
- `LOVABLE_API_KEY`: AI Gateway access (auto-configured in backend)

## 🔑 Authentication Setup

1. Navigate to the `/auth` page
2. Sign up with email and password
3. Email confirmation is auto-enabled for development
4. Access protected features after authentication

## 🤖 Available Agents

### 1. Market Analyst (`/market-analyst`)
- Competitive analysis and market research
- Industry trends and opportunity identification
- Strategic positioning recommendations
- Real-time data integration

### 2. Branding Agent (`/branding`)
- Brand identity development
- Tagline and slogan generation
- Visual concept creation
- Logo design suggestions

### 3. Content Agent (`/content`)
- Blog post and article writing
- Social media content creation
- Marketing copy generation
- SEO-optimized content

### 4. Outreach Agent (`/outreach`)
- Personalized email campaigns
- Partnership proposal drafting
- Cold outreach templates
- Follow-up sequences

### 5. AI Orchestrator (`/orchestrator`)
- Multi-agent coordination
- Complex workflow execution
- End-to-end task automation
- Agent collaboration and handoffs

## 📊 Knowledge Management

Access the Knowledge Base at `/knowledge` to view:
- AI-generated insights and research
- Learned user preferences
- Agent decision history with reasoning
- Confidence scores and sources

## 🔒 Security Features

- **Authentication**: Email/password with Supabase Auth
- **Authorization**: Row-Level Security on all tables
- **Data Privacy**: Users can only access their own data
- **Secure Backend**: Edge Functions with secret management
- **Rate Limiting**: Built into Lovable AI Gateway

## 🚀 Deployment

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## 🗄️ Database Schema

### Core Tables
- `profiles`: User profiles with display names and avatars
- `conversations`: Chat history with full message threads
- `vector_embeddings`: Semantic search using vector similarity
- `knowledge_entries`: AI-generated knowledge with confidence scores
- `user_preferences`: Learned user preferences and examples
- `agent_decisions`: Decision logs with reasoning and alternatives
- `knowledge_relationships`: Entity relationship mapping

### Security
All tables are protected with Row-Level Security (RLS) policies ensuring users can only access their own data.

## 🎯 Key Use Cases

1. **Market Research**: Analyze competitors, market trends, and positioning strategies
2. **Brand Development**: Create brand identities, taglines, and visual concepts
3. **Content Production**: Generate blog posts, social media content, and marketing copy
4. **Business Outreach**: Draft personalized emails and partnership proposals
5. **Workflow Automation**: Orchestrate multiple agents for end-to-end task completion

## 🧠 AI Architecture

### RAG Pipeline
1. User query is embedded using vector models
2. Relevant context retrieved from knowledge base
3. Context + query sent to LLM with reasoning prompts
4. Response generated with citations and confidence scores
5. Output stored for future retrieval

### Agent System
- Each agent has specialized system prompts and knowledge domains
- Agents can use tools (calculator, web search, data analysis)
- Orchestrator coordinates multi-agent workflows
- Feedback loops improve agent performance over time

## 📦 Installation & Setup

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/b6587642-912e-4a3b-80d0-9abc83b00034) and click on Share -> Publish.

Simply open [Lovable](https://lovable.dev/projects/b6587642-912e-4a3b-80d0-9abc83b00034) and click Share → Publish.

### Custom Domain
Connect a custom domain via Project > Settings > Domains.  
[Learn more about custom domains](https://docs.lovable.dev/features/custom-domain#custom-domain)

## 📚 Resources

- [Lovable Documentation](https://docs.lovable.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Lovable AI Features](https://docs.lovable.dev/features/ai)
- [Lovable Cloud](https://docs.lovable.dev/features/cloud)

## 🛣️ Roadmap

### Phase 1: Foundation ✅
- Multi-agent architecture
- RAG implementation
- Conversation memory
- Tool execution

### Phase 2: Intelligence (In Progress)
- Self-critique and iteration
- Enhanced personalization
- Advanced reasoning chains
- Improved tool library

### Phase 3: Collaboration
- Real multi-agent orchestration
- Workflow automation
- Agent marketplace
- Community agents

### Phase 4: Advanced
- Multimodal capabilities (vision, audio)
- Code generation and execution
- Real-time data integration
- Agent arena (competitive evaluation)

## 🤝 Contributing

This is a Lovable project. To contribute:
1. Open the project in Lovable
2. Make changes via prompts or code edits
3. Changes auto-commit to the repo
4. Submit pull requests for review

## 📄 License

This project is built with Lovable and uses Lovable Cloud infrastructure.

---

**Built with** ❤️ **using [Lovable](https://lovable.dev)**
