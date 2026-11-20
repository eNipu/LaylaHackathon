export const EXAMPLE = "A tool that helps students turn leftover ingredients into a quick, affordable dinner.";
export const DEMO_RESULT = `Your first-user launch plan

1. Start with one specific person.
Ask five students what is in their fridge and what stops them cooking tonight.

2. Deliver one useful result.
Give them a simple recipe using what they already have. Let them try it before asking for an account.

3. Go where they already are.
Share a short before-and-after in one student group. Use a unique UTM link for each post.

4. Close the loop.
Ask: “Would you send this to a flatmate?” Measure unique people who actually finish, not clicks or total generations.`;
export type GenerationChunk =
  | { type: "text"; text: string }
  | { type: "done"; mode: "live" }
  | { type: "fallback"; text: string };
