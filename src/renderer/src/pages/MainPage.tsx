// src/pages/MainPage.tsx
import React, { useEffect, useState } from 'react';
import { Clock, Search, User, Sparkles } from 'lucide-react';
import supabase from '../services/supabase';

export type AppState = 'main' | 'preview' | 'results';

type Props = {
  setAppState: (s: AppState) => void;
  setNik: (nik: string) => void;
};

type DataAnak = { nik: string; nama: string; aktif: boolean };

const LS_KEY = 'recent_nik_anak';

const MainPage: React.FC<Props> = ({ setAppState, setNik }) => {
  /* ---------- local state ---------- */
  const [nik, setNikLocal] = useState('');
  const [suggestions, setSuggestions] = useState<DataAnak[]>([]);
  const [recent, setRecent] = useState<DataAnak[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedNik, setSelectedNik] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);

  const canStart = !!nik.trim();

  /* ---------- recent helpers ---------- */
  const loadRecent = () => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as DataAnak[];
      if (Array.isArray(parsed)) setRecent(parsed.slice(0, 5));
    } catch {
      // ignore parse errors
    }
  };

  const saveRecent = (item: DataAnak) => {
    const next = [item, ...recent.filter((r) => r.nik !== item.nik)].slice(0, 5);
    setRecent(next);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(next));
    } catch {
      // storage might be unavailable; ignore
    }
  };

  useEffect(() => {
    loadRecent();
  }, []);

  /* ---------- fetch ---------- */
  const fetchSuggestions = async (q: string) => {
    if (!q.trim()) return setSuggestions([]);
    if (selectedNik && q === selectedNik) return;

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('DataAnak')
        .select('nik, nama, aktif')
        .ilike('nik', `%${q}%`)
        .limit(5);
      if (error) throw error;
      setSuggestions(data || []);
    } catch {
      setError('Gagal mengambil data dari server.');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- debounce ---------- */
  useEffect(() => {
    if (isSelecting) return;
    if (selectedNik && nik === selectedNik) return;

    const t = setTimeout(() => {
      if (nik.trim().length >= 3) fetchSuggestions(nik);
      else setSuggestions([]);
    }, 400);
    return () => clearTimeout(t);
  }, [nik, isSelecting, selectedNik]);

  /* ---------- handlers ---------- */
  const handleSelect = (anak: DataAnak) => {
    setIsSelecting(true);
    setNikLocal(anak.nik);
    setSelectedNik(anak.nik);
    setSuggestions([]);
    saveRecent(anak);
    setTimeout(() => setIsSelecting(false), 0);
  };

  const handleRecentSelect = (anak: DataAnak) => {
    handleSelect(anak);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNikLocal(val);
    if (selectedNik && val !== selectedNik) setSelectedNik(null);
  };

  const handleStart = () => {
    if (!canStart) {
      setError('Silakan pilih/isi NIK terlebih dahulu.');
      return;
    }
    setError(null);
    setNik(nik); // kirim ke parent
    setAppState('preview');
  };

  /* tampilkan dropdown */
  const showLiveSuggestions = suggestions.length > 0 && !selectedNik;
  const showRecent =
    inputFocused && !showLiveSuggestions && recent.length > 0 && nik.trim().length < 3;

  /* ---------- render ---------- */
  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen bg-gray-100 px-6">
      {/* HERO – disembunyikan saat input fokus */}
      <div
        className={`flex flex-col items-center text-center max-w-2xl space-y-1 transition-all duration-300 ease-in-out ${
          inputFocused ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
        }`}
      >
        <span className="px-4 py-1.5 text-sm font-semibold bg-brand-600/20 text-brand-700 rounded-full">
          Powered by AI
        </span>
        <h1 className="text-3xl md:text-3xl font-bold text-gray-800 leading-tight">
          Smart growth monitoring for a
          <br />
          <span className="text-brand-700">brighter future.</span>
        </h1>
      </div>

      {/* INPUT WRAPPER – geser ke tengah saat hero hilang */}
      <div
        className={`relative max-w-xl w-full transition-all duration-300 ease-in-out ${
          inputFocused ? '-mt-24' : 'mt-4'
        }`}
      >
        <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              value={nik}
              onChange={handleChange}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="Masukkan NIK Anak"
              className="w-full pl-10 pr-4 py-2 rounded-md bg-gray-200 text-sm font-semibold focus:outline-none"
            />
          </div>
          <button
            onClick={handleStart}
            disabled={!canStart || loading}
            className="group relative flex items-center justify-center px-6 py-2 text-sm font-bold text-white bg-brand-700 hover:bg-brand-800 rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="transition-opacity duration-200 group-hover:opacity-0">Mulai</span>
            <Sparkles className="absolute opacity-0 group-hover:opacity-100 w-4 h-4 transition-opacity duration-200" />
          </button>
        </div>

        {/* Live suggestions */}
        {showLiveSuggestions && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto p-2">
            {suggestions.map((anak) => (
              <div
                key={anak.nik}
                onClick={() => handleSelect(anak)}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200 cursor-pointer text-sm rounded-md"
              >
                <User className="w-4 h-4 text-brand-700" />
                <span className="text-gray-800 font-semibold">{anak.nama}</span>
                <span className="text-gray-500">({anak.nik})</span>
              </div>
            ))}
          </div>
        )}

        {/* Recent searches (muncul saat input fokus & belum ada kueri memadai) */}
        {showRecent && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto p-2">
            <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              Pencarian terakhir
            </div>
            {recent.map((anak) => (
              <div
                key={`recent-${anak.nik}`}
                onMouseDown={(e) => e.preventDefault()} // cegah blur saat klik
                onClick={() => handleRecentSelect(anak)}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm rounded-md"
              >
                <User className="w-4 h-4 text-brand-700" />
                <span className="text-gray-800 font-semibold">{anak.nama}</span>
                <span className="text-gray-500">({anak.nik})</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 font-medium bg-red-50 border border-red-200 rounded-md p-2 max-w-lg text-center mt-4">
          {error}
        </p>
      )}
    </div>
  );
};

export default MainPage;
