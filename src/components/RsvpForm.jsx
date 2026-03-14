import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const RsvpForm = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        companions: 0,
        intolerances: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = (e) => {
        e.preventDefault();
        if (step === 1 && (!formData.name || !formData.email)) {
            setError('Por favor completa los campos requeridos.');
            return;
        }
        setError('');
        setStep(step + 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await addDoc(collection(db, 'rsvps'), {
                ...formData,
                status: 'pending',
                createdAt: serverTimestamp()
            });
            setSuccess(true);
        } catch (err) {
            setError('Hubo un error al procesar tu solicitud. Inténtalo de nuevo.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center"
                >
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">✓</div>
                    <h2 className="text-2xl font-serif mb-4 text-slate-800">¡Solicitud Enviada!</h2>
                    <p className="text-slate-600 font-light leading-relaxed mb-6">
                        Hemos recibido tus datos con éxito. En breve, los administradores revisarán tu solicitud para darte acceso al panel privado de invitados.
                    </p>
                    <a href="/" className="text-sm font-medium text-slate-500 hover:text-slate-800 uppercase tracking-widest transition-colors">Volver al inicio</a>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg relative overflow-hidden">

                {/* Progress bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
                    <motion.div
                        className="h-full bg-slate-800"
                        initial={{ width: '50%' }}
                        animate={{ width: step === 1 ? '50%' : '100%' }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                <h2 className="text-3xl font-serif text-slate-800 mb-6 text-center">Reserva tu Plaza</h2>
                {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

                <form onSubmit={step === 1 ? nextStep : handleSubmit} className="relative">
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-5"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1 tracking-wide">Nombre Completo *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full border-b border-slate-300 py-2 focus:outline-none focus:border-slate-800 transition-colors bg-transparent"
                                        placeholder="Ej. María Pérez"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1 tracking-wide">Correo Electrónico *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full border-b border-slate-300 py-2 focus:outline-none focus:border-slate-800 transition-colors bg-transparent"
                                        placeholder="tucorreo@ejemplo.com"
                                    />
                                </div>
                                <div className="pt-4">
                                    <button type="submit" className="w-full bg-slate-800 text-white tracking-widest uppercase text-sm font-medium py-3 rounded hover:bg-slate-700 transition-colors">
                                        Siguiente
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-5"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1 tracking-wide">Acompañantes</label>
                                    <select
                                        name="companions"
                                        value={formData.companions}
                                        onChange={handleChange}
                                        className="w-full border-b border-slate-300 py-2 focus:outline-none focus:border-slate-800 transition-colors bg-transparent"
                                    >
                                        {[0, 1, 2, 3, 4, 5].map(num => (
                                            <option key={num} value={num}>{num} {num === 1 ? 'Persona' : 'Personas'}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1 tracking-wide">Alergias o Intolerancias</label>
                                    <textarea
                                        name="intolerances"
                                        value={formData.intolerances}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full border border-slate-300 rounded-md p-3 focus:outline-none focus:border-slate-800 transition-colors bg-transparent mt-2 resize-none text-sm"
                                        placeholder="Indica si alguien tiene alergias o intolerancias..."
                                    ></textarea>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="w-1/3 border border-slate-300 text-slate-600 tracking-widest uppercase text-sm font-medium py-3 rounded hover:bg-slate-50 transition-colors"
                                    >
                                        Atrás
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-slate-800 text-white tracking-widest uppercase text-sm font-medium py-3 rounded hover:bg-slate-700 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'Enviando...' : 'Confirmar Registro'}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>
            </div>
        </div>
    );
};

export default RsvpForm;
