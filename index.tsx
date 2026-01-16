import React, { useState, useEffect, useRef, useMemo, useContext } from 'react';
import { createRoot } from 'react-dom/client';

// --- STYLES & CONFIG ---
const GlobalStyles = () => (
    <style>{`
        /* COLORS & UTILS */
        :root {
            --brick-black: #050505;
            --brick-dark: #0a0a0a;
            --brick-red: #DC2626;
            --brick-gray: #9CA3AF;
            --brick-white: #E5E5E5;
        }
        body {
            background-color: var(--brick-black);
            color: var(--brick-white);
            overflow-x: hidden;
            cursor: default;
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
        
        .animate-blink { animation: terminal-blink 1s step-end infinite; }
        .animate-breathe { animation: atmos-breathe 6s ease-in-out infinite; }
        .animate-grain { animation: grain 8s steps(10) infinite; }
        .animate-thinking { animation: thinking-pulse 1.5s ease-in-out infinite; }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
        
        .noise-overlay {
            position: fixed;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            pointer-events: none;
            z-index: 30; 
            opacity: 0.035; 
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
            animation: grain 6s steps(10) infinite;
        }

        .monolith-structure {
            background: linear-gradient(to bottom, #0a0a0a, #000000);
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

        .scanline-effect {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.5) 50%);
            background-size: 100% 4px;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s;
        }
        .group:hover .scanline-effect {
            opacity: 1;
        }
    `}</style>
);

// --- CONFIG ---
// Safe API Key access to prevent crash if process is undefined
// @ts-ignore
const getApiKey = () => {
    // @ts-ignore
    return import.meta.env.VITE_GEMINI_API_KEY || "";
};
const apiKey = getApiKey();
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

// --- DATA ---
const INITIAL_TRANSMISSIONS: Post[] = [
    {
        id: "log_001",
        date: "2025.02.14",
        title: "THE LATENT SPACE IS A LOCATION",
        excerpt: "Why we stopped scouting physical ruins and started training LoRAs on brutalist blueprints.",
        tags: ["THEORY", "NEURAL_RENDERING"],
        url: "/transmissions/latent-space",
        content: (
            <React.Fragment>
                <p className="mb-8 text-base md:text-lg font-light leading-relaxed text-[#E5E5E5] first-letter:text-4xl first-letter:font-black first-letter:text-[#DC2626] first-letter:mr-3 first-letter:float-left">
                    We tend to think of generative models as engines of creation. Input prompt, output image. A linear manufacturing process. But this metaphor is insufficient for high-end production. At Brick, we treat the model not as a factory, but as a territory.
                </p>
                <h3 className="text-lg md:text-xl font-black text-white mt-10 mb-4 uppercase tracking-tight flex items-center gap-3">
                    <span className="text-[#DC2626] text-xs align-middle">01 //</span> The Topography of Noise
                </h3>
                <p className="mb-6 text-[#9CA3AF] leading-relaxed">
                    Stable Diffusion XL does not "draw". It denoises. It subtracts chaos to reveal order. This implies that the image already exists within the high-dimensional noise, mathematically waiting to be uncovered.
                </p>
                <div className="border-l-2 border-[#DC2626] pl-6 py-4 my-10 bg-white/5">
                    <p className="text-base font-mono italic text-white/90">
                        "We do not build the set. We navigate to the coordinates where the set is statistically most likely to exist."
                    </p>
                </div>
            </React.Fragment>
        )
    },
    {
        id: "log_002",
        date: "2025.01.28",
        title: "MOTION VECTORS IN STYLE TRANSFER",
        excerpt: "Solving the flickering problem in diffusion models. How we use optical flow to enforce temporal consistency.",
        tags: ["R&D", "WORKFLOW"],
        url: "/transmissions/motion-vectors",
        content: (
            <React.Fragment>
                <p className="mb-6 text-[#9CA3AF] leading-relaxed">
                    The jitter. The flicker. The "boiling" texture. This is the hallmark of raw AI video. It reveals the frame-by-frame independence of the diffusion process. For <span className="text-white font-bold">Project: Anima</span>, this artifact was unacceptable.
                </p>
                <p className="mb-6 text-[#9CA3AF] leading-relaxed">
                    Our solution involved extracting optical flow maps from the source footage using Nuke. These motion vectors act as a temporal skeleton.
                </p>
            </React.Fragment>
        )
    },
    {
        id: "log_003",
        date: "2025.01.10",
        title: "INTENTIONAL GLITCH: THE HUMAN SIGNATURE",
        excerpt: "When perfection is the error. Injecting noise back into the clean output of commercial models to reclaim the 'cinema' feel.",
        tags: ["PHILOSOPHY", "VFX"],
        url: "/transmissions/intentional-glitch",
        content: (
            <React.Fragment>
                <p className="mb-6 text-[#9CA3AF] leading-relaxed">
                    Modern models are converging towards a "mid-journey mean". A polished, plastic aesthetic that screams "synthetic". Paradoxically, to make AI imagery feel real, we must break it.
                </p>
                <p className="text-white font-bold tracking-widest uppercase border-t border-white/10 pt-6">
                    The artifact is the art.
                </p>
            </React.Fragment>
        )
    }
];

// --- SEO COMPONENT: STRUCTURED DATA (JSON-LD) ---
const StructuredData = ({ posts }: { posts: Post[] }) => {
    const safePosts = posts || [];
    const schemaData = [
        {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Brick AI",
            "url": "https://brickai.com",
            "logo": "https://brickai.com/logo.png",
            "slogan": "From Set to Server.",
            "description": "A generative production house where human artistry directs neural rendering pipelines."
        },
        ...safePosts.map(post => ({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "description": post.excerpt,
            "author": { "@type": "Organization", "name": "Brick AI" },
            "datePublished": post.date.replace(/\./g, '-'),
            "url": `https://brickai.com/transmissions/${post.id}`
        }))
    ];

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
    );
};

const INITIAL_WORKS: Work[] = [
    {
        id: "inheritance",
        orientation: "horizontal",
        subtitle: "FULL GENERATIVE",
        category: "GENERATIVE",
        title: "INHERITANCE",
        desc: "When the location doesn't exist. 100% Neural Rendering.",
        longDesc: "Inheritance is a testament to directed hallucination. Our artists trained custom LoRAs on brutalist architectural blueprints to guide the Stable Diffusion XL model. We curated 4,000 frames where organic decay meets concrete, ensuring temporal consistency through ControlNet depth maps while maintaining the director's original vision of isolation.",
        credits: [
            { role: "Director", name: "Sarah V." },
            { role: "AI Lead", name: "Mason Core" },
            { role: "Sound", name: "Echo Lab" },
            { role: "Tech", name: "Stable Diffusion XL + ComfyUI" }
        ],
        gradient: "from-neutral-900 to-neutral-800",
        imageHome: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564",
        imageWorks: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564",
        hasDetail: true
    },
    {
        id: "shift",
        orientation: "horizontal",
        subtitle: "HYBRID EXTENSION",
        category: "VFX",
        title: "WE CAN SELL ANYTHING",
        desc: "Expanding the set beyond physical limits. Seamless VFX.",
        longDesc: "For 'We Can Sell Anything', the challenge was to marry physical sets with infinite digital horizons. We utilized a proprietary in-painting pipeline that tracks live-action camera data (Alexa Mini) and feeds it into a generative fill model. The result is a mathematically perfect extension of the set, lighting, and grain, directed precisely by the cinematographer's lens choices.",
        credits: [
            { role: "Director", name: "Marcus L." },
            { role: "VFX Sup", name: "Brick Core" },
            { role: "Agency", name: "Future Brand" },
            { role: "Tech", name: "Nuke + Generative Fill" }
        ],
        gradient: "from-neutral-900 via-[#DC2626]/10 to-neutral-900",
        imageHome: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop",
        imageWorks: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop",
        hasDetail: true
    },
    {
        id: "anima",
        orientation: "vertical",
        subtitle: "STYLE TRANSFER",
        category: "STYLE TRANSFER",
        title: "AUTOBOL",
        desc: "Turning live action into branded art using custom models.",
        longDesc: "We reinterpreted standard broadcast footage through a custom-trained style transfer model using Ebsynth and ControlNet. The goal was not random abstraction, but a specific 'kinetic sculpture' aesthetic defined by the art director. The AI acted as the brush, preserving the players' identity and 60fps fluidity while completely transforming the texture of reality.",
        credits: [
            { role: "Creative", name: "Ana S." },
            { role: "AI Artist", name: "Mason Core" },
            { role: "Client", name: "Sports Global" },
            { role: "Tech", name: "Ebsynth + SD Video" }
        ],
        gradient: "from-neutral-900 to-neutral-950",
        imageHome: "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=2668&auto=format&fit=crop",
        imageWorks: "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=2668&auto=format&fit=crop",
        hasDetail: true
    },
    {
        id: "void",
        orientation: "vertical",
        subtitle: "DATA VISUALIZATION",
        category: "DATA ART",
        title: "VOID GAZING",
        desc: "Translating cosmic radiation into visible spectrums.",
        longDesc: "A data-driven installation that visualizes real-time cosmic radiation data via the NASA Open API. We wrote Python scripts to parse numerical noise into fluid dynamics parameters within TouchDesigner. The AI then textures this simulation in real-time, effectively allowing the audience to 'see' the invisible universe through a human-curated aesthetic lens.",
        credits: [
            { role: "Concept", name: "Brick Lab" },
            { role: "Code", name: "Mason Core" },
            { role: "Data", name: "NASA Open API" },
            { role: "Tech", name: "TouchDesigner + Python" }
        ],
        gradient: "from-neutral-950 to-[#DC2626]/20",
        imageHome: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2694&auto=format&fit=crop",
        imageWorks: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2694&auto=format&fit=crop",
        hasDetail: true
    },
    {
        id: "urban",
        orientation: "horizontal",
        subtitle: "PROCEDURAL ENV",
        category: "GENERATIVE",
        title: "URBAN REEF",
        desc: "Growing cities like coral. Biological algorithms applied.",
        longDesc: "Urban Reef explores bio-mimicry in architecture. Using differential growth algorithms in Houdini, we 'grew' city structures that seek light like coral. These procedural meshes were then texturized using AI upscaling, creating a vision of a city that feels grown rather than built, challenging traditional architectural design processes.",
        credits: [
            { role: "Architect", name: "J. Doe" },
            { role: "Sim", name: "Brick Core" },
            { role: "Render", name: "Redshift" },
            { role: "Tech", name: "Houdini + AI Texture" }
        ],
        gradient: "from-neutral-900 to-neutral-800",
        imageHome: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=2670&auto=format&fit=crop",
        imageWorks: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=2670&auto=format&fit=crop",
        hasDetail: true
    },
    {
        id: "silent",
        orientation: "horizontal",
        subtitle: "AUDIO REACTIVE",
        category: "EXPERIENCE",
        title: "SILENT ECHO",
        desc: "A visual narrative driven entirely by sub-bass frequencies.",
        longDesc: "In Silent Echo, the music drives the machine. We built a system in Unreal Engine 5 where visual elements are triggered directly by audio analysis. Sub-bass frequencies dictate geometry displacement, while high-hats trigger generative lighting events. It is a synesthetic experience where the artist's sound directly sculpts the digital world.",
        credits: [
            { role: "Band", name: "Low Freq" },
            { role: "Visuals", name: "Brick AI" },
            { role: "Engine", name: "Unreal 5" },
            { role: "Tech", name: "Real-time Audio Analysis" }
        ],
        gradient: "from-neutral-900 via-white/5 to-neutral-900",
        imageHome: "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?q=80&w=2755&auto=format&fit=crop",
        imageWorks: "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?q=80&w=2755&auto=format&fit=crop",
        hasDetail: true
    }
];

const CLIENTS = ["BBC", "RECORD TV", "STONE", "ALIEXPRESS", "KEETA", "VISA", "FACEBOOK", "O BOTICÁRIO", "L'ORÉAL"];

// --- CONTEXT & DATA MANAGEMENT ---
const DataContext = React.createContext<{
    works: Work[];
    setWorks: React.Dispatch<React.SetStateAction<Work[]>>;
    transmissions: Post[];
    setTransmissions: React.Dispatch<React.SetStateAction<Post[]>>;
} | null>(null);

const DataProvider = ({ children }: { children: React.ReactNode }) => {
    const [works, setWorks] = useState<Work[]>([]);
    const [transmissions, setTransmissions] = useState<Post[]>([]);

    useEffect(() => {
        // Load data from DB on mount
        const fetchData = async () => {
            try {
                const wRes = await fetch('/api/works');
                const wData = await wRes.json();
                if (Array.isArray(wData) && wData.length > 0) setWorks(wData);
                else setWorks(INITIAL_WORKS); // Fallback to hardcoded if DB empty

                const tRes = await fetch('/api/transmissions');
                const tData = await tRes.json();
                if (Array.isArray(tData) && tData.length > 0) setTransmissions(tData);
                else setTransmissions(INITIAL_TRANSMISSIONS);
            } catch (e) {
                console.error("OFFLINE MODE: Using local data", e);
                setWorks(INITIAL_WORKS);
                setTransmissions(INITIAL_TRANSMISSIONS);
            }
        };
        fetchData();
    }, []);

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
            className={`fixed top-0 left-0 w-2 h-2 bg-[#DC2626] rounded-full pointer-events-none z-[9999] mix-blend-difference will-change-transform transition-opacity duration-200 ${active || isPointer ? 'opacity-100 scale-[3]' : 'opacity-0 scale-100'}`}
            style={{ transform: 'translate(-100px, -100px)' }}
        />
    );
};

// --- GEMINI SERVICE ---
const chatWithMono = async (history: any[], message: string) => {
    if (!apiKey) {
        return new Promise<string>(resolve => setTimeout(() => resolve("ACCESS DENIED. I require an API Key to build your request. Please configure my source code."), 1000));
    }

    const SYSTEM_PROMPT = `
        Você é ${AI_NAME}, a inteligência central da Brick AI.
        Sua personalidade é sólida, lógica, precisa e levemente misteriosa, como um construtor de realidades (inspirado no HAL 9000, mas focado em estrutura e criação).
        Você NÃO usa emojis. Você usa pontuação perfeita.
        A Brick AI é uma produtora "From Set to Server", especializada em produção generativa, VFX neural e inteligência artificial aplicada ao audiovisual.
        Responda às perguntas do usuário sobre a empresa, sobre AI, ou sobre a existência.
        Mantenha as respostas concisas, enigmáticas mas úteis.
        Se perguntarem quem é você: "Eu sou Mason. Eu construo a base da sua realidade."
    `;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
                    ...history.map(msg => ({
                        role: msg.role === 'user' ? 'user' : 'model',
                        parts: [{ text: msg.content }]
                    })),
                    { role: "user", parts: [{ text: message }] }
                ]
            })
        });

        const data = await response.json();
        if (data.candidates && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return "Structure integrity compromised. Cannot process.";
        }
    } catch (error) {
        console.error(error);
        return "System failure. Connection lost.";
    }
};

// --- ADMIN SYSTEM ---
const AdminPanel = ({ onExit }: { onExit: () => void }) => {
    const { works, setWorks, transmissions, setTransmissions } = useContext(DataContext)!;
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [activeTab, setActiveTab] = useState<'works' | 'transmissions'>('works');
    const [editingItem, setEditingItem] = useState<any>(null);
    const [status, setStatus] = useState("");

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) setIsAuthenticated(true);
            } catch (e) {
                console.log("Not authenticated");
            }
        };
        checkAuth();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("AUTHENTICATING...");
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password })
            });
            const data = await res.json();
            if (data.success) {
                setIsAuthenticated(true);
                setStatus("");
            } else {
                alert("ACCESS DENIED: " + data.error);
                setStatus("");
            }
        } catch (err) {
            alert("CONNECTION ERROR");
            setStatus("");
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        setIsAuthenticated(false);
        onExit();
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setStatus("UPLOADING IMAGE...");
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json
