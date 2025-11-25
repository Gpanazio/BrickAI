import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

const App = () => {
  // Scroll Reveal Observer
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.reveal');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-brick-black text-brick-white selection:bg-brick-red selection:text-white font-sans">
      <Header />
      <main>
        <Hero />
        <Philosophy />
        <SelectedWorks />
        <Legacy />
      </main>
      <Footer />
    </div>
  );
};

// ------------------------------------------------------------------
// COMPONENTS
// ------------------------------------------------------------------

const Header = () => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 px-6 py-6 md:px-12 flex justify-between items-center bg-gradient-to-b from-brick-black/90 to-transparent backdrop-blur-sm">
      {/* Logo Hybrid */}
      <div className="flex items-center gap-2 group cursor-default select-none">
        <div className="relative h-6 md:h-8 flex items-center">
          <img 
            src="02.png" 
            alt="BRICK" 
            className="h-full object-contain brightness-200 contrast-150"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <span className="hidden font-black text-xl tracking-tighter text-white">BRICK</span>
        </div>
        
        <div className="flex items-baseline">
          <span className="text-brick-red font-bold text-xl md:text-2xl animate-blink relative -top-[1px] mx-[2px]">_</span>
          <span className="text-brick-gray font-semibold text-sm md:text-base tracking-widest group-hover:text-white transition-colors duration-500">AI</span>
        </div>
      </div>

      {/* Contact Button */}
      <a 
        href="mailto:contact@brick.ai"
        className="bg-white/5 border border-white/10 backdrop-blur-md px-6 py-2 text-xs md:text-sm font-medium tracking-widest transition-all duration-300 hover:bg-white hover:text-brick-black hover:border-white"
      >
        CONTACT
      </a>
    </header>
  );
};

const Hero = () => {
  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-start pt-28 md:pt-32 pb-20 overflow-hidden">
      
      {/* The Living Monolith - Top Center Anchor */}
      <div className="reveal relative z-10 w-full flex justify-center mb-12 md:mb-16">
        <div className="monolith-structure w-[140px] md:w-[160px] h-[40vh] md:h-[45vh] rounded-[2px] flex items-center justify-center overflow-hidden group transition-transform duration-1000 ease-out hover:scale-[1.02] relative shadow-2xl">
          
          {/* Texture Layer */}
          <div className="absolute inset-0 mix-blend-overlay monolith-texture bg-neutral-900"></div>
          
          {/* Breathing Heart Layers */}
          <div className="centered-layer aura-atmos"></div>
          <div className="centered-layer light-atmos animate-breathe"></div>
          <div className="centered-layer core-atmos"></div>

          {/* Inner Glow */}
          <div className="absolute inset-0 border border-white/5 opacity-50 pointer-events-none"></div>
        </div>
      </div>

      {/* Text Overlay */}
      <div className="reveal delay-200 text-center z-20 max-w-6xl px-4 flex flex-col items-center">
        
        {/* 1. Gigante/Impactante */}
        <h1 className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white leading-[0.85] mb-6 md:mb-10">
          FROM SET TO SERVER.
        </h1>
        
        {/* 2. Média/Elegante */}
        <p className="text-lg md:text-2xl lg:text-3xl font-light tracking-[0.3em] text-brick-white/80 mb-2 md:mb-4">
          10 YEARS OF CRAFT.
        </p>

        {/* 3. Vermelho Brick/Destaque */}
        <h2 className="text-3xl md:text-6xl lg:text-7xl font-black tracking-tight text-brick-red">
          NOW GENERATIVE.
        </h2>

        <p className="mt-12 text-brick-gray text-xs md:text-sm tracking-[0.2em] uppercase font-medium opacity-60 max-w-md border-t border-white/10 pt-6">
          A new division by Brick.<br/>From zero to all since 2016.
        </p>
      </div>
      
      {/* Ambient Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brick-red/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
    </section>
  );
};

const Philosophy = () => {
  return (
    <section className="relative w-full py-32 bg-brick-black z-20 border-t border-white/5">
      {/* Central Axis Line Background */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent -translate-x-1/2 hidden md:block"></div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
        
        {/* Section Header */}
        <div className="mb-32 reveal flex flex-col items-center">
          <div className="w-2 h-2 bg-brick-red rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)] mb-6"></div>
          <span className="text-xs font-mono tracking-[0.3em] text-brick-gray uppercase bg-brick-black px-4">The Belief</span>
        </div>

        {/* Content Stack - Uniform Vertical Logic */}
        <div className="flex flex-col gap-32 w-full">
            
            {/* Statement 1 */}
            <div className="reveal flex flex-col items-center group">
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6 transition-colors duration-500 group-hover:text-brick-red">
                  RAW.
                </h2>
                <p className="text-lg md:text-xl text-brick-gray font-light max-w-lg leading-relaxed">
                  AI creates infinite pixels and patterns. But it cannot create intent. It is just a resource.
                </p>
            </div>

            {/* Statement 2 */}
            <div className="reveal flex flex-col items-center group">
               <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6 transition-colors duration-500 group-hover:text-brick-red">
                 NOISE.
               </h2>
               <p className="text-lg md:text-xl text-brick-gray font-light max-w-lg leading-relaxed">
                 Without a human hand, generative models are just mathematical coincidence. We provide the vision.
               </p>
            </div>

            {/* Statement 3 */}
            <div className="reveal flex flex-col items-center group">
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6 transition-colors duration-500 group-hover:text-brick-red">
                    WE DIRECT THE INTELLIGENCE.
                </h2>
                <p className="text-lg md:text-xl text-brick-gray font-light max-w-lg leading-relaxed">
                  The machine is the brush. The database is the paint. We are still the artists.
                </p>
            </div>

        </div>

      </div>
    </section>
  );
};

const WorkCard = ({ work, index }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !bgRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Only animate if the element is roughly in view
      if (rect.top < viewportHeight && rect.bottom > 0) {
        // Calculate offset based on distance from center
        // When rect.top + rect.height/2 === viewportHeight/2, offset is 0
        const cardCenter = rect.top + rect.height / 2;
        const screenCenter = viewportHeight / 2;
        const distanceFromCenter = cardCenter - screenCenter;
        
        // Speed factor: 0.1 means move 10px for every 100px of scroll
        const parallaxSpeed = 0.15; 
        const yOffset = distanceFromCenter * parallaxSpeed;

        // Apply transform. Scale is needed to prevent edges from showing.
        bgRef.current.style.transform = `scale(1.2) translateY(${yOffset}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Placeholder images mapping
  const placeholders = [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop", // Abstract Fluid
    "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop", // Dark Liquid
    "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=2668&auto=format&fit=crop"  // Neon Abstract
  ];

  const bgImage = placeholders[index % placeholders.length];

  return (
    <div 
      ref={containerRef}
      className={`reveal w-full min-h-[40vh] md:min-h-[50vh] relative flex items-center group overflow-hidden border-b border-black`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Parallax Background Layer */}
      <div 
        ref={bgRef}
        className="absolute inset-0 opacity-50 mix-blend-overlay transition-transform duration-75 ease-linear will-change-transform"
        style={{
            backgroundImage: `url('${bgImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: 'scale(1.2)' // Initial scale
        }}
      ></div>

      {/* Abstract Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-r ${work.gradient} opacity-50 transition-opacity duration-700 group-hover:opacity-80 z-10`}></div>
      
      {/* Content */}
      <div className="relative z-20 px-6 md:px-12 lg:px-24 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <span className="block text-brick-red text-xs font-bold tracking-[0.2em] mb-4">{work.subtitle}</span>
          <h3 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white mb-2 group-hover:translate-x-4 transition-transform duration-500">
            {work.title}
          </h3>
        </div>
        <p className="text-brick-gray text-sm md:text-lg max-w-sm text-left md:text-right">
          {work.desc}
        </p>
      </div>
    </div>
  );
};

const SelectedWorks = () => {
  const works = [
    {
      subtitle: "FULL GENERATIVE",
      title: "PROJECT: DREAMSCAPE",
      desc: "When the location doesn't exist. 100% Neural Rendering.",
      gradient: "from-neutral-900 to-neutral-800"
    },
    {
      subtitle: "HYBRID EXTENSION",
      title: "PROJECT: SHIFT",
      desc: "Expanding the set beyond physical limits. Seamless VFX.",
      gradient: "from-neutral-900 via-brick-red/10 to-neutral-900"
    },
    {
      subtitle: "STYLE TRANSFER",
      title: "PROJECT: ANIMA",
      desc: "Turning live action into branded art using custom models.",
      gradient: "from-neutral-900 to-neutral-950"
    }
  ];

  return (
    <section className="w-full py-24 bg-brick-black border-t border-white/5">
      <div className="px-6 md:px-12 lg:px-24 mb-16 reveal">
         <h2 className="text-xs font-bold tracking-[0.3em] text-brick-gray uppercase">Selected Works</h2>
      </div>

      <div className="flex flex-col w-full gap-0">
        {works.map((work, idx) => (
          <WorkCard key={idx} work={work} index={idx} />
        ))}
      </div>
    </section>
  );
};

const Legacy = () => {
  const clients = ["BBC", "RECORD TV", "STONE", "ALIEXPRESS", "KEETA", "VISA", "FACEBOOK", "O BOTICÁRIO"];

  return (
    <section className="w-full py-32 px-6 md:px-12 lg:px-24 bg-brick-white text-brick-black relative overflow-hidden">
      <div className="max-w-6xl mx-auto reveal">
        <h2 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-12 leading-[0.85]">
          BACKED <br className="md:hidden"/> BY BRICK.
        </h2>
        
        <div className="flex flex-col md:flex-row gap-16 border-t-4 border-brick-black pt-12">
          <p className="text-xl md:text-2xl font-medium leading-tight max-w-md">
            This isn't a beta test. This is a new lens from a production house with 10 years of experience. Same directors. Same producers. New tools.
          </p>
          
          <div className="flex-1">
            <h4 className="text-xs font-bold tracking-[0.2em] uppercase mb-10 text-neutral-500 border-b border-neutral-300 pb-4 inline-block">Trusted By</h4>
            
            {/* Grid Layout - Organized & Clean */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-8">
              {clients.map((client, i) => (
                <div key={i} className="group flex items-center">
                  <span className="text-xl md:text-2xl font-black text-neutral-400 group-hover:text-brick-black transition-colors duration-300 cursor-default tracking-tighter uppercase whitespace-nowrap">
                    {client}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="w-full py-32 px-6 md:px-12 lg:px-24 bg-black border-t border-white/5">
      <div className="flex flex-col items-center text-center gap-12 reveal">
        <h2 className="text-sm md:text-base font-mono text-brick-gray tracking-widest uppercase">
          Have a complex problem?
        </h2>
        
        <p className="text-4xl md:text-6xl lg:text-8xl font-black text-white tracking-tighter leading-none max-w-5xl">
          WE HAVE THE INTELLIGENCE.
        </p>
        
        <a 
          href="mailto:hello@brick.ai" 
          className="mt-8 bg-brick-red text-white px-12 py-4 text-lg font-bold tracking-widest hover:bg-white hover:text-brick-black transition-all duration-300 rounded-sm"
        >
          TALK TO US
        </a>
      </div>
      
      <div className="mt-24 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-[0.2em] text-brick-gray/40 font-bold border-t border-white/5 pt-8 w-full">
        <span>&copy; 2025 Brick AI.</span>
        <span className="hidden md:inline">The Generative Division</span>
        <span>All Rights Reserved.</span>
      </div>
    </footer>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}