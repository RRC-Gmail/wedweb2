import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const Gallery = () => {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState(null);

    useEffect(() => {
        const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setPhotos(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const openLightbox = (index) => setSelectedIndex(index);
    const closeLightbox = () => setSelectedIndex(null);
    const goNext = () => setSelectedIndex(prev => (prev + 1) % photos.length);
    const goPrev = () => setSelectedIndex(prev => (prev - 1 + photos.length) % photos.length);

    useEffect(() => {
        const handleKey = (e) => {
            if (selectedIndex === null) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') goNext();
            if (e.key === 'ArrowLeft') goPrev();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [selectedIndex, photos.length]);

    if (loading) return <p className="text-stone-500 font-light text-center py-12">Cargando galería...</p>;

    if (photos.length === 0) {
        return (
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-serif text-stone-800 mb-2 text-center">Galería</h2>
                <p className="text-stone-500 font-light mb-8 text-center">Fotos de nuestra boda</p>
                <div className="bg-white p-12 rounded-xl shadow-sm text-center border-dashed border-2 border-stone-200">
                    <p className="text-stone-500 font-light">Aún no hay fotos en la galería. Pronto subiremos recuerdos.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-serif text-stone-800 mb-2 text-center">Galería</h2>
            <p className="text-stone-500 font-light mb-8 text-center">Fotos de nuestra boda</p>

            {/* Photo Grid */}
            <div className="columns-2 md:columns-3 gap-4 space-y-4">
                {photos.map((photo, index) => (
                    <motion.div
                        key={photo.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="break-inside-avoid cursor-pointer group"
                        onClick={() => openLightbox(index)}
                    >
                        <div className="rounded-xl overflow-hidden shadow-sm border border-stone-100 relative">
                            <img
                                src={photo.url}
                                alt={photo.caption || 'Foto de la boda'}
                                className="w-full h-auto group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                            />
                            {photo.caption && (
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-white text-xs font-light">{photo.caption}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedIndex !== null && photos[selectedIndex] && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                        onClick={closeLightbox}
                    >
                        <button onClick={(e) => { e.stopPropagation(); closeLightbox(); }} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10">
                            <X size={28} />
                        </button>

                        <button onClick={(e) => { e.stopPropagation(); goPrev(); }} className="absolute left-4 text-white/70 hover:text-white transition-colors z-10">
                            <ChevronLeft size={36} />
                        </button>

                        <motion.img
                            key={selectedIndex}
                            src={photos[selectedIndex].url}
                            alt={photos[selectedIndex].caption || ''}
                            className="max-w-full max-h-[85vh] object-contain rounded-lg"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        />

                        <button onClick={(e) => { e.stopPropagation(); goNext(); }} className="absolute right-4 text-white/70 hover:text-white transition-colors z-10">
                            <ChevronRight size={36} />
                        </button>

                        {photos[selectedIndex].caption && (
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm font-light bg-black/50 px-4 py-2 rounded-full">
                                {photos[selectedIndex].caption}
                            </div>
                        )}

                        <div className="absolute bottom-4 right-4 text-white/50 text-xs">
                            {selectedIndex + 1} / {photos.length}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Gallery;
