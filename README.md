# CACCS-AI: Context-Aware Cognitive Control System

CACCS-AI is an advanced research platform designed for the extraction, analysis, and simulation of complex causal systems. It leverages Large Language Models (LLMs) to transform natural language narratives into formal causal models, enabling deep insights through the lens of systems dynamics, game theory, and archetypal patterns.

## Concept & Vision

The project is rooted in the philosophy of **Context-Aware Cognitive Control**, attempting to bridge the gap between human narrative reasoning and formal systemic modeling. It serves as a "research-thinking companion," helping researchers like Suramyaa Sarkar dive deeper into understanding the hidden structures governing socio-technical systems.

## Key Features

- **Causal Extraction**: Automatically parses complex narratives into Causal Loop Diagrams (CLDs).
- **Archetype Matching**: Detects systemic patterns like "Tragedy of the Commons" or "Fixes That Fail."
- **Game Theoretic Analysis**: Formulates stakeholder interactions as formal games to find Nash Equilibria and Price of Anarchy.
- **Dynamic Simulation**: Generates and runs simulations based on extracted causal structures to predict system behavior over time.
- **Narrative Library**: A persistent repository (MySQL-backed) for storing and evolving research narratives.

## Technology Stack

- **Frontend**: React (Vite), Tailwind CSS, D3.js (for graph visualization), Lucide icons.
- **Backend**: FastAPI (Python), SQLAlchemy, MySQL.
- **AI Engine**: OpenRouter (Minimax 2.5 / Gemini 2.0 Flash) for high-fidelity extraction and reflection.
- **Deployment**: Ready for Vercel deployment with dedicated API and static build routing.

## Authors & Citation

This project is based on the research and presentations by **Suramyaa Sarkar**.

- **Suramyaa Sarkar**: [suramyaa.sarkar-1@ou.edu](mailto:suramyaa.sarkar-1@ou.edu) (Lead Researcher)
- **Kanishk Paul**: [kanishkpaul1729@gmail.com](mailto:kanishkpaul1729@gmail.com) (Sleepy Developer)

Please cite the authors when referencing this work in academic or professional contexts.

## Setup & Deployment

### Local Development

1.  **Database**: No setup required! The system automatically creates a local `caccs.db` file using SQLite.
2.  **Environment**: Create a `.env` file in the root if you want to override defaults (optional):
    ```env
    DATABASE_URL=sqlite:///./caccs.db
    ```
3.  **Backend**:
    ```bash
    pip install -r requirements.txt
    python -m uvicorn backend.main:app --reload
    ```
4.  **Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```