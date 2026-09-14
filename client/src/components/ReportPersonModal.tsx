import React, { useState } from 'react';
import { X, UserPlus, MapPin, Camera, Phone, FileText, CheckCircle2 } from 'lucide-react';
import { createMissingPersonReport } from '../services/api';
import { UserRole, IMissingPerson } from '../types';

interface ReportPersonModalProps {
  userRole: UserRole;
  onClose: () => void;
  onReportCreated: (newReport: IMissingPerson) => void;
  initialLat?: number;
  initialLng?: number;
}

const PRESET_PHOTOS = [
  { label: 'Male Portrait 1', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
  { label: 'Female Portrait 1', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80' },
  { label: 'Male Portrait 2', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80' },
  { label: 'Female Portrait 2', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
];

export const ReportPersonModal: React.FC<ReportPersonModalProps> = ({
  userRole,
  onClose,
  onReportCreated,
  initialLat = 28.6142,
  initialLng = 77.2092,
}) => {
  const [name, setName] = useState<string>('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [photoUrl, setPhotoUrl] = useState<string>(PRESET_PHOTOS[0].url);
  const [latitude, setLatitude] = useState<number>(initialLat);
  const [longitude, setLongitude] = useState<number>(initialLng);
  const [addressName, setAddressName] = useState<string>('Sector 4 Search Area');
  const [description, setDescription] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter the full name.');
      return;
    }
    if (!age || Number(age) <= 0) {
      setErrorMessage('Please enter a valid age.');
      return;
    }
    if (!contactPhone.trim()) {
      setErrorMessage('Please enter an emergency contact phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createMissingPersonReport({
        name: name.trim(),
        age: Number(age),
        gender,
        photoUrl,
        latitude: Number(latitude),
        longitude: Number(longitude),
        addressName: addressName || 'Sector 4 Search Area',
        description: description || 'No detailed notes provided.',
        contactPhone: contactPhone.trim(),
        reportedByRole: userRole,
        status: 'MISSING',
      });

      setIsSuccess(true);
      onReportCreated(created);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Failed to submit report:', err);
      const msg = err?.response?.data?.error || err?.message || 'Failed to submit report to server.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2500] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-lg max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in duration-200">
        {/* Header */}
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-4 h-4 text-purple-700" />
            <h2 className="text-sm font-mono font-bold tracking-wider text-slate-800 uppercase">
              {userRole === 'RESCUE_TEAM' ? 'POST FOUND / SIGHTED PERSON' : 'REPORT MISSING PERSON'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {isSuccess ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-3 font-mono">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 animate-bounce" />
            <h3 className="text-base font-bold text-slate-900">REPORT REGISTERED SUCCESSFULLY</h3>
            <p className="text-xs text-slate-500 max-w-xs font-sans">
              Geo-tagged report has been broadcast to Ground Command Center & Rescue Teams.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 font-mono text-xs text-slate-800 max-h-[80vh] overflow-y-auto">
            {/* Error Message */}
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-300 p-2.5 rounded text-rose-800 text-xs font-bold font-sans">
                ⚠️ {errorMessage}
              </div>
            )}
            {/* Person Name & Age */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-600 mb-1 uppercase font-bold">FULL NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-slate-900 focus:outline-none focus:border-purple-600 font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-600 mb-1 uppercase font-bold">AGE & GENDER *</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    required
                    placeholder="Age"
                    value={age}
                    onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                    className="w-1/2 bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-slate-900 focus:outline-none focus:border-purple-600 font-medium"
                  />
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-1/2 bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-slate-900 focus:outline-none focus:border-purple-600 font-medium cursor-pointer"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Photo Selection / Preset */}
            <div>
              <label className="block text-[10px] text-slate-600 mb-1 uppercase font-bold flex items-center space-x-1">
                <Camera className="w-3 h-3 text-purple-700" />
                <span>PERSON PHOTO (PRESET OR PHOTO URL) *</span>
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {PRESET_PHOTOS.map((preset, idx) => (
                  <div
                    key={idx}
                    onClick={() => setPhotoUrl(preset.url)}
                    className={`cursor-pointer rounded border overflow-hidden transition relative ${
                      photoUrl === preset.url ? 'border-purple-600 ring-2 ring-purple-600' : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-14 object-cover" />
                  </div>
                ))}
              </div>
              <input
                type="url"
                required
                placeholder="Or paste custom photo URL..."
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-slate-900 text-[11px] focus:outline-none focus:border-purple-600 font-medium"
              />
            </div>

            {/* Location Coordinates & Sector */}
            <div>
              <label className="block text-[10px] text-slate-600 mb-1 uppercase font-bold flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-purple-700" />
                <span>LAST SEEN LOCATION COORDINATES *</span>
              </label>
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">LATITUDE</span>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={latitude}
                    onChange={(e) => setLatitude(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-slate-900 focus:outline-none focus:border-purple-600 font-medium"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">LONGITUDE</span>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={longitude}
                    onChange={(e) => setLongitude(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-slate-900 focus:outline-none focus:border-purple-600 font-medium"
                  />
                </div>
              </div>
              <input
                type="text"
                placeholder="Sector Name / Landmark (e.g. Sector 4 Riverbed Crossing)"
                value={addressName}
                onChange={(e) => setAddressName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-slate-900 text-[11px] focus:outline-none focus:border-purple-600 font-medium"
              />
            </div>

            {/* Description & Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-600 mb-1 uppercase font-bold flex items-center space-x-1">
                  <Phone className="w-3 h-3 text-purple-700" />
                  <span>EMERGENCY CONTACT PHONE *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 43210"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-slate-900 focus:outline-none focus:border-purple-600 font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-600 mb-1 uppercase font-bold flex items-center space-x-1">
                  <FileText className="w-3 h-3 text-purple-700" />
                  <span>CLOTHING / IDENTIFICATION NOTES</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Blue jacket, red backpack..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-slate-900 focus:outline-none focus:border-purple-600 font-medium"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded font-bold tracking-wider uppercase transition shadow disabled:opacity-50"
              >
                {isSubmitting ? 'SUBMITTING REPORT...' : 'BROADCAST MISSING PERSON REPORT'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
