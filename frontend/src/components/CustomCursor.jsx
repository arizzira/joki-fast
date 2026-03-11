import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        // Update posisi X dan Y
        const updateMousePosition = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        // Cek apakah mouse lagi hover di atas tombol atau link
        const handleMouseOver = (e) => {
            if (
                e.target.tagName === 'A' ||
                e.target.tagName === 'BUTTON' ||
                e.target.closest('a') ||
                e.target.closest('button')
            ) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', updateMousePosition);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, []);

    // Animasi Framer Motion untuk Kursor
    const variants = {
        default: {
            x: mousePosition.x - 16, // Dikurangi setengah ukuran w-8 (32px) biar pas di tengah
            y: mousePosition.y - 16,
            scale: 1,
        },
        hover: {
            x: mousePosition.x - 16,
            y: mousePosition.y - 16,
            scale: 1.8, // Membesar pas hover tombol
            backgroundColor: "rgba(37, 99, 235, 0.1)", // Biru transparan
            border: "1px solid rgba(37, 99, 235, 0.8)",
        }
    };

    return (
        <motion.div
            className="fixed top-0 left-0 w-8 h-8 bg-blue-600/20 border border-blue-600/40 rounded-full pointer-events-none z-[9999] backdrop-blur-[2px] hidden md:block"
            variants={variants}
            animate={isHovering ? "hover" : "default"}
            transition={{
                type: "tween",
                ease: "easeOut",
                duration: 0.15 // Kecepatan ngikutin mouse (bikin efek "keseret" dikit)
            }}
        />
    );
}