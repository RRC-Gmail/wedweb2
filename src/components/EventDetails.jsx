import React from 'react';

const EventDetails = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <section className="bg-white rounded-xl shadow-sm p-8 text-center border-t-4 border-stone-600">
                <h2 className="text-3xl font-serif text-stone-800 mb-2">Lugares del Evento</h2>
                <p className="text-stone-500 tracking-wide font-light mb-8">Toda la información que necesitas para acompañarnos en nuestro gran día.</p>

                <div className="grid md:grid-cols-2 gap-8 text-left">
                    {/* Ceremonia */}
                    <div className="bg-stone-50 rounded-xl overflow-hidden shadow-sm border border-stone-100">
                        <div className="h-48 overflow-hidden relative">
                            <img src="/images/el_escorial.png" alt="Real Basílica del Escorial" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/20"></div>
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-medium text-stone-800 mb-3 border-b border-stone-200 pb-2">Ceremonia Religiosa</h3>
                            <p className="text-stone-600 font-light leading-relaxed">
                                <strong>Lugar:</strong> Real Basílica de San Lorenzo de El Escorial<br />
                                <strong>Dirección:</strong> Av de Juan de Borbón y Battenberg, San Lorenzo de El Escorial<br />
                                <a href="https://maps.app.goo.gl/3Ahy619pBms4oG3aA" target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-widest font-medium underline mt-4 inline-block text-stone-800 hover:text-stone-500 transition-colors">Ver en Google Maps</a>
                            </p>
                        </div>
                    </div>

                    {/* Celebración */}
                    <div className="bg-stone-50 rounded-xl overflow-hidden shadow-sm border border-stone-100">
                        <div className="h-48 overflow-hidden relative">
                            <img src="/images/la_herreria.png" alt="Club de Golf La Herrería" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/10"></div>
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-medium text-stone-800 mb-3 border-b border-stone-200 pb-2">Celebración</h3>
                            <p className="text-stone-600 font-light leading-relaxed">
                                <strong>Lugar:</strong> Real Club de Golf La Herrería<br />
                                <strong>Dirección:</strong> Ctra. de Robledo de Chavela, s/n, San Lorenzo de El Escorial<br />
                                <a href="https://maps.app.goo.gl/hB4W6H8HMyF2v2Rk9" target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-widest font-medium underline mt-4 inline-block text-stone-800 hover:text-stone-500 transition-colors">Ver en Google Maps</a>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Illustrated Map Section */}
                <div className="mt-12 bg-stone-50 rounded-xl overflow-hidden shadow-sm border border-stone-100 p-4 relative">
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full border border-stone-200 shadow-sm z-10">
                        <span className="text-stone-600 tracking-widest uppercase text-xs font-medium">Nuestro Recorrido</span>
                    </div>
                    <img src="/images/wedding_map_escorial.png" alt="Mapa Ilustrado del Recorrido" className="w-full h-auto rounded-lg opacity-90 mix-blend-multiply" />
                </div>

            </section>
        </div>
    );
};

export default EventDetails;
