import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, Trash2, RefreshCw, ChevronDown, ChevronRight, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLE_STYLE = {
  head_admin: 'bg-purple-50 text-purple-700 border-purple-200',
  admin:      'bg-blue-50   text-blue-700   border-blue-200',
  associate:  'bg-green-50  text-green-700  border-green-200',
};
const RoleBadge = ({ role }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${ROLE_STYLE[role] || ''}`}>
    {role?.replace('_', ' ')}
  </span>
);

// Recursive tree node
const TreeNode = ({ node, onDelete, canDelete, level = 0 }) => {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children?.length > 0;
  return (
    <div className={`${level > 0 ? 'ml-6 border-l border-gray-100 pl-4' : ''}`}>
      <div className="flex items-center justify-between py-2.5 hover:bg-gray-50 rounded-lg px-2 transition-colors">
        <div className="flex items-center gap-2">
          {hasChildren ? (
            <button onClick={() => setOpen(o => !o)} className="text-gray-300 hover:text-gray-500">
              {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : <span className="w-[18px]" />}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold
            ${node.role === 'head_admin' ? 'bg-purple-500' : node.role === 'admin' ? 'bg-blue-500' : 'bg-green-500'}`}>
            {node.profile?.fullName?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{node.profile?.fullName}</p>
            <p className="text-xs text-gray-400">{node.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <RoleBadge role={node.role} />
          <span className={`w-2 h-2 rounded-full ${node.isActive ? 'bg-green-400' : 'bg-gray-300'}`} title={node.isActive ? 'Active' : 'Inactive'} />
          {canDelete && (
            <button onClick={() => onDelete(node._id, node.profile?.fullName)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
      {open && hasChildren && node.children.map(child => (
        <TreeNode key={child._id} node={child} onDelete={onDelete} canDelete={canDelete} level={level + 1} />
      ))}
    </div>
  );
};

export default function UsersList() {
  const { user, authFetch } = useAuth();
  const isHead = user?.role === 'head_admin';
  const [users, setUsers]     = useState([]);
  const [tree, setTree]       = useState([]);
  const [tab, setTab]         = useState('list');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [uRes, tRes] = await Promise.all([
        authFetch('/api/users'),
        authFetch(`/api/users/${user._id}/tree`),
      ]);
      const uData = await uRes.json();
      const tData = await tRes.json();
      setUsers(uData.data || []);
      setTree(tData.data  || []);
    } catch { toast.error('Failed to load users'); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      const res  = await authFetch(`/api/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('User deleted');
      load();
    } catch (err) { toast.error(err.message); }
  };

  const meNode = { ...user, children: tree };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1a3a5c]">
            {isHead ? 'User Management' : 'My Team'}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">{users.length} users</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-ghost border border-gray-200"><RefreshCw size={14} /></button>
          <Link to="/admin/users/create" className="btn-primary"><UserPlus size={14} /> Create User</Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-gray-100">
        {['list', 'tree'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px
              ${tab === t ? 'border-[#1a3a5c] text-[#1a3a5c]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            {t === 'tree' ? '🌳 Tree View' : '📋 List View'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
      ) : tab === 'list' ? (
        <div className="card overflow-hidden">
          {/* Search */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="input-base pl-9" placeholder="Search name or email..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          {users.filter(u => !search || u.profile?.fullName?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">No users yet. <Link to="/admin/users/create" className="text-[#1a3a5c] underline">Create one</Link>.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['User', 'Role', 'Created By', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.filter(u => !search || u.profile?.fullName?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())).map(u => (
                  <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0
                          ${u.role === 'admin' ? 'bg-blue-500' : 'bg-green-500'}`}>
                          {u.profile?.fullName?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{u.profile?.fullName}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                    <td className="px-4 py-3 text-xs text-gray-400">{u.createdBy?.profile?.fullName || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs ${u.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      {isHead && (
                        <button onClick={() => handleDelete(u._id, u.profile?.fullName)}
                          className="btn-ghost px-2 py-1 text-xs text-red-500 hover:text-red-700">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        /* Tree view */
        <div className="card p-5">
          <p className="text-xs text-gray-400 mb-4">Showing your network tree</p>
          <TreeNode node={meNode} onDelete={handleDelete} canDelete={isHead} level={0} />
        </div>
      )}
    </div>
  );
}
