import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, Eye, Fingerprint, Globe, Globe2, Menu, X } from 'lucide-react';
import * as THREE from 'three';
import { useTranslation } from 'react-i18next';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';
import './src/i18n';
import './src/index.css';

// Extend Window for gtag (GA4)
declare global { interface Window { gtag?: (...args: any[]) => void; } }

// --- STYLES & CONFIG ---
const GlobalStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@100;200;300&display=swap');
        .font-editorial {
            font-family: 'Barlow', sans-serif;
            font-style: normal;
            font-weight: 200;
            letter-spacing: 0.2em;
            text-transform: uppercase;
        }
        .climax-title {
            background: linear-gradient(to bottom, #ffffff, var(--brick-gray));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            padding-top: 0.25em;
            padding-bottom: 0.15em;
            line-height: 1.2;
        }
        .climax-title:hover {
            -webkit-text-fill-color: var(--brick-red);
            background: none;
            filter: drop-shadow(0 0 100px rgba(var(--brick-red-rgb),0.95));
        }
        /* COLORS & UTILS */
        :root {
            --brick-black: #050505;
            --brick-dark: #0a0a0a;
            --brick-red: #DC2626;
            --brick-red-rgb: 220, 38, 38;
            --brick-gray: #9CA3AF;
            --brick-white: #E5E5E5;
            --brick-surface: #070707;
        }
        html, body, #root {
            width: 100%;
            max-width: 100%;
            overflow-x: clip;
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
            0%, 100% { transform: translate(-50%, -50%) scale(0.95); opacity: 0.2; }
            50% { transform: translate(-50%, -50%) scale(1.05); opacity: 0.8; }
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
        @keyframes dot-pulse {
            0%, 100% { opacity: 0.7; box-shadow: 0 0 4px 1px rgba(var(--brick-red-rgb),0.3); }
            50% { opacity: 1; box-shadow: 0 0 8px 3px rgba(var(--brick-red-rgb),0.6); }
        }
        .animate-dot-pulse { animation: dot-pulse 4s ease-in-out infinite; }
        @keyframes fiber-travel {
            0% { transform: translateX(-100%); opacity: 0; }
            8% { opacity: 0.6; }
            92% { opacity: 0.6; }
            100% { transform: translateX(500%); opacity: 0; }
        }
        .animate-fiber { animation: fiber-travel 4s linear infinite; }
        .animate-fiber-b { animation: fiber-travel 4s linear infinite; animation-delay: -2s; }
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
        @keyframes border-trace {
            0% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: -116; }
        }
        .animate-border-trace { animation: border-trace 3s linear infinite; }
        .animate-scan { animation: scan 3s ease-in-out forwards; }

        @keyframes pulse-halo {
            0%, 100% {
                box-shadow: inset -6px 0 15px rgba(var(--brick-red-rgb),0.4), 0 0 20px rgba(var(--brick-red-rgb),0.1), 0 0 40px rgba(var(--brick-red-rgb),0.05);
                opacity: 0.6;
            }
            50% {
                box-shadow: inset -8px 0 25px rgba(255,80,80,0.8), 0 0 35px rgba(var(--brick-red-rgb),0.25), 0 0 70px rgba(var(--brick-red-rgb),0.12);
                opacity: 0.9;
            }
        }
        @keyframes red-emanation {
            0%, 100% {
                opacity: 0.15;
                transform: translate3d(0, 0, 0) scaleX(0.98);
            }
            50% {
                opacity: 0.35;
                transform: translate3d(1%, 0, 0) scaleX(1.02);
            }
        }
        @keyframes breath-release-glow {
            0%, 100% {
                opacity: 0.2;
                transform: scale(0.98);
            }
            50% {
                opacity: 0.5;
                transform: scale(1.02);
            }
        }
        @keyframes twinkle {
            from { opacity: 0.1; transform: scale(0.8); }
            to   { opacity: 1;   transform: scale(1.2); box-shadow: 0 0 4px rgba(255,255,255,0.8); }
        }
        @keyframes red-grid-drift {
            0% { background-position: 0 0, 0 0, center; }
            100% { background-position: 0 26px, 26px 0, center; }
        }

        @keyframes hero-fade-in {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        .hero-fade-entry {
            display: inline-block;
            animation: hero-fade-in 1.2s ease-out forwards;
        }

        @keyframes crt-glitch-text {
            0% { text-shadow: 2px 0 0 rgba(var(--brick-red-rgb),0.8), -2px 0 0 rgba(0,255,255,0.5), 0 0 10px rgba(var(--brick-red-rgb),0.6); }
            20% { text-shadow: -2px 0 0 rgba(var(--brick-red-rgb),0.8), 2px 0 0 rgba(0,255,255,0.5), 0 0 15px rgba(var(--brick-red-rgb),0.6); }
            40% { text-shadow: 2px 0 0 rgba(var(--brick-red-rgb),0.8), -2px 0 0 rgba(0,255,255,0.5), 0 0 10px rgba(var(--brick-red-rgb),0.8); }
            60% { text-shadow: -2px 0 0 rgba(var(--brick-red-rgb),0.8), 2px 0 0 rgba(0,255,255,0.5), 0 0 15px rgba(var(--brick-red-rgb),0.5); }
            80% { text-shadow: 2px 0 0 rgba(var(--brick-red-rgb),0.8), -2px 0 0 rgba(0,255,255,0.5), 0 0 20px rgba(var(--brick-red-rgb),0.8); }
            100% { text-shadow: -2px 0 0 rgba(var(--brick-red-rgb),0.8), 2px 0 0 rgba(0,255,255,0.5), 0 0 10px rgba(var(--brick-red-rgb),0.6); }
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
            background: linear-gradient(to bottom, var(--brick-black), #000000);
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
        
        /* Transition Delays for Staggered Hero Entry */
        .delay-1500 { transition-delay: 1500ms !important; }
        .delay-2000 { transition-delay: 2000ms !important; }
        .delay-2500 { transition-delay: 2500ms !important; }
        .delay-3000 { transition-delay: 3000ms !important; }
        .delay-3500 { transition-delay: 3500ms !important; }
        .delay-4000 { transition-delay: 4000ms !important; }
        .delay-4500 { transition-delay: 4500ms !important; }
        .delay-5000 { transition-delay: 5000ms !important; }

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

        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .animate-marquee {
            animation: marquee 60s linear infinite;
        }
        .text-stroke {
            -webkit-text-stroke: 1px rgba(255, 255, 255, 0.1);
            color: transparent;
        }

        /* LEGACY SECTION UTILS */
        .text-stroke {
            -webkit-text-stroke: 1px rgba(255, 255, 255, 0.1);
            color: transparent;
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
    titleFull?: string;
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
                titleFull: t('works.inheritance.titleFull'),
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
                gradient: "from-neutral-900 via-brick-red/10 to-neutral-900",
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
                id: "slop-ai",
                orientation: "horizontal",
                subtitle: t('works.slopai.subtitle'),
                category: "CONCEITO : CINEMATOGRAFIA SINTÉTICA",
                title: t('works.slopai.title'),
                desc: t('works.slopai.desc'),
                longDesc: t('works.slopai.longDesc'),
                credits: [],
                gradient: "from-neutral-950 to-brick-red/20",
                imageHome: "/slopai.jpg",
                imageWorks: "/slopai.jpg",
                imageSettingsHome: { x: 50, y: 50, scale: 1.0 },
                imageSettingsWorks: { x: 50, y: 50, scale: 1.0 },
                videoUrl: "https://review.brick.mov/portfolio/embed/11",
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
                gradient: "from-neutral-950 to-brick-red/20",
                imageHome: "/uploads/f9c13e36-0abe-43c9-8161-805cd9f2d1f3.jpeg",
                imageWorks: "/uploads/f9c13e36-0abe-43c9-8161-805cd9f2d1f3.jpeg",
                videoUrl: "https://review.brick.mov/portfolio/embed/6",
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
                gradient: "from-neutral-950 to-brick-red/20",
                imageHome: "/uploads/adfee249-a46b-44ca-8d7b-b7b5db4ba60b.jpg",
                imageWorks: "/uploads/adfee249-a46b-44ca-8d7b-b7b5db4ba60b.jpg",
                videoUrl: "https://review.brick.mov/portfolio/embed/8",
                hasDetail: true
            },
        ];

        const generatedTransmissions: Post[] = [
            {
                id: "log_001",
                date: "2025.01.15",
                title: { pt: t('transmissions.log_001.title'), en: t('transmissions.log_001.title') },
                excerpt: { pt: t('transmissions.log_001.excerpt'), en: t('transmissions.log_001.excerpt') },
                tags: ["MANIFESTO", "IA", "AUTORIA"],
                url: "log_001",
                content: t('transmissions.log_001.content_p1')
            },
            {
                id: "log_002",
                date: "2025.02.10",
                title: { pt: t('transmissions.log_002.title'), en: t('transmissions.log_002.title') },
                excerpt: { pt: t('transmissions.log_002.excerpt'), en: t('transmissions.log_002.excerpt') },
                tags: ["PRODUÇÃO", "DIREÇÃO", "CINEMA"],
                url: "log_002",
                content: t('transmissions.log_002.content_p1')
            },
            {
                id: "log_003",
                date: "2025.03.05",
                title: { pt: t('transmissions.log_003.title'), en: t('transmissions.log_003.title') },
                excerpt: { pt: t('transmissions.log_003.excerpt'), en: t('transmissions.log_003.excerpt') },
                tags: ["EVOLUÇÃO", "VANGUARDA", "TECNOLOGIA"],
                url: "log_003",
                content: t('transmissions.log_003.content_p1')
            },
        ];

        const syncData = async () => {
            let finalWorks = [...generatedWorks];
            let finalTrans: Post[] = [...generatedTransmissions];

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
                    if (Array.isArray(dbTrans) && dbTrans.length > 0) {
                        finalTrans = dbTrans;
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
                    <span key={i} style={glitched ? { color: 'var(--brick-red)' } : undefined}>{char}</span>
                ))
                : displayed}
        </span>
    );
};

const TypewriterText = ({ text, className, delay = 0, onComplete }: { text: string, className?: string, delay?: number, onComplete?: () => void }) => {
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);

    useEffect(() => {
        let i = 0;
        const timeout = setTimeout(() => {
            const interval = setInterval(() => {
                i++;
                setDisplayed(text.slice(0, i));
                if (i >= text.length) {
                    clearInterval(interval);
                    setDone(true);
                    if (onComplete) onComplete();
                }
            }, 120);
            return () => clearInterval(interval);
        }, delay);

        return () => clearTimeout(timeout);
    }, [text, delay, onComplete]);

    return (
        <span className={className}>
            {displayed}<span className={`text-brick-red ${done ? 'animate-blink' : 'opacity-100'}`}>_</span>
        </span>
    );
};

const ScrambleText = ({ text, className, hoverTrigger = false, triggerOnReveal = false, delay = 0 }: { text: string, className?: string, hoverTrigger?: boolean, triggerOnReveal?: boolean, delay?: number }) => {
    const [displayText, setDisplayText] = useState(text);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_!@#$%^&*";
    const intervalRef = useRef<any>(null);
    const containerRef = useRef<HTMLSpanElement>(null);
    const [hasBeenRevealed, setHasBeenRevealed] = useState(false);

    const scramble = () => {
        let iteration = 0;
        clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            setDisplayText(prev =>
                text
                    .split("")
                    .map((letter, index) => {
                        if (index < iteration) return text[index];
                        if (letter === " ") return " ";
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
        if (!triggerOnReveal) {
            if (delay > 0) {
                // Initial state: scrambled
                setDisplayText(text.split("").map(c => c === " " ? " " : chars[Math.floor(Math.random() * chars.length)]).join(""));
                const t = setTimeout(scramble, delay);
                return () => clearTimeout(t);
            } else {
                setDisplayText(text);
                scramble();
            }
        }
    }, [text, triggerOnReveal, delay]);

    useEffect(() => {
        if (triggerOnReveal) {
            const observer = new IntersectionObserver(([entry]) => {
                if (entry.isIntersecting && !hasBeenRevealed) {
                    setHasBeenRevealed(true);
                    setTimeout(scramble, delay);
                }
            }, { threshold: 0.1 });

            if (containerRef.current) observer.observe(containerRef.current);
            return () => observer.disconnect();
        }
    }, [triggerOnReveal, hasBeenRevealed, delay]);

    return (
        <span
            ref={containerRef}
            className={className}
            onMouseEnter={hoverTrigger ? scramble : undefined}
        >
            {triggerOnReveal && !hasBeenRevealed ? text.split("").map(c => c === " " ? " " : chars[Math.floor(Math.random() * chars.length)]).join("") : displayText}
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
            className={`hidden fixed top-0 left-0 w-2 h-2 bg-brick-red rounded-full pointer-events-none z-[9999] mix-blend-difference will-change-transform transition-opacity duration-200 ${active || isPointer ? 'opacity-100 scale-[3]' : 'opacity-0 scale-100'}`}
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
        <rect x="35" y="35" width="30" height="30" fill="var(--brick-red)" />
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
            <header className="fixed top-0 left-0 w-full z-50 px-6 pt-8 pb-6 md:px-12 flex justify-between items-baseline pointer-events-none transition-all duration-300 bg-gradient-to-b from-brick-black/70 from-[45%] to-transparent">
                <div onClick={onHome} className="pointer-events-auto flex items-baseline group cursor-pointer select-none z-50 relative">
                    <img src="/01.png" alt="BRICK" className="h-6 md:h-8 w-auto object-contain mr-1" />
                    <span className="text-brick-red font-light text-3xl md:text-4xl animate-blink mx-2 translate-y-[2px]">_</span>
                    <span className="text-gray-300 font-ai text-xl md:text-2xl group-hover:text-white transition-colors duration-500">AI</span>
                </div>

                {/* MOBILE MENU TOGGLE */}
                {!isChatView && (
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="pointer-events-auto md:hidden text-white hover:text-brick-red transition-colors z-50 relative p-2"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                )}

                {/* DESKTOP NAV */}
                {
                    !isChatView && (
                        <div className="hidden md:flex items-center gap-6 pointer-events-auto relative z-10">
                            {/* NAV STYLE: Raw Text Links */}

                            <MagneticButton onClick={onHome} className="group text-xs md:text-sm font-ai text-brick-gray hover:text-brick-red transition-colors duration-300">
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-2 duration-300">&gt;</span>
                                HOME
                            </MagneticButton>

                            <MagneticButton onClick={onAbout} className="group text-xs md:text-sm font-ai text-brick-gray hover:text-brick-red transition-colors duration-300">
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-2 duration-300">&gt;</span>
                                {t('header.about')}
                            </MagneticButton>

                            <MagneticButton onClick={onWorks} className="group text-xs md:text-sm font-ai text-brick-gray hover:text-brick-red transition-colors duration-300">
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-2 duration-300">&gt;</span>
                                {t('header.works')}
                            </MagneticButton>

                            <MagneticButton onClick={onTransmissions} className="group text-xs md:text-sm font-ai text-brick-gray hover:text-brick-red transition-colors duration-300">
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-2 duration-300">&gt;</span>
                                {t('header.transmissions')}
                            </MagneticButton>

                            {/* CTA STYLE: Subtle Blinking Underscore */}
                            <MagneticButton onClick={onChat} className="group text-xs md:text-sm font-ai text-white hover:text-brick-red transition-colors duration-300">
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-2 duration-300">&gt;</span>
                                {t('header.talk_to_us')} <span className="text-brick-red animate-blink group-hover:text-white">_</span>
                            </MagneticButton>

                            {/* LANGUAGE TOGGLE */}
                            <button
                                onClick={toggleLanguage}
                                className="ml-4 text-xs font-mono text-brick-gray hover:text-white transition-colors flex items-center gap-1 uppercase tracking-widest"
                            >
                                <Globe size={12} /> {i18n.language === 'en' ? 'PT' : 'EN'}
                            </button>
                        </div>
                    )
                }
            </header>

            {/* MOBILE MENU OVERLAY */}
            <div className={`fixed inset-0 z-40 bg-brick-black/95 backdrop-blur-xl flex flex-col items-center justify-center transition-all duration-500 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className="scanline-effect absolute inset-0 z-0 opacity-20 pointer-events-none"></div>
                <div className="flex flex-col items-center gap-8 relative z-10 w-full px-8">
                    <button onClick={() => handleNav(onHome)} className="text-2xl font-brick text-white hover:text-brick-red transition-colors w-full text-center border-b border-white/10 pb-4">
                        HOME
                    </button>
                    <button onClick={() => handleNav(onAbout)} className="text-2xl font-brick text-white hover:text-brick-red transition-colors w-full text-center border-b border-white/10 pb-4">
                        {t('header.about')}
                    </button>
                    <button onClick={() => handleNav(onWorks)} className="text-2xl font-brick text-white hover:text-brick-red transition-colors w-full text-center border-b border-white/10 pb-4">
                        {t('header.works')}
                    </button>
                    <button onClick={() => handleNav(onTransmissions)} className="text-2xl font-brick text-white hover:text-brick-red transition-colors w-full text-center border-b border-white/10 pb-4">
                        {t('header.transmissions')}
                    </button>
                    <button onClick={() => handleNav(onChat)} className="text-2xl font-brick text-brick-red hover:text-white transition-colors w-full text-center pb-4 animate-pulse">
                        {t('header.talk_to_us')} _
                    </button>

                    <button
                        onClick={toggleLanguage}
                        className="mt-8 text-sm font-mono text-brick-gray hover:text-white transition-colors flex items-center gap-2 uppercase tracking-widest border border-white/20 px-6 py-2 rounded-full"
                    >
                        <Globe size={14} /> {i18n.language === 'en' ? 'SWITCH TO PORTUGUESE' : 'SWITCH TO ENGLISH'}
                    </button>
                </div>
            </div>
        </React.Fragment>
    );
};

const FadeEntryText = ({ text, className, delay = 0 }: { text: string, className?: string, delay?: number }) => {
    const [render, setRender] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => {
            setRender(true);
        }, delay);
        return () => clearTimeout(t);
    }, [delay]);

    return (
        <span className={`${className || ''} ${render ? 'hero-fade-entry' : 'opacity-0'}`}>
            {render ? text : ''}
        </span>
    );
};

const Hero = ({ setMonolithHover, monolithHover }: { setMonolithHover: (v: boolean) => void, monolithHover: boolean }) => {
    const radiationRef = useRef<HTMLDivElement>(null);
    const lightSourceRef = useRef<HTMLDivElement>(null); // Interactive Red Dot tracking
    const targetPos = useRef({ x: 0, y: 0 });
    const currentPos = useRef({ x: 0, y: 0 });
    const { t } = useTranslation();
    const [typewriterDone, setTypewriterDone] = useState(false);

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
        <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-visible pt-20">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[100vh] bg-brick-red/5 rounded-full blur-[150px] pointer-events-none z-0 mix-blend-screen opacity-40"></div>

            <div className="reveal relative z-10 w-full flex justify-center mb-10 md:mb-16">
                <div className="relative">
                    <div
                        className={`monolith-structure w-[120px] h-[240px] md:w-[150px] md:h-[300px] rounded-[2px] flex items-center justify-center overflow-visible shadow-2xl relative transition-transform duration-1000 ease-out pointer-events-none ${monolithHover ? 'scale-[1.02]' : 'scale-100'}`}
                        style={{ transform: 'translateZ(0)' }}
                    >
                        <div className="absolute inset-0 mix-blend-overlay monolith-texture bg-neutral-900 pointer-events-none rounded-[2px] overflow-hidden"></div>
                        <div className="centered-layer aura-atmos pointer-events-none opacity-60" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle at center, rgba(153,27,27,0.1) 0%, transparent 60%)', filter: 'blur(30px)' }}></div>
                        <div className="centered-layer light-atmos animate-breathe pointer-events-none opacity-70 mix-blend-screen" style={{ width: '500px', height: '500px', background: 'radial-gradient(circle at center, rgba(var(--brick-red-rgb),0.6) 0%, rgba(153,0,0,0.1) 30%, transparent 50%)', filter: 'blur(20px)' }}></div>
                        <div className="centered-layer core-atmos animate-breathe pointer-events-none" style={{ width: '40px', height: '40px', filter: 'blur(10px)', background: 'radial-gradient(circle, rgba(var(--brick-red-rgb),1) 0%, rgba(var(--brick-red-rgb),0.4) 40%, transparent 80%)' }}></div>

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
                                    backgroundColor: 'var(--brick-red)',
                                    boxShadow: '0 0 10px 2px rgba(220, 38, 38, 0.6), 0 0 20px 4px rgba(220, 38, 38, 0.2)',
                                    opacity: 0,
                                    willChange: 'transform, opacity'
                                }}
                            ></div>

                            <div
                                ref={radiationRef}
                                className="absolute w-[600px] h-[600px] -ml-[300px] -mt-[300px] top-1/2 left-1/2 pointer-events-none transition-opacity duration-700 ease-out"
                                style={{
                                    background: 'radial-gradient(circle, rgba(var(--brick-red-rgb),0.25) 0%, rgba(var(--brick-red-rgb),0.05) 50%, transparent 80%)',
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
                        <div className="absolute inset-0 border border-white/10 opacity-50 pointer-events-none z-10 rounded-[2px]"></div>
                    </div>
                    <div
                        className="absolute inset-0 z-20 cursor-none"
                        onMouseMove={handleMouseMove}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    ></div>
                </div>
            </div>
            <div className="text-center z-20 max-w-6xl px-6 flex flex-col items-center pointer-events-none gap-4 md:gap-6">
                <p className="reveal delay-2000 text-base md:text-xl lg:text-2xl font-mono text-white drop-shadow-2xl">
                    <TypewriterText text={t('hero.scramble') as string} delay={2000} onComplete={() => setTypewriterDone(true)} />
                </p>
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-brick text-brick-red drop-shadow-[0_0_15px_rgba(var(--brick-red-rgb),0.5)] min-h-[50px] flex items-center justify-center">
                    {typewriterDone && <FadeEntryText text={t('hero.subtitle') as string} delay={900} />}
                </h2>
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brick-red/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
        </section>
    );
};

const ParticleBackground = ({ reactToMouse = true }: { reactToMouse?: boolean }) => {
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

        // Create a circular texture for soft particles & nebulas (optimized to 32x32)
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const context = canvas.getContext('2d');
        if (context) {
            const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
            gradient.addColorStop(0, 'rgba(255,255,255,1)');
            gradient.addColorStop(0.2, 'rgba(255,255,255,0.7)');
            gradient.addColorStop(0.5, 'rgba(255,255,255,0.15)');
            gradient.addColorStop(1, 'rgba(255,255,255,0)');
            context.fillStyle = gradient;
            context.fillRect(0, 0, 32, 32);
        }
        const particleTexture = new THREE.CanvasTexture(canvas);

        // 1. Small Stars (Backing) - Brighter
        const smallStarsCount = 3500;
        const smallPos = new Float32Array(smallStarsCount * 3);
        for (let i = 0; i < smallStarsCount; i++) {
            smallPos[i * 3] = (Math.random() - 0.5) * 20;
            smallPos[i * 3 + 1] = (Math.random() - 0.5) * 20;
            let z = (Math.random() - 0.5) * 20;
            if (Math.abs(z) < 1.5) z = z < 0 ? -1.5 : 1.5;
            smallPos[i * 3 + 2] = z;
        }
        const smallGeo = new THREE.BufferGeometry();
        smallGeo.setAttribute('position', new THREE.BufferAttribute(smallPos, 3));
        const smallMat = new THREE.PointsMaterial({
            size: 0.025, color: 0xffffff, map: particleTexture, transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false
        });
        const smallMesh = new THREE.Points(smallGeo, smallMat);
        scene.add(smallMesh);

        // 2. Medium Bright Stars - Brighter
        const medStarsCount = 700;
        const medPos = new Float32Array(medStarsCount * 3);
        for (let i = 0; i < medStarsCount; i++) {
            medPos[i * 3] = (Math.random() - 0.5) * 20;
            medPos[i * 3 + 1] = (Math.random() - 0.5) * 20;
            let z = (Math.random() - 0.5) * 20;
            if (Math.abs(z) < 3.5) z = z < 0 ? -3.5 : 3.5;
            medPos[i * 3 + 2] = z;
        }
        const medGeo = new THREE.BufferGeometry();
        medGeo.setAttribute('position', new THREE.BufferAttribute(medPos, 3));
        const medMat = new THREE.PointsMaterial({
            size: 0.06, color: 0xffffff, map: particleTexture, transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false
        });
        const medMesh = new THREE.Points(medGeo, medMat);
        scene.add(medMesh);

        // To make animations easier, expose them in an array
        const particlesMeshes = [smallMesh, medMesh];
        camera.position.z = 3;

        // Mouse interaction
        let mouseX = 0;
        let mouseY = 0;

        const handleMouseMove = (event: MouseEvent) => {
            mouseX = (event.clientX / window.innerWidth) - 0.5;
            mouseY = (event.clientY / window.innerHeight) - 0.5;
        };

        if (reactToMouse) {
            window.addEventListener('mousemove', handleMouseMove);
        }

        // Animation
        let animationFrameId: number;

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            // Rotate all backgrounds smoothly
            particlesMeshes.forEach((mesh) => {
                mesh.rotation.y += 0.0008;
            });

            // Mouse influence
            const targetX = reactToMouse ? mouseX * 0.5 : 0;
            const targetY = reactToMouse ? mouseY * 0.5 : 0;

            particlesMeshes.forEach(mesh => {
                mesh.rotation.x += 0.05 * (targetY - mesh.rotation.x);
                mesh.rotation.y += 0.05 * (targetX - mesh.rotation.y);
            });

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
            if (reactToMouse) {
                window.removeEventListener('mousemove', handleMouseMove);
            }
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            smallGeo.dispose();
            smallMat.dispose();
            medGeo.dispose();
            medMat.dispose();
            particleTexture.dispose();
            renderer.dispose();
        };
    }, []);

    return <div ref={mountRef} className="absolute inset-0 pointer-events-none z-0" />;
};

const GlobalParticleBackground = () => {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountRef.current.appendChild(renderer.domElement);

        const canvas = document.createElement('canvas');
        canvas.width = 32; canvas.height = 32;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
            g.addColorStop(0, 'rgba(255,255,255,1)');
            g.addColorStop(0.2, 'rgba(255,255,255,0.7)');
            g.addColorStop(0.5, 'rgba(255,255,255,0.15)');
            g.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, 32, 32);
        }
        const particleTexture = new THREE.CanvasTexture(canvas);

        const smallStarsCount = 3500;
        const smallPos = new Float32Array(smallStarsCount * 3);
        for (let i = 0; i < smallStarsCount; i++) {
            smallPos[i * 3] = (Math.random() - 0.5) * 20;
            smallPos[i * 3 + 1] = (Math.random() - 0.5) * 20;
            let z = (Math.random() - 0.5) * 20;
            if (Math.abs(z) < 1.5) z = z < 0 ? -1.5 : 1.5;
            smallPos[i * 3 + 2] = z;
        }
        const smallGeo = new THREE.BufferGeometry();
        smallGeo.setAttribute('position', new THREE.BufferAttribute(smallPos, 3));
        const smallMat = new THREE.PointsMaterial({ size: 0.025, color: 0xffffff, map: particleTexture, transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false });
        const smallMesh = new THREE.Points(smallGeo, smallMat);
        scene.add(smallMesh);

        const medStarsCount = 700;
        const medPos = new Float32Array(medStarsCount * 3);
        for (let i = 0; i < medStarsCount; i++) {
            medPos[i * 3] = (Math.random() - 0.5) * 20;
            medPos[i * 3 + 1] = (Math.random() - 0.5) * 20;
            let z = (Math.random() - 0.5) * 20;
            if (Math.abs(z) < 3.5) z = z < 0 ? -3.5 : 3.5;
            medPos[i * 3 + 2] = z;
        }
        const medGeo = new THREE.BufferGeometry();
        medGeo.setAttribute('position', new THREE.BufferAttribute(medPos, 3));
        const medMat = new THREE.PointsMaterial({ size: 0.06, color: 0xffffff, map: particleTexture, transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false });
        const medMesh = new THREE.Points(medGeo, medMat);
        scene.add(medMesh);

        const particlesMeshes = [smallMesh, medMesh];
        camera.position.z = 3;

        let mouseX = 0;
        let mouseY = 0;
        const handleMouseMove = (e: MouseEvent) => {
            mouseX = (e.clientX / window.innerWidth) - 0.5;
            mouseY = (e.clientY / window.innerHeight) - 0.5;
        };
        window.addEventListener('mousemove', handleMouseMove);

        let animId: number;
        const animate = () => {
            animId = requestAnimationFrame(animate);
            particlesMeshes.forEach(mesh => {
                mesh.rotation.y += 0.0008;
            });
            const targetX = mouseX * 0.5;
            const targetY = mouseY * 0.5;
            particlesMeshes.forEach(mesh => {
                mesh.rotation.x += 0.05 * (targetY - mesh.rotation.x);
                mesh.rotation.y += 0.05 * (targetX - mesh.rotation.y);
            });
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animId);
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            smallGeo.dispose(); smallMat.dispose();
            medGeo.dispose(); medMat.dispose();
            particleTexture.dispose();
            renderer.dispose();
        };
    }, []);

    return <div ref={mountRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />;
};

const TwinkleStars = ({ count = 200 }: { count?: number }) => {
    const stars = useMemo(() => Array.from({ length: count }).map(() => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        duration: `${Math.random() * 3 + 2}s`,
        delay: `${Math.random() * 4}s`,
    })), []);
    return (
        <div className="absolute inset-0 z-0 pointer-events-none">
            {stars.map((star, i) => (
                <div key={i} className="absolute rounded-full bg-white" style={{
                    top: star.top, left: star.left,
                    width: `${star.size}px`, height: `${star.size}px`,
                    opacity: star.opacity,
                    animation: `twinkle ${star.duration} ease-in-out ${star.delay} infinite alternate`,
                }} />
            ))}
        </div>
    );
};

const Philosophy = () => {
    const { t } = useTranslation();

    return (
        <section className="relative w-full pt-20 pb-0 bg-brick-black z-20 border-t border-white/10 overflow-hidden">
            <ParticleBackground />

            {/* NOISE OVERLAY */}
            <div className="absolute inset-0 z-[2] opacity-20 pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150"></div>

            <div className="absolute inset-0 z-[1] bg-[radial-gradient(circle,transparent_40%,rgba(5,5,5,0.9)_100%)] pointer-events-none"></div>
            <div className="absolute -bottom-44 left-[-12%] w-[95vw] h-[70vh] bg-red-700/10 blur-[180px] pointer-events-none z-[3] origin-left" style={{ animation: 'red-emanation 9.5s ease-in-out infinite' }}></div>
            <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
                <div className="mb-20 reveal w-full flex flex-col items-center">
                    <div className="w-full flex justify-center mb-6">
                        <div className="relative w-5 h-5">
                            <div className="absolute left-1/2 top-1/2 w-5 h-5 -translate-x-1/2 -translate-y-1/2 rounded-full animate-breathe blur-[2px]" style={{ background: 'radial-gradient(circle at center, rgba(var(--brick-red-rgb),0.55) 0%, rgba(var(--brick-red-rgb),0.18) 45%, rgba(var(--brick-red-rgb),0) 75%)' }}></div>
                            <div className="absolute left-1/2 top-1/2 w-[2px] h-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brick-red/60"></div>
                        </div>
                    </div>
                    <span className="text-4xl md:text-6xl font-brick text-white bg-brick-black px-4 text-center">{t('philosophy.belief_label')}</span>
                </div>
                <div className="flex flex-col gap-24 w-full">
                    <PhilosophyItem title={t('philosophy.raw.title')} text={t('philosophy.raw.text')} titleSize="text-2xl md:text-3xl" index={0} />
                    <PhilosophyItem title={t('philosophy.noise.title')} text={t('philosophy.noise.text')} titleSize="text-3xl md:text-4xl" index={1} />
                    <PhilosophyItem title={t('philosophy.direct.title')} text={t('philosophy.direct.text')} titleSize="text-4xl md:text-6xl" index={2} />
                </div>
            </div>
        </section>
    );
};

type PhilosophyItemProps = {
    title: string;
    text: string;
    titleSize?: string;
    index?: number;
};

const PhilosophyItem = ({ title, text, titleSize = 'text-4xl md:text-6xl', index = 0 }: PhilosophyItemProps) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 2.2, delay: index * 0.4, ease: "easeOut" }}
        className="flex flex-col items-center group cursor-default"
    >
        <h2 className={`${titleSize} font-brick text-white mb-4 transition-colors duration-500 group-hover:text-brick-red`}>{title}</h2>
        <p className="text-base md:text-lg text-white font-light max-w-lg leading-relaxed transition-colors duration-300">{text}</p>
    </motion.div>
);

// --- COMPONENTE DE DATA CHIP ---
// Um pequeno elemento decorativo de "dado" que processa
const DataChip = ({ label, value }: { label: string, value: string }) => (
    <div className="flex flex-col gap-1">
        <span className="text-[8px] font-mono text-brick-gray/60 tracking-widest uppercase">{label}</span>
        <span className="text-[10px] font-mono text-white/90 tracking-widest uppercase border-b border-white/10 pb-0.5">{value}</span>
    </div>
);

const WorkCard = ({ work, index, onOpen }: { work: Work, index: number, onOpen: (work: Work) => void }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const bgRef = useRef<HTMLDivElement>(null);
    const settings = work.imageSettingsHome || { x: 50, y: 50, scale: 1.2 };
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            ref={containerRef}
            onClick={() => work.hasDetail && onOpen(work)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`reveal relative h-[500px] md:h-full overflow-hidden border border-white/10 hover:border-brick-red transition-colors duration-300 bg-brick-black group md:basis-0 ${work.hasDetail ? 'cursor-pointer' : 'cursor-default'}`}
            style={{
                containerType: 'inline-size',
                flexGrow: isHovered ? 1.6 : 1,
                flexShrink: 0,
                willChange: 'flex-grow',
                transition: 'flex-grow 1.4s cubic-bezier(0.22, 1, 0.36, 1), border-color 300ms ease',
            }}
        >
            {/* BACKGROUND IMAGE */}
            <div
                className="absolute inset-0 z-10 animate-float-parallax"
                style={{ animationDelay: `${index * -4}s` }}
            >
                <div
                    ref={bgRef}
                    className="absolute inset-0 sharp-image saturate-[0.8] group-hover:saturate-100 contrast-[1.05] group-hover:brightness-[1.1] transition-[filter] duration-700 ease-out"
                    style={{
                        backgroundImage: `url('${work.imageHome}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center center',
                        transform: `scale(${settings.scale}) translate(${(settings.x - 50) * 2}%, ${(settings.y - 50) * 2}%) translateZ(0)`,
                    }}
                />
            </div>

            {/* VIGNETTE & GRADIENT */}
            <div className="absolute inset-0 z-30 opacity-90 group-hover:opacity-80 transition-opacity duration-700" style={{ background: 'linear-gradient(to top, rgba(5,5,5,0.8) 0%, rgba(5,5,5,0.5) 20%, rgba(5,5,5,0.25) 40%, transparent 65%)' }} />
            <div className={`absolute inset-0 z-30 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] transition-opacity duration-700 ${isHovered ? 'opacity-40' : 'opacity-60'}`} />

            {/* CONTENT */}
            <div className={`absolute inset-x-0 bottom-0 z-40 p-4 md:p-6 flex flex-col justify-end transition-all duration-500 pointer-events-none ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                <div className="w-12 h-[2px] bg-brick-red mb-4 shadow-[0_0_8px_#DC2626]" />
                <h3
                    className="font-brick text-white leading-[0.9] drop-shadow-[0_0_30px_rgba(0,0,0,0.5)] mb-2"
                    style={{ fontSize: 'clamp(0.75rem, 7cqw, 3rem)' }}
                >
                    {work.title}
                </h3>
                <p className="text-white/40 text-[10px] font-mono tracking-widest uppercase mt-2">
                    {work.subtitle}
                </p>
            </div>

            {/* ID TAG */}
            <div className={`absolute top-4 left-4 md:top-6 md:left-6 transition-all duration-500 ${isHovered ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}>
                <span className="font-mono text-[10px] text-white/40 tracking-widest border border-white/10 px-2 py-1">
                    {work.id.toUpperCase()}
                </span>
            </div>

            {/* INDEX */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6 z-40 opacity-0 group-hover:opacity-60 transition-opacity duration-700 text-[10px] font-mono text-white/40 hidden md:block">
                {(index + 1).toString().padStart(2, '0')}
            </div>

            {/* SCANLINE */}
            <div className="absolute inset-0 scanline-effect opacity-0 group-hover:opacity-20 transition-opacity duration-1000 z-20 pointer-events-none" />
        </div>
    );
};

const SelectedWorks = ({ onSelectProject }: { onSelectProject: (work: Work) => void }) => {
    const { t } = useTranslation();
    return (
        <section id="works" className="w-full pt-20 pb-0 bg-transparent relative z-40 md:overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="px-6 md:px-12 lg:px-24 mb-6 flex items-center gap-3"
            >
                <span className="flex-shrink-0 flex items-center self-center">
                    <span className="block w-1 h-1 rounded-full bg-brick-red animate-dot-pulse"></span>
                </span>
                <span className="font-mono text-[9px] md:text-[10px] text-white/40 tracking-[0.6em] uppercase leading-none">{t('works_page.title')}</span>
            </motion.div>
            <div className="flex flex-col md:flex-row w-full h-auto md:h-[65vh] px-6 md:px-12 lg:px-24">
                <ContextConsumer>
                    {({ works }) => works.slice(0, 5).map((work, idx) => (
                        <WorkCard key={idx} work={work} index={idx} onOpen={onSelectProject} />
                    ))}
                </ContextConsumer>
            </div>
        </section>
    );
};

const TunnelBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = Math.min(window.devicePixelRatio, 2);
        let width = canvas.offsetWidth;
        let height = canvas.offsetHeight;

        const resize = () => {
            width = canvas.offsetWidth;
            height = canvas.offsetHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
        };
        resize();

        const NUM_RINGS = 24;
        const FOCAL = 0.8;
        const Z_NEAR = 0.05;
        const Z_FAR = 2.2;
        const SPEED = 0.006;
        const CORNER_RATIO = 0.22;

        const rings = Array.from({ length: NUM_RINGS }, (_, i) => ({
            z: Z_NEAR + (i / NUM_RINGS) * (Z_FAR - Z_NEAR),
            isAccent: i % 5 === 0,
        }));

        const getOctPoints = (cx: number, cy: number, w: number, h: number) => {
            const c = Math.min(w, h) * CORNER_RATIO;
            return [
                [cx - w / 2 + c, cy - h / 2],
                [cx + w / 2 - c, cy - h / 2],
                [cx + w / 2, cy - h / 2 + c],
                [cx + w / 2, cy + h / 2 - c],
                [cx + w / 2 - c, cy + h / 2],
                [cx - w / 2 + c, cy + h / 2],
                [cx - w / 2, cy + h / 2 - c],
                [cx - w / 2, cy - h / 2 + c],
            ];
        };

        const drawOctagon = (cx: number, cy: number, w: number, h: number) => {
            const pts = getOctPoints(cx, cy, w, h);
            ctx.beginPath();
            ctx.moveTo(pts[0][0], pts[0][1]);
            for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
            ctx.closePath();
            ctx.stroke();
        };

        let animId: number;

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            const cx = width / 2;
            const cy = height / 2;
            const baseW = width * 0.55;
            const baseH = height * 0.55;

            rings.forEach(r => {
                r.z -= SPEED;
                if (r.z < Z_NEAR) r.z += Z_FAR - Z_NEAR;
            });

            const sorted = [...rings].sort((a, b) => b.z - a.z);

            const computed = sorted.map(r => {
                const scale = FOCAL / r.z;
                const w = baseW * scale;
                const h = baseH * scale;
                const nd = 1 - (r.z - Z_NEAR) / (Z_FAR - Z_NEAR);
                let opacity = 1;
                if (nd < 0.12) opacity = nd / 0.12;
                if (nd > 0.8) opacity = (1 - nd) / 0.2;
                return { w, h, opacity, isAccent: r.isAccent };
            });

            // 8 perspective rails connecting consecutive octagon vertices
            for (let i = 0; i < computed.length - 1; i++) {
                const a = computed[i];
                const b = computed[i + 1];
                if (a.w < 2 || b.w < 2) continue;
                const ptsA = getOctPoints(cx, cy, a.w, a.h);
                const ptsB = getOctPoints(cx, cy, b.w, b.h);
                const lo = Math.min(a.opacity, b.opacity) * 0.13;
                ctx.strokeStyle = `rgba(var(--brick-red-rgb),${lo})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                for (let j = 0; j < 8; j++) {
                    ctx.moveTo(ptsA[j][0], ptsA[j][1]);
                    ctx.lineTo(ptsB[j][0], ptsB[j][1]);
                }
                ctx.stroke();
            }

            // Octagonal rings
            computed.forEach(({ w, h, opacity, isAccent }) => {
                if (w < 2 || h < 2) return;
                ctx.strokeStyle = isAccent
                    ? `rgba(var(--brick-red-rgb),${opacity * 0.6})`
                    : `rgba(255,255,255,${opacity * 0.07})`;
                ctx.lineWidth = isAccent ? 1 : 0.5;
                drawOctagon(cx, cy, w, h);
            });

            animId = requestAnimationFrame(draw);
        };

        draw();
        window.addEventListener('resize', resize);
        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
};

const StarGateBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.offsetWidth || window.innerWidth;
        let height = canvas.offsetHeight || window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        // 3 cores quentes (sem azul) → 3 batches por frame
        const colors = ['#DC2626', '#FF6B35', '#FFFFFF'];
        const N = colors.length;

        type StarObj = { x: number; y: number; z: number; pz: number; ci: number };

        const makeStar = (): StarObj => {
            const s: StarObj = {
                x: (Math.random() - 0.5) * width * 2,
                y: (Math.random() - 0.5) * height * 2,
                z: Math.random() * width,
                pz: 0,
                ci: Math.floor(Math.random() * N),
            };
            s.pz = s.z;
            return s;
        };

        const COUNT = 180; // menos estrelas → menos geometria por frame
        const stars: StarObj[] = Array.from({ length: COUNT }, makeStar);

        // Buffers reutilizáveis: zero alocação por frame
        const segsX0 = new Float32Array(COUNT);
        const segsY0 = new Float32Array(COUNT);
        const segsX1 = new Float32Array(COUNT);
        const segsY1 = new Float32Array(COUNT);
        const segCI = new Uint8Array(COUNT);
        const buckets = new Int32Array(N);

        let currentSpeed = 2;
        let animId: number;

        const handleScroll = () => {
            const maxScroll = document.body.scrollHeight - window.innerHeight;
            const pct = maxScroll > 0 ? window.scrollY / maxScroll : 0;
            currentSpeed = 2 + pct * 50;
        };

        const render = () => {
            ctx.fillStyle = 'rgba(0,0,0,0.28)'; // trail mais curto = menos pixels composited
            ctx.fillRect(0, 0, width, height);

            buckets.fill(0);

            // Passo 1: atualizar posições e coletar segmentos
            for (let i = 0; i < COUNT; i++) {
                const s = stars[i];
                s.pz = s.z;
                s.z -= currentSpeed;
                if (s.z < 1) {
                    s.z = width;
                    s.x = (Math.random() - 0.5) * width * 2;
                    s.y = (Math.random() - 0.5) * height * 2;
                    s.pz = s.z;
                }
                segsX0[i] = (s.x / s.pz) * width + width * 0.5;
                segsY0[i] = (s.y / s.pz) * height + height * 0.5;
                segsX1[i] = (s.x / s.z) * width + width * 0.5;
                segsY1[i] = (s.y / s.z) * height + height * 0.5;
                segCI[i] = s.ci;
                buckets[s.ci]++;
            }

            // Passo 2: desenhar 1 path por cor → apenas 4 stroke() por frame
            ctx.lineWidth = 1.5;
            for (let ci = 0; ci < N; ci++) {
                if (!buckets[ci]) continue;
                ctx.strokeStyle = colors[ci];
                ctx.beginPath();
                for (let i = 0; i < COUNT; i++) {
                    if (segCI[i] !== ci) continue;
                    ctx.moveTo(segsX0[i], segsY0[i]);
                    ctx.lineTo(segsX1[i], segsY1[i]);
                }
                ctx.stroke();
            }

            animId = requestAnimationFrame(render);
        };

        render();

        const handleResize = () => {
            width = canvas.offsetWidth || window.innerWidth;
            height = canvas.offsetHeight || window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll);

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
};

const MassiveTunnelBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        let animationFrameId: number;

        const resize = () => {
            const parent = canvas.parentElement;
            if (!parent) return;
            canvas.width = parent.clientWidth;
            canvas.height = parent.clientHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        const segments = 60;
        const sides = 8;
        let offset = 0;
        const speed = 0.003;

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            // Fit octagon within the container — constrained by the smaller dimension
            const distToSide = canvas.width / 2;
            const distToVert = canvas.height / 2;
            const maxRadius = Math.min(distToSide, distToVert) / 0.924 * 1.2;

            offset -= speed;
            if (offset < 0) offset += 1;

            // DRAW RAILS
            ctx.beginPath();
            for (let s = 0; s < sides; s++) {
                const angle = (s * Math.PI * 2) / sides + Math.PI / 8;
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(centerX + Math.cos(angle) * maxRadius, centerY + Math.sin(angle) * maxRadius);
            }
            ctx.strokeStyle = 'rgba(220, 38, 38, 0.15)';
            ctx.lineWidth = 1.0;
            ctx.stroke();

            for (let i = segments - 1; i >= 0; i--) {
                const z = (i + offset) / segments;

                const radius = Math.pow(z, 3.0) * maxRadius * 12;

                if (radius < 0.5) continue;
                if (radius > maxRadius) continue;

                const opacity = Math.pow(1 - z, 2.5);
                const strokeColor = `hsla(0, 100%, 50%, ${opacity * 0.6})`;

                ctx.beginPath();
                for (let s = 0; s <= sides; s++) {
                    const angle = (s * Math.PI * 2) / sides + Math.PI / 8;
                    const x = centerX + Math.cos(angle) * radius;
                    const y = centerY + Math.sin(angle) * radius;

                    if (s === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();

                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = (1 - z) * 2;
                ctx.stroke();
            }

            const time = Date.now() * 0.001;
            const osc = (Math.sin(time) + 1) / 2;
            const glowDist = maxRadius * (0.3 + osc * 0.5);
            const intensity = 0.1 + osc * 0.2;

            const coreGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowDist);
            coreGlow.addColorStop(0, `rgba(220, 38, 38, ${intensity})`);
            coreGlow.addColorStop(1, 'transparent');
            ctx.fillStyle = coreGlow;
            ctx.fillRect(0, 0, canvas.width, canvas.height);



            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none z-[1]">
            <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
        </div>
    );
};

const StarchildBackground = () => {
    return (
        <div className="absolute inset-0 pointer-events-none z-[1] bg-[#000000] overflow-hidden flex items-center justify-center">
            {/* Infinite Cosmic Void */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_80%)] z-10"></div>

            {/* Deep Evolution Glow */}
            <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.25, 0.1] }}
                transition={{ duration: 24, ease: "easeInOut", repeat: Infinity }}
                className="absolute w-[150vw] h-[150vw] md:w-[90vw] md:h-[90vw] bg-brick-red rounded-full blur-[150px] mix-blend-screen"
            />

            {/* The Starchild Core Light */}
            <motion.div
                animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 12, ease: "easeInOut", repeat: Infinity, delay: 2 }}
                className="absolute w-[60vw] h-[60vw] md:w-[35vw] md:h-[35vw] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.7)_0%,rgba(var(--brick-red-rgb),0.5)_40%,transparent_70%)] rounded-full blur-[80px] mix-blend-screen"
            />

            {/* Majestic Orbital Sweep (Jupiter/Monolith Eclipse style) */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 120, ease: "linear", repeat: Infinity }}
                className="absolute w-[200vw] h-[200vw] md:w-[150vw] md:h-[150vw] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(var(--brick-red-rgb),0.15)_45deg,transparent_90deg,rgba(var(--brick-red-rgb),0.15)_225deg,transparent_270deg)] blur-[60px] z-0"
            />

            {/* Floating Star Spores */}
            <div className="absolute inset-0 z-10 overflow-hidden mix-blend-screen">
                {[...Array(25)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-[1px] h-[1px] md:w-[2px] md:h-[2px] bg-white rounded-full blur-[1px]"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -50],
                            opacity: [0, 0.7, 0], scale: [1, 1.5, 1]
                        }}
                        transition={{
                            duration: 20 + Math.random() * 20,
                            repeat: Infinity, delay: Math.random() * 10, ease: "easeInOut"
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

// --- MONOLITH ANIMATION VARIANTS ---
const staticFromAnim = (anim: Record<string, number[] | string[]>) =>
    Object.fromEntries(Object.entries(anim).map(([key, values]) => [key, values[0]]));

const monolithAnimations = {
    // Inner monolith lights
    leftGleam: {
        animate: { y: ["1%", "-1%", "0.5%", "-1.5%", "1%"], scaleY: [0.97, 1.03, 0.98, 1.02, 0.97], opacity: [0.08, 0.12, 0.09, 0.13, 0.08] },
        transition: { duration: 18, ease: "easeInOut", repeat: Infinity, times: [0, 0.28, 0.48, 0.72, 1] }
    },
    rightGleam: {
        animate: { y: ["-1%", "1.5%", "0%", "2%", "-1%"], scaleY: [1.02, 0.97, 1.01, 0.98, 1.02], opacity: [0.07, 0.11, 0.08, 0.12, 0.07] },
        transition: { duration: 20, ease: "easeInOut", repeat: Infinity, times: [0, 0.22, 0.5, 0.76, 1] }
    },
    bottomGlow: {
        animate: { scaleY: [0.97, 1.03, 0.98, 1.04, 0.97], scaleX: [1.01, 0.98, 1.01, 0.97, 1.01], opacity: [0.12, 0.17, 0.13, 0.18, 0.12] },
        transition: { duration: 16, ease: "easeInOut", repeat: Infinity, times: [0, 0.3, 0.52, 0.78, 1] }
    },
    // Birth cloud (behind monolith)
    mainNebula: {
        animate: { opacity: [0.62, 0.72, 0.65, 0.74, 0.6, 0.62], scaleX: [0.98, 1.02, 0.99, 1.03, 0.97, 0.98], scaleY: [1.02, 0.98, 1.01, 0.97, 1.02, 1.02], y: ["0%", "-1%", "-0.5%", "-1.5%", "0.5%", "0%"] },
        transition: { duration: 22, ease: "easeInOut", repeat: Infinity, times: [0, 0.2, 0.4, 0.62, 0.84, 1] }
    },
    innerGlow: {
        animate: { opacity: [0.75, 0.85, 0.72, 0.88, 0.76, 0.75], scaleX: [0.99, 1.02, 0.98, 1.03, 0.99, 0.99], scaleY: [1.01, 0.98, 1.01, 0.97, 1.02, 1.01], y: ["0.5%", "-1%", "0%", "-1.5%", "0.5%", "0.5%"] },
        transition: { duration: 19, ease: "easeInOut", repeat: Infinity, delay: 0.2, times: [0, 0.18, 0.38, 0.6, 0.82, 1] }
    },
    leftVapor: {
        animate: { scaleX: [0.98, 1.02, 0.99, 1.03, 0.97, 0.98], scaleY: [1.02, 0.98, 1.01, 0.97, 1.02, 1.02], rotate: [0, 1.5, 0.5, 2, -0.5, 0], y: ["0%", "-1.5%", "-0.5%", "-2.5%", "-0.3%", "0%"], opacity: [0.6, 0.72, 0.64, 0.76, 0.58, 0.6] },
        transition: { duration: 20, ease: "easeInOut", repeat: Infinity, times: [0, 0.22, 0.42, 0.65, 0.85, 1] }
    },
    rightVapor: {
        animate: { scaleX: [1.02, 0.98, 1.01, 0.97, 1.03, 1.02], scaleY: [0.98, 1.02, 0.99, 1.03, 0.97, 0.98], rotate: [0, -1.5, -0.3, -2, 0.5, 0], y: ["0%", "-1.2%", "-0.3%", "-2%", "0.3%", "0%"], opacity: [0.56, 0.68, 0.6, 0.72, 0.54, 0.56] },
        transition: { duration: 21, ease: "easeInOut", repeat: Infinity, delay: 0.9, times: [0, 0.2, 0.44, 0.68, 0.86, 1] }
    },
    horizonStreak: {
        animate: { scaleX: [0.98, 1.02, 0.99, 1.03, 0.98], scaleY: [1.02, 0.98, 1.01, 0.97, 1.02], opacity: [0.16, 0.22, 0.18, 0.24, 0.16], y: ["0px", "-1px", "0px", "-2px", "0px"] },
        transition: { duration: 18, ease: "easeInOut", repeat: Infinity, delay: 0.4, times: [0, 0.24, 0.46, 0.72, 1] }
    },
    lowerStreak: {
        animate: { scaleY: [0.98, 1.03, 0.99, 1.02, 0.98], opacity: [0.12, 0.17, 0.14, 0.18, 0.12], y: ["14px", "12px", "13px", "11px", "14px"] },
        transition: { duration: 17, ease: "easeInOut", repeat: Infinity, delay: 1.1, times: [0, 0.26, 0.48, 0.74, 1] }
    },
    leftWispRed: {
        animate: { rotate: [0, 2, 0.5, 3, 0], scaleX: [0.98, 1.02, 0.99, 1.03, 0.98], scaleY: [1.02, 0.98, 1.01, 0.97, 1.02], y: ["0%", "-2%", "-0.5%", "-3%", "0%"], opacity: [0.08, 0.13, 0.1, 0.14, 0.08] },
        transition: { duration: 19, ease: "easeInOut", repeat: Infinity, delay: 0.3, times: [0, 0.24, 0.46, 0.72, 1] }
    },
    rightWispRed: {
        animate: { rotate: [0, -2, -0.5, -3, 0], scaleX: [1.02, 0.98, 1.01, 0.97, 1.02], scaleY: [0.98, 1.02, 0.99, 1.03, 0.98], y: ["0%", "-1.5%", "-0.5%", "-2.5%", "0%"], opacity: [0.08, 0.12, 0.09, 0.13, 0.08] },
        transition: { duration: 21, ease: "easeInOut", repeat: Infinity, delay: 1.1, times: [0, 0.22, 0.46, 0.74, 1] }
    },
    // Front vapor (in front of monolith)
    broadVapor: {
        animate: { opacity: [0.34, 0.4, 0.36, 0.42, 0.33, 0.34], scaleX: [0.99, 1.01, 0.99, 1.02, 0.98, 0.99], scaleY: [1.01, 0.98, 1.01, 0.98, 1.02, 1.01], y: ["0px", "-2px", "-1px", "-3px", "1px", "0px"] },
        transition: { duration: 20, ease: "easeInOut", repeat: Infinity, times: [0, 0.22, 0.42, 0.64, 0.84, 1] }
    },
    coreGlow: {
        animate: { opacity: [0.65, 0.74, 0.68, 0.76, 0.64, 0.65], scaleY: [0.98, 1.02, 0.99, 1.03, 0.97, 0.98], scaleX: [1.01, 0.98, 1.01, 0.98, 1.02, 1.01], y: ["-20px", "-22px", "-20.5px", "-23px", "-19px", "-20px"] },
        transition: { duration: 18, ease: "easeInOut", repeat: Infinity, times: [0, 0.24, 0.44, 0.66, 0.86, 1] }
    },
    horizonLight: {
        animate: { opacity: [0.72, 0.82, 0.75, 0.85, 0.7, 0.72], scaleX: [0.99, 1.02, 0.99, 1.02, 0.98, 0.99], scaleY: [1.01, 0.98, 1.01, 0.98, 1.02, 1.01], y: ["0px", "-1px", "0px", "-1.5px", "0.5px", "0px"] },
        transition: { duration: 19, ease: "easeInOut", repeat: Infinity, delay: 0.3, times: [0, 0.2, 0.4, 0.62, 0.84, 1] }
    },
    sharpHorizon: {
        animate: { opacity: [0.45, 0.54, 0.48, 0.56, 0.44, 0.45], scaleX: [0.99, 1.02, 0.99, 1.02, 0.98, 0.99], scaleY: [1.02, 0.98, 1.01, 0.97, 1.03, 1.02] },
        transition: { duration: 17, ease: "easeInOut", repeat: Infinity, times: [0, 0.22, 0.44, 0.66, 0.86, 1] }
    },
    leftWispWhite: {
        animate: { opacity: [0.24, 0.3, 0.26, 0.31, 0.24], scaleY: [0.98, 1.02, 0.99, 1.03, 0.98], rotate: [-1, 0.5, -0.5, 1, -1], y: ["-12px", "-14px", "-12.5px", "-15px", "-12px"] },
        transition: { duration: 18, ease: "easeInOut", repeat: Infinity, times: [0, 0.24, 0.46, 0.74, 1] }
    },
    rightWispWhite: {
        animate: { opacity: [0.18, 0.24, 0.2, 0.25, 0.18], scaleY: [1.02, 0.98, 1.01, 0.97, 1.02], rotate: [1, -0.5, 0.5, -1, 1], y: ["6px", "4px", "5.5px", "3px", "6px"] },
        transition: { duration: 19, ease: "easeInOut", repeat: Infinity, delay: 0.9, times: [0, 0.22, 0.46, 0.74, 1] }
    },
    thinStreak: {
        animate: { opacity: [0.18, 0.23, 0.19, 0.24, 0.18], scaleY: [0.98, 1.02, 0.99, 1.03, 0.98], y: ["1px", "-1px", "0.5px", "-1.5px", "1px"] },
        transition: { duration: 17, ease: "easeInOut", repeat: Infinity, delay: 0.2, times: [0, 0.24, 0.48, 0.76, 1] }
    },
    upperLeftTendril: {
        animate: { rotate: [0, 2, 0.5, 2.5, 0], scaleX: [0.99, 1.02, 0.99, 1.02, 0.99], scaleY: [1.01, 0.98, 1.01, 0.98, 1.01], y: ["0%", "-2%", "-0.5%", "-3%", "0%"], opacity: [0.14, 0.18, 0.15, 0.19, 0.14] },
        transition: { duration: 19, ease: "easeInOut", repeat: Infinity, times: [0, 0.24, 0.46, 0.72, 1] }
    },
    lowerRightTendril: {
        animate: { rotate: [0, -2, -0.5, -2.5, 0], scaleX: [1.01, 0.98, 1.01, 0.98, 1.01], scaleY: [0.99, 1.02, 0.99, 1.02, 0.99], y: ["8%", "6%", "7.5%", "5%", "8%"], opacity: [0.12, 0.16, 0.13, 0.17, 0.12] },
        transition: { duration: 20, ease: "easeInOut", repeat: Infinity, delay: 0.8, times: [0, 0.22, 0.46, 0.74, 1] }
    }
};

const UnifiedEnding = ({ onChat, onAdmin }: { onChat: () => void, onAdmin?: () => void }) => {
    const ref = useRef<HTMLElement>(null);
    const { t } = useTranslation();
    const clients = ["BBC", "RECORD TV", "STONE", "ALIEXPRESS", "KEETA", "VISA", "FACEBOOK", "O BOTICÁRIO"];
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 40, damping: 15, mass: 0.5 });
    const shouldReduceMotion = useReducedMotion();
    const getAnimationProps = (anim: typeof monolithAnimations[keyof typeof monolithAnimations]) =>
        shouldReduceMotion
            ? { animate: staticFromAnim(anim.animate), transition: { duration: 0 } }
            : anim;

    const planetX = useTransform(smoothProgress, [0, 1], ["-96%", "-92%"]);
    const textY = useTransform(smoothProgress, [0, 1], ["30px", "0px"]);

    return (
        <React.Fragment>
            {/* PART 1: Nascidos no Set & Evolution (Starchild) */}
            <section className="relative w-full bg-transparent flex flex-col items-center justify-center min-h-[104vh] md:min-h-[108vh] overflow-hidden py-12 md:py-16">
                <motion.div style={{ y: textY }} className="relative z-30 w-full flex flex-col items-center justify-start min-h-[92vh] md:min-h-[94vh] gap-10 md:gap-12">

                    {/* TITLE CARD: Top Margin */}
                    <div className="relative z-30 flex flex-col items-center text-center px-4 w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            className="flex flex-col items-center gap-10 md:gap-12"
                        >
                            <span className="font-mono text-[9px] md:text-[10px] text-white/40 tracking-[0.6em] md:tracking-[1em] uppercase">
                                {t('stages.one')} &bull; {t('stages.origin')}
                            </span>

                            <h2 className="font-brick text-[40px] md:text-[60px] lg:text-[80px] text-white tracking-[0.1em] leading-[1.1] uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                                {t('legacy.title_part1')} <br />
                                <span className="text-brick-red">{t('legacy.title_part2')}</span>
                            </h2>

                            <p className="text-base md:text-lg text-white font-light max-w-lg leading-relaxed text-center">
                                {t('legacy.text')}
                            </p>
                        </motion.div>
                    </div>

                    {/* THE HORIZON (Monolith emerging from the dawn) */}
                    <div className="relative w-full flex-1 flex items-center justify-center min-h-[280px] md:min-h-[360px] py-12 md:py-16">

                        {/* 1. The Monolith Top (Only the visible cap crosses the horizon) */}
                        <div
                            className="absolute left-1/2 z-[18] w-[92px] h-[87px] md:w-[136px] md:h-[122px] lg:w-[164px] lg:h-[142px] -translate-x-1/2 overflow-hidden pointer-events-none"
                            style={{ bottom: "50%" }}
                        >
                            <motion.div
                                initial={{ y: "78%" }}
                                whileInView={{ y: "0%" }}
                                viewport={{ once: true, amount: 0.01 }}
                                transition={{ duration: 4.2, ease: [0.16, 1, 0.3, 1] }}
                                className="absolute inset-0"
                                style={{ willChange: "transform" }}
                            >
                                <div className="relative w-full h-full rounded-t-[2px] bg-[#000000] border border-white/10 shadow-[inset_0_0_40px_rgba(0,0,0,0.9)] overflow-hidden">
                                    <motion.div
                                        {...getAnimationProps(monolithAnimations.leftGleam)}
                                        className="absolute inset-y-0 left-[-16%] w-[52%] bg-gradient-to-r from-transparent via-white/18 to-transparent blur-[10px] mix-blend-screen"
                                    />
                                    <motion.div
                                        {...getAnimationProps(monolithAnimations.rightGleam)}
                                        className="absolute inset-y-0 right-[-20%] w-[46%] bg-gradient-to-l from-transparent via-brick-red/18 to-transparent blur-[12px] mix-blend-screen"
                                    />
                                    <motion.div
                                        {...getAnimationProps(monolithAnimations.bottomGlow)}
                                        className="absolute bottom-[-8%] left-1/2 h-[40%] w-[132%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.34)_0%,rgba(255,255,255,0.12)_32%,rgba(255,255,255,0)_76%)] blur-[12px] mix-blend-screen"
                                    />
                                </div>
                            </motion.div>
                        </div>

                        {/* 2a. Birth cloud volume (behind monolith) */}
                        <div
                            className="absolute top-1/2 left-1/2 w-full flex items-center justify-center z-[17] pointer-events-none"
                            style={{ transform: "translate(-50%, -18%)" }}
                        >
                            {/* Main nebula — breathes + morphs */}
                            <motion.div
                                {...getAnimationProps(monolithAnimations.mainNebula)}
                                className="absolute h-[220px] md:h-[250px] rounded-full mix-blend-screen"
                                style={{
                                    willChange: "transform, opacity",
                                    width: "min(94vw, 1120px)",
                                    background: "radial-gradient(ellipse at center, rgba(255,120,120,0.16) 0%, rgba(var(--brick-red-rgb),0.56) 22%, rgba(var(--brick-red-rgb),0.38) 44%, rgba(120,10,10,0.18) 63%, rgba(0,0,0,0) 84%)",
                                    filter: "blur(74px) saturate(1.08)"
                                }}
                            />
                            {/* Inner glow band — vertical drift */}
                            <motion.div
                                {...getAnimationProps(monolithAnimations.innerGlow)}
                                className="absolute h-[84px] md:h-[110px] rounded-full"
                                style={{
                                    width: "min(82vw, 760px)",
                                    background: "radial-gradient(ellipse at center, rgba(255,170,170,0.12) 0%, rgba(var(--brick-red-rgb),0.34) 22%, rgba(var(--brick-red-rgb),0.16) 52%, rgba(0,0,0,0) 78%)",
                                    filter: "blur(26px)",
                                    opacity: 0.95
                                }}
                            />
                            {/* Left vapor — rises + rotates */}
                            <motion.div
                                {...getAnimationProps(monolithAnimations.leftVapor)}
                                className="absolute -translate-x-[30%] h-[96px] md:h-[118px] rounded-full"
                                style={{
                                    width: "min(30vw, 280px)",
                                    background: "radial-gradient(ellipse at center, rgba(255,140,140,0.18) 0%, rgba(var(--brick-red-rgb),0.26) 34%, rgba(0,0,0,0) 76%)",
                                    filter: "blur(28px)",
                                    opacity: 0.9
                                }}
                            />
                            {/* Right vapor — counter-drifts */}
                            <motion.div
                                {...getAnimationProps(monolithAnimations.rightVapor)}
                                className="absolute translate-x-[30%] h-[88px] md:h-[110px] rounded-full"
                                style={{
                                    width: "min(28vw, 260px)",
                                    background: "radial-gradient(ellipse at center, rgba(255,150,150,0.16) 0%, rgba(var(--brick-red-rgb),0.24) 34%, rgba(0,0,0,0) 76%)",
                                    filter: "blur(26px)",
                                    opacity: 0.82
                                }}
                            />
                            {/* Horizon streak — pulses + morphs */}
                            <motion.div
                                {...getAnimationProps(monolithAnimations.horizonStreak)}
                                className="absolute h-[42px] md:h-[52px] rounded-full mix-blend-screen"
                                style={{
                                    width: "min(48vw, 360px)",
                                    background: "linear-gradient(90deg, rgba(var(--brick-red-rgb),0) 0%, rgba(255,170,170,0.22) 20%, rgba(255,210,210,0.34) 50%, rgba(255,170,170,0.22) 78%, rgba(var(--brick-red-rgb),0) 100%)",
                                    filter: "blur(18px)"
                                }}
                            />
                            {/* Lower streak — drifts up */}
                            <motion.div
                                {...getAnimationProps(monolithAnimations.lowerStreak)}
                                className="absolute h-[30px] md:h-[38px] rounded-full mix-blend-screen"
                                style={{
                                    width: "min(40vw, 300px)",
                                    background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,220,220,0.16) 24%, rgba(255,255,255,0.26) 50%, rgba(255,220,220,0.16) 76%, rgba(255,255,255,0) 100%)",
                                    filter: "blur(16px)"
                                }}
                            />
                            {/* Left wisp — swirls upward */}
                            <motion.div
                                {...getAnimationProps(monolithAnimations.leftWispRed)}
                                className="absolute -translate-x-[18%] -translate-y-[10%] h-[58px] md:h-[72px] rounded-full mix-blend-screen"
                                style={{
                                    width: "min(16vw, 140px)",
                                    background: "radial-gradient(ellipse at center, rgba(255,180,180,0.18) 0%, rgba(var(--brick-red-rgb),0.2) 40%, rgba(0,0,0,0) 78%)",
                                    filter: "blur(18px)"
                                }}
                            />
                            {/* Right wisp — swirls opposite */}
                            <motion.div
                                {...getAnimationProps(monolithAnimations.rightWispRed)}
                                className="absolute translate-x-[16%] translate-y-[6%] h-[54px] md:h-[68px] rounded-full mix-blend-screen"
                                style={{
                                    width: "min(15vw, 128px)",
                                    background: "radial-gradient(ellipse at center, rgba(255,170,170,0.14) 0%, rgba(var(--brick-red-rgb),0.18) 42%, rgba(0,0,0,0) 78%)",
                                    filter: "blur(18px)"
                                }}
                            />
                        </div>

                        {/* 2b. Inner vapor light (in front of monolith) */}
                        <div
                            className="absolute top-1/2 left-1/2 w-full flex items-center justify-center z-20 pointer-events-none"
                            style={{ transform: "translate(-50%, -72%)" }}
                        >
                            {/* Broad white vapor — breathes + morphs vertically */}
                            <motion.div
                                {...getAnimationProps(monolithAnimations.broadVapor)}
                                className="absolute h-[104px] md:h-[130px] rounded-full mix-blend-normal"
                                style={{
                                    willChange: "opacity, transform",
                                    width: "min(90vw, 820px)",
                                    background: "radial-gradient(ellipse at center, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.24) 24%, rgba(255,244,244,0.12) 42%, rgba(255,255,255,0) 74%)",
                                    filter: "blur(34px)"
                                }}
                            />
                            {/* Core glow — rises gently */}
                            <motion.div
                                {...getAnimationProps(monolithAnimations.coreGlow)}
                                className="absolute h-[96px] md:h-[128px] rounded-full"
                                style={{
                                    width: "min(24vw, 220px)",
                                    background: "radial-gradient(ellipse at center, rgba(255,255,255,0.44) 0%, rgba(255,255,255,0.16) 36%, rgba(255,255,255,0) 74%)",
                                    filter: "blur(24px)",
                                    opacity: 0.78
                                }}
                            />
                            {/* Horizon light — pulses with vertical morph */}
                            <motion.div
                                {...getAnimationProps(monolithAnimations.horizonLight)}
                                className="absolute h-[42px] md:h-[56px] rounded-full"
                                style={{
                                    width: "min(74vw, 580px)",
                                    background: "radial-gradient(ellipse at center, rgba(255,255,255,0.74) 0%, rgba(255,255,255,0.22) 28%, rgba(255,255,255,0) 72%)",
                                    filter: "blur(16px)",
                                    opacity: 0.9
                                }}
                            />
                            {/* Sharp horizon line — breathes */}
                            <motion.div
                                {...getAnimationProps(monolithAnimations.sharpHorizon)}
                                className="absolute h-[24px] md:h-[30px] rounded-full mix-blend-normal"
                                style={{
                                    willChange: "opacity",
                                    width: "min(58vw, 430px)",
                                    background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 18%, rgba(255,255,255,0.92) 50%, rgba(255,255,255,0.55) 82%, rgba(255,255,255,0) 100%)",
                                    filter: "blur(12px)"
                                }}
                            />
                            {/* Left wisp — swirls upward */}
                            <motion.div
                                {...getAnimationProps(monolithAnimations.leftWispWhite)}
                                className="absolute -translate-x-[16%] h-[18px] md:h-[22px] rounded-full mix-blend-normal"
                                style={{
                                    willChange: "opacity",
                                    width: "min(22vw, 170px)",
                                    background: "radial-gradient(ellipse at center, rgba(255,255,255,0.68) 0%, rgba(255,255,255,0.18) 42%, rgba(255,255,255,0) 76%)",
                                    filter: "blur(10px)"
                                }}
                            />
                            {/* Right wisp — counter-swirls */}
                            <motion.div
                                {...getAnimationProps(monolithAnimations.rightWispWhite)}
                                className="absolute translate-x-[18%] h-[16px] md:h-[20px] rounded-full mix-blend-normal"
                                style={{
                                    willChange: "opacity",
                                    width: "min(20vw, 150px)",
                                    background: "radial-gradient(ellipse at center, rgba(255,255,255,0.54) 0%, rgba(255,255,255,0.16) 40%, rgba(255,255,255,0) 78%)",
                                    filter: "blur(10px)"
                                }}
                            />
                            {/* Thin inner streak — vertical pulse */}
                            <motion.div
                                {...getAnimationProps(monolithAnimations.thinStreak)}
                                className="absolute h-[12px] md:h-[16px] rounded-full mix-blend-normal"
                                style={{
                                    width: "min(34vw, 250px)",
                                    background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 24%, rgba(255,255,255,0.34) 50%, rgba(255,255,255,0.2) 76%, rgba(255,255,255,0) 100%)",
                                    filter: "blur(8px)"
                                }}
                            />
                            {/* Upper-left tendril — spirals upward */}
                            <motion.div
                                {...getAnimationProps(monolithAnimations.upperLeftTendril)}
                                className="absolute -translate-x-[10%] -translate-y-[12%] h-[24px] md:h-[30px] rounded-full mix-blend-normal"
                                style={{
                                    width: "min(12vw, 100px)",
                                    background: "radial-gradient(ellipse at center, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.12) 42%, rgba(255,255,255,0) 78%)",
                                    filter: "blur(10px)"
                                }}
                            />
                            {/* Lower-right tendril — spirals opposite */}
                            <motion.div
                                {...getAnimationProps(monolithAnimations.lowerRightTendril)}
                                className="absolute translate-x-[12%] translate-y-[10%] h-[20px] md:h-[26px] rounded-full mix-blend-normal"
                                style={{
                                    width: "min(10vw, 84px)",
                                    background: "radial-gradient(ellipse at center, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0.1) 42%, rgba(255,255,255,0) 78%)",
                                    filter: "blur(9px)"
                                }}
                            />
                        </div>
                    </div>

                    {/* MANUSCRIPT / CLIENTS: Bottom Margin */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
                        className="flex flex-col items-center text-center px-6 w-full max-w-4xl z-30 relative gap-10 md:gap-12"
                    >
                        <div className="flex items-center justify-center gap-3 w-full">
                            <span className="h-px w-12 md:w-24 bg-gradient-to-r from-transparent to-brick-red/40"></span>
                            <span className="font-sans font-bold text-[9px] md:text-[10px] text-brick-gray uppercase tracking-[0.2em] md:tracking-[0.3em]">Clientes Brick</span>
                            <span className="h-px w-12 md:w-24 bg-gradient-to-l from-transparent to-brick-red/40"></span>
                        </div>

                        {/* Clients as Silent Constellations */}
                        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 md:gap-x-16 md:gap-y-6 opacity-60 hover:opacity-100 transition-opacity duration-1000">
                            {clients.map((client, i) => (
                                <span key={i} className="font-mono text-[8px] md:text-[10px] text-brick-gray uppercase tracking-[0.3em] md:tracking-[0.4em] transition-all duration-700 hover:text-white hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] cursor-default">
                                    {client}
                                </span>
                            ))}
                        </div>
                    </motion.div>

                </motion.div>
                <div className="absolute inset-0 z-[40] opacity-[0.08] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" style={{ maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }}></div>
            </section>

            {/* PART 2: O MÉTODO / A CRENÇA - Estrelas de fundo */}
            <section ref={ref} className="relative w-full bg-transparent flex flex-col items-center py-16 md:py-20 overflow-hidden border-none text-white">
                {/* Subtle red ambiance replacing the heavy planet */}
                <div className="absolute top-1/2 left-0 w-[150vw] md:w-[100vw] h-[150vh] bg-[radial-gradient(ellipse_at_left_center,rgba(var(--brick-red-rgb),0.05)_0%,transparent_60%)] pointer-events-none z-10 -translate-y-1/2 -translate-x-1/2"></div>

                <div className="max-w-4xl mx-auto px-6 relative z-30 flex flex-col items-center text-center w-full">
                    <div className="mb-16 md:mb-20 reveal w-full flex flex-col items-center gap-10 md:gap-12">
                        <div className="w-full flex justify-center">
                            <div className="relative w-5 h-5">
                                <div className="absolute left-1/2 top-1/2 w-5 h-5 -translate-x-1/2 -translate-y-1/2 rounded-full animate-breathe blur-[2px]" style={{ background: 'radial-gradient(circle at center, rgba(var(--brick-red-rgb),0.55) 0%, rgba(var(--brick-red-rgb),0.18) 45%, rgba(var(--brick-red-rgb),0) 75%)' }}></div>
                                <div className="absolute left-1/2 top-1/2 w-[2px] h-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brick-red/60"></div>
                            </div>
                        </div>
                        <span className="font-mono text-[9px] md:text-[10px] text-white/40 tracking-[0.6em] md:tracking-[1em] uppercase">
                            {t('stages.two')} &bull; {t('philosophy.belief_label')}
                        </span>
                    </div>
                    <div className="flex flex-col gap-24 w-full">
                        <PhilosophyItem title={t('philosophy.raw.title')} text={t('philosophy.raw.text')} index={0} />
                        <PhilosophyItem title={t('philosophy.noise.title')} text={t('philosophy.noise.text')} index={1} />
                        <PhilosophyItem title={t('philosophy.direct.title')} text={t('philosophy.direct.text')} index={2} />
                    </div>
                </div>
            </section>

            {/* PART 3: FOOTER CTA (The Climax) */}
            <section className="relative w-full bg-transparent flex flex-col items-center pt-16 md:pt-20 pb-0 overflow-x-hidden">
                {/* Colossal Red Aura emanating from the CTA to set the mood */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] md:w-[100vw] h-[100vh] bg-[radial-gradient(ellipse_at_center,rgba(var(--brick-red-rgb),0.12)_0%,transparent_50%)] pointer-events-none z-0 blur-[100px]"></div>

                <div className="flex flex-col items-center text-center reveal relative z-30 w-full mb-32 md:mb-36 px-6 md:px-12 gap-10 md:gap-12">

                    <span className="font-mono text-[9px] md:text-[10px] text-white/40 tracking-[0.6em] md:tracking-[1em] uppercase">
                        {t('stages.three')} &bull; {t('stages.grand_finale')}
                    </span>

                    {/* Subtitle with Scramble Effect & Lasers */}
                    <div className="flex items-center gap-4 md:gap-6">
                        <div className="w-8 md:w-16 h-[1px] bg-gradient-to-r from-transparent to-brick-red"></div>
                        <h2 className="text-[10px] md:text-xs font-ai text-brick-red uppercase tracking-[0.3em] md:tracking-[0.5em] drop-shadow-[0_0_10px_rgba(var(--brick-red-rgb),0.8)]">
                            <ScrambleText text={t('footer.complex_problem')} hoverTrigger={true} triggerOnReveal={true} delay={500} />
                        </h2>
                        <div className="w-8 md:w-16 h-[1px] bg-gradient-to-l from-transparent to-brick-red"></div>
                    </div>

                    {/* Massive Climax Typography */}
                    <h1 className="climax-title text-5xl md:text-7xl lg:text-[110px] font-brick max-w-6xl cursor-default px-4">
                        {t('footer.we_have_intelligence')}
                    </h1>

                    {/* Highly polished, weighty contact button */}
                    <MagneticButton onClick={onChat} className="group relative overflow-hidden border border-white/10 hover:border-brick-red hover:bg-brick-red/5 hover:shadow-[0_0_40px_rgba(var(--brick-red-rgb),0.2)] transition-all duration-700 px-10 py-5 md:px-16 md:py-6 backdrop-blur-sm">
                        {/* Hover glass scanner beam */}
                        <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-45deg] group-hover:left-[200%] transition-all duration-1000 ease-in-out"></div>
                        <span className="relative z-10 text-xs md:text-sm font-ai font-bold text-white tracking-[0.2em] md:tracking-[0.3em] uppercase">
                            {t('footer.talk_to_us')} <span className="text-brick-red animate-blink group-hover:text-white">_</span>
                        </span>
                    </MagneticButton>
                </div>

                {/* FOOTER BOTTOM */}
                <div className="mt-auto w-full relative z-30">
                    {/* Digital fiber separator */}
                    <div className="w-full h-px mb-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brick-red/10 to-transparent" />
                        <div className="absolute top-0 h-full w-[15%] animate-fiber bg-[linear-gradient(90deg,transparent,rgba(var(--brick-red-rgb),0.25),transparent)]" />
                        <div className="absolute top-0 h-full w-[15%] animate-fiber-b bg-[linear-gradient(90deg,transparent,rgba(var(--brick-red-rgb),0.25),transparent)]" />
                    </div>
                    <div className="w-full px-6 md:px-12 lg:px-24 pb-6 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex gap-6">
                            {['LinkedIn', 'Instagram'].map((social) => (
                                <a key={social} href={`https://${social.toLowerCase()}.com/brickai`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-white/50 hover:text-brick-red tracking-widest uppercase transition-colors duration-500">{social}</a>
                            ))}
                        </div>
                        <div className="text-[9px] uppercase tracking-[0.2em] text-brick-gray/30 font-bold text-center md:text-right flex flex-col items-center md:items-end gap-1">
                            <span>&copy; 2026 Brick AI.</span>
                            <span className="hidden md:inline">{t('footer.generative_division')}</span>
                            <span>{t('footer.rights_reserved')}</span>
                        </div>
                    </div>
                </div>

                <div className="absolute inset-0 z-[40] opacity-[0.11] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150"></div>
            </section>
        </React.Fragment>
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
                                            <div className="absolute -inset-3 border border-brick-red/20 transition-all duration-1000 group-hover/mono:border-brick-red/50"></div>
                                            <div className="w-14 h-28 border border-brick-red flex items-center justify-center group-hover/mono:shadow-[0_0_20px_rgba(var(--brick-red-rgb),0.4)] transition-all duration-700 bg-transparent">
                                                <svg viewBox="0 0 20 22" className="w-4 h-[18px] ml-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <polygon points="2,1 18,11 2,21" stroke="var(--brick-red)" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
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
                            border border-white/20 bg-brick-black/80 backdrop-blur-sm hover:bg-white/10 hover:border-white/40
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
                        ? `bottom-0 left-0 right-0 h-[55%] border-t border-white/10 bg-brick-black/95 backdrop-blur-xl
                           md:bottom-0 md:left-auto md:right-0 md:top-0 md:h-full md:w-[380px] md:border-t-0 md:border-l md:bg-brick-black/80
                           ${panelHidden ? 'translate-y-full md:translate-y-0 md:translate-x-full' : 'translate-y-0 md:translate-x-0'}`
                        : `bottom-0 left-0 right-0 h-[55%] border-t border-white/10 bg-brick-black/95 backdrop-blur-xl
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
                                    className="font-brick text-white uppercase break-words overflow-wrap-anywhere"
                                    style={{
                                        fontSize: 'clamp(1.6rem, 3vw, 2.8rem)',
                                        lineHeight: '0.85',
                                        letterSpacing: '-0.03em',
                                    }}
                                >
                                    {project.titleFull || project.title}
                                </h2>
                                <div className="flex items-center gap-4 mt-4">
                                    <div className="h-px w-6 bg-white/20"></div>
                                    <span className="font-mono text-[9px] text-white/40 tracking-[0.3em] uppercase">{project.subtitle}</span>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-4 mb-8">
                            <div className="font-mono text-[8px] text-white/20 mb-4 tracking-[0.4em]">// SYSTEM_LOG</div>
                            <p className="text-white text-[12px] leading-[1.7] tracking-[0.04em] max-w-md font-mono border-l border-white/10 pl-5">
                                {project.longDesc || project.desc}
                            </p>
                        </div>

                        {/* FOOTER: CREDITS (Simplified) */}
                        {project.credits && project.credits.length > 0 && (
                            <div className="px-4 pb-4 md:px-10 md:pb-8 mt-auto">
                                <div className="space-y-4">
                                    <div className="font-mono text-[7px] text-white/20 mb-4 tracking-[0.4em] uppercase">COLABORADORES_PROJETO</div>
                                    {project.credits.map((credit, idx) => (
                                        <div key={idx} className="flex justify-between items-baseline border-b border-white/10 pb-2">
                                            <span className="font-mono text-[8px] text-white/30 uppercase tracking-[0.2em]">{credit.role}</span>
                                            <span className="font-mono text-[10px] text-white/80 tracking-wider uppercase">{credit.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    {/* FIXED FOOTER: GEN_DIVISION */}
                    <div className="flex-shrink-0 px-4 pb-4 md:px-10 md:pb-6 border-t border-white/10 pt-3">
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
            className={`group relative w-full aspect-square border border-white/10 bg-brick-black overflow-hidden cursor-pointer hover:border-brick-red transition-colors duration-300 reveal`}
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => onOpen(work)}
        >
            {/* UPDATED FILTERS FOR VISIBILITY */}
            <div
                className="absolute inset-0 opacity-100 sharp-image saturate-[0.9] group-hover:saturate-110 brightness-95 group-hover:brightness-105 transition-[filter] duration-700"
                style={{
                    backgroundImage: `url('${work.imageWorks || work.imageHome}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    transform: `scale(${settings.scale}) translate(${(settings.x - 50) * 2}%, ${(settings.y - 50) * 2}%)`
                }}
            ></div>

            {/* Tech Grid Overlay for consistency */}
            <div className="absolute inset-0 bg-tech-grid opacity-20 z-10 pointer-events-none group-hover:opacity-10 transition-opacity duration-700"></div>

            <div className="scanline-effect z-20"></div>
            {/* UPDATED GRADIENT OPACITY */}
            <div className="absolute inset-0 bg-gradient-to-t from-brick-black/90 via-transparent to-transparent opacity-100 group-hover:opacity-85 transition-opacity duration-1000 ease-out z-20"></div>

            <div className="absolute inset-0 p-4 flex flex-col justify-between z-30">
                <div className="flex justify-between items-start opacity-50 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="font-mono text-[9px] tracking-widest text-brick-red">{(index + 1).toString().padStart(3, '0')}</span>
                </div>
                <div className="transform translate-y-1 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <h3 className="text-sm font-brick text-white leading-tight mb-1.5 tracking-tight group-hover:text-brick-red transition-colors line-clamp-2">{work.title}</h3>
                    <p className="text-[9px] text-white font-mono tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 line-clamp-1">{work.desc}</p>
                </div>
            </div>
            <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-white/30 group-hover:border-brick-red transition-colors z-40"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-white/30 group-hover:border-brick-red transition-colors z-40"></div>
        </div>
    );
};

const WorksFilter = ({ categories, activeCategory, onSelect }: { categories: string[], activeCategory: string, onSelect: (c: string) => void }) => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-wrap gap-4 mb-12 border-b border-white/10 pb-6 reveal">
            <span className="text-[10px] font-ai text-brick-gray uppercase py-2 mr-4 hidden md:block">{t('works_page.protocols')} //</span>
            {categories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => onSelect(cat)}
                    className={`text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 px-3 py-1 border ${activeCategory === 'ALL' && cat === 'ALL' ? 'bg-brick-red border-brick-red text-white' : activeCategory === cat ? 'bg-brick-red border-brick-red text-white' : 'bg-transparent border-transparent text-brick-gray hover:text-white hover:border-white/20'}`}
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
            <button onClick={onHome} className="fixed top-24 left-6 md:left-12 font-mono text-brick-gray hover:text-white text-xs md:text-sm tracking-widest uppercase transition-colors z-40 flex items-center gap-2 group mix-blend-difference">
                <span className="text-brick-red group-hover:-translate-x-1 transition-transform">&lt;</span> {t('common.return_surface')}
            </button>
            <main className="pt-32 md:pt-40 min-h-screen flex flex-col">
                <section className="w-full px-6 md:px-12 lg:px-24 mb-16 reveal">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-brick text-white mb-4">{t('works_page.archive_index').split('_').slice(0, -1).join('_')}_<span className="text-brick-red">{t('works_page.archive_index').split('_').slice(-1)[0]}</span></h1>
                            <p className="font-mono text-[10px] md:text-xs tracking-widest max-w-xl animate-system-input"><span className="text-brick-red">&gt;&gt; </span> <span className="text-brick-gray">{t('works_page.accessing')} <span className="text-white">{works.length}</span> {t('works_page.entries_found')}</span></p>
                        </div>
                    </div>
                </section>
                <section className="w-full px-6 md:px-12 lg:px-24 pb-16">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-px">
                        {filteredWorks.map((work, idx) => (
                            <WorksGridItem key={work.id} work={work} index={idx} onOpen={onSelectProject} />
                        ))}
                    </div>
                    {filteredWorks.length === 0 && (
                        <div className="w-full h-64 flex items-center justify-center border border-white/10 border-dashed text-brick-gray font-mono text-sm tracking-widest reveal">{t('works_page.no_data')}</div>
                    )}
                </section>
            </main>
            <Footer onChat={onChat} />
        </React.Fragment>
    );
}

const BlogPostPage = ({ post, onBack, onChat, onWorks, onTransmissions, onHome, onAbout }: any) => {
    const { t, i18n } = useTranslation();
    const postTitle = getLocalizedField(post.title, i18n.language, 'UNTITLED');
    const postExcerpt = getLocalizedField(post.excerpt, i18n.language, '');
    return (
        <React.Fragment>
            <Header onChat={onChat} onWorks={onWorks} onTransmissions={onTransmissions} onHome={onHome} onAbout={onAbout} isChatView={false} />
            <button onClick={onBack} className="fixed top-24 left-6 md:left-12 font-mono text-brick-gray hover:text-white text-xs md:text-sm tracking-widest uppercase transition-colors z-40 flex items-center gap-2 group mix-blend-difference">
                <span className="text-brick-red group-hover:-translate-x-1 transition-transform">&lt;</span> {t('common.return_index')}
            </button>
            <main className="pt-32 md:pt-40 min-h-screen flex flex-col bg-brick-black pb-32 md:pb-40 px-4 md:px-8" onClick={onBack}>
                <article className="w-full max-w-5xl mx-auto mt-12 md:mt-16 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                    <div className="relative border border-white/10 bg-brick-surface backdrop-blur-sm overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brick-red to-transparent opacity-80"></div>

                        <header className="px-7 md:px-14 pt-12 md:pt-16 pb-12 border-b border-white/10">
                            <div className="max-w-3xl mx-auto">
                                <div className="flex flex-wrap justify-start gap-3 md:gap-4 items-center mb-7 text-[10px] font-mono uppercase tracking-widest md:-ml-8">
                                    <span className="text-brick-red">LOG_ID: {post.id}</span>
                                    <span className="text-brick-gray">DATE: {post.date}</span>
                                    {post.tags.map((tag: string) => (
                                        <span key={tag} className="border border-white/15 bg-white/[0.02] px-2 py-1 text-white/40">{tag}</span>
                                    ))}
                                </div>

                                <h1 className="text-3xl md:text-5xl lg:text-6xl font-brick text-white leading-[0.95] tracking-tight mb-8 text-center">
                                    {postTitle.toUpperCase() === 'A MÁQUINA NÃO TEM ALMA. NÓS TEMOS.' ? (
                                        <>
                                            A MÁQUINA NÃO TEM ALMA.{' '}
                                            <span className="text-brick-red drop-shadow-[0_0_15px_rgba(var(--brick-red-rgb),0.45)]">NÓS TEMOS.</span>
                                        </>
                                    ) : postTitle}
                                </h1>

                                <p className="text-base md:text-xl text-[#b8bcc4] font-light leading-relaxed text-center">
                                    {postExcerpt}
                                </p>
                            </div>
                        </header>

                        <div className="px-7 md:px-14 py-12 md:py-16">
                            <div className="max-w-3xl mx-auto">
                                <div className="prose prose-invert prose-lg max-w-none prose-p:text-[#d2d5db] prose-p:leading-relaxed md:prose-p:leading-loose prose-p:mb-6 md:prose-p:mb-8 prose-headings:font-brick prose-headings:text-white prose-headings:mt-10 prose-headings:mb-4 prose-strong:text-white prose-blockquote:border-brick-red prose-blockquote:text-white/85 prose-blockquote:my-8 prose-a:text-brick-red hover:prose-a:text-white">
                                    {typeof post.content === 'string'
                                        ? (post.content as string).split('\n\n').filter(Boolean).map((paragraph, idx) => (
                                            <p key={idx} className="mb-8 text-base md:text-lg font-light text-[#d2d5db] leading-relaxed md:leading-loose">
                                                {paragraph}
                                            </p>
                                        ))
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
            <button onClick={onHome} className="fixed top-24 left-6 md:left-12 font-mono text-brick-gray hover:text-white text-xs md:text-sm tracking-widest uppercase transition-colors z-40 flex items-center gap-2 group mix-blend-difference">
                <span className="text-brick-red group-hover:-translate-x-1 transition-transform">&lt;</span> {t('common.return_surface')}
            </button>
            <main className="pt-32 md:pt-40 min-h-screen flex flex-col bg-brick-black">
                <section className="w-full px-6 md:px-12 lg:px-24 mb-16 reveal">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-brick text-white mb-4">{t('transmissions_page.title').split('_').slice(0, -1).join('_')}_<span className="text-brick-red">{t('transmissions_page.title').split('_').slice(-1)[0]}</span></h1>
                            <p className="font-mono text-[10px] md:text-xs tracking-widest animate-system-input"><span className="text-brick-red">&gt;&gt; </span> <span className="text-brick-gray">{t('transmissions_page.incoming')} <span className="text-white">{transmissions.length}</span> {t('transmissions_page.records')}</span></p>
                        </div>
                    </div>
                </section>
                <section className="w-full px-6 md:px-12 lg:px-24 flex-1 pb-32 md:pb-40 reveal">
                    <div className="space-y-2 md:space-y-3 bg-transparent border-t border-white/10">
                        {transmissions.map((post) => (
                            <div key={post.id} onClick={() => onSelectPost(post)} className="block group bg-brick-black hover:bg-brick-dark transition-colors p-8 md:p-10 border border-white/10 cursor-pointer">
                                <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 mb-4">
                                    <h3 className="text-xl md:text-2xl font-brick text-white tracking-tight group-hover:text-brick-red transition-colors">
                                        {getLocalizedField(post.title, i18n.language, 'UNTITLED')}
                                    </h3>
                                    <span className="font-mono text-[10px] text-brick-red tracking-widest whitespace-nowrap">{post.date}</span>
                                </div>
                                <p className="text-brick-gray text-sm md:text-base font-light max-w-3xl mb-6 leading-relaxed">
                                    {getLocalizedField(post.excerpt, i18n.language, '')}
                                </p>
                                <div className="flex gap-3">
                                    {post.tags.map(tag => (
                                        <span key={tag} className="text-[9px] font-mono border border-white/10 px-3 py-1.5 text-brick-gray/60 uppercase tracking-wider">{tag}</span>
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
        <footer className="w-full py-12 px-6 md:px-12 lg:px-24 bg-brick-black border-t border-white/10 relative z-10 overflow-hidden">
            <ParticleBackground reactToMouse={false} />
            <div className="absolute inset-0 bg-gradient-to-t from-brick-black via-transparent to-transparent pointer-events-none z-[1]"></div>

            <div className="flex flex-col items-center text-center gap-8 reveal relative z-10">
                <h2 className="text-xs md:text-sm font-ai text-brick-gray uppercase tracking-[0.2em]">{t('footer.complex_problem')}</h2>
                <p className="text-3xl md:text-5xl lg:text-6xl font-brick text-brick-red leading-none max-w-5xl drop-shadow-[0_0_15px_rgba(var(--brick-red-rgb),0.5)]">{t('footer.we_have_intelligence')}</p>
                <MagneticButton onClick={onChat} className="mt-6 text-base md:text-lg font-ai font-bold text-white hover:text-brick-red group">
                    {t('footer.talk_to_us')} <span className="text-brick-red animate-blink group-hover:text-white">_</span>
                </MagneticButton>
            </div>
            <div className="mt-8 border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-start gap-4 reveal">
                <div className="flex gap-6">
                    {['LinkedIn', 'Instagram'].map((social) => (
                        <a key={social} href={`https://${social.toLowerCase()}.com/brickai`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-white hover:text-brick-red tracking-widest uppercase transition-colors">{social}</a>
                    ))}
                </div>
                <div className="text-[9px] uppercase tracking-[0.2em] text-brick-gray/40 font-bold text-right">
                    <span className="block mb-2">&copy; 2026 Brick AI.</span>
                    <span className="hidden md:inline">{t('footer.generative_division')}</span>
                    <span className="block mt-1">{t('footer.rights_reserved')}</span>
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
        <div className="min-h-screen pt-32 md:pt-40 pb-32 md:pb-40 flex flex-col items-center justify-start font-mono relative bg-brick-black overflow-x-hidden">

            {/* RETURN BUTTON */}
            <button onClick={onBack} className="fixed top-24 left-6 md:left-12 text-brick-gray hover:text-white text-xs md:text-sm tracking-widest uppercase transition-colors z-40 flex items-center gap-2 group mix-blend-difference">
                <span className="text-brick-red group-hover:-translate-x-1 transition-transform">&lt;</span> {t('common.return_surface')}
            </button>

            <main className="w-full px-6 md:px-12 lg:px-24 relative z-10 flex flex-col gap-24">

                {/* 1. CONTACT SECTION (Humans) */}
                <section className="w-full animate-fade-in-up">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-brick text-white mb-4">REACH_<span className="text-brick-red">HUMANS</span></h1>
                            <p className="font-mono text-[10px] md:text-xs tracking-widest uppercase animate-system-input"><span className="text-brick-red">&gt;&gt; </span> <span className="text-brick-gray">{t('chat.manual_override')}</span></p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                        {/* EMAIL */}
                        <a href="mailto:brick@brick.mov" className="group block bg-brick-dark border border-white/10 p-8 md:p-10 hover:border-brick-red transition-colors duration-300">
                            <div className="mb-4 text-brick-red opacity-50 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] uppercase tracking-widest border border-brick-red px-2 py-1">Channel_01</span>
                            </div>
                            <h3 className="text-2xl font-brick text-white mb-1 group-hover:text-brick-red transition-colors">{t('chat.email_streams')}</h3>
                            <p className="text-brick-gray text-xs font-mono tracking-widest">BRICK@BRICK.MOV</p>
                        </a>

                        {/* WHATSAPP */}
                        <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="group block bg-brick-dark border border-white/10 p-8 md:p-10 hover:border-brick-red transition-colors duration-300">
                            <div className="mb-4 text-brick-red opacity-50 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] uppercase tracking-widest border border-brick-red px-2 py-1">Channel_02</span>
                            </div>
                            <h3 className="text-2xl font-brick text-white mb-1 group-hover:text-brick-red transition-colors">{t('chat.direct_message')}</h3>
                            <p className="text-brick-gray text-xs font-mono tracking-widest">WHATSAPP</p>
                        </a>

                        {/* SOCIAL */}
                        <div className="group block bg-brick-dark border border-white/10 p-8 md:p-10 hover:border-brick-red transition-colors duration-300">
                            <div className="mb-4 text-brick-red opacity-50 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] uppercase tracking-widest border border-brick-red px-2 py-1">Channel_03</span>
                            </div>
                            <h3 className="text-2xl font-brick text-white mb-4 group-hover:text-brick-red transition-colors">{t('chat.network_nodes')}</h3>
                            <div className="flex flex-wrap gap-4">
                                {['LinkedIn', 'Instagram'].map(social => (
                                    <a key={social} href={`https://${social.toLowerCase()}.com/brickai`} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-brick-gray hover:text-white uppercase tracking-wider underline decoration-white/20 hover:decoration-white">{social}</a>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. MASON INTELLIGENCE - SYMMETRICAL LAYOUT */}
                <section className="w-full flex flex-col md:flex-row gap-0 items-start animate-fade-in-up border-t border-white/10 pt-12" style={{ animationDelay: '0.2s' }}>

                    {/* LEFT: THE AVATAR (Static Monolith) */}
                    <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-12 border-r border-white/10 relative bg-brick-black">
                        <div className="relative w-[120px] h-[240px] md:w-[150px] md:h-[300px]">
                            {/* The Monolith Shape - Identical to Hero but no mouse interaction */}
                            <div
                                className={`monolith-structure w-full h-full rounded-[2px] relative z-10 shadow-2xl transition-all duration-300 ${isProcessing ? 'shadow-[0_0_60px_rgba(var(--brick-red-rgb),0.3)]' : ''}`}
                            >
                                <div className="absolute inset-0 monolith-texture opacity-80 mix-blend-overlay pointer-events-none rounded-[2px] overflow-hidden"></div>

                                {/* Static Atmospherics */}
                                <div className="centered-layer aura-atmos pointer-events-none opacity-40" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle at center, rgba(153,27,27,0.1) 0%, transparent 60%)', filter: 'blur(30px)' }}></div>
                                <div className="centered-layer light-atmos animate-breathe pointer-events-none opacity-70 mix-blend-screen" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle at center, rgba(var(--brick-red-rgb),0.6) 0%, rgba(153,0,0,0.1) 30%, transparent 50%)', filter: 'blur(20px)' }}></div>

                                {/* Core Glow / Eye - Pulses on Thinking/Talking */}
                                <div className={`centered-layer core-atmos pointer-events-none shadow-[0_0_40px_rgba(var(--brick-red-rgb),1)] transition-all duration-200 ${isProcessing ? 'animate-talking scale-150 opacity-100' : 'animate-thinking opacity-80'}`}></div>

                                {/* Glass Reflection */}
                                <div className="absolute inset-0 border border-white/10 opacity-30 pointer-events-none z-10 rounded-[2px]"></div>
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-20"></div>
                            </div>
                        </div>

                        <div className="mt-12 text-center">
                            <h2 className="text-4xl font-brick text-white mb-2">{t('chat.mason_intro') ? t('chat.mason_intro').toUpperCase() : "I AM MASON"}</h2>
                            <p className="text-[10px] text-brick-gray font-mono tracking-widest max-w-[200px] mx-auto uppercase">
                                {t('chat.generative_core')}<br />{t('chat.state')} {isProcessing ? t('chat.active') : t('chat.idle')}
                            </p>
                        </div>
                    </div>

                    {/* RIGHT: THE TERMINAL (Chat Interface) */}
                    <div className="w-full md:w-1/2 pl-0 md:pl-12">
                        <div className="w-full bg-brick-dark border border-white/10 flex flex-col h-[70vh] min-h-[500px] md:h-[600px] relative overflow-hidden shadow-2xl">
                            {/* Terminal Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-brick-red animate-pulse' : 'bg-brick-red'}`}></div>
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
                                            <span className="text-[8px] font-mono text-brick-gray uppercase tracking-[0.2em]">
                                                {msg.role === 'user' ? 'YOU' : 'MASON'}
                                            </span>
                                        </div>
                                        <div className={`max-w-[90%] p-5 text-sm font-mono leading-relaxed tracking-wide ${msg.role === 'user'
                                            ? 'bg-white/5 text-white/90 border-r-2 border-white/20'
                                            : 'text-brick-red bg-brick-red/5 border-l-2 border-brick-red/40'
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {isProcessing && (
                                    <div className="flex flex-col items-start animate-pulse">
                                        <span className="text-[8px] font-mono text-brick-red uppercase tracking-[0.2em] mb-2">MASON</span>
                                        <div className="p-5 bg-brick-red/5 border-l-2 border-brick-red/40">
                                            <span className="inline-block w-1.5 h-4 bg-brick-red animate-blink"></span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="p-6 bg-brick-black border-t border-white/10">
                                {!isProcessing && messages.length < 4 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {SUGGESTIONS.map((query, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSend(query)}
                                                className="text-[8px] font-mono uppercase tracking-widest text-brick-gray border border-white/10 bg-white/[0.02] px-3 py-1.5 hover:bg-brick-red hover:text-white hover:border-brick-red transition-all"
                                            >
                                                {query}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <form onSubmit={handleSend} className="flex items-center gap-4">
                                    <div className="w-2 h-2 bg-brick-red animate-pulse shrink-0"></div>
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
            <UnifiedEnding onChat={onChat} onAdmin={onAdmin} />
        </main>
    </React.Fragment>
);


const InfoCard = ({ number, title, desc }: { number: string, title: string, desc: string }) => (
    <div className="group relative bg-brick-black p-8 md:p-10 hover:bg-brick-dark transition-colors duration-300 overflow-hidden border border-white/10 hover:border-brick-red border-l-4 border-l-transparent hover:border-l-brick-red flex flex-col">
        <div className="absolute top-0 right-0 p-4 opacity-30 group-hover:opacity-100 transition-opacity">
            <span className="font-mono text-[9px] text-brick-red border border-brick-red px-1 tracking-widest">SEC_{number}</span>
        </div>
        <div className="relative z-10">
            <h3 className="text-xl md:text-2xl font-brick text-white mb-4 group-hover:text-brick-red transition-colors duration-300 uppercase leading-none">{title}</h3>
            <p className="text-xs md:text-sm font-mono text-brick-gray leading-relaxed opacity-80">{desc}</p>
        </div>
        {/* Tech Decor */}
        <div className="scanline-effect opacity-10 group-hover:opacity-20 transition-opacity"></div>
    </div>
);

const StatBlock = ({ label, value, sub }: { label: string, value: string, sub: string }) => (
    <div className="flex flex-col border-l border-white/10 pl-6 py-2 group hover:border-brick-red transition-colors">
        <span className="font-mono text-[9px] text-brick-gray uppercase tracking-widest mb-1">{label}</span>
        <span className="font-brick text-3xl md:text-4xl text-white mb-1 group-hover:text-brick-red transition-colors">{value}</span>
        <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest">{sub}</span>
    </div>
);

const LogItem = ({ year, title, desc, highlight = false }: { year: string, title: string, desc: string, highlight?: boolean }) => (
    <div className={`relative pl-8 md:pl-12 group ${highlight ? 'opacity-100' : 'opacity-60 hover:opacity-100'} transition-opacity duration-300`}>
        {/* Dot */}
        <div className={`absolute left-[-4px] top-1.5 w-2 h-2 rounded-full border-2 border-brick-black z-10 ${highlight ? 'bg-brick-red' : 'bg-[#333] group-hover:bg-white'} transition-colors`}></div>

        <div className="flex flex-col md:flex-row md:items-baseline gap-2 mb-1">
            <span className={`font-mono text-sm font-bold ${highlight ? 'text-brick-red' : 'text-white'}`}>{year}</span>
            <span className="hidden md:inline text-white/20">//</span>
            <h4 className="font-brick text-lg text-white uppercase tracking-wide">{title}</h4>
        </div>
        <p className="text-xs md:text-sm text-brick-gray font-light leading-relaxed max-w-lg">{desc}</p>
    </div>
);

const TeamMember = ({ name, role, id }: { name: string, role: string, id: string }) => (
    <div className="group relative bg-brick-black border border-white/10 p-8 md:p-10 hover:border-white/20 transition-all duration-300">
        <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-white/5 rounded-sm flex items-center justify-center group-hover:bg-brick-red transition-colors duration-300">
                <span className="font-brick text-brick-red text-xl group-hover:text-black">{name.charAt(0)}</span>
            </div>
            <div className="flex flex-col items-end">
                <span className="font-mono text-[9px] text-brick-red uppercase tracking-widest mb-1">ID_{id}</span>
                <div className="flex gap-0.5">
                    {[...Array(3)].map((_, i) => <div key={i} className="w-1 h-1 bg-white/20 rounded-full"></div>)}
                </div>
            </div>
        </div>
        <div>
            <h4 className="text-lg font-brick text-white group-hover:text-brick-white transition-colors">{name}</h4>
            <span className="block text-[10px] font-mono text-brick-gray uppercase tracking-widest mt-1 border-t border-white/10 pt-2 inline-block w-full">{role}</span>
        </div>
    </div>
);

const AboutPage = ({ onChat, onWorks, onTransmissions, onHome, onAbout }: any) => {
    const { t } = useTranslation();
    return (
        <React.Fragment>
            <Header onChat={onChat} onWorks={onWorks} onTransmissions={onTransmissions} onHome={onHome} onAbout={onAbout} isChatView={false} />
            <button onClick={onHome} className="fixed top-24 left-6 md:left-12 font-mono text-brick-gray hover:text-white text-xs md:text-sm tracking-widest uppercase transition-colors z-40 flex items-center gap-2 group mix-blend-difference">
                <span className="text-brick-red group-hover:-translate-x-1 transition-transform">&lt;</span> {t('common.return_surface')}
            </button>

            <main className="pt-32 md:pt-40 min-h-screen flex flex-col bg-brick-black relative overflow-hidden">
                {/* ATMOSPHERE */}
                <div className="absolute top-0 right-0 w-[60vw] h-[60vh] bg-brick-red/5 rounded-full blur-[150px] pointer-events-none z-0 mix-blend-screen opacity-30"></div>
                <div className="scanline-effect fixed inset-0 z-0 pointer-events-none opacity-20"></div>

                {/* HERO: ORIGIN STORY */}
                <section className="w-full px-6 md:px-12 lg:px-24 mb-12 reveal">
                    {/* Compact header — same pattern as Works/Transmissions */}
                    <div className="mb-10">
                        <h1 className="text-3xl md:text-5xl font-brick text-white mb-4">
                            {t('about.origin').split('_').slice(0, -1).join('_')}
                            <span className="text-brick-red">_{t('about.origin').split('_').slice(-1)[0]}</span>
                        </h1>
                        <p className="font-mono text-[10px] md:text-xs tracking-widest animate-system-input">
                            <span className="text-brick-red">&gt;&gt; </span>
                            <span className="text-brick-gray">{t('about.est')}</span>
                        </p>
                    </div>

                    {/* CENTERED: MONOLITH + TITLE + DESC */}
                    <div className="flex flex-col items-center text-center gap-10 pb-8">
                        {/* MONOLITH */}
                        <div className="relative">
                            <div className="monolith-structure w-[120px] h-[240px] md:w-[150px] md:h-[300px] rounded-[2px] flex items-center justify-center overflow-visible shadow-2xl relative">
                                <div className="absolute inset-0 mix-blend-overlay monolith-texture bg-neutral-900 pointer-events-none rounded-[2px] overflow-hidden"></div>
                                <div className="centered-layer aura-atmos pointer-events-none opacity-60" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle at center, rgba(153,27,27,0.1) 0%, transparent 60%)', filter: 'blur(30px)' }}></div>
                                <div className="centered-layer light-atmos animate-breathe pointer-events-none opacity-70 mix-blend-screen" style={{ width: '500px', height: '500px', background: 'radial-gradient(circle at center, rgba(var(--brick-red-rgb),0.6) 0%, rgba(153,0,0,0.1) 30%, transparent 50%)', filter: 'blur(20px)' }}></div>
                                <div className="centered-layer core-atmos animate-breathe pointer-events-none" style={{ width: '40px', height: '40px', filter: 'blur(10px)', background: 'radial-gradient(circle, rgba(var(--brick-red-rgb),1) 0%, rgba(var(--brick-red-rgb),0.4) 40%, transparent 80%)' }}></div>
                                <div className="absolute inset-0 border border-white/10 opacity-50 pointer-events-none z-10 rounded-[2px]"></div>
                            </div>
                        </div>

                        {/* TITLE */}
                        <div className="flex flex-col items-center gap-3">
                            <p className="font-brick text-5xl md:text-6xl lg:text-7xl text-white leading-tight tracking-tight uppercase">
                                {t('about.title_primary')} {t('about.title_highlight')}<br />
                                <span className="text-brick-red">{t('about.title_secondary')}</span>
                            </p>
                        </div>

                        {/* DESCRIPTION — InfoCard XL */}
                        <div className="group relative max-w-[692px] w-full bg-brick-black p-8 md:p-10 hover:bg-brick-dark transition-colors duration-300 overflow-hidden border border-white/10 hover:border-brick-red border-l-4 border-l-transparent hover:border-l-brick-red flex flex-col text-left">
                            {/* SEC badge */}
                            <div className="absolute top-0 right-0 p-4 opacity-30 group-hover:opacity-100 transition-opacity">
                                <span className="font-mono text-[9px] text-brick-red border border-brick-red px-1 tracking-widest">SEC_00</span>
                            </div>
                            <div className="mb-6 relative z-10">
                                <h3 className="font-brick text-2xl md:text-3xl text-white mb-4 group-hover:text-brick-red transition-colors duration-300 uppercase leading-none">
                                    {t('about.description').split('\n\n')[0]}
                                </h3>
                                <p className="text-xs md:text-sm font-mono text-brick-gray leading-relaxed opacity-80">
                                    {t('about.description').split('\n\n')[1]}
                                </p>
                            </div>
                            <div className="scanline-effect opacity-10 group-hover:opacity-20 transition-opacity"></div>
                        </div>
                    </div>
                </section>

                    {/* THE INFRASTRUCTURE (DIFFERENTIATORS) */}
                    <section className="w-full px-6 md:px-12 lg:px-24 mb-32 reveal">
                        <div>
                        <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
                            <Eye className="w-4 h-4 text-brick-red" />
                            <h2 className="text-xs md:text-sm font-mono text-brick-gray uppercase tracking-[0.2em]">{t('about.manifesto.title')} // {t('about.manifesto.subtitle')}</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
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
                        </div>
                    </section>

                    {/* LEADERSHIP (REAL ROLES) */}
                    <section className="w-full px-6 md:px-12 lg:px-24 pb-32 md:pb-40 reveal">
                        <div>
                        <div className="flex items-center gap-3 mb-12 border-b border-white/10 pb-4">
                            <Fingerprint className="w-4 h-4 text-brick-red" />
                            <h2 className="text-xs md:text-sm font-mono text-brick-gray uppercase tracking-[0.2em]">{t('about.team.title')}</h2>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            <TeamMember name="FRAN CAMPARONI" role={t('about.team.roles.fran')} id="001" />
                            <TeamMember name="GABRIEL PANAZIO" role={t('about.team.roles.gabriel')} id="002" />
                            <TeamMember name="LUFE BERTO" role={t('about.team.roles.lufe')} id="003" />
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
        <div className="min-h-screen flex items-center justify-center bg-brick-black">
            <div className="text-brick-red font-mono text-sm animate-pulse">LOADING SYSTEM...</div>
        </div>
    );

    // Login Screen
    if (!isLoggedIn) return (
        <div className="min-h-screen flex items-center justify-center bg-brick-black p-6">
            <div className="w-full max-w-md border border-white/10 p-8 bg-brick-dark">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-3 h-3 bg-brick-red"></div>
                    <h1 className="text-xl font-brick text-white">SYSTEM_ACCESS</h1>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-mono text-brick-gray mb-2 uppercase tracking-widest">Identifier</label>
                        <input
                            type="text"
                            value={identifier}
                            onChange={e => setIdentifier(e.target.value)}
                            className="w-full bg-transparent border border-white/20 p-3 text-white font-mono text-sm focus:outline-none focus:border-brick-red"
                            placeholder="Email or username"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-mono text-brick-gray mb-2 uppercase tracking-widest">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-transparent border border-white/20 p-3 text-white font-mono text-sm focus:outline-none focus:border-brick-red"
                            placeholder="••••••••"
                        />
                    </div>
                    {loginError && <p className="text-brick-red text-xs font-mono">{loginError}</p>}
                    <button type="submit" className="w-full bg-brick-red text-white py-3 font-mono text-sm uppercase tracking-widest hover:bg-brick-red/80 transition-colors">
                        AUTHENTICATE
                    </button>
                </form>
                <button onClick={onHome} className="mt-6 text-brick-gray text-xs font-mono hover:text-white transition-colors">
                    &lt; RETURN TO SURFACE
                </button>
            </div>
        </div>
    );

    // Admin Dashboard
    return (
        <div className="min-h-screen bg-brick-black p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-3 h-3 bg-brick-red animate-pulse"></div>
                        <h1 className="text-2xl font-brick text-white">ADMIN_CONSOLE</h1>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={onHome} className="text-brick-gray text-xs font-mono hover:text-white transition-colors">
                            &lt; HOME
                        </button>
                        <button onClick={handleLogout} className="text-brick-red text-xs font-mono hover:text-red-400 transition-colors">
                            LOGOUT
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab('works')}
                        className={`px-6 py-3 text-xs font-mono uppercase tracking-widest border transition-colors ${activeTab === 'works' ? 'bg-brick-red border-brick-red text-white' : 'border-white/20 text-brick-gray hover:text-white'}`}
                    >
                        WORKS ({works.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('transmissions')}
                        className={`px-6 py-3 text-xs font-mono uppercase tracking-widest border transition-colors ${activeTab === 'transmissions' ? 'bg-brick-red border-brick-red text-white' : 'border-white/20 text-brick-gray hover:text-white'}`}
                    >
                        TRANSMISSIONS ({transmissions.length})
                    </button>
                </div>

                {/* Content */}
                <div className="border border-white/10 p-6">
                    {activeTab === 'works' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-sm font-mono text-brick-gray uppercase tracking-widest">Project Database</h2>
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
                                        <p className="text-brick-gray text-xs font-mono">{work.category} // {work.subtitle}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingItem(work)} className="text-xs font-mono text-brick-gray hover:text-white px-3 py-1 border border-white/10">EDIT</button>
                                        <button onClick={() => deleteWork(work.id)} className="text-xs font-mono text-brick-red hover:text-red-400 px-3 py-1 border border-brick-red/50">DELETE</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'transmissions' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-sm font-mono text-brick-gray uppercase tracking-widest">Neural Logs</h2>
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
                                        <p className="text-brick-gray text-xs font-mono">{post.date} // {post.tags.join(', ')}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingItem(post)} className="text-xs font-mono text-brick-gray hover:text-white px-3 py-1 border border-white/10">EDIT</button>
                                        <button onClick={() => deleteTransmission(post.id)} className="text-xs font-mono text-brick-red hover:text-red-400 px-3 py-1 border border-brick-red/50">DELETE</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Edit Modal - Full Image Editor */}
                {editingItem && (
                    <div className="fixed inset-0 bg-black/95 z-50 flex items-start justify-center p-6 overflow-y-auto">
                        <div className="w-full max-w-5xl bg-brick-dark border border-white/10 my-8">
                            {/* Header */}
                            <div className="flex justify-between items-center p-6 border-b border-white/10">
                                <h2 className="text-lg font-brick text-white">{activeTab === 'works' ? 'EDIT_PROJECT' : 'EDIT_TRANSMISSION'}</h2>
                                <button onClick={() => setEditingItem(null)} className="text-brick-gray hover:text-white text-2xl">&times;</button>
                            </div>

                            <div className="flex flex-col lg:flex-row">
                                {/* Left Side - Form Fields */}
                                <div className="lg:w-1/2 p-6 space-y-4 border-r border-white/10">

                                    {activeTab === 'works' ? (
                                        <>
                                            <h3 className="text-xs font-mono text-brick-red mb-4 uppercase tracking-widest">Project Info</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-mono text-brick-gray mb-2 uppercase tracking-widest">ID</label>
                                                    <input type="text" value={editingItem.id || ''} onChange={e => setEditingItem({ ...editingItem, id: e.target.value })} className="w-full bg-transparent border border-white/20 p-2 text-white font-mono text-xs focus:outline-none focus:border-brick-red" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-mono text-brick-gray mb-2 uppercase tracking-widest">Category</label>
                                                    <select value={editingItem.category || ''} onChange={e => setEditingItem({ ...editingItem, category: e.target.value })} className="w-full bg-brick-dark border border-white/20 p-2 text-white font-mono text-xs focus:outline-none focus:border-brick-red">
                                                        <option value="GENERATIVE">GENERATIVE</option>
                                                        <option value="VFX">VFX</option>
                                                        <option value="STYLE TRANSFER">STYLE TRANSFER</option>
                                                        <option value="DATA ART">DATA ART</option>
                                                        <option value="EXPERIENCE">EXPERIENCE</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-mono text-brick-gray mb-2 uppercase tracking-widest">Title</label>
                                                <input type="text" value={editingItem.title || ''} onChange={e => setEditingItem({ ...editingItem, title: e.target.value })} className="w-full bg-transparent border border-white/20 p-3 text-white font-mono text-sm focus:outline-none focus:border-brick-red" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-mono text-brick-gray mb-2 uppercase tracking-widest">Subtitle</label>
                                                <input type="text" value={editingItem.subtitle || ''} onChange={e => setEditingItem({ ...editingItem, subtitle: e.target.value })} className="w-full bg-transparent border border-white/20 p-2 text-white font-mono text-xs focus:outline-none focus:border-brick-red" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-mono text-brick-gray mb-2 uppercase tracking-widest">Description</label>
                                                <textarea value={editingItem.desc || ''} onChange={e => setEditingItem({ ...editingItem, desc: e.target.value })} rows={2} className="w-full bg-transparent border border-white/20 p-2 text-white font-mono text-xs focus:outline-none focus:border-brick-red resize-none" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-mono text-brick-gray mb-2 uppercase tracking-widest">Long Description</label>
                                                <textarea value={editingItem.longDesc || ''} onChange={e => setEditingItem({ ...editingItem, longDesc: e.target.value })} rows={3} className="w-full bg-transparent border border-white/20 p-2 text-white font-mono text-xs focus:outline-none focus:border-brick-red resize-none" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-mono text-brick-gray mb-2 uppercase tracking-widest">Orientation</label>
                                                    <select value={editingItem.orientation || 'horizontal'} onChange={e => setEditingItem({ ...editingItem, orientation: e.target.value })} className="w-full bg-brick-dark border border-white/20 p-2 text-white font-mono text-xs focus:outline-none focus:border-brick-red">
                                                        <option value="horizontal">Horizontal</option>
                                                        <option value="vertical">Vertical</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-mono text-brick-gray mb-2 uppercase tracking-widest">Video URL</label>
                                                    <input type="text" value={editingItem.videoUrl || ''} onChange={e => setEditingItem({ ...editingItem, videoUrl: e.target.value })} placeholder="Vimeo or MP4 URL" className="w-full bg-transparent border border-white/20 p-2 text-white font-mono text-xs focus:outline-none focus:border-brick-red" />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <h3 className="text-xs font-mono text-brick-red mb-4 uppercase tracking-widest">Transmission Info</h3>
                                            <div>
                                                <label className="block text-[10px] font-mono text-brick-gray mb-2 uppercase tracking-widest">Title</label>
                                                <input type="text" value={editingItem.title || ''} onChange={e => setEditingItem({ ...editingItem, title: e.target.value })} className="w-full bg-transparent border border-white/20 p-3 text-white font-mono text-sm focus:outline-none focus:border-brick-red" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-mono text-brick-gray mb-2 uppercase tracking-widest">Excerpt</label>
                                                <textarea value={editingItem.excerpt || ''} onChange={e => setEditingItem({ ...editingItem, excerpt: e.target.value })} rows={2} className="w-full bg-transparent border border-white/20 p-2 text-white font-mono text-xs focus:outline-none focus:border-brick-red resize-none" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-mono text-brick-gray mb-2 uppercase tracking-widest">Content</label>
                                                <textarea value={typeof editingItem.content === 'string' ? editingItem.content : ''} onChange={e => setEditingItem({ ...editingItem, content: e.target.value })} rows={8} className="w-full bg-transparent border border-white/20 p-2 text-white font-mono text-xs focus:outline-none focus:border-brick-red resize-none" placeholder="Full article content..." />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-mono text-brick-gray mb-2 uppercase tracking-widest">Date</label>
                                                    <input type="text" value={editingItem.date || ''} onChange={e => setEditingItem({ ...editingItem, date: e.target.value })} placeholder="2025.01.01" className="w-full bg-transparent border border-white/20 p-2 text-white font-mono text-xs focus:outline-none focus:border-brick-red" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-mono text-brick-gray mb-2 uppercase tracking-widest">Tags (comma sep.)</label>
                                                    <input type="text" value={Array.isArray(editingItem.tags) ? editingItem.tags.join(', ') : ''} onChange={e => setEditingItem({ ...editingItem, tags: e.target.value.split(',').map((t: string) => t.trim()).filter(Boolean) })} placeholder="TAG1, TAG2" className="w-full bg-transparent border border-white/20 p-2 text-white font-mono text-xs focus:outline-none focus:border-brick-red" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-mono text-brick-gray mb-2 uppercase tracking-widest">URL (slug)</label>
                                                <input type="text" value={editingItem.url || ''} onChange={e => setEditingItem({ ...editingItem, url: e.target.value })} placeholder="article-slug" className="w-full bg-transparent border border-white/20 p-2 text-white font-mono text-xs focus:outline-none focus:border-brick-red" />
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Right Side - Image Editor (works only) */}
                                <div className={`${activeTab === 'works' ? 'lg:w-1/2' : 'hidden'} p-6 space-y-6`}>
                                    <h3 className="text-xs font-mono text-brick-red mb-4 uppercase tracking-widest">Image Settings</h3>

                                    {/* Image Upload */}
                                    <div>
                                        <label className="block text-[10px] font-mono text-brick-gray mb-2 uppercase tracking-widest">Image URL / Upload</label>
                                        <div className="flex gap-2">
                                            <input type="text" value={editingItem.imageHome || ''} onChange={e => setEditingItem({ ...editingItem, imageHome: e.target.value, imageWorks: e.target.value })} placeholder="Image URL" className="flex-1 bg-transparent border border-white/20 p-2 text-white font-mono text-xs focus:outline-none focus:border-brick-red" />
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
                                        <label className="block text-[10px] font-mono text-brick-gray mb-2 uppercase tracking-widest">X Position</label>
                                        <input type="range" min="0" max="100" step="0.1" value={editingItem.imageSettingsHome?.x ?? 50} onChange={e => {
                                            const newSettings = { ...(editingItem.imageSettingsHome || { x: 50, y: 50, scale: 1.2 }), x: Number(e.target.value) };
                                            setEditingItem({ ...editingItem, imageSettingsHome: newSettings });
                                        }} className="w-full accent-brick-red" />
                                        <span className="text-[10px] font-mono text-white">{(editingItem.imageSettingsHome?.x || 50).toFixed(1)}%</span>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-mono text-brick-gray mb-2 uppercase tracking-widest">Y Position</label>
                                        <input type="range" min="0" max="100" step="0.1" value={editingItem.imageSettingsHome?.y ?? 50} onChange={e => {
                                            const newSettings = { ...(editingItem.imageSettingsHome || { x: 50, y: 50, scale: 1.2 }), y: Number(e.target.value) };
                                            setEditingItem({ ...editingItem, imageSettingsHome: newSettings });
                                        }} className="w-full accent-brick-red" />
                                        <span className="text-[10px] font-mono text-white">{(editingItem.imageSettingsHome?.y || 50).toFixed(1)}%</span>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-mono text-brick-gray mb-2 uppercase tracking-widest">Zoom/Scale</label>
                                        <input type="range" min="100" max="200" step="0.1" value={(editingItem.imageSettingsHome?.scale || 1.2) * 100} onChange={e => {
                                            const newSettings = { ...(editingItem.imageSettingsHome || { x: 50, y: 50, scale: 1.2 }), scale: Number(e.target.value) / 100 };
                                            setEditingItem({ ...editingItem, imageSettingsHome: newSettings });
                                        }} className="w-full accent-brick-red" />
                                        <span className="text-[10px] font-mono text-white">{((editingItem.imageSettingsHome?.scale || 1.2) * 100).toFixed(1)}%</span>
                                    </div>

                                    {/* Live Preview - Home Card */}
                                    <div>
                                        <label className="block text-[10px] font-mono text-brick-red mb-3 uppercase tracking-widest">HOME PAGE - CARD PREVIEW</label>
                                        <div className="relative w-64 h-[400px] border border-white/20 overflow-hidden bg-brick-black mx-auto">
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
                                                    <div className="absolute inset-0 opacity-90" style={{ background: 'linear-gradient(to top, var(--brick-black) 0%, rgba(5,5,5,0.9) 15%, rgba(5,5,5,0.6) 40%, transparent 70%)' }} />
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
                                                <div className="flex items-center justify-center h-full text-brick-gray font-mono text-xs">
                                                    No image selected
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Separator */}
                                    <div className="border-t border-white/10 pt-4 mt-2">
                                        <label className="block text-[10px] font-mono text-brick-red mb-3 uppercase tracking-widest">WORKS PAGE <span className="text-brick-gray">(1080×1080px)</span></label>
                                    </div>

                                    {/* Works Position Controls */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-mono text-brick-gray mb-2 uppercase tracking-widest">X Position</label>
                                            <input type="range" min="0" max="100" step="0.1" value={editingItem.imageSettingsWorks?.x ?? 50} onChange={e => {
                                                const newSettings = { ...(editingItem.imageSettingsWorks || { x: 50, y: 50, scale: 1.2 }), x: Number(e.target.value) };
                                                setEditingItem({ ...editingItem, imageSettingsWorks: newSettings });
                                            }} className="w-full accent-brick-red" />
                                            <span className="text-[10px] font-mono text-white">{(editingItem.imageSettingsWorks?.x || 50).toFixed(1)}%</span>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-mono text-brick-gray mb-2 uppercase tracking-widest">Y Position</label>
                                            <input type="range" min="0" max="100" step="0.1" value={editingItem.imageSettingsWorks?.y ?? 50} onChange={e => {
                                                const newSettings = { ...(editingItem.imageSettingsWorks || { x: 50, y: 50, scale: 1.2 }), y: Number(e.target.value) };
                                                setEditingItem({ ...editingItem, imageSettingsWorks: newSettings });
                                            }} className="w-full accent-brick-red" />
                                            <span className="text-[10px] font-mono text-white">{(editingItem.imageSettingsWorks?.y || 50).toFixed(1)}%</span>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-mono text-brick-gray mb-2 uppercase tracking-widest">Zoom/Scale</label>
                                            <input type="range" min="100" max="200" step="0.1" value={(editingItem.imageSettingsWorks?.scale || 1.2) * 100} onChange={e => {
                                                const newSettings = { ...(editingItem.imageSettingsWorks || { x: 50, y: 50, scale: 1.2 }), scale: Number(e.target.value) / 100 };
                                                setEditingItem({ ...editingItem, imageSettingsWorks: newSettings });
                                            }} className="w-full accent-brick-red" />
                                            <span className="text-[10px] font-mono text-white">{((editingItem.imageSettingsWorks?.scale || 1.2) * 100).toFixed(1)}%</span>
                                        </div>
                                    </div>

                                    {/* Live Preview - Works Grid */}
                                    <div>
                                        <div className="relative w-40 h-40 border border-white/20 overflow-hidden bg-brick-black">
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
                                                    <div className="absolute inset-0 bg-gradient-to-t from-brick-black/90 via-transparent to-transparent" />

                                                    {/* Top Controls / Index / Category */}
                                                    <div className="absolute inset-0 p-3 flex flex-col justify-between z-30">
                                                        <div className="flex justify-between items-start opacity-50">
                                                            <span className="font-mono text-[8px] tracking-widest text-brick-red">001</span>
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
                                                <div className="flex items-center justify-center h-full text-brick-gray font-mono text-xs">
                                                    No image
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex gap-4 p-6 border-t border-white/10">
                                <button onClick={saveItem} className="flex-1 bg-brick-red text-white py-3 font-mono text-sm uppercase tracking-widest hover:bg-brick-red/80 transition-colors">
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

const NotFoundPage = ({ onHome, goChat }: { onHome: () => void, goChat: () => void }) => {
    const { t, i18n } = useTranslation();
    const isEn = i18n.language === 'en';
    
    // Auto scramble effect for glitch text
    const [scrambledTitle, setScrambledTitle] = useState("VÍDEO NÃO ENCONTRADO");
    
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.95) {
                const target = isEn ? "PATH NOT FOUND" : "ROTA NÃO ENCONTRADA";
                const chars = target.split("");
                const idx = Math.floor(Math.random() * chars.length);
                chars[idx] = ["!", "@", "#", "$", "%", "0", "1"][Math.floor(Math.random() * 7)];
                setScrambledTitle(chars.join(""));
                setTimeout(() => setScrambledTitle(target), 150);
            }
        }, 200);
        return () => clearInterval(interval);
    }, [isEn]);

    useEffect(() => {
        setScrambledTitle(isEn ? "PATH NOT FOUND" : "ROTA NÃO ENCONTRADA");
    }, [isEn]);

    return (
        <React.Fragment>
            <Header onChat={goChat} onWorks={() => {}} onTransmissions={() => {}} onHome={onHome} onAbout={() => {}} isChatView={false} />
            
            <button onClick={onHome} className="fixed top-24 left-6 md:left-12 font-mono text-brick-gray hover:text-white text-xs md:text-sm tracking-widest uppercase transition-colors z-40 flex items-center gap-2 group mix-blend-difference">
                <span className="text-brick-red group-hover:-translate-x-1 transition-transform">&lt;</span> {t('common.return_surface')}
            </button>
            
            <main className="min-h-screen pt-32 md:pt-40 flex flex-col items-center justify-start font-mono relative bg-brick-black overflow-x-hidden">
                <div className="w-full px-6 md:px-12 lg:px-24 mb-6 reveal active mt-12 md:mt-20">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-brick text-white mb-4">ERROR_<span className="text-brick-red">404</span></h1>
                            <p className="font-mono text-[10px] md:text-xs tracking-widest animate-system-input">
                                <span className="text-brick-red">&gt;&gt; </span> 
                                <span className="text-brick-gray">{scrambledTitle}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="w-full px-6 md:px-12 lg:px-24 relative z-10 flex flex-col pb-32">
                    <section className="w-full flex flex-col md:flex-row gap-0 items-start animate-fade-in-up border-t border-white/10 pt-12" style={{ animationDelay: '0.2s' }}>
                        
                        {/* LEFT: THE AVATAR (Static Monolith) - Identical to SystemChat */}
                        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-12 border-r border-white/10 relative bg-brick-black">
                            <div className="relative w-[120px] h-[240px] md:w-[150px] md:h-[300px]">
                                <div className="monolith-structure w-full h-full rounded-[2px] relative z-10 shadow-2xl transition-all duration-300">
                                    <div className="absolute inset-0 monolith-texture opacity-80 mix-blend-overlay pointer-events-none rounded-[2px] overflow-hidden"></div>
                                    <div className="centered-layer aura-atmos pointer-events-none opacity-40" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle at center, rgba(153,27,27,0.1) 0%, transparent 60%)', filter: 'blur(30px)' }}></div>
                                    <div className="centered-layer light-atmos animate-breathe pointer-events-none opacity-70 mix-blend-screen" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle at center, rgba(var(--brick-red-rgb),0.6) 0%, rgba(153,0,0,0.1) 30%, transparent 50%)', filter: 'blur(20px)' }}></div>
                                    <div className="centered-layer core-atmos pointer-events-none shadow-[0_0_40px_rgba(var(--brick-red-rgb),1)] transition-all duration-200 animate-thinking opacity-80"></div>
                                    <div className="absolute inset-0 border border-white/10 opacity-30 pointer-events-none z-10 rounded-[2px]"></div>
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-20"></div>
                                </div>
                            </div>
                            <div className="mt-12 text-center">
                                <h2 className="text-4xl font-brick text-white mb-2">{t('chat.mason_intro') ? t('chat.mason_intro').toUpperCase() : "I AM MASON"}</h2>
                                <p className="text-[10px] text-brick-gray font-mono tracking-widest max-w-[200px] mx-auto uppercase">
                                    {t('chat.generative_core')}<br />{t('chat.state')} 404_ERROR
                                </p>
                            </div>
                        </div>

                        {/* RIGHT: THE TERMINAL (Chat Dialog Box) */}
                        <div className="w-full md:w-1/2 pl-0 md:pl-12 mt-12 md:mt-0">
                            <div className="w-full bg-brick-dark border border-white/10 flex flex-col h-[70vh] min-h-[500px] md:h-[600px] relative overflow-hidden shadow-2xl">
                                {/* Terminal Header */}
                                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-brick-red animate-pulse"></div>
                                        <span className="text-[9px] font-mono text-white/50 tracking-[0.2em] uppercase font-bold">
                                            /USR/BIN/MASON_CHAT // v3.2
                                        </span>
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 p-4 md:p-8 space-y-6 flex flex-col justify-start overflow-y-auto">
                                    <div className="flex flex-col items-start animate-fade-in-up">
                                        <div className="flex items-center gap-2 mb-2 opacity-50">
                                            <span className="text-[8px] font-mono text-brick-gray uppercase tracking-[0.2em]">
                                                MASON
                                            </span>
                                        </div>
                                        <div className="max-w-[90%] p-5 text-sm font-mono leading-relaxed tracking-wide text-brick-red bg-brick-red/5 border-l-2 border-brick-red/40">
                                            {isEn ? (
                                                <>ERROR 404: I couldn't find this path in my latent space. It seems you wandered out of the film set.<br/><br/>You might want to restore connection with me to recover your coordinates.</>
                                            ) : (
                                                <>ERRO 404: Não encontrei essa rota nos meus domínios latentes. Parece que você vagou para fora do set de filmagem.<br/><br/>Recomendo que inicie uma transmissão comigo para recuperar as coordenadas corretas.</>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="p-4 md:p-6 border-t border-white/10 bg-white/[0.02]">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <button 
                                            onClick={onHome} 
                                            className="flex-1 py-4 bg-transparent border border-white/20 text-white font-mono text-xs tracking-widest uppercase hover:bg-white/10 transition-colors"
                                        >
                                            {isEn ? "RETURN TO BASE" : "RETORNAR À BASE"}
                                        </button>
                                        <button 
                                            onClick={goChat}
                                            className="flex-1 py-4 bg-brick-red text-white font-mono text-xs tracking-widest uppercase hover:bg-brick-red/80 transition-colors"
                                        >
                                            {isEn ? "TALK TO MASON" : "FALAR COM MASON"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </section>
                </div>
            </main>
        </React.Fragment>
    );
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
        <div className="min-h-screen bg-brick-black text-brick-white selection:bg-brick-red selection:text-white font-sans">
            <SEO view={view} selectedPost={selectedPost} />
            <GlobalStyles />
            <div className="noise-overlay"></div>
            <CustomCursor active={monolithHover || selectedProject !== null} />
            {selectedProject && (
                <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} onPrev={() => navigateProject(-1)} onNext={() => navigateProject(1)} />
            )}
            {view === 'home' && (
                <>
                    <GlobalParticleBackground />
                    <HomePage onChat={goChat} onWorks={goWorks} onTransmissions={goTransmissions} onHome={goHome} onSelectProject={setSelectedProject} setMonolithHover={setMonolithHover} monolithHover={monolithHover} onAdmin={goAdmin} onAbout={goAbout} /></>
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
            {view === '404' && (
                <NotFoundPage onHome={goHome} goChat={goChat} />
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
    const getInitialView = () => {
        try {
            const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
            const validViews = ['home', 'works', 'transmissions', 'chat', 'about', 'admin'];
            
            // Allow URL driven SPA navigation
            if (path !== '') {
                if (validViews.includes(path)) return path;
                if (path.startsWith('transmissions/')) return 'post';
                return '404'; // Path is invalid!
            }
            
            return sessionStorage.getItem('brick_view') || 'home';
        } catch {
            return 'home';
        }
    };

    const [view, setView] = useState(getInitialView);
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

// Core Web Vitals → GA4
import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals';

function sendToGA4({ name, value, id }: { name: string; value: number; id: string }) {
    if (typeof window.gtag === 'function') {
        window.gtag('event', name, {
            value: Math.round(name === 'CLS' ? value * 1000 : value),
            event_label: id,
            non_interaction: true,
        });
    }
}

onCLS(sendToGA4);
onINP(sendToGA4);
onLCP(sendToGA4);
onFCP(sendToGA4);
onTTFB(sendToGA4);
