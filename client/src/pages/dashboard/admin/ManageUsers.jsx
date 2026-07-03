import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Search, Trash2 } from 'lucide-react';

import PageHeader from '../../../components/dashboard/PageHeader';
import DataTable from '../../../components/dashboard/DataTable';
import Pagination from '../../../components/common/Pagination';
import Select from '../../../components/ui/Select';
import api from '../../../lib/axios';
import { timeAgo } from '../../../lib/format';
import { selectUser } from '../../../features/auth/authSlice';

const roleOptions = [
  { value: 'user', label: 'User' },
  { value: 'agent', label: 'Agent' },
  { value: 'admin', label: 'Admin' },
];

export default function ManageUsers() {
  const me = useSelector(selectUser);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (params) => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users', { params });
      setUsers(data.users);
      setTotal(data.total);
      setPage(data.page);
      setPages(data.pages);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load({ q, role, page });
  }, [load, q, role, page]);

  const handleRoleChange = async (user, newRole) => {
    try {
      await api.put(`/admin/users/${user._id}/role`, { role: newRole });
      setUsers((list) => list.map((u) => (u._id === user._id ? { ...u, role: newRole } : u)));
      toast.success(`${user.name} is now ${newRole}`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.name} (${user.email}) and all their listings? This cannot be undone.`)) {
      return;
    }
    try {
      await api.delete(`/admin/users/${user._id}`);
      setUsers((list) => list.filter((u) => u._id !== user._id));
      setTotal((t) => t - 1);
      toast.success('User deleted');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <PageHeader title="Manage Users" subtitle={`${total} registered user${total === 1 ? '' : 's'}`} />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or email…"
            aria-label="Search users"
            className="input-field pl-10"
          />
        </div>
        <Select
          name="roleFilter"
          aria-label="Filter by role"
          placeholder="All roles"
          options={roleOptions}
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
          className="w-44"
        />
      </div>

      <DataTable
        isLoading={loading}
        rows={users}
        emptyMessage="No users match your search"
        columns={[
          {
            key: 'name',
            header: 'User',
            render: (u) => (
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-600 text-sm font-semibold text-white">
                  {u.avatar ? <img src={u.avatar} alt="" className="h-full w-full object-cover" /> : u.name?.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900 dark:text-white">
                    {u.name}
                    {u._id === me?._id && <span className="ml-1.5 text-xs text-primary-600 dark:text-primary-400">(you)</span>}
                  </p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                </div>
              </div>
            ),
          },
          { key: 'listings', header: 'Listings', className: 'text-center', render: (u) => <span className="block text-center">{u.listings}</span> },
          { key: 'createdAt', header: 'Joined', render: (u) => timeAgo(u.createdAt) },
          {
            key: 'role',
            header: 'Role',
            render: (u) =>
              u._id === me?._id ? (
                <span className="font-medium capitalize text-gray-500">{u.role}</span>
              ) : (
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u, e.target.value)}
                  aria-label={`Role for ${u.name}`}
                  className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs font-medium capitalize text-gray-700 outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                >
                  {roleOptions.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              ),
          },
          {
            key: 'actions',
            header: '',
            render: (u) =>
              u._id !== me?._id && (
                <button
                  type="button"
                  onClick={() => handleDelete(u)}
                  aria-label={`Delete ${u.name}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ),
          },
        ]}
      />

      <Pagination page={page} pages={pages} onChange={setPage} />
    </>
  );
}
