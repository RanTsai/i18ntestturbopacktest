"use client";

import React, { useState } from "react";
import { ChevronRight } from "lucide-react"; // Lucide React icons

export default function FAQSection() {
  const faqs = [
    {
      question: "Is this really built by just one person?",
      answer:
        "Yup. It’s literally just me, a laptop, and way too much coffee ☕. I’m building this project in public — every bug, every update, all of it. You can think of this site as my open lab for creators."
    },
    {
      question: "Why are your building this?",
      answer:
        "Because I’m a creator who got tired of guessing what works. I built this to solve my own pain — and decided to share the journey (and maybe cover my hosting bills along the way)."
    },
    {
      question: "Is it free to use?",
      answer:
        "Yup! The main tools — Analyse and Live View — are free, and they’ll stay that way forever. I might add premium stuff later (hey, caffeine isn’t free ☕), but the essentials will always be open for everyone."
    },
    {
      question: "Will there be new features?",
      answer:
        "Oh yes. I’ve got plenty more creator pains to fix — expect more tools coming soon! (If I survive enough coffee refills ☕)"
    },
    {
      question: "Can I use this for my channel or clients?",
      answer:
        "Absolutely. You can use everything here commercially — tweak your thumbnails (coming soon), test for clients, show off your results. Just don’t claim you coded it 😉."
    },
    {
      question: "How do I support the project?",
      answer:
        "You can share it, tweet about it, or buy me a coffee ☕. Every bit helps me keep the servers running and my caffeine addiction alive."
    },
    {
      question: "Is my data safe?",
      answer:
        "Yes. Your account data is stored securely so your uploads and history stay connected to you (you can delete them anytime). I don’t use your data to train any AI, and I’ll always ask first if I ever plan to."
    },
    {
      question: "Can I join the beta test?",
      answer:
        "Heck yes. Early testers get sneak peeks and help shape the next features. Keep an eye out for the 'Beta Test' badge or announcements"
    },
  ];


  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  return (
    <div className="my-12 p-6 bg-black text-white rounded-lg max-w-2xl mx-auto">
      <div className="space-y-2">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-gray-700 py-3">
            <button
              onClick={() => toggleFAQ(index)}
              className="flex items-center w-full focus:outline-none"
            >
              <ChevronRight
                className={`w-5 h-5 mr-2 transition-transform duration-300
                  ${openIndex === index ? "rotate-90" : ""}
                  text-teal-400`}
              />
              <span
                className={`font-semibold text-left transition-colors duration-300
                  ${openIndex === index ? "text-yellow-500" : "text-white"}`}
              >
                {faq.question}
              </span>
            </button>
            <div
              className={`overflow-hidden transition-[max-height] duration-300
                ${openIndex === index ? "max-h-40 mt-2" : "max-h-0"}`}
            >
              <p className="text-gray-400 mt-1 pl-7">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
