import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';

import Hero from './components/Hero';
import RsvpForm from './components/RsvpForm';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AdminPanel from './components/AdminPanel';
import GuestDashboard from './components/GuestDashboard';
import EventDetails from './components/EventDetails';
import NewsManager from './components/NewsManager';
import Guestbook from './components/Guestbook';
import GuestbookExport from './components/GuestbookExport';
import GalleryManager from './components/GalleryManager';
import Gallery from './components/Gallery';
import { LogOut } from 'lucide-react';

// Layouts & Pages
const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <main>
        <Outlet />
      </main>
    </div>
  );
};

const DashboardLayout = () => {
  const { userRole, logout } = useAuth();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar for Dashboard */}
      <aside className="w-64 bg-stone-900 text-stone-100 min-h-screen p-6 flex flex-col shadow-xl z-10">
        <h2 className="text-xl font-serif mb-8 tracking-widest border-b border-white/10 pb-4">Panel Boda</h2>
        <nav className="space-y-4 text-sm font-light tracking-wide flex-grow">
          <Link to="/dashboard" className="block text-white/80 hover:text-white transition-colors">Noticias</Link>
          <Link to="/dashboard/info" className="block text-white/80 hover:text-white transition-colors">Información</Link>
          <Link to="/dashboard/guestbook" className="block text-white/80 hover:text-white transition-colors">Libro de Firmas</Link>
          <Link to="/dashboard/gallery" className="block text-white/80 hover:text-white transition-colors">Galería</Link>

          <div className="pt-6 mt-6 border-t border-stone-800 space-y-4">
            <span className="text-xs text-stone-400 uppercase tracking-widest font-semibold block mb-2">Admin (Testing)</span>
            <Link to="/dashboard/admin" className="block text-stone-300 hover:text-white transition-colors">Gestión Invitados</Link>
            <Link to="/dashboard/admin/news" className="block text-stone-300 hover:text-white transition-colors">Publicar Noticias</Link>
            <Link to="/dashboard/admin/guestbook-export" className="block text-stone-300 hover:text-white transition-colors">Exportar Libro Firmas</Link>
            <Link to="/dashboard/admin/gallery" className="block text-stone-300 hover:text-white transition-colors">Gestionar Galería</Link>
          </div>
        </nav>

        <div className="mt-auto space-y-2">
          <Link to="/" className="flex items-center text-sm text-stone-400 hover:text-white transition-colors gap-2 pt-6 border-t border-stone-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-home"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
            Volver a Portada
          </Link>
          <button onClick={logout} className="flex items-center text-sm text-stone-400 hover:text-white transition-colors gap-2 pt-2">
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Hero />} />
            <Route path="rsvp" element={<RsvpForm />} />
            <Route path="login" element={<Login />} />
          </Route>

          {/* Private Routes Exposed for UI Testing */}
          <Route path="/dashboard" element={<Outlet />}>
            <Route element={<DashboardLayout />}>
              <Route index element={<GuestDashboard />} />
              <Route path="info" element={<EventDetails />} />
              <Route path="guestbook" element={<Guestbook />} />
              <Route path="gallery" element={<Gallery />} />

              {/* Admin routes */}
              <Route path="admin" element={<AdminPanel />} />
              <Route path="admin/news" element={<NewsManager />} />
              <Route path="admin/guestbook-export" element={<GuestbookExport />} />
              <Route path="admin/gallery" element={<GalleryManager />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
