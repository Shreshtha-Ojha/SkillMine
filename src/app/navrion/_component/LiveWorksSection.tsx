"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Sparkles } from "lucide-react";

/* ------------------ WORK CARD COMPONENT ------------------ */
function WorkCard({
  title,
  tag,
  href,
  imageSrc,
  description,
}: {
  title: string;
  tag: string;
  href: string;
  imageSrc?: string;
  description?: string;
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${title} in a new tab`}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      className="group bg-[#0b0b11] rounded-2xl border border-white/8 overflow-hidden shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#7E102C]/30"
    >
      <div className="p-4">
        <div className="rounded-xl overflow-hidden border border-white/5 bg-[#05050a] p-1 group-hover:border-pink-500/20 transition-all">
          <div className="rounded-lg overflow-hidden relative aspect-[16/9]">
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={`${title} screenshot`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#7E102C]/10">
                <span className="text-[#E1D3CC] text-xs">Preview coming soon</span>
              </div>
            )}
            <div className="absolute inset-0 bg-[#7E102C]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="absolute top-3 left-3 px-2 py-1 rounded-md text-[11px] bg-black/40 backdrop-blur-md text-white/90 border border-white/10">
              Live
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-[15px] text-[#E1D4C1]">{title}</h3>
            <p className="text-[12px] text-[#E1D3CC] mt-1">
              {tag} {description && <span>· {description}</span>}
            </p>
          </div>

          {/* Desktop CTA */}
          <div className="hidden sm:flex items-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                window.open(href, "_blank", "noopener,noreferrer");
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/10 hover:border-[#7E102C]/40 text-[#E1D4C1] text-xs font-semibold transition-all hover:bg-white/5"
            >
              Visit
              <ArrowRight className="w-4 h-4 opacity-70" />
            </button>
          </div>
        </div>

        {/* Mobile CTA */}
        <div className="sm:hidden mt-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              window.open(href, "_blank", "noopener,noreferrer");
            }}
            className="inline-flex items-center gap-2 px-4 py-2 w-full justify-center rounded-xl bg-white/10 border border-white/10 hover:border-[#7E102C]/40 text-[#E1D4C1] text-sm font-semibold transition-all hover:bg-white/5"
          >
            Visit site
            <ArrowRight className="w-4 h-4 opacity-70" />
          </button>
        </div>
      </div>
    </motion.a>
  );
}

/* ------------------ LIVE WORKS SECTION ------------------ */
type Project = { name: string; desc: string; live: boolean; link: string; cover: string };

export default function LiveWorksSection({ projects }: { projects: Project[] }) {
  return (
    <section id="work" className="w-full px-4 py-20 bg-[#05050a] relative overflow-hidden">
      {/* Minimal grid bg */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold tracking-tight text-[#E1D4C1]"
          >
            Our Live Case Studies
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-[#E1D3CC] text-sm md:text-base mt-3 max-w-2xl mx-auto leading-relaxed"
          >
            Real products, real clients — engineered for
            <span className="text-[#E1D4C1] font-semibold"> speed, credibility, and conversion.</span>
            Explore what we’ve shipped across industries.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75 }}
            className="flex justify-center items-center gap-3 mt-6"
          >
            <span className="text-[11px] px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#E1D3CC]">
              Some projects are private — NDA protected
            </span>

            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#7E102C]/40 shadow-md shadow-[#7E102C]/10 hover:shadow-[#7E102C]/20 transition-all text-[#E1D4C1] text-xs font-semibold"
            >
              Request full portfolio
              <ArrowRight className="w-3 h-3 opacity-70" />
            </a>
          </motion.div>
        </div>

        {/* WORK CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <WorkCard
              key={project.name}
              title={project.name}
              tag={project.desc}
              href={project.link}
              imageSrc={project.cover}
              description={project.live ? "Live" : "Coming Soon"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
