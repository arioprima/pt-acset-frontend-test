import { useEffect, useState } from 'react';
import { createQueue, getLatestQueue } from '../../services/queueService';
import socket from '../../socket/socket';
import jsPDF from 'jspdf';


export default function CustomerPage() {
    const [latestNumber, setLatestNumber] = useState(0);
    const branch_id = localStorage.getItem('branch_id');
    const counter_id = localStorage.getItem('counter_id');

    useEffect(() => {
        const fetchLatestQueue = async () => {
            if (branch_id && counter_id) {
                try {
                    const result = await getLatestQueue(branch_id, counter_id);
                    if (result.status === 200) {
                        setLatestNumber(result.number || 0);
                    }
                } catch (err) {
                    console.error("Gagal mengambil nomor antrian terbaru", err);
                    setLatestNumber(0);
                }
            }
        }
        fetchLatestQueue();
    }, []);

    useEffect(() => {
        if (branch_id) socket.emit("join_branch", branch_id);
        if (counter_id) socket.emit("join_counter", counter_id);

        socket.on("new_queue_taken", (data) => {
            console.log("Nomor antrian baru:", data);
            setLatestNumber(data?.number || '-');
        });

        return () => {
            socket.off("new_queue_taken");
        };
    }, []);

    const masukAntrian = async () => {
        const branch_id = localStorage.getItem('branch_id');
        const counter_id = localStorage.getItem('counter_id');

        try {
            const result = await createQueue(branch_id, counter_id);
            if (result.status === 200) {
                const number = result.data.number;
                alert(`Nomor antrian Anda: ${number}`);

                // Buat PDF
                const doc = new jsPDF();
                doc.setFontSize(22);
                doc.text("Tiket Antrian", 20, 20);
                doc.setFontSize(16);
                doc.text(`Cabang: ${result.data.branch_id.name}`, 20, 35);
                doc.text(`Lokasi: ${result.data.branch_id.location}`, 20, 45);
                doc.text(`Nomor Antrian Anda:`, 20, 60);
                doc.setFontSize(40);
                doc.text(`${number}`, 20, 85);
                doc.setFontSize(12);
                doc.text(`Waktu: ${new Date(result.data.timestamp).toLocaleString()}`, 20, 105);

                // Unduh PDF
                doc.save(`antrian-${number}.pdf`);
            }
        } catch (err) {
            console.error("Gagal masuk antrian", err);
            alert("Gagal mengambil antrian");
        }
    };

    return (
        <div className="p-4 text-center space-y-4">
            <h1 className="text-2xl font-bold">Nomor Antrian Saat Ini</h1>
            <div className="text-5xl font-mono bg-gray-100 rounded p-4 inline-block">
                {latestNumber}
            </div>

            <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={masukAntrian}
            >
                Masuk Antrian
            </button>
        </div>
    );
}
