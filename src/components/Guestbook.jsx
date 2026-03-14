import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '../firebase/config';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { ImagePlus, X } from 'lucide-react';

const Guestbook = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaPreview, setMediaPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const { currentUser } = useAuth();
    const fileInputRef = useRef(null);

    useEffect(() => {
        const q = query(collection(db, 'guestbook'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(data);
        }, (err) => {
            console.error("Firestore read error:", err);
            setError("No se pudieron cargar los mensajes.");
        });
        return () => unsubscribe();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Basic validation (limit to 20MB for videos/images)
            if (file.size > 20 * 1024 * 1024) {
                setError("El archivo es demasiado grande. Máximo 20 MB.");
                return;
            }
            setMediaFile(file);
            setMediaPreview(URL.createObjectURL(file));
            setError('');
        }
    };

    const clearMedia = () => {
        setMediaFile(null);
        setMediaPreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || (!currentUser && !authorName.trim())) return;

        setLoading(true);
        setError('');
        setUploadProgress(0);

        try {
            let mediaUrl = null;
            let mediaType = null;

            if (mediaFile) {
                // Determine path and type
                const fileExt = mediaFile.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                const storageRef = ref(storage, `guestbook/${fileName}`);
                mediaType = mediaFile.type.startsWith('video/') ? 'video' : 'image';

                // Upload with progress
                const uploadTask = uploadBytesResumable(storageRef, mediaFile);

                // Wrap upload in promise to wait for completion
                await new Promise((resolve, reject) => {
                    uploadTask.on(
                        'state_changed',
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            setUploadProgress(progress);
                        },
                        (error) => {
                            console.error("Storage upload error:", error);
                            reject(error);
                        },
                        async () => {
                            mediaUrl = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve();
                        }
                    );
                });
            }

            await addDoc(collection(db, 'guestbook'), {
                text: newMessage,
                authorId: currentUser?.uid || 'guest',
                authorEmail: currentUser?.email || authorName.trim(),
                mediaUrl,
                mediaType,
                createdAt: serverTimestamp()
            });

            setNewMessage('');
            setAuthorName('');
            clearMedia();
        } catch (err) {
            console.error("Error al guardar mensaje:", err);
            setError("Error al guardar: " + err.message);
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-serif text-stone-800 mb-2 text-center">Libro de Firmas</h2>
            <p className="text-stone-500 font-light mb-8 text-center">Déjale un mensaje, foto o vídeo a los novios</p>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm text-center">{error}</div>}

            <form onSubmit={handleSubmit} className="bg-stone-50 p-6 rounded-xl shadow-sm mb-8 border border-stone-200">
                {!currentUser && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-stone-700 mb-1">Tu Nombre</label>
                        <input
                            type="text"
                            required
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            className="w-full border border-stone-300 rounded-md p-3 focus:outline-none focus:border-stone-800 transition-colors bg-white font-medium text-stone-800"
                            placeholder="Ej. Familia Martínez"
                        />
                    </div>
                )}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-stone-700 mb-1">Tu Mensaje</label>
                    <textarea
                        required
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        rows="3"
                        className="w-full border border-stone-300 rounded-md p-4 focus:outline-none focus:border-stone-800 transition-colors resize-none text-stone-700 bg-white"
                        placeholder="Escribe tus mejores deseos aquí..."
                    ></textarea>
                </div>

                {/* Media Preview */}
                {mediaPreview && (
                    <div className="mb-4 relative inline-block">
                        {mediaFile?.type.startsWith('video/') ? (
                            <video src={mediaPreview} className="h-32 rounded object-cover border border-stone-200" controls />
                        ) : (
                            <img src={mediaPreview} alt="Preview" className="h-32 rounded object-cover border border-stone-200" />
                        )}
                        <button
                            type="button"
                            onClick={clearMedia}
                            className="absolute -top-2 -right-2 bg-stone-800 text-white rounded-full p-1 hover:bg-stone-600 transition-colors shadow-md"
                        >
                            <X size={14} />
                        </button>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">

                    <div>
                        <input
                            type="file"
                            accept="image/*,video/mp4,video/quicktime"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            className="hidden"
                            id="media-upload"
                        />
                        <label
                            htmlFor="media-upload"
                            className="flex items-center gap-2 text-stone-600 hover:text-stone-800 cursor-pointer text-sm font-medium px-4 py-2 border border-stone-200 bg-white rounded transition-colors"
                        >
                            <ImagePlus size={18} />
                            Añadir Foto o Vídeo
                        </label>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {loading && uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="text-xs text-stone-500 w-full sm:w-24 text-right">
                                Subiendo... {Math.round(uploadProgress)}%
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto px-8 py-2 bg-stone-800 text-stone-50 tracking-widest uppercase text-sm font-medium rounded hover:bg-stone-700 transition-colors disabled:opacity-50 shadow-sm whitespace-nowrap"
                        >
                            {loading ? (uploadProgress > 0 ? 'Guardando...' : 'Enviando...') : 'Dejar Mensaje'}
                        </button>
                    </div>
                </div>
            </form>

            <div className="space-y-6">
                {messages.map((msg, index) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={msg.id}
                        className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 flex flex-col md:flex-row gap-6"
                    >
                        {msg.mediaUrl && (
                            <div className="w-full md:w-1/3 shrink-0 rounded overflow-hidden shadow-sm border border-stone-100 bg-stone-50 flex items-center justify-center min-h-[160px]">
                                {msg.mediaType === 'video' ? (
                                    <video src={msg.mediaUrl} controls className="w-full h-full max-h-64 object-contain" />
                                ) : (
                                    <img src={msg.mediaUrl} alt="Foto del invitado" className="w-full h-full max-h-64 object-contain" />
                                )}
                            </div>
                        )}
                        <div className="flex-1 flex flex-col justify-center">
                            <p className="text-stone-600 font-light text-lg italic leading-relaxed mb-4">"{msg.text}"</p>
                            <div className="text-right">
                                <span className="text-sm font-medium text-stone-800 tracking-wide block">
                                    — {msg.authorEmail}
                                </span>
                                <span className="text-xs text-stone-400">
                                    {msg.createdAt ? msg.createdAt.toDate().toLocaleDateString() : 'Justo ahora'}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Guestbook;
