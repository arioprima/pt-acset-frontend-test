import { useEffect, useState } from "react"
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table"
import {
    Building2,
    Monitor,
    Filter,
    Clock,
    CheckCircle,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Users,
    Calendar,
} from "lucide-react"
import { getCountersByBranch } from "../../services/counterService"
import { getQueue, markQueueAsDone } from "../../services/queueService"
import { getBranches } from "../../services/branchService"


export default function AdminPage() {
    const [branches, setBranches] = useState([])
    const [counters, setCounters] = useState([])
    const [selectedBranch, setSelectedBranch] = useState("")
    const [selectedCounter, setSelectedCounter] = useState("")
    const [statusFilter, setStatusFilter] = useState("waiting")
    const [queues, setQueues] = useState([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalData, setTotalData] = useState(0)
    const [loading, setLoading] = useState(false)


    useEffect(() => {
        document.title = "Halaman Admin"
    }, [])

    useEffect(() => {
        const fetchBranches = async () => {
            setLoading(true)
            try {
                const { data } = await getBranches()
                setBranches(data)
            } catch (error) {
                console.error("Error fetching branches:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchBranches()
    }, [])

    useEffect(() => {
        const fetchCounters = async () => {
            if (selectedBranch) {
                setLoading(true)
                try {
                    const { data } = await getCountersByBranch(selectedBranch)
                    setCounters(data)
                } catch (error) {
                    console.error("Error fetching counters:", error)
                } finally {
                    setLoading(false)
                }
            } else {
                setCounters([])
                setSelectedCounter("")
            }
        }
        fetchCounters()
    }, [selectedBranch])

    useEffect(() => {
        const fetchQueues = async () => {
            if (!selectedBranch || !selectedCounter) return

            setLoading(true)
            try {
                const params = {
                    branch_id: selectedBranch,
                    counter_id: selectedCounter,
                    page,
                    limit: 10,
                }
                if (statusFilter !== "all") {
                    params.status = statusFilter
                }
                const response = await getQueue(params)
                setQueues(response?.data || [])
                const total = response.pagination?.total || 0
                const limit = response.pagination?.limit || 10
                setTotalPages(Math.ceil(total / limit))
                setTotalData(total)
            } catch (err) {
                console.error("Gagal fetch queue:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchQueues()
    }, [selectedBranch, selectedCounter, page, statusFilter])

    const markDone = async (id) => {
        try {
            setLoading(true)
            await markQueueAsDone(id)
            setPage(1)
            const params = {
                branch_id: selectedBranch,
                counter_id: selectedCounter,
                page: 1,
                limit: 10,
            }
            if (statusFilter !== "all") {
                params.status = statusFilter
            }
            const response = await getQueue(params)
            setQueues(response?.data || [])
            const total = response.pagination?.total || 0
            const limit = response.pagination?.limit || 10
            setTotalPages(Math.ceil(total / limit))
            setTotalData(total)
        } catch (err) {
            console.error("Gagal tandai antrian selesai:", err)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateStr) => {
        const d = new Date(dateStr)
        const yyyy = d.getFullYear()
        const mm = String(d.getMonth() + 1).padStart(2, "0")
        const dd = String(d.getDate()).padStart(2, "0")
        const hh = String(d.getHours()).padStart(2, "0")
        const min = String(d.getMinutes()).padStart(2, "0")
        const ss = String(d.getSeconds()).padStart(2, "0")
        return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case "waiting":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3" />
                        Belum Diproses
                    </span>
                )
            case "done":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3" />
                        Selesai
                    </span>
                )
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <AlertCircle className="w-3 h-3" />
                        Di Tunda
                    </span>
                )
        }
    }

    const columns = [
        {
            header: "No",
            cell: ({ row }) => <div className="font-medium text-gray-900">{(page - 1) * 10 + row.index + 1}</div>,
        },
        {
            header: "Nomor Antrian",
            accessorKey: "number_formatted",
            cell: ({ getValue }) => <div className="font-mono font-bold text-blue-600 text-lg">{getValue()}</div>,
        },
        {
            header: "Antrian",
            accessorKey: "number",
            cell: ({ getValue }) => <div className="text-gray-600">#{getValue()}</div>,
        },
        {
            header: "Waktu",
            accessorFn: (row) => (row.createdAt ? formatDate(row.createdAt) : "-"),
            cell: ({ getValue }) => <div className="text-sm text-gray-500 font-mono">{getValue()}</div>,
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: ({ getValue }) => getStatusBadge(getValue()),
        },
        {
            header: "Aksi",
            cell: ({ row }) => {
                const q = row.original
                return q.status === "waiting" ? (
                    <button
                        onClick={() => markDone(q._id)}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <CheckCircle className="w-4 h-4" />
                        Telah Diproses
                    </button>
                ) : (
                    <span className="text-gray-400 text-sm">Selesai</span>
                )
            },
        },
    ]

    const table = useReactTable({
        data: queues,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    const getPageNumbers = () => {
        const delta = 2
        const range = []
        const rangeWithDots = []

        for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
            range.push(i)
        }

        if (page - delta > 2) {
            rangeWithDots.push(1, "...")
        } else {
            rangeWithDots.push(1)
        }

        rangeWithDots.push(...range)

        if (page + delta < totalPages - 1) {
            rangeWithDots.push("...", totalPages)
        } else if (totalPages > 1) {
            rangeWithDots.push(totalPages)
        }

        return rangeWithDots
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin - Daftar Antrian</h1>
                    </div>

                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="w-5 h-5 text-gray-500" />
                        <h2 className="text-lg font-semibold text-gray-900">Filter Data</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Building2 className="w-4 h-4 inline mr-1" />
                                Pilih Cabang
                            </label>
                            <select
                                value={selectedBranch}
                                onChange={(e) => {
                                    setSelectedBranch(e.target.value)
                                    setSelectedCounter("")
                                    setPage(1)
                                    setQueues([])
                                }}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                disabled={loading}
                            >
                                <option value="">Pilih Cabang</option>
                                {branches.map((b) => (
                                    <option key={b._id} value={b._id}>
                                        {b.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Monitor className="w-4 h-4 inline mr-1" />
                                Pilih Loket
                            </label>
                            <select
                                value={selectedCounter}
                                onChange={(e) => {
                                    setSelectedCounter(e.target.value)
                                    setPage(1)
                                    setQueues([])
                                }}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                                disabled={!selectedBranch || loading}
                            >
                                <option value="">Pilih Loket</option>
                                {counters.map((c) => (
                                    <option key={c._id} value={c._id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <AlertCircle className="w-4 h-4 inline mr-1" />
                                Status Filter
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value)
                                    setPage(1)
                                }}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                disabled={loading}
                            >
                                <option value="waiting">Belum Diproses</option>
                                <option value="done">Selesai</option>
                                <option value="all">Semua</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <th key={header.id} className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={columns.length} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                                <p className="text-gray-500">Memuat data...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : selectedBranch && selectedCounter ? (
                                    queues.length === 0 ? (
                                        <tr>
                                            <td colSpan={columns.length} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="p-3 bg-gray-100 rounded-full">
                                                        <Users className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-900 font-medium">Tidak ada data antrian</p>
                                                        <p className="text-gray-500 text-sm">Belum ada antrian untuk filter yang dipilih</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        table.getRowModel().rows.map((row) => (
                                            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                                {row.getVisibleCells().map((cell) => (
                                                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    )
                                ) : (
                                    <tr>
                                        <td colSpan={columns.length} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="p-3 bg-blue-100 rounded-full">
                                                    <Filter className="w-8 h-8 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-gray-900 font-medium">Pilih cabang dan loket</p>
                                                    <p className="text-gray-500 text-sm">
                                                        Silakan pilih cabang dan loket terlebih dahulu untuk melihat data antrian
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {queues.length > 0 && totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Menampilkan <span className="font-medium">{(page - 1) * 10 + 1}</span> sampai{" "}
                                    <span className="font-medium">{Math.min(page * 10, totalData)}</span> dari{" "}
                                    <span className="font-medium">{totalData}</span> hasil
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPage(page - 1)}
                                        disabled={page === 1 || loading}
                                        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Sebelumnya
                                    </button>

                                    <div className="flex gap-1">
                                        {getPageNumbers().map((pageNum, index) =>
                                            pageNum === "..." ? (
                                                <span key={index} className="px-3 py-2 text-gray-500">
                                                    ...
                                                </span>
                                            ) : (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setPage(pageNum)}
                                                    disabled={loading}
                                                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${page === pageNum
                                                        ? "bg-blue-600 text-white"
                                                        : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                >
                                                    {pageNum}
                                                </button>
                                            ),
                                        )}
                                    </div>

                                    <button
                                        onClick={() => setPage(page + 1)}
                                        disabled={page === totalPages || loading}
                                        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Selanjutnya
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-500">
                        Menampilkan {queues.length} dari {totalData} data
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1 || loading}
                            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Sebelumnya
                        </button>

                        <div className="flex gap-1">
                            {getPageNumbers().map((pageNum, index) =>
                                pageNum === "..." ? (
                                    <span key={index} className="px-3 py-2 text-gray-500">
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPage(pageNum)}
                                        disabled={loading}
                                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${page === pageNum
                                            ? "bg-blue-600 text-white"
                                            : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {pageNum}
                                    </button>
                                ),
                            )}
                        </div>

                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages || loading}
                            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Selanjutnya
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
