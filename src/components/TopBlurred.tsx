import React from 'react'

const TopBlurred = () => {
  return (
    <div className="absolute inset-x-0 top-0 -z-10 h-96 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-[#D4A5A5]/20 rounded-full blur-[100px]" />
      <div className="absolute -top-40 right-1/4 w-[400px] h-[400px] bg-[#C07A60]/10 rounded-full blur-[100px]" />
    </div>
  )
}

export default TopBlurred
