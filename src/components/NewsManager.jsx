import React, { useState } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const NewsManager = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !content) return;

        setLoading(true);
        setMessage('');

        try {
            await addDoc(collection(db, 'news'), {
                title,
                content,
                createdAt: serverTimestamp()
            });
            setTitle('');
            setContent('');
            setMessage('¡Noticia publicada con éxito!');

            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error(err);
            setMessage('Hubo un error al publicar la noticia.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-sm rounded-xl p-6 max-w-2xl">
            <h2 className="text-2xl font-serif text-slate-800 mb-2">Publicar Noticias</h2>
            <p className="text-slate-500 font-light mb-6 text-sm">
                Lo que publiques aquí aparecerá inmediatamente en el tablón de invitados.
            </p>

            {message && (
                <div className={`p-3 rounded mb-6 text-sm ${message.includes('error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Título de la Noticia</label>
                    <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full border-b border-slate-300 py-2 focus:outline-none focus:border-slate-800 transition-colors bg-white font-medium"
                        placeholder="Ej. ¡Habrá autobuses disponibles!"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Contenido / Detalles</label>
                    <textarea
                        required
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows="5"
                        className="w-full border border-slate-300 rounded-md p-3 focus:outline-none focus:border-slate-800 transition-colors bg-white mt-2 resize-none text-sm font-light text-slate-600"
                        placeholder="Escribe aquí los detalles..."
                    ></textarea>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-800 text-white tracking-widest uppercase text-sm font-medium py-3 rounded hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                    {loading ? 'Publicando...' : 'Publicar Noticia'}
                </button>
            </form>
        </div>
    );
};

export default NewsManager;
