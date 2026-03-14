import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { Download, Trash2, FileText, Image } from 'lucide-react';

const GuestbookExport = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        const q = query(collection(db, 'guestbook'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setMessages(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === messages.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(messages.map(m => m.id));
        }
    };

    const exportCSV = () => {
        const items = selectedIds.length > 0
            ? messages.filter(m => selectedIds.includes(m.id))
            : messages;

        const header = 'Autor,Mensaje,Fecha,Tiene Media,URL Media\n';
        const rows = items.map(m => {
            const date = m.createdAt ? m.createdAt.toDate().toLocaleDateString('es-ES') : 'Sin fecha';
            const text = m.text?.replace(/"/g, '""') || '';
            const author = (m.authorEmail || 'Anonimo').replace(/"/g, '""');
            const hasMedia = m.mediaUrl ? 'Si' : 'No';
            const mediaUrl = m.mediaUrl || '';
            return `"${author}","${text}","${date}","${hasMedia}","${mediaUrl}"`;
        }).join('\n');

        const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `libro_firmas_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const downloadMedia = async (mediaUrl, authorEmail, index) => {
        try {
            const response = await fetch(mediaUrl);
            const blob = await response.blob();
            const ext = blob.type.includes('video') ? 'mp4' : 'jpg';
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `guestbook_${authorEmail || 'media'}_${index}.${ext}`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error descargando media:', err);
            window.open(mediaUrl, '_blank');
        }
    };

    const downloadAllMedia = async () => {
        const items = selectedIds.length > 0
            ? messages.filter(m => selectedIds.includes(m.id) && m.mediaUrl)
            : messages.filter(m => m.mediaUrl);

        for (let i = 0; i < items.length; i++) {
            await downloadMedia(items[i].mediaUrl, items[i].authorEmail, i);
            await new Promise(r => setTimeout(r, 500));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Seguro que quieres eliminar este mensaje? Esta acción no se puede deshacer.')) return;
        setDeleting(id);
        try {
            await deleteDoc(doc(db, 'guestbook', id));
            setSelectedIds(prev => prev.filter(i => i !== id));
        } catch (err) {
            console.error('Error eliminando:', err);
        } finally {
            setDeleting(null);
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`¿Eliminar ${selectedIds.length} mensaje(s)? Esto liberará espacio en la base de datos.`)) return;

        for (const id of selectedIds) {
            try {
                await deleteDoc(doc(db, 'guestbook', id));
            } catch (err) {
                console.error('Error eliminando:', err);
            }
        }
        setSelectedIds([]);
    };

    const mediaCount = messages.filter(m => m.mediaUrl).length;

    if (loading) return <div className="text-slate-500 py-8 text-center">Cargando libro de firmas...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-white shadow-sm rounded-xl p-6">
                <h2 className="text-2xl font-serif text-slate-800 mb-2">Exportar Libro de Firmas</h2>
                <p className="text-slate-500 font-light mb-6 text-sm">
                    Descarga los mensajes y fotos de los invitados. Puedes eliminar entradas para liberar espacio en la base de datos.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-stone-50 rounded-lg p-4 text-center border border-stone-100">
                        <p className="text-2xl font-medium text-stone-800">{messages.length}</p>
                        <p className="text-xs text-stone-500 uppercase tracking-wide">Mensajes</p>
                    </div>
                    <div className="bg-stone-50 rounded-lg p-4 text-center border border-stone-100">
                        <p className="text-2xl font-medium text-stone-800">{mediaCount}</p>
                        <p className="text-xs text-stone-500 uppercase tracking-wide">Fotos/Videos</p>
                    </div>
                    <div className="bg-stone-50 rounded-lg p-4 text-center border border-stone-100">
                        <p className="text-2xl font-medium text-stone-800">{selectedIds.length}</p>
                        <p className="text-xs text-stone-500 uppercase tracking-wide">Seleccionados</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white text-sm rounded hover:bg-stone-700 transition-colors">
                        <FileText size={16} /> Exportar CSV
                    </button>
                    <button onClick={downloadAllMedia} disabled={mediaCount === 0} className="flex items-center gap-2 px-4 py-2 bg-stone-600 text-white text-sm rounded hover:bg-stone-500 transition-colors disabled:opacity-40">
                        <Image size={16} /> Descargar Media {selectedIds.length > 0 ? '(seleccion)' : '(todo)'}
                    </button>
                    {selectedIds.length > 0 && (
                        <button onClick={handleDeleteSelected} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-500 transition-colors">
                            <Trash2 size={16} /> Eliminar ({selectedIds.length})
                        </button>
                    )}
                </div>

                {/* Messages List */}
                {messages.length === 0 ? (
                    <p className="text-center py-8 text-slate-500 font-light">No hay mensajes en el libro de firmas.</p>
                ) : (
                    <>
                        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-200">
                            <input type="checkbox" checked={selectedIds.length === messages.length && messages.length > 0} onChange={toggleSelectAll} className="w-4 h-4" />
                            <span className="text-sm text-slate-500">Seleccionar todos</span>
                        </div>
                        <div className="space-y-3 max-h-[500px] overflow-y-auto">
                            {messages.map((msg, idx) => (
                                <div key={msg.id} className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${selectedIds.includes(msg.id) ? 'bg-stone-50 border-stone-300' : 'bg-white border-slate-100'}`}>
                                    <input type="checkbox" checked={selectedIds.includes(msg.id)} onChange={() => toggleSelect(msg.id)} className="w-4 h-4 mt-1 shrink-0" />

                                    {msg.mediaUrl && (
                                        <div className="w-16 h-16 rounded overflow-hidden shrink-0 bg-stone-100">
                                            {msg.mediaType === 'video' ? (
                                                <video src={msg.mediaUrl} className="w-full h-full object-cover" />
                                            ) : (
                                                <img src={msg.mediaUrl} alt="" className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-800 font-medium">{msg.authorEmail || 'Anonimo'}</p>
                                        <p className="text-sm text-slate-600 font-light truncate">{msg.text}</p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {msg.createdAt ? msg.createdAt.toDate().toLocaleDateString('es-ES') : 'Sin fecha'}
                                        </p>
                                    </div>

                                    <div className="flex gap-1 shrink-0">
                                        {msg.mediaUrl && (
                                            <button onClick={() => downloadMedia(msg.mediaUrl, msg.authorEmail, idx)} className="p-2 text-stone-500 hover:text-stone-800 transition-colors" title="Descargar media">
                                                <Download size={16} />
                                            </button>
                                        )}
                                        <button onClick={() => handleDelete(msg.id)} disabled={deleting === msg.id} className="p-2 text-red-400 hover:text-red-600 transition-colors disabled:opacity-50" title="Eliminar">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default GuestbookExport;
