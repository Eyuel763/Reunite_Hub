import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ChevronLeft, Share2, Flag, Eye, MapPin,
    Zap, Bolt, Info, CheckCircle, X, Camera
} from 'lucide-react';
import { getReportDetails, createSighting, getSightings } from '../api/reports';


const ReportDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [sightings, setSightings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // State for sighting form
    const [isSightingModalOpen, setIsSightingModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [sightingData, setSightingData] = useState({
        sighting_date: '',
        location_description: '',
        clothing_description: '',
        latitude: 9.0343, // Default placeholder
        longitude: 38.7469,
        photo: null
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSightingData({ ...sightingData, photo: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSightingSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();
        data.append('sighting_date', new Date(sightingData.sighting_date).toISOString());
        data.append('location_description', sightingData.location_description);
        data.append('clothing_description', sightingData.clothing_description);
        data.append('latitude', sightingData.latitude);
        data.append('longitude', sightingData.longitude);

        if (sightingData.photo) {
            data.append('photo', sightingData.photo);
        }

        try {
            await createSighting(id, data);
            alert("Sighting submitted successfully! It will be verified soon.");
            setIsSightingModalOpen(false);
            setSightingData({ 
                sighting_date: '',
                location_description: '',
                clothing_description: '',
                latitude: 9.0343,
                longitude: 38.7469,
                photo: null
             });
            setImagePreview(null);
        } catch (err) {
            alert("Failed to submit sighting. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [reportRes, sightingsRes] = await Promise.all([
                    getReportDetails(id),
                    getSightings(id)
                ]);
                setReport(reportRes.data);
                setSightings(sightingsRes.data);
            } catch (err) {
                setError('Could not load the report details.');
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
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
                                    src={report.photo || 'https://via.placeholder.com/400x500?text=No+Image'}
                                    alt={report.full_name}
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
                        <section className="mt-12">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                        Recent Sightings
                    </h3>
                    <span className="bg-blue-100 text-blue-700 text-xs font-black px-3 py-1 rounded-full">
                        {sightings.length} UPDATES
                    </span>
                </div>

                {sightings.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-gray-100 rounded-3xl p-10 text-center">
                        <p className="text-gray-400 font-medium">No sightings reported yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sightings.map((sighting) => (
                            <div key={sighting.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-50 flex gap-5">
                                {sighting.photo && (
                                    <img 
                                        src={sighting.photo} 
                                        className="w-24 h-24 rounded-2xl object-cover flex-shrink-0" 
                                        alt="Sighting" 
                                    />
                                )}
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-gray-900 flex items-center gap-1">
                                            <MapPin size={14} className="text-blue-600" />
                                            {sighting.location_description}
                                        </h4>
                                        <span className="text-[10px] font-black text-gray-400 uppercase">
                                            {new Date(sighting.sighting_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed mb-3">
                                        {sighting.clothing_description}
                                    </p>
                                    <div className="inline-flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">
                                            Verified Sighting
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <button
                                onClick={() => setIsSightingModalOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-100"
                            >
                                SUBMIT SIGHTING
                            </button>
                            <button className="bg-white border-2 border-gray-200 hover:border-gray-900 text-gray-900 py-4 rounded-2xl font-black text-sm transition-all">
                                ANONYMOUS TIP
                            </button>
                        </div>

                    </div>
                </div>
            </main>

            {/* Sighting Modal Overlay */}
            {isSightingModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-black text-gray-900">New Sighting</h2>
                            <button onClick={() => setIsSightingModalOpen(false)}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSightingSubmit} className="p-6 space-y-4">
                            {/* Photo Slot */}
                            <div 
                                onClick={() => fileInputRef.current.click()}
                                className="h-32 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 flex items-center justify-center cursor-pointer overflow-hidden"
                            >
                                {imagePreview ? (
                                    <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                                ) : (
                                    <Camera className="text-gray-400" size={24} />
                                )}
                                <input type="file" ref={fileInputRef} hidden accept="image/*" 
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setSightingData({...sightingData, photo: file});
                                            setImagePreview(URL.createObjectURL(file));
                                        }
                                    }} 
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">When did you see them?</label>
                                    <input 
                                        type="datetime-local" required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm"
                                        onChange={(e) => setSightingData({...sightingData, sighting_date: e.target.value})}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Where (Location Description)</label>
                                    <input 
                                        type="text" required placeholder="e.g. Piassa bus terminal"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm"
                                        value={sightingData.location_description}
                                        onChange={(e) => setSightingData({...sightingData, location_description: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Clothing / Details</label>
                                    <textarea 
                                        required placeholder="e.g. Blue hoodie, carrying a red bag"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm resize-none"
                                        rows="2"
                                        value={sightingData.clothing_description}
                                        onChange={(e) => setSightingData({...sightingData, clothing_description: e.target.value})}
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" disabled={isSubmitting}
                                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg disabled:opacity-50"
                            >
                                {isSubmitting ? "Sending..." : "Submit Sighting"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ReportDetail;