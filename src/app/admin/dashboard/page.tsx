export default function AdminDashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Dashboard Admin</h1>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Pengguna', value: '0', change: '+0 bulan ini' },
          { label: 'Total Dokumen', value: '0', change: '+0 bulan ini' },
          { label: 'Total Chat', value: '0', change: '+0 bulan ini' },
          { label: 'API Calls (Bulan Ini)', value: '0', change: 'Rp 0 cost' },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface border border-border rounded-xl p-4">
            <p className="text-sm text-text-secondary">{stat.label}</p>
            <p className="text-2xl font-bold text-text-primary mt-1">{stat.value}</p>
            <p className="text-xs text-text-secondary mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="font-semibold text-text-primary mb-4">Aktivitas Terbaru</h2>
        <div className="text-center py-8 text-text-secondary">
          <p>Belum ada aktivitas</p>
          <p className="text-sm mt-1">Aktivitas akan muncul setelah pengguna mulai menggunakan aplikasi</p>
        </div>
      </div>
    </div>
  );
}
