import { avatar } from "@/lib/media";

export interface ChatMessage {
  /** Stable id of the message. */
  id: string;
  /** Who wrote it. */
  role: "user" | "assistant";
  /** The message text. Blank lines split paragraphs. */
  text: string;
  /** Where an assistant reply is: waiting to start, arriving, finished, or stopped early. User messages are always "done". */
  state: "thinking" | "streaming" | "done" | "stopped";
}

export interface ChatConversation {
  /** Stable id of the conversation. */
  id: string;
  /** Title shown in the list and above the thread. */
  title: string;
  /** Short label of when it last changed: "Now", "2h", "Yesterday". */
  updated: string;
  /** Messages, oldest first. */
  messages: ChatMessage[];
}

export interface ChatSuggestion {
  /** Short heading of the card. */
  title: string;
  /** The prompt the card sends. */
  prompt: string;
}

export interface ChatUser {
  /** Name shown at the foot of the conversation list. */
  name: string;
  /** Second line under the name, such as a plan or an email. */
  detail?: string;
  /** Avatar image address. */
  avatar?: string;
}

const done = (id: string, role: ChatMessage["role"], text: string): ChatMessage => ({ id, role, text, state: "done" });

export const sampleUser: ChatUser = { name: "Emma Collins", detail: "Product design", avatar: avatar("emma-collins") };

export const sampleConversations: ChatConversation[] = [
  {
    id: "release-notes",
    title: "Release notes for 2.4",
    updated: "12m",
    messages: [
      done("r1", "user", "Turn these changes into release notes: saved filters, CSV export for reports, and the fix for the timezone bug in scheduled emails."),
      done("r2", "assistant", "Here is a draft for 2.4.\n\nSaved filters: build a view once and come back to it from the sidebar. Filters stay private until you share them.\n\nCSV export: every report now has an Export button. Large exports are emailed to you when they are ready.\n\nFixed: scheduled emails went out an hour early for teams in time zones with daylight saving. They now follow the workspace time zone."),
      done("r3", "user", "Shorter, and lead with the export. That is the one customers asked for."),
      done("r4", "assistant", "Version 2.4 is out.\n\nExport any report to CSV, the most requested feature this quarter. You can also save filters as views, and scheduled emails now respect your time zone all year round."),
    ],
  },
  {
    id: "retention-sql",
    title: "SQL for weekly retention",
    updated: "2h",
    messages: [
      done("s1", "user", "How do I get week over week retention from an events table with user_id and created_at?"),
      done("s2", "assistant", "Group every user into the week of their first event, then count how many of them have an event in each later week.\n\nIn practice that is two steps: a first query that finds each user's starting week, and a second that joins the events back to it and counts distinct users per pair of starting week and weeks since. Dividing by the size of the starting group gives the retention rate."),
    ],
  },
  {
    id: "onboarding-names",
    title: "Rename the onboarding steps",
    updated: "Yesterday",
    messages: [
      done("o1", "user", "Our onboarding steps are called Setup 1, Setup 2 and Setup 3. Suggest names that say what happens in each."),
      done("o2", "assistant", "Name each step after what the person ends up with, not after its position.\n\nConnect your data, Invite your team, and Send your first report would tell someone what is left before they even open the step."),
    ],
  },
];

export const sampleSuggestions: ChatSuggestion[] = [
  { title: "Write release notes", prompt: "Write release notes for a small update: dark mode, faster search, and two bug fixes." },
  { title: "Explain a query", prompt: "Explain what a LEFT JOIN does, with a short example about customers and orders." },
  { title: "Plan my week", prompt: "Help me plan a week with three deadlines: a design review, a demo and a hiring loop." },
  { title: "Rewrite a message", prompt: "Rewrite this so it sounds friendly but firm: we cannot move the deadline again." },
];

const matched: { keywords: string[]; variants: string[] }[] = [
  {
    keywords: ["release notes", "changelog"],
    variants: [
      "Here is a first pass.\n\nDark mode: the whole app now follows your system theme, with a switch in settings if you prefer to choose.\n\nFaster search: results appear as you type, and recent searches are one key away.\n\nFixed: attachments no longer disappear from drafts, and the calendar opens on the right week again.",
      "A tighter version.\n\nNew this week: dark mode, and search that keeps up with your typing. We also fixed disappearing draft attachments and the calendar opening on the wrong week.",
    ],
  },
  {
    keywords: ["join", "sql", "query"],
    variants: [
      "A LEFT JOIN keeps every row from the first table and adds matching rows from the second. Where nothing matches, the columns from the second table come back empty.\n\nWith customers on the left and orders on the right, you get every customer, including the ones who have never ordered. An inner join would drop those people, which is why LEFT JOIN is the usual choice for questions like who has not bought anything yet.",
      "Think of it as: start with the full list on the left, then look things up on the right.\n\nEvery customer appears at least once. Customers with three orders appear three times, and customers with none appear once with the order columns empty.",
    ],
  },
  {
    keywords: ["plan", "week", "deadline"],
    variants: [
      "Give each deadline its own day and protect the mornings.\n\nMonday and Tuesday: prepare the design review while your energy is highest, and hold it Tuesday afternoon. Wednesday and Thursday morning: build and rehearse the demo. Thursday afternoon and Friday: run the hiring loop, since interviews are fixed slots that are hard to move.\n\nKeep one hour free every afternoon. Something will slip, and that hour is where it lands.",
      "Order them by how hard they are to move.\n\nThe hiring loop depends on other people's calendars, so place it first. Put the demo the day before its audience needs it, and fit the design review prep into the mornings that are left.",
    ],
  },
  {
    keywords: ["rewrite", "friendly", "firm", "tone"],
    variants: [
      "Try this.\n\nThanks for flagging this early. We have already moved the date once, and moving it again would push the launch into the holidays, so we need to hold it where it is. If something specific is at risk, tell me today and we will find a way to cut scope instead.",
      "A shorter option.\n\nI hear you, and I wish we had more room. The date has to stay, but the scope does not: tell me what feels at risk and we will trim it together.",
    ],
  },
];

const general = [
  "Here is how I would approach it.\n\nStart by writing down what a good result looks like in one sentence. Most of the back and forth on a task like this comes from two people picturing different outcomes.\n\nThen split the work into the part you can finish today and the part that needs someone else. Send the second part now, so it is moving while you do the first.",
  "Short answer: yes, with one caveat.\n\nIt works well while the list stays small. Once it grows past a few hundred items you will want to load it in pages, because the first render is where people notice the wait.",
  "There are two reasonable options.\n\nThe simple one is to do it by hand this week and take notes on what was tedious. The thorough one is to automate it now. I would pick the simple one: after a single round you will know exactly which part is worth automating.",
];

/** The built-in stand-in for a model: picks a canned reply by keyword, or rotates through general ones. Nothing leaves the page. */
export function sampleReply(prompt: string, attempt: number): string {
  const text = prompt.toLowerCase();
  const match = matched.find(entry => entry.keywords.some(keyword => text.includes(keyword)));
  if (match) return match.variants[attempt % match.variants.length]!;
  return general[(prompt.length + attempt) % general.length]!;
}
