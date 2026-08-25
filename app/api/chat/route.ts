import { NextResponse } from "next/server";
import { BRAND } from "../../data/brand";
import { SERVICES } from "../../data/services";
import { PROCESS_STEPS } from "../../data/content";

type ChatHistoryItem = { role?: "user" | "bot"; content?: string };
type Source = { title: string; url: string };

const normalize = (value: string) =>
  value.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();

const websiteKnowledge = [
  {
    patterns: ["service", "services", "offer", "do", "work"],
    answer: `We currently offer ${SERVICES.map((service) => service.name).join(", ")}. We work across residential, commercial and renovation projects. If you tell me what you want to change, I can point you toward the most suitable service.`,
  },
  {
    patterns: ["price", "pricing", "cost", "budget", "quote", "quotation", "estimate"],
    answer:
      "We provide tailored quotations because the price depends on the service, surface condition, area and finish. If you share the type of space, approximate area and the work you have in mind, our team can assess the requirement.",
  },
  {
    patterns: ["process", "procedure", "steps", "how", "start", "begin"],
    answer: `Our published process is ${PROCESS_STEPS.map((step) => step.title).join(" → ")}. It starts with understanding the space and requirements, followed by planning, preparation, execution and a final review.`,
  },
  {
    patterns: ["painting", "paint", "wall paint"],
    answer:
      "Yes. General painting is one of our services, and we also offer coordinated wall colour schemes. If you describe the room, surface and the look you want, I can help narrow down the right direction.",
  },
  {
    patterns: ["colour", "color", "scheme", "design"],
    answer:
      "We help with wall colour selection and coordinated colour schemes designed around the character of the space. Tell me whether it is a home, office, shop or another space and what mood you want.",
  },
  {
    patterns: ["skim", "coat", "surface", "uneven", "wall preparation"],
    answer:
      "Skim coat work is available for smoother surface preparation before the final decorative finish, particularly where walls are uneven or imperfect.",
  },
  {
    patterns: ["marble"],
    answer: "Marble painting is available as a decorative, premium-style finish for feature walls and statement interiors.",
  },
  {
    patterns: ["ambrose"],
    answer: "Ambrose painting is one of our decorative finishing services for customized interior treatments and premium surfaces.",
  },
  {
    patterns: ["texture", "feature wall", "feature walls"],
    answer:
      "We offer texture work to add depth and visual interest to walls and selected surfaces, especially feature or accent areas.",
  },
  {
    patterns: ["address", "location", "office", "where"],
    answer: `Our listed address is ${BRAND.address}.`,
  },
  {
    patterns: ["phone", "call", "contact", "number"],
    answer: `You can use the call button in the chat widget to contact ${BRAND.shortName}. The website currently lists ${BRAND.phone}.`,
  },
  {
    patterns: ["email", "mail"],
    answer: `The listed contact email is ${BRAND.email}.`,
  },
  {
    patterns: ["hello", "hi", "hey", "assalam", "good morning", "good afternoon", "good evening"],
    answer:
      "Hello! 👋 Nice to meet you. What are you planning to renovate, paint or transform? I can help you work through the options.",
  },
];

function getWebsiteAnswer(message: string) {
  const q = normalize(message);
  if (!q) return null;

  let best: { score: number; answer: string } | null = null;
  for (const item of websiteKnowledge) {
    const score = item.patterns.reduce((total, pattern) => {
      const p = normalize(pattern);
      return total + (q.includes(p) ? (p.length > 5 ? 2 : 1) : 0);
    }, 0);

    if (score > 0 && (!best || score > best.score)) {
      best = { score, answer: item.answer };
    }
  }

  return best?.answer ?? null;
}

async function searchWeb(query: string): Promise<{ answer: string; sources: Source[] } | null> {
  const url = new URL("https://api.duckduckgo.com/");
  url.searchParams.set("q", `${query} ${BRAND.name}`);
  url.searchParams.set("format", "json");
  url.searchParams.set("no_html", "1");
  url.searchParams.set("no_redirect", "1");
  url.searchParams.set("skip_disambig", "1");

  const response = await fetch(url, {
    headers: { "User-Agent": "RongDhonuWebsiteAssistant/1.0" },
    next: { revalidate: 900 },
  });

  if (!response.ok) return null;

  const data = await response.json();
  const sources: Source[] = [];

  if (data.AbstractURL && data.AbstractText) {
    sources.push({ title: data.Heading || "Web result", url: data.AbstractURL });
  }

  for (const topic of Array.isArray(data.RelatedTopics) ? data.RelatedTopics : []) {
    if (sources.length >= 3) break;
    if (topic?.FirstURL && topic?.Text) {
      sources.push({ title: topic.Text, url: topic.FirstURL });
    }
    if (Array.isArray(topic?.Topics)) {
      for (const nested of topic.Topics) {
        if (sources.length >= 3) break;
        if (nested?.FirstURL && nested?.Text) {
          sources.push({ title: nested.Text, url: nested.FirstURL });
        }
      }
    }
  }

  const answer = typeof data.AbstractText === "string" ? data.AbstractText.trim() : "";
  if (!answer && sources.length === 0) return null;

  return {
    answer:
      answer ||
      "I found a few web results related to your question. The most relevant links are shown below.",
    sources,
  };
}

function humanizeWebAnswer(answer: string, query: string) {
  const clean = answer.replace(/\s+/g, " ").trim();
  if (!clean) return `I couldn't find a reliable web answer for "${query}".`;
  return `I couldn't find that in our website information, so I checked the web. Here's what I found: ${clean}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const history = Array.isArray(body?.history) ? (body.history as ChatHistoryItem[]) : [];

    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const websiteAnswer = getWebsiteAnswer(message);
    if (websiteAnswer) {
      return NextResponse.json({
        answer: websiteAnswer,
        webSearch: false,
        sources: [],
      });
    }

    const previousUserMessage =
      history
        .slice(0, -1)
        .reverse()
        .find((item) => item.role === "user" && typeof item.content === "string")?.content || "";

    const contextualQuery = previousUserMessage
      ? `${previousUserMessage}. Follow-up question: ${message}`
      : message;

    try {
      const webResult = await searchWeb(contextualQuery);
      if (webResult) {
        return NextResponse.json({
          answer: humanizeWebAnswer(webResult.answer, message),
          webSearch: true,
          sources: webResult.sources,
        });
      }
    } catch {
      // Search is intentionally a fallback. The assistant still responds gracefully below.
    }

    return NextResponse.json({
      answer:
        "I don't have enough information on the website to answer that confidently yet. If you tell me a little more about what you're trying to achieve, I can help you narrow it down or you can contact our team directly.",
      webSearch: false,
      sources: [],
    });
  } catch {
    return NextResponse.json({ error: "Unable to process the chat message." }, { status: 500 });
  }
}
