import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, Database, Globe, Menu, X } from 'lucide-react';
import * as THREE from 'three';
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
            letter-spacing: -0.05em; 
            line-height: 0.9; 
            text-transform: uppercase;
        }
        
        .font-ai { 
            font-family: 'JetBrains Mono', monospace; 
            font-weight: 700; 
            letter-spacing: -0.02em; 
            text-transform: uppercase;
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
        @keyframes soul-breathe {
            0%, 100% { opacity: 0.5; letter-spacing: 0.25em; }
            50% { opacity: 1; letter-spacing: 0.38em; }
        }
        .animate-soul { animation: soul-breathe 5s ease-in-out infinite; }
        @keyframes scan {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
        
        @keyframes system-type-in {
            from { clip-path: inset(0 100% 0 0); }
            to { clip-path: inset(0 0% 0 0); }
        }
        .animate-system-input {
            animation: system-type-in 0.5s steps(30, end) 0.2s forwards;
            clip-path: inset(0 100% 0 0);
        }
        .animate-blink { animation: terminal-blink 1s step-end infinite; }
        .animate-breathe { animation: atmos-breathe 6s ease-in-out infinite; }
        .animate-grain { animation: grain 8s steps(10) infinite; }
        .animate-thinking { animation: thinking-pulse 1.5s ease-in-out infinite; }
        .animate-talking { animation: talking-glitch 0.15s infinite; }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
        .animate-scan { animation: scan 3s ease-in-out forwards; }

        @keyframes ticker-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        @keyframes ticker-right {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
        }
        .animate-ticker-left { animation: ticker-left 28s linear infinite; }
        .animate-ticker-right { animation: ticker-right 35s linear infinite; }

        /* NOISE REMOVED BY USER REQUEST */
        .card-noise { display: none; }

        @keyframes crt-glitch-text {
            0% { text-shadow: 2px 0 0 rgba(220,38,38,0.8), -2px 0 0 rgba(0,255,255,0.5), 0 0 10px rgba(220,38,38,0.6); }
            20% { text-shadow: -2px 0 0 rgba(220,38,38,0.8), 2px 0 0 rgba(0,255,255,0.5), 0 0 15px rgba(220,38,38,0.6); }
            40% { text-shadow: 2px 0 0 rgba(220,38,38,0.8), -2px 0 0 rgba(0,255,255,0.5), 0 0 10px rgba(220,38,38,0.8); }
            60% { text-shadow: -2px 0 0 rgba(220,38,38,0.8), 2px 0 0 rgba(0,255,255,0.5), 0 0 15px rgba(220,38,38,0.5); }
            80% { text-shadow: 2px 0 0 rgba(220,38,38,0.8), -2px 0 0 rgba(0,255,255,0.5), 0 0 20px rgba(220,38,38,0.8); }
            100% { text-shadow: -2px 0 0 rgba(220,38,38,0.8), 2px 0 0 rgba(0,255,255,0.5), 0 0 10px rgba(220,38,38,0.6); }
        }
        .nav-btn-crt:hover {
            animation: crt-glitch-text 0.12s infinite;
            color: #ffffff;
            opacity: 1;
        }


        /* NEW: TECH GRID PATTERN FOR PROJECTS */
        .bg-tech-grid {
            background-size: 40px 40px;
            background-image: linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
            mask-image: linear-gradient(to bottom, black 20%, transparent 100%);
            -webkit-mask-image: linear-gradient(to bottom, black 20%, transparent 100%);
        }

        /* SHARPNESS UTILS */
        .sharp-image {
            image-rendering: -webkit-optimize-contrast;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            transform: translateZ(0);
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

        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        @media (max-width: 767px), (max-height: 650px) {
            .modal-container {
                width: 100% !important;
                height: 100% !important;
                aspect-ratio: unset !important;
                border: none !important;
            }
        }

        @keyframes float-parallax {
            from { transform: scale(1.1) translate(-1%, 1%); }
            to { transform: scale(1.1) translate(1%, -1%); }
        }
        .animate-float-parallax {
            animation: float-parallax 10s ease-in-out infinite alternate;
        }

        /* GEOMETRIC FONT FOR MODAL */
        .font-geometric {
            font-family: 'Space Grotesk', 'Inter', sans-serif;
            font-weight: 700;
            letter-spacing: 0.25em;
            line-height: 0.9;
            text-transform: uppercase;
        }

        /* DEEP SPACE NOISE OVERLAY */
        .modal-video-noise::after {
            content: '';
            position: absolute;
            inset: 0;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
            opacity: 0.04;
            mix-blend-mode: overlay;
            pointer-events: none;
            z-index: 20;
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
    title: string | Record<string, string>;
    excerpt: string | Record<string, string>;
    tags: string[];
    url: string;
    content: React.ReactNode;
}

/** Extract a localized string from a Post field that may be a plain string or a {lang: value} map */
const getLocalizedField = (field: string | Record<string, string>, lang: string, fallback: string): string => {
    if (typeof field === 'string') return field;
    if (field && typeof field === 'object' && field[lang]) return field[lang];
    return fallback;
};

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
                category: "SELEÇÃO OFICIAL : FESTIVAL DE GRAMADO",
                title: t('works.inheritance.title'),
                desc: t('works.inheritance.desc'),
                longDesc: t('works.inheritance.longDesc'),
                credits: [],
                gradient: "from-neutral-900 to-neutral-800",
                imageHome: "/uploads/f4c60c38-6176-4c5c-bf36-86fada4b9470.jpeg",
                imageWorks: "/uploads/f4c60c38-6176-4c5c-bf36-86fada4b9470.jpeg",
                videoUrl: "https://review.brick.mov/portfolio/embed/10",
                hasDetail: true
            },
            {
                id: "shift",
                orientation: "horizontal",
                subtitle: t('works.shift.subtitle'),
                category: "FINALISTA : GENERO CHALLENGE",
                title: t('works.shift.title'),
                desc: t('works.shift.desc'),
                longDesc: t('works.shift.longDesc'),
                credits: [],
                gradient: "from-neutral-900 via-[#DC2626]/10 to-neutral-900",
                imageHome: "/uploads/30e2d6e0-e967-4204-a455-ae1bb91dec1e.jpeg",
                imageWorks: "/uploads/30e2d6e0-e967-4204-a455-ae1bb91dec1e.jpeg",
                videoUrl: "https://review.brick.mov/portfolio/embed/9",
                hasDetail: true
            },
            {
                id: "anima",
                orientation: "horizontal",
                subtitle: t('works.anima.subtitle'),
                category: "REIMAGINAÇÃO : RESGATE HISTÓRICO",
                title: t('works.anima.title'),
                desc: t('works.anima.desc'),
                longDesc: t('works.anima.longDesc'),
                credits: [],
                gradient: "from-neutral-900 to-neutral-950",
                imageHome: "/uploads/f33570ab-0d3b-4eee-9fe9-59818dcdcd9f.jpeg",
                imageWorks: "/uploads/f33570ab-0d3b-4eee-9fe9-59818dcdcd9f.jpeg",
                videoUrl: "https://review.brick.mov/portfolio/embed/7",
                hasDetail: true
            },
            {
                id: "factory",
                orientation: "vertical",
                subtitle: t('works.factory.subtitle'),
                category: "CONCEITO : CINEMATOGRAFIA GENERATIVA",
                title: t('works.factory.title'),
                desc: t('works.factory.desc'),
                longDesc: t('works.factory.longDesc'),
                credits: [],
                gradient: "from-neutral-950 to-[#DC2626]/20",
                imageHome: "/uploads/adfee249-a46b-44ca-8d7b-b7b5db4ba60b.jpg",
                imageWorks: "/uploads/adfee249-a46b-44ca-8d7b-b7b5db4ba60b.jpg",
                videoUrl: "https://review.brick.mov/portfolio/embed/8",
                hasDetail: true
            },
            {
                id: "DOG DAY AFTERNOON",
                orientation: "horizontal",
                subtitle: t('works.dogday.subtitle'),
                category: "CONCEITO : REALISMO DO ABSURDO",
                title: t('works.dogday.title'),
                desc: t('works.dogday.desc'),
                longDesc: t('works.dogday.longDesc'),
                credits: [],
                gradient: "from-neutral-950 to-[#DC2626]/20",
                imageHome: "/uploads/f9c13e36-0abe-43c9-8161-805cd9f2d1f3.jpeg",
                imageWorks: "/uploads/f9c13e36-0abe-43c9-8161-805cd9f2d1f3.jpeg",
                videoUrl: "https://review.brick.mov/portfolio/embed/6",
                hasDetail: true
            },
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
                        {(t('transmissions.log_001.content_p1') as string).split('\n\n').filter(Boolean).map((paragraph, idx) => (
                            <p
                                key={idx}
                                className="mb-8 text-base md:text-lg font-light text-[#E5E5E5] leading-relaxed md:leading-loose"
                            >
                                {paragraph}
                            </p>
                        ))}
                        {t('transmissions.log_001.section_title') ? (
                            <h3 className="text-lg md:text-xl font-brick text-white mt-10 mb-4 uppercase tracking-tight flex items-center gap-3">
                                <span className="text-[#DC2626] text-xs align-middle font-ai">01 //</span> {t('transmissions.log_001.section_title')}
                            </h3>
                        ) : null}
                        {t('transmissions.log_001.content_p2') ? (
                            <p className="mb-6 text-[#9CA3AF] leading-relaxed">
                                {t('transmissions.log_001.content_p2')}
                            </p>
                        ) : null}
                        {t('transmissions.log_001.quote') ? (
                            <div className="border-l-2 border-[#DC2626] pl-6 py-4 my-10 bg-white/5">
                                <p className="text-base font-mono italic text-white/90">
                                    {t('transmissions.log_001.quote')}
                                </p>
                            </div>
                        ) : null}
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
                        {(t('transmissions.log_002.content_p1') as string)
                            .replace('<0>', '')
                            .replace('</0>', '')
                            .split('\n\n')
                            .filter(Boolean)
                            .map((paragraph, idx) => (
                                <p key={idx} className="mb-8 text-[#9CA3AF] leading-relaxed md:leading-loose">
                                    {paragraph}
                                </p>
                            ))}
                        {t('transmissions.log_002.content_p2') ? (
                            <p className="mb-8 text-[#9CA3AF] leading-relaxed md:leading-loose">
                                {t('transmissions.log_002.content_p2')}
                            </p>
                        ) : null}
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
                        {(t('transmissions.log_003.content_p1') as string)
                            .split('\n\n')
                            .filter(Boolean)
                            .map((paragraph, idx) => (
                                <p key={idx} className="mb-8 text-[#9CA3AF] leading-relaxed md:leading-loose">
                                    {paragraph}
                                </p>
                            ))}
                        {t('transmissions.log_003.quote') ? (
                            <p className="text-white font-brick tracking-widest uppercase border-t border-white/10 pt-6">
                                {t('transmissions.log_003.quote')}
                            </p>
                        ) : null}
                    </React.Fragment>
                )
            }
        ];


        const syncData = async () => {
            // Start with defaults
            let finalWorks = [...generatedWorks];
            let finalTrans = [...generatedTransmissions];

            try {
                const [wRes, tRes] = await Promise.all([
                    fetch('/api/works'),
                    fetch('/api/transmissions')
                ]);

                if (wRes.ok) {
                    const dbWorks = await wRes.json();
                    if (Array.isArray(dbWorks)) {
                        dbWorks.forEach((w: Work) => {
                            const idx = finalWorks.findIndex(fw => fw.id === w.id);
                            if (idx >= 0) {
                                // SMART MERGE: Preserve i18n text, update only visuals/metadata
                                finalWorks[idx] = {
                                    ...finalWorks[idx],
                                    imageHome: w.imageHome,
                                    imageWorks: w.imageWorks,
                                    imageSettingsHome: w.imageSettingsHome,
                                    imageSettingsWorks: w.imageSettingsWorks,
                                    videoUrl: w.videoUrl || finalWorks[idx].videoUrl,
                                    orientation: finalWorks[idx].orientation,
                                    gradient: w.gradient,
                                    hasDetail: w.hasDetail,
                                    category: w.category
                                };
                            } else {
                                finalWorks.push(w);
                            }
                        });
                    }
                }

                if (tRes.ok) {
                    const dbTrans = await tRes.json();
                    if (Array.isArray(dbTrans)) {
                        dbTrans.forEach((tr: Post) => {
                            const idx = finalTrans.findIndex(ft => ft.id === tr.id);
                            if (idx >= 0) finalTrans[idx] = tr;
                            else finalTrans.push(tr);
                        });
                    }
                }

            } catch (e) {
                console.error("Failed to sync with DB", e);
            }

            setWorks(finalWorks);
            setTransmissions(finalTrans);
        };

        syncData();
    }, [t, i18n.language]);

    return (
        <DataContext.Provider value={{ works, setWorks, transmissions, setTransmissions }}>
            {children}
        </DataContext.Provider>
    );
};

// --- UTILS COMPONENTS ---
const GlitchText = ({ text, className }: { text: string, className?: string }) => {
    const glitchChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_#@!";
    const [displayed, setDisplayed] = useState('');
    const [ready, setReady] = useState(false);
    const [chars, setChars] = useState<{ char: string; glitched: boolean }[]>([]);

    // Phase 1: typewriter
    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            i++;
            setDisplayed(text.slice(0, i));
            if (i >= text.length) {
                clearInterval(interval);
                setChars(text.split('').map(c => ({ char: c, glitched: false })));
                setTimeout(() => setReady(true), 200);
            }
        }, 80);
        return () => clearInterval(interval);
    }, [text]);

    // Phase 2: glitch after typewriter done
    useEffect(() => {
        if (!ready) return;
        const positions = text.split('').reduce((acc: number[], c, i) => c !== ' ' ? [...acc, i] : acc, []);
        let timeout: any;

        const glitch = () => {
            const count = 2 + Math.floor(Math.random() * 2);
            const picked = [...positions].sort(() => Math.random() - 0.5).slice(0, count);
            setChars(text.split('').map((c, i) => ({
                char: picked.includes(i) ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : c,
                glitched: picked.includes(i),
            })));
            setTimeout(() => setChars(text.split('').map(c => ({ char: c, glitched: false }))), 150);
            timeout = setTimeout(glitch, 600 + Math.random() * 600);
        };

        timeout = setTimeout(glitch, 600);
        return () => clearTimeout(timeout);
    }, [ready, text]);

    return (
        <span className={className}>
            {ready
                ? chars.map(({ char, glitched }, i) => (
                    <span key={i} style={glitched ? { color: '#DC2626' } : undefined}>{char}</span>
                ))
                : displayed}
        </span>
    );
};

const TypewriterText = ({ text, className }: { text: string, className?: string }) => {
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            i++;
            setDisplayed(text.slice(0, i));
            if (i >= text.length) {
                clearInterval(interval);
                setDone(true);
            }
        }, 80);
        return () => clearInterval(interval);
    }, [text]);

    return (
        <span className={className}>
            {displayed}<span className={`text-[#DC2626] ${done ? 'animate-blink' : 'opacity-100'}`}>_</span>
        </span>
    );
};

const ScrambleText = ({ text, className, hoverTrigger = false, delay = 0 }: { text: string, className?: string, hoverTrigger?: boolean, delay?: number }) => {
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
        setDisplayText(text);
        if (!hoverTrigger) {
            if (delay > 0) {
                const t = setTimeout(scramble, delay);
                return () => clearTimeout(t);
            } else {
                scramble();
            }
        }
    }, [text]);

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
            <header className="fixed top-0 left-0 w-full z-50 px-6 pt-8 pb-6 md:px-12 flex justify-between items-baseline pointer-events-none transition-all duration-300 bg-gradient-to-b from-[#050505]/70 from-[45%] to-transparent">
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

                            <MagneticButton onClick={onHome} className="group text-xs md:text-sm font-ai text-[#9CA3AF] hover:text-[#DC2626] transition-colors duration-300">
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-2 duration-300">&gt;</span>
                                HOME
                            </MagneticButton>

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
                    <button onClick={() => handleNav(onHome)} className="text-2xl font-brick text-white hover:text-[#DC2626] transition-colors w-full text-center border-b border-white/10 pb-4">
                        HOME
                    </button>
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
        <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-visible">
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

                        {/* INTERACTIVE RED DOT & RADIATION (Strictly Inside Monolith) */}
                        <div className="absolute inset-0 overflow-hidden rounded-[2px] pointer-events-none z-30">
                            <div
                                ref={lightSourceRef}
                                className="absolute pointer-events-none mix-blend-screen transition-opacity duration-300 ease-out rounded-full"
                                style={{
                                    width: '6px',
                                    height: '6px',
                                    top: '50%',
                                    left: '50%',
                                    marginTop: '-3px',
                                    marginLeft: '-3px',
                                    backgroundColor: '#DC2626',
                                    boxShadow: '0 0 10px 2px rgba(220, 38, 38, 0.6), 0 0 20px 4px rgba(220, 38, 38, 0.2)',
                                    opacity: 0,
                                    willChange: 'transform, opacity'
                                }}
                            ></div>

                            <div
                                ref={radiationRef}
                                className="absolute w-[600px] h-[600px] -ml-[300px] -mt-[300px] top-1/2 left-1/2 pointer-events-none transition-opacity duration-700 ease-out"
                                style={{
                                    background: 'radial-gradient(circle, rgba(220,38,38,0.25) 0%, rgba(220,38,38,0.05) 50%, transparent 80%)',
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
                        </div>
                        <div className="absolute inset-0 border border-white/5 opacity-50 pointer-events-none z-10 rounded-[2px]"></div>
                    </div>
                    <div
                        className="absolute inset-0 z-20 cursor-none"
                        onMouseMove={handleMouseMove}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    ></div>
                </div>
            </div>
            <div className="text-center z-20 max-w-6xl px-4 flex flex-col items-center pointer-events-none">
                <p className="reveal delay-200 text-base md:text-xl lg:text-2xl font-mono text-white drop-shadow-2xl mb-2 md:mb-4">
                    <TypewriterText text={t('hero.scramble') as string} />
                </p>
                <h2 className="reveal delay-[1000ms] text-2xl md:text-4xl lg:text-5xl font-brick text-[#DC2626] drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                    <ScrambleText text={t('hero.subtitle') as string} delay={800} />
                </h2>
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#DC2626]/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
        </section>
    );
};

const ParticleBackground = () => {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        // Adjust camera FOV based on container aspect ratio
        const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountRef.current.appendChild(renderer.domElement);

        // Particles
        const particlesCount = 3200;
        const posArray = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount; i++) {
            const i3 = i * 3;
            posArray[i3] = (Math.random() - 0.5) * 15;
            posArray[i3 + 1] = (Math.random() - 0.5) * 15;

            // Bring stars back, but keep a small safe gap around camera to avoid huge foreground blocks
            let z = (Math.random() - 0.5) * 15;
            if (Math.abs(z) < 1.5) z = z < 0 ? -1.5 : 1.5;
            posArray[i3 + 2] = z;
        }

        const particlesGeometry = new THREE.BufferGeometry();
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        // Create a circular texture for soft particles
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const context = canvas.getContext('2d');
        if (context) {
            const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
            gradient.addColorStop(0, 'rgba(255,255,255,1)');
            gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
            gradient.addColorStop(0.5, 'rgba(255,255,255,0.2)');
            gradient.addColorStop(1, 'rgba(255,255,255,0)');
            context.fillStyle = gradient;
            context.fillRect(0, 0, 32, 32);
        }
        const particleTexture = new THREE.CanvasTexture(canvas);

        // Material
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.028,
            color: 0xf3f4f6,
            map: particleTexture,
            transparent: true,
            opacity: 0.52,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);
        camera.position.z = 3;

        // Mouse interaction
        let mouseX = 0;
        let mouseY = 0;

        const handleMouseMove = (event: MouseEvent) => {
            mouseX = (event.clientX / window.innerWidth) - 0.5;
            mouseY = (event.clientY / window.innerHeight) - 0.5;
        };

        window.addEventListener('mousemove', handleMouseMove);

        // Animation
        let animationFrameId: number;

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            particlesMesh.rotation.y += 0.0008;

            // Mouse influence
            const targetX = mouseX * 0.5;
            const targetY = mouseY * 0.5;

            particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x);
            particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y);

            renderer.render(scene, camera);
        };

        animate();

        // Resize handler
        const handleResize = () => {
            if (!mountRef.current) return;
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;

            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            particlesGeometry.dispose();
            particlesMaterial.dispose();
            renderer.dispose();
        };
    }, []);

    return <div ref={mountRef} className="absolute inset-0 pointer-events-none z-0" />;
};

const Philosophy = () => {
    const { t } = useTranslation();

    return (
        <section className="relative w-full py-20 bg-[#050505] z-20 border-t border-white/5 overflow-hidden">
            <ParticleBackground />

            {/* NOISE OVERLAY */}
            <div className="absolute inset-0 z-[2] opacity-20 pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150"></div>

            <div className="absolute inset-0 z-[1] bg-[radial-gradient(circle,transparent_40%,rgba(5,5,5,0.9)_100%)] pointer-events-none"></div>
            <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
                <div className="mb-20 reveal w-full flex flex-col items-center">
                    <div className="w-full flex justify-center mb-6">
                        <div className="relative w-5 h-5">
                            <div className="absolute left-1/2 top-1/2 w-5 h-5 -translate-x-1/2 -translate-y-1/2 rounded-full animate-breathe blur-[2px]" style={{ background: 'radial-gradient(circle at center, rgba(220,38,38,0.55) 0%, rgba(220,38,38,0.18) 45%, rgba(220,38,38,0) 75%)' }}></div>
                            <div className="absolute left-1/2 top-1/2 w-[2px] h-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#DC2626]/60"></div>
                        </div>
                    </div>
                    <span className="text-xs font-ai text-[#9CA3AF] bg-[#050505] px-4 text-center">{t('philosophy.belief_label')}</span>
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
    const [categoryLabel, categoryMeta] = useMemo(() => {
        if (work.category.includes(':')) {
            const parts = work.category.split(':');
            return [parts[0].trim(), parts.slice(1).join(':').trim()];
        }
        return [work.id, work.category];
    }, [work.category, work.id]);

    return (
        <div
            ref={containerRef}
            onClick={() => work.hasDetail && onOpen(work)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`reveal relative h-[500px] md:h-full overflow-hidden border border-white/10 hover:border-[#DC2626] transition-colors duration-300 bg-[#050505] group md:basis-0 ${work.hasDetail ? 'cursor-pointer' : 'cursor-default'}`}
            style={{
                flexGrow: isHovered ? 1.6 : 1,
                flexShrink: 0,
                willChange: 'flex-grow, opacity, transform, border-color',
                transition: `flex-grow 1.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 1.2s ease-out, transform 1.2s ease-out, border-color 500ms ease`,
            }}
        >
            {/* BACKGROUND LAYER - AUTONOMOUS PARALLAX */}
            <div
                className={`absolute inset-0 z-10 animate-float-parallax`}
                style={{
                    animationDelay: `${index * -4}s`,
                    willChange: 'transform',
                }}
            >
                <div
                    ref={bgRef}
                    className="absolute inset-0 opacity-100 sharp-image filter saturate-[0.8] group-hover:saturate-100 contrast-[1.05] brightness-[1.0] group-hover:brightness-[1.1] transition-[filter] duration-[3000ms] ease-out"
                    style={{
                        backgroundImage: `url('${work.imageHome}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center center',
                        transform: `scale(${settings.scale}) translate(${(settings.x - 50) * 2}%, ${(settings.y - 50) * 2}%) translateZ(0)`,
                    }}
                ></div>
            </div>

            {/* ARTIFICIAL DEPTH OVERLAYS REMOVED FOR CLEANER LOOK */}

            {/* VIGNETTE & GRADIENT */}
            <div className="absolute inset-0 z-30 transition-opacity duration-[6000ms] ease-linear opacity-90 group-hover:opacity-80" style={{ background: 'linear-gradient(to top, #050505cc 0%, #05050580 20%, #05050540 40%, transparent 65%)' }}></div>
            <div className={`absolute inset-0 z-30 transition-opacity duration-[6000ms] ease-linear pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] ${isHovered ? 'opacity-40' : 'opacity-60'}`}></div>

            {/* CONTENT LAYER - ULTRA MINIMALIST NO BLOCKS */}
            <div className={`absolute inset-x-0 bottom-0 z-40 p-6 md:p-10 flex flex-col justify-end transition-all duration-500 pointer-events-none ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>

                {/* DECORATIVE LINE */}
                <div className="w-12 h-[2px] bg-[#DC2626] mb-4 shadow-[0_0_8px_#DC2626]"></div>

                {/* CATEGORY & META */}
                <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-[10px] text-[#DC2626] tracking-[0.2em] uppercase">{categoryLabel}</span>
                    <span className="text-white/20 text-[10px] font-light">|</span>
                    <span className="font-mono text-[10px] text-white/60 tracking-widest uppercase">{categoryMeta}</span>
                </div>

                {/* TITLE - CLEAN & BOLD */}
                <h3 className="text-3xl md:text-5xl font-brick text-white leading-[0.9] tracking-tight drop-shadow-lg mb-2">
                    {work.title}
                </h3>

                {/* SUBTITLE - LIGHT MONOJET */}
                <p className="text-white/70 text-[10px] md:text-xs font-mono font-light tracking-wide max-w-md drop-shadow-md uppercase opacity-80 mt-2">
                    {work.subtitle}
                </p>
            </div>

            {/* ID TAG - Always Visible Minimal */}
            <div className={`absolute top-6 left-6 transition-all duration-500 ${isHovered ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}>
                <span className="font-mono text-[10px] text-white/40 tracking-widest border border-white/10 px-2 py-1">
                    {work.id.toUpperCase()}
                </span>
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
        <section id="works" className="w-full pt-20 pb-0 bg-[#050505] border-t border-white/5 relative z-40 md:overflow-hidden">
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

            <div className="flex flex-col md:flex-row w-full h-auto md:h-[65vh] border-b border-white/10 px-6 md:px-12 lg:px-24">
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
    const tickerRow1 = [...CLIENTS, ...CLIENTS, ...CLIENTS];
    const tickerRow2 = [...CLIENTS].reverse().concat([...CLIENTS].reverse()).concat([...CLIENTS].reverse());
    return (
        <section className="w-full bg-[#050505] relative overflow-hidden reveal border-t border-white/5">

            {/* Atmospheric red glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <div className="w-[800px] h-[500px] rounded-full blur-[150px] animate-breathe" style={{ background: 'radial-gradient(ellipse, rgba(220,38,38,0.10) 0%, transparent 70%)' }}></div>
            </div>

            {/* Scanline */}
            <div className="scanline-effect opacity-[0.03] pointer-events-none absolute inset-0 z-[1]"></div>

            {/* Header content */}
            <div className="px-6 md:px-12 lg:px-24 pt-20 pb-16 relative z-10">
                <div className="flex items-center gap-3 mb-14">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-blink"></div>
                    <span className="font-mono text-[10px] tracking-[0.4em] text-white/25 uppercase">CLIENT_ARCHIVE // {CLIENTS.length}_ENTRIES</span>
                </div>
                <div className="grid md:grid-cols-2 gap-10 items-end">
                    <h2 className="text-5xl md:text-7xl lg:text-[6rem] font-brick text-white leading-[0.85] tracking-tight">
                        {t('legacy.title').split(' ').slice(0, -2).join(' ')}<br/>
                        <span className="text-[#DC2626]" style={{ textShadow: '0 0 60px rgba(220,38,38,0.45), 0 0 120px rgba(220,38,38,0.2)' }}>
                            {t('legacy.title').split(' ').slice(-2).join(' ')}
                        </span>
                    </h2>
                    <p className="font-mono text-sm text-white/40 leading-relaxed max-w-sm border-l-2 border-[#DC2626]/20 pl-6 md:pb-1">
                        {t('legacy.text')}
                    </p>
                </div>
            </div>

            {/* Ticker rows */}
            <div className="relative z-10 select-none pb-20">

                {/* Row 1 — left */}
                <div className="flex overflow-hidden border-t border-white/[0.06] py-5">
                    <div className="flex shrink-0 animate-ticker-left">
                        {tickerRow1.map((client, i) => (
                            <div key={i} className="flex items-center shrink-0 px-10 gap-10">
                                <span className="font-brick text-4xl md:text-5xl text-white/20 hover:text-[#DC2626] transition-colors duration-500 uppercase tracking-tight cursor-default whitespace-nowrap">{client}</span>
                                <span className="text-[#DC2626]/25 text-2xl font-brick leading-none">◈</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Row 2 — right */}
                <div className="flex overflow-hidden border-t border-b border-white/[0.06] py-5">
                    <div className="flex shrink-0 animate-ticker-right">
                        {tickerRow2.map((client, i) => (
                            <div key={i} className="flex items-center shrink-0 px-10 gap-10">
                                <span className="font-brick text-4xl md:text-5xl text-white/[0.08] hover:text-white/40 transition-colors duration-500 uppercase tracking-tight cursor-default whitespace-nowrap">{client}</span>
                                <span className="text-white/[0.08] text-2xl font-brick leading-none">◈</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
};

const getVimeoId = (url: string) => {
    const match = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
    return match ? match[1] : null;
};
const getYoutubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
};
const addAutoplayToUrl = (url: string): string => {
    if (!url) return '';
    try {
        const u = new URL(url);
        u.searchParams.set('autoplay', '1');
        u.searchParams.set('muted', '1');
        u.searchParams.set('playsinline', '1');
        return u.toString();
    } catch {
        // Fallback para URLs relativas
        return url.includes('?') ? `${url}&autoplay=1&muted=1&playsinline=1` : `${url}?autoplay=1&muted=1&playsinline=1`;
    }
};

const ProjectModal = ({ project, onClose, onPrev, onNext }: { project: Work, onClose: () => void, onPrev?: () => void, onNext?: () => void }) => {
    const { t } = useTranslation();
    const [isPlaying, setIsPlaying] = useState(false);
    const [panelHidden, setPanelHidden] = useState(false);
    const [videoWasHovered, setVideoWasHovered] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const handlePlay = () => {
        setIsPlaying(true);
    };
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    useEffect(() => {
        setIsPlaying(false);
        setPanelHidden(false);
    }, [project.id]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft' && onPrev) onPrev();
            if (e.key === 'ArrowRight' && onNext) onNext();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, onPrev, onNext]);

    useEffect(() => {
        if (isPlaying) setPanelHidden(true);
    }, [isPlaying]);

    if (!project) return null;

    const isHorizontal = project.orientation === 'horizontal';
    const vimeoId = project.videoUrl ? getVimeoId(project.videoUrl) : null;
    const youtubeId = project.videoUrl ? getYoutubeId(project.videoUrl) : null;
    const isVideoFile = project.videoUrl ? /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(project.videoUrl) : false;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-700" onClick={onClose}></div>

            {/* NAV PREV */}
            {onPrev && (
                <button onClick={onPrev} className="hidden md:flex items-center justify-center z-[115] text-red-500/60 nav-btn-crt transition-all duration-300 hover:scale-125 hover:-translate-x-1 px-4 active:scale-90 shrink-0"
                    style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '36px' }}>
                    &lt;
                </button>
            )}

            <div
                className={`relative ${isHorizontal ? 'aspect-video' : 'aspect-[9/16]'} flex bg-black border border-white/20 shadow-[0_0_80px_rgba(0,0,0,0.9)] animate-fade-in-up overflow-hidden modal-container`}
                style={isHorizontal
                    ? { width: 'min(calc(100vw - 4rem), calc((100vh - 4rem) * 16 / 9), 1200px)' }
                    : { height: 'min(calc(100vh - 4rem), calc((100vw - 4rem) * 16 / 9), 860px)' }
                }
            >

                {/* CLOSE — handled inside info panel header */}

                {/* ─── MEDIA PANEL (FULL BACKGROUND) ───────────────── */}
                <div className="absolute inset-0 z-0 bg-black">
                    <div className="absolute inset-0 w-full h-full modal-video-noise">
                        {project.videoUrl && isPlaying ? (
                            <div className="w-full h-full">
                                {vimeoId ? (
                                    <iframe src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&loop=1&background=1&muted=1&playsinline=1`} className="w-full h-full" frameBorder="0" allow="autoplay; fullscreen" title={project.title}></iframe>
                                ) : youtubeId ? (
                                    <iframe src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&loop=1&playlist=${youtubeId}&mute=1&playsinline=1`} className="w-full h-full" frameBorder="0" allow="autoplay; fullscreen" title={project.title}></iframe>
                                ) : (
                                    <iframe src={addAutoplayToUrl(project.videoUrl)} className="w-full h-full" frameBorder="0" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" title={project.title}></iframe>
                                )}
                            </div>
                        ) : null}

                        {(!isPlaying || !project.videoUrl) && (
                            <div className="w-full h-full relative cursor-pointer group" onClick={handlePlay}>
                                {/* Thumbnail */}
                                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[5000ms] group-hover:scale-103" style={{ backgroundImage: `url('${project.imageHome}')` }}></div>
                                {/* Dark vignette */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                                {/* MONOLITH PLAY BUTTON */}
                                {project.videoUrl && (
                                    <div className={`absolute top-0 left-0 flex items-center justify-center right-0 bottom-[55%] ${isHorizontal ? 'md:bottom-0 md:right-[380px]' : ''}`}>
                                        <div className="relative group/mono">
                                            <div className="absolute -inset-3 border border-[#DC2626]/20 transition-all duration-1000 group-hover/mono:border-[#DC2626]/50"></div>
                                            <div className="w-14 h-28 border border-[#DC2626] flex items-center justify-center group-hover/mono:shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all duration-700 bg-transparent">
                                                <svg viewBox="0 0 20 22" className="w-4 h-[18px] ml-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <polygon points="2,1 18,11 2,21" stroke="#DC2626" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Bottom meta HUD */}
                                <div className="absolute bottom-8 left-8 flex flex-col gap-1">
                                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '8px', letterSpacing: '0.4em', color: 'rgba(255,255,255,0.4)' }}>SIGNAL_ACTIVE</span>
                                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '8px', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.2)' }}>{isHorizontal ? '16:9' : '9:16'} // 4K // SOURCE_NODE_{project.id.split('_')[0].toUpperCase()}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── INFO PANEL PULL-BACK TAB (só quando escondido) ───── */}
                {panelHidden && (
                    <button
                        onClick={() => setPanelHidden(false)}
                        className={`absolute z-30 flex items-center justify-center transition-all duration-300
                            border border-white/20 bg-[#050505]/80 backdrop-blur-sm hover:bg-white/10 hover:border-white/40
                            ${isHorizontal
                                ? 'hidden md:flex top-1/2 -translate-y-1/2 right-0 w-5 h-14 rounded-l-sm'
                                : 'left-1/2 -translate-x-1/2 bottom-0 h-5 w-14 rounded-t-sm'
                            }`}
                    >
                        <span className="font-mono text-[9px] text-white/40 hover:text-white/70 transition-colors"
                            style={{ writingMode: isHorizontal ? 'vertical-rl' : 'horizontal-tb' }}>
                            {isHorizontal ? '◀' : '▲'}
                        </span>
                    </button>
                )}

                {/* ─── INFO PANEL HUD OVERLAY ───────────────────────────── */}
                <div className={`absolute z-20 flex flex-col overflow-hidden transition-all duration-700
                    ${isHorizontal
                        ? `bottom-0 left-0 right-0 h-[55%] border-t border-white/10 bg-[#050505]/95 backdrop-blur-xl
                           md:bottom-0 md:left-auto md:right-0 md:top-0 md:h-full md:w-[380px] md:border-t-0 md:border-l md:bg-[#050505]/80
                           ${panelHidden ? 'translate-y-full md:translate-y-0 md:translate-x-full' : 'translate-y-0 md:translate-x-0'}`
                        : `bottom-0 left-0 right-0 h-[55%] border-t border-white/10 bg-[#050505]/95 backdrop-blur-xl
                           ${panelHidden ? 'translate-y-full' : 'translate-y-0'}`
                    }`}>

                    <div className="flex-1 flex flex-col overflow-y-auto scrollbar-hide relative">
                        <div className="px-4 pt-4 pb-3 md:px-8 md:pt-5 md:pb-6 flex-shrink-0">
                            {/* System Status */}
                            <div className="flex items-center justify-between mb-3 md:mb-8 animate-system-input pt-px">
                                <span className="font-mono text-[9px] tracking-[0.4em] uppercase"><span className="text-red-500">&gt;&gt; </span><span className="text-white/40"> ACCESSING_DATA</span><span className="text-red-500 animate-blink tracking-normal">_</span></span>
                                <button
                                    onClick={onClose}
                                    className="text-white/20 hover:text-white transition-all p-1 active:scale-95 flex-shrink-0"
                                    style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', letterSpacing: '0.2em' }}
                                >
                                    [ESC]
                                </button>
                            </div>

                            {/* Title */}
                            <div className="relative">
                                <h2
                                    className="font-brick text-white uppercase"
                                    style={{
                                        fontSize: 'clamp(2rem, 3.5vw, 3.2rem)',
                                        lineHeight: '0.82',
                                        letterSpacing: '-0.03em',
                                    }}
                                >
                                    {project.title}
                                </h2>
                                <div className="flex items-center gap-4 mt-4">
                                    <div className="h-px w-6 bg-white/20"></div>
                                    <span className="font-mono text-[9px] text-white/40 tracking-[0.3em] uppercase">{project.subtitle}</span>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-4 mb-8">
                            <div className="font-mono text-[8px] text-white/20 mb-4 tracking-[0.4em]">// SYSTEM_LOG</div>
                            <p className="text-white/50 text-[11px] leading-[1.7] tracking-[0.04em] max-w-md font-mono border-l border-white/5 pl-5">
                                {project.longDesc || project.desc}
                            </p>
                        </div>

                        {/* FOOTER: CREDITS (Simplified) */}
                        {project.credits && project.credits.length > 0 && (
                            <div className="px-4 pb-4 md:px-10 md:pb-8 mt-auto">
                                <div className="space-y-4">
                                    <div className="font-mono text-[7px] text-white/20 mb-4 tracking-[0.4em] uppercase">COLABORADORES_PROJETO</div>
                                    {project.credits.map((credit, idx) => (
                                        <div key={idx} className="flex justify-between items-baseline border-b border-white/5 pb-2">
                                            <span className="font-mono text-[8px] text-white/30 uppercase tracking-[0.2em]">{credit.role}</span>
                                            <span className="font-mono text-[10px] text-white/80 tracking-wider uppercase">{credit.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    {/* FIXED FOOTER: GEN_DIVISION */}
                    <div className="flex-shrink-0 px-4 pb-4 md:px-10 md:pb-6 border-t border-white/5 pt-3">
                        <div className="flex items-center justify-between font-mono text-[9px] text-white/20 tracking-[0.5em] uppercase">
                            <span>GEN_DIVISION // AUTHENTICATED</span>
                            <span className="text-white/5">0XBRK_772</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* NAV NEXT */}
            {onNext && (
                <button onClick={onNext} className="hidden md:flex items-center justify-center z-[115] text-red-500/60 nav-btn-crt transition-all duration-300 hover:scale-125 hover:translate-x-1 px-4 active:scale-90 shrink-0"
                    style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '36px' }}>
                    &gt;
                </button>
            )}
        </div>
    );
};

const WorksGridItem = ({ work, index, onOpen }: { work: Work, index: number, onOpen: (work: Work) => void }) => {
    const settings = work.imageSettingsWorks || { x: 50, y: 50, scale: 1.2 };

    return (
        <div
            className={`group relative w-full aspect-[2/3] md:aspect-[9/16] border border-white/10 bg-[#050505] overflow-hidden cursor-pointer hover:border-[#DC2626] transition-colors duration-300 reveal`}
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => onOpen(work)}
        >
            {/* UPDATED FILTERS FOR VISIBILITY */}
            <div
                className="absolute inset-0 opacity-100 sharp-image saturate-[0.9] group-hover:saturate-110 brightness-95 group-hover:brightness-105 group-hover:opacity-100 transition-all duration-700"
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
                </div>
                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-lg md:text-xl font-brick text-white leading-none mb-2 tracking-tight group-hover:text-[#DC2626] transition-colors">{work.title}</h3>
                    <p className="text-[10px] md:text-xs text-[#9CA3AF] font-mono tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">{work.desc}</p>
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
            <button onClick={onHome} className="fixed top-24 left-6 md:left-12 font-mono text-[#9CA3AF] hover:text-white text-xs md:text-sm tracking-widest uppercase transition-colors z-40 flex items-center gap-2 group mix-blend-difference">
                <span className="text-[#DC2626] group-hover:-translate-x-1 transition-transform">&lt;</span> {t('common.return_surface')}
            </button>
            <main className="pt-32 md:pt-40 min-h-screen flex flex-col">
                <section className="w-full px-6 md:px-12 lg:px-24 mb-12 reveal">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-brick text-white mb-4">{t('works_page.archive_index').split('_').slice(0, -1).join('_')}_<span className="text-[#DC2626]">{t('works_page.archive_index').split('_').slice(-1)[0]}</span></h1>
                            <p className="font-mono text-[10px] md:text-xs tracking-widest max-w-xl animate-system-input"><span className="text-[#DC2626]">&gt;&gt; </span> <span className="text-[#9CA3AF]">{t('works_page.accessing')} <span className="text-white">{works.length}</span> {t('works_page.entries_found')}</span></p>
                        </div>
                    </div>
                </section>
                <section className="w-full px-6 md:px-12 lg:px-24 flex-1 pb-32 md:pb-40">
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
            <button onClick={onBack} className="fixed top-24 left-6 md:left-12 font-mono text-[#9CA3AF] hover:text-white text-xs md:text-sm tracking-widest uppercase transition-colors z-40 flex items-center gap-2 group mix-blend-difference">
                <span className="text-[#DC2626] group-hover:-translate-x-1 transition-transform">&lt;</span> {t('common.return_index')}
            </button>
            <main className="pt-32 md:pt-40 min-h-screen flex flex-col bg-[#050505] pb-32 md:pb-40 px-4 md:px-8" onClick={onBack}>
                <article className="w-full max-w-5xl mx-auto mt-12 md:mt-16 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                    <div className="relative border border-white/10 bg-[#070707] backdrop-blur-sm overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#DC2626] to-transparent opacity-80"></div>

                        <header className="px-7 md:px-14 pt-12 md:pt-16 pb-12 border-b border-white/10">
                            <div className="max-w-3xl mx-auto">
                                <div className="flex flex-wrap justify-start gap-3 md:gap-4 items-center mb-7 text-[10px] font-mono uppercase tracking-widest md:-ml-8">
                                    <span className="text-[#DC2626]">LOG_ID: {post.id}</span>
                                    <span className="text-[#9CA3AF]">DATE: {post.date}</span>
                                    {post.tags.map((tag: string) => (
                                        <span key={tag} className="border border-white/15 bg-white/[0.02] px-2 py-1 text-white/60">{tag}</span>
                                    ))}
                                </div>

                                <h1 className="text-3xl md:text-5xl lg:text-6xl font-brick text-white leading-[0.95] tracking-tight mb-8 text-center">
                                    {(post.title || '').toUpperCase() === 'A MÁQUINA NÃO TEM ALMA. NÓS TEMOS.' ? (
                                        <>
                                            A MÁQUINA NÃO TEM ALMA.{' '}
                                            <span className="text-[#DC2626] drop-shadow-[0_0_15px_rgba(220,38,38,0.45)]">NÓS TEMOS.</span>
                                        </>
                                    ) : post.title}
                                </h1>

                                <p className="text-base md:text-xl text-[#b8bcc4] font-light leading-relaxed text-center">
                                    {post.excerpt}
                                </p>
                            </div>
                        </header>

                        <div className="px-7 md:px-14 py-12 md:py-16">
                            <div className="max-w-3xl mx-auto">
                                <div className="prose prose-invert prose-lg max-w-none prose-p:text-[#d2d5db] prose-p:leading-relaxed md:prose-p:leading-loose prose-p:mb-6 md:prose-p:mb-8 prose-headings:font-brick prose-headings:text-white prose-headings:mt-10 prose-headings:mb-4 prose-strong:text-white prose-blockquote:border-[#DC2626] prose-blockquote:text-white/85 prose-blockquote:my-8 prose-a:text-[#DC2626] hover:prose-a:text-white">
                                    {typeof post.content === 'string'
                                        ? <div dangerouslySetInnerHTML={{ __html: post.content }} />
                                        : post.content}
                                </div>
                            </div>
                        </div>
                    </div>
                </article>
            </main>
            <Footer onChat={onChat} />
        </React.Fragment>
    );
};

const TransmissionsPage = ({ onHome, onChat, onWorks, onTransmissions, onSelectPost, onAbout }: any) => {
    const { t, i18n } = useTranslation();
    const { transmissions } = useContext(DataContext)!;
    return (
        <React.Fragment>
            <Header onChat={onChat} onWorks={onWorks} onTransmissions={onTransmissions} onHome={onHome} onAbout={onAbout} isChatView={false} />
            <button onClick={onHome} className="fixed top-24 left-6 md:left-12 font-mono text-[#9CA3AF] hover:text-white text-xs md:text-sm tracking-widest uppercase transition-colors z-40 flex items-center gap-2 group mix-blend-difference">
                <span className="text-[#DC2626] group-hover:-translate-x-1 transition-transform">&lt;</span> {t('common.return_surface')}
            </button>
            <main className="pt-32 md:pt-40 min-h-screen flex flex-col bg-[#050505]">
                <section className="w-full px-6 md:px-12 lg:px-24 mb-12 reveal">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-brick text-white mb-4">{t('transmissions_page.title').split('_').slice(0, -1).join('_')}_<span className="text-[#DC2626]">{t('transmissions_page.title').split('_').slice(-1)[0]}</span></h1>
                            <p className="font-mono text-[10px] md:text-xs tracking-widest animate-system-input"><span className="text-[#DC2626]">&gt;&gt; </span> <span className="text-[#9CA3AF]">{t('transmissions_page.incoming')} <span className="text-white">{transmissions.length}</span> {t('transmissions_page.records')}</span></p>
                        </div>
                    </div>
                </section>
                <section className="w-full px-6 md:px-12 lg:px-24 flex-1 pb-32 md:pb-40 reveal">
                    <div className="space-y-2 md:space-y-3 bg-transparent border-t border-white/10">
                        {transmissions.map((post) => (
                            <div key={post.id} onClick={() => onSelectPost(post)} className="block group bg-[#050505] hover:bg-[#0a0a0a] transition-colors p-9 md:p-12 border border-white/10 cursor-pointer">
                                <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 mb-4">
                                    <h3 className="text-xl md:text-3xl font-brick text-white tracking-tight group-hover:text-[#DC2626] transition-colors">
                                        {getLocalizedField(post.title, i18n.language, 'UNTITLED')}
                                    </h3>
                                    <span className="font-mono text-[10px] text-[#DC2626] tracking-widest whitespace-nowrap">{post.date}</span>
                                </div>
                                <p className="text-[#9CA3AF] text-sm md:text-base font-light max-w-3xl mb-6 leading-relaxed">
                                    {getLocalizedField(post.excerpt, i18n.language, '')}
                                </p>
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
                <p className="text-3xl md:text-5xl lg:text-6xl font-brick text-[#DC2626] leading-none max-w-5xl drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">{t('footer.we_have_intelligence')}</p>
                <MagneticButton onClick={onChat} className="mt-6 text-base md:text-lg font-ai font-bold text-white hover:text-[#DC2626] group">
                    {t('footer.talk_to_us')} <span className="text-[#DC2626] animate-blink group-hover:text-white">_</span>
                </MagneticButton>
            </div>
            <div className="mt-16 border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-start gap-4 reveal">
                <div className="flex gap-6">
                    {['LinkedIn', 'Instagram'].map((social) => (
                        <a key={social} href={`https://${social.toLowerCase()}.com/brickai`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-white hover:text-[#DC2626] tracking-widest uppercase transition-colors">{social}</a>
                    ))}
                </div>
                <div className="text-[9px] uppercase tracking-[0.2em] text-[#9CA3AF]/40 font-bold text-right">
                    <span className="block mb-2">&copy; 2026 Brick AI.</span>
                    <span className="hidden md:inline">{t('footer.generative_division')}</span>
                    <span className="block mt-1">{t('footer.rights_reserved')}</span>
                    {onAdmin && <button onClick={onAdmin} className="mt-4 opacity-20 hover:opacity-100 transition-opacity">{t('footer.system_admin')}</button>}
                </div>
            </div>
        </footer>
    );
};

const SystemChat = ({ onBack }: { onBack: () => void }) => {
    const { t, i18n } = useTranslation();
    const [messages, setMessages] = useState<{ role: string, content: string }[]>([
        { role: 'mono', content: t('chat.initial_messages.online') },
        { role: 'mono', content: t('chat.initial_messages.protocol') }
    ]);
    const [input, setInput] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const SUGGESTIONS = [
        t('chat.suggestions.philosophy'),
        t('chat.suggestions.synthesis'),
        t('chat.suggestions.humans')
    ];

    const isFirstRender = useRef(true);
    const isLangFirstRender = useRef(true);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return; }
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isLangFirstRender.current) { isLangFirstRender.current = false; return; }
        setMessages([
            { role: 'mono', content: t('chat.initial_messages.online') },
            { role: 'mono', content: t('chat.initial_messages.protocol') }
        ]);
    }, [i18n.language, t]);

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
        <div className="min-h-screen pt-32 md:pt-40 pb-32 md:pb-40 flex flex-col items-center justify-start font-mono relative bg-[#050505] overflow-x-hidden">

            {/* RETURN BUTTON */}
            <button onClick={onBack} className="fixed top-24 left-6 md:left-12 text-[#9CA3AF] hover:text-white text-xs md:text-sm tracking-widest uppercase transition-colors z-40 flex items-center gap-2 group mix-blend-difference">
                <span className="text-[#DC2626] group-hover:-translate-x-1 transition-transform">&lt;</span> {t('common.return_surface')}
            </button>

            <main className="w-full px-6 md:px-12 lg:px-24 relative z-10 flex flex-col gap-24">

                {/* 1. CONTACT SECTION (Humans) */}
                <section className="w-full animate-fade-in-up">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-brick text-white mb-4">REACH_<span className="text-[#DC2626]">HUMANS</span></h1>
                            <p className="font-mono text-[10px] md:text-xs tracking-widest uppercase animate-system-input"><span className="text-[#DC2626]">&gt;&gt; </span> <span className="text-[#9CA3AF]">{t('chat.manual_override')}</span></p>
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

                        {/* WHATSAPP */}
                        <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="group block bg-[#0A0A0A] border border-white/5 p-8 hover:border-[#DC2626] transition-colors duration-500">
                            <div className="mb-4 text-[#DC2626] opacity-50 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] uppercase tracking-widest border border-[#DC2626] px-2 py-1">Channel_02</span>
                            </div>
                            <h3 className="text-2xl font-brick text-white mb-1 group-hover:text-[#DC2626] transition-colors">{t('chat.direct_message')}</h3>
                            <p className="text-[#9CA3AF] text-xs font-mono tracking-widest">WHATSAPP</p>
                        </a>

                        {/* SOCIAL */}
                        <div className="group block bg-[#0A0A0A] border border-white/5 p-8 hover:border-[#DC2626] transition-colors duration-500">
                            <div className="mb-4 text-[#DC2626] opacity-50 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] uppercase tracking-widest border border-[#DC2626] px-2 py-1">Channel_03</span>
                            </div>
                            <h3 className="text-2xl font-brick text-white mb-4 group-hover:text-[#DC2626] transition-colors">{t('chat.network_nodes')}</h3>
                            <div className="flex flex-wrap gap-4">
                                {['LinkedIn', 'Instagram'].map(social => (
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
            <button onClick={onHome} className="fixed top-24 left-6 md:left-12 font-mono text-[#9CA3AF] hover:text-white text-xs md:text-sm tracking-widest uppercase transition-colors z-40 flex items-center gap-2 group mix-blend-difference">
                <span className="text-[#DC2626] group-hover:-translate-x-1 transition-transform">&lt;</span> {t('common.return_surface')}
            </button>

            <main className="min-h-screen pt-32 md:pt-40 flex flex-col bg-[#050505] relative overflow-hidden">
                <div className="scanline-effect opacity-10 pointer-events-none"></div>

                {/* ── HERO: DOSSIER STYLE ── */}
                <section className="pb-24 md:pb-32 border-b border-white/10 reveal relative overflow-hidden">
                    {/* Background breathing glow — bleeds like home */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#DC2626]/5 rounded-full blur-[120px] pointer-events-none animate-breathe"></div>
                    <div className="w-full px-6 md:px-12 lg:px-24">

                        {/* PAGE HEADER */}
                        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                            <div>
                                <h1 className="text-3xl md:text-5xl font-brick text-white mb-4">
                                    {t('about.origin').split('_')[0]}_<span className="text-[#DC2626]">{t('about.origin').split('_').slice(1).join('_')}</span>
                                </h1>
                                <p className="font-mono text-[10px] md:text-xs tracking-widest uppercase animate-system-input"><span className="text-[#DC2626]">&gt;&gt; </span> <span className="text-[#9CA3AF]">ACCESS_GRANTED // <span className="text-white">{t('about.est')}</span></span></p>
                            </div>
                        </div>

                        {/* CENTERED: MONOLITH + TITLE + DESC */}
                        <div className="flex flex-col items-center text-center gap-10 py-8">

                            {/* MONOLITH */}
                            <div className="relative">
                                <div className="monolith-structure w-[100px] h-[200px] md:w-[130px] md:h-[260px] rounded-[2px] flex items-center justify-center overflow-visible shadow-2xl relative">
                                    <div className="absolute inset-0 mix-blend-overlay monolith-texture bg-neutral-900 pointer-events-none rounded-[2px] overflow-hidden"></div>
                                    <div className="centered-layer aura-atmos pointer-events-none opacity-60 w-[300px] h-[300px] blur-[60px]"></div>
                                    <div className="centered-layer light-atmos animate-breathe pointer-events-none opacity-60 w-[200px] h-[200px] blur-[40px]"></div>
                                    <div className="centered-layer core-atmos pointer-events-none"></div>
                                    <div className="absolute inset-0 border border-white/5 opacity-50 pointer-events-none z-10 rounded-[2px]"></div>
                                </div>
                            </div>

                            {/* VISÃO DE CINEMA */}
                            <div className="flex flex-col items-center gap-3">
                                <p className="font-brick text-5xl md:text-6xl lg:text-7xl text-white leading-tight tracking-tight uppercase">
                                    {t('about.title_primary')}<br />
                                    <span className="text-[#DC2626]">{t('about.title_highlight')}</span>
                                </p>
                            </div>

                            {/* DESCRIPTION */}
                            <div className="max-w-xl font-mono text-sm text-[#9CA3AF] leading-relaxed">
                                <div className="flex gap-4 group text-left">
                                    <span className="text-[#DC2626] font-bold shrink-0 opacity-50 group-hover:opacity-100">[01]</span>
                                    <p className="border-l border-white/10 pl-4 group-hover:border-[#DC2626] transition-colors">
                                        {t('about.description')}
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* ── CAPACIDADES: INDUSTRIAL GRID ── */}
                <section className="pt-24 md:pt-32 pb-24 md:pb-32 reveal bg-[#080808]">
                    <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
                        <div className="flex items-center justify-between mb-16">
                            <div className="flex items-center gap-4">
                                <div className="w-2 h-2 bg-[#DC2626]"></div>
                                <span className="font-mono text-[10px] tracking-[0.4em] text-white uppercase">{t('about.core_modules')}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
                            {['cinematography', 'training', 'architecture'].map((mod, idx) => (
                                <div key={idx} className="group p-10 hover:bg-[#DC2626]/[0.02] transition-all duration-500 min-h-[320px] flex flex-col justify-between relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 font-mono text-[10px] text-white/10 group-hover:text-[#DC2626]/40 transition-colors uppercase tracking-[0.5em]">
                                        Unit_0{idx + 1}
                                    </div>

                                    <div>
                                        <div className="mb-8 flex items-center gap-2">
                                            <div className="w-4 h-px bg-[#DC2626]"></div>
                                            <span className="font-mono text-[10px] text-[#DC2626] tracking-[0.3em] uppercase">
                                                {t(`about.modules.${mod}.status`)}
                                            </span>
                                        </div>
                                        <h3 className="font-brick text-xl md:text-2xl text-white mb-4 uppercase group-hover:text-[#DC2626] transition-colors duration-500">
                                            {t(`about.modules.${mod}.title`)}
                                        </h3>
                                    </div>

                                    <p className="font-mono text-xs md:text-sm text-[#9CA3AF] leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity border-t border-white/5 pt-6">
                                        {t(`about.modules.${mod}.desc`)}
                                    </p>
                                </div>
                            ))}
                        </div>

                    </div>
                </section>

                {/* ── MANIFESTO: BRUTALIST BLOCKS ── */}
                <section className="pt-24 md:pt-32 pb-24 md:pb-32 reveal bg-[#050505]">
                    <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
                        <div className="flex items-center justify-between mb-16 border-b border-white/10 pb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-2 h-2 bg-[#DC2626]"></div>
                                <span className="font-mono text-[10px] tracking-[0.4em] text-white uppercase">{t('about.manifesto.title')}</span>
                            </div>
                            <span className="font-mono text-[10px] tracking-[0.2em] text-[#9CA3AF] uppercase">{t('about.manifesto.subtitle')}</span>
                        </div>

                        <div className="divide-y divide-white/10">
                            {['control', 'curation', 'black_box'].map((key, i) => (
                                <div key={i} className="group grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 py-10 hover:bg-[#DC2626]/[0.02] transition-all duration-500 px-2">
                                    <div className="md:col-span-1 font-mono text-[10px] text-[#DC2626]/50 group-hover:text-[#DC2626] tracking-[0.3em] uppercase pt-1 transition-colors">
                                        0{i + 1}
                                    </div>
                                    <h3 className="md:col-span-4 font-brick text-xl md:text-2xl text-white uppercase group-hover:text-[#DC2626] transition-colors duration-500 leading-tight">
                                        {t(`about.manifesto.cards.${key}.title`)}
                                    </h3>
                                    <p className="md:col-span-7 font-mono text-xs md:text-sm text-[#9CA3AF] leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">
                                        {t(`about.manifesto.cards.${key}.desc`)}
                                    </p>
                                </div>
                            ))}
                        </div>

                    </div>
                </section>

            </main>
            <Footer onChat={onChat} />
        </React.Fragment>
    );
};

// --- ADMIN PAGE ---
const AdminPage = ({ onHome }: { onHome: () => void }) => {
    const { t, i18n } = useTranslation();
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
                                        <h3 className="text-white font-mono text-sm">{getLocalizedField(post.title, i18n.language, 'UNTITLED')}</h3>
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
                                <h2 className="text-lg font-brick text-white">{activeTab === 'works' ? 'EDIT_PROJECT' : 'EDIT_TRANSMISSION'}</h2>
                                <button onClick={() => setEditingItem(null)} className="text-[#9CA3AF] hover:text-white text-2xl">&times;</button>
                            </div>

                            <div className="flex flex-col lg:flex-row">
                                {/* Left Side - Form Fields */}
                                <div className="lg:w-1/2 p-6 space-y-4 border-r border-white/10">

                                    {activeTab === 'works' ? (
                                        <>
                                            <h3 className="text-xs font-mono text-[#DC2626] mb-4 uppercase tracking-widest">Project Info</h3>
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
                                        </>
                                    ) : (
                                        <>
                                            <h3 className="text-xs font-mono text-[#DC2626] mb-4 uppercase tracking-widest">Transmission Info</h3>
                                            <div>
                                                <label className="block text-[10px] font-mono text-[#9CA3AF] mb-2 uppercase tracking-widest">Title</label>
                                                <input type="text" value={editingItem.title || ''} onChange={e => setEditingItem({ ...editingItem, title: e.target.value })} className="w-full bg-transparent border border-white/20 p-3 text-white font-mono text-sm focus:outline-none focus:border-[#DC2626]" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-mono text-[#9CA3AF] mb-2 uppercase tracking-widest">Excerpt</label>
                                                <textarea value={editingItem.excerpt || ''} onChange={e => setEditingItem({ ...editingItem, excerpt: e.target.value })} rows={2} className="w-full bg-transparent border border-white/20 p-2 text-white font-mono text-xs focus:outline-none focus:border-[#DC2626] resize-none" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-mono text-[#9CA3AF] mb-2 uppercase tracking-widest">Content</label>
                                                <textarea value={typeof editingItem.content === 'string' ? editingItem.content : ''} onChange={e => setEditingItem({ ...editingItem, content: e.target.value })} rows={8} className="w-full bg-transparent border border-white/20 p-2 text-white font-mono text-xs focus:outline-none focus:border-[#DC2626] resize-none" placeholder="Full article content..." />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-mono text-[#9CA3AF] mb-2 uppercase tracking-widest">Date</label>
                                                    <input type="text" value={editingItem.date || ''} onChange={e => setEditingItem({ ...editingItem, date: e.target.value })} placeholder="2025.01.01" className="w-full bg-transparent border border-white/20 p-2 text-white font-mono text-xs focus:outline-none focus:border-[#DC2626]" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-mono text-[#9CA3AF] mb-2 uppercase tracking-widest">Tags (comma sep.)</label>
                                                    <input type="text" value={Array.isArray(editingItem.tags) ? editingItem.tags.join(', ') : ''} onChange={e => setEditingItem({ ...editingItem, tags: e.target.value.split(',').map((t: string) => t.trim()).filter(Boolean) })} placeholder="TAG1, TAG2" className="w-full bg-transparent border border-white/20 p-2 text-white font-mono text-xs focus:outline-none focus:border-[#DC2626]" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-mono text-[#9CA3AF] mb-2 uppercase tracking-widest">URL (slug)</label>
                                                <input type="text" value={editingItem.url || ''} onChange={e => setEditingItem({ ...editingItem, url: e.target.value })} placeholder="article-slug" className="w-full bg-transparent border border-white/20 p-2 text-white font-mono text-xs focus:outline-none focus:border-[#DC2626]" />
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Right Side - Image Editor (works only) */}
                                <div className={`${activeTab === 'works' ? 'lg:w-1/2' : 'hidden'} p-6 space-y-6`}>
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
                                                        className="absolute inset-0 transition-all duration-300 opacity-100 filter saturate-[0.8] contrast-[1.05] brightness-[1.0]"
                                                        style={{
                                                            backgroundImage: `url('${editingItem.imageHome}')`,
                                                            backgroundSize: 'cover',
                                                            backgroundPosition: 'center center',
                                                            transform: `scale(${editingItem.imageSettingsHome?.scale || 1.2}) translate(${((editingItem.imageSettingsHome?.x || 50) - 50) * 2}%, ${((editingItem.imageSettingsHome?.y || 50) - 50) * 2}%) translateZ(0)`
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 opacity-90" style={{ background: 'linear-gradient(to top, #050505 0%, #050505e6 15%, #05050599 40%, transparent 70%)' }} />
                                                    <div className="absolute bottom-4 left-4 right-4 z-10">
                                                        <h4
                                                            className="text-4xl font-brick text-white uppercase tracking-tighter leading-none"
                                                            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 4px 12px rgba(0,0,0,0.7), 0 8px 30px rgba(0,0,0,0.5)' }}
                                                        >
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

// --- SEO COMPONENT ---
// SEO data imported from shared module (also used by server.js for SSR meta injection)
import { SEO_DATA } from './seo-data.js';
import { buildBreadcrumbItems } from './shared/breadcrumbs.js';

const SEO = ({ view, selectedPost }: { view: string, selectedPost: Post | null }) => {
    const { i18n } = useTranslation();
    const lang = i18n.language === 'pt' ? 'pt' : 'en';
    const data = SEO_DATA[lang][view] || SEO_DATA[lang].home;

    useEffect(() => {
        // Derive post-specific meta when viewing a blog post
        let title = data.title;
        let description = data.description;
        let ogTitle = data.ogTitle || data.title;
        let ogDescription = data.ogDescription || data.description;

        if (view === 'post' && selectedPost) {
            const postTitle = getLocalizedField(selectedPost.title, lang, 'Article');
            const postExcerpt = getLocalizedField(selectedPost.excerpt, lang, '');
            title = `${postTitle} | Brick AI`;
            description = postExcerpt || description;
            ogTitle = postTitle;
            ogDescription = postExcerpt || ogDescription;
        }

        // Update Title
        document.title = title;

        // Update Description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute('content', description);

        // Update OG Tags
        const updateMeta = (name: string, content: string, attr: string = 'property') => {
            let meta = document.querySelector(`meta[${attr}="${name}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute(attr, name);
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', content);
        };

        // Build canonical path from actual URL, not view name
        const canonicalPath = view === 'home' ? ''
            : view === 'post' && selectedPost
                ? `transmissions/${selectedPost.url || selectedPost.id}`
                : view;
        const canonicalUrl = `https://ai.brick.mov/${canonicalPath}`;

        updateMeta('og:title', ogTitle);
        updateMeta('og:description', ogDescription);
        updateMeta('og:image', 'https://ai.brick.mov/og-image.jpg');
        updateMeta('og:image:width', '1200');
        updateMeta('og:image:height', '630');
        updateMeta('og:url', canonicalUrl);
        updateMeta('og:type', view === 'post' ? 'article' : 'website');
        updateMeta('og:site_name', 'Brick AI');
        updateMeta('og:locale', lang === 'pt' ? 'pt_BR' : 'en_US');
        updateMeta('og:locale:alternate', lang === 'pt' ? 'en_US' : 'pt_BR');
        updateMeta('twitter:card', 'summary_large_image', 'name');
        updateMeta('twitter:title', ogTitle, 'name');
        updateMeta('twitter:description', ogDescription, 'name');
        updateMeta('twitter:image', 'https://ai.brick.mov/og-image.jpg', 'name');
        updateMeta('twitter:site', '@brick_mov', 'name');
        updateMeta('theme-color', '#050505', 'name');

        // Article-specific OG tags for blog posts
        if (view === 'post' && selectedPost) {
            if (typeof selectedPost.date === 'string' && selectedPost.date) {
                const isoDate = selectedPost.date.replace(/\./g, '-');
                updateMeta('article:published_time', isoDate);
            }
            updateMeta('article:author', 'https://ai.brick.mov');
        }

        // Update Canonical
        let linkCanonical = document.querySelector('link[rel="canonical"]');
        if (!linkCanonical) {
            linkCanonical = document.createElement('link');
            linkCanonical.setAttribute('rel', 'canonical');
            document.head.appendChild(linkCanonical);
        }
        linkCanonical.setAttribute('href', canonicalUrl);

        // Keep language + hreflang consistent
        document.documentElement.setAttribute('lang', lang === 'pt' ? 'pt-BR' : 'en');

        const upsertAlt = (hreflang: string, href: string) => {
            let link = document.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`) as HTMLLinkElement | null;
            if (!link) {
                link = document.createElement('link');
                link.setAttribute('rel', 'alternate');
                link.setAttribute('hreflang', hreflang);
                document.head.appendChild(link);
            }
            link.setAttribute('href', href);
        };

        upsertAlt('x-default', canonicalUrl);
        upsertAlt('pt-BR', `https://ai.brick.mov/${canonicalPath}`);
        upsertAlt('en', `https://ai.brick.mov/${canonicalPath}?lang=en`);

        // Remove all previously injected dynamic JSON-LD scripts
        document.querySelectorAll('script[data-dynamic-ld]').forEach(s => s.remove());

        const addJsonLd = (data: any) => {
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.setAttribute('data-dynamic-ld', 'true');
            script.text = JSON.stringify(data);
            document.head.appendChild(script);
        };

        const isEn = lang.startsWith('en');

        // BreadcrumbList — navigation hierarchy for Google (shared logic)
        const breadcrumbItems = buildBreadcrumbItems(view, lang,
            (view === 'post' && selectedPost)
                ? { title: getLocalizedField(selectedPost.title, lang, 'Article'), canonicalUrl }
                : null
        );
        addJsonLd({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbItems
        });

        // FAQPage — injected dynamically so it matches the current UI language
        if (view === 'home') {
            const faqEntities = isEn ? [
                { "@type": "Question", "name": "What is Brick AI?", "acceptedAnswer": { "@type": "Answer", "text": "Brick AI is a Brazilian generative production company founded in 2016. We combine human artistic and cinematic direction with synthetic generation systems to create advertising campaigns, VFX, and premium visual content. We are a specialized division of Brick, a production company with a proven track record with clients like Stone, Visa, BBC, and L'Oréal." } },
                { "@type": "Question", "name": "What sets Brick AI apart from traditional production companies?", "acceptedAnswer": { "@type": "Answer", "text": "Brick AI operates what we call an 'Infinite Set': any scenario, context or aesthetic, produced with cinematic quality in a fraction of the time and cost of conventional production. While traditional companies are limited by physical logistics — locations, equipment, travel — we remove those barriers without compromising human creative direction." } },
                { "@type": "Question", "name": "How does Brick AI ensure the result won't look generic or AI-generated?", "acceptedAnswer": { "@type": "Answer", "text": "Most AI-generated content without artistic direction results in automation without authorship. At Brick AI, every production goes through rigorous human curation: art direction, color grading, sound design and editing are led by professionals with over 10 years of on-set experience. Generative systems create the structural base; elite finishing is applied by our team." } },
                { "@type": "Question", "name": "Has Brick AI worked with major brands?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Our portfolio includes projects for Stone, Visa, BBC, Record TV, AliExpress, Keeta, Facebook, O Boticário and L'Oréal. The short film 'Inheritance', produced by Brick AI, was an official selection of the Gramado Film Festival 2025 — one of the first generative films to compete at the festival." } },
                { "@type": "Question", "name": "What is Hybrid Production?", "acceptedAnswer": { "@type": "Answer", "text": "Hybrid Production is Brick AI's methodology that combines traditional filming, classical post-production, and synthetic generation systems in a single workflow. The result is content with the quality and artistic intent of a major production, with the agility and budget viability of digital generation." } },
                { "@type": "Question", "name": "How long does a generative AI production take at Brick AI?", "acceptedAnswer": { "@type": "Answer", "text": "Generative production significantly reduces timelines compared to traditional production. Projects that would take 45 days in a conventional setup can be delivered in 10 to 15 business days. Briefing, visual reference approval and creative alignment are the most decisive steps in determining the final timeline." } },
                { "@type": "Question", "name": "Is using generative AI in video production legally safe?", "acceptedAnswer": { "@type": "Answer", "text": "Brick AI operates as a production company, not a software vendor. Every deliverable is an audiovisual work licensed by Brick, with the same contracts and legal security as any traditional production. Projects for Visa and Stone follow the same compliance standards required by these companies in their conventional productions." } }
            ] : [
                { "@type": "Question", "name": "O que é a Brick AI?", "acceptedAnswer": { "@type": "Answer", "text": "Brick AI é uma produtora generativa brasileira fundada em 2016. Combinamos direção artística e cinematográfica humana com sistemas de geração sintética para criar campanhas publicitárias, VFX e conteúdo visual premium. Somos uma divisão especializada da Brick, produtora com histórico em clientes como Stone, Visa, BBC e L'Oréal." } },
                { "@type": "Question", "name": "Qual é o diferencial da Brick AI em relação a produtoras tradicionais?", "acceptedAnswer": { "@type": "Answer", "text": "A Brick AI opera no que chamamos de 'Set Infinito': qualquer cenário, contexto ou estética, produzido com qualidade cinematográfica e em uma fração do tempo e custo da produção convencional. Enquanto produtoras tradicionais estão limitadas por logística física — locações, equipamento, viagens —, nós removemos essas barreiras sem abrir mão do padrão de direção humana." } },
                { "@type": "Question", "name": "Como a Brick AI garante que o resultado não vai parecer genérico ou estranho?", "acceptedAnswer": { "@type": "Answer", "text": "A maior parte do conteúdo gerado sem direção artística resulta em automação sem autoria. Na Brick AI, toda produção passa por curadoria humana rigorosa: direção de arte, color grading, sound design e montagem são conduzidos por profissionais com mais de 10 anos de experiência em set. Os sistemas de geração criam a base estrutural; a finalização de elite é aplicada pela equipe." } },
                { "@type": "Question", "name": "A Brick AI já trabalhou com grandes marcas?", "acceptedAnswer": { "@type": "Answer", "text": "Sim. O portfólio da Brick inclui projetos para Stone, Visa, BBC, Record TV, AliExpress, Keeta, Facebook, O Boticário e L'Oréal. O curta 'Inheritance', produzido pela Brick AI, foi seleção oficial do Festival de Cinema de Gramado 2025, sendo um dos primeiros filmes gerativos a competir no festival." } },
                { "@type": "Question", "name": "O que é Produção Híbrida?", "acceptedAnswer": { "@type": "Answer", "text": "Produção Híbrida é a metodologia da Brick AI que combina filmagem tradicional, pós-produção clássica e sistemas de geração sintética em um único fluxo de trabalho. O resultado é conteúdo com a qualidade e intenção artística de uma grande produção, com a agilidade e viabilidade de orçamento da geração digital." } },
                { "@type": "Question", "name": "Quanto tempo leva uma produção com sistemas generativos na Brick AI?", "acceptedAnswer": { "@type": "Answer", "text": "O processo generativo reduz significativamente os prazos em relação à produção tradicional. Projetos que levariam 45 dias em uma produção convencional podem ser entregues em 10 a 15 dias úteis. O briefing, a aprovação de referências visuais e o alinhamento criativo são as etapas mais determinantes do prazo total." } },
                { "@type": "Question", "name": "Usar sistemas de geração sintética na produção de vídeo é seguro juridicamente?", "acceptedAnswer": { "@type": "Answer", "text": "A Brick AI opera como produtora, não como fornecedora de software. Toda entrega é uma obra audiovisual licenciada pela Brick, com os mesmos contratos e segurança jurídica de qualquer produção tradicional. Os projetos para Visa e Stone seguem os mesmos padrões de compliance exigidos por essas empresas em suas produções convencionais." } }
            ];
            addJsonLd({ "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": faqEntities });
        }

        if (view === 'works') {
            const itemList = isEn ? [
                { "@type": "CreativeWork", "position": 1, "name": "Inheritance", "description": "One of the first AI-made films selected at the Gramado Film Festival 2025. A fable about cycles, hubris, and the illusion of progress.", "award": "Official Selection — Gramado Film Festival 2025", "dateCreated": "2025", "url": "https://ai.brick.mov/transmissions/inheritance" },
                { "@type": "CreativeWork", "position": 2, "name": "We Can Sell Anything", "description": "One character, infinite worlds. A production manifesto showing any scenario in 60 seconds.", "award": "Genero Challenge Finalist" },
                { "@type": "CreativeWork", "position": 3, "name": "Autobol", "description": "Reimagination of a forgotten 1970s Brazilian sport where cars pushed a giant ball between Rio clubs." },
                { "@type": "CreativeWork", "position": 4, "name": "Dog Day Afternoon", "description": "Absurdist comedy played completely straight — dogs in everyday human situations." },
                { "@type": "CreativeWork", "position": 5, "name": "Factory", "description": "Industrial decay with a retro-futuristic aesthetic — a future imagined in the 70s, aged and abandoned." }
            ] : [
                { "@type": "CreativeWork", "position": 1, "name": "Inheritance", "description": "Um dos primeiros filmes feitos com IA selecionado no Festival de Gramado 2025. Uma fábula sobre ciclos, hubris e a ilusão do progresso.", "award": "Seleção Oficial Festival de Gramado 2025", "dateCreated": "2025", "url": "https://ai.brick.mov/transmissions/inheritance" },
                { "@type": "CreativeWork", "position": 2, "name": "Vendemos Qualquer Coisa", "description": "Um personagem, infinitos mundos. Manifesto de produção mostrando qualquer cenário em 60 segundos.", "award": "Finalista Genero Challenge" },
                { "@type": "CreativeWork", "position": 3, "name": "Autobol", "description": "Reimaginação do esporte brasileiro dos anos 70 onde carros empurravam uma bola gigante entre clubes cariocas." },
                { "@type": "CreativeWork", "position": 4, "name": "Dog Day Afternoon", "description": "Comédia absurda levada a sério — cachorros em situações cotidianas humanas." },
                { "@type": "CreativeWork", "position": 5, "name": "Factory", "description": "Decadência industrial com estética retro-futurista — um futuro imaginado nos anos 70, envelhecido e abandonado." }
            ];
            addJsonLd({
                "@context": "https://schema.org",
                "@type": "ItemList",
                "name": isEn ? "Brick AI Portfolio" : "Portfólio Brick AI",
                "itemListElement": itemList
            });
        }

        if (view === 'post' && selectedPost) {
            const postUrl = `https://ai.brick.mov/transmissions/${selectedPost.url || selectedPost.id}`;
            // Convert post.date ("2025.01.15") to ISO ("2025-01-15")
            const isoDate = typeof selectedPost.date === 'string'
                ? selectedPost.date.replace(/\./g, '-')
                : new Date().toISOString().split('T')[0];
            addJsonLd({
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": typeof selectedPost.title === 'string' ? selectedPost.title : "Article",
                "description": typeof selectedPost.excerpt === 'string' ? selectedPost.excerpt : "",
                "author": { "@type": "Organization", "name": "Brick AI", "url": "https://ai.brick.mov" },
                "publisher": { "@type": "Organization", "name": "Brick AI", "logo": { "@type": "ImageObject", "url": "https://ai.brick.mov/og-image.jpg" } },
                "datePublished": isoDate,
                "dateModified": isoDate,
                "url": postUrl,
                "mainEntityOfPage": { "@type": "WebPage", "@id": postUrl }
            });
        }

    }, [view, lang, selectedPost]);

    return null;
};

const AppContent = ({ view, setView, monolithHover, setMonolithHover, selectedProject, setSelectedProject, selectedPost, setSelectedPost, goHome, goWorks, goTransmissions, goChat, goAdmin, goAbout, handleSelectPost }: any) => {
    const { works, transmissions } = useContext(DataContext)!;

    const navigateProject = (dir: -1 | 1) => {
        if (!selectedProject || !works.length) return;
        const idx = works.findIndex((w: Work) => w.id === selectedProject.id);
        const next = (idx + dir + works.length) % works.length;
        setSelectedProject(works[next]);
    };

    useLayoutEffect(() => {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    }, [view]);

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
            <SEO view={view} selectedPost={selectedPost} />
            <GlobalStyles />
            <div className="noise-overlay"></div>
            <CustomCursor active={monolithHover || selectedProject !== null} />
            {selectedProject && (
                <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} onPrev={() => navigateProject(-1)} onNext={() => navigateProject(1)} />
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
