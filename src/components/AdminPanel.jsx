import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { collection, query, orderBy, onSnapshot, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { FileText, Trash2, UserCheck, UserX, Users } from 'lucide-react';

const AdminPanel = () => {
    const [rsvps, setRsvps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const q = query(collection(db, 'rsvps'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setRsvps(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleUpdateStatus = async (id, status) => {
        try {
            await updateDoc(doc(db, 'rsvps', id), { status });
        } catch (err) {
            console.error("Error updating status:", err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este registro de invitado?')) return;
        try {
            await deleteDoc(doc(db, 'rsvps', id));
        } catch (err) {
            console.error("Error eliminando:", err);
        }
    };

    const exportCSV = () => {
        const header = 'Nombre,Email,Acompañantes,Intolerancias,Estado,Fecha\n';
        const rows = filteredRsvps.map(r => {
            const date = r.createdAt ? r.createdAt.toDate().toLocaleDateString('es-ES') : 'Sin fecha';
            const name = (r.name || '').replace(/"/g, '""');
            const email = (r.email || '').replace(/"/g, '""');
            const intol = (r.intolerances || '-').replace(/"/g, '""');
            return `"${name}","${email}","${r.companions || 0}","${intol}","${r.status}","${date}"`;
        }).join('\n');

        const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invitados_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const approveAll = async () => {
        const pending = rsvps.filter(r => r.status === 'pending');
        if (pending.length === 0) return;
        if (!window.confirm(`¿Aprobar ${pending.length} solicitudes pendientes?`)) return;
        for (const r of pending) {
            await handleUpdateStatus(r.id, 'approved');
        }
    };

    const filteredRsvps = filter === 'all' ? rsvps : rsvps.filter(r => r.status === filter);

    const counts = {
        total: rsvps.length,
        approved: rsvps.filter(r => r.status === 'approved').length,
        pending: rsvps.filter(r => r.status === 'pending').length,
        rejected: rsvps.filter(r => r.status === 'rejected').length,
        totalGuests: rsvps.filter(r => r.status === 'approved').reduce((sum, r) => sum + 1 + Number(r.companions || 0), 0),
    };

    if (loading) return <div className="text-slate-500 py-8 text-center">Cargando...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-white shadow-sm rounded-xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-serif text-slate-800">Gestión de Invitados</h2>
                        <p className="text-slate-500 font-light text-sm mt-1">Aprueba o rechaza solicitudes para dar acceso a la web privada.</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white text-sm rounded hover:bg-stone-700 transition-colors">
                            <FileText size={16} /> Exportar CSV
                        </button>
                        <button onClick={approveAll} disabled={counts.pending === 0} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-500 transition-colors disabled:opacity-40">
                            <UserCheck size={16} /> Aprobar Pendientes
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                    <button onClick={() => setFilter('all')} className={`rounded-lg p-3 text-center border transition-colors ${filter === 'all' ? 'bg-stone-800 text-white border-stone-800' : 'bg-stone-50 border-stone-100 hover:border-stone-300'}`}>
                        <p className="text-xl font-medium">{counts.total}</p>
                        <p className="text-xs uppercase tracking-wide opacity-70">Total</p>
                    </button>
                    <button onClick={() => setFilter('pending')} className={`rounded-lg p-3 text-center border transition-colors ${filter === 'pending' ? 'bg-yellow-600 text-white border-yellow-600' : 'bg-yellow-50 border-yellow-100 hover:border-yellow-300'}`}>
                        <p className="text-xl font-medium">{counts.pending}</p>
                        <p className="text-xs uppercase tracking-wide opacity-70">Pendientes</p>
                    </button>
                    <button onClick={() => setFilter('approved')} className={`rounded-lg p-3 text-center border transition-colors ${filter === 'approved' ? 'bg-green-600 text-white border-green-600' : 'bg-green-50 border-green-100 hover:border-green-300'}`}>
                        <p className="text-xl font-medium">{counts.approved}</p>
                        <p className="text-xs uppercase tracking-wide opacity-70">Aprobados</p>
                    </button>
                    <button onClick={() => setFilter('rejected')} className={`rounded-lg p-3 text-center border transition-colors ${filter === 'rejected' ? 'bg-red-600 text-white border-red-600' : 'bg-red-50 border-red-100 hover:border-red-300'}`}>
                        <p className="text-xl font-medium">{counts.rejected}</p>
                        <p className="text-xs uppercase tracking-wide opacity-70">Rechazados</p>
                    </button>
                    <div className="rounded-lg p-3 text-center bg-stone-50 border border-stone-100">
                        <p className="text-xl font-medium text-stone-800"><Users size={16} className="inline mr-1" />{counts.totalGuests}</p>
                        <p className="text-xs uppercase tracking-wide text-stone-500">Asistentes</p>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="py-3 px-4 text-sm font-semibold text-slate-600">Nombre</th>
                                <th className="py-3 px-4 text-sm font-semibold text-slate-600">Email</th>
                                <th className="py-3 px-4 text-sm font-semibold text-slate-600 text-center">Acomp.</th>
                                <th className="py-3 px-4 text-sm font-semibold text-slate-600">Intolerancias</th>
                                <th className="py-3 px-4 text-sm font-semibold text-slate-600">Estado</th>
                                <th className="py-3 px-4 text-sm font-semibold text-slate-600">Fecha</th>
                                <th className="py-3 px-4 text-sm font-semibold text-slate-600 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRsvps.map((rsvp) => (
                                <tr key={rsvp.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="py-3 px-4 text-slate-800 font-medium">{rsvp.name}</td>
                                    <td className="py-3 px-4 text-slate-600 font-light text-sm">{rsvp.email}</td>
                                    <td className="py-3 px-4 text-slate-800 text-center">{rsvp.companions}</td>
                                    <td className="py-3 px-4 text-slate-500 text-sm max-w-[200px] truncate">{rsvp.intolerances || '-'}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${rsvp.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                rsvp.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {rsvp.status === 'approved' ? 'Aprobado' : rsvp.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-xs text-slate-400">
                                        {rsvp.createdAt ? rsvp.createdAt.toDate().toLocaleDateString('es-ES') : '-'}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <button onClick={() => handleUpdateStatus(rsvp.id, 'approved')} className="p-1.5 text-green-500 hover:text-green-700 hover:bg-green-50 rounded transition-colors" title="Aprobar">
                                                <UserCheck size={16} />
                                            </button>
                                            <button onClick={() => handleUpdateStatus(rsvp.id, 'rejected')} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Rechazar">
                                                <UserX size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(rsvp.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Eliminar">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredRsvps.length === 0 && (
                        <p className="text-center py-8 text-slate-500 font-light">
                            {filter === 'all' ? 'No hay solicitudes.' : `No hay solicitudes con estado "${filter}".`}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
