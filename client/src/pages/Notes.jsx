import { useState } from 'react';
import { FaBook, FaSearch, FaChevronRight } from "react-icons/fa";

const Notes = () => {

  const [searchTerm, setSearchTerm] = useState("");


  const notes = [
    { title: "Operating Systems", topics: 24, lastUpdated: "2 days ago" },
    { title: "DBMS", topics: 18, lastUpdated: "5 days ago" },
    { title: "Computer Networks", topics: 30, lastUpdated: "1 week ago" },
    { title: "System Design", topics: 12, lastUpdated: "new" },
    { title: "OOPs", topics: 15, lastUpdated: "3 weeks ago" },
  ];

  const filteredNotes = notes.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-6 pb-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Core CS <span className="text-[#ffa116]">Notes</span></h1>
          <p className="text-gray-400">Master the fundamentals with organized and easy-to-read notes.</p>
        </div>
        <div className="relative w-full md:w-80">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl py-2 pl-12 pr-4 focus:border-[#ffa116] outline-none transition"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((s, i) => (
          <div key={i} className="card group hover:scale-[1.02] cursor-pointer transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg group-hover:bg-[#ffa116]/10 group-hover:text-[#ffa116] transition">
                <FaBook className="text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{s.title}</h3>
                <span className="text-xs text-gray-500 uppercase tracking-widest">{s.topics} Topics</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 italic">Updated {s.lastUpdated}</span>
              <div className="flex items-center gap-1 text-[#ffa116] font-medium">
                Read Now <FaChevronRight className="text-xs" />
              </div>
            </div>
          </div>
        ))}

        {filteredNotes.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-500">
            No Notes found matching your search.
          </div>
        )}

      </div>
    </div>
  );
};

export default Notes;