# Zehnix

**Learning that thinks about you.**

Zehnix is an education web app that combines AI-generated quizzes, automatic grading of short answers, and an early-warning dashboard that helps teachers spot students who are falling behind. It was built in a hackathon-style, time-boxed sprint.

---

## Features

| Feature | Description | Status |
| --- | --- | --- |
| **Personalised quizzes** | Teachers describe a topic and the AI generates a quiz (multiple-choice and short-answer) in English, Urdu, Sindhi or Pashto. | Done |
| **Automatic short-answer grading** | Short answers are graded by the AI against a rubric, with written feedback and a teacher override. | Done |
| **Dropout early-warning dashboard** | Each student gets a risk score from recent activity, score trend, missed quizzes and weekly engagement, with plain-language reasons and a "send nudge" action. | Done |
| **Multilingual tutor** | A chat tutor that explains mistakes in the student's own language, with right-to-left support for Urdu, Sindhi and Pashto. | Planned |
| **Adaptive practice** | Practice sets that target each student's weakest topics. | Planned |

### For teachers
- Create classes and share a 6-character join code
- Generate quizzes with AI (topic, difficulty, language, number of questions)
- See every student's submissions, grade pending answers, and override marks
- Review the risk dashboard and send a nudge to students who need support

### For students
- Join a class with a code
- Take quizzes one question at a time
- Get instant results for multiple-choice and AI feedback for short answers
- Track average score and topics mastered

---

## Tech stack

- **Framework:** Next.js 15 (App Router), React, TypeScript
- **Styling:** Tailwind CSS, GSAP (landing page animation), lucide-react (icons)
- **Backend:** Supabase (Auth, Postgres, Row Level Security) via `@supabase/ssr`
- **AI:** any OpenAI-compatible chat API, called with plain `fetch` (set up for Groq by default; also works with OpenRouter and similar providers)

---

## Getting started

### Prerequisites
- Node.js 18.18 or newer
- A free [Supabase](https://supabase.com) project
- An API key from an OpenAI-compatible LLM provider (for example [Groq](https://console.groq.com))

### 1. Clone and install

```bash
git clone https://github.com/<your-username>/zehnix.git
cd zehnix
npm install
```

### 2. Set up the database

In your Supabase project, open the **SQL editor** and run `zehnix_schema.sql`. It creates the tables, row-level security policies, the signup trigger and the `join_class` function.

Then, in **Authentication → Providers → Email**, turn **off** "Confirm email" so new accounts can sign in immediately.

### 3. Add environment variables

Create a file named `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_API_KEY=your_llm_api_key
LLM_MODEL=openai/gpt-oss-120b
```

> Never commit `.env.local`. Make sure it is listed in `.gitignore`.

Model names change over time. If you get a "model not found" error, pick a current model ID from your provider's dashboard and update `LLM_MODEL`.

### 4. Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Try it out

1. Register a **teacher** account and create a class. Copy the join code.
2. Open the **Quizzes** tab and generate a quiz.
3. In a private window, register a **student** account and join with the code.
4. Take the quiz, then check the results page and the teacher's **Submissions** and **Risk** tabs.

---

## How the risk score works

The risk dashboard is calculated live from each student's attempts. Scores run from 0 to 100:

| Signal | Weight |
| --- | --- |
| Days since last activity | 35% |
| Score trend over the last 3 graded attempts | 30% |
| Quizzes not attempted | 20% |
| Drop in weekly engagement | 15% |

Levels: **0-39** low, **40-69** medium, **70-100** high. Each student shows the top reasons behind their score, such as "No activity for 9 days".

---

## Project structure

```
app/
  (auth)/               login, register and auth actions
  teacher/              teacher dashboard, classes, quizzes, submissions, risk
  student/              student dashboard, classes, quiz runner, results
  api/quizzes/generate/ AI quiz generation route
components/
  common/               shared UI (for example the grade button)
  dashboard/            dashboard header
  student/              quiz runner, join form
  teacher/              class dialogs, quiz generator, nudge dialog
lib/
  llm.ts                LLM client (OpenAI-compatible)
  grading.ts            short-answer grading and mastery updates
  quizSchema.ts         validation of AI-generated quizzes
  risk.ts               risk scoring
  supabase/             Supabase server client
```

---

## Security notes

- Row Level Security keeps students limited to their own data. Teachers can only see their own classes and the students enrolled in them.
- Quiz answers are never sent to the student's browser, and grading runs on the server.
- Keep your Supabase service-role key and LLM key out of the repository. Rotate any key that has ever been shared publicly.

---

## Team

Created by **Vishal Dewani**, **Ali Mehdi** and **Abdul Hameed**.
