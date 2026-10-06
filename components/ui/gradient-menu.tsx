
import React from 'react';
import { Home, Scan, History, MessageSquare, Settings } from 'lucide-react';

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  gradientFrom: string;
  gradientTo: string;
  onClick: () => void;
  isActive: boolean;
}

interface GradientMenuProps {
  items: MenuItem[];
}

export default function GradientMenu({ items }: GradientMenuProps) {
  return (
    <div className="flex justify-center items-center w-full px-4">
      <ul className="flex gap-3 sm:gap-6 bg-slate-900/80 backdrop-blur-xl p-3 rounded-[2.5rem] border border-white/10 shadow-2xl">
        {items.map(({ title, icon, gradientFrom, gradientTo, onClick, isActive }, idx) => (
          <li
            key={idx}
            onClick={onClick}
            style={{ 
              '--gradient-from': gradientFrom, 
              '--gradient-to': gradientTo 
            } as React.CSSProperties}
            className={`
              relative h-[56px] flex items-center justify-center transition-all duration-500 cursor-pointer overflow-hidden
              ${isActive ? 'w-[140px] sm:w-[180px]' : 'w-[56px]'}
              bg-white/10 rounded-full group
            `}
          >
            {/* Gradient background on active/hover */}
            <span className={`
              absolute inset-0 rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] transition-all duration-500
              ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
            `}></span>
            
            {/* Blur glow */}
            <span className={`
              absolute top-[10px] inset-x-0 h-full rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] blur-[15px] -z-10 transition-all duration-500
              ${isActive ? 'opacity-60' : 'opacity-0 group-hover:opacity-50'}
            `}></span>

            {/* Icon */}
            <div className={`
              relative z-10 transition-all duration-500 flex items-center justify-center
              ${isActive ? 'scale-0 translate-x-[-40px]' : 'scale-100 group-hover:scale-0'}
            `}>
              <span className="text-white drop-shadow-md">
                {icon}
              </span>
            </div>

            {/* Title */}
            <span className={`
              absolute text-background-dark uppercase tracking-widest font-black text-[10px] transition-all duration-500 flex items-center gap-2
              ${isActive ? 'scale-100 opacity-100' : 'scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100'}
            `}>
              {title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
