import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const Carlo = () => {
    const containerRef = useRef(null);
    const charRef = useRef(null);
    const bgRef = useRef(null);

    useGSAP(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "+=350%",
                scrub: true,
                pin: true,
            }
        });

        // 1. Background deepens/fades
        tl.to(bgRef.current, {
            opacity: 0.9, // Lower opacity makes text pop more (Contrast Rule)
            scale: 1.1,   // Subtle zoom for dynamism
            ease: "none"
        }, 0);

        // 2. Character rises
        tl.fromTo(charRef.current,
            { y: "100%", opacity: 0 },
            { y: "0%", opacity: 1, ease: "power2.out" }, // power2.out feels more natural/physics-based
            0 
        );

        // 3. Text Expansion Effect (New UI Polish)
        // Instead of just fading in, the text also scales down slightly into place
        tl.fromTo(".text-anim",
            { opacity: 0, scale: 1.1 },
            { opacity: 1, scale: 1, ease: "power2.out" },
            0.1 // Slight delay after character starts moving
        );

    }, { scope: containerRef });

    // --- STYLES ---
    
    // Stroke style for the front layer
    const strokeStyle = {
        WebkitTextStroke: "2px white", // Thicker stroke for better legibility against busy images
        color: "transparent"
    };

    // --- COMPONENT STRUCTURE ---
    // We create a reusable "TextGroup" component so we don't repeat code for Back/Front layers
    const TextGroup = ({ isOutline = false }) => (
        <div className={`flex flex-col items-center justify-center w-full h-full text-center ${isOutline ? 'z-20 pointer-events-none' : 'z-0'}`}>
            
            {/* 1. The Intro - Small, Wide, Elegant */}
            <h2 
                className={`text-anim text-white uppercase tracking-[0.5em] text-sm md:text-2xl font-bold mb-[4vh] relative z-10 ${isOutline ? 'opacity-0' : ''}`} // Hide intro on outline layer to avoid double blur
                style={isOutline ? strokeStyle : {}}
            >
                Welcome to my
            </h2>

            {/* 2. The Hero - Massive, Tight, Dominant */}
            {/* leading-none fixes the gap above/below huge text */}
            <h1 
                className="text-anim text-white font-Gamer uppercase mb-[10vh] text-[15vw] md:text-[18vw] leading-[0.8] tracking-tighter"
                style={isOutline ? strokeStyle : {}}
            >
                PARADOX
            </h1>

            {/* 3. The Tagline - Bottom grounded */}
            <h3 
                className={`text-anim text-white absolute bottom-[29vh] right-[10vw] font-sans font-light tracking-widest text-xs md:text-lg mt-[14vh] opacity-80 ${isOutline ? 'opacity-0' : ''}`}
                style={isOutline ? strokeStyle : {}}
            >
                WHERE GAMERS RULE THE WORLD
            </h3>
        </div>
    );

    return (
        <div ref={containerRef} className="relative h-screen w-full bg-black overflow-hidden flex flex-col items-center justify-center">
            
            {/* LAYER 1: Background */}
            <div className="absolute inset-0 z-0">
                <img
                    ref={bgRef}
                    src="/back.jpeg"
                    alt="Background"
                    className="w-full h-full object-cover opacity-60"
                />
                {/* Gradient Overlay for better text readability (Crucial UX rule) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
            </div>

            {/* LAYER 2: Back Text (Solid) */}
            <div className="absolute inset-0 flex items-center justify-center z-0">
                <TextGroup isOutline={false} />
            </div>

            {/* LAYER 3: Character */}
            {/* Align to bottom, but allow overlap with center text */}
            <div ref={charRef} className="absolute bottom-0 z-10 w-full md:w-[50vw] h-[90vh] flex items-end justify-center pointer-events-none">
                <img 
                    src="/me.png" 
                    alt="Character" 
                    className="h-full object-contain object-bottom drop-shadow-2xl" 
                />
            </div>

            {/* LAYER 4: Front Text (Outline) */}
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <TextGroup isOutline={true} />
            </div>

        </div>
    );
};

export default Carlo;