import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

// --- CONFIG ---
const apiKey = process.env.GEMINI_API_KEY || "";
const AI_NAME = "MASON";

// --- TYPES ---
// (Opcional, mas útil se você quiser tipagem estrita no futuro)
interface Work {
    id: string;
    orientation: 'horizontal' | 'vertical';
    subtitle: string;
    title: string;
    desc: string;
    longDesc?: string;
    credits?: Array<{ role: string; name: string }>;
    gradient: string;
    image: string;
    hasDetail: boolean;
}

interface ChatMessage {
    role: 'user' | 'mono';
    content: string;
}

// --- DATA ---
const WORKS: Work[] = [
    // --- DESTAQUES DA HOME (TOP 3) ---
    {
        id: "inheritance",
        orientation: "horizontal", 
        subtitle: "FULL GENERATIVE",
        title: "INHERITANCE - BENEATH THE WHEEL",
        desc: "When the location doesn't exist. 100% Neural Rendering.",
        longDesc: "Inheritance creates a procedural reality where memory and architecture collide. We trained custom LoRAs on brutalist schematics and organic decay patterns to generate 4,000 frames of non-existent environments. The result is a hallucination of space that reacts to audio frequencies in real-time.",
        credits: [
            { role: "Director", name: "Sarah V." },
            { role: "AI Lead", name: "Mason Core" },
            { role: "Sound", name: "Echo Lab" },
            { role: "Tech", name: "Stable Diffusion XL" }
        ],
        gradient: "from-neutral-900 to-neutral-800",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564",
        hasDetail: true
    },
    {
        id: "shift",
        orientation: "horizontal", 
        subtitle: "HYBRID EXTENSION",
        title: "WE CAN SELL ANYTHING",
        desc: "Expanding the set beyond physical limits. Seamless VFX.",
        longDesc: "For 'We Can Sell Anything', we developed a proprietary neural extension pipeline. Starting with a minimal physical set, we utilized generative in-painting to expand the environment into infinite, photorealistic landscapes. The transition between practical lighting and AI-generated horizons is mathematically seamless.",
        credits: [
            { role: "Director", name: "Marcus L." },
            { role: "VFX Sup", name: "Brick Core" },
            { role: "Agency", name: "Future Brand" },
            { role: "Tech", name: "Nuke + In-painting" }
        ],
        gradient: "from-neutral-900 via-brick-red/10 to-neutral-900",
        image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop",
        hasDetail: true
    },
    {
        id: "anima",
        orientation: "vertical", 
        subtitle: "STYLE TRANSFER",
        title: "AUTOBOL - REIMAGINED",
        desc: "Turning live action into branded art using custom models.",
        longDesc: "We took standard broadcast footage of a football match and processed it through a custom-trained style transfer model. The goal was a complete re-interpretation of motion and texture, turning athletes into dynamic kinetic sculptures while maintaining temporal consistency at 60fps.",
        credits: [
            { role: "Creative", name: "Ana S." },
            { role: "AI Artist", name: "Mason Core" },
            { role: "Client", name: "Sports Global" },
            { role: "Tech", name: "Ebsynth + SD Video" }
        ],
        gradient: "from-neutral-900 to-neutral-950",
        image: "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=2668&auto=format&fit=crop",
        hasDetail: true
    },
    // --- PROJETOS ADICIONAIS DO PORTFOLIO ---
    {
        id: "void",
        orientation: "vertical",
        subtitle: "DATA VISUALIZATION",
        title: "VOID GAZING",
        desc: "Translating cosmic radiation into visible spectrums.",
        longDesc: "A data-driven installation that visualizes real-time cosmic radiation data from open-source satellite feeds. The AI interprets numerical noise as fluid dynamics, creating a constantly shifting portrait of the invisible universe surrounding us.",
        credits: [
            { role: "Concept", name: "Brick Lab" },
            { role: "Code", name: "Mason Core" },
            { role: "Data", name: "NASA Open API" },
            { role: "Tech", name: "TouchDesigner + Python" }
        ],
        gradient: "from-neutral-950 to-brick-red/20",
        image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2694&auto=format&fit=crop",
        hasDetail: true
    },
    {
        id: "urban",
        orientation: "horizontal",
        subtitle: "PROCEDURAL ENV",
        title: "URBAN REEF",
        desc: "Growing cities like coral. Biological algorithms applied to architecture.",
        longDesc: "What if cities grew like organic organisms? Urban Reef uses biological growth algorithms to procedurally generate infinite cityscapes. The architecture is not designed, but 'grown', following rules of light seeking and structural integrity derived from coral reefs.",
        credits: [
            { role: "Architect", name: "J. Doe" },
            { role: "Sim", name: "Brick Core" },
            { role: "Render", name: "Redshift" },
            { role: "Tech", name: "Houdini + AI Texture" }
        ],
        gradient: "from-neutral-900 to-neutral-800",
        image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=2670&auto=format&fit=crop",
        hasDetail: true
    },
    {
        id: "silent",
        orientation: "horizontal",
        subtitle: "AUDIO REACTIVE",
        title: "SILENT ECHO",
        desc: "A visual narrative driven entirely by sub-bass frequencies.",
        longDesc: "Silent Echo is a music video where every visual element is triggered directly by audio analysis of sub-bass frequencies. The environment pulses, distorts, and rebuilds itself in perfect synchronization with the unseen rhythm, creating a synesthetic experience.",
        credits: [
            { role: "Band", name: "Low Freq" },
            { role: "Visuals", name: "Brick AI" },
            { role: "Engine", name: "Unreal 5" },
            { role: "Tech", name: "Real-time Audio Analysis" }
        ],
        gradient: "from-neutral-900 via-white/5 to-neutral-900",
        image: "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?q=80&w=2755&auto=format&fit=crop",
        hasDetail: true
    }
];

// ADICIONADO: L'ORÉAL para completar 9 itens
const CLIENTS = ["BBC", "RECORD TV", "STONE", "ALIEXPRESS", "KEETA", "VISA", "FACEBOOK", "O BOTICÁRIO", "L'ORÉAL"];

// --- GEMINI SERVICE ---
const chatWithMono = async (history: ChatMessage[], message: string) => {
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

// --- UTILS COMPONENTS ---
const ScrambleText = ({ text, className, hoverTrigger = false }: { text: string, className?: string, hoverTrigger?: boolean }) => {
    const [displayText, setDisplayText] = useState(text);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_!@#$%^&*";
    const intervalRef = useRef<number | null>(null);

    const scramble = () => {
        let iteration = 0;
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = window.setInterval(() => {
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
                if (intervalRef.current !== null) {
                    clearInterval(intervalRef.current);
                }
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

        // Pequeno delay para garantir que o React montou o DOM da nova rota
        setTimeout(() => {
            document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
        }, 100);

        return () => observer.disconnect();
    }, [view]);
};

const CustomCursor = ({ active }: { active: boolean }) => {
    const dotRef = useRef<HTMLDivElement>(null);
    const mouse = useRef({ x: -100, y: -100 });

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            mouse.current = { x: clientX, y: clientY };
            if (dotRef.current) {
                dotRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0) translate(-50%, -50%)`;
            }
        };

        window.addEventListener('mousemove', onMouseMove);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
        };
    }, []);

    return (
        <div 
            ref={dotRef} 
            className={`fixed top-0 left-0 w-2 h-2 bg-brick-red rounded-full pointer-events-none z-[9999] mix-blend-difference will-change-transform transition-opacity duration-200 ${active ? 'opacity-100' : 'opacity-0'}`} 
            style={{ transform: 'translate(-100px, -100px)' }} 
        />
    );
};

// --- COMPONENTS: MODAL DE PROJETO ---
const ProjectModal = ({ project, onClose }: { project: Work, onClose: () => void }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        setTimeout(() => setIsLoaded(true), 100);
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    if (!project) return null;

    // Layout Adaptativo sem Scroll
    const isHorizontal = project.orientation === 'horizontal';
    
    // Definição de Larguras e Proporções para Fit Screen
    const modalClasses = isHorizontal 
        ? 'max-w-7xl max-h-[85vh] aspect-[16/8] md:aspect-[16/7]' 
        : 'max-w-5xl max-h-[90vh] aspect-[9/16] md:aspect-auto';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/95 backdrop-blur-xl transition-opacity duration-500"
                onClick={onClose}
            ></div>

            {/* Container do Modal - Adaptativo sem scroll */}
            <div className={`relative w-full ${modalClasses} bg-neutral-900 border border-white/10 flex flex-col md:flex-row shadow-2xl animate-modal-in overflow-hidden`}>
                
                {/* Botão Fechar */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 text-white/50 hover:text-brick-red transition-colors p-2 mix-blend-difference"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>

                {/* Coluna Esquerda: Vídeo */}
                <div className={`w-full md:w-2/3 bg-black relative border-b md:border-b-0 md:border-r border-white/10 group overflow-hidden`}>
                     {/* O vídeo ocupa 100% da altura do pai (que é limitado pelo max-h do modal) */}
                    <div className="absolute inset-0 w-full h-full">
                        <div className="placeholder-video w-full h-full flex items-center justify-center relative">
                             <div 
                                className="absolute inset-0 opacity-40 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                                style={{ backgroundImage: `url('${project.image}')` }}
                             ></div>
                             
                             {/* Play Button */}
                             <div className="z-10 w-16 h-16 rounded-full border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:border-brick-red transition-all duration-300 cursor-pointer backdrop-blur-sm bg-black/30">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                             </div>

                             {/* Video Overlay Info */}
                             <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end text-[10px] font-mono tracking-widest text-white/50 pointer-events-none">
                                <span>RAW_FOOTAGE.mp4</span>
                                <span>{isHorizontal ? '16:9' : '9:16'} // 4K</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coluna Direita: Informações - COM SCROLL MANTIDO MAS INVISIVEL */}
                <div className="w-full md:w-1/3 bg-brick-black flex flex-col p-6 md:p-8 h-full overflow-y-auto scrollbar-hide">
                    
                    {/* Header do Info */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-1.5 h-1.5 bg-brick-red animate-pulse"></div>
                            <span className="text-[10px] font-mono text-brick-gray tracking-[0.2em] uppercase">{project.subtitle}</span>
                        </div>
                        
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tighter mb-4 leading-none">
                            {project.title}
                        </h2>
                    </div>

                    {/* Descrição - Sem clamp, com scroll */}
                    <div className="flex-1 py-4">
                        <p className="text-brick-white/80 font-light text-xs md:text-sm leading-relaxed">
                            {project.longDesc || project.desc}
                        </p>
                    </div>

                    {/* Ficha Técnica / Footer */}
                    <div className="border-t border-white/10 pt-4 mt-auto">
                        <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-brick-gray mb-3">System Data</h4>
                        <div className="space-y-2">
                            {project.credits && project.credits.map((credit, idx) => (
                                <div key={idx} className="flex justify-between items-baseline text-[10px] md:text-xs font-mono">
                                    <span className="text-brick-gray opacity-60 uppercase">{credit.role}</span>
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

// --- COMPONENTS: SECTIONS ---
const Header = ({ onChat, onWorks, onHome, isChatView }: { onChat: () => void, onWorks: () => void, onHome: () => void, isChatView: boolean }) => {
    const scrollToWorks = () => {
        const worksSection = document.getElementById('works');
        if (worksSection) {
            worksSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <header className="fixed top-0 left-0 w-full z-50 px-6 py-6 md:px-12 flex justify-between items-center bg-gradient-to-b from-brick-black/90 to-transparent backdrop-blur-sm pointer-events-none">
            <div onClick={onHome} className="pointer-events-auto flex items-center gap-2 group cursor-pointer select-none">
                <div className="font-black text-xl tracking-tighter text-white flex items-center gap-1">
                    <ScrambleText text="BRICK" hoverTrigger={true} />
                </div>
                <div className="flex items-baseline">
                    <span className="text-brick-red font-bold text-xl md:text-2xl animate-blink relative -top-[1px] mx-[2px]">_</span>
                    <span className="text-brick-gray font-semibold text-sm md:text-base tracking-widest group-hover:text-white transition-colors duration-500">AI</span>
                </div>
            </div>
            {!isChatView && (
                <div className="flex items-center gap-4 pointer-events-auto">
                    <MagneticButton onClick={onWorks} className="text-brick-gray hover:text-brick-red text-xs md:text-sm font-medium tracking-widest transition-colors duration-300 px-4 py-2">
                        WORKS
                    </MagneticButton>
                    
                    <MagneticButton onClick={onChat} className="bg-white/5 border border-white/10 backdrop-blur-md px-6 py-2 text-xs md:text-sm font-medium tracking-widest transition-all duration-300 hover:bg-brick-red hover:text-white hover:border-brick-red text-white">
                        TALK TO US
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
    
    // e: React.MouseEvent não funciona bem aqui pq estamos usando no div e o evento vem do onMouseMove do div. 
    // Mas para simplicidade, vamos tipar como any ou React.MouseEvent
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
                
                {/* Container Relativo para Posicionamento */}
                <div className="relative w-[140px] md:w-[160px] h-[40vh] md:h-[45vh]">
                    
                    {/* 1. VISUAL LAYER - O Monolito Animado */}
                    <div 
                        className={`monolith-structure w-full h-full rounded-[2px] flex items-center justify-center overflow-hidden shadow-2xl relative transition-transform duration-1000 ease-out pointer-events-none ${monolithHover ? 'scale-[1.02]' : 'scale-100'}`}
                        style={{ transform: 'translateZ(0)' }}
                    >
                        <div className="absolute inset-0 mix-blend-overlay monolith-texture bg-neutral-900 pointer-events-none"></div>
                        
                        <div className="centered-layer aura-atmos pointer-events-none opacity-50"></div>
                        <div className="centered-layer light-atmos animate-breathe pointer-events-none opacity-50"></div>
                        <div className="centered-layer core-atmos pointer-events-none"></div>

                        {/* SOFT RADIATION LAYER */}
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

                    {/* 2. SENSOR LAYER - A Zona de Interação Invisível */}
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
                <p className="text-lg md:text-2xl lg:text-3xl font-light tracking-[0.3em] text-brick-white/80 mb-2 md:mb-4">10 YEARS OF CRAFT.</p>
                <h2 className="text-3xl md:text-6xl lg:text-7xl font-black tracking-tighter text-brick-red drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                    <ScrambleText text="NOW GENERATIVE." />
                </h2>
                <p className="mt-12 text-brick-gray text-xs md:text-sm font-light tracking-[0.2em] uppercase opacity-60 max-w-md border-t border-white/10 pt-6">A new division by Brick.<br/>From zero to all since 2016.</p>
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brick-red/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
        </section>
    );
};

const Philosophy = () => (
    <section className="relative w-full py-32 bg-brick-black z-20 border-t border-white/5">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent -translate-x-1/2 hidden md:block"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
            <div className="mb-32 reveal flex flex-col items-center">
                <div className="w-2 h-2 bg-brick-red rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)] mb-6"></div>
                <span className="text-xs font-mono tracking-[0.3em] text-brick-gray uppercase bg-brick-black px-4">The Belief</span>
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
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6 transition-colors duration-500 group-hover:text-brick-red">{title}</h2>
        <p className="text-lg md:text-xl text-brick-gray font-light max-w-lg leading-relaxed group-hover:text-white transition-colors duration-300">{text}</p>
    </div>
);

const WorkCard = ({ work, index, onOpen }: { work: Work, index: number, onOpen: (work: Work) => void }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const bgRef = useRef<HTMLDivElement>(null);

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
                bgRef.current.style.transform = `scale(1.2) translate3d(0, ${yOffset}px, 0)`;
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
    }, []);

    return (
        <div 
            ref={containerRef} 
            onClick={() => work.hasDetail && onOpen(work)}
            className={`reveal w-full min-h-[40vh] md:min-h-[50vh] relative flex items-center group overflow-hidden border-b border-black ${work.hasDetail ? 'cursor-pointer' : 'cursor-default'}`} 
            style={{ transitionDelay: `${index * 100}ms` }}
        >
            <div ref={bgRef} className="absolute inset-0 opacity-50 mix-blend-overlay will-change-transform" style={{ backgroundImage: `url('${work.image}')`, backgroundSize: 'cover', backgroundPosition: 'center', transform: 'scale(1.2)' }}></div>
            <div className={`absolute inset-0 bg-gradient-to-r ${work.gradient} opacity-50 transition-opacity duration-700 group-hover:opacity-80 z-10`}></div>
            <div className="relative z-20 px-6 md:px-12 lg:px-24 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pointer-events-none">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="block text-brick-red text-xs font-bold tracking-[0.2em]">{work.subtitle}</span>
                        {work.hasDetail && <div className="w-1.5 h-1.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>}
                    </div>
                    <h3 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white mb-2 group-hover:translate-x-4 transition-transform duration-500">{work.title}</h3>
                </div>
                <p className="text-brick-gray text-sm md:text-lg font-light max-w-sm text-left md:text-right group-hover:text-white transition-colors duration-300">{work.desc}</p>
            </div>
        </div>
    );
};

const SelectedWorks = ({ onSelectProject }: { onSelectProject: (work: Work) => void }) => (
    <section id="works" className="w-full pt-24 pb-0 bg-brick-black border-t border-white/5">
        <div className="px-6 md:px-12 lg:px-24 mb-16 reveal">
            <h2 className="text-sm md:text-base font-bold tracking-[0.3em] text-brick-gray uppercase">Selected Works</h2>
        </div>
        <div className="flex flex-col w-full gap-0">
            {/* Exibe apenas os 3 primeiros na Home */}
            {WORKS.slice(0, 3).map((work, idx) => <WorkCard key={idx} work={work} index={idx} onOpen={onSelectProject} />)}
        </div>
    </section>
);

const Legacy = () => (
    <section className="w-full py-32 px-6 md:px-12 lg:px-24 bg-brick-white text-brick-black relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto reveal">
            <h2 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-20 leading-[0.85]">BACKED <br className="md:hidden"/> BY BRICK.</h2>
            
            <div className="flex flex-col lg:flex-row gap-20 border-t-4 border-brick-black pt-16">
                
                {/* Coluna da Esquerda: Texto Intro */}
                <div className="lg:w-1/2">
                    <p className="text-xl md:text-2xl font-light leading-tight max-w-lg">
                        This isn't a beta test. This is a new lens from a production house with 10 years of experience.
                    </p>
                </div>
                
                {/* Coluna da Direita: Lista de Clientes */}
                <div className="lg:w-1/2">
                    <h4 className="text-xs font-bold tracking-[0.2em] uppercase mb-12 text-neutral-400 border-b border-neutral-200 pb-4 inline-block">Trusted By</h4>
                    
                    {/* Grid 3x3 Perfeito, mais compacto e simétrico */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10 w-full">
                        {CLIENTS.map((client, i) => (
                            <div key={i} className="flex items-start justify-start group">
                                <span className="text-base md:text-lg font-black text-neutral-300 group-hover:text-brick-black transition-colors duration-300 cursor-default tracking-tighter uppercase whitespace-nowrap">
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

const Footer = ({ onChat }: { onChat: () => void }) => (
    <footer className="w-full py-32 px-6 md:px-12 lg:px-24 bg-black border-t border-white/5 relative z-10">
        <div className="flex flex-col items-center text-center gap-12 reveal">
            <h2 className="text-sm md:text-base font-mono text-brick-gray tracking-widest uppercase">Have a complex problem?</h2>
            <p className="text-4xl md:text-6xl lg:text-8xl font-black text-white tracking-tighter leading-none max-w-5xl">WE HAVE THE INTELLIGENCE.</p>
            <MagneticButton onClick={onChat} className="mt-8 bg-brick-red text-white px-12 py-4 text-lg font-bold tracking-widest hover:bg-white hover:text-brick-black transition-all duration-300 rounded-sm">TALK TO US</MagneticButton>
        </div>
        <div className="mt-24 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-[0.2em] text-brick-gray/40 font-bold border-t border-white/5 pt-8 w-full">
            <span>&copy; 2025 Brick AI.</span>
            <span className="hidden md:inline">The Generative Division</span>
            <span>All Rights Reserved.</span>
        </div>
    </footer>
);

const SystemChat = ({ onBack }: { onBack: () => void }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'mono', content: `SYSTEM ONLINE. I am ${AI_NAME}. I organize the chaos into visuals.` },
        { role: 'mono', content: "Select a protocol or transmit your query." }
    ]);
    const [input, setInput] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
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
            <button 
                onClick={onBack}
                className="fixed top-24 left-6 md:left-12 text-brick-gray hover:text-white text-[10px] tracking-widest uppercase transition-colors z-50 flex items-center gap-2 group"
            >
                <span className="text-brick-red group-hover:-translate-x-1 transition-transform">&lt;</span> RETURN TO SURFACE
            </button>

            <div className="relative mb-8 shrink-0 z-10 animate-fade-in-up">
                <div className="monolith-structure w-[100px] h-[25vh] md:w-[120px] md:h-[30vh] rounded-[2px] flex items-center justify-center overflow-hidden shadow-2xl relative">
                    <div className="absolute inset-0 mix-blend-overlay monolith-texture bg-neutral-900 pointer-events-none"></div>
                    <div className="centered-layer aura-atmos pointer-events-none opacity-50"></div>
                    <div className={`centered-layer light-atmos pointer-events-none transition-all duration-500 ${isProcessing ? 'animate-thinking bg-brick-red opacity-100' : 'animate-breathe opacity-50'}`}></div>
                    <div className="centered-layer core-atmos pointer-events-none"></div>
                    <div className="absolute inset-0 border border-white/5 opacity-50 pointer-events-none z-10"></div>
                </div>
                <div className="text-center mt-6 text-brick-red text-[10px] tracking-[0.3em] uppercase opacity-70 animate-pulse">
                    {isProcessing ? "ANALYZING INPUT..." : `${AI_NAME} ONLINE`}
                </div>
            </div>

            <div className="w-full max-w-2xl px-6 flex-1 flex flex-col z-10">
                <div className="flex-1 overflow-y-auto mb-6 space-y-6 scrollbar-hide min-h-[30vh]">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} opacity-0 animate-[terminal-blink_0.5s_ease-out_forwards]`} style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
                            <span className="text-[10px] text-neutral-600 mb-2 uppercase tracking-widest font-bold">
                                {msg.role === 'user' ? 'CLIENT_TERMINAL' : 'MASON_CORE'}
                            </span>
                            <div className={`max-w-lg p-6 text-sm md:text-base leading-relaxed border backdrop-blur-sm shadow-lg ${msg.role === 'user' ? 'border-white/10 text-white bg-white/5' : 'border-brick-red/20 text-brick-white bg-black/60'}`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isProcessing && (
                        <div className="flex flex-col items-start">
                            <span className="text-[10px] text-neutral-600 mb-2 uppercase tracking-widest font-bold">MASON_CORE</span>
                            <div className="typing-indicator text-brick-red text-xl tracking-widest pl-4">
                                <span>.</span><span>.</span><span>.</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {!isProcessing && messages.length < 4 && (
                    <div className="flex flex-wrap justify-center gap-3 mb-6 animate-fade-in-up">
                        {SUGGESTIONS.map((query, i) => (
                            <button 
                                key={i}
                                onClick={() => handleSend(query)}
                                className="text-[10px] uppercase tracking-wider text-brick-gray border border-white/10 bg-white/5 px-4 py-2 hover:bg-white hover:text-black hover:border-white transition-all duration-300"
                            >
                                {query}
                            </button>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSend} className="relative group border-t border-white/10 pt-6">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`ASK ${AI_NAME}...`}
                        className="w-full bg-transparent py-4 text-white font-mono text-sm md:text-base focus:outline-none placeholder:text-neutral-700 placeholder:tracking-widest"
                        autoFocus
                    />
                    <button 
                        type="submit"
                        className="absolute right-0 top-6 bottom-0 text-[10px] text-neutral-500 hover:text-brick-red uppercase tracking-[0.2em] transition-colors"
                    >
                        TRANSMIT
                    </button>
                </form>
            </div>
        </div>
    );
};

const WorksPage = ({ onChat, onWorks, onHome, onSelectProject }: { onChat: () => void, onWorks: () => void, onHome: () => void, onSelectProject: (work: Work) => void }) => {
    return (
        <React.Fragment>
            <Header onChat={onChat} onWorks={onWorks} onHome={onHome} isChatView={false} />
            <main className="pt-32">
                <section className="w-full px-6 md:px-12 lg:px-24 mb-12 reveal">
                     <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6">FULL PORTFOLIO.</h1>
                     <p className="text-brick-gray text-lg font-light tracking-wide max-w-xl">
                        A complete archive of our generative explorations and commercial productions.
                     </p>
                </section>
                <div className="flex flex-col w-full gap-0 border-t border-white/5">
                    {WORKS.map((work, idx) => <WorkCard key={idx} work={work} index={idx} onOpen={onSelectProject} />)}
                </div>
            </main>
            <Footer onChat={onChat} />
        </React.Fragment>
    );
}

const HomePage = ({ onChat, onSelectProject, onWorks, onHome, setMonolithHover, monolithHover }: { onChat: () => void, onSelectProject: (work: Work) => void, onWorks: () => void, onHome: () => void, setMonolithHover: (v: boolean) => void, monolithHover: boolean }) => (
    <React.Fragment>
        <Header onChat={onChat} onWorks={onWorks} onHome={onHome} isChatView={false} />
        <main>
            <Hero setMonolithHover={setMonolithHover} monolithHover={monolithHover} />
            <Philosophy />
            <SelectedWorks onSelectProject={onSelectProject} />
            <Legacy />
        </main>
        <Footer onChat={onChat} />
    </React.Fragment>
);

const App = () => {
    const [view, setView] = useState('home'); 
    const [monolithHover, setMonolithHover] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Work | null>(null);

    // Navigation handlers
    const goHome = () => setView('home');
    const goWorks = () => setView('works');
    const goChat = () => setView('chat');

    useScrollReveal(view);

    return (
        <div className="min-h-screen bg-brick-black text-brick-white selection:bg-brick-red selection:text-white font-sans">
            <div className="noise-overlay"></div>
            <div className="vignette-overlay"></div> 
            <CustomCursor active={monolithHover || selectedProject !== null} />
            
            {/* MODAL DE PROJETO (Global) */}
            {selectedProject && (
                <ProjectModal 
                    project={selectedProject} 
                    onClose={() => setSelectedProject(null)} 
                />
            )}
            
            {view === 'home' && (
                <HomePage 
                    onChat={goChat} 
                    onWorks={goWorks}
                    onHome={goHome}
                    onSelectProject={setSelectedProject}
                    setMonolithHover={setMonolithHover} 
                    monolithHover={monolithHover} 
                />
            )}
            
            {view === 'works' && (
                <WorksPage 
                    onChat={goChat} 
                    onWorks={goWorks}
                    onHome={goHome}
                    onSelectProject={setSelectedProject}
                />
            )}

            {view === 'chat' && (
                <React.Fragment>
                    <Header onChat={goChat} onWorks={goWorks} onHome={goHome} isChatView={true} />
                    <SystemChat onBack={goHome} />
                </React.Fragment>
            )}
        </div>
    );
};

// Mount
const rootElement = document.getElementById('root');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
}
