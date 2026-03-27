import React from 'react'

const Logo = () => {
  return (
    <div className="flex items-center gap-2 cursor-pointer">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ffa116] to-[#ff8c00] flex items-center justify-center">
        <span className="text-white font-bold text-lg">P</span>
      </div>
      <span className="text-xl font-bold tracking-tight">
        Prep<span className="text-[#ffa116]">Stack</span>
      </span>
    </div>
  )
}

export default Logo