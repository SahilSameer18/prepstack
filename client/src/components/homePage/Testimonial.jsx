import React from 'react'

const Testimonial = () => {

  const testimonials = [
    {
      name: "Aman Gupta",
      role: "CSE Student",
      img: "https://randomuser.me/api/portraits/men/32.jpg",
      text: "This platform organized all the resources I needed for interview prep. The DSA sheets and notes saved me hours of searching."
    },
    {
      name: "Priya Sharma",
      role: "Frontend Developer",
      img: "https://randomuser.me/api/portraits/women/44.jpg",
      text: "The AI project idea generator helped me build projects aligned with my tech stack."
    },
    {
      name: "Rahul Verma",
      role: "3rd Year CSE",
      img: "https://randomuser.me/api/portraits/men/65.jpg",
      text: "The structured roadmaps are amazing. Instead of random resources, everything is in one place."
    },
    {
      name: "Sneha Kapoor",
      role: "Backend Developer",
      img: "https://randomuser.me/api/portraits/women/68.jpg",
      text: "Perfect platform for interview preparation. The CS core notes are extremely helpful."
    },
    {
      name: "Arjun Mehta",
      role: "SDE Intern @ Flipkart",
      img: "https://randomuser.me/api/portraits/men/22.jpg",
      text: "The behavioral questions section is a hidden gem. The example answers helped me crack my HR round with confidence."
    },
    {
      name: "Divya Nair",
      role: "2nd Year CSE",
      img: "https://randomuser.me/api/portraits/women/12.jpg",
      text: "I used the roadmap section to structure my entire second year. I know exactly what to learn and when. Highly recommended!"
    }
  ];

  return (
    <div>
      {/* Testimonials */}
      <section className="mt-32 relative">

        <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">
          What Students <span className="text-[#ffa116]">Say</span>
        </h2>

        <div className="relative overflow-hidden">

          {/* Blur edges */}
          <div className="absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-[#0f0f0f] to-transparent z-10"></div>
          <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-[#0f0f0f] to-transparent z-10"></div>

          <div className="flex gap-8 animate-marquee">

            {[...testimonials, ...testimonials].map((t, i) => (
              <div
                key={i}
                className="min-w-[340px] max-w-[340px] p-6 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#ffa116]/40 transition"
              >

                {/* stars */}
                <div className="flex text-[#ffa116] mb-3">
                  ⭐⭐⭐⭐⭐
                </div>

                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  {t.text}
                </p>

                <div className="flex items-center gap-3">

                  <img
                    src={t.img}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />

                  <div>
                    <h4 className="font-semibold">{t.name}</h4>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>

                </div>

              </div>
            ))}

          </div>

        </div>

      </section>
    </div>
  )
}

export default Testimonial