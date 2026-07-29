'use client';

import { useState } from 'react';

type UserFilter = 'all' | 'free' | 'premium' | 'admin';

const FILTERS: Array<{ value: UserFilter; label: string }> = [
  { value: 'all', label: 'Semua' },
  { value: 'free', label: 'Free' },
  { value: 'premium', label: 'Premium' },
  { value: 'admin', label: 'Admin' },
];

export default function AdminUsersPage() {
  const [filter, setFilter] = useState<UserFilter>('all');

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Manajemen Pengguna</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
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

      {/* Users Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Nama</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Email</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Paket</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Bergabung</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-border">
              <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">
                Belum ada pengguna terdaftar.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
