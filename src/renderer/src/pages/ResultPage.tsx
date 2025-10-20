// src/pages/ResultPage.tsx
import React, { useEffect, useState } from 'react';
import { ImageIcon, Repeat, Loader, SaveIcon } from 'lucide-react';
import supabase from '../services/supabase';
import { base64ToArrayBuffer } from '@renderer/utils/base64Tobinary';
import { on } from 'events';

type Status = [number, 'Normal' | 'Stunted' | 'Severely Stunted' | 'Tall'];

type Props = {
  data: {
    height: number;
    weight: number;
    status: Status;
    image: string; // base64
    message: string;
  };
  nik: string;
  onRetake: () => void;
};

const ResultPage: React.FC<Props> = ({ data, nik, onRetake }) => {
  const [saving, setSaving] = useState(false);
  const [hazScore, nutrition] = data.status;
  const [user, setUser] = useState<{
    nama?: string;
    tanggal_lahir?: string;
    gender?: string;
    umur?: number;
    tempat_lahir?: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u, error } = await supabase
        .from('DataAnak')
        .select('nama, tanggal_lahir, gender, umur, tempat_lahir')
        .eq('nik', nik)
        .single();
      if (!error) setUser(u);
    })();
  }, [nik]);

  const goHome = () => (window.location.href = '/');

    // 2. The actual handler
const saveHandler = async () => {
  setSaving(true);

  /* 1. upload image → dapat publicUrl */
  let imageUrl: string | null = null;
  if (data.image) {
    try {
      const { buffer, ext } = base64ToArrayBuffer(data.image);
      const fileName = `${nik}-${Date.now()}.${ext}`;
      const { data: up } = await supabase.storage
        .from('pemindaian')
        .upload(`${nik}/${fileName}`, buffer, {
          contentType: `image/${ext}`,
          upsert: true,
        });
      const { data: { publicUrl } } = supabase.storage
        .from('pemindaian')
        .getPublicUrl(up?.path ?? '');
      imageUrl = publicUrl;
    } catch (e: any) {
      setSaving(false);
      console.log('Gagal upload gambar: ' + e.message);
      return;
    }
  }

  /* 2. siapkan payload minimal */
  const payload = {
    nik,
    tinggi: data.height,
    berat: data.weight,
    status: nutrition,
    image: imageUrl,
    tanggal_pemeriksaan: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
  };

  /* 3. upsert → 1 row per nik + tanggal */
  const { error } = await supabase
    .from('Analisis')
    .upsert(payload, { onConflict: 'nik,tanggal_pemeriksaan' });

  setSaving(false);
  if (error) {
    console.log('Gagal menyimpan: ' + error.message);
  } else {
    console.log('Data berhasil disimpan');
    goHome();
  }
};

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen bg-gray-200 text-gray-800 p-4">
      <div className="flex flex-col bg-white h-full w-full rounded-lg shadow-lg px-2 py-2">
        <h1 className="font-sans text-lg text-gray-600 font-semibold pl-2 pb-2">
          HASIL PEMERIKSAAN
        </h1>
        <div className="flex flex-1 gap-2 bg-gray-200 p-2 rounded-lg border border-gray-300">
          {/* left column */}
          <div className="flex flex-col w-[60%] gap-2">

            <div className="w-full flex items-center">
              <h2 className="text-gray-500 font-sans text-sm font-medium">STATUS GIZI</h2>
              <div className="bg-white border border-gray-300 text-sm rounded-md shadow-sm ml-auto p-0.5">
                <div className="bg-brand-800/20 text-brand-800 font-sans rounded-sm font-semibold px-5 py-1">
                  {nutrition.toUpperCase()}
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-300 rounded-lg shadow-sm h-68 p-2">
                <div className="w-full h-full rounded-lg overflow-hidden">
                {data.image ? (
                    <img
                    src={`data:image/jpeg;base64,${data.image}`}
                    alt="Captured"
                    className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                    <ImageIcon className="w-12 h-12 mb-2" />
                    <p>No Image Available</p>
                    </div>
                )}
                </div>
            </div>
            <div className='flex flex-row gap-4'>
                <button className="w-full flex flex-1 items-center justify-center bg-gray-200 hover:bg-white border border-gray-300 rounded-lg p-4"
                    onClick={onRetake}
                >
                    <Repeat className="w-5 h-5 font-normal mr-2"/>
                    Ulangi
                </button>
                <button
                    onClick={saveHandler}
                    disabled={saving}
                    className={`
                        w-full flex flex-1 items-center justify-center
                        bg-brand-700 hover:bg-brand-900
                        transition border text-white rounded-lg p-4
                        disabled:opacity-70 disabled:cursor-not-allowed
                    `}
                    >
                    {saving ? (
                        <>
                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                        Menyimpan...
                        </>
                    ) : (
                        <>
                        <SaveIcon className="w-5 h-5 mr-2" />
                        Simpan
                        </>
                    )}
                </button>
            </div>
          </div>

          {/* right column */}
          <div className="flex-col bg-white border border-gray-300 rounded-lg shadow-sm w-[40%] h-full flex items-center justify-center p-2">
            <h3 className="text-center rounded-md text-gray-800 w-full py-1 text-sm">
              SUMMARY
            </h3>
            <div className="flex flex-1 w-full flex-col justify-center gap-3 mt-2 p-4 bg-gray-200 border border-gray-300 rounded-md">
              <div className='flex flex-col'>
                <p className="text-gray-500 font-sans text-sm">Nama</p>
                <span className="font-sans font-medium text-sm">{user?.nama ?? '—'}</span>
              </div>
              <div className='flex flex-col'>
                <p className="text-gray-500 font-sans text-sm">NIK</p>
                <span className="font-sans font-medium text-sm">{nik ?? '—'}</span>
              </div>

              <div className='flex gap-10'>
                <div className='flex flex-col'>
                    <p className="text-gray-500 font-sans text-sm">Jenis Kelamin</p>
                    <span className="font-sans font-medium text-sm">{user?.gender === 'L' ? 'Laki-Laki' : 'Perempuan'}</span>
                </div>
                <div className='flex flex-col'>
                    <p className="text-gray-500 font-sans text-sm">Tempat Lahir</p>
                    <span className="font-sans font-medium text-sm">{user?.tempat_lahir ?? '—'}</span>
                </div>
              </div>

              <div className='flex flex-col'>
                <p className="text-gray-500 font-sans text-sm">Tanggal Lahir</p>
                <span className="font-sans font-medium text-sm">{user?.tanggal_lahir ?? '—'}</span>
              </div>
            </div>

            <div className="flex flex-1 w-full flex-row gap-10 mt-2 p-4 bg-gray-200 border border-gray-300 rounded-md">
              <div className='flex flex-col justify-center'>
                <p className="text-gray-500 font-sans text-sm">Berat (kg)</p>
                <span className="font-sans font-medium text-sm">{data?.weight.toFixed(5) ?? '—'}</span>
              </div>
              <div className='flex flex-col justify-center'>
                <p className="text-gray-500 font-sans text-sm">Tinggi (cm)</p>
                <span className="font-sans font-medium text-sm">{data?.height.toFixed(5) ?? '—'}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;