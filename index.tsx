import React, { useState, useEffect, useRef, useMemo, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, Database, Globe, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './src/i18n';
import './src/index.css';

// --- STYLES & CONFIG ---
const GlobalStyles = () => (
    <style>{`
        /* COLORS & UTILS */
        :root {
            --brick-black: #050505;
            --brick-dark: #050505; 
            --brick-red: #DC2626;
            --brick-gray: #9CA3AF;
            --brick-white: #E5E5E5;
        }
        body {
            background-color: var(--brick-black);
            color: var(--brick-white);
            overflow-x: hidden;
            cursor: default;
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 0;
        }
        
        /* BRAND TYPOGRAPHY SYSTEM */
        .font-brick { 
            font-family: 'Inter', sans-serif; 
            font-weight: 900; 
            letter-spacing: -0.04em; 
            line-height: 1; 
        }
        
        .font-ai { 
            font-family: 'JetBrains Mono', monospace; 
            font-weight: 700; 
            letter-spacing: -0.02em; 
        }

        .font-mono {
            font-family: 'JetBrains Mono', monospace;
        }
        
        /* CUSTOM ANIMATIONS */
        @keyframes terminal-blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
        }
        @keyframes atmos-breathe {
            0%, 100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.2; }
            50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
        }
        @keyframes thinking-pulse {
            0%, 100% { opacity: 0.2; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.5); }
        }
        @keyframes talking-glitch {
            0% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; filter: brightness(1.2) contrast(1.2); }
            25% { transform: translate(-52%, -48%) scale(1.15); opacity: 0.8; filter: hue-rotate(5deg); }
            50% { transform: translate(-48%, -50%) scale(1.2); opacity: 0.9; filter: contrast(1.5); }
            75% { transform: translate(-50%, -52%) scale(1.15); opacity: 0.8; }
            100% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
        }
        @keyframes grain {
            0%, 100% { transform: translate(0, 0); }
            10% { transform: translate(-5%, -10%); }
            20% { transform: translate(-15%, 5%); }
            30% { transform: translate(7%, -25%); }
            40% { transform: translate(-5%, 25%); }
            50% { transform: translate(-15%, 10%); }
            60% { transform: translate(15%, 0%); }
            70% { transform: translate(0%, 15%); }
            80% { transform: translate(3%, 35%); }
            90% { transform: translate(-10%, 10%); }
        }
        @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes scan {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
        
        .animate-blink { animation: terminal-blink 1s step-end infinite; }
        .animate-breathe { animation: atmos-breathe 6s ease-in-out infinite; }
        .animate-grain { animation: grain 8s steps(10) infinite; }
        .animate-thinking { animation: thinking-pulse 1.5s ease-in-out infinite; }
        .animate-talking { animation: talking-glitch 0.15s infinite; }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
        .animate-scan { animation: scan 3s ease-in-out infinite; }
        
        .noise-overlay {
            position: fixed;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            pointer-events: none;
            z-index: 30; 
            opacity: 0.04; 
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
            animation: grain 6s steps(10) infinite;
        }

        /* CARD SPECIFIC NOISE - GRITTY ANALOG FEEL */
        .card-noise {
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
            opacity: 0.55; /* Heavy grain */
            mix-blend-mode: overlay;
        }

        /* NEW: TECH GRID PATTERN FOR PROJECTS */
        .bg-tech-grid {
            background-size: 40px 40px;
            background-image: linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
            mask-image: linear-gradient(to bottom, black 20%, transparent 100%);
            -webkit-mask-image: linear-gradient(to bottom, black 20%, transparent 100%);
        }

        .monolith-structure {
            background: linear-gradient(to bottom, #050505, #000000);
            border: 1px solid #1a1a1a;
            box-shadow: inset 0 0 40px rgba(0,0,0,0.9);
        }

        .centered-layer { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); border-radius: 50%; pointer-events: none; }
        .aura-atmos { width: 120px; height: 120px; background: radial-gradient(circle at center, rgba(153, 27, 27, 0.08) 0%, transparent 70%); filter: blur(20px); }
        .light-atmos { width: 80px; height: 80px; background: radial-gradient(circle at center, rgba(220, 38, 38, 0.6) 0%, rgba(153, 0, 0, 0.1) 50%, transparent 70%); filter: blur(15px); }
        .core-atmos { width: 16px; height: 16px; background-color: #dc2626; filter: blur(6px); opacity: 0.8; }
        
        .monolith-texture {
            background-image: url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564');
            background-size: cover;
            background-position: center;
        }
        
        .reveal {
            opacity: 0;
            transform: translateY(40px);
            transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
            will-change: opacity, transform;
        }
        .reveal.active { opacity: 1; transform: translateY(0); }

        @keyframes float-parallax {
            0% { transform: scale(1.15) translate(0%, 0%); }
            33% { transform: scale(1.15) translate(-3%, 2%); }
            66% { transform: scale(1.15) translate(2%, -3%); }
            100% { transform: scale(1.15) translate(0%, 0%); }
        }

        .animate-float-parallax {
            animation: float-parallax 20s ease-in-out infinite;
        }
    `}</style>
);

// --- CONFIG ---
const AI_NAME = "MASON";

// --- TYPES ---
interface Work {
    id: string;
    orientation: 'horizontal' | 'vertical';
    subtitle: string;
    category: string;
    title: string;
    desc: string;
    videoUrl?: string;
    longDesc?: string;
    credits?: Array<{ role: string; name: string }>;
    gradient: string;
    imageHome: string;
    imageWorks: string;
    hasDetail: boolean;
    imageSettingsHome?: {
        x: number;
        y: number;
        scale: number;
    };
    imageSettingsWorks?: {
        x: number;
        y: number;
        scale: number;
    };
}

interface Post {
    id: string;
    date: string;
    title: string;
    excerpt: string;
    tags: string[];
    url: string;
    content: React.ReactNode;
}

// --- DATA IS NOW GENERATED INSIDE DATA PROVIDER FOR I18N ---

const CLIENTS = ["BBC", "RECORD TV", "STONE", "ALIEXPRESS", "KEETA", "VISA", "FACEBOOK", "O BOTICÁRIO", "L'ORÉAL"];

// --- CONTEXT & DATA MANAGEMENT ---
const DataContext = React.createContext<{
    works: Work[];
    setWorks: React.Dispatch<React.SetStateAction<Work[]>>;
    transmissions: Post[];
    setTransmissions: React.Dispatch<React.SetStateAction<Post[]>>;
} | null>(null);

const DataProvider = ({ children }: { children: React.ReactNode }) => {
    const { t, i18n } = useTranslation();
    const [works, setWorks] = useState<Work[]>([]);
    const [transmissions, setTransmissions] = useState<Post[]>([]);

    useEffect(() => {
        const generatedWorks: Work[] = [
            {
                id: "inheritance",
                orientation: "horizontal",
                subtitle: t('works.inheritance.subtitle'),
                category: "GENERATIVE",
                title: t('works.inheritance.title'),
                desc: t('works.inheritance.desc'),
                longDesc: t('works.inheritance.longDesc'),
                credits: [
                    { role: "Director", name: "Sarah V." },
                    { role: "AI Lead", name: "Mason Core" },
                    { role: "Sound", name: "Echo Lab" },
                    { role: "Tech", name: "Stable Diffusion XL + ComfyUI" }
                ],
                gradient: "from-neutral-900 to-neutral-800",
                imageHome: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=2670&auto=format&fit=crop",
                imageWorks: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=2670&auto=format&fit=crop",
                hasDetail: true
            },
            {
                id: "shift",
                orientation: "horizontal",
                subtitle: t('works.shift.subtitle'),
                category: "VFX",
                title: t('works.shift.title'),
                desc: t('works.shift.desc'),
                longDesc: t('works.shift.longDesc'),
                credits: [
                    { role: "Director", name: "Marcus L." },
                    { role: "VFX Sup", name: "Brick Core" },
                    { role: "Agency", name: "Future Brand" },
                    { role: "Tech", name: "Nuke + Generative Fill" }
                ],
                gradient: "from-neutral-900 via-[#DC2626]/10 to-neutral-900",
                imageHome: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=2670&auto=format&fit=crop",
                imageWorks: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=2670&auto=format&fit=crop",
                hasDetail: true
            },
            {
                id: "anima",
                orientation: "vertical",
                subtitle: t('works.anima.subtitle'),
                category: "STYLE TRANSFER",
                title: t('works.anima.title'),
                desc: t('works.anima.desc'),
                longDesc: t('works.anima.longDesc'),
                credits: [
                    { role: "Creative", name: "Ana S." },
                    { role: "AI Artist", name: "Mason Core" },
                    { role: "Client", name: "Sports Global" },
                    { role: "Tech", name: "Ebsynth + SD Video" }
                ],
                gradient: "from-neutral-900 to-neutral-950",
                imageHome: "https://images.unsplash.com/photo-1614850523060-8da1d56ae167?q=80&w=2670&auto=format&fit=crop",
                imageWorks: "https://images.unsplash.com/photo-1614850523060-8da1d56ae167?q=80&w=2670&auto=format&fit=crop",
                hasDetail: true
            },
            {
                id: "void",
                orientation: "vertical",
                subtitle: t('works.void.subtitle'),
                category: "DATA ART",
                title: t('works.void.title'),
                desc: t('works.void.desc'),
                longDesc: t('works.void.longDesc'),
                credits: [
                    { role: "Concept", name: "Brick Lab" },
                    { role: "Code", name: "Mason Core" },
                    { role: "Data", name: "NASA Open API" },
                    { role: "Tech", name: "TouchDesigner + Python" }
                ],
                gradient: "from-neutral-950 to-[#DC2626]/20",
                imageHome: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2670&auto=format&fit=crop",
                imageWorks: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2670&auto=format&fit=crop",
                hasDetail: true
            },
            {
                id: "urban",
                orientation: "horizontal",
                subtitle: t('works.urban.subtitle'),
                category: "GENERATIVE",
                title: t('works.urban.title'),
                desc: t('works.urban.desc'),
                longDesc: t('works.urban.longDesc'),
                credits: [
                    { role: "Architect", name: "J. Doe" },
                    { role: "Sim", name: "Brick Core" },
                    { role: "Render", name: "Redshift" },
                    { role: "Tech", name: "Houdini + AI Texture" }
                ],
                gradient: "from-neutral-900 to-neutral-800",
                imageHome: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop",
                imageWorks: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop",
                hasDetail: true
            },
            {
                id: "silent",
                orientation: "horizontal",
                subtitle: t('works.silent.subtitle'),
                category: "EXPERIENCE",
                title: t('works.silent.title'),
                desc: t('works.silent.desc'),
                longDesc: t('works.silent.longDesc'),
                credits: [
                    { role: "Band", name: "Low Freq" },
                    { role: "Visuals", name: "Brick AI" },
                    { role: "Engine", name: "Unreal 5" },
                    { role: "Tech", name: "Real-time Audio Analysis" }
                ],
                gradient: "from-neutral-900 via-white/5 to-neutral-900",
                imageHome: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=2674&auto=format&fit=crop",
                imageWorks: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=2674&auto=format&fit=crop",
                hasDetail: true
            }
        ];

        const generatedTransmissions: Post[] = [
            {
                id: "log_001",
                date: "2025.02.14",
                title: t('transmissions.log_001.title'),
                excerpt: t('transmissions.log_001.excerpt'),
                tags: ["THEORY", "NEURAL_RENDERING"],
                url: "/transmissions/latent-space",
                content: (
                    <React.Fragment>
                        <p className="mb-8 text-base md:text-lg font-light leading-relaxed text-[#E5E5E5] first-letter:text-4xl first-letter:font-brick first-letter:text-[#DC2626] first-letter:mr-3 first-letter:float-left">
                            {t('transmissions.log_001.content_p1')}
                        </p>
                        <h3 className="text-lg md:text-xl font-brick text-white mt-10 mb-4 uppercase tracking-tight flex items-center gap-3">
                            <span className="text-[#DC2626] text-xs align-middle font-ai">01 //</span> {t('transmissions.log_001.section_title')}
                        </h3>
                        <p className="mb-6 text-[#9CA3AF] leading-relaxed">
                            {t('transmissions.log_001.content_p2')}
                        </p>
                        <div className="border-l-2 border-[#DC2626] pl-6 py-4 my-10 bg-white/5">
                            <p className="text-base font-mono italic text-white/90">
                                {t('transmissions.log_001.quote')}
                            </p>
                        </div>
                    </React.Fragment>
                )
            },
            {
                id: "log_002",
                date: "2025.01.28",
                title: t('transmissions.log_002.title'),
                excerpt: t('transmissions.log_002.excerpt'),
                tags: ["R&D", "WORKFLOW"],
                url: "/transmissions/motion-vectors",
                content: (
                    <React.Fragment>
                        <p className="mb-6 text-[#9CA3AF] leading-relaxed">
                            {t('transmissions.log_002.content_p1').split('<0>').map((part, index, array) => {
                                if (index === 1) return <span key={index} className="text-white font-bold">{part}</span>;
                                if (index === array.length - 1 && part === '') return null;
                                return part;
                            })}
                            {/* Fallback simple text if interpolation is too complex for this rapid refactor or proper <Trans> component usage */}
                        </p>
                        <p className="mb-6 text-[#9CA3AF] leading-relaxed">
                            {t('transmissions.log_002.content_p2')}
                        </p>
                    </React.Fragment>
                )
            },
            {
                id: "log_003",
                date: "2025.01.10",
                title: t('transmissions.log_003.title'),
                excerpt: t('transmissions.log_003.excerpt'),
                tags: ["PHILOSOPHY", "VFX"],
                url: "/transmissions/intentional-glitch",
                content: (
                    <React.Fragment>
                        <p className="mb-6 text-[#9CA3AF] leading-relaxed">
                            {t('transmissions.log_003.content_p1')}
                        </p>
                        <p className="text-white font-brick tracking-widest uppercase border-t border-white/10 pt-6">
                            {t('transmissions.log_003.quote')}
                        </p>
                    </React.Fragment>
                )
            }
        ];

        setWorks(generatedWorks);
        setTransmissions(generatedTransmissions);
    }, [t, i18n.language]);

    return (
        <DataContext.Provider value={{ works, setWorks, transmissions, setTransmissions }}>
            {children}
        </DataContext.Provider>
    );
};

// --- UTILS COMPONENTS ---
const ScrambleText = ({ text, className, hoverTrigger = false }: { text: string, className?: string, hoverTrigger?: boolean }) => {
    const [displayText, setDisplayText] = useState(text);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_!@#$%^&*";
    const intervalRef = useRef<any>(null);

    const scramble = () => {
        let iteration = 0;
        clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            setDisplayText(prev =>
                text
                    .split("")
                    .map((letter, index) => {
                        if (index < iteration) return text[index];
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join("")
            );

            if (iteration >= text.length) {
                clearInterval(intervalRef.current);
            }

            iteration += 1 / 3;
        }, 30);
    };

    useEffect(() => {
        if (!hoverTrigger) scramble();
    }, []);

    return (
        <span
            className={className}
            onMouseEnter={hoverTrigger ? scramble : undefined}
        >
            {displayText}
        </span>
    );
};

const MagneticButton = ({ children, onClick, className }: { children: React.ReactNode, onClick: () => void, className?: string }) => {
    const btnRef = useRef<HTMLButtonElement>(null);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!btnRef.current) return;
        const rect = btnRef.current.getBoundingClientRect();
        const x = e.clientX - (rect.left + rect.width / 2);
        const y = e.clientY - (rect.top + rect.height / 2);
        btnRef.current.style.transform = `translate(${x * 0.3}px, ${y * 0.5}px)`;
    };

    const handleMouseLeave = () => {
        if (!btnRef.current) return;
        btnRef.current.style.transform = `translate(0px, 0px)`;
    };

    return (
        <button
            onClick={onClick}
            ref={btnRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`inline-block transition-transform duration-200 ease-out will-change-transform ${className}`}
        >
            {children}
        </button>
    );
};

const useScrollReveal = (view: string) => {
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

        const observeRevealNode = (node: Element) => {
            if (node.matches('.reveal')) {
                observer.observe(node);
            }
            node.querySelectorAll('.reveal').forEach(el => observer.observe(el));
        };

        const observeReveals = () => {
            document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
        };

        const timeoutId = window.setTimeout(observeReveals, 100);

        const mutationObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node instanceof Element) {
                        observeRevealNode(node);
                    }
                }
            }
        });
        mutationObserver.observe(document.body, { childList: true, subtree: true });

        return () => {
            window.clearTimeout(timeoutId);
            mutationObserver.disconnect();
            observer.disconnect();
        };
    }, [view]);
};

const CustomCursor = ({ active }: { active: boolean }) => {
    const dotRef = useRef<HTMLDivElement>(null);
    const [isPointer, setIsPointer] = useState(false);

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            if (dotRef.current) {
                dotRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0) translate(-50%, -50%)`;
            }

            const target = e.target as HTMLElement;
            const isClickable = target.closest('button, a, input, textarea, [role="button"]') ||
                window.getComputedStyle(target).cursor === 'pointer';
            setIsPointer(!!isClickable);
        };

        window.addEventListener('mousemove', onMouseMove);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
        };
    }, []);

    return (
        <div
            ref={dotRef}
            className={`hidden fixed top-0 left-0 w-2 h-2 bg-[#DC2626] rounded-full pointer-events-none z-[9999] mix-blend-difference will-change-transform transition-opacity duration-200 ${active || isPointer ? 'opacity-100 scale-[3]' : 'opacity-0 scale-100'}`}
            style={{ transform: 'translate(-100px, -100px)' }}
        />
    );
};

// --- GEMINI SERVICE (BACKEND PROXY) ---
const chatWithMono = async (history: any[], message: string) => {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ history, message }),
            credentials: 'include' // Important for cookies (session limit)
        });

        const data = await response.json();

        if (response.status === 429) {
            return data.message;
        }

        if (data.error) {
            return data.error;
        }

        return data.response;

    } catch (err) {
        return "SYSTEM_FAILURE: Unable to establish neural link.";
    }
};


// --- COMPONENTS: SECTIONS ---
const BrickLogo = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 10H90V90H10V10Z" fill="currentColor" fillOpacity="0.1" />
        <path d="M20 20H80V80H20V20Z" stroke="currentColor" strokeWidth="4" />
        <rect x="35" y="35" width="30" height="30" fill="#DC2626" />
    </svg>
);

const Header = ({ onChat, onWorks, onTransmissions, onHome, onAbout, isChatView }: { onChat: () => void, onWorks: () => void, onTransmissions: () => void, onHome: () => void, onAbout: () => void, isChatView: boolean }) => {
    const { t, i18n } = useTranslation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'pt' : 'en';
        i18n.changeLanguage(newLang);
    };

    const handleNav = (action: () => void) => {
        setMobileMenuOpen(false);
        action();
    }

    return (
        <React.Fragment>
            <header className="fixed top-0 left-0 w-full z-50 px-6 pt-8 pb-6 md:px-12 flex justify-between items-baseline pointer-events-none bg-gradient-to-b from-black/90 via-black/50 to-transparent transition-all duration-300">
                <div className="absolute inset-0 z-0 card-noise" style={{ opacity: 0.15 }}></div>
                <div onClick={onHome} className="pointer-events-auto flex items-baseline group cursor-pointer select-none z-50 relative">
                    <img src="/01.png" alt="BRICK" className="h-6 md:h-8 w-auto object-contain mr-1" />
                    <span className="text-[#DC2626] font-light text-3xl md:text-4xl animate-blink mx-2 translate-y-[2px]">_</span>
                    <span className="text-gray-300 font-ai text-xl md:text-2xl group-hover:text-white transition-colors duration-500">AI</span>
                </div>

                {/* MOBILE MENU TOGGLE */}
                {!isChatView && (
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="pointer-events-auto md:hidden text-white hover:text-[#DC2626] transition-colors z-50 relative p-2"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                )}

                {/* DESKTOP NAV */}
                {
                    !isChatView && (
                        <div className="hidden md:flex items-center gap-6 pointer-events-auto relative z-10">
                            {/* NAV STYLE: Raw Text Links */}


                            <MagneticButton onClick={onAbout} className="group text-xs md:text-sm font-ai text-[#9CA3AF] hover:text-[#DC2626] transition-colors duration-300">
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-2 duration-300">&gt;</span>
                                {t('header.about')}
                            </MagneticButton>

                            <MagneticButton onClick={onWorks} className="group text-xs md:text-sm font-ai text-[#9CA3AF] hover:text-[#DC2626] transition-colors duration-300">
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-2 duration-300">&gt;</span>
                                {t('header.works')}
                            </MagneticButton>

                            <MagneticButton onClick={onTransmissions} className="group text-xs md:text-sm font-ai text-[#9CA3AF] hover:text-[#DC2626] transition-colors duration-300">
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-2 duration-300">&gt;</span>
                                {t('header.transmissions')}
                            </MagneticButton>

                            {/* CTA STYLE: Subtle Blinking Underscore */}
                            <MagneticButton onClick={onChat} className="group text-xs md:text-sm font-ai text-white hover:text-[#DC2626] transition-colors duration-300">
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-2 duration-300">&gt;</span>
                                {t('header.talk_to_us')} <span className="text-[#DC2626] animate-blink group-hover:text-white">_</span>
                            </MagneticButton>

                            {/* LANGUAGE TOGGLE */}
                            <button
                                onClick={toggleLanguage}
                                className="ml-4 text-xs font-mono text-[#9CA3AF] hover:text-white transition-colors flex items-center gap-1 uppercase tracking-widest"
                            >
                                <Globe size={12} /> {i18n.language === 'en' ? 'PT' : 'EN'}
                            </button>
                        </div>
                    )
                }
            </header>

            {/* MOBILE MENU OVERLAY */}
            <div className={`fixed inset-0 z-40 bg-[#050505]/95 backdrop-blur-xl flex flex-col items-center justify-center transition-all duration-500 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className="scanline-effect absolute inset-0 z-0 opacity-20 pointer-events-none"></div>
                <div className="flex flex-col items-center gap-8 relative z-10 w-full px-8">
                    <button onClick={() => handleNav(onAbout)} className="text-2xl font-brick text-white hover:text-[#DC2626] transition-colors w-full text-center border-b border-white/10 pb-4">
                        {t('header.about')}
                    </button>
                    <button onClick={() => handleNav(onWorks)} className="text-2xl font-brick text-white hover:text-[#DC2626] transition-colors w-full text-center border-b border-white/10 pb-4">
                        {t('header.works')}
                    </button>
                    <button onClick={() => handleNav(onTransmissions)} className="text-2xl font-brick text-white hover:text-[#DC2626] transition-colors w-full text-center border-b border-white/10 pb-4">
                        {t('header.transmissions')}
                    </button>
                    <button onClick={() => handleNav(onChat)} className="text-2xl font-brick text-[#DC2626] hover:text-white transition-colors w-full text-center pb-4 animate-pulse">
                        {t('header.talk_to_us')} _
                    </button>

                    <button
                        onClick={toggleLanguage}
                        className="mt-8 text-sm font-mono text-[#9CA3AF] hover:text-white transition-colors flex items-center gap-2 uppercase tracking-widest border border-white/20 px-6 py-2 rounded-full"
                    >
                        <Globe size={14} /> {i18n.language === 'en' ? 'SWITCH TO PORTUGUESE' : 'SWITCH TO ENGLISH'}
                    </button>
                </div>
            </div>
        </React.Fragment>
    );
};

const Hero = ({ setMonolithHover, monolithHover }: { setMonolithHover: (v: boolean) => void, monolithHover: boolean }) => {
    const radiationRef = useRef<HTMLDivElement>(null);
    const lightSourceRef = useRef<HTMLDivElement>(null); // Interactive Red Dot tracking
    const targetPos = useRef({ x: 0, y: 0 });
    const currentPos = useRef({ x: 0, y: 0 });
    const { t } = useTranslation();

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!radiationRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        targetPos.current = { x: e.clientX - (rect.left + rect.width / 2), y: e.clientY - (rect.top + rect.height / 2) };
    };

    const handleMouseEnter = () => setMonolithHover(true);
    const handleMouseLeave = () => { setMonolithHover(false); targetPos.current = { x: 0, y: 0 }; };

    useEffect(() => {
        let rafId: number;
        const animate = () => {
            const ease = 0.04; // Slower ease for "laggy" feel
            currentPos.current.x += (targetPos.current.x - currentPos.current.x) * ease;
            currentPos.current.y += (targetPos.current.y - currentPos.current.y) * ease;

            if (radiationRef.current) {
                const { x, y } = currentPos.current;
                const scale = monolithHover ? 1.4 : 0.8;
                const opacity = monolithHover ? 1 : 0;
                radiationRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
                radiationRef.current.style.opacity = opacity.toString();
            }

            // Update Light Source Dot (The "Bolinha Vermelha")
            if (lightSourceRef.current) {
                const { x, y } = currentPos.current;
                lightSourceRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
                lightSourceRef.current.style.opacity = monolithHover ? '1' : '0';
            }
            rafId = requestAnimationFrame(animate);
        };
        animate();
        return () => cancelAnimationFrame(rafId);
    }, [monolithHover]);

    return (
        <section className="relative w-full flex flex-col items-center justify-start pt-32 md:pt-40 pb-20 md:pb-32 overflow-visible">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[100vh] bg-[#DC2626]/5 rounded-full blur-[150px] pointer-events-none z-0 mix-blend-screen opacity-40"></div>

            <div className="reveal relative z-10 w-full flex justify-center mb-8 md:mb-12">
                <div className="relative">
                    <div
                        className={`monolith-structure w-[120px] h-[240px] md:w-[150px] md:h-[300px] rounded-[2px] flex items-center justify-center overflow-visible shadow-2xl relative transition-transform duration-1000 ease-out pointer-events-none ${monolithHover ? 'scale-[1.02]' : 'scale-100'}`}
                        style={{ transform: 'translateZ(0)' }}
                    >
                        <div className="absolute inset-0 mix-blend-overlay monolith-texture bg-neutral-900 pointer-events-none rounded-[2px] overflow-hidden"></div>
                        <div className="centered-layer aura-atmos pointer-events-none opacity-60 w-[400px] h-[400px] blur-[60px]"></div>
                        <div className="centered-layer light-atmos animate-breathe pointer-events-none opacity-60 w-[300px] h-[300px] blur-[40px]"></div>
                        <div className="centered-layer core-atmos pointer-events-none"></div>

                        {/* INTERACTIVE RED DOT SOURCE */}
                        <div
                            ref={lightSourceRef}
                            className="absolute z-30 w-1.5 h-1.5 bg-[#DC2626] rounded-full pointer-events-none mix-blend-screen shadow-[0_0_8px_rgba(220,38,38,1)] transition-opacity duration-300 ease-out"
                            style={{
                                top: '50%',
                                left: '50%',
                                marginTop: '-3px',
                                marginLeft: '-3px',
                                opacity: 0,
                                willChange: 'transform, opacity'
                            }}
                        ></div>

                        <div
                            ref={radiationRef}
                            className="absolute w-[600px] h-[600px] -ml-[300px] -mt-[300px] top-1/2 left-1/2 pointer-events-none transition-opacity duration-700 ease-out"
                            style={{
                                background: 'radial-gradient(circle, rgba(220,38,38,0.2) 0%, rgba(220,38,38,0.05) 50%, transparent 80%)',
                                filter: 'blur(60px)',
                                zIndex: 5,
                                opacity: 0,
                                willChange: 'transform, opacity',
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                                perspective: 1000,
                                transformStyle: 'preserve-3d'
                            }}
                        ></div>
                        <div className="absolute inset-0 border border-white/5 opacity-50 pointer-events-none z-10 rounded-[2px]"></div>
                    </div>
                    <div
                        className="absolute inset-0 z-20 cursor-none"
                        onMouseMove={handleMouseMove}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        style={{ width: '150%', height: '150%', left: '-25%', top: '-25%' }}
                    ></div>
                </div>
            </div>
            <div className="reveal delay-200 text-center z-20 max-w-6xl px-4 flex flex-col items-center pointer-events-none">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-brick text-white mb-4 md:mb-6 drop-shadow-2xl">
                    {t('hero.title')}
                </h1>
                <p className="text-base md:text-xl lg:text-2xl font-light tracking-[0.3em] text-[#E5E5E5]/80 mb-2 md:mb-4">{t('hero.subtitle')}</p>
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-brick text-[#DC2626] drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                    <ScrambleText text={t('hero.scramble') as string} />
                </h2>
                <p className="mt-8 text-[#9CA3AF] text-[10px] md:text-xs font-light tracking-[0.2em] uppercase opacity-60 max-w-md border-t border-white/10 pt-4 whitespace-pre-line">{t('hero.description')}</p>
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#DC2626]/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
        </section>
    );
};

const Philosophy = () => {
    const { t } = useTranslation();

    return (
        <section className="relative w-full py-20 bg-[#050505] z-20 border-t border-white/5">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent -translate-x-1/2 hidden md:block"></div>
            <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
                <div className="mb-20 reveal flex flex-col items-center">
                    <div className="w-2 h-2 bg-[#DC2626] rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)] mb-6"></div>
                    <span className="text-xs font-ai text-[#9CA3AF] bg-[#050505] px-4">{t('philosophy.belief_label')}</span>
                </div>
                <div className="flex flex-col gap-24 w-full">
                    <PhilosophyItem title={t('philosophy.raw.title')} text={t('philosophy.raw.text')} />
                    <PhilosophyItem title={t('philosophy.noise.title')} text={t('philosophy.noise.text')} />
                    <PhilosophyItem title={t('philosophy.direct.title')} text={t('philosophy.direct.text')} />
                </div>
            </div>
        </section>
    );
};

const PhilosophyItem = ({ title, text }: { title: string, text: string }) => (
    <div className="reveal flex flex-col items-center group cursor-default">
        <h2 className="text-4xl md:text-6xl font-brick text-white mb-4 transition-colors duration-500 group-hover:text-[#DC2626]">{title}</h2>
        <p className="text-base md:text-lg text-[#9CA3AF] font-light max-w-lg leading-relaxed group-hover:text-white transition-colors duration-300">{text}</p>
    </div>
);

// --- COMPONENTE DE DATA CHIP ---
// Um pequeno elemento decorativo de "dado" que processa
const DataChip = ({ label, value }: { label: string, value: string }) => (
    <div className="flex flex-col gap-1">
        <span className="text-[8px] font-mono text-[#9CA3AF]/60 tracking-widest uppercase">{label}</span>
        <span className="text-[10px] font-mono text-white/90 tracking-widest uppercase border-b border-white/10 pb-0.5">{value}</span>
    </div>
);

const WorkCard = ({ work, index, onOpen }: { work: Work, index: number, onOpen: (work: Work) => void }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const bgRef = useRef<HTMLDivElement>(null);
    const settings = work.imageSettingsHome || { x: 50, y: 50, scale: 1.2 };

    // State only for hover visibility
    const [isHovered, setIsHovered] = useState(false);

    const { t } = useTranslation();
    const randomHash = useMemo(() => Math.random().toString(36).substring(7).toUpperCase(), []);

    return (
        <div
            ref={containerRef}
            onClick={() => work.hasDetail && onOpen(work)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`reveal relative h-[500px] md:h-full overflow-hidden border border-white/10 hover:border-[#DC2626] transition-colors duration-300 bg-[#050505] group ${work.hasDetail ? 'cursor-pointer' : 'cursor-default'}`}
            style={{
                flexGrow: isHovered ? 1.6 : 1,
                flexShrink: 0,
                flexBasis: 0,
                willChange: 'flex-grow',
                transition: isHovered
                    ? 'flex-grow 6s linear'
                    : 'flex-grow 2s linear',
            }}
        >
            {/* BACKGROUND LAYER - AUTONOMOUS PARALLAX */}
            <div
                className={`absolute inset-0 z-10 animate-float-parallax`}
                style={{
                    animationDelay: `${index * -4}s`,
                }}
            >
                <div
                    ref={bgRef}
                    className="absolute inset-0 opacity-80 group-hover:opacity-100 will-change-transform filter saturate-[0.6] group-hover:saturate-100 contrast-[1.1] brightness-[0.9] group-hover:brightness-[1.1] transition-all duration-[6000ms] ease-linear"
                    style={{
                        backgroundImage: `url('${work.imageHome}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center center',
                        transform: `scale(${settings.scale}) translate(${(settings.x - 50) * 2}%, ${(settings.y - 50) * 2}%)`
                    }}
                ></div>
            </div>

            {/* ARTIFICIAL DEPTH OVERLAYS */}
            <div className="absolute inset-0 card-noise z-20 pointer-events-none opacity-25 group-hover:opacity-10 transition-opacity duration-[6000ms] ease-linear"></div>
            <div className="absolute inset-0 bg-tech-grid opacity-10 z-20 pointer-events-none group-hover:opacity-30 transition-opacity duration-[6000ms] ease-linear"></div>

            {/* VIGNETTE & GRADIENT */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-30 opacity-60 group-hover:opacity-40 transition-opacity duration-[6000ms] ease-linear"></div>
            <div className={`absolute inset-0 z-30 transition-opacity duration-[6000ms] ease-linear pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] ${isHovered ? 'opacity-40' : 'opacity-60'}`}></div>

            {/* CONTENT LAYER - VERTICAL TITLE ON IDLE */}
            <div className="absolute inset-0 z-40 p-6 md:p-10 lg:p-14 flex flex-col justify-end pointer-events-none">
                {/* HEADER TAGS (Reveal on Hover) */}
                <div className={`flex items-center gap-4 mb-4 transform transition-all duration-500 ease-out ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 h-0 overflow-hidden'}`}>
                    <span className="font-mono text-[10px] text-[#DC2626] tracking-widest bg-[#DC2626]/10 px-3 py-1 border border-[#DC2626]/20">{work.id.toUpperCase()}</span>
                    <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="w-1 h-1 bg-[#DC2626] animate-pulse" style={{ animationDelay: `${i * 200}ms` }}></div>
                        ))}
                    </div>
                </div>

                {/* MAIN TITLE (Always Visible - High Contrast) */}
                <h3 className="text-4xl md:text-6xl lg:text-7xl font-brick text-white uppercase tracking-tighter leading-[0.85] mb-6 whitespace-normal filter drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] transition-all duration-500 select-none">
                    {work.title}
                </h3>

                {/* DETAILS CONTENT (Reveal on Hover) */}
                <div className={`transform transition-all duration-500 ease-out ${isHovered ? 'opacity-100 max-h-[300px] translate-y-0' : 'opacity-0 max-h-0 translate-y-4'}`}>
                    <p className="text-[#9CA3AF] text-xs md:text-sm font-mono uppercase tracking-[0.2em] mb-8 border-l-2 border-[#DC2626] pl-6 py-1 drop-shadow-md">
                        {work.category} <span className="text-[#DC2626]/50 mx-2">//</span> {work.subtitle}
                    </p>

                    {/* Technical Decors */}
                    <div className="flex flex-wrap gap-6 pt-8 border-t border-white/10">
                        <DataChip label="ARCHIVE_REF" value={randomHash} />
                        <DataChip label="RESOLUTION" value="PRORES_4444" />
                        <div className="hidden lg:block">
                            <DataChip label="NODE_STATUS" value="ACTIVE_SYNAPSE" />
                        </div>
                    </div>
                </div>
            </div>

            {/* EDGE DECOR */}
            <div className="absolute top-6 right-6 z-40 opacity-60 group-hover:opacity-100 transition-all duration-700 text-[10px] font-mono text-[#DC2626] hidden md:block group-hover:translate-x-[-10px]">
                <span className="mr-2">◈</span>LOG_DATA_{index.toString().padStart(2, '0')}
            </div>

            {/* SCANLINE OVERLAY ON HOVER */}
            <div className="absolute inset-0 scanline-effect opacity-0 group-hover:opacity-20 transition-opacity duration-1000 z-20 pointer-events-none"></div>
        </div >
    );
};

const SelectedWorks = ({ onSelectProject }: { onSelectProject: (work: Work) => void }) => {
    const { t } = useTranslation();
    return (
        <section id="works" className="w-full pt-16 pb-0 bg-[#050505] border-t border-white/5 relative z-40 overflow-hidden">
            <div className="px-6 md:px-12 lg:px-24 mb-12 reveal flex justify-between items-end border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                    <Database className="w-4 h-4 text-[#DC2626]" />
                    <h2 className="text-xs md:text-sm font-mono text-[#9CA3AF] uppercase tracking-[0.2em]">{t('works_page.title')}</h2>
                </div>
                <div className="hidden md:flex gap-4 text-[9px] font-mono text-[#9CA3AF]/50">
                    <span>SYS.VER. 5.1_B</span>
                    <span>{t('common.secure_connection')}</span>
                </div>
            </div>

            <div className="flex flex-col md:flex-row w-full h-auto md:h-[80vh] border-b border-white/10 px-6 md:px-12 lg:px-24">
                <ContextConsumer>
                    {({ works }) => works.slice(0, 5).map((work, idx) => (
                        <WorkCard key={idx} work={work} index={idx} onOpen={onSelectProject} />
                    ))}
                </ContextConsumer>
            </div>
        </section>
    );
};

const Legacy = () => {
    const { t } = useTranslation();
    return (
        <section className="w-full py-20 px-6 md:px-12 lg:px-24 bg-[#E5E5E5] text-[#050505] relative overflow-hidden">
            <div className="max-w-[1400px] mx-auto reveal">
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-brick mb-12 leading-[0.85]">{t('legacy.title')}</h2>
                <div className="flex flex-col lg:flex-row gap-12 border-t-4 border-[#050505] pt-12">
                    <div className="lg:w-1/2">
                        <p className="text-lg md:text-xl font-light leading-tight max-w-lg">
                            {t('legacy.text')}
                        </p>
                    </div>
                    <div className="lg:w-1/2">
                        <h4 className="text-xs font-bold tracking-[0.2em] uppercase mb-8 text-neutral-400 border-b border-neutral-200 pb-4 inline-block">{t('legacy.trusted_by')}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8 w-full">
                            {CLIENTS.map((client, i) => (
                                <div key={i} className="flex items-start justify-start group">
                                    <span className="text-sm md:text-base font-black text-neutral-300 group-hover:text-[#050505] transition-colors duration-300 cursor-default tracking-tighter uppercase whitespace-nowrap">
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

const ProjectModal = ({ project, onClose }: { project: Work, onClose: () => void }) => {
    const { t } = useTranslation();
    const [isLoaded, setIsLoaded] = useState(false);
    const settings = project.imageSettingsHome || { x: 50, y: 50, scale: 1.2 };

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        setTimeout(() => setIsLoaded(true), 100);
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    if (!project) return null;

    const isHorizontal = project.orientation === 'horizontal';
    const getVimeoId = (url: string) => {
        const match = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
        return match ? match[1] : null;
    };
    const vimeoId = project.videoUrl ? getVimeoId(project.videoUrl) : null;

    const modalClasses = isHorizontal
        ? 'max-w-7xl w-[95%] h-[80vh] md:h-auto md:max-h-[85vh] md:aspect-[16/7]'
        : 'max-w-5xl w-[95%] h-[85vh] md:h-auto md:max-h-[90vh] md:aspect-auto';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl transition-opacity duration-500" onClick={onClose}></div>
            <div className={`relative w-full ${modalClasses} bg-[#050505] border border-white/10 flex flex-col md:flex-row shadow-2xl animate-fade-in-up overflow-hidden`}>
                <button onClick={onClose} className="absolute top-4 right-4 z-50 text-white/50 hover:text-[#DC2626] transition-colors p-2 mix-blend-difference">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <div className={`w-full md:w-2/3 bg-[#050505] relative border-b md:border-b-0 md:border-r border-white/10 group overflow-hidden flex items-center justify-center`}>
                    <div className="absolute inset-0 w-full h-full">
                        {project.videoUrl ? (
                            vimeoId ? (
                                <iframe
                                    src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&loop=1&background=1&muted=1`}
                                    className="w-full h-full opacity-80"
                                    frameBorder="0"
                                    allow="autoplay; fullscreen; picture-in-picture"
                                    allowFullScreen
                                    title={project.title}
                                ></iframe>
                            ) : (
                                <video
                                    src={project.videoUrl}
                                    className="w-full h-full object-cover opacity-80"
                                    autoPlay loop muted playsInline
                                />
                            )
                        ) : (
                            <div className="placeholder-video w-full h-full flex items-center justify-center relative">
                                <div
                                    className="absolute inset-0 opacity-40 bg-cover transition-transform duration-1000 group-hover:scale-105"
                                    style={{
                                        backgroundImage: `url('${project.imageHome}')`,
                                        backgroundPosition: 'center center',
                                        transform: `scale(${settings.scale}) translate(${(settings.x - 50) * 2}%, ${(settings.y - 50) * 2}%)`
                                    }}
                                ></div>
                                <div className="z-10 w-16 h-16 rounded-full border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:border-[#DC2626] transition-all duration-300 cursor-pointer backdrop-blur-sm bg-[#050505]/30">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                </div>
                            </div>
                        )}
                        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end text-[10px] font-mono tracking-widest text-white/50 pointer-events-none z-20">
                            <span>{project.videoUrl ? t('project_modal.neural_active') : t('project_modal.static_preview')}</span>
                            <span>{isHorizontal ? '16:9' : '9:16'} // 4K</span>
                        </div>
                    </div>
                </div>
                <div className="w-full md:w-1/3 bg-[#050505] flex flex-col p-6 md:p-8 h-full overflow-y-auto scrollbar-hide">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-1.5 h-1.5 bg-[#DC2626] animate-pulse"></div>
                            <span className="text-[10px] font-mono text-[#9CA3AF] tracking-[0.2em] uppercase">{project.subtitle}</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-brick text-white mb-4 leading-none">{project.title}</h2>
                    </div>
                    <div className="flex-1 py-4">
                        <p className="text-[#E5E5E5]/80 font-light text-xs md:text-sm leading-relaxed">{project.longDesc || project.desc}</p>
                    </div>
                    <div className="border-t border-white/10 pt-4 mt-auto">
                        <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9CA3AF] mb-3">{t('project_modal.system_data')}</h4>
                        <div className="space-y-2">
                            {project.credits && project.credits.map((credit, idx) => (
                                <div key={idx} className="flex justify-between items-baseline text-[10px] md:text-xs font-mono">
                                    <span className="text-[#9CA3AF] opacity-60 uppercase">{credit.role}</span>
                                    <span className="text-white text-right">{credit.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const WorksGridItem = ({ work, index, onOpen }: { work: Work, index: number, onOpen: (work: Work) => void }) => {
    const settings = work.imageSettingsWorks || { x: 50, y: 50, scale: 1.2 };

    return (
        <div
            className="group relative w-full aspect-square border border-white/10 bg-[#050505] overflow-hidden cursor-pointer hover:border-[#DC2626] transition-colors duration-300 reveal"
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => onOpen(work)}
        >
            {/* UPDATED FILTERS FOR VISIBILITY */}
            <div
                className="absolute inset-0 opacity-70 saturate-110 brightness-90 group-hover:saturate-125 group-hover:opacity-100 group-hover:brightness-100 transition-all duration-700"
                style={{
                    backgroundImage: `url('${work.imageWorks || work.imageHome}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    transform: `scale(${settings.scale}) translate(${(settings.x - 50) * 2}%, ${(settings.y - 50) * 2}%)`
                }}
            ></div>

            {/* Tech Grid Overlay for consistency */}
            <div className="absolute inset-0 bg-tech-grid opacity-20 z-10 pointer-events-none group-hover:opacity-10 transition-opacity duration-300"></div>

            <div className="scanline-effect z-20"></div>
            {/* UPDATED GRADIENT OPACITY */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-transparent to-transparent group-hover:opacity-70 transition-opacity duration-300 z-20"></div>

            <div className="absolute inset-0 p-6 flex flex-col justify-between z-30">
                <div className="flex justify-between items-start opacity-50 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="font-mono text-[10px] tracking-widest text-[#DC2626]">{(index + 1).toString().padStart(3, '0')}</span>
                    <span className="font-mono text-[10px] tracking-widest border border-white/20 px-2 py-0.5 rounded-full">{work.category}</span>
                </div>
                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-lg md:text-xl font-brick text-white leading-none mb-2 tracking-tight group-hover:text-[#DC2626] transition-colors">{work.title}</h3>
                    <p className="text-[10px] md:text-xs text-[#9CA3AF] font-mono tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 line-clamp-2">{work.desc}</p>
                </div>
            </div>
            <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-white/30 group-hover:border-[#DC2626] transition-colors z-40"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-white/30 group-hover:border-[#DC2626] transition-colors z-40"></div>
        </div>
    );
};

const WorksFilter = ({ categories, activeCategory, onSelect }: { categories: string[], activeCategory: string, onSelect: (c: string) => void }) => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-wrap gap-4 mb-12 border-b border-white/10 pb-6 reveal">
            <span className="text-[10px] font-ai text-[#9CA3AF] uppercase py-2 mr-4 hidden md:block">{t('works_page.protocols')} //</span>
            {categories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => onSelect(cat)}
                    className={`text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 px-3 py-1 border ${activeCategory === 'ALL' && cat === 'ALL' ? 'bg-[#DC2626] border-[#DC2626] text-white' : activeCategory === cat ? 'bg-[#DC2626] border-[#DC2626] text-white' : 'bg-transparent border-transparent text-[#9CA3AF] hover:text-white hover:border-white/20'}`}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
};

const WorksPage = ({ onChat, onWorks, onTransmissions, onHome, onSelectProject, onAbout }: any) => {
    const { t } = useTranslation();
    const [activeCategory, setActiveCategory] = useState("ALL");
    const { works } = useContext(DataContext)!;

    const categories = useMemo(() => {
        const cats = new Set(works.map(w => w.category));
        return ["ALL", ...Array.from(cats)];
    }, [works]);
    const filteredWorks = useMemo(() => {
        if (activeCategory === "ALL") return works;
        return works.filter(w => w.category === activeCategory);
    }, [activeCategory, works]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

        const timeoutId = setTimeout(() => {
            document.querySelectorAll('.grid .reveal').forEach(el => observer.observe(el));
        }, 50);

        return () => {
            observer.disconnect();
            clearTimeout(timeoutId);
        };
    }, [activeCategory]);

    return (
        <React.Fragment>
            <Header onChat={onChat} onWorks={onWorks} onTransmissions={onTransmissions} onHome={onHome} onAbout={onAbout} isChatView={false} />
            <button onClick={onHome} className="fixed top-24 left-6 md:left-12 text-[#9CA3AF] hover:text-white text-xs md:text-sm tracking-widest uppercase transition-colors z-40 flex items-center gap-2 group mix-blend-difference">
                <span className="text-[#DC2626] group-hover:-translate-x-1 transition-transform">&lt;</span> {t('common.return_surface')}
            </button>
            <main className="pt-24 md:pt-32 min-h-screen flex flex-col">
                <section className="w-full px-6 md:px-12 lg:px-24 mb-12 reveal">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-brick text-white mb-4">{t('works_page.archive_index')}</h1>
                            <p className="text-[#9CA3AF] font-mono text-[10px] md:text-xs tracking-widest max-w-xl">{t('works_page.accessing')} {works.length} {t('works_page.entries_found')}</p>
                        </div>
                    </div>
                </section>
                <section className="w-full px-6 md:px-12 lg:px-24 flex-1 pb-32">
                    <WorksFilter categories={categories} activeCategory={activeCategory} onSelect={setActiveCategory} />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
                        {filteredWorks.map((work, idx) => (
                            <WorksGridItem key={work.id} work={work} index={idx} onOpen={onSelectProject} />
                        ))}
                    </div>
                    {filteredWorks.length === 0 && (
                        <div className="w-full h-64 flex items-center justify-center border border-white/10 border-dashed text-[#9CA3AF] font-mono text-sm tracking-widest reveal">{t('works_page.no_data')}</div>
                    )}
                </section>
            </main>
            <Footer onChat={onChat} />
        </React.Fragment>
    );
}

const BlogPostPage = ({ post, onBack, onChat, onWorks, onTransmissions, onHome, onAbout }: any) => {
    const { t } = useTranslation();
    return (
        <React.Fragment>
            <Header onChat={onChat} onWorks={onWorks} onTransmissions={onTransmissions} onHome={onHome} onAbout={onAbout} isChatView={false} />
            <button onClick={onBack} className="fixed top-24 left-6 md:left-12 text-[#9CA3AF] hover:text-white text-xs md:text-sm tracking-widest uppercase transition-colors z-40 flex items-center gap-2 group mix-blend-difference">
                <span className="text-[#DC2626] group-hover:-translate-x-1 transition-transform">&lt;</span> {t('common.return_index')}
            </button>
            <main className="pt-32 min-h-screen flex flex-col bg-[#050505] pb-32">
                <article className="w-full max-w-3xl mx-auto px-6 md:px-12 mt-12 animate-fade-in-up">
                    <div className="border-b border-white/10 pb-8 mb-12">
                        <div className="flex flex-wrap gap-4 items-center mb-6 text-[10px] font-mono uppercase tracking-widest">
                            <span className="text-[#DC2626]">LOG_ID: {post.id}</span>
                            <span className="text-[#9CA3AF]">DATE: {post.date}</span>
                            {post.tags.map((tag: string) => (
                                <span key={tag} className="border border-white/10 px-2 py-0.5 text-white/50">{tag}</span>
                            ))}
                        </div>
                        <h1 className="text-2xl md:text-4xl lg:text-5xl font-brick text-white leading-tight tracking-tight mb-6">{post.title}</h1>
                        <p className="text-base md:text-lg text-[#9CA3AF] font-light leading-relaxed border-l-2 border-[#DC2626] pl-6">{post.excerpt}</p>
                    </div>
                    <div className="prose prose-invert prose-lg max-w-none">
                        {typeof post.content === 'string'
                            ? <div dangerouslySetInnerHTML={{ __html: post.content }} />
                            : post.content}
                    </div>
                </article>
            </main>
            <Footer onChat={onChat} />
        </React.Fragment>
    );
};

const TransmissionsPage = ({ onHome, onChat, onWorks, onTransmissions, onSelectPost, onAbout }: any) => {
    const { t } = useTranslation();
    const { transmissions } = useContext(DataContext)!;
    return (
        <React.Fragment>
            <Header onChat={onChat} onWorks={onWorks} onTransmissions={onTransmissions} onHome={onHome} onAbout={onAbout} isChatView={false} />
            <button onClick={onHome} className="fixed top-24 left-6 md:left-12 text-[#9CA3AF] hover:text-white text-xs md:text-sm tracking-widest uppercase transition-colors z-40 flex items-center gap-2 group mix-blend-difference">
                <span className="text-[#DC2626] group-hover:-translate-x-1 transition-transform">&lt;</span> {t('common.return_surface')}
            </button>
            <main className="pt-24 md:pt-32 min-h-screen flex flex-col bg-[#050505]">
                <section className="w-full px-6 md:px-12 lg:px-24 mb-12 reveal">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-brick text-white mb-4">{t('transmissions_page.title')}</h1>
                            <p className="text-[#9CA3AF] font-mono text-[10px] md:text-xs tracking-widest max-w-xl">{t('transmissions_page.incoming')} {transmissions.length} {t('transmissions_page.records')}</p>
                        </div>
                    </div>
                </section>
                <section className="w-full px-6 md:px-12 lg:px-24 flex-1 pb-32 reveal">
                    <div className="space-y-px bg-white/10 border-t border-white/10">
                        {transmissions.map((post) => (
                            <div key={post.id} onClick={() => onSelectPost(post)} className="block group bg-[#050505] hover:bg-[#0a0a0a] transition-colors p-8 md:p-10 border-b border-white/10 cursor-pointer">
                                <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 mb-4">
                                    <h3 className="text-xl md:text-3xl font-brick text-white tracking-tight group-hover:text-[#DC2626] transition-colors">{post.title}</h3>
                                    <span className="font-mono text-[10px] text-[#DC2626] tracking-widest whitespace-nowrap">{post.date}</span>
                                </div>
                                <p className="text-[#9CA3AF] text-sm md:text-base font-light max-w-3xl mb-6 leading-relaxed">{post.excerpt}</p>
                                <div className="flex gap-3">
                                    {post.tags.map(tag => (
                                        <span key={tag} className="text-[9px] font-mono border border-white/10 px-3 py-1.5 text-[#9CA3AF]/60 uppercase tracking-wider">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
            <Footer onChat={onChat} />
        </React.Fragment>
    );
};

const Footer = ({ onChat, onAdmin }: { onChat: () => void, onAdmin?: () => void }) => {
    const { t } = useTranslation();
    return (
        <footer className="w-full py-24 px-6 md:px-12 lg:px-24 bg-[#050505] border-t border-white/5 relative z-10">
            <div className="flex flex-col items-center text-center gap-8 reveal">
                <h2 className="text-xs md:text-sm font-ai text-[#9CA3AF] uppercase">{t('footer.complex_problem')}</h2>
                <p className="text-3xl md:text-5xl lg:text-6xl font-brick text-white leading-none max-w-5xl">{t('footer.we_have_intelligence')}</p>
                <MagneticButton onClick={onChat} className="mt-6 text-base md:text-lg font-ai font-bold text-white hover:text-[#DC2626] group">
                    {t('footer.talk_to_us')} <span className="text-[#DC2626] animate-blink group-hover:text-white">_</span>
                </MagneticButton>
            </div>
            <div className="mt-24 border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-end gap-8 reveal">
                <div className="flex flex-col gap-4 items-center md:items-start w-full md:w-auto">
                    <span className="text-[9px] font-mono text-[#DC2626] tracking-widest uppercase">{t('footer.network')}</span>
                    <div className="flex gap-6">
                        {['LinkedIn', 'Instagram', 'Twitter'].map((social) => (
                            <a key={social} href={`https://${social.toLowerCase()}.com/brickai`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-white hover:text-[#DC2626] tracking-widest uppercase transition-colors">{social}</a>
                        ))}
                    </div>
                </div>
                <div className="text-[9px] uppercase tracking-[0.2em] text-[#9CA3AF]/40 font-bold text-center md:text-right w-full md:w-auto">
                    <span className="block mb-2">&copy; 2025 Brick AI.</span>
                    <span className="hidden md:inline">{t('footer.generative_division')}</span>
                    <span className="block mt-1">{t('footer.rights_reserved')}</span>
                    {onAdmin && <button onClick={onAdmin} className="mt-4 opacity-20 hover:opacity-100 transition-opacity">{t('footer.system_admin')}</button>}
                </div>
            </div>
        </footer>
    );
};

const SystemChat = ({ onBack }: { onBack: () => void }) => {
    const { t } = useTranslation();
    const [messages, setMessages] = useState<{ role: string, content: string }[]>([
        { role: 'mono', content: t('chat.initial_messages.online') },
        { role: 'mono', content: t('chat.initial_messages.protocol') }
    ]);
    const [input, setInput] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const SUGGESTIONS = [
        t('chat.suggestions.philosophy'),
        t('chat.suggestions.audit'),
        t('chat.suggestions.synthesis'),
        t('chat.suggestions.humans')
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (textInput: string | React.FormEvent) => {
        if (typeof textInput !== 'string') textInput.preventDefault();
        const messageToSend = typeof textInput === 'string' ? textInput : input;
        if (!messageToSend.trim() || isProcessing) return;

        setInput("");
        setMessages(prev => [...prev, { role: 'user', content: messageToSend }]);
        setIsProcessing(true);

        const response = await chatWithMono(messages, messageToSend);

        setMessages(prev => [...prev, { role: 'mono', content: response }]);
        setIsProcessing(false);
    };

    return (
        <div className="min-h-screen pt-24 md:pt-40 pb-20 flex flex-col items-center justify-start font-mono relative bg-[#050505] overflow-x-hidden">

            {/* RETURN BUTTON */}
            <button onClick={onBack} className="fixed top-24 left-6 md:left-12 text-[#9CA3AF] hover:text-white text-xs md:text-sm tracking-widest uppercase transition-colors z-40 flex items-center gap-2 group mix-blend-difference">
                <span className="text-[#DC2626] group-hover:-translate-x-1 transition-transform">&lt;</span> {t('common.return_surface')}
            </button>

            <main className="w-full max-w-7xl mx-auto px-6 md:px-12 relative z-10 flex flex-col gap-24">

                {/* 1. CONTACT SECTION (Humans) */}
                <section className="w-full animate-fade-in-up">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/10 pb-6">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-brick text-white mb-2">REACH_<span className="text-[#DC2626]">HUMANS</span></h1>
                            <p className="text-[#9CA3AF] font-mono text-xs tracking-widest uppercase">{t('chat.manual_override')}</p>
                        </div>
                        <div className="hidden md:block text-right">
                            <span className="text-[10px] font-mono text-[#9CA3AF]/60 uppercase tracking-widest">{t('chat.status_online')}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                        {/* EMAIL */}
                        <a href="mailto:brick@brick.mov" className="group block bg-[#0A0A0A] border border-white/5 p-8 hover:border-[#DC2626] transition-colors duration-500">
                            <div className="mb-4 text-[#DC2626] opacity-50 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] uppercase tracking-widest border border-[#DC2626] px-2 py-1">Channel_01</span>
                            </div>
                            <h3 className="text-2xl font-brick text-white mb-1 group-hover:text-[#DC2626] transition-colors">{t('chat.email_streams')}</h3>
                            <p className="text-[#9CA3AF] text-xs font-mono tracking-widest">BRICK@BRICK.MOV</p>
                        </a>

                        {/* PHONE */}
                        <a href="tel:+5511999999999" className="group block bg-[#0A0A0A] border border-white/5 p-8 hover:border-[#DC2626] transition-colors duration-500">
                            <div className="mb-4 text-[#DC2626] opacity-50 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] uppercase tracking-widest border border-[#DC2626] px-2 py-1">Channel_02</span>
                            </div>
                            <h3 className="text-2xl font-brick text-white mb-1 group-hover:text-[#DC2626] transition-colors">{t('chat.voice_link')}</h3>
                            <p className="text-[#9CA3AF] text-xs font-mono tracking-widest">+55 11 99999-9999</p>
                        </a>

                        {/* SOCIAL */}
                        <div className="group block bg-[#0A0A0A] border border-white/5 p-8 hover:border-[#DC2626] transition-colors duration-500">
                            <div className="mb-4 text-[#DC2626] opacity-50 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] uppercase tracking-widest border border-[#DC2626] px-2 py-1">Channel_03</span>
                            </div>
                            <h3 className="text-2xl font-brick text-white mb-4 group-hover:text-[#DC2626] transition-colors">{t('chat.network_nodes')}</h3>
                            <div className="flex flex-wrap gap-4">
                                {['LinkedIn', 'Instagram', 'Twitter'].map(social => (
                                    <a key={social} href={`https://${social.toLowerCase()}.com/brickai`} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-[#9CA3AF] hover:text-white uppercase tracking-wider underline decoration-white/20 hover:decoration-white">{social}</a>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. MASON INTELLIGENCE - SYMMETRICAL LAYOUT */}
                <section className="w-full flex flex-col md:flex-row gap-0 items-start animate-fade-in-up border-t border-white/10 pt-12" style={{ animationDelay: '0.2s' }}>

                    {/* LEFT: THE AVATAR (Static Monolith) */}
                    <div className="w-full md:w-5/12 flex flex-col items-center justify-center p-12 border-r border-white/5 relative bg-[#050505]">
                        <div className="relative w-[150px] h-[300px] md:w-[180px] md:h-[360px]">
                            {/* The Monolith Shape - Identical to Hero but no mouse interaction */}
                            <div
                                className={`monolith-structure w-full h-full rounded-[2px] relative z-10 shadow-2xl transition-all duration-300 ${isProcessing ? 'shadow-[0_0_60px_rgba(220,38,38,0.3)]' : ''}`}
                            >
                                <div className="absolute inset-0 monolith-texture opacity-80 mix-blend-overlay pointer-events-none rounded-[2px] overflow-hidden"></div>

                                {/* Static Atmospherics */}
                                <div className="centered-layer aura-atmos pointer-events-none opacity-40 w-[300px] h-[300px] blur-[80px]"></div>
                                <div className="centered-layer light-atmos animate-breathe pointer-events-none opacity-60 w-[200px] h-[200px] blur-[50px]"></div>

                                {/* Core Glow / Eye - Pulses on Thinking/Talking */}
                                <div className={`centered-layer core-atmos pointer-events-none shadow-[0_0_40px_rgba(220,38,38,1)] transition-all duration-200 ${isProcessing ? 'animate-talking scale-150 opacity-100' : 'animate-thinking opacity-80'}`}></div>

                                {/* Glass Reflection */}
                                <div className="absolute inset-0 border border-white/5 opacity-30 pointer-events-none z-10 rounded-[2px]"></div>
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-20"></div>
                            </div>
                        </div>

                        <div className="mt-12 text-center">
                            <h2 className="text-4xl font-brick text-white mb-2">{t('chat.mason_intro') ? t('chat.mason_intro').toUpperCase() : "I AM MASON"}</h2>
                            <p className="text-[10px] text-[#9CA3AF] font-mono tracking-widest max-w-[200px] mx-auto uppercase">
                                {t('chat.generative_core')}<br />{t('chat.state')} {isProcessing ? t('chat.active') : t('chat.idle')}
                            </p>
                        </div>
                    </div>

                    {/* RIGHT: THE TERMINAL (Chat Interface) */}
                    <div className="w-full md:w-7/12 pl-0 md:pl-12">
                        <div className="w-full bg-[#0A0A0A] border border-white/10 flex flex-col h-[70vh] min-h-[500px] md:h-[600px] relative overflow-hidden shadow-2xl">
                            {/* Terminal Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-[#DC2626] animate-pulse' : 'bg-green-500'}`}></div>
                                    <span className="text-[9px] font-mono text-white/50 tracking-[0.2em] uppercase font-bold">
                                        /USR/BIN/MASON_CHAT // v3.2
                                    </span>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-hide">
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in-up`}>
                                        <div className="flex items-center gap-2 mb-2 opacity-50">
                                            <span className="text-[8px] font-mono text-[#9CA3AF] uppercase tracking-[0.2em]">
                                                {msg.role === 'user' ? 'YOU' : 'MASON'}
                                            </span>
                                        </div>
                                        <div className={`max-w-[90%] p-5 text-sm font-mono leading-relaxed tracking-wide ${msg.role === 'user'
                                            ? 'bg-white/5 text-white/90 border-r-2 border-white/20'
                                            : 'text-[#DC2626] bg-[#DC2626]/5 border-l-2 border-[#DC2626]/40'
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {isProcessing && (
                                    <div className="flex flex-col items-start animate-pulse">
                                        <span className="text-[8px] font-mono text-[#DC2626] uppercase tracking-[0.2em] mb-2">MASON</span>
                                        <div className="p-5 bg-[#DC2626]/5 border-l-2 border-[#DC2626]/40">
                                            <span className="inline-block w-1.5 h-4 bg-[#DC2626] animate-blink"></span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="p-6 bg-[#050505] border-t border-white/5">
                                {!isProcessing && messages.length < 4 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {SUGGESTIONS.map((query, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSend(query)}
                                                className="text-[8px] font-mono uppercase tracking-widest text-[#9CA3AF] border border-white/10 bg-white/[0.02] px-3 py-1.5 hover:bg-[#DC2626] hover:text-white hover:border-[#DC2626] transition-all"
                                            >
                                                {query}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <form onSubmit={handleSend} className="flex items-center gap-4">
                                    <div className="w-2 h-2 bg-[#DC2626] animate-pulse shrink-0"></div>
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder={t('chat.placeholder')}
                                        className="w-full bg-transparent py-2 text-white font-mono text-sm focus:outline-none placeholder:text-white/20 placeholder:tracking-[0.1em]"
                                        autoFocus
                                    />
                                    <button type="submit" className="text-[10px] font-brick text-white/50 hover:text-white uppercase tracking-[0.2em] transition-colors">
                                        {t('chat.execute')}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};


const HomePage = ({ onChat, onSelectProject, onWorks, onTransmissions, onHome, onAbout, setMonolithHover, monolithHover, onAdmin }: any) => (
    <React.Fragment>
        <Header onChat={onChat} onWorks={onWorks} onTransmissions={onTransmissions} onHome={onHome} onAbout={onAbout} isChatView={false} />
        <main>
            <Hero setMonolithHover={setMonolithHover} monolithHover={monolithHover} />
            <SelectedWorks onSelectProject={onSelectProject} />
            <Philosophy />
            <Legacy />
        </main>
        <Footer onChat={onChat} onAdmin={onAdmin} />
    </React.Fragment>
);

const InfoCard = ({ number, title, desc }: { number: string, title: string, desc: string }) => (
    <div className="group relative bg-[#050505] p-8 md:p-10 hover:bg-[#0A0A0A] transition-colors duration-500 overflow-hidden border border-white/5 hover:border-[#DC2626] border-l-4 border-l-transparent hover:border-l-[#DC2626]">
        <div className="absolute top-0 right-0 p-4 opacity-30 group-hover:opacity-100 transition-opacity">
            <span className="font-mono text-[9px] text-[#DC2626] border border-[#DC2626] px-1 tracking-widest">SEC_{number}</span>
        </div>
        <div className="mb-6 relative z-10">
            <h3 className="text-xl md:text-2xl font-brick text-white mb-4 group-hover:text-[#DC2626] transition-colors duration-300 uppercase leading-none">{title}</h3>
            <p className="text-xs md:text-sm font-mono text-[#9CA3AF] leading-relaxed opacity-80">{desc}</p>
        </div>
        {/* Tech Decor */}
        <div className="scanline-effect opacity-10 group-hover:opacity-20 transition-opacity"></div>
    </div>
);

const StatBlock = ({ label, value, sub }: { label: string, value: string, sub: string }) => (
    <div className="flex flex-col border-l border-white/10 pl-6 py-2 group hover:border-[#DC2626] transition-colors">
        <span className="font-mono text-[9px] text-[#9CA3AF] uppercase tracking-widest mb-1">{label}</span>
        <span className="font-brick text-3xl md:text-4xl text-white mb-1 group-hover:text-[#DC2626] transition-colors">{value}</span>
        <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest">{sub}</span>
    </div>
);

const LogItem = ({ year, title, desc, highlight = false }: { year: string, title: string, desc: string, highlight?: boolean }) => (
    <div className={`relative pl-8 md:pl-12 group ${highlight ? 'opacity-100' : 'opacity-60 hover:opacity-100'} transition-opacity duration-300`}>
        {/* Dot */}
        <div className={`absolute left-[-4px] top-1.5 w-2 h-2 rounded-full border-2 border-[#050505] z-10 ${highlight ? 'bg-[#DC2626]' : 'bg-[#333] group-hover:bg-white'} transition-colors`}></div>

        <div className="flex flex-col md:flex-row md:items-baseline gap-2 mb-1">
            <span className={`font-mono text-sm font-bold ${highlight ? 'text-[#DC2626]' : 'text-white'}`}>{year}</span>
            <span className="hidden md:inline text-white/20">//</span>
            <h4 className="font-brick text-lg text-white uppercase tracking-wide">{title}</h4>
        </div>
        <p className="text-xs md:text-sm text-[#9CA3AF] font-light leading-relaxed max-w-lg">{desc}</p>
    </div>
);

const TeamMember = ({ name, role, id }: { name: string, role: string, id: string }) => (
    <div className="group relative bg-[#050505] border border-white/5 p-6 hover:border-white/20 transition-all duration-300">
        <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-white/5 rounded-sm flex items-center justify-center group-hover:bg-[#DC2626] transition-colors duration-300">
                <span className="font-brick text-[#DC2626] text-xl group-hover:text-black">{name.charAt(0)}</span>
            </div>
            <div className="flex flex-col items-end">
                <span className="font-mono text-[9px] text-[#DC2626] uppercase tracking-widest mb-1">ID_{id}</span>
                <div className="flex gap-0.5">
                    {[...Array(3)].map((_, i) => <div key={i} className="w-1 h-1 bg-white/20 rounded-full"></div>)}
                </div>
            </div>
        </div>
        <div>
            <h4 className="text-lg font-brick text-white group-hover:text-[#E5E5E5] transition-colors">{name}</h4>
            <span className="block text-[10px] font-mono text-[#9CA3AF] uppercase tracking-widest mt-1 border-t border-white/10 pt-2 inline-block w-full">{role}</span>
        </div>
    </div>
);

const AboutPage = ({ onChat, onWorks, onTransmissions, onHome, onAbout }: any) => {
    const { t } = useTranslation();
    return (
        <React.Fragment>
            <Header onChat={onChat} onWorks={onWorks} onTransmissions={onTransmissions} onHome={onHome} onAbout={onAbout} isChatView={false} />
            <button onClick={onHome} className="fixed top-24 left-6 md:left-12 text-[#9CA3AF] hover:text-white text-xs md:text-sm tracking-widest uppercase transition-colors z-40 flex items-center gap-2 group mix-blend-difference">
                <span className="text-[#DC2626] group-hover:-translate-x-1 transition-transform">&lt;</span> {t('common.return_surface')}
            </button>

            <main className="pt-24 md:pt-32 min-h-screen flex flex-col bg-[#050505] relative overflow-hidden">
                {/* ATMOSPHERE */}
                <div className="absolute top-0 right-0 w-[60vw] h-[60vh] bg-[#DC2626]/5 rounded-full blur-[150px] pointer-events-none z-0 mix-blend-screen opacity-30"></div>
                <div className="scanline-effect fixed inset-0 z-0 pointer-events-none opacity-20"></div>

                {/* CONTAINER - MAX WIDTH FOR ALIGNMENT */}
                <div className="w-full max-w-7xl mx-auto px-6 md:px-12 relative z-10">

                    {/* HERO: ORIGIN STORY */}
                    <section className="mb-24 reveal mt-12 md:mt-20">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                            <div>
                                <span className="text-[#DC2626] font-mono text-xs tracking-[0.2em] uppercase mb-6 block animate-fade-in-up">
                                    {t('about.origin')} <span className="text-white/20 mx-2">//</span> {t('about.est')}
                                </span>
                                <h1 className="text-5xl md:text-7xl font-brick text-white mb-8 leading-[0.9] tracking-tight animate-fade-in-up delay-100">
                                    {t('about.title_primary')}<br />
                                    <span className="text-[#DC2626]">{t('about.title_highlight')}</span><br />
                                    {t('about.title_secondary')}
                                </h1>
                                <p className="text-[#E5E5E5] font-light text-base md:text-lg leading-relaxed max-w-xl border-l-2 border-[#DC2626] pl-6 animate-fade-in-up delay-200">
                                    {t('about.description')}
                                </p>
                            </div>
                            {/* CORE MODULES / CAPABILITIES */}
                            <div className="bg-[#0A0A0A] border border-white/10 p-8 md:p-10 relative animate-fade-in-up delay-300">
                                <div className="absolute top-0 left-0 w-full h-1 bg-[#DC2626]"></div>
                                <h3 className="font-mono text-xs text-[#9CA3AF] uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    {t('about.core_modules')}
                                </h3>
                                <div className="space-y-6">
                                    <div className="group">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="font-brick text-lg md:text-xl text-white group-hover:text-[#DC2626] transition-colors">{t('about.modules.cinematography.title')}</h4>
                                            <span className="font-mono text-[9px] text-[#DC2626] opacity-0 group-hover:opacity-100 transition-opacity">{t('about.modules.cinematography.status')}</span>
                                        </div>
                                        <p className="font-mono text-[10px] text-[#9CA3AF] uppercase tracking-widest leading-relaxed">
                                            {t('about.modules.cinematography.desc')}
                                        </p>
                                    </div>
                                    <div className="w-full h-px bg-white/5"></div>

                                    <div className="group">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="font-brick text-lg md:text-xl text-white group-hover:text-[#DC2626] transition-colors">{t('about.modules.training.title')}</h4>
                                            <span className="font-mono text-[9px] text-[#DC2626] opacity-0 group-hover:opacity-100 transition-opacity">{t('about.modules.training.status')}</span>
                                        </div>
                                        <p className="font-mono text-[10px] text-[#9CA3AF] uppercase tracking-widest leading-relaxed">
                                            {t('about.modules.training.desc')}
                                        </p>
                                    </div>
                                    <div className="w-full h-px bg-white/5"></div>

                                    <div className="group">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="font-brick text-lg md:text-xl text-white group-hover:text-[#DC2626] transition-colors">{t('about.modules.architecture.title')}</h4>
                                            <span className="font-mono text-[9px] text-[#DC2626] opacity-0 group-hover:opacity-100 transition-opacity">{t('about.modules.architecture.status')}</span>
                                        </div>
                                        <p className="font-mono text-[10px] text-[#9CA3AF] uppercase tracking-widest leading-relaxed">
                                            {t('about.modules.architecture.desc')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* THE INFRASTRUCTURE (DIFFERENTIATORS) */}
                    <section className="mb-32 reveal">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 border-b border-white/10 pb-4 gap-2">
                            <h2 className="text-2xl font-brick text-white">{t('about.manifesto.title')}</h2>
                            <span className="font-mono text-[9px] text-[#9CA3AF] uppercase tracking-widest">{t('about.manifesto.subtitle')}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InfoCard
                                number="01"
                                title={t('about.manifesto.cards.control.title')}
                                desc={t('about.manifesto.cards.control.desc')}
                            />
                            <InfoCard
                                number="02"
                                title={t('about.manifesto.cards.curation.title')}
                                desc={t('about.manifesto.cards.curation.desc')}
                            />
                            <InfoCard
                                number="03"
                                title={t('about.manifesto.cards.black_box.title')}
                                desc={t('about.manifesto.cards.black_box.desc')}
                            />
                        </div>
                    </section>

                    {/* LEADERSHIP (REAL ROLES) */}
                    <section className="pb-32 reveal">
                        <div className="flex items-center gap-3 mb-12 border-b border-white/10 pb-4">
                            <Database className="w-4 h-4 text-[#DC2626]" />
                            <h2 className="text-xs md:text-sm font-mono text-[#9CA3AF] uppercase tracking-[0.2em]">{t('about.team.title')}</h2>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <TeamMember name="ALEX M." role={t('about.team.roles.alex')} id="001" />
                            <TeamMember name="SARAH V." role={t('about.team.roles.sarah')} id="002" />
                            <TeamMember name="GABRIEL P." role={t('about.team.roles.gabriel')} id="003" />
                            <TeamMember name="MARCUS L." role={t('about.team.roles.marcus')} id="004" />
                        </div>
                    </section>
                </div>
            </main>
            <Footer onChat={onChat} />
        </React.Fragment>
    );
};

// --- ADMIN PAGE ---
const AdminPage = ({ onHome }: { onHome: () => void }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loginError, setLoginError] = useState('');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState<'works' | 'transmissions'>('works');
    const { works, setWorks, transmissions, setTransmissions } = useContext(DataContext)!;
    const [editingItem, setEditingItem] = useState<any>(null);

    // Check authentication on mount
    useEffect(() => {
        fetch('/api/auth/me', { credentials: 'include' })
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(() => setIsLoggedIn(true))
            .catch(() => setIsLoggedIn(false))
            .finally(() => setLoading(false));
    }, []);

    // Login handler
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password }),
                credentials: 'include'
            });
            if (res.ok) {
                setIsLoggedIn(true);
            } else {
                const data = await res.json();
                setLoginError(data.error || 'Login failed');
            }
        } catch {
            setLoginError('Connection error');
        }
    };

    // Logout handler
    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        setIsLoggedIn(false);
    };

    // Delete work
    const deleteWork = async (id: string) => {
        if (!confirm('Delete this work?')) return;
        await fetch(`/api/works/${id}`, { method: 'DELETE', credentials: 'include' });
        setWorks(works.filter(w => w.id !== id));
    };

    // Delete transmission
    const deleteTransmission = async (id: string) => {
        if (!confirm('Delete this transmission?')) return;
        await fetch(`/api/transmissions/${id}`, { method: 'DELETE', credentials: 'include' });
        setTransmissions(transmissions.filter(t => t.id !== id));
    };

    // Save item (work or transmission)
    const saveItem = async () => {
        if (!editingItem) return;
        const endpoint = activeTab === 'works' ? '/api/works' : '/api/transmissions';
        await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editingItem),
            credentials: 'include'
        });
        if (activeTab === 'works') {
            setWorks(prev => {
                const idx = prev.findIndex(w => w.id === editingItem.id);
                if (idx >= 0) {
                    const updated = [...prev];
                    updated[idx] = editingItem;
                    return updated;
                }
                return [...prev, editingItem];
            });
        } else {
            setTransmissions(prev => {
                const idx = prev.findIndex(t => t.id === editingItem.id);
                if (idx >= 0) {
                    const updated = [...prev];
                    updated[idx] = editingItem;
                    return updated;
                }
                return [...prev, editingItem];
            });
        }
        setEditingItem(null);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505]">
            <div className="text-[#DC2626] font-mono text-sm animate-pulse">LOADING SYSTEM...</div>
        </div>
    );

    // Login Screen
    if (!isLoggedIn) return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6">
            <div className="w-full max-w-md border border-white/10 p-8 bg-[#0a0a0a]">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-3 h-3 bg-[#DC2626]"></div>
                    <h1 className="text-xl font-brick text-white">SYSTEM_ACCESS</h1>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-mono text-[#9CA3AF] mb-2 uppercase tracking-widest">Identifier</label>
                        <input
                            type="text"
                            value={identifier}
                            onChange={e => setIdentifier(e.target.value)}
                            className="w-full bg-transparent border border-white/20 p-3 text-white font-mono text-sm focus:outline-none focus:border-[#DC2626]"
                            placeholder="Email or username"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-mono text-[#9CA3AF] mb-2 uppercase tracking-widest">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-transparent border border-white/20 p-3 text-white font-mono text-sm focus:outline-none focus:border-[#DC2626]"
                            placeholder="••••••••"
                        />
                    </div>
                    {loginError && <p className="text-[#DC2626] text-xs font-mono">{loginError}</p>}
                    <button type="submit" className="w-full bg-[#DC2626] text-white py-3 font-mono text-sm uppercase tracking-widest hover:bg-red-700 transition-colors">
                        AUTHENTICATE
                    </button>
                </form>
                <button onClick={onHome} className="mt-6 text-[#9CA3AF] text-xs font-mono hover:text-white transition-colors">
                    &lt; RETURN TO SURFACE
                </button>
            </div>
        </div>
    );

    // Admin Dashboard
    return (
        <div className="min-h-screen bg-[#050505] p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-3 h-3 bg-[#DC2626] animate-pulse"></div>
                        <h1 className="text-2xl font-brick text-white">ADMIN_CONSOLE</h1>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={onHome} className="text-[#9CA3AF] text-xs font-mono hover:text-white transition-colors">
                            &lt; HOME
                        </button>
                        <button onClick={handleLogout} className="text-[#DC2626] text-xs font-mono hover:text-red-400 transition-colors">
                            LOGOUT
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab('works')}
                        className={`px-6 py-3 text-xs font-mono uppercase tracking-widest border transition-colors ${activeTab === 'works' ? 'bg-[#DC2626] border-[#DC2626] text-white' : 'border-white/20 text-[#9CA3AF] hover:text-white'}`}
                    >
                        WORKS ({works.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('transmissions')}
                        className={`px-6 py-3 text-xs font-mono uppercase tracking-widest border transition-colors ${activeTab === 'transmissions' ? 'bg-[#DC2626] border-[#DC2626] text-white' : 'border-white/20 text-[#9CA3AF] hover:text-white'}`}
                    >
                        TRANSMISSIONS ({transmissions.length})
                    </button>
                </div>

                {/* Content */}
                <div className="border border-white/10 p-6">
                    {activeTab === 'works' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-sm font-mono text-[#9CA3AF] uppercase tracking-widest">Project Database</h2>
                                <button
                                    onClick={() => setEditingItem({ id: `work_${Date.now()}`, title: '', desc: '', category: 'GENERATIVE', subtitle: '', orientation: 'horizontal', imageHome: '', imageWorks: '', hasDetail: true })}
                                    className="text-xs font-mono bg-white/10 px-4 py-2 text-white hover:bg-white/20 transition-colors"
                                >
                                    + NEW WORK
                                </button>
                            </div>
                            {works.map(work => (
                                <div key={work.id} className="flex justify-between items-center p-4 border border-white/10 hover:border-white/20 transition-colors">
                                    <div>
                                        <h3 className="text-white font-mono text-sm">{work.title}</h3>
                                        <p className="text-[#9CA3AF] text-xs font-mono">{work.category} // {work.subtitle}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingItem(work)} className="text-xs font-mono text-[#9CA3AF] hover:text-white px-3 py-1 border border-white/10">EDIT</button>
                                        <button onClick={() => deleteWork(work.id)} className="text-xs font-mono text-[#DC2626] hover:text-red-400 px-3 py-1 border border-[#DC2626]/50">DELETE</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'transmissions' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-sm font-mono text-[#9CA3AF] uppercase tracking-widest">Neural Logs</h2>
                                <button
                                    onClick={() => setEditingItem({ id: `log_${Date.now()}`, title: '', excerpt: '', date: new Date().toISOString().split('T')[0].replace(/-/g, '.'), tags: [], url: '', content: '' })}
                                    className="text-xs font-mono bg-white/10 px-4 py-2 text-white hover:bg-white/20 transition-colors"
                                >
                                    + NEW TRANSMISSION
                                </button>
                            </div>
                            {transmissions.map(post => (
                                <div key={post.id} className="flex justify-between items-center p-4 border border-white/10 hover:border-white/20 transition-colors">
                                    <div>
                                        <h3 className="text-white font-mono text-sm">{post.title}</h3>
                                        <p className="text-[#9CA3AF] text-xs font-mono">{post.date} // {post.tags.join(', ')}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingItem(post)} className="text-xs font-mono text-[#9CA3AF] hover:text-white px-3 py-1 border border-white/10">EDIT</button>
                                        <button onClick={() => deleteTransmission(post.id)} className="text-xs font-mono text-[#DC2626] hover:text-red-400 px-3 py-1 border border-[#DC2626]/50">DELETE</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Edit Modal - Full Image Editor */}
                {editingItem && (
                    <div className="fixed inset-0 bg-black/95 z-50 flex items-start justify-center p-6 overflow-y-auto">
                        <div className="w-full max-w-5xl bg-[#0a0a0a] border border-white/10 my-8">
                            {/* Header */}
                            <div className="flex justify-between items-center p-6 border-b border-white/10">
                                <h2 className="text-lg font-brick text-white">EDIT_PROJECT</h2>
                                <button onClick={() => setEditingItem(null)} className="text-[#9CA3AF] hover:text-white text-2xl">&times;</button>
                            </div>

                            <div className="flex flex-col lg:flex-row">
                                {/* Left Side - Form Fields */}
                                <div className="lg:w-1/2 p-6 space-y-4 border-r border-white/10">
                                    <h3 className="text-xs font-mono text-[#DC2626] mb-4 uppercase tracking-widest">Project Info</h3>

                                    {/* Basic Fields */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-mono text-[#9CA3AF] mb-2 uppercase tracking-widest">ID</label>
                                            <input type="text" value={editingItem.id || ''} onChange={e => setEditingItem({ ...editingItem, id: e.target.value })} className="w-full bg-transparent border border-white/20 p-2 text-white font-mono text-xs focus:outline-none focus:border-[#DC2626]" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-mono text-[#9CA3AF] mb-2 uppercase tracking-widest">Category</label>
                                            <select value={editingItem.category || ''} onChange={e => setEditingItem({ ...editingItem, category: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/20 p-2 text-white font-mono text-xs focus:outline-none focus:border-[#DC2626]">
                                                <option value="GENERATIVE">GENERATIVE</option>
                                                <option value="VFX">VFX</option>
                                                <option value="STYLE TRANSFER">STYLE TRANSFER</option>
                                                <option value="DATA ART">DATA ART</option>
                                                <option value="EXPERIENCE">EXPERIENCE</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-mono text-[#9CA3AF] mb-2 uppercase tracking-widest">Title</label>
                                        <input type="text" value={editingItem.title || ''} onChange={e => setEditingItem({ ...editingItem, title: e.target.value })} className="w-full bg-transparent border border-white/20 p-3 text-white font-mono text-sm focus:outline-none focus:border-[#DC2626]" />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-mono text-[#9CA3AF] mb-2 uppercase tracking-widest">Subtitle</label>
                                        <input type="text" value={editingItem.subtitle || ''} onChange={e => setEditingItem({ ...editingItem, subtitle: e.target.value })} className="w-full bg-transparent border border-white/20 p-2 text-white font-mono text-xs focus:outline-none focus:border-[#DC2626]" />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-mono text-[#9CA3AF] mb-2 uppercase tracking-widest">Description</label>
                                        <textarea value={editingItem.desc || ''} onChange={e => setEditingItem({ ...editingItem, desc: e.target.value })} rows={2} className="w-full bg-transparent border border-white/20 p-2 text-white font-mono text-xs focus:outline-none focus:border-[#DC2626] resize-none" />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-mono text-[#9CA3AF] mb-2 uppercase tracking-widest">Long Description</label>
                                        <textarea value={editingItem.longDesc || ''} onChange={e => setEditingItem({ ...editingItem, longDesc: e.target.value })} rows={3} className="w-full bg-transparent border border-white/20 p-2 text-white font-mono text-xs focus:outline-none focus:border-[#DC2626] resize-none" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-mono text-[#9CA3AF] mb-2 uppercase tracking-widest">Orientation</label>
                                            <select value={editingItem.orientation || 'horizontal'} onChange={e => setEditingItem({ ...editingItem, orientation: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/20 p-2 text-white font-mono text-xs focus:outline-none focus:border-[#DC2626]">
                                                <option value="horizontal">Horizontal</option>
                                                <option value="vertical">Vertical</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-mono text-[#9CA3AF] mb-2 uppercase tracking-widest">Video URL</label>
                                            <input type="text" value={editingItem.videoUrl || ''} onChange={e => setEditingItem({ ...editingItem, videoUrl: e.target.value })} placeholder="Vimeo or MP4 URL" className="w-full bg-transparent border border-white/20 p-2 text-white font-mono text-xs focus:outline-none focus:border-[#DC2626]" />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side - Image Editor */}
                                <div className="lg:w-1/2 p-6 space-y-6">
                                    <h3 className="text-xs font-mono text-[#DC2626] mb-4 uppercase tracking-widest">Image Settings</h3>

                                    {/* Image Upload */}
                                    <div>
                                        <label className="block text-[10px] font-mono text-[#9CA3AF] mb-2 uppercase tracking-widest">Image URL / Upload</label>
                                        <div className="flex gap-2">
                                            <input type="text" value={editingItem.imageHome || ''} onChange={e => setEditingItem({ ...editingItem, imageHome: e.target.value, imageWorks: e.target.value })} placeholder="Image URL" className="flex-1 bg-transparent border border-white/20 p-2 text-white font-mono text-xs focus:outline-none focus:border-[#DC2626]" />
                                            <label className="px-4 py-2 bg-white/10 text-white font-mono text-xs cursor-pointer hover:bg-white/20 transition-colors flex items-center">
                                                UPLOAD
                                                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const formData = new FormData();
                                                        formData.append('file', file);
                                                        try {
                                                            const res = await fetch('/api/upload', { method: 'POST', body: formData, credentials: 'include' });
                                                            const data = await res.json();
                                                            if (data.url) setEditingItem({ ...editingItem, imageHome: data.url, imageWorks: data.url });
                                                        } catch (err) { console.error('Upload failed', err); }
                                                    }
                                                }} />
                                            </label>
                                        </div>
                                    </div>

                                    {/* Position Controls */}
                                    <div>
                                        <label className="block text-[10px] font-mono text-[#9CA3AF] mb-2 uppercase tracking-widest">X Position</label>
                                        <input type="range" min="0" max="100" step="0.1" value={editingItem.imageSettingsHome?.x ?? 50} onChange={e => {
                                            const newSettings = { ...(editingItem.imageSettingsHome || { x: 50, y: 50, scale: 1.2 }), x: Number(e.target.value) };
                                            setEditingItem({ ...editingItem, imageSettingsHome: newSettings });
                                        }} className="w-full accent-[#DC2626]" />
                                        <span className="text-[10px] font-mono text-white">{(editingItem.imageSettingsHome?.x || 50).toFixed(1)}%</span>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-mono text-[#9CA3AF] mb-2 uppercase tracking-widest">Y Position</label>
                                        <input type="range" min="0" max="100" step="0.1" value={editingItem.imageSettingsHome?.y ?? 50} onChange={e => {
                                            const newSettings = { ...(editingItem.imageSettingsHome || { x: 50, y: 50, scale: 1.2 }), y: Number(e.target.value) };
                                            setEditingItem({ ...editingItem, imageSettingsHome: newSettings });
                                        }} className="w-full accent-[#DC2626]" />
                                        <span className="text-[10px] font-mono text-white">{(editingItem.imageSettingsHome?.y || 50).toFixed(1)}%</span>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-mono text-[#9CA3AF] mb-2 uppercase tracking-widest">Zoom/Scale</label>
                                        <input type="range" min="100" max="200" step="0.1" value={(editingItem.imageSettingsHome?.scale || 1.2) * 100} onChange={e => {
                                            const newSettings = { ...(editingItem.imageSettingsHome || { x: 50, y: 50, scale: 1.2 }), scale: Number(e.target.value) / 100 };
                                            setEditingItem({ ...editingItem, imageSettingsHome: newSettings });
                                        }} className="w-full accent-[#DC2626]" />
                                        <span className="text-[10px] font-mono text-white">{((editingItem.imageSettingsHome?.scale || 1.2) * 100).toFixed(1)}%</span>
                                    </div>

                                    {/* Live Preview - Home Card */}
                                    <div>
                                        <label className="block text-[10px] font-mono text-[#DC2626] mb-3 uppercase tracking-widest">HOME PAGE - CARD PREVIEW</label>
                                        <div className="relative w-64 h-[400px] border border-white/20 overflow-hidden bg-[#050505] mx-auto">
                                            {editingItem.imageHome ? (
                                                <>
                                                    <div
                                                        className="absolute inset-0 transition-all duration-300 opacity-80 filter saturate-[0.6] brightness-[0.9]"
                                                        style={{
                                                            backgroundImage: `url('${editingItem.imageHome}')`,
                                                            backgroundSize: 'cover',
                                                            backgroundPosition: 'center center',
                                                            transform: `scale(${editingItem.imageSettingsHome?.scale || 1.2}) translate(${((editingItem.imageSettingsHome?.x || 50) - 50) * 2}%, ${((editingItem.imageSettingsHome?.y || 50) - 50) * 2}%)`
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60" />
                                                    <div className="absolute bottom-4 left-4 right-4 z-10">
                                                        <h4 className="text-3xl font-brick text-white uppercase tracking-tighter leading-none filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]">
                                                            {editingItem.title || 'PROJECT TITLE'}
                                                        </h4>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-[#9CA3AF] font-mono text-xs">
                                                    No image selected
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Separator */}
                                    <div className="border-t border-white/10 pt-4 mt-2">
                                        <label className="block text-[10px] font-mono text-[#DC2626] mb-3 uppercase tracking-widest">WORKS PAGE <span className="text-[#9CA3AF]">(1080×1080px)</span></label>
                                    </div>

                                    {/* Works Position Controls */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-mono text-[#9CA3AF] mb-2 uppercase tracking-widest">X Position</label>
                                            <input type="range" min="0" max="100" step="0.1" value={editingItem.imageSettingsWorks?.x ?? 50} onChange={e => {
                                                const newSettings = { ...(editingItem.imageSettingsWorks || { x: 50, y: 50, scale: 1.2 }), x: Number(e.target.value) };
                                                setEditingItem({ ...editingItem, imageSettingsWorks: newSettings });
                                            }} className="w-full accent-[#DC2626]" />
                                            <span className="text-[10px] font-mono text-white">{(editingItem.imageSettingsWorks?.x || 50).toFixed(1)}%</span>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-mono text-[#9CA3AF] mb-2 uppercase tracking-widest">Y Position</label>
                                            <input type="range" min="0" max="100" step="0.1" value={editingItem.imageSettingsWorks?.y ?? 50} onChange={e => {
                                                const newSettings = { ...(editingItem.imageSettingsWorks || { x: 50, y: 50, scale: 1.2 }), y: Number(e.target.value) };
                                                setEditingItem({ ...editingItem, imageSettingsWorks: newSettings });
                                            }} className="w-full accent-[#DC2626]" />
                                            <span className="text-[10px] font-mono text-white">{(editingItem.imageSettingsWorks?.y || 50).toFixed(1)}%</span>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-mono text-[#9CA3AF] mb-2 uppercase tracking-widest">Zoom/Scale</label>
                                            <input type="range" min="100" max="200" step="0.1" value={(editingItem.imageSettingsWorks?.scale || 1.2) * 100} onChange={e => {
                                                const newSettings = { ...(editingItem.imageSettingsWorks || { x: 50, y: 50, scale: 1.2 }), scale: Number(e.target.value) / 100 };
                                                setEditingItem({ ...editingItem, imageSettingsWorks: newSettings });
                                            }} className="w-full accent-[#DC2626]" />
                                            <span className="text-[10px] font-mono text-white">{((editingItem.imageSettingsWorks?.scale || 1.2) * 100).toFixed(1)}%</span>
                                        </div>
                                    </div>

                                    {/* Live Preview - Works Grid */}
                                    <div>
                                        <div className="relative w-40 h-40 border border-white/20 overflow-hidden bg-[#050505]">
                                            {editingItem.imageWorks || editingItem.imageHome ? (
                                                <>
                                                    <div
                                                        className="absolute inset-0 transition-all duration-300 opacity-70 saturate-110 brightness-90"
                                                        style={{
                                                            backgroundImage: `url('${editingItem.imageWorks || editingItem.imageHome}')`,
                                                            backgroundSize: 'cover',
                                                            backgroundPosition: 'center center',
                                                            transform: `scale(${editingItem.imageSettingsWorks?.scale || 1.2}) translate(${((editingItem.imageSettingsWorks?.x || 50) - 50) * 2}%, ${((editingItem.imageSettingsWorks?.y || 50) - 50) * 2}%)`
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-transparent to-transparent" />

                                                    {/* Top Controls / Index / Category */}
                                                    <div className="absolute inset-0 p-3 flex flex-col justify-between z-30">
                                                        <div className="flex justify-between items-start opacity-50">
                                                            <span className="font-mono text-[8px] tracking-widest text-[#DC2626]">001</span>
                                                            <span className="font-mono text-[8px] tracking-widest border border-white/20 px-1 py-0.5 rounded-full text-white">{editingItem.category}</span>
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xs font-brick text-white leading-none mb-1 tracking-tight">{editingItem.title}</h3>
                                                        </div>
                                                    </div>

                                                    {/* Corner Decors */}
                                                    <div className="absolute top-0 left-0 w-1.5 h-1.5 border-l border-t border-white/30 z-40"></div>
                                                    <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-r border-b border-white/30 z-40"></div>
                                                </>
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-[#9CA3AF] font-mono text-xs">
                                                    No image
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex gap-4 p-6 border-t border-white/10">
                                <button onClick={saveItem} className="flex-1 bg-[#DC2626] text-white py-3 font-mono text-sm uppercase tracking-widest hover:bg-red-700 transition-colors">
                                    SAVE PROJECT
                                </button>
                                <button onClick={() => setEditingItem(null)} className="flex-1 border border-white/20 text-white py-3 font-mono text-sm uppercase tracking-widest hover:bg-white/10 transition-colors">
                                    CANCEL
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const AppContent = ({ view, setView, monolithHover, setMonolithHover, selectedProject, setSelectedProject, selectedPost, setSelectedPost, goHome, goWorks, goTransmissions, goChat, goAdmin, goAbout, handleSelectPost }: any) => {
    const { transmissions } = useContext(DataContext)!;

    useEffect(() => {
        if (view === 'post' && !selectedPost && transmissions.length > 0) {
            const pathParts = window.location.pathname.split('/');
            const id = pathParts[pathParts.length - 1];
            const post = transmissions.find(t => t.id === id);
            if (post) setSelectedPost(post);
            else goTransmissions();
        }
    }, [view, selectedPost, transmissions]);

    return (
        <div className="min-h-screen bg-[#050505] text-[#E5E5E5] selection:bg-[#DC2626] selection:text-white font-sans">
            <GlobalStyles />
            <div className="noise-overlay"></div>
            <CustomCursor active={monolithHover || selectedProject !== null} />
            {selectedProject && (
                <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
            )}
            {view === 'home' && (
                <HomePage onChat={goChat} onWorks={goWorks} onTransmissions={goTransmissions} onHome={goHome} onSelectProject={setSelectedProject} setMonolithHover={setMonolithHover} monolithHover={monolithHover} onAdmin={goAdmin} onAbout={goAbout} />
            )}
            {view === 'about' && (
                <AboutPage onChat={goChat} onWorks={goWorks} onTransmissions={goTransmissions} onHome={goHome} onAbout={goAbout} />
            )}
            {view === 'works' && (
                <WorksPage onChat={goChat} onWorks={goWorks} onTransmissions={goTransmissions} onHome={goHome} onSelectProject={setSelectedProject} setMonolithHover={setMonolithHover} monolithHover={monolithHover} onAbout={goAbout} />
            )}
            {view === 'transmissions' && (
                <TransmissionsPage onChat={goChat} onWorks={goWorks} onTransmissions={goTransmissions} onHome={goHome} onSelectPost={handleSelectPost} onAbout={goAbout} />
            )}
            {view === 'post' && selectedPost && (
                <BlogPostPage post={selectedPost} onBack={goTransmissions} onChat={goChat} onWorks={goWorks} onTransmissions={goTransmissions} onHome={goHome} onAbout={goAbout} />
            )}
            {view === 'chat' && (
                <React.Fragment>
                    <Header onChat={goChat} onWorks={goWorks} onTransmissions={goTransmissions} onHome={goHome} onAbout={goAbout} isChatView={false} />
                    <SystemChat onBack={goHome} />
                </React.Fragment>
            )}
            {view === 'admin' && (
                <AdminPage onHome={goHome} />
            )}
        </div>
    );
};

// Helper for Context Consumption
const ContextConsumer = ({ children }: { children: (data: any) => React.ReactNode }) => {
    const data = useContext(DataContext);
    if (!data) return null;
    return <>{children(data)}</>;
};

const App = () => {
    const [view, setView] = useState(() => {
        try {
            return sessionStorage.getItem('brick_view') || 'home';
        } catch {
            return 'home';
        }
    });
    const [monolithHover, setMonolithHover] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Work | null>(null);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    const navigate = (newView: string) => {
        setView(newView);
        try {
            sessionStorage.setItem('brick_view', newView);
        } catch { }
        window.scrollTo(0, 0);
    };

    const goHome = () => { navigate('home'); setSelectedPost(null); };
    const goWorks = () => { navigate('works'); setSelectedPost(null); };
    const goTransmissions = () => { navigate('transmissions'); setSelectedPost(null); };
    const goChat = () => { navigate('chat'); setSelectedPost(null); };
    const goAdmin = () => { navigate('admin'); setSelectedPost(null); };
    const goAbout = () => { navigate('about'); setSelectedPost(null); };

    const handleSelectPost = (post: Post) => {
        setSelectedPost(post);
        navigate('post');
    };

    useScrollReveal(view);

    return (
        <DataProvider>
            <AppContent view={view} setView={setView} monolithHover={monolithHover} setMonolithHover={setMonolithHover} selectedProject={selectedProject} setSelectedProject={setSelectedProject} selectedPost={selectedPost} setSelectedPost={setSelectedPost} goHome={goHome} goWorks={goWorks} goTransmissions={goTransmissions} goChat={goChat} goAdmin={goAdmin} goAbout={goAbout} handleSelectPost={handleSelectPost} />
        </DataProvider>
    );
};

export default App;

// Mount the React app
const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}
