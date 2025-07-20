import { useEffect, useState } from "react"
import jsPDF from "jspdf"
import { getLatestQueue, createQueue } from "../../services/queueService"
import socket from '../../socket/socket';
import JsBarcode from "jsbarcode";


export default function CustomerPage() {
    const [latestNumber, setLatestNumber] = useState(0)
    const [loading, setLoading] = useState(false)
    const [isConnected, setIsConnected] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    const branch_id = localStorage.getItem("branch_id")
    const counter_id = localStorage.getItem("counter_id")
    const branchInfo = JSON.parse(localStorage.getItem('branch_info'));

    useEffect(() => {
        console.log('isConnected:', isConnected)
    }, [isConnected])

    useEffect(() => {
        const fetchLatestQueue = async () => {
            if (branch_id && counter_id) {
                try {
                    const result = await getLatestQueue(branch_id, counter_id)
                    if (result.status === 200) {
                        console.log("Latest queue data:", result.number)
                        setLatestNumber(result.number || 0)
                    }
                } catch (err) {
                    console.error("Gagal mengambil nomor antrian terbaru", err)
                    setLatestNumber(0)
                }
            }
        }
        fetchLatestQueue()
    }, [])

    useEffect(() => {
        if (socket.connected) {
            setIsConnected(true)
        }

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
        setLoading(true);

        try {
            const result = await createQueue(branch_id, counter_id);
            if (result.status === 200) {
                const number = result.data.number || 0;
                const number_formatted = result?.data?.number_formatted || number
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);

                const now = new Date();
                const dateStr = now.toLocaleDateString('id-ID').replace(/\//g, '-');
                const timeStr = now.toLocaleTimeString('id-ID', { hour12: false }).replace(/\./g, ':').replace(/:/g, '-');

                const canvas = document.getElementById("barcode-canvas");
                JsBarcode(canvas, `${number}`, {
                    format: "CODE128",
                    displayValue: false,
                    height: 40,
                    width: 2,
                    margin: 0,
                });

                const barcodeImage = canvas.toDataURL("image/png");

                const doc = new jsPDF({
                    orientation: "portrait",
                    unit: "mm",
                    format: [80, 150],
                });

                doc.setFontSize(16);
                doc.setFont(undefined, "bold");
                doc.text("TIKET ANTRIAN", 40, 15, { align: "center" });

                doc.setFontSize(10);
                doc.setFont(undefined, "normal");
                doc.text(`${branchInfo.name}`, 40, 25, { align: "center" });
                doc.text(`${branchInfo.location}`, 40, 30, { align: "center" });

                doc.setFontSize(20);
                doc.setFont(undefined, "bold");
                doc.text(`${number_formatted}`, 40, 50, { align: "center" });

                doc.setFontSize(10);
                doc.setFont(undefined, "normal");
                doc.text(`Tanggal: ${now.toLocaleDateString("id-ID")}`, 40, 65, { align: "center" });
                doc.text(`Waktu: ${now.toLocaleTimeString("id-ID", { hour12: false })}`, 40, 70, { align: "center" });
                doc.addImage(barcodeImage, "PNG", 20, 80, 40, 20);

                doc.setFontSize(8);
                doc.text("Terima kasih atas kunjungan Anda", 40, 105, { align: "center" });
                doc.text("Tunjukkan tiket ini saat dipanggil", 40, 110, { align: "center" });

                doc.save(`tiket-antrian-${number}-${dateStr}_${timeStr}.pdf`);
            }
        } catch (err) {
            console.error("Gagal masuk antrian", err);
            alert("Gagal mengambil antrian");
        } finally {
            setLoading(false);
        }
    };




    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
                <div
                    className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"
                    style={{ animationDelay: "2s" }}
                ></div>
                <div
                    className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"
                    style={{ animationDelay: "4s" }}
                ></div>
            </div>
            {showSuccess && (
                <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500 animate-bounce">
                    <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span className="font-medium">Tiket berhasil diambil!</span>
                    </div>
                </div>
            )}

            <div className="relative z-10 p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <header className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                        Sistem Antrian Digital
                                    </h1>

                                </div>
                            </div>

                            {/* Connection Status */}
                            <div className="flex items-center space-x-2">
                                <div
                                    className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"}`}
                                ></div>
                                <span className={`text-sm font-medium ${isConnected ? "text-green-600" : "text-red-600"}`}>
                                    {isConnected ? "Terhubung" : "Terputus"}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Cabang</p>
                                        <p className="font-bold text-blue-700">{branchInfo.name || "Cabang Utama Jakarta"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Lokasi</p>
                                        <p className="font-bold text-purple-700">
                                            {branchInfo.location || "Jl. Sudirman No. 123, Jakarta"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                        <div className="xl:col-span-4">
                            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Nomor Antrian Saat Ini</h2>
                                </div>
                                <div className="relative mb-8 flex justify-center">
                                    <div className="w-full max-w-md bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 rounded-3xl p-12 shadow-xl hover:shadow-2xl transition-all duration-300">
                                        <div className="text-white text-8xl md:text-9xl font-black font-mono tracking-wider text-center">
                                            {latestNumber}
                                        </div>

                                    </div>
                                </div>
                                <div className="text-center">
                                    <button
                                        className={`group relative inline-flex items-center justify-center px-8 py-4 text-xl font-bold text-white rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 ${loading
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 hover:from-green-600 hover:via-emerald-700 hover:to-teal-700"
                                            }`}
                                        onClick={masukAntrian}
                                        disabled={loading}
                                    >
                                        <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <div className="relative z-10 flex items-center space-x-3">
                                            {loading ? (
                                                <>
                                                    <svg
                                                        className="animate-spin h-6 w-6 text-white"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        ></circle>
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                        ></path>
                                                    </svg>
                                                    <span>Memproses...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                                        />
                                                    </svg>
                                                    <span>Ambil Nomor Antrian</span>
                                                </>
                                            )}
                                        </div>
                                    </button>
                                    <p className="text-gray-500 text-sm mt-3">Klik untuk mendapatkan tiket antrian digital</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <canvas id="barcode-canvas" style={{ display: "none" }}></canvas>
        </div>
    )
}