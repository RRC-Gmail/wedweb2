import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { motion } from 'framer-motion';

const GuestDashboard = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNews(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="max-w-4xl mx-auto">
            {/* News Feed Section */}
            <section>
                <h2 className="text-3xl font-serif text-slate-800 mb-8 text-center border-b border-slate-200 pb-4">Tablón de Noticias</h2>

                {loading ? (
                    <p className="text-slate-500 font-light text-center">Cargando noticias...</p>
                ) : news.length > 0 ? (
                    <div className="space-y-6">
                        {news.map((item, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                key={item.id}
                                className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-stone-500"></div>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
                                    <h3 className="text-xl font-medium text-slate-800">{item.title}</h3>
                                    <span className="text-xs uppercase tracking-widest text-slate-400 font-medium">
                                        {item.createdAt?.toDate().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                                <p className="text-slate-600 font-light leading-relaxed whitespace-pre-wrap">
                                    {item.content}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-12 rounded-xl shadow-sm text-center border-dashed border-2 border-slate-200">
                        <p className="text-slate-500 font-light">Por el momento no hay noticias destacadas.</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default GuestDashboard;
