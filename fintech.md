o keep your cloud bills at exactly zero, leveraging AWS serverless architecture is a massive advantage. Both AWS Lambda and DynamoDB have highly generous, perpetual free tiers that don't expire after your first year, which is perfect for running multiple portfolio apps simultaneously.

Here is your fully updated, bulletproof prompt. It explicitly instructs Claude to design the system to fit tightly within the AWS Free Tier limitations while still delivering top-tier performance.

### Copy This Prompt:

> **Role:** Act as a Staff-Level FinTech Software Architect and Senior Full-Stack Engineer.
> 
> **Context:** I am a Computer Science student (specializing in AI) building a flagship portfolio project: a **Real-Time Financial Asset & Predictive Economics Engine**. This is a mini FinTech SaaS designed to calculate real-time engineering economics and probabilistic financial forecasting.
> 
> **The Feature Suite:**
> 
> 1.  **Baseline Economics:** Real-time Present Worth (NPV) analysis, Break-even scenarios, and dynamic Depreciation curves (MACRS, straight-line).
>     
> 2.  **Monte Carlo Risk Simulator:** Runs thousands of probabilistic cash-flow simulations, visualizing risk distribution.
>     
> 3.  **AI Asset Replacement Optimizer:** Uses predictive modeling to determine the mathematically optimal year to replace a degrading physical asset.
>     
> 4.  **Capital Allocation Solver:** An algorithmic tool that maximizes NPV for a fixed budget across multiple investment options (Knapsack problem).
>     
> 
> **The Tech Stack:**
> 
> *   **Backend:** FastAPI (Python)
>     
> *   **Real-Time Data:** WebSockets (for live streaming of Monte Carlo simulation batches and UI updates)
>     
> *   **Compute:** AWS Lambda (offloading heavy math and AI inference, deployed in the ap-south-1 region for low latency)
>     
> *   **Frontend:** React or Next.js with Tailwind CSS. (Design requirement: A highly polished, premium dark-themed UI with an Apple-inspired aesthetic, featuring smooth animations).
>     
> 
> **Critical Infrastructure Constraint (AWS Free Tier Optimization):** I am already running another active SaaS project on my AWS account. This architecture **must** remain strictly within the **AWS Free Tier** limits to avoid incurring costs.
> 
> *   Design the Lambda functions to optimize execution time, minimize memory footprints, and avoid cold-start overhead that inflates compute costs.
>     
> *   Keep the memory allocation well within the 1 Million free requests and 400,000 GB-seconds per month limit, taking multi-app resource sharing into account.
>     
> *   If a database or cache is needed, prioritize zero-cost options like AWS DynamoDB (within its 25 WCU/RCU free limit) or a local SQLite instance managed efficiently on the host server.
>     
> 
> **Specific UI/UX Architecture Requirement (The Dashboard):** The main landing page must be a centralized dashboard featuring a responsive grid layout of all available services.
> 
> *   **Hover State:** When a user hovers over a service card, it should gracefully transition to display a layman-friendly description of what the tool does and exactly when a user would need it.
>     
> *   **Click State:** Upon clicking a card, the application should transition the user to that specific tool's interface. Please recommend the best modern architectural approach for this (e.g., Next.js App Router dynamic routes, React Router full-page transitions, or specialized SPA layouts) to maintain state and keep the app feeling instantaneous.
>     
> 
> **What I Need:** Please provide a comprehensive, step-by-step technical blueprint to build this. Break down the following:
> 
> 1.  **System Architecture & Compute Offloading:** How does FastAPI route tasks to Lambda, and how are partial results streamed back via WebSockets?
>     
> 2.  **Free-Tier Cost Optimization Strategy:** Specific tips on structuring the Lambda functions, layer sizes (keeping deployment packages under 50MB/250MB unzipped), and memory tuning to prevent this project from pushing my AWS account over the free limits.
>     
> 3.  **Dashboard UI Component Design:** Provide the React component structure for the grid layout, specifically addressing how to handle the hover animations and layman descriptions cleanly without cluttering the DOM.
>     
> 4.  **Algorithm & AI Strategy:** Recommend the best Python libraries (e.g., NumPy, SciPy, PuLP) to package inside the AWS Lambda layers while keeping the package size optimized.
>     
> 5.  **Core Code Snippets:** Provide production-grade code for the FastAPI WebSocket router interacting asynchronously with AWS Lambda (using aiobotocore or boto3), and a snippet for the animated Dashboard Grid Card component in React/Tailwind.
>     
> 
> Keep the tone highly technical, concise, and focused on best practices for scalability, ultra-lean resource management, and premium UX.