'use client'

import React from 'react'

interface AdSenseSlotProps {
  slot: string
  format?: 'horizontal' | 'vertical' | 'square'
  className?: string
}

const AdSenseSlot: React.FC<AdSenseSlotProps> = ({ 
  slot, 
  format = 'horizontal', 
  className = '' 
}) => {
  return (
    <div className={`adsense-placeholder ${className}`}>
      <div className="text-center">
        <div className="text-xs text-gray-400 mb-1">Advertisement</div>
        <div className="text-xs text-gray-300">
          AdSense Slot: {slot} ({format})
        </div>
      </div>
    </div>
  )
}

export default AdSenseSlot
