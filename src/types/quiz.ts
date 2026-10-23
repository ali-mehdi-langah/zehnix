// Safe to send to the browser: no correct answers, model answers or rubrics.
export type ClientQuestion = {
  id: string;
  type: "mcq" | "short";
  prompt: string;
  options: string[];
  topic: string;
};