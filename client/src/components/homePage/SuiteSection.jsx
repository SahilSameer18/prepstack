import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpenText, ChatsCircle, CodeBlock, MapTrifold, Robot, Target } from "@phosphor-icons/react";
import homeFacts from "../../data/homeFacts.json";
import Reveal from "../ui/Reveal";
import { roadmaps } from "../../data/roadmaps";
import { behavioralQuestions } from "../../data/behavioralQuestions";

// One line per real page, in the order of a preparation. The right-hand note is a real count where we have one, or what the page needs.
const SuiteSection = () => {
  const lines = [
    { to: "/dsa", title: "DSA sheets", text: "Blind 75, NeetCode 150, Striver and more, with your progress saved.", note: `${homeFacts.problems.toLocaleString("en-IN")} problems`, icon: <CodeBlock weight="duotone" /> },
    { to: "/notes", title: "CS notes", text: "OS, DBMS, networks, OOP and system design in simple words.", note: "Free to read", icon: <BookOpenText weight="duotone" /> },
    { to: "/roadmaps", title: "Roadmaps", text: "Step-by-step paths from beginner to job level.", note: `${roadmaps.length} roadmaps`, icon: <MapTrifold weight="duotone" /> },
    { to: "/ai-projects", title: "AI project ideas", text: "A portfolio project for your tech stack and level.", note: "Sign in to use", icon: <Robot weight="duotone" /> },
    { to: "/analyzer", title: "Role Analyzer", text: "Match your resume to a job. Get a score and a plan.", note: "Sign in to use", icon: <Target weight="duotone" /> },
    { to: "/behavioral", title: "Behavioral prep", text: "Answers for the common interview questions.", note: `${behavioralQuestions.length} questions`, icon: <ChatsCircle weight="duotone" /> },
  ];

  return (
    <section aria-labelledby="home-suite-heading" className="border-t border-ink/[0.1] pt-16 text-left">
      <Reveal y={24}><p className="font-code text-xs uppercase tracking-[0.14em] text-muted">What is inside</p></Reveal>
      <Reveal y={24} delay={0.08}><h2 id="home-suite-heading" className="mt-3 max-w-3xl font-display text-4xl font-bold leading-[1.04] tracking-[-0.04em] text-fg sm:text-5xl">
        One place. All linked to your plan.
      </h2></Reveal>
      <ul className="mt-8 border-t border-ink/[0.1]">
        {lines.map((line, i) => (
          <Reveal as="li" key={line.to} y={24} delay={Math.min(i, 5) * 0.09} className="border-b border-ink/[0.1]">
            <Link
              to={line.to}
              className="group grid grid-cols-[44px_1fr_auto] items-center gap-x-4 gap-y-1 py-5 transition-colors hover:bg-ink/[0.02] sm:grid-cols-[44px_200px_1fr_150px_24px] sm:gap-x-5 sm:py-6"
            >
              <span aria-hidden="true" className="row-span-2 flex h-11 w-11 items-center justify-center rounded-xl border border-brand/25 bg-brand/10 text-2xl text-brand sm:row-span-1">{line.icon}</span>
              <span className="font-display text-xl font-bold tracking-tight text-fg sm:text-2xl">{line.title}</span>
              <ArrowRight aria-hidden="true" className="justify-self-end text-brand transition-transform duration-200 group-hover:translate-x-1 sm:order-last" />
              <span className="col-start-2 text-sm leading-relaxed text-muted sm:col-start-auto sm:text-base">{line.text}</span>
              <span className="col-start-2 font-code text-sm text-fg-3 sm:col-start-auto sm:text-right">{line.note}</span>
            </Link>
          </Reveal>
        ))}
      </ul>
    </section>
  );
};

export default SuiteSection;
