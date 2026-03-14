import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '../firebase/config';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { ImagePlus, Trash2, Upload, X } from 'lucide-react';

const GalleryManager = () => {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [caption, setCaption] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setPhotos(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleFilesChange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(f => {
            if (f.size > 20 * 1024 * 1024) return false;
            if (!f.type.startsWith('image/')) return false;
            return true;
        });

        setSelectedFiles(validFiles);
        setPreviews(validFiles.map(f => URL.createObjectURL(f)));
    };

    const clearFiles = () => {
        previews.forEach(p => URL.revokeObjectURL(p));
        setSelectedFiles([]);
        setPreviews([]);
        setCaption('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (selectedFiles.length === 0) return;

        setUploading(true);
        setUploadProgress(0);

        try {
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                const storageRef = ref(storage, `gallery/${fileName}`);

                const uploadTask = uploadBytesResumable(storageRef, file);

                await new Promise((resolve, reject) => {
                    uploadTask.on(
                        'state_changed',
                        (snapshot) => {
                            const fileProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            const totalProgress = ((i / selectedFiles.length) + (fileProgress / 100 / selectedFiles.length)) * 100;
                            setUploadProgress(totalProgress);
                        },
                        reject,
                        async () => {
                            const url = await getDownloadURL(uploadTask.snapshot.ref);
                            await addDoc(collection(db, 'gallery'), {
                                url,
                                storagePath: `gallery/${fileName}`,
                                caption: caption || '',
                                uploadedBy: 'admin',
                                createdAt: serverTimestamp()
                            });
                            resolve();
                        }
                    );
                });
            }
            clearFiles();
        } catch (err) {
            console.error('Error subiendo fotos:', err);
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDelete = async (photo) => {
        if (!window.confirm('¿Eliminar esta foto de la galería?')) return;
        try {
            if (photo.storagePath) {
                const storageRef = ref(storage, photo.storagePath);
                await deleteObject(storageRef).catch(() => {});
            }
            await deleteDoc(doc(db, 'gallery', photo.id));
        } catch (err) {
            console.error('Error eliminando foto:', err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white shadow-sm rounded-xl p-6">
                <h2 className="text-2xl font-serif text-slate-800 mb-2">Gestionar Galería</h2>
                <p className="text-slate-500 font-light mb-6 text-sm">
                    Sube fotos de la boda para que los invitados las vean en la galería.
                </p>

                {/* Upload Form */}
                <form onSubmit={handleUpload} className="bg-stone-50 rounded-xl p-6 border border-stone-200 mb-8">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-stone-700 mb-1">Descripción (opcional)</label>
                        <input
                            type="text"
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            className="w-full border border-stone-300 rounded-md p-3 focus:outline-none focus:border-stone-800 transition-colors bg-white text-sm"
                            placeholder="Ej. Preparativos, Ceremonia, Banquete..."
                        />
                    </div>

                    {/* File Selection */}
                    <div className="mb-4">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFilesChange}
                            ref={fileInputRef}
                            className="hidden"
                            id="gallery-upload"
                        />
                        <label
                            htmlFor="gallery-upload"
                            className="flex items-center justify-center gap-2 w-full py-8 border-2 border-dashed border-stone-300 rounded-xl cursor-pointer hover:border-stone-500 hover:bg-stone-100 transition-colors text-stone-500"
                        >
                            <ImagePlus size={24} />
                            <span className="text-sm font-medium">Seleccionar fotos (max 20MB cada una)</span>
                        </label>
                    </div>

                    {/* Previews */}
                    {previews.length > 0 && (
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-stone-600">{selectedFiles.length} foto(s) seleccionada(s)</span>
                                <button type="button" onClick={clearFiles} className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1">
                                    <X size={14} /> Limpiar
                                </button>
                            </div>
                            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                                {previews.map((p, i) => (
                                    <img key={i} src={p} alt="" className="w-full aspect-square object-cover rounded-lg border border-stone-200" />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Upload Progress */}
                    {uploading && (
                        <div className="mb-4">
                            <div className="w-full bg-stone-200 rounded-full h-2">
                                <div className="bg-stone-800 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                            <p className="text-xs text-stone-500 mt-1 text-center">Subiendo... {Math.round(uploadProgress)}%</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={uploading || selectedFiles.length === 0}
                        className="w-full flex items-center justify-center gap-2 bg-stone-800 text-white tracking-widest uppercase text-sm font-medium py-3 rounded hover:bg-stone-700 transition-colors disabled:opacity-50"
                    >
                        <Upload size={16} />
                        {uploading ? 'Subiendo...' : 'Subir Fotos'}
                    </button>
                </form>

                {/* Existing Photos */}
                <h3 className="text-lg font-medium text-slate-800 mb-4">Fotos Subidas ({photos.length})</h3>
                {loading ? (
                    <p className="text-slate-500 text-center py-8">Cargando galería...</p>
                ) : photos.length === 0 ? (
                    <p className="text-slate-500 text-center py-8 font-light">No hay fotos en la galería todavía.</p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {photos.map((photo) => (
                            <div key={photo.id} className="relative group rounded-xl overflow-hidden shadow-sm border border-stone-100">
                                <img src={photo.url} alt={photo.caption || ''} className="w-full aspect-square object-cover" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                                    <div className="w-full p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                                        {photo.caption && <p className="text-white text-xs mb-2">{photo.caption}</p>}
                                        <button
                                            onClick={() => handleDelete(photo)}
                                            className="flex items-center gap-1 text-xs text-red-300 hover:text-red-100 transition-colors"
                                        >
                                            <Trash2 size={12} /> Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GalleryManager;
