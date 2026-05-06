import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    ChevronLeft, Share2, Flag, Eye, 
    Zap, Bolt, Info 
} from 'lucide-react';
import { getReportDetails } from '../api/reports';

const ReportDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await getReportDetails(id);
                setReport(response.data);
            } catch (err) {
                setError('Could not load the report details.');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    if (loading) return <div className="p-20 text-center font-bold">Loading report...</div>;
    if (error) return <div className="p-20 text-center text-red-500">{error}</div>;

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            {/* Top Navigation */}
            <nav className="bg-white border-b px-4 py-3 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <button onClick={() => navigate('/reports')} className="text-gray-600 hover:text-blue-600 flex items-center gap-2 transition outline-none">
                        <ChevronLeft size={18} strokeWidth={3} />
                        <span className="font-bold text-sm">Back to Reports</span>
                    </button>
                    <div className="flex gap-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600"><Share2 size={18} /></button>
                        <button className="p-2 text-gray-400 hover:text-red-600"><Flag size={18} /></button>
                    </div>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Image and Basic Info */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                            <div className="relative">
                                <img 
                                    src={report.image  || 'https://via.placeholder.com/400x500?text=No+Image'} 
                                    alt="Missing Person" 
                                    className="w-full aspect-[4/5] object-cover" 
                                />
                                <div className="absolute bottom-4 left-4 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                                    {report.status || 'Missing'}
                                </div>
                            </div>
                            <div className="p-6">
                                <h1 className="text-2xl font-black text-gray-900 mb-2">{report.full_name}</h1>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm border-b border-gray-50 pb-2">
                                        <span className="text-gray-400">Age</span>
                                        <span className="font-bold text-gray-900">{report.age} Years</span>
                                    </div>
                                    <div className="flex justify-between text-sm border-b border-gray-50 pb-2">
                                        <span className="text-gray-400">Gender</span>
                                        <span className="font-bold text-gray-900 capitalize">{report.gender}</span>
                                    </div>
                                    <div className="flex justify-between text-sm border-b border-gray-50 pb-2">
                                        <span className="text-gray-400">Last Seen Date</span>
                                        <span className="font-bold text-gray-900">{report.last_seen_date || 'Unknown Date'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Location</span>
                                        <span className="font-bold text-blue-600">{report.last_seen_location || 'Unknown Location'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Timeline, Sightings, and Actions */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Real-time Status Alert */}
                        {/* <div className="bg-blue-600 rounded-2xl p-4 text-white flex items-center justify-between shadow-blue-200 shadow-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                                <p className="text-sm font-bold">Live: Active sightings being verified</p>
                            </div>
                            <Bolt size={18} className="text-blue-200" />
                        </div> */}

                        {/* Description Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-black text-gray-900 mb-4 uppercase text-xs tracking-widest">Physical Description</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                {report.description || "No specific physical description provided."}
                            </p>
                        </div>

                        {/* Sightings Feed */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="flex border-b border-gray-100">
                                <button className="flex-1 py-4 text-sm font-black text-blue-600 border-b-2 border-blue-600">SIGHTINGS</button>
                                <button className="flex-1 py-4 text-sm font-bold text-gray-400 hover:text-gray-600 transition">TIPS</button>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Sample Sighting Item */}
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                        <Eye size={16} className="text-gray-400" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-sm text-gray-900">Recent Sighting Near {report.last_seen_location}</span>
                                            <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded uppercase">Verified</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-2">Reported by Community Member • 2 hours ago</p>
                                        <p className="text-sm text-gray-600">Last reported location matches original region. Search teams are notified.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-4">
                            <button className="bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-100">
                                SUBMIT SIGHTING
                            </button>
                            <button className="bg-white border-2 border-gray-200 hover:border-gray-900 text-gray-900 py-4 rounded-2xl font-black text-sm transition-all">
                                ANONYMOUS TIP
                            </button>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default ReportDetail;