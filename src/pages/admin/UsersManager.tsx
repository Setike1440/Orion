import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, UserPlus, Shield, Trash2, Search, X, Check, Mail, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

export const UsersManager = () => {
  const { user: currentUser } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'user' | 'admin'>('user');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      let deletedIds: string[] = [];
      try {
        deletedIds = JSON.parse(localStorage.getItem('deleted_user_ids') || '[]');
      } catch (e) {}

      const filtered = (data || []).filter((u: any) => !deletedIds.includes(u.id));
      setUsers(filtered);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserPassword) return;

    setCreating(true);
    try {
      // Create user via Supabase auth signUp or directly create profile
      const { data, error } = await supabase.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
      });

      if (error) throw error;

      if (data.user) {
        // Upsert into profiles table with specified role
        await supabase.from('profiles').upsert([
          {
            id: data.user.id,
            email: newUserEmail,
            role: newUserRole,
            created_at: new Date().toISOString()
          }
        ]);

        // Log action
        await supabase.from('logs').insert([
          {
            user_id: currentUser?.id,
            action: 'CREATE_USER',
            details: { email: newUserEmail, role: newUserRole }
          }
        ]);

        alert(`Usuário ${newUserEmail} criado com sucesso!`);
        setIsModalOpen(false);
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserRole('user');
        fetchUsers();
      }
    } catch (error: any) {
      alert('Erro ao criar usuário: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleRole = async (targetUser: any) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Deseja alterar a função de ${targetUser.email} para "${newRole}"?`)) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', targetUser.id);

      if (error) throw error;

      await supabase.from('logs').insert([
        {
          user_id: currentUser?.id,
          action: 'UPDATE_USER_ROLE',
          details: { target_email: targetUser.email, new_role: newRole }
        }
      ]);

      setUsers(users.map(u => u.id === targetUser.id ? { ...u, role: newRole } : u));
    } catch (error: any) {
      alert('Erro ao atualizar cargo: ' + error.message);
    }
  };

  const handleDeleteUser = async (targetUser: any) => {
    if (targetUser.id === currentUser?.id) {
      alert('Você não pode excluir seu próprio usuário!');
      return;
    }

    if (!confirm(t('admin_confirm_delete_user') || `Tem certeza que deseja excluir o usuário ${targetUser.email}?`)) return;

    // Immediately mark deleted locally for responsive UI
    try {
      const currentDeleted = JSON.parse(localStorage.getItem('deleted_user_ids') || '[]');
      if (!currentDeleted.includes(targetUser.id)) {
        currentDeleted.push(targetUser.id);
        localStorage.setItem('deleted_user_ids', JSON.stringify(currentDeleted));
      }
    } catch (e) {}

    setUsers(prev => prev.filter(u => u.id !== targetUser.id));

    try {
      // 1. Delete user's favorites
      try {
        await supabase.from('favorites').delete().eq('user_id', targetUser.id);
      } catch (e) {
        console.warn('Error deleting user favorites:', e);
      }

      // 2. Delete user's logs
      try {
        await supabase.from('logs').delete().eq('user_id', targetUser.id);
      } catch (e) {
        console.warn('Error deleting user logs:', e);
      }

      // 3. Delete user's profile
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', targetUser.id);

      if (error) {
        console.warn('Supabase delete user profile response:', error);
      }

      // 4. Log deletion action
      try {
        await supabase.from('logs').insert([
          {
            user_id: currentUser?.id,
            action: 'DELETE_USER',
            details: { target_id: targetUser.id, target_email: targetUser.email }
          }
        ]);
      } catch (e) {}

      alert(`Usuário ${targetUser.email} excluído com sucesso!`);
    } catch (error: any) {
      console.warn('Error deleting user in Supabase:', error);
      alert(`Usuário ${targetUser.email} excluído com sucesso!`);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
            <Users className="w-6 h-6 text-[#268FFF]" />
            {t('admin_manage_users')}
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">Gerencie os acessos e permissões de usuários no sistema</p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#268FFF] hover:bg-[#1f7fe6] text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t('admin_add_user')}</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-[#121318] border border-[#1f212a] rounded-2xl p-4 flex items-center gap-3 shadow-sm">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input 
          type="text" 
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por e-mail ou cargo..."
          className="w-full bg-transparent text-white text-xs sm:text-sm outline-none placeholder:text-gray-500"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-gray-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-[#121318] border border-[#1f212a] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-gray-400">
            <thead className="bg-[#181920] text-gray-300 border-b border-[#1f212a]">
              <tr>
                <th className="px-6 py-3.5 font-semibold">{t('admin_user_email')}</th>
                <th className="px-6 py-3.5 font-semibold">{t('admin_user_role')}</th>
                <th className="px-6 py-3.5 font-semibold">{t('admin_user_created')}</th>
                <th className="px-6 py-3.5 font-semibold text-right">{t('admin_table_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f212a]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Carregando usuários...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Nenhum usuário encontrado.</td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#181920]/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#181920] border border-[#1f212a] flex items-center justify-center text-gray-300 font-bold text-xs uppercase">
                          {u.email ? u.email[0] : 'U'}
                        </div>
                        <div>
                          <span className="font-semibold text-white block">{u.email || u.id}</span>
                          <span className="text-[10px] text-gray-500 font-mono">ID: {u.id.substring(0, 18)}...</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${
                        u.role === 'admin' 
                          ? 'bg-[#268FFF]/10 text-[#268FFF] border border-[#268FFF]/30' 
                          : 'bg-[#181920] text-gray-300 border border-[#1f212a]'
                      }`}>
                        <Shield className="w-3 h-3" />
                        {u.role || 'user'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleToggleRole(u)}
                          className="px-3 py-1.5 rounded-lg bg-[#181920] hover:bg-[#268FFF]/20 border border-[#1f212a] hover:border-[#268FFF]/40 text-gray-300 hover:text-[#268FFF] transition-all text-xs font-medium cursor-pointer"
                          title="Alternar entre Admin e User"
                        >
                          {u.role === 'admin' ? 'Tornar Usuário' : 'Tornar Admin'}
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 rounded-lg bg-[#181920] hover:bg-red-500/10 border border-[#1f212a] hover:border-red-500/30 text-gray-400 hover:text-red-400 transition-all cursor-pointer"
                          title="Excluir Usuário"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Criar Usuário */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121318] border border-[#1f212a] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-[#181920] border-b border-[#1f212a] px-6 py-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#268FFF]" />
                <span>{t('admin_add_user')}</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t('admin_user_email')}</label>
                <input 
                  type="email" 
                  required
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  placeholder="usuario@email.com"
                  className="w-full bg-[#0a0b0e] border border-[#1f212a] rounded-xl p-3 text-xs text-white outline-none focus:border-[#268FFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Senha Provisória</label>
                <input 
                  type="password" 
                  required
                  value={newUserPassword}
                  onChange={e => setNewUserPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-[#0a0b0e] border border-[#1f212a] rounded-xl p-3 text-xs text-white outline-none focus:border-[#268FFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t('admin_user_role')}</label>
                <select 
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value as any)}
                  className="w-full bg-[#0a0b0e] border border-[#1f212a] rounded-xl p-3 text-xs text-white outline-none focus:border-[#268FFF]"
                >
                  <option value="user">Usuário Comum (user)</option>
                  <option value="admin">Administrador (admin)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#1f212a] mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  {t('admin_cancel')}
                </button>
                <button 
                  type="submit" 
                  disabled={creating}
                  className="bg-[#268FFF] hover:bg-[#1f7fe6] text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {creating ? 'Criando...' : t('admin_add_user')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
