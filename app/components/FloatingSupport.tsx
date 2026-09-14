"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  Bot,
  CheckCheck,
  Globe2,
  MessageCircle,
  Phone,
  RotateCcw,
  Send,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { BRAND } from "../data/brand";
import { useLanguage } from "./LanguageContext";

type Source = { title: string; url: string };
type Message = {
  id: string;
  from: "user" | "bot";
  text: string;
  time: string;
  sources?: Source[];
  webSearch?: boolean;
};

const QUICK_REPLIES = {
  en: ["What services do you offer?", "How can I get a quotation?", "How long does a project take?"],
  bn: ["আপনারা কী কী সেবা দেন?", "আমি কীভাবে কোটেশন পাব?", "একটি প্রজেক্ট কত সময় নেয়?"],
} as const;

const initialMessage = (language: "en" | "bn"): Message => ({
  id: "welcome",
  from: "bot",
  text: language === "bn"
    ? "হ্যালো! 👋 আমি রংধনু অ্যাসিস্ট্যান্ট। আমাদের সেবা, ফিনিশিং, কাজের প্রক্রিয়া ও প্রজেক্ট সম্পর্কে আপনার প্রশ্নের উত্তর দিতে পারি। এই ওয়েবসাইটে তথ্য না থাকলে প্রয়োজনে ওয়েবে খুঁজেও আপনাকে সাহায্য করব।"
    : "Hi! 👋 I’m the Rong Dhonu assistant. I can answer questions about our services, finishes, process and project enquiries. If something isn’t covered on this website, I can also look it up on the web for you.",
  time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
});

export default function FloatingSupport() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([initialMessage("en")]);
  const { t, language } = useLanguage();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, open]);

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  useEffect(() => {
    setMessages((current) => current.map((message, index) =>
      index === 0 && message.id === "welcome" ? initialMessage(language) : message
    ));
  }, [language]);

  const resetChat = () => {
    setTyping(false);
    setMessages([initialMessage(language)]);
  };

  const send = async (forcedText?: string) => {
    const text = (forcedText ?? input).trim();
    if (!text || typing) return;

    const now = new Date();
    const userMessage: Message = {
      id: `${Date.now()}-user`,
      from: "user",
      text,
      time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: [...messages, userMessage]
            .slice(-8)
            .map(({ from, text: value }) => ({ role: from, content: value })),
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to answer right now.");
      }

      const botMessage: Message = {
        id: `${Date.now()}-bot`,
        from: "bot",
        text: data.answer,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        sources: data.sources,
        webSearch: data.webSearch,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          from: "bot",
          text: language === "bn"
            ? "দুঃখিত—এই মুহূর্তে উত্তর সেবায় সংযোগ করা যাচ্ছে না। আবার চেষ্টা করুন, অথবা সরাসরি আমাদের টিমে কল করুন; আমরা আপনাকে সাহায্য করব।"
            : "I’m sorry — I couldn’t reach my answer service just now. You can try again, or call our team directly and we’ll help you.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void send();
  };

  const phone = BRAND.phone.replace(/[^0-9+]/g, "");

  return (
    <div className="fixed bottom-4 right-4 z-[70] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <section
          aria-label="Rong Dhonu chat support"
          className="support-chat rainbow-ring w-[calc(100vw-2rem)] overflow-hidden rounded-[1.35rem] border border-border bg-background/95 shadow-2xl backdrop-blur-xl sm:w-[400px]"
        >
          <div className="relative overflow-hidden px-4 py-3.5 text-white">
            <div className="absolute inset-0 bg-rainbow animate-rainbow" />
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/15 shadow-inner backdrop-blur">
                  <Bot size={20} />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{language === "bn" ? "রংধনু অ্যাসিস্ট্যান্ট" : "Rong Dhonu Assistant"}</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-white/85">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-300 shadow-[0_0_8px_rgba(134,239,172,.9)]" />
                    <span>{language === "bn" ? "অনলাইন • ওয়েবসাইট + ওয়েব উত্তর" : "Online • website + web answers"}</span>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={resetChat}
                  aria-label={language === "bn" ? "চ্যাট রিসেট করুন" : "Reset chat"}
                  title={language === "bn" ? "নতুন চ্যাট শুরু করুন" : "Start a new chat"}
                  className="rounded-full p-2 transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={language === "bn" ? "চ্যাট বন্ধ করুন" : "Close chat"}
                  className="rounded-full p-2 transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex h-[390px] flex-col overflow-y-auto bg-surface/80 p-4 sm:h-[410px]">
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-border bg-background/70 px-3 py-2 text-[11px] text-muted">
              <Sparkles size={13} className="shrink-0 text-rd-purple" />
              <span>{language === "bn" ? "আগে আমাদের ওয়েবসাইটের তথ্য দেখব, প্রয়োজনে ওয়েব সার্চ করব।" : "I’ll check our website information first, then search the web when useful."}</span>
            </div>

            <div className="space-y-3">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-2 ${message.from === "user" ? "justify-end" : "justify-start"}`}>
                  {message.from === "bot" && (
                    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rainbow text-white shadow-sm">
                      <Bot size={14} />
                    </div>
                  )}

                  <div
                    className={`max-w-[84%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                      message.from === "user"
                        ? "rounded-br-md bg-foreground text-background"
                        : "rounded-bl-md border border-border bg-background text-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.text}</p>

                    {message.webSearch && (
                      <div className="mt-2 flex items-center gap-1.5 border-t border-border/70 pt-2 text-[10px] font-medium text-muted">
                        <Globe2 size={12} />
                        <span>{language === "bn" ? "এই উত্তরের জন্য ওয়েব সার্চ ব্যবহার করা হয়েছে" : "Web search used for this answer"}</span>
                      </div>
                    )}

                    {!!message.sources?.length && (
                      <div className="mt-2 space-y-1 border-t border-border/70 pt-2">
                        {message.sources.slice(0, 3).map((source) => (
                          <a
                            key={source.url}
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                            className="block truncate text-[11px] font-medium text-rd-blue underline-offset-2 hover:underline"
                          >
                            {source.title}
                          </a>
                        ))}
                      </div>
                    )}

                    <div className={`mt-1 flex items-center gap-1 text-[9px] ${message.from === "user" ? "text-background/55" : "text-muted"}`}>
                      <span>{message.time}</span>
                      {message.from === "user" && <CheckCheck size={11} />}
                    </div>
                  </div>

                  {message.from === "user" && (
                    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                      <UserRound size={14} />
                    </div>
                  )}
                </div>
              ))}

              {typing && (
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rainbow text-white">
                    <Bot size={14} />
                  </div>
                  <div className="rounded-2xl rounded-bl-md border border-border bg-background px-4 py-3">
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-.2s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-.1s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </div>

          <div className="border-t border-border bg-background p-3">
            <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
              {QUICK_REPLIES[language].map((reply) => (
                <button
                  key={reply}
                  type="button"
                  disabled={typing}
                  onClick={() => void send(reply)}
                  className="shrink-0 rounded-full border border-border bg-surface px-2.5 py-1.5 text-[11px] font-medium text-foreground transition hover:border-rd-purple hover:bg-surface-2 disabled:opacity-50"
                >
                  {reply}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={language === "bn" ? "আপনার প্রজেক্ট সম্পর্কে প্রশ্ন করুন..." : "Ask about your project..."}
                autoComplete="off"
                className="min-w-0 flex-1 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-rd-purple focus:ring-2 focus:ring-rd-purple/20"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                aria-label={language === "bn" ? "বার্তা পাঠান" : "Send message"}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rainbow text-white shadow-md transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </section>
      )}

      <div className="flex items-center gap-3">
        <a
          href={`tel:${phone}`}
          aria-label={language === "bn" ? "রংধনুকে কল করুন" : "Call Rong Dhonu"}
          title={language === "bn" ? "রংধনুকে কল করুন" : "Call Rong Dhonu"}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-background text-foreground shadow-xl transition hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rd-green"
        >
          <span className="absolute inset-0 rounded-full bg-rainbow opacity-20 blur-[3px] transition group-hover:opacity-35" />
          <span className="relative flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface">
            <Phone size={21} className="text-rd-green transition-transform group-hover:rotate-[-8deg]" />
          </span>
        </a>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? (language === "bn" ? "চ্যাট বন্ধ করুন" : "Close chat") : (language === "bn" ? "চ্যাট খুলুন" : "Open chat")}
          title={open ? (language === "bn" ? "চ্যাট বন্ধ করুন" : "Close chat") : (language === "bn" ? "রংধনুর সাথে চ্যাট করুন" : "Chat with Rong Dhonu")}
          className={`group relative flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rd-purple ${
            open ? "bg-foreground text-background" : "bg-rainbow text-white"
          }`}
        >
          <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-green-400" />
          {open ? <X size={23} /> : <MessageCircle size={24} />}
        </button>
      </div>
    </div>
  );
}
