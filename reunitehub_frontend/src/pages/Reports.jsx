import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    ArrowLeft, Filter, Plus, MapPin, Search,
    SlidersHorizontal, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { getReports } from '../api/reports';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        location: '',
        gender: '',
        age: ''
    });

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            try {
                const activeFilters = Object.fromEntries(
                    Object.entries(filters).filter(([_, v]) => v !== '')
                );
                const response = await getReports(activeFilters);
                setReports(response.data);
            } catch (err) {
                setError('Failed to load reports. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, [filters]); // Refetch reports when filters change

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            {/* Header / Nav */}
            <header className="bg-white border-b px-4 py-4 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Link to="/" className="bg-blue-600 p-2 rounded-lg text-white hover:bg-blue-700 transition">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900">Missing Reports</h1>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setShowMobileFilters(true)}
                            className="md:hidden bg-gray-100 p-2 rounded-lg text-gray-600"
                        >
                            <Filter size={20} />
                        </button>
                        <Link to="/create-report" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition">
                            + Report
                        </Link>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
                
                {/* Sidebar Filters */}
                <aside className={`
                    fixed inset-0 z-50 bg-white p-6 transition-transform duration-300 md:relative md:inset-auto md:z-0 md:translate-x-0 md:block md:w-64 md:bg-transparent md:p-0
                    ${showMobileFilters ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                        {/* Mobile Close Button */}
                        <div className="flex justify-between items-center mb-6 md:mb-6">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <SlidersHorizontal size={18} className="text-blue-600" /> Filters
                            </h3>
                            <button 
                                onClick={() => setShowMobileFilters(false)}
                                className="md:hidden text-gray-400 p-1"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Location</label>
                                <select 
                                className="w-full bg-gray-50 border-none rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={filters.location}
                                    onChange={(e) => handleFilterChange('location', e.target.value)}>
                                    <option value="">All Regions</option>
                                    <option value="Addis Ababa">Addis Ababa</option>
                                    <option value="Oromia">Oromia</option>
                                    <option value="Amhara">Amhara</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Gender</label>
                                <div className="space-y-2">
                                    {['male', 'female'].map(g => (
                                        <label key={g} className="flex items-center text-sm text-gray-600 cursor-pointer">
                                            <input type="radio" 
                                                    name='gender' 
                                                    className="rounded text-blue-600 mr-2 focus:ring-blue-500" 
                                                    checked={filters.gender === g}
                                                    onChange={() => handleFilterChange('gender', g)}
                                                    /> {g}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Age Range</label>
                                <select 
                                    className="w-full bg-gray-50 border-none rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500"
                                    value={filters.age_range}
                                    onChange={(e) => handleFilterChange('age_range', e.target.value)}
                                >
                                    <option value="">Any Age</option>
                                    <option value="minor">0-17 (Minor)</option>
                                    <option value="adult">18+ (Adult)</option>
                                </select>
                            </div>

                            <button 
                                onClick={() => {
                                    setFilters({ location: '', gender: '', age_range: '' });
                                    if (window.innerWidth < 768) setShowMobileFilters(false);
                                }}
                                className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1">
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-gray-500 text-sm font-medium">
                            Showing <span className="text-gray-900 font-bold">{reports.length}</span> reports
                        </p>
                        <select className="bg-transparent border-none text-sm font-bold text-gray-600 focus:ring-0 cursor-pointer outline-none">
                            <option>Sort by: Newest First</option>
                            <option>Sort by: Oldest First</option>
                        </select>
                    </div>

                    {/* Reports Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            // Skeleton Loader
                            [...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
                                    <div className="w-full h-48 bg-gray-200 rounded-xl mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
                                    <div className="h-10 bg-gray-100 rounded-xl"></div>
                                </div>
                            ))
                        ) : error ? (
                            <div className="col-span-full py-10 text-center text-red-500 font-medium">{error}</div>
                        ) : (
                            reports.map((report) => (
                                <div key={report.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                                    <div className="h-56 bg-gray-200 relative overflow-hidden">
                                        <img 
                                            src={report.photo || "https://via.placeholder.com/500x400?text=No+Image"} 
                                            alt={report.full_name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-3 left-3 flex gap-2">
                                            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                                                {report.status || 'Missing'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <h4 className="font-bold text-lg text-gray-900 mb-1 leading-tight">{report.full_name} </h4>
                                        <p className="text-sm text-gray-500 flex items-center gap-1 mb-4">
                                            <MapPin size={14} className="text-red-500" /> {report.last_seen_location || 'Unknown Location'}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <span className="bg-gray-100 text-gray-600 text-[11px] font-bold px-2 py-1 rounded uppercase">{report.gender}</span>
                                            <span className="bg-gray-100 text-gray-600 text-[11px] font-bold px-2 py-1 rounded">{report.age} YEARS</span>
                                        </div>
                                        <Link to={`/reports/${report.id}`} className="block w-full text-center py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition">
                                            View Full Details
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {!loading && reports.length > 0 && (
                        <div className="mt-12 flex justify-center gap-2">
                            <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50"><ChevronLeft size={18} /></button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-600 text-white font-bold">1</button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold">2</button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50"><ChevronRight size={18} /></button>
                        </div>
                    )}
                </main>
            </div>

            {/* Background Overlay (Darkens the screen when mobile filters are open) */}
            {showMobileFilters && (
                <div 
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setShowMobileFilters(false)}
                />
            )}

        </div>
    );
};

export default Reports;