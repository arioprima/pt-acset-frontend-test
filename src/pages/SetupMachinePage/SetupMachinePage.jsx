import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBranches } from '../../services/branchService';
import { getCountersByBranch } from '../../services/counterService';
import { HiComputerDesktop } from 'react-icons/hi2';
import { notificationSucces } from '../../components/toastNotification';

export default function SetupMachinePage() {
    const [branches, setBranches] = useState([]);
    const [counters, setCounters] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedCounter, setSelectedCounter] = useState('');
    const navigate = useNavigate();

    // Ambil data konfigurasi yang tersimpan di localStorage (satu kali saat mount)
    useEffect(() => {
        const storedBranch = localStorage.getItem('branch_id');
        const storedCounter = localStorage.getItem('counter_id');
        if (storedBranch) setSelectedBranch(storedBranch);
        if (storedCounter) setSelectedCounter(storedCounter);
    }, []);

    // Ambil daftar cabang
    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const { data } = await getBranches();
                setBranches(data);
            } catch (err) {
                console.error("Gagal ambil branch:", err);
            }
        };
        fetchBranches();
    }, []);

    // Ambil daftar counter berdasarkan cabang terpilih
    useEffect(() => {
        const fetchCounters = async () => {
            if (selectedBranch) {
                try {
                    const { data } = await getCountersByBranch(selectedBranch);
                    setCounters(data);
                } catch (err) {
                    console.error("Gagal ambil counter:", err);
                }
            } else {
                setCounters([]);
            }
        };
        fetchCounters();
    }, [selectedBranch]);

    const saveMachineConfig = () => {
        localStorage.setItem('branch_id', selectedBranch);
        localStorage.setItem('counter_id', selectedCounter);
        notificationSucces("Konfigurasi mesin berhasil disimpan!");
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-10 px-4">
            <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8 space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-blue-700 mb-2">Konfigurasi Mesin</h1>
                    <p className="text-gray-500 text-sm">Silakan pilih cabang dan counter mesin ini</p>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-3 text-blue-700 font-semibold">
                        <HiComputerDesktop className="text-xl" />
                        Setup Mesin Antrian
                    </div>
                    <p className="text-sm text-blue-600 mt-1 ml-7">Lengkapi informasi di bawah untuk menyimpan konfigurasi mesin</p>
                </div>

                <div className="space-y-2">
                    <label className="block text-gray-700 font-medium">Pilih Cabang</label>
                    <select
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={selectedBranch}
                        onChange={e => setSelectedBranch(e.target.value)}
                    >
                        <option value="">-- Pilih Cabang --</option>
                        {branches.map(branch => (
                            <option key={branch._id} value={branch._id}>{branch.name}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="block text-gray-700 font-medium">Pilih Counter</label>
                    {selectedBranch ? (
                        <select
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={selectedCounter}
                            onChange={e => setSelectedCounter(e.target.value)}
                        >
                            <option value="">-- Pilih Counter --</option>
                            {counters.map(counter => (
                                <option key={counter._id} value={counter._id}>{counter.name}</option>
                            ))}
                        </select>
                    ) : (
                        <p className="text-gray-400 text-sm">Silakan pilih cabang terlebih dahulu</p>
                    )}
                </div>

                <div className="pt-4 text-center">
                    <button
                        className={`w-full py-3 rounded-lg text-white font-semibold transition-all duration-200 ${selectedBranch && selectedCounter
                            ? 'bg-blue-600 hover:bg-blue-700 shadow-md hover:-translate-y-0.5'
                            : 'bg-gray-300 cursor-not-allowed'
                            }`}
                        onClick={saveMachineConfig}
                        disabled={!selectedBranch || !selectedCounter}
                    >
                        Simpan Konfigurasi
                    </button>
                    <p className="text-gray-500 text-sm mt-3">Pastikan semua informasi sudah benar sebelum menyimpan.</p>
                </div>
            </div>
        </div>
    );
}
