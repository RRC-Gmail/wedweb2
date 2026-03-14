import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(email, password);
            navigate('/dashboard'); // Route guard will handle if it's admin or guest
        } catch (err) {
            setError('Credenciales inválidas. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-serif text-slate-800">Acceso Invitados</h2>
                    <p className="text-slate-500 font-light mt-2 text-sm">
                        Ingresa con tu correo aprobado para ver los detalles.
                    </p>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Cualquier letra o nombre (Modo Pruebas)</label>
                        <input
                            type="text"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border-b border-slate-300 py-2 focus:outline-none focus:border-slate-800 transition-colors bg-white font-medium"
                            placeholder="Ej. Juan"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-800 text-white tracking-widest uppercase text-sm font-medium py-3 rounded hover:bg-slate-700 transition-colors disabled:opacity-50 mt-4"
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500 bg-yellow-50 text-yellow-800 p-2 rounded">
                    🚀 Modo Pruebas Activado: No necesitas registro. Simplemente escribe una letra y da a "Entrar".
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
