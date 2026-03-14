import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const images = [
    '/images/IMG_0365.jpg',
    '/images/IMG_0925.jpg',
    '/images/IMG_1197.jpg',
    '/images/IMG_3678.jpg'
];

const Hero = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Rotate images every 4 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full min-h-screen bg-stone-50 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full grid md:grid-cols-2 gap-12 items-center">

                {/* Photo Gallery Frame (Smaller Images) */}
                <div className="relative w-full aspect-[4/5] rounded-t-full rounded-b-xl overflow-hidden shadow-2xl border-8 border-white bg-white">
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={currentIndex}
                            src={images[currentIndex]}
                            alt="Los Novios"
                            className="absolute inset-0 w-full h-full object-cover"
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                        />
                    </AnimatePresence>
                </div>

                {/* Typography & Content */}
                <div className="text-center md:text-left flex flex-col justify-center">
                    <span className="text-sm md:text-base tracking-[0.3em] uppercase mb-4 block font-medium text-stone-500">Nos Casamos</span>
                    <h1 className="text-5xl md:text-7xl font-serif mb-6 leading-tight text-stone-800">
                        Reserva <br />la fecha
                    </h1>
                    <div className="w-16 h-px bg-stone-300 mb-6 mx-auto md:mx-0"></div>
                    <p className="text-2xl font-light tracking-widest mb-10 text-stone-600 uppercase">
                        19 · Septiembre · 2026
                    </p>

                    <Link to="/dashboard" className="inline-block px-8 py-3 bg-stone-800 hover:bg-stone-700 text-white tracking-widest uppercase text-sm transition-all duration-300 rounded-sm shadow-md text-center max-w-xs mx-auto md:mx-0">
                        Entrar a la Web
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default Hero;
