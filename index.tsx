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
    videoUrl?: string; // Novo campo para vídeo real
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
                <p className="mb-8 text-lg md:text-xl font-light leading-relaxed text-[#E5E5E5] first-letter:text-5xl first-letter:font-black first-letter:text-[#DC2626] first-letter:mr-3 first-letter:float-left">
                    We tend to think of generative models as engines of creation. Input prompt, output image. A linear manufacturing process. But this metaphor is insufficient for high-end production. At Brick, we treat the model not as a factory, but as a territory.
                </p>
                <h3 className="text-xl md:text-2xl font-black text-white mt-12 mb-6 uppercase tracking-tight flex items-center gap-3">
                    <span className="text-[#DC2626] text-sm align-middle">01 //</span> The Topography of Noise
                </h3>
                <p className="mb-6 text-[#9CA3AF] leading-relaxed">
                    Stable Diffusion XL does not "draw". It denoises. It subtracts chaos to reveal order. This implies that the image already exists within the high-dimensional noise, mathematically waiting to be uncovered.
                </p>
                <div className="border-l-2 border-[#DC2626] pl-6 py-4 my-12 bg-white/5">
                    <p className="text-lg font-mono italic text-white/90">
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
    // Generate simple schema objects (avoiding circular JSON issues)
    // Fallback to empty array if posts is undefined
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

    // Check if already logged in via cookie
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
            const data = await res.json();
            if (data.url) {
                setEditingItem((prev: any) => ({ ...prev, [field]: data.url }));
                setStatus("IMAGE READY.");
            }
        } catch (err) {
            setStatus("UPLOAD ERROR.");
        }
    };

    const updateImageSettings = (type: 'home' | 'works', key: string, value: number) => {
        const field = type === 'home' ? 'imageSettingsHome' : 'imageSettingsWorks';
        setEditingItem((prev: any) => ({
            ...prev,
            [field]: { ...(prev[field] || { x: 50, y: 50, scale: 1.2 }), [key]: value }
        }));
    };

    const handleSave = async () => {
        setStatus("UPLOADING TO CORE...");
        console.log(">> [DB DEBUG] Payload ready:", editingItem);

        try {
            const endpoint = activeTab === 'works' ? '/api/works' : '/api/transmissions';
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingItem)
            });
            if (!res.ok) throw new Error("Server rejected save");
        } catch (e) {
            setStatus("ERROR: SAVE FAILED");
            console.error(e);
            return;
        }

        if (activeTab === 'works') {
            if (works.find(w => w.id === editingItem.id)) {
                setWorks(works.map(w => w.id === editingItem.id ? editingItem : w));
            } else {
                setWorks([...works, editingItem]);
            }
        } else {
            if (transmissions.find(t => t.id === editingItem.id)) {
                setTransmissions(transmissions.map(t => t.id === editingItem.id ? editingItem : t));
            } else {
                setTransmissions([...transmissions, editingItem]);
            }
        }
        
        console.log(">> [DB DEBUG] Saved to Local State successfully.");
        setStatus("SUCCESS.");
        setTimeout(() => {
            setEditingItem(null);
            setStatus("");
        }, 800);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("CONFIRM DELETION?")) return;
        
        const endpoint = activeTab === 'works' ? `/api/works/${id}` : `/api/transmissions/${id}`;
        await fetch(endpoint, { method: 'DELETE' });

        if (activeTab === 'works') setWorks(works.filter(w => w.id !== id));
        else setTransmissions(transmissions.filter(t => t.id !== id));
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white font-mono">
                <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full max-w-md p-8 border border-white/10 bg-white/5">
                    <h2 className="text-xl font-bold tracking-widest text-[#DC2626]">SYSTEM ACCESS</h2>
                    <input 
                        type="text" 
                        value={identifier} 
                        onChange={e => setIdentifier(e.target.value)} 
                        placeholder="USERNAME OR EMAIL..." 
                        className="bg-black border border-white/20 p-3 text-white focus:border-[#DC2626] outline-none tracking-widest"
                    />
                    <input 
                        type="password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        placeholder="ENTER KEY..." 
                        className="bg-black border border-white/20 p-3 text-white focus:border-[#DC2626] outline-none tracking-widest"
                    />
                    <button type="submit" className="bg-[#DC2626] text-white p-3 font-bold tracking-widest hover:bg-red-700 transition-colors">AUTHENTICATE</button>
                    {status && <span className="text-xs text-[#DC2626] animate-pulse text-center">{status}</span>}
                    <button type="button" onClick={onExit} className="text-xs text-[#9CA3AF] hover:text-white mt-4 text-center">RETURN TO SURFACE</button>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-mono pt-24 px-6 md:px-12 pb-24">
            <div className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter">COMMAND_CONSOLE</h1>
                <div className="flex gap-4">
                    <button onClick={() => setEditingItem(null)} className="text-xs text-[#9CA3AF] hover:text-white uppercase tracking-widest">Reset View</button>
                    <button onClick={handleLogout} className="text-xs text-[#9CA3AF] hover:text-[#DC2626] uppercase tracking-widest">Logout</button>
                    <button onClick={onExit} className="text-xs text-[#DC2626] border border-[#DC2626] px-4 py-2 hover:bg-[#DC2626] hover:text-white transition-colors">EXIT SYSTEM</button>
                </div>
            </div>

            <div className="flex gap-6 mb-8">
                <button onClick={() => { setActiveTab('works'); setEditingItem(null); }} className={`text-sm tracking-widest px-4 py-2 border ${activeTab === 'works' ? 'border-[#DC2626] text-white bg-[#DC2626]/10' : 'border-transparent text-[#9CA3AF]'}`}>WORKS_DB</button>
                <button onClick={() => { setActiveTab('transmissions'); setEditingItem(null); }} className={`text-sm tracking-widest px-4 py-2 border ${activeTab === 'transmissions' ? 'border-[#DC2626] text-white bg-[#DC2626]/10' : 'border-transparent text-[#9CA3AF]'}`}>LOGS_DB</button>
            </div>

            {editingItem ? (
                <div className="max-w-4xl mx-auto bg-black border border-white/10 p-8 animate-fade-in-up">
                    <h3 className="text-xl font-bold mb-6 text-[#DC2626]">{editingItem.id ? 'EDIT_ENTRY' : 'NEW_ENTRY'}</h3>
                    <div className="grid grid-cols-1 gap-8">
                        {activeTab === 'works' ? (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <input className="bg-[#050505] border border-white/20 p-3" placeholder="ID (unique)" value={editingItem.id || ''} onChange={e => setEditingItem({...editingItem, id: e.target.value})} />
                                    <input className="bg-[#050505] border border-white/20 p-3" placeholder="Title" value={editingItem.title || ''} onChange={e => setEditingItem({...editingItem, title: e.target.value})} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input className="bg-[#050505] border border-white/20 p-3" placeholder="Category" value={editingItem.category || ''} onChange={e => setEditingItem({...editingItem, category: e.target.value})} />
                                    <input className="bg-[#050505] border border-white/20 p-3" placeholder="Subtitle" value={editingItem.subtitle || ''} onChange={e => setEditingItem({...editingItem, subtitle: e.target.value})} />
                                </div>
                                <div className="grid grid-cols-1">
                                    <input className="bg-[#050505] border border-white/20 p-3" placeholder="Vimeo URL (ex: https://vimeo.com/123456789)" value={editingItem.videoUrl || ''} onChange={e => setEditingItem({...editingItem, videoUrl: e.target.value})} />
                                    <p className="text-[9px] text-[#9CA3AF] mt-1 uppercase tracking-widest">Insira o link do Vimeo para exibição automática no modal do projeto.</p>
                                </div>
                                <textarea className="bg-[#050505] border border-white/20 p-3 h-24" placeholder="Short Description" value={editingItem.desc || ''} onChange={e => setEditingItem({...editingItem, desc: e.target.value})} />
                                <textarea className="bg-[#050505] border border-white/20 p-3 h-32" placeholder="Long Description" value={editingItem.longDesc || ''} onChange={e => setEditingItem({...editingItem, longDesc: e.target.value})} />
                                
                                <div className="border border-white/10 p-6 bg-[#050505]">
                                    <label className="block text-xs text-[#DC2626] font-bold tracking-widest mb-8 uppercase">Visual Direction (Home & Works)</label>
                                    
                                    <div className="space-y-12">
                                        {/* HOME PREVIEW (WIDE) */}
                                        <div className="flex flex-col gap-4">
                                            <span className="text-[10px] text-[#9CA3AF] uppercase tracking-widest">01. Home Page Layout (Wide)</span>
                                            <div className="w-full relative overflow-hidden border border-white/10 bg-[#050505]">
                                                <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden">
                                                    {editingItem.imageHome && (
                                                        <div className="absolute inset-0 opacity-50 mix-blend-overlay transition-all duration-0" style={{ backgroundImage: `url('${editingItem.imageHome}')`, backgroundSize: 'cover', backgroundPosition: `${editingItem.imageSettingsHome?.x ?? 50}% ${editingItem.imageSettingsHome?.y ?? 50}%`, transform: `scale(${editingItem.imageSettingsHome?.scale ?? 1.2})` }} />
                                                    )}
                                                    <div className={`absolute inset-0 bg-gradient-to-r ${editingItem.gradient || 'from-neutral-900 to-neutral-800'} opacity-50`}></div>
                                                    <div className="relative z-20 w-full h-full flex flex-col justify-end p-8">
                                                        <span className="block text-[#DC2626] text-[10px] font-bold tracking-[0.2em] uppercase mb-1">{editingItem.subtitle || 'SUBTITLE'}</span>
                                                        <h3 className="text-3xl font-black tracking-tighter text-white leading-none">{editingItem.title || 'PROJECT TITLE'}</h3>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                                <input type="file" onChange={e => handleImageUpload(e, 'imageHome')} className="text-xs text-[#9CA3AF]" />
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex justify-between text-[9px] text-[#9CA3AF] uppercase"><span>X: {editingItem.imageSettingsHome?.x ?? 50}%</span> <span>Y: {editingItem.imageSettingsHome?.y ?? 50}%</span> <span>Z: {editingItem.imageSettingsHome?.scale ?? 1.2}x</span></div>
                                                    <div className="flex gap-2">
                                                        <input type="range" min="0" max="100" value={editingItem.imageSettingsHome?.x ?? 50} onChange={e => updateImageSettings('home', 'x', parseFloat(e.target.value))} className="flex-1 accent-[#DC2626] h-1 bg-white/10 appearance-none cursor-pointer" />
                                                        <input type="range" min="0" max="100" value={editingItem.imageSettingsHome?.y ?? 50} onChange={e => updateImageSettings('home', 'y', parseFloat(e.target.value))} className="flex-1 accent-[#DC2626] h-1 bg-white/10 appearance-none cursor-pointer" />
                                                        <input type="range" min="1" max="3" step="0.1" value={editingItem.imageSettingsHome?.scale ?? 1.2} onChange={e => updateImageSettings('home', 'scale', parseFloat(e.target.value))} className="flex-1 accent-[#DC2626] h-1 bg-white/10 appearance-none cursor-pointer" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* WORKS PREVIEW (SQUARE) */}
                                        <div className="flex flex-col gap-4">
                                            <span className="text-[10px] text-[#9CA3AF] uppercase tracking-widest">02. Works Grid Layout (Square)</span>
                                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                                <div className="w-full md:w-64 aspect-square relative overflow-hidden border border-white/10 bg-[#050505]">
                                                    {editingItem.imageWorks && (
                                                        <div className="absolute inset-0 opacity-60" style={{ backgroundImage: `url('${editingItem.imageWorks}')`, backgroundSize: 'cover', backgroundPosition: `${editingItem.imageSettingsWorks?.x ?? 50}% ${editingItem.imageSettingsWorks?.y ?? 50}%`, transform: `scale(${editingItem.imageSettingsWorks?.scale ?? 1.2})` }} />
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                                                    <div className="absolute inset-0 p-4 flex flex-col justify-end">
                                                        <h3 className="text-lg font-black text-white leading-none tracking-tight">{editingItem.title || 'TITLE'}</h3>
                                                    </div>
                                                </div>
                                                <div className="flex-1 flex flex-col gap-6 w-full">
                                                    <input type="file" onChange={e => handleImageUpload(e, 'imageWorks')} className="text-xs text-[#9CA3AF]" />
                                                    <div className="space-y-4">
                                                        <div>
                                                            <div className="flex justify-between text-[9px] text-[#9CA3AF] uppercase mb-1"><span>Position X</span> <span>{editingItem.imageSettingsWorks?.x ?? 50}%</span></div>
                                                            <input type="range" min="0" max="100" value={editingItem.imageSettingsWorks?.x ?? 50} onChange={e => updateImageSettings('works', 'x', parseFloat(e.target.value))} className="w-full accent-[#DC2626] h-1 bg-white/10 appearance-none cursor-pointer" />
                                                        </div>
                                                        <div>
                                                            <div className="flex justify-between text-[9px] text-[#9CA3AF] uppercase mb-1"><span>Position Y</span> <span>{editingItem.imageSettingsWorks?.y ?? 50}%</span></div>
                                                            <input type="range" min="0" max="100" value={editingItem.imageSettingsWorks?.y ?? 50} onChange={e => updateImageSettings('works', 'y', parseFloat(e.target.value))} className="w-full accent-[#DC2626] h-1 bg-white/10 appearance-none cursor-pointer" />
                                                        </div>
                                                        <div>
                                                            <div className="flex justify-between text-[9px] text-[#9CA3AF] uppercase mb-1"><span>Scale / Zoom</span> <span>{editingItem.imageSettingsWorks?.scale ?? 1.2}x</span></div>
                                                            <input type="range" min="1" max="3" step="0.1" value={editingItem.imageSettingsWorks?.scale ?? 1.2} onChange={e => updateImageSettings('works', 'scale', parseFloat(e.target.value))} className="w-full accent-[#DC2626] h-1 bg-white/10 appearance-none cursor-pointer" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <input className="bg-[#050505] border border-white/20 p-3" placeholder="ID" value={editingItem.id || ''} onChange={e => setEditingItem({...editingItem, id: e.target.value})} />
                                    <input className="bg-[#050505] border border-white/20 p-3" placeholder="Date (YYYY.MM.DD)" value={editingItem.date || ''} onChange={e => setEditingItem({...editingItem, date: e.target.value})} />
                                </div>
                                <input className="bg-[#050505] border border-white/20 p-3" placeholder="Title" value={editingItem.title || ''} onChange={e => setEditingItem({...editingItem, title: e.target.value})} />
                                <textarea className="bg-[#050505] border border-white/20 p-3 h-24" placeholder="Excerpt" value={editingItem.excerpt || ''} onChange={e => setEditingItem({...editingItem, excerpt: e.target.value})} />
                                {/* Simple Content Editor for now */}
                                <textarea className="bg-[#050505] border border-white/20 p-3 h-64 font-mono text-xs" placeholder="Content (JSX/HTML)" value={typeof editingItem.content === 'string' ? editingItem.content : 'Complex content editing requires a rich text editor component.'} onChange={e => setEditingItem({...editingItem, content: e.target.value})} />
                            </>
                        )}
                        <div className="flex gap-4 mt-4">
                            <button onClick={handleSave} className="bg-[#DC2626] text-white px-6 py-3 font-bold tracking-widest hover:bg-white hover:text-black transition-colors">SAVE_TO_DB</button>
                            <button onClick={() => setEditingItem(null)} className="border border-white/20 text-white px-6 py-3 font-bold tracking-widest hover:bg-white/10">CANCEL</button>
                            {status && <span className="flex items-center text-[#DC2626] font-bold tracking-widest animate-pulse">{status}</span>}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-1">
                    <div 
                        onClick={() => setEditingItem(activeTab === 'works' ? { id: `work_${Date.now()}`, orientation: 'horizontal', hasDetail: true, gradient: 'from-neutral-900 to-neutral-800', imageSettingsHome: { x: 50, y: 50, scale: 1.2 }, imageSettingsWorks: { x: 50, y: 50, scale: 1.2 } } : { id: `log_${Date.now()}`, tags: [] })}
                        className="border border-white/10 border-dashed p-6 flex items-center justify-center cursor-pointer hover:border-[#DC2626] hover:bg-[#DC2626]/5 transition-all group"
                    >
                        <span className="text-[#9CA3AF] group-hover:text-[#DC2626] tracking-widest">+ NEW ENTRY</span>
                    </div>
                    {activeTab === 'works' ? (
                        works.map(work => (
                            <div key={work.id} className="bg-[#050505] border border-white/10 p-4 flex justify-between items-center group hover:border-white/30">
                                <div className="flex items-center gap-4">
                                    <img src={work.imageWorks || work.imageHome} className="w-12 h-12 object-cover grayscale group-hover:grayscale-0 transition-all" />
                                    <div>
                                        <h4 className="font-bold text-white">{work.title}</h4>
                                        <span className="text-xs text-[#9CA3AF]">{work.category}</span>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => setEditingItem(work)} className="text-xs text-white hover:text-[#DC2626] tracking-widest">EDIT</button>
                                    <button onClick={() => handleDelete(work.id)} className="text-xs text-[#9CA3AF] hover:text-[#DC2626] tracking-widest">DELETE</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        transmissions.map(post => (
                            <div key={post.id} className="bg-[#050505] border border-white/10 p-4 flex justify-between items-center group hover:border-white/30">
                                <div>
                                    <h4 className="font-bold text-white">{post.title}</h4>
                                    <span className="text-xs text-[#9CA3AF]">{post.date}</span>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => setEditingItem(post)} className="text-xs text-white hover:text-[#DC2626] tracking-widest">EDIT</button>
                                    <button onClick={() => handleDelete(post.id)} className="text-xs text-[#9CA3AF] hover:text-[#DC2626] tracking-widest">DELETE</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

// --- COMPONENTS: SECTIONS ---
const Header = ({ onChat, onWorks, onTransmissions, onHome, isChatView }: { onChat: () => void, onWorks: () => void, onTransmissions: () => void, onHome: () => void, isChatView: boolean }) => {
    return (
        <header className="fixed top-0 left-0 w-full z-50 px-6 py-6 md:px-12 flex justify-between items-center bg-gradient-to-b from-[#050505]/90 to-transparent backdrop-blur-sm pointer-events-none">
            <div onClick={onHome} className="pointer-events-auto flex items-center gap-2 group cursor-pointer select-none">
                <div className="font-black text-xl tracking-tighter text-white flex items-center gap-1">
                    <ScrambleText text="BRICK" hoverTrigger={true} />
                </div>
                <div className="flex items-baseline">
                    <span className="text-[#DC2626] font-bold text-xl md:text-2xl animate-blink relative -top-[1px] mx-[2px]">_</span>
                    <span className="text-[#9CA3AF] font-semibold text-sm md:text-base tracking-widest group-hover:text-white transition-colors duration-500">AI</span>
                </div>
            </div>
            {!isChatView && (
                <div className="flex items-center gap-8 pointer-events-auto">
                    {/* NAV STYLE: Raw Text Links */}
                    <MagneticButton onClick={() => window.location.href = '/brand.html'} className="group text-xs md:text-sm font-mono tracking-[0.2em] text-[#9CA3AF] hover:text-[#DC2626] transition-colors duration-300">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-2 duration-300">&gt;</span>
                        BRAND
                    </MagneticButton>

                    <MagneticButton onClick={onWorks} className="group text-xs md:text-sm font-mono tracking-[0.2em] text-[#9CA3AF] hover:text-[#DC2626] transition-colors duration-300">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-2 duration-300">&gt;</span>
                        WORKS
                    </MagneticButton>

                    <MagneticButton onClick={onTransmissions} className="group text-xs md:text-sm font-mono tracking-[0.2em] text-[#9CA3AF] hover:text-[#DC2626] transition-colors duration-300">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-2 duration-300">&gt;</span>
                        TRANSMISSIONS
                    </MagneticButton>
                    
                    {/* CTA STYLE: Subtle Blinking Underscore */}
                    <MagneticButton onClick={onChat} className="ml-8 text-xs md:text-sm font-mono font-bold tracking-[0.15em] transition-all duration-300 text-white hover:text-[#DC2626] group">
                        TALK TO US <span className="text-[#DC2626] animate-blink group-hover:text-white">_</span>
                    </MagneticButton>
                </div>
            )}
        </header>
    );
};

const Hero = ({ setMonolithHover, monolithHover }: { setMonolithHover: (v: boolean) => void, monolithHover: boolean }) => {
    const radiationRef = useRef<HTMLDivElement>(null);
    const targetPos = useRef({ x: 0, y: 0 });
    const currentPos = useRef({ x: 0, y: 0 });
    
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
            const ease = 0.08;
            currentPos.current.x += (targetPos.current.x - currentPos.current.x) * ease;
            currentPos.current.y += (targetPos.current.y - currentPos.current.y) * ease;

            if (radiationRef.current) {
                const { x, y } = currentPos.current;
                const scale = monolithHover ? 1.4 : 0.8;
                const opacity = monolithHover ? 1 : 0;
                radiationRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
                radiationRef.current.style.opacity = opacity.toString();
            }
            rafId = requestAnimationFrame(animate);
        };
        animate();
        return () => cancelAnimationFrame(rafId);
    }, [monolithHover]);

    return (
        <section className="relative min-h-screen w-full flex flex-col items-center justify-start pt-28 md:pt-32 pb-20 overflow-hidden">
            <div className="reveal relative z-10 w-full flex justify-center mb-12 md:mb-16">
                <div className="relative w-[140px] md:w-[160px] h-[40vh] md:h-[45vh]">
                    <div 
                        className={`monolith-structure w-full h-full rounded-[2px] flex items-center justify-center overflow-hidden shadow-2xl relative transition-transform duration-1000 ease-out pointer-events-none ${monolithHover ? 'scale-[1.02]' : 'scale-100'}`}
                        style={{ transform: 'translateZ(0)' }}
                    >
                        <div className="absolute inset-0 mix-blend-overlay monolith-texture bg-neutral-900 pointer-events-none"></div>
                        <div className="centered-layer aura-atmos pointer-events-none opacity-50"></div>
                        <div className="centered-layer light-atmos animate-breathe pointer-events-none opacity-50"></div>
                        <div className="centered-layer core-atmos pointer-events-none"></div>
                        <div 
                            ref={radiationRef}
                            className="absolute w-[300px] h-[300px] -ml-[150px] -mt-[150px] top-1/2 left-1/2 pointer-events-none transition-opacity duration-700 ease-out"
                            style={{
                                background: 'radial-gradient(circle, rgba(220,38,38,0.15) 0%, rgba(220,38,38,0.01) 60%, transparent 80%)',
                                filter: 'blur(40px)',
                                zIndex: 5,
                                opacity: 0,
                                willChange: 'transform, opacity',
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                                perspective: 1000,
                                transformStyle: 'preserve-3d'
                            }}
                        ></div>
                        <div className="absolute inset-0 border border-white/5 opacity-50 pointer-events-none z-10"></div>
                    </div>
                    <div 
                        className="absolute inset-0 z-20 cursor-none"
                        onMouseMove={handleMouseMove}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    ></div>
                </div>
            </div>
            <div className="reveal delay-200 text-center z-20 max-w-6xl px-4 flex flex-col items-center pointer-events-none">
                <h1 className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white leading-[0.85] mb-6 md:mb-10 drop-shadow-2xl">
                    FROM SET TO SERVER.
                </h1>
                <p className="text-lg md:text-2xl lg:text-3xl font-light tracking-[0.3em] text-[#E5E5E5]/80 mb-2 md:mb-4">10 YEARS OF CRAFT.</p>
                <h2 className="text-3xl md:text-6xl lg:text-7xl font-black tracking-tighter text-[#DC2626] drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                    <ScrambleText text="NOW GENERATIVE." />
                </h2>
                <p className="mt-12 text-[#9CA3AF] text-xs md:text-sm font-light tracking-[0.2em] uppercase opacity-60 max-w-md border-t border-white/10 pt-6">A new division by Brick.<br/>From zero to all since 2016.</p>
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#DC2626]/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
        </section>
    );
};

const Philosophy = () => (
    <section className="relative w-full py-32 bg-[#050505] z-20 border-t border-white/5">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent -translate-x-1/2 hidden md:block"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
            <div className="mb-32 reveal flex flex-col items-center">
                <div className="w-2 h-2 bg-[#DC2626] rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)] mb-6"></div>
                <span className="text-xs font-mono tracking-[0.3em] text-[#9CA3AF] uppercase bg-[#050505] px-4">The Belief</span>
            </div>
            <div className="flex flex-col gap-32 w-full">
                <PhilosophyItem title="RAW." text="AI creates infinite pixels and patterns. But it cannot create intent. It is just a resource." />
                <PhilosophyItem title="NOISE." text="Without a human hand, generative models are just mathematical coincidence. We provide the vision." />
                <PhilosophyItem title="WE DIRECT THE INTELLIGENCE." text="The machine is the brush. The database is the paint. We are still the artists." />
            </div>
        </div>
    </section>
);

const PhilosophyItem = ({ title, text }: { title: string, text: string }) => (
    <div className="reveal flex flex-col items-center group cursor-default">
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6 transition-colors duration-500 group-hover:text-[#DC2626]">{title}</h2>
        <p className="text-lg md:text-xl text-[#9CA3AF] font-light max-w-lg leading-relaxed group-hover:text-white transition-colors duration-300">{text}</p>
    </div>
);

const WorkCard = ({ work, index, onOpen }: { work: Work, index: number, onOpen: (work: Work) => void }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const bgRef = useRef<HTMLDivElement>(null);
    const settings = work.imageSettingsHome || { x: 50, y: 50, scale: 1.2 };

    useEffect(() => {
        let animationFrameId: number;
        let ticking = false;

        const updateParallax = () => {
            if (!containerRef.current || !bgRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            if (rect.top < viewportHeight && rect.bottom > 0) {
                const cardCenter = rect.top + rect.height / 2;
                const screenCenter = viewportHeight / 2;
                const distanceFromCenter = cardCenter - screenCenter;
                const yOffset = distanceFromCenter * 0.08;
                bgRef.current.style.transform = `scale(${settings.scale}) translate3d(0, ${yOffset}px, 0)`;
            }
            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                animationFrameId = requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        updateParallax();
        return () => {
            window.removeEventListener('scroll', onScroll);
            cancelAnimationFrame(animationFrameId);
        };
    }, [settings.scale]);

    return (
        <div 
            ref={containerRef} 
            onClick={() => work.hasDetail && onOpen(work)}
            className={`reveal work-card-trigger w-full min-h-[40vh] md:min-h-[50vh] relative flex items-center group overflow-hidden border-b border-black ${work.hasDetail ? 'cursor-pointer' : 'cursor-default'}`} 
            style={{ transitionDelay: `${index * 100}ms` }}
        >
            <div 
                ref={bgRef} 
                className="absolute inset-0 opacity-50 mix-blend-overlay will-change-transform" 
                style={{ 
                    backgroundImage: `url('${work.imageHome}')`, 
                    backgroundSize: 'cover', 
                    backgroundPosition: `${settings.x}% ${settings.y}%`, 
                    transform: `scale(${settings.scale})` 
                }}
            ></div>
            <div className={`absolute inset-0 bg-gradient-to-r ${work.gradient} opacity-50 transition-opacity duration-700 group-hover:opacity-80 z-10`}></div>
            <div className="relative z-20 px-6 md:px-12 lg:px-24 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pointer-events-none">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="block text-[#DC2626] text-xs font-bold tracking-[0.2em]">{work.subtitle}</span>
                        {work.hasDetail && <div className="w-1.5 h-1.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>}
                    </div>
                    <h3 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white mb-2 group-hover:translate-x-4 transition-transform duration-500">{work.title}</h3>
                </div>
                <p className="text-[#9CA3AF] text-sm md:text-lg font-light max-w-sm text-left md:text-right group-hover:text-white transition-colors duration-300">{work.desc}</p>
            </div>
        </div>
    );
};

const SelectedWorks = ({ onSelectProject }: { onSelectProject: (work: Work) => void }) => (
    <section id="works" className="w-full pt-24 pb-0 bg-[#050505] border-t border-white/5 relative z-40">
        <div className="px-6 md:px-12 lg:px-24 mb-16 reveal">
            <h2 className="text-sm md:text-base font-bold tracking-[0.3em] text-[#9CA3AF] uppercase">Selected Works</h2>
        </div>
        <div className="flex flex-col w-full gap-0">
            {/* Use Context Data */}
            <ContextConsumer>
                {({ works }) => works.slice(0, 3).map((work, idx) => <WorkCard key={idx} work={work} index={idx} onOpen={onSelectProject} />)}
            </ContextConsumer>
        </div>
    </section>
);

const Legacy = () => (
    <section className="w-full py-32 px-6 md:px-12 lg:px-24 bg-[#E5E5E5] text-[#050505] relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto reveal">
            <h2 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-20 leading-[0.85]">BACKED <br className="md:hidden"/> BY BRICK.</h2>
            <div className="flex flex-col lg:flex-row gap-20 border-t-4 border-[#050505] pt-16">
                <div className="lg:w-1/2">
                    <p className="text-xl md:text-2xl font-light leading-tight max-w-lg">
                        This isn't a beta test. This is a new lens from a production house with 10 years of experience.
                    </p>
                </div>
                <div className="lg:w-1/2">
                    <h4 className="text-xs font-bold tracking-[0.2em] uppercase mb-12 text-neutral-400 border-b border-neutral-200 pb-4 inline-block">Trusted By</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10 w-full">
                        {CLIENTS.map((client, i) => (
                            <div key={i} className="flex items-start justify-start group">
                                <span className="text-base md:text-lg font-black text-neutral-300 group-hover:text-[#050505] transition-colors duration-300 cursor-default tracking-tighter uppercase whitespace-nowrap">
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

const ProjectModal = ({ project, onClose }: { project: Work, onClose: () => void }) => {
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
        ? 'max-w-7xl max-h-[85vh] aspect-[16/8] md:aspect-[16/7]' 
        : 'max-w-5xl max-h-[90vh] aspect-[9/16] md:aspect-auto';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl transition-opacity duration-500" onClick={onClose}></div>
            <div className={`relative w-full ${modalClasses} bg-neutral-900 border border-white/10 flex flex-col md:flex-row shadow-2xl animate-fade-in-up overflow-hidden`}>
                <button onClick={onClose} className="absolute top-4 right-4 z-50 text-white/50 hover:text-[#DC2626] transition-colors p-2 mix-blend-difference">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <div className={`w-full md:w-2/3 bg-black relative border-b md:border-b-0 md:border-r border-white/10 group overflow-hidden flex items-center justify-center`}>
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
                                        backgroundPosition: `${settings.x}% ${settings.y}%`,
                                        transform: `scale(${settings.scale})`
                                    }}
                                ></div>
                                <div className="z-10 w-16 h-16 rounded-full border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:border-[#DC2626] transition-all duration-300 cursor-pointer backdrop-blur-sm bg-black/30">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                </div>
                            </div>
                        )}
                        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end text-[10px] font-mono tracking-widest text-white/50 pointer-events-none z-20">
                            <span>{project.videoUrl ? 'NEURAL_RENDER_ACTIVE' : 'STATIC_PREVIEW'}</span>
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
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tighter mb-4 leading-none">{project.title}</h2>
                    </div>
                    <div className="flex-1 py-4">
                        <p className="text-[#E5E5E5]/80 font-light text-xs md:text-sm leading-relaxed">{project.longDesc || project.desc}</p>
                    </div>
                    <div className="border-t border-white/10 pt-4 mt-auto">
                        <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9CA3AF] mb-3">System Data</h4>
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
            className="group relative w-full aspect-square border border-white/10 bg-[#0a0a0a] overflow-hidden cursor-pointer hover:border-[#DC2626] transition-colors duration-300 reveal"
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => onOpen(work)}
        >
            <div 
                className="absolute inset-0 opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" 
                style={{ 
                    backgroundImage: `url('${work.imageWorks || work.imageHome}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: `${settings.x}% ${settings.y}%`,
                    transform: `scale(${settings.scale})`
                }}
            ></div>
            <div className="scanline-effect"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300"></div>
            <div className="absolute inset-0 p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start opacity-50 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="font-mono text-[10px] tracking-widest text-[#DC2626]">{(index + 1).toString().padStart(3, '0')}</span>
                    <span className="font-mono text-[10px] tracking-widest border border-white/20 px-2 py-0.5 rounded-full">{work.category}</span>
                </div>
                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-xl md:text-2xl font-black text-white leading-none mb-2 tracking-tight group-hover:text-[#DC2626] transition-colors">{work.title}</h3>
                    <p className="text-[10px] md:text-xs text-[#9CA3AF] font-mono tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 line-clamp-2">{work.desc}</p>
                </div>
            </div>
            <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-white/30 group-hover:border-[#DC2626] transition-colors"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-white/30 group-hover:border-[#DC2626] transition-colors"></div>
        </div>
    );
};

const WorksFilter = ({ categories, activeCategory, onSelect }: { categories: string[], activeCategory: string, onSelect: (c: string) => void }) => {
    return (
        <div className="flex flex-wrap gap-4 mb-12 border-b border-white/10 pb-6 reveal">
            <span className="text-xs font-mono text-[#9CA3AF] tracking-widest uppercase py-2 mr-4 hidden md:block">PROTOCOLS //</span>
            {categories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => onSelect(cat)}
                    className={`text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 px-3 py-1 border ${activeCategory === cat ? 'bg-[#DC2626] border-[#DC2626] text-white' : 'bg-transparent border-transparent text-[#9CA3AF] hover:text-white hover:border-white/20'}`}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
};

const WorksPage = ({ onChat, onWorks, onTransmissions, onHome, onSelectProject }: any) => {
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
            <Header onChat={onChat} onWorks={onWorks} onTransmissions={onTransmissions} onHome={onHome} isChatView={false} />
            <button onClick={onHome} className="fixed top-24 left-6 md:left-12 text-[#9CA3AF] hover:text-white text-xs md:text-sm tracking-widest uppercase transition-colors z-40 flex items-center gap-2 group mix-blend-difference">
                <span className="text-[#DC2626] group-hover:-translate-x-1 transition-transform">&lt;</span> RETURN TO SURFACE
            </button>
            <main className="pt-32 min-h-screen flex flex-col">
                <section className="w-full px-6 md:px-12 lg:px-24 mb-12 reveal">
                     <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-white mb-4">ARCHIVE_INDEX</h1>
                            <p className="text-[#9CA3AF] font-mono text-xs md:text-sm tracking-widest max-w-xl">ACESSING NEURAL DATABASE... {works.length} ENTRIES FOUND.</p>
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
                        <div className="w-full h-64 flex items-center justify-center border border-white/10 border-dashed text-[#9CA3AF] font-mono text-sm tracking-widest reveal">NO DATA FOUND IN THIS SECTOR.</div>
                    )}
                </section>
            </main>
            <Footer onChat={onChat} />
        </React.Fragment>
    );
}

const BlogPostPage = ({ post, onBack, onChat, onWorks, onTransmissions, onHome }: any) => {
    return (
        <React.Fragment>
            <Header onChat={onChat} onWorks={onWorks} onTransmissions={onTransmissions} onHome={onHome} isChatView={false} />
            <button onClick={onBack} className="fixed top-24 left-6 md:left-12 text-[#9CA3AF] hover:text-white text-xs md:text-sm tracking-widest uppercase transition-colors z-40 flex items-center gap-2 group mix-blend-difference">
                <span className="text-[#DC2626] group-hover:-translate-x-1 transition-transform">&lt;</span> RETURN TO INDEX
            </button>
            <main className="pt-32 min-h-screen flex flex-col bg-[#0a0a0a] pb-32">
                <article className="w-full max-w-3xl mx-auto px-6 md:px-12 mt-12 animate-fade-in-up">
                    <div className="border-b border-white/10 pb-8 mb-12">
                        <div className="flex flex-wrap gap-4 items-center mb-6 text-[10px] font-mono uppercase tracking-widest">
                            <span className="text-[#DC2626]">LOG_ID: {post.id}</span>
                            <span className="text-[#9CA3AF]">DATE: {post.date}</span>
                            {post.tags.map((tag: string) => (
                                <span key={tag} className="border border-white/10 px-2 py-0.5 text-white/50">{tag}</span>
                            ))}
                        </div>
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-6">{post.title}</h1>
                        <p className="text-lg md:text-xl text-[#9CA3AF] font-light leading-relaxed border-l-2 border-[#DC2626] pl-6">{post.excerpt}</p>
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

const TransmissionsPage = ({ onHome, onChat, onWorks, onTransmissions, onSelectPost }: any) => {
    const { transmissions } = useContext(DataContext)!;
    return (
    <React.Fragment>
        <Header onChat={onChat} onWorks={onWorks} onTransmissions={onTransmissions} onHome={onHome} isChatView={false} />
        <button onClick={onHome} className="fixed top-24 left-6 md:left-12 text-[#9CA3AF] hover:text-white text-xs md:text-sm tracking-widest uppercase transition-colors z-40 flex items-center gap-2 group mix-blend-difference">
            <span className="text-[#DC2626] group-hover:-translate-x-1 transition-transform">&lt;</span> RETURN TO SURFACE
        </button>
        <main className="pt-32 min-h-screen flex flex-col bg-[#0a0a0a]">
            <section className="w-full px-6 md:px-12 lg:px-24 mb-12 reveal">
                 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-white mb-4">NEURAL_LOGS</h1>
                        <p className="text-[#9CA3AF] font-mono text-xs md:text-sm tracking-widest max-w-xl">INCOMING DATA STREAMS... {transmissions.length} RECORDS.</p>
                    </div>
                 </div>
            </section>
            <section className="w-full px-6 md:px-12 lg:px-24 flex-1 pb-32 reveal">
                <div className="space-y-px bg-white/10 border-t border-white/10">
                    {transmissions.map((post) => (
                        <div key={post.id} onClick={() => onSelectPost(post)} className="block group bg-[#050505] hover:bg-[#0a0a0a] transition-colors p-8 md:p-12 border-b border-white/10 cursor-pointer">
                            <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 mb-6">
                                <h3 className="text-2xl md:text-4xl font-black text-white tracking-tight group-hover:text-[#DC2626] transition-colors">{post.title}</h3>
                                <span className="font-mono text-xs text-[#DC2626] tracking-widest whitespace-nowrap">{post.date}</span>
                            </div>
                            <p className="text-[#9CA3AF] text-base md:text-lg font-light max-w-3xl mb-8 leading-relaxed">{post.excerpt}</p>
                            <div className="flex gap-3">
                                {post.tags.map(tag => (
                                    <span key={tag} className="text-[10px] font-mono border border-white/10 px-3 py-1.5 text-[#9CA3AF]/60 uppercase tracking-wider">{tag}</span>
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

const Footer = ({ onChat, onAdmin }: { onChat: () => void, onAdmin?: () => void }) => (
    <footer className="w-full py-32 px-6 md:px-12 lg:px-24 bg-black border-t border-white/5 relative z-10">
        <div className="flex flex-col items-center text-center gap-12 reveal">
            <h2 className="text-sm md:text-base font-mono text-[#9CA3AF] tracking-widest uppercase">Have a complex problem?</h2>
            <p className="text-4xl md:text-6xl lg:text-8xl font-black text-white tracking-tighter leading-none max-w-5xl">WE HAVE THE INTELLIGENCE.</p>
            <MagneticButton onClick={onChat} className="mt-8 text-lg md:text-xl font-mono font-bold tracking-[0.15em] transition-all duration-300 text-white hover:text-[#DC2626] group">
                TALK TO US <span className="text-[#DC2626] animate-blink group-hover:text-white">_</span>
            </MagneticButton>
        </div>
        <div className="mt-32 border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-end gap-8 reveal">
            <div className="flex flex-col gap-4 items-center md:items-start w-full md:w-auto">
                <span className="text-[10px] font-mono text-[#DC2626] tracking-widest uppercase">Network</span>
                <div className="flex gap-6">
                    {['LinkedIn', 'Instagram', 'Twitter'].map((social) => (
                        <a key={social} href={`https://${social.toLowerCase()}.com/brickai`} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-white hover:text-[#DC2626] tracking-widest uppercase transition-colors">{social}</a>
                    ))}
                </div>
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#9CA3AF]/40 font-bold text-center md:text-right w-full md:w-auto">
                <span className="block mb-2">&copy; 2025 Brick AI.</span>
                <span className="hidden md:inline">The Generative Division</span>
                <span className="block mt-1">All Rights Reserved.</span>
                {onAdmin && <button onClick={onAdmin} className="mt-4 opacity-20 hover:opacity-100 transition-opacity">SYSTEM_ADMIN</button>}
            </div>
        </div>
    </footer>
);

const SystemChat = ({ onBack }: { onBack: () => void }) => {
    const [messages, setMessages] = useState<{ role: string, content: string }[]>([
        { role: 'mono', content: `SYSTEM ONLINE. I am ${AI_NAME}. I organize the chaos into visuals.` },
        { role: 'mono', content: "Select a protocol or transmit your query." }
    ]);
    const [input, setInput] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [awaitingEmail, setAwaitingEmail] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const SUGGESTIONS = ["What services do you offer?", "How does Generative AI work?", "I have a complex project.", "Who are your clients?"];

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
        <div className="min-h-screen pt-32 pb-12 flex flex-col items-center justify-start font-mono relative">
            <button onClick={onBack} className="fixed top-24 left-6 md:left-12 text-[#9CA3AF] hover:text-white text-xs md:text-sm tracking-widest uppercase transition-colors z-40 flex items-center gap-2 group">
                <span className="text-[#DC2626] group-hover:-translate-x-1 transition-transform">&lt;</span> RETURN TO SURFACE
            </button>
            <div className="relative mb-8 shrink-0 z-10 animate-fade-in-up">
                <div className="monolith-structure w-[100px] h-[25vh] md:w-[120px] md:h-[30vh] rounded-[2px] flex items-center justify-center overflow-hidden shadow-2xl relative">
                    <div className="absolute inset-0 mix-blend-overlay monolith-texture bg-neutral-900 pointer-events-none"></div>
                    <div className="centered-layer aura-atmos pointer-events-none opacity-50"></div>
                    <div className={`centered-layer light-atmos pointer-events-none transition-all duration-500 ${isProcessing ? 'animate-thinking bg-[#DC2626] opacity-100' : 'animate-breathe opacity-50'}`}></div>
                    <div className="centered-layer core-atmos pointer-events-none"></div>
                    <div className="absolute inset-0 border border-white/5 opacity-50 pointer-events-none z-10"></div>
                </div>
                <div className="text-center mt-6 text-[#DC2626] text-[10px] tracking-[0.3em] uppercase opacity-70 animate-pulse">
                    {isProcessing ? "ANALYZING INPUT..." : `${AI_NAME} ONLINE`}
                </div>
            </div>
            <div className="w-full max-w-2xl px-6 flex-1 flex flex-col z-10">
                <div className="flex-1 overflow-y-auto mb-6 space-y-6 scrollbar-hide min-h-[30vh]">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} opacity-0 animate-[terminal-blink_0.5s_ease-out_forwards]`} style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
                            <span className="text-[10px] text-neutral-600 mb-2 uppercase tracking-widest font-bold">{msg.role === 'user' ? 'CLIENT_TERMINAL' : 'MASON_CORE'}</span>
                            <div className={`max-w-lg p-6 text-sm md:text-base leading-relaxed border backdrop-blur-sm shadow-lg ${msg.role === 'user' ? 'border-white/10 text-white bg-white/5' : 'border-[#DC2626]/20 text-[#E5E5E5] bg-black/60'}`}>{msg.content}</div>
                        </div>
                    ))}
                    {isProcessing && (
                        <div className="flex flex-col items-start">
                            <span className="text-[10px] text-neutral-600 mb-2 uppercase tracking-widest font-bold">MASON_CORE</span>
                            <div className="typing-indicator text-[#DC2626] text-xl tracking-widest pl-4"><span>.</span><span>.</span><span>.</span></div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                {!isProcessing && messages.length < 4 && (
                    <div className="flex flex-wrap justify-center gap-3 mb-6 animate-fade-in-up">
                        {SUGGESTIONS.map((query, i) => (
                            <button key={i} onClick={() => handleSend(query)} className="text-[10px] uppercase tracking-wider text-[#9CA3AF] border border-white/10 bg-white/5 px-4 py-2 hover:bg-white hover:text-black hover:border-white transition-all duration-300">{query}</button>
                        ))}
                    </div>
                )}
                <form onSubmit={handleSend} className="relative group border-t border-white/10 pt-6">
                    <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={`ASK ${AI_NAME}...`} className="w-full bg-transparent py-4 text-white font-mono text-sm md:text-base focus:outline-none placeholder:text-neutral-700 placeholder:tracking-widest" autoFocus />
                    <button type="submit" className="absolute right-0 top-6 bottom-0 text-[10px] text-neutral-500 hover:text-[#DC2626] uppercase tracking-[0.2em] transition-colors">TRANSMIT</button>
                </form>
            </div>
        </div>
    );
};

const HomePage = ({ onChat, onSelectProject, onWorks, onTransmissions, onHome, setMonolithHover, monolithHover, onAdmin }: any) => (
    <React.Fragment>
        <Header onChat={onChat} onWorks={onWorks} onTransmissions={onTransmissions} onHome={onHome} isChatView={false} />
        <main>
            <Hero setMonolithHover={setMonolithHover} monolithHover={monolithHover} />
            <Philosophy />
            <SelectedWorks onSelectProject={onSelectProject} />
            <Legacy />
        </main>
        <Footer onChat={onChat} onAdmin={onAdmin} />
    </React.Fragment>
);

const App = () => {
    const [view, setView] = useState('home'); 
    const [monolithHover, setMonolithHover] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Work | null>(null);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    // Sync state with URL on load and back/forward
    useEffect(() => {
        const handleLocationChange = () => {
            const path = window.location.pathname;
            
            if (path === '/') { setView('home'); }
            else if (path === '/works') { setView('works'); }
            else if (path === '/transmissions') { setView('transmissions'); }
            else if (path === '/chat') { setView('chat'); }
            else if (path === '/admin') { setView('admin'); }
            else if (path.startsWith('/transmissions/')) { setView('post'); }
        };

        window.addEventListener('popstate', handleLocationChange);
        handleLocationChange(); // Initial check

        return () => window.removeEventListener('popstate', handleLocationChange);
    }, []);

    const navigate = (newView: string, path: string) => {
        setView(newView);
        window.history.pushState({}, '', path);
        window.scrollTo(0, 0);
    };

    const goHome = () => { navigate('home', '/'); setSelectedPost(null); };
    const goWorks = () => { navigate('works', '/works'); setSelectedPost(null); };
    const goTransmissions = () => { navigate('transmissions', '/transmissions'); setSelectedPost(null); };
    const goChat = () => { navigate('chat', '/chat'); setSelectedPost(null); };
    const goAdmin = () => { navigate('admin', '/admin'); setSelectedPost(null); };
    
    const handleSelectPost = (post: Post) => {
        setSelectedPost(post);
        navigate('post', `/transmissions/${post.id}`);
    };

    useScrollReveal(view);

    return (
        <DataProvider>
            <AppContent view={view} setView={setView} monolithHover={monolithHover} setMonolithHover={setMonolithHover} selectedProject={selectedProject} setSelectedProject={setSelectedProject} selectedPost={selectedPost} setSelectedPost={setSelectedPost} goHome={goHome} goWorks={goWorks} goTransmissions={goTransmissions} goChat={goChat} goAdmin={goAdmin} handleSelectPost={handleSelectPost} />
        </DataProvider>
    );
};

const AppContent = ({ view, setView, monolithHover, setMonolithHover, selectedProject, setSelectedProject, selectedPost, setSelectedPost, goHome, goWorks, goTransmissions, goChat, goAdmin, handleSelectPost }: any) => {
    const { transmissions } = useContext(DataContext)!;

    // Resolve post from URL if landing directly on a post page
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
            <StructuredData posts={transmissions} />
            <div className="noise-overlay"></div>
            <CustomCursor active={monolithHover || selectedProject !== null} />
            {selectedProject && (
                <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
            )}
            {view === 'home' && (
                <HomePage onChat={goChat} onWorks={goWorks} onTransmissions={goTransmissions} onHome={goHome} onSelectProject={setSelectedProject} setMonolithHover={setMonolithHover} monolithHover={monolithHover} onAdmin={goAdmin} />
            )}
            {view === 'works' && (
                <WorksPage onChat={goChat} onWorks={goWorks} onTransmissions={goTransmissions} onHome={goHome} onSelectProject={setSelectedProject} setMonolithHover={setMonolithHover} monolithHover={monolithHover} />
            )}
            {view === 'transmissions' && (
                <TransmissionsPage onChat={goChat} onWorks={goWorks} onTransmissions={goTransmissions} onHome={goHome} onSelectPost={handleSelectPost} />
            )}
            {view === 'post' && selectedPost && (
                <BlogPostPage post={selectedPost} onBack={goTransmissions} onChat={goChat} onWorks={goWorks} onTransmissions={goTransmissions} onHome={goHome} />
            )}
            {view === 'chat' && (
                <React.Fragment>
                    <Header onChat={goChat} onWorks={goWorks} onTransmissions={goTransmissions} onHome={goHome} isChatView={true} />
                    <SystemChat onBack={goHome} />
                </React.Fragment>
            )}
            {view === 'admin' && (
                <AdminPanel onExit={goHome} />
            )}
        </div>
    );
};

// Helper for Context Consumption in Class/Functional mix if needed, though Hooks are used primarily
const ContextConsumer = ({ children }: { children: (data: any) => React.ReactNode }) => {
    const data = useContext(DataContext);
    if (!data) return null;
    return <>{children(data)}</>;
};

// Mount
const rootElement = document.getElementById('root');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
}
