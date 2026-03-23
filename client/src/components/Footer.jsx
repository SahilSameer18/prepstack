import React from "react";

const Footer = () => {
  const linkSections = [
    {
      title: "Quick Links",
      links: [
        { name: "Home", url: "/" },
        { name: "DSA Sheets", url: "/dsa" },
        { name: "Roadmaps", url: "/roadmaps" },
        { name: "AI Projects", url: "/ai-projects" },
        { name: "Notes", url: "/notes" },
        { name: "Behavioral Questions", url: "/behavioral" },
        { name: "Resume", url: "/resume" },
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy", url: "/privacy" },
        { name: "Terms of Use", url: "/terms" }
      ]
    },
    {
      title: "Contact Us",
      links: [
        { name: "Instagram", url: "https://instagram.com/yourprofile" },
        { name: "Email", url: "mailto:sahilsameer.dev18@gmail.com" },
        { name: "LinkedIn", url: "https://www.linkedin.com/in/sahil-sameer-siddique-abb849233/" },
        { name: "Github", url: "https://github.com/SahilSameer18" }
      ]
    }
  ];

  return (
    <footer className="bg-[#1a1a1a] text-gray-400 mt-20 border-t border-[#2a2a2a]">
      <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24 xl:px-32 py-10">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10 border-b border-gray-500/30 pb-10">
          {/* Logo & Description */}
          <div className="md:w-1/3">
            <div className="flex items-center gap-2 text-[#ffa116] font-bold text-2xl mb-4">
              <span className="text-lg">&#60;/&#62;</span> DevPrep
            </div>
            <p className="text-gray-400 max-w-[350px]">
              The Ultimate Guide to Ace SDE Interviews. Curated resources for CSE students.
            </p>
          </div>

          {/* Link Sections */}
          <div className="flex flex-wrap justify-between w-full md:w-2/3 gap-6">
            {linkSections.map((section, idx) => (
              <div key={idx}>
                <h3 className="font-semibold text-gray-200 mb-3">{section.title}</h3>
                <ul className="space-y-1 text-gray-400 text-sm">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <a
                        href={link.url}
                        className="hover:text-[#ffa116] transition"
                        target={link.url.startsWith("http") ? "_blank" : "_self"}
                        rel={link.url.startsWith("http") ? "noopener noreferrer" : ""}
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <p className="text-center text-gray-500/70 text-sm mt-6">
          Copyright 2026 ©{" "}
          <a
            className="hover:text-[#ffa116] transition"
            target="_blank"
            rel="noopener noreferrer"
          >
            PrepNova
          </a>{" "}
          All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;