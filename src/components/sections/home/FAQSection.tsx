"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "Is the platform free to use?",
    answer: "Yes! Most features including roadmaps, AI interviews, and blogs are completely free. We believe in making quality learning accessible to everyone.",
  },
  {
    question: "How does the AI Interview work?",
    answer: "Our AI asks technical questions based on your chosen topic, listens to your answers, and provides real-time feedback on your responses, helping you improve.",
  },
  {
    question: "Can I earn certificates?",
    answer: "Yes, you earn certificates by completing roadmaps. Each certificate includes a unique verification ID that can be shared with employers.",
  },
  {
    question: "What topics are covered?",
    answer: "We cover a wide range including DSA, System Design, OS, DBMS, Web Development, and more. New topics are added regularly.",
  },
  {
    question: "How is this different from other platforms?",
    answer: "We combine structured roadmaps, AI-powered interviews, and community features in one platform. Plus, it's free and focused on practical preparation.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="w-full py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D4AF37]/20 rounded-full mb-4">
            <HelpCircle className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs font-medium text-[#D4AF37]">FAQ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#FFFFF0] mb-4">
            Questions? We've Got Answers
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 bg-[#36454F]/80 backdrop-blur-sm border border-[#D4AF37]/30 rounded-xl text-left hover:border-[#50C878]/50 transition-all"
              >
                <span className="text-[#FFFFF0] font-medium pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-[#D4AF37] shrink-0 transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 pt-3 bg-[#36454F]/60 text-[#FAF9F6] text-sm leading-relaxed rounded-b-xl border-x border-b border-[#D4AF37]/20">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
