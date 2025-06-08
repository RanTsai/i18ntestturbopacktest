"use client";

import React, { useState } from "react";
import { ChevronRight } from "lucide-react"; // Lucide React icons

export default function FAQSection() {
  const faqs = [
    {
      question: "Do yearly plans receive all their credits at once?",
      answer: "Yes, subscribers to yearly plans receive their full credit allocation immediately upon subscription."
    },
    {
      question: "Can I purchase extra credits if I run out of the ones in my current plan?",
      answer: "Absolutely. You can buy additional credits anytime."
    },
    {
      question: "Do credits expire? Can they be rolled over to the future?",
      answer: "Credits expire 12 months after being issued. They cannot be rolled over."
    },
    {
      question: "How do I cancel or manage my subscription?",
      answer: "You can manage your subscription from your account settings page."
    }
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
                  ${openIndex === index ? "text-teal-400" : "text-white"}`}
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
