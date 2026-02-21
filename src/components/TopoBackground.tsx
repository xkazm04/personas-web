"use client";

export default function TopoBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="topo-bg absolute -inset-[10%] opacity-[0.05]">
        <svg
          viewBox="0 0 1200 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Large outer contours */}
          <path
            d="M-50,400 C100,180 350,80 600,180 C850,280 1050,60 1250,400 C1050,640 850,740 600,620 C350,500 100,720 -50,400Z"
            stroke="url(#topoGrad1)"
            strokeWidth="1.2"
          />
          <path
            d="M0,400 C130,210 370,120 600,210 C830,300 1020,100 1200,400 C1020,620 830,700 600,590 C370,480 130,680 0,400Z"
            stroke="url(#topoGrad2)"
            strokeWidth="0.9"
          />
          <path
            d="M60,400 C170,240 390,160 600,240 C810,320 980,150 1140,400 C980,600 810,660 600,560 C390,460 170,650 60,400Z"
            stroke="white"
            strokeWidth="0.7"
          />
          <path
            d="M130,400 C220,270 410,200 600,270 C790,340 940,200 1070,400 C940,580 790,620 600,530 C410,440 220,600 130,400Z"
            stroke="white"
            strokeWidth="0.5"
          />
          <path
            d="M200,400 C270,300 430,240 600,300 C770,360 900,240 1000,400 C900,560 770,580 600,500 C430,420 270,560 200,400Z"
            stroke="white"
            strokeWidth="0.4"
          />

          {/* Smaller cluster — top-left */}
          <circle cx="250" cy="220" r="90" stroke="rgba(6,182,212,0.8)" strokeWidth="0.8" />
          <circle cx="250" cy="220" r="65" stroke="white" strokeWidth="0.5" />
          <circle cx="250" cy="220" r="40" stroke="white" strokeWidth="0.4" />

          {/* Smaller cluster — bottom-right */}
          <circle cx="920" cy="580" r="75" stroke="rgba(168,85,247,0.7)" strokeWidth="0.8" />
          <circle cx="920" cy="580" r="52" stroke="white" strokeWidth="0.5" />
          <circle cx="920" cy="580" r="30" stroke="white" strokeWidth="0.4" />

          {/* Accent cluster — center-right */}
          <ellipse cx="850" cy="300" rx="50" ry="70" stroke="rgba(52,211,153,0.6)" strokeWidth="0.6" />
          <ellipse cx="850" cy="300" rx="30" ry="45" stroke="white" strokeWidth="0.4" />

          {/* Scattered detail lines */}
          <path
            d="M400,650 C450,620 520,610 580,640 C640,670 700,650 750,620"
            stroke="white"
            strokeWidth="0.4"
          />
          <path
            d="M100,300 C140,280 190,290 230,310 C270,330 310,320 350,300"
            stroke="white"
            strokeWidth="0.4"
          />
          <defs>
            <linearGradient id="topoGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(6,182,212,0.8)" />
              <stop offset="50%" stopColor="rgba(168,85,247,0.4)" />
              <stop offset="100%" stopColor="rgba(6,182,212,0.8)" />
            </linearGradient>
            <linearGradient id="topoGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(168,85,247,0.8)" />
              <stop offset="50%" stopColor="rgba(6,182,212,0.4)" />
              <stop offset="100%" stopColor="rgba(168,85,247,0.8)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
