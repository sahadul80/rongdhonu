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
    patterns: ["service", "services", "offer", "do", "work", "সেবা", "সেবাসমূহ", "কাজ"],
    en: `We currently offer ${SERVICES.map((service) => service.name).join(", ")}. We work across residential, commercial and renovation projects. If you tell me what you want to change, I can point you toward the most suitable service.`,
    bn: `আমরা বর্তমানে ${SERVICES.map((service) => service.name).join(", ")} সেবা দিচ্ছি। আমরা আবাসিক, বাণিজ্যিক ও রেনোভেশন প্রজেক্টে কাজ করি। আপনি কী পরিবর্তন করতে চান জানালে আপনার জন্য উপযুক্ত সেবাটি বেছে নিতে সাহায্য করতে পারি।`,
  },
  {
    patterns: ["price", "pricing", "cost", "budget", "quote", "quotation", "estimate", "দাম", "মূল্য", "খরচ", "বাজেট", "কোটেশন"],
    en: "We provide tailored quotations because the price depends on the service, surface condition, area and finish. If you share the type of space, approximate area and the work you have in mind, our team can assess the requirement.",
    bn: "আমরা কাজের ধরন অনুযায়ী কাস্টম কোটেশন দিই। মূল্য নির্ভর করে সেবা, সারফেসের অবস্থা, কাজের এলাকা ও ফিনিশের ওপর। আপনার স্পেসের ধরন, আনুমানিক আয়তন এবং কী ধরনের কাজ চান তা জানালে আমাদের টিম প্রয়োজনটি মূল্যায়ন করতে পারবে।",
  },
  {
    patterns: ["process", "procedure", "steps", "how", "start", "begin", "প্রক্রিয়া", "ধাপ", "শুরু"],
    en: `Our published process is ${PROCESS_STEPS.map((step) => step.title).join(" → ")}. It starts with understanding the space and requirements, followed by planning, preparation, execution and a final review.`,
    bn: "আমাদের কাজের প্রক্রিয়ার ধাপগুলো হলো: পরামর্শ → রং ও ফিনিশ পরিকল্পনা → সারফেস প্রস্তুতি → কাজ সম্পাদন → চূড়ান্ত পর্যালোচনা। প্রথমে আপনার প্রয়োজন ও স্পেস বোঝা হয়, এরপর পরিকল্পনা, প্রস্তুতি, কাজ সম্পাদন এবং শেষে চূড়ান্ত পর্যালোচনা করা হয়।",
  },
  {
    patterns: ["painting", "paint", "wall paint", "পেইন্ট", "রং", "দেয়াল"],
    en: "Yes. General painting is one of our services, and we also offer coordinated wall colour schemes. If you describe the room, surface and the look you want, I can help narrow down the right direction.",
    bn: "হ্যাঁ। জেনারেল পেইন্টিং আমাদের অন্যতম প্রধান সেবা। আমরা সমন্বিত দেয়ালের রং ও কালার স্কিমও দিই। ঘরের ধরন, সারফেস এবং আপনি কেমন লুক চান তা জানালে উপযুক্ত দিকনির্দেশনা দিতে পারি।",
  },
  {
    patterns: ["colour", "color", "scheme", "design", "কালার", "রং", "স্কিম", "ডিজাইন"],
    en: "We help with wall colour selection and coordinated colour schemes designed around the character of the space. Tell me whether it is a home, office, shop or another space and what mood you want.",
    bn: "আমরা স্পেসের বৈশিষ্ট্য অনুযায়ী দেয়ালের রং নির্বাচন ও সমন্বিত কালার স্কিমে সহায়তা করি। এটি বাড়ি, অফিস, দোকান নাকি অন্য কোনো স্পেস এবং আপনি কেমন পরিবেশ চান তা জানালে পরামর্শ দিতে পারি।",
  },
  {
    patterns: ["skim", "coat", "surface", "uneven", "wall preparation", "স্কিম", "কোট", "সারফেস", "প্রস্তুতি"],
    en: "Skim coat work is available for smoother surface preparation before the final decorative finish, particularly where walls are uneven or imperfect.",
    bn: "চূড়ান্ত ফিনিশিংয়ের আগে দেয়াল মসৃণ করতে স্কিম কোটের কাজ করা হয়, বিশেষ করে যেখানে দেয়াল অসমান বা ত্রুটিপূর্ণ।",
  },
  {
    patterns: ["marble", "মার্বেল"],
    en: "Marble painting is available as a decorative, premium-style finish for feature walls and statement interiors.",
    bn: "ফিচার ওয়াল ও বিশেষ ইন্টেরিয়রের জন্য প্রিমিয়াম ডেকোরেটিভ ফিনিশ হিসেবে মার্বেল পেইন্টিং করা হয়।",
  },
  {
    patterns: ["ambrose", "অ্যামব্রোস"],
    en: "Ambrose painting is one of our decorative finishing services for customized interior treatments and premium surfaces.",
    bn: "অ্যামব্রোস পেইন্টিং আমাদের ডেকোরেটিভ ফিনিশিং সেবার একটি অংশ, যা কাস্টমাইজড ইন্টেরিয়র ট্রিটমেন্ট ও প্রিমিয়াম সারফেসের জন্য উপযোগী।",
  },
  {
    patterns: ["texture", "feature wall", "feature walls", "টেক্সচার", "ফিচার ওয়াল"],
    en: "We offer texture work to add depth and visual interest to walls and selected surfaces, especially feature or accent areas.",
    bn: "দেয়াল ও নির্বাচিত সারফেসে গভীরতা ও ভিজ্যুয়াল আকর্ষণ যোগ করতে আমরা টেক্সচার কাজ করি, বিশেষ করে ফিচার বা অ্যাকসেন্ট এরিয়ায়।",
  },
  {
    patterns: ["address", "location", "office", "where", "ঠিকানা", "লোকেশন", "অফিস", "কোথায়"],
    en: `Our listed address is ${BRAND.address}.`,
    bn: `আমাদের তালিকাভুক্ত ঠিকানা হলো ${BRAND.address}।`,
  },
  {
    patterns: ["phone", "call", "contact", "number", "ফোন", "কল", "যোগাযোগ", "নম্বর"],
    en: `You can use the call button in the chat widget to contact ${BRAND.shortName}. The website currently lists ${BRAND.phone}.`,
    bn: `চ্যাট উইজেটের কল বাটন ব্যবহার করে ${BRAND.shortName}-এর সাথে যোগাযোগ করতে পারেন। ওয়েবসাইটে দেওয়া ফোন নম্বর হলো ${BRAND.phone}।`,
  },
  {
    patterns: ["email", "mail", "ইমেইল", "মেইল"],
    en: `The listed contact email is ${BRAND.email}.`,
    bn: `যোগাযোগের জন্য দেওয়া ইমেইল হলো ${BRAND.email}।`,
  },
  {
    patterns: ["hello", "hi", "hey", "assalam", "good morning", "good afternoon", "good evening", "হ্যালো", "হাই", "আসসালাম"],
    en: "Hello! 👋 Nice to meet you. What are you planning to renovate, paint or transform? I can help you work through the options.",
    bn: "হ্যালো! 👋 আপনাকে স্বাগতম। আপনি কী রেনোভেট, পেইন্ট বা রূপান্তর করতে চান? আপনার প্রয়োজন অনুযায়ী অপশনগুলো বুঝে নিতে আমি সাহায্য করতে পারি।",
  },
] as const;

function getWebsiteAnswer(message: string, language: "en" | "bn") {
  const q = normalize(message);
  if (!q) return null;

  let best: { score: number; answer: string } | null = null;
  for (const item of websiteKnowledge) {
    const score = item.patterns.reduce((total, pattern) => {
      const p = normalize(pattern);
      return total + (q.includes(p) ? (p.length > 5 ? 2 : 1) : 0);
    }, 0);

    if (score > 0 && (!best || score > best.score)) {
      best = { score, answer: item[language] };
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

async function translateToBengali(text: string): Promise<string> {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return clean;
  try {
    const url = new URL("https://translate.googleapis.com/translate_a/single");
    url.searchParams.set("client", "gtx");
    url.searchParams.set("sl", "auto");
    url.searchParams.set("tl", "bn");
    url.searchParams.set("dt", "t");
    url.searchParams.set("q", clean);
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) return clean;
    const data = await response.json();
    const translated = Array.isArray(data?.[0])
      ? data[0].map((part: unknown) => Array.isArray(part) && typeof part[0] === "string" ? part[0] : "").join("").trim()
      : "";
    return translated || clean;
  } catch {
    return clean;
  }
}

function humanizeWebAnswer(answer: string, query: string, language: "en" | "bn") {
  const clean = answer.replace(/\s+/g, " ").trim();
  if (language === "bn") {
    if (!clean) return `"${query}" সম্পর্কে নির্ভরযোগ্য কোনো ওয়েব উত্তর খুঁজে পাইনি।`;
    return `আমাদের ওয়েবসাইটের তথ্যের মধ্যে এটি পাইনি, তাই ওয়েবে খুঁজেছি। যা পাওয়া গেছে: ${clean}`;
  }
  if (!clean) return `I couldn't find a reliable web answer for "${query}".`;
  return `I couldn't find that in our website information, so I checked the web. Here's what I found: ${clean}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const history = Array.isArray(body?.history) ? (body.history as ChatHistoryItem[]) : [];
    const language = body?.language === "bn" ? "bn" : "en";

    if (!message) {
      return NextResponse.json({ error: language === "bn" ? "বার্তা প্রয়োজন।" : "Message is required." }, { status: 400 });
    }

    const websiteAnswer = getWebsiteAnswer(message, language);
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
        const webAnswer = language === "bn"
          ? await translateToBengali(webResult.answer)
          : webResult.answer;
        return NextResponse.json({
          answer: language === "bn"
            ? `আমাদের ওয়েবসাইটে তথ্যটি পাওয়া যায়নি, তাই ওয়েবে খুঁজেছি। যা পাওয়া গেছে: ${webAnswer}`
            : humanizeWebAnswer(webResult.answer, message, language),
          webSearch: true,
          sources: webResult.sources,
        });
      }
    } catch {
      // Search is intentionally a fallback. The assistant still responds gracefully below.
    }

    return NextResponse.json({
      answer: language === "bn"
        ? "এই প্রশ্নের নির্ভরযোগ্য উত্তর দেওয়ার মতো পর্যাপ্ত তথ্য আমাদের ওয়েবসাইটে নেই। আপনি কী করতে চান সে সম্পর্কে একটু বিস্তারিত জানালে আমি আপনাকে উপযুক্ত দিকনির্দেশনা দিতে পারি, অথবা সরাসরি আমাদের টিমের সঙ্গে যোগাযোগ করতে পারেন।"
        : "I don't have enough information on the website to answer that confidently yet. If you tell me a little more about what you're trying to achieve, I can help you narrow it down or you can contact our team directly.",
      webSearch: false,
      sources: [],
    });
  } catch {
    return NextResponse.json({ error: "Unable to process the chat message." }, { status: 500 });
  }
}
