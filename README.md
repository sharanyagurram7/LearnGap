LearnGap (GapGuru) 🎓

An AI-powered learning gap identification and personalized learning recommendation platform.

📌 Overview

LearnGap, also known as GapGuru, is a student-focused learning platform designed to identify knowledge gaps, analyze academic performance, and recommend relevant learning resources.

The application uses student scores, topic information, prerequisite relationships, and educational resources to help students understand which concepts they need to improve and what they should learn next.

🎯 Objectives

- Identify topics where students need improvement.
- Analyze student quiz scores and academic performance.
- Identify prerequisite concepts that students should learn first.
- Recommend relevant learning resources.
- Help students follow a structured learning path.
- Support more personalized and effective learning.

✨ Key Features

- Performance Analysis: Analyze scores across subjects and topics.
- Learning Gap Identification: Identify topics that may require additional practice.
- Prerequisite Mapping: Represent relationships between concepts to establish a logical learning order.
- Resource Recommendations: Connect learning topics with relevant educational resources.
- Question Bank: Store questions associated with learning topics.
- Data-Driven Insights: Use structured academic data to support learning recommendations.

🛠️ Technology Stack

The project uses the following technologies and data sources, subject to the final application configuration:

- Frontend: React and Vite
- Backend / Database Services: Supabase
- Database: PostgreSQL through Supabase
- Programming Language: JavaScript
- Data Sources: CSV datasets

📂 Project Data

The project includes the following datasets:

Dataset| Purpose
"scores.csv"| Stores student scores, subjects, topics, and quiz dates.
"resources.csv"| Stores learning resources associated with topics.
"questions.csv"| Stores questions used for learning or assessment.
"prerequisites.csv"| Stores prerequisite relationships between concepts.

🗄️ Database Structure

The Supabase database includes the following tables:

- "scores" — Student performance records.
- "resources" — Educational resource information.
- "questions" — Topic-related questions.
- "prerequisites" — Relationships between prerequisite and dependent concepts.

These tables provide structured data for analyzing learning performance and supporting personalized recommendations.

⚙️ Getting Started

Prerequisites

Install the following software:

- Node.js
- npm
- Git (optional, for version control)

You will also need access to the configured Supabase project.

1. Clone the repository

git clone <YOUR_REPOSITORY_URL>

2. Open the project directory

cd learngap

Use the actual repository folder name if it differs.

3. Install dependencies

npm install

4. Configure environment variables

Create a ".env" file in the appropriate project directory and add the Supabase configuration expected by the application.

For example, a Vite frontend commonly uses:

VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_key

Use the variable names expected by your existing source code. Never commit secret keys or passwords to a public repository.

5. Start the development server

npm run dev

Open the local URL displayed in the terminal, usually:

"http://localhost:5173"

🔄 How It Works

1. Collect Data: Load student scores, questions, learning resources, and prerequisite information.
2. Analyze Performance: Examine scores for different subjects and topics.
3. Identify Learning Gaps: Determine which topics may need additional attention.
4. Check Prerequisites: Identify foundational concepts that should be understood before advanced topics.
5. Recommend Resources: Connect topics that need improvement with relevant educational materials.
6. Support Learning: Help students focus on the concepts and resources most relevant to their learning needs.

🚀 Future Enhancements

- AI-powered personalized learning recommendations.
- Visual dashboards for student performance.
- Topic-wise progress tracking.
- Interactive prerequisite graphs.
- Adaptive quizzes based on student performance.
- Learning progress reports and personalized study plans.

🎓 Project Outcome

LearnGap aims to make learning more structured and personalized by connecting student performance data with topic dependencies and educational resources.

The long-term goal is to help students recognize knowledge gaps, strengthen foundational concepts, and progress toward more advanced topics with confidence.

👩‍💻 Project Status

Under development.

📄 License

Add an appropriate license before distributing the project publicly.
