import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    ArrowLeft, Filter, Plus, MapPin, 
    SlidersHorizontal, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { getReports } from '../api/reports';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await getReports();
                setReports(response.data);
            } catch (err) {
                setError('Failed to load reports. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

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
                        <button className="md:hidden bg-gray-100 p-2 rounded-lg text-gray-600">
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
                <aside className="hidden md:block w-64 flex-shrink-0">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <SlidersHorizontal size={18} className="text-blue-600" /> Filters
                        </h3>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Location</label>
                                <select className="w-full bg-gray-50 border-none rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option>All Regions</option>
                                    <option>Addis Ababa</option>
                                    <option>Oromia</option>
                                    <option>Amhara</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Gender</label>
                                <div className="space-y-2">
                                    {['Male', 'Female'].map(gender => (
                                        <label key={gender} className="flex items-center text-sm text-gray-600 cursor-pointer">
                                            <input type="checkbox" className="rounded text-blue-600 mr-2 focus:ring-blue-500" /> {gender}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition">
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
                            // Skeleton Loader[cite: 3]
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
                                            src={report.image || "https://via.placeholder.com/500x400?text=No+Image"} 
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

                    {/* Pagination[cite: 3] */}
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
        </div>
    );
};

export default Reports;