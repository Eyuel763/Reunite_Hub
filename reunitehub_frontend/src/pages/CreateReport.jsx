import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, User, MapPin, Calendar, ChevronRight, ChevronLeft, Camera, Image as ImageIcon } from 'lucide-react';
import { createReport } from '../api/reports';

const CreateReport = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [imagePreview, setImagePreview] =useState(null);
    
    const [formData, setFormData] = useState({
        full_name: '',
        age: '',
        age_range: 'minor',
        gender: 'male',
        last_seen_date: '',
        last_seen_location: '',
        description: '',
        photo: null
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({...formData, photo: file});
            setImagePreview(URL.createObjectURL(file));  //create local URL for preview
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (step < 3) return setStep(step + 1);

        setIsLoading(true);
        const data = new FormData();
        data.append('full_name', formData.full_name);
        data.append('age', formData.age);
        data.append('age_range', formData.age_range);
        data.append('gender', formData.gender);
        data.append('description', formData.description);
        data.append('last_seen_location', formData.last_seen_location);
        data.append('last_seen_date', new Date(formData.last_seen_date).toISOString());
        
        // Only append the photo if one was selected
        if (formData.photo) {
            data.append('photo', formData.photo);
        }

        try {
            await createReport(data);
            navigate('/reports');
        } catch (err) {
            alert("Error creating report. Check if all fields are filled.");
        } finally {
            setIsLoading(false);
        }

    }

    return (
        <div className="bg-white min-h-screen font-sans">
            {/* Top Navigation Bar */}
            <header className="border-b border-gray-100 px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    {/* Close Button */}
                    <button onClick={() => navigate('/reports')} className="text-gray-400 hover:text-gray-600 transition">
                        <X size={24} />
                    </button>

                    {/* Pill Progress Indicators */}
                    <div className="flex gap-2">
                        {[1, 2, 3].map((num) => (
                            <div 
                                key={num} 
                                className={`h-1.5 w-10 rounded-full transition-colors duration-300 ${
                                    step === num ? 'bg-blue-600' : 'bg-gray-100'
                                }`} 
                            />
                        ))}
                    </div>

                    {/* Step Counter */}
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Step {step} of 3
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 py-12">
                {/* Page Title & Subtitle */}
                <div className="mb-10">
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Report Missing Person</h1>
                    <p className="text-gray-500 text-sm">
                        Provide accurate details to help our community and volunteers search effectively.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Form Fields Section */}
                    <div className="min-h-[300px]">
                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <h1 className="text-3xl font-black text-gray-900 mb-2">Basic Information</h1>

                                {/* Photo Upload Section */}
                            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50 hover:bg-gray-100 transition-colors group cursor-pointer"
                                 onClick={() => fileInputRef.current.click()}>
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-32 h-32 rounded-2xl object-cover shadow-md" />
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="p-4 bg-white rounded-2xl shadow-sm text-blue-600 mb-3 group-hover:scale-110 transition-transform">
                                            <Camera size={28} />
                                        </div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Upload Photo</p>
                                    </div>
                                )}
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    hidden 
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                                    <input 
                                        type="text" required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        placeholder="Kidus Tadesse"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Age</label>
                                        <input 
                                            type="number" required min={1}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="13"
                                            onChange={(e) => {
                                                const ageValue = e.target.value;
                                                setFormData({...formData, age: ageValue,
                                                    age_range: parseInt(ageValue) < 18 ? 'minor' : 'adult'
                                                });
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Gender</label>
                                        <select 
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Last Seen Date</label>
                                    <input 
                                        type="datetime-local" required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        onChange={(e) => setFormData({...formData, last_seen_date: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Physical Description</label>
                                    <textarea 
                                        rows="4" required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Wearing blue hoodie, black jeans..."
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    />
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Last Seen Location</label>
                                    <input 
                                        type="text" required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Meskel Square, Addis Ababa"
                                        onChange={(e) => setFormData({...formData, last_seen_location: e.target.value})}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="mt-12 flex gap-4">
                        {step > 1 && (
                            <button 
                                type="button" onClick={() => setStep(step - 1)}
                                className="flex-1 py-4 text-gray-400 font-bold hover:text-gray-900 transition"
                            >
                                Back
                            </button>
                        )}
                        <button 
                            type="submit" disabled={isLoading}
                            className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition shadow-lg shadow-blue-100 disabled:opacity-50"
                        >
                            {isLoading ? 'Sending...' : step === 3 ? 'Finish & Post' : 'Continue'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default CreateReport;