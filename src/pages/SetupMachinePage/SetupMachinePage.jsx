import { useEffect, useState } from 'react';
import { getBranches } from '../../services/branchService';
import { getCountersByBranch } from '../../services/counterService';
import { useNavigate } from 'react-router-dom';

export default function SetupMachinePage() {
    const [branches, setBranches] = useState([]);
    const [counters, setCounters] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedCounter, setSelectedCounter] = useState('');
    const navigate = useNavigate();

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
        alert('Mesin berhasil dikonfigurasi.');

        navigate('/');
    };

    return (
        <div className="p-4 max-w-lg mx-auto space-y-4">
            <h1 className="text-2xl font-bold">Konfigurasi Mesin</h1>
            <div>
                <label className="block mb-1">Pilih Branch</label>
                <select
                    className="w-full border rounded p-2"
                    value={selectedBranch}
                    onChange={e => setSelectedBranch(e.target.value)}
                >
                    <option value="">-- Pilih Branch --</option>
                    {branches.map(branch => (
                        <option key={branch._id} value={branch._id}>{branch.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block mb-1">Pilih Counter</label>
                <select
                    className="w-full border rounded p-2"
                    value={selectedCounter}
                    onChange={e => setSelectedCounter(e.target.value)}
                >
                    <option value="">-- Pilih Counter --</option>
                    {counters.map(counter => (
                        <option key={counter._id} value={counter._id}>{counter.name}</option>
                    ))}
                </select>
            </div>
            <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={saveMachineConfig}
                disabled={!selectedBranch || !selectedCounter}
            >
                Simpan Konfigurasi
            </button>
        </div>
    );
}