'use client';

import { useState } from 'react';

export default function AdminDocumentsPage() {
  const [filter, setFilter] = useState<'all' | 'uu' | 'pp' | 'putusan'>('all');

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Manajemen Dokumen</h1>
        <button className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition">
          + Tambah Dokumen
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {[
          { value: 'all', label: 'Semua' },
          { value: 'uu', label: 'UU' },
          { value: 'pp', label: 'PP' },
          { value: 'putusan', label: 'Putusan' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === f.value
                ? 'bg-primary text-white'
                : 'bg-muted text-text-secondary hover:text-text-primary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Documents Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Judul</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Tipe</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Tanggal</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-border">
              <td colSpan={4} className="px-4 py-8 text-center text-text-secondary">
                Belum ada dokumen. Gunakan script scraper untuk import data.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
