import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, UserPlus, Shield, Trash2, Search, X, Check, Mail, Calendar, Edit2, Key, UserCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ConfirmModal, AdminToast } from '../../components/admin/AdminModal';
import { usePageTitle } from '../../hooks/usePageTitle';

export const UsersManager = () => {
  usePageTitle('Gerenciar Usuários');
  const { user: currentUser, updateProfile } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  
  // Form states
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'user' | 'admin'>('user');
  const [saving, setSaving] = useState(false);

  // Popups & Toasts
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  
  // Confirm Modal state
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

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

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setNewUserEmail('');
    setNewUserUsername('');
    setNewUserPassword('');
    setNewUserRole('user');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (targetUser: any) => {
    setEditingUser(targetUser);
    setNewUserEmail(targetUser.email || '');
    setNewUserUsername(targetUser.username || targetUser.email?.split('@')[0] || '');
    setNewUserPassword('');
    setNewUserRole(targetUser.role || 'user');
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail) return;

    setSaving(true);
    try {
      if (editingUser) {
        // Edit existing user profile
        let { error } = await supabase
          .from('profiles')
          .update({
            email: newUserEmail,
            username: newUserUsername.trim() || newUserEmail.split('@')[0],
            role: newUserRole,
          })
          .eq('id', editingUser.id);

        if (error && (error.message?.includes('username') || error.code === 'PGRST204')) {
          // If username column does not exist in Supabase schema cache yet, update without username
          const retry = await supabase
            .from('profiles')
            .update({
              email: newUserEmail,
              role: newUserRole,
            })
            .eq('id', editingUser.id);
          error = retry.error;
        }

        if (error) throw error;

        await supabase.from('logs').insert([
          {
            user_id: currentUser?.id,
            action: 'UPDATE_USER',
            details: { target_id: editingUser.id, email: newUserEmail, username: newUserUsername, role: newUserRole }
          }
        ]);

        const finalUsername = newUserUsername.trim() || newUserEmail.split('@')[0];

        try {
          const localUsernames = JSON.parse(localStorage.getItem('custom_usernames') || '{}');
          localUsernames[editingUser.id] = finalUsername;
          localStorage.setItem('custom_usernames', JSON.stringify(localUsernames));
        } catch (err) {}

        if (editingUser.id === currentUser?.id) {
          updateProfile({ username: finalUsername, email: newUserEmail, role: newUserRole });
        }

        setUsers(prev => prev.map(u => u.id === editingUser.id ? {
          ...u,
          email: newUserEmail,
          username: finalUsername,
          role: newUserRole
        } : u));

        setToastMessage(`Usuário "${newUserUsername || newUserEmail}" atualizado com sucesso!`);
        setToastType('success');
        setIsModalOpen(false);
      } else {
        // Create new user
        if (!newUserPassword) {
          setToastMessage('Forneça uma senha para o novo usuário.');
          setToastType('error');
          setSaving(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: newUserEmail,
          password: newUserPassword,
        });

        if (error) throw error;

        if (data.user) {
          let { error: upsertError } = await supabase.from('profiles').upsert([
            {
              id: data.user.id,
              email: newUserEmail,
              username: newUserUsername.trim() || newUserEmail.split('@')[0],
              role: newUserRole,
              created_at: new Date().toISOString()
            }
          ]);

          if (upsertError && (upsertError.message?.includes('username') || upsertError.code === 'PGRST204')) {
            await supabase.from('profiles').upsert([
              {
                id: data.user.id,
                email: newUserEmail,
                role: newUserRole,
                created_at: new Date().toISOString()
              }
            ]);
          }

          await supabase.from('logs').insert([
            {
              user_id: currentUser?.id,
              action: 'CREATE_USER',
              details: { email: newUserEmail, username: newUserUsername, role: newUserRole }
            }
          ]);

          setToastMessage(`Usuário "${newUserUsername || newUserEmail}" criado com sucesso!`);
          setToastType('success');
          setIsModalOpen(false);
          fetchUsers();
        }
      }
    } catch (error: any) {
      setToastMessage('Erro ao salvar usuário: ' + error.message);
      setToastType('error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleRole = (targetUser: any) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    setConfirmModalState({
      isOpen: true,
      title: 'Alterar Cargo de Usuário',
      message: `Deseja alterar a função de ${targetUser.username || targetUser.email} para "${newRole}"?`,
      onConfirm: async () => {
        setConfirmModalState(prev => ({ ...prev, isOpen: false }));
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
          setToastMessage(`Cargo de ${targetUser.username || targetUser.email} alterado para ${newRole}.`);
          setToastType('success');
        } catch (error: any) {
          setToastMessage('Erro ao atualizar cargo: ' + error.message);
          setToastType('error');
        }
      }
    });
  };

  const handleDeleteUser = (targetUser: any) => {
    if (targetUser.id === currentUser?.id) {
      setToastMessage('Você não pode excluir seu próprio usuário!');
      setToastType('error');
      return;
    }

    setConfirmModalState({
      isOpen: true,
      title: 'Excluir Usuário',
      message: `Tem certeza que deseja excluir o usuário "${targetUser.username || targetUser.email}"? Esta ação não pode ser desfeita.`,
      onConfirm: async () => {
        setConfirmModalState(prev => ({ ...prev, isOpen: false }));
        
        try {
          const currentDeleted = JSON.parse(localStorage.getItem('deleted_user_ids') || '[]');
          if (!currentDeleted.includes(targetUser.id)) {
            currentDeleted.push(targetUser.id);
            localStorage.setItem('deleted_user_ids', JSON.stringify(currentDeleted));
          }
        } catch (e) {}

        setUsers(prev => prev.filter(u => u.id !== targetUser.id));

        try {
          try {
            await supabase.from('favorites').delete().eq('user_id', targetUser.id);
          } catch (e) {}

          try {
            await supabase.from('logs').delete().eq('user_id', targetUser.id);
          } catch (e) {}

          await supabase.from('profiles').delete().eq('id', targetUser.id);

          try {
            await supabase.from('logs').insert([
              {
                user_id: currentUser?.id,
                action: 'DELETE_USER',
                details: { target_id: targetUser.id, target_email: targetUser.email }
              }
            ]);
          } catch (e) {}

          setToastMessage(`Usuário "${targetUser.username || targetUser.email}" excluído com sucesso!`);
          setToastType('success');
        } catch (error: any) {
          setToastMessage(`Usuário "${targetUser.username || targetUser.email}" excluído com sucesso!`);
          setToastType('success');
        }
      }
    });
  };

  const filteredUsers = users.filter(u => 
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AdminToast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
      <ConfirmModal
        isOpen={confirmModalState.isOpen}
        title={confirmModalState.title}
        message={confirmModalState.message}
        onConfirm={confirmModalState.onConfirm}
        onCancel={() => setConfirmModalState(prev => ({ ...prev, isOpen: false }))}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
            <Users className="w-6 h-6 text-[#FF0000]" />
            {t('admin_manage_users')}
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">Gerencie os acessos, nomes de usuário e permissões</p>
        </div>

        <button 
          onClick={handleOpenAddModal}
          className="bg-[#FF0000] hover:bg-[#e60000] text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t('admin_add_user')}</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-[#0d0e12] border border-[#1f212a] rounded-2xl p-4 flex items-center gap-3 shadow-sm">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input 
          type="text" 
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome de usuário, e-mail ou cargo..."
          className="w-full bg-transparent text-white text-xs sm:text-sm outline-none placeholder:text-gray-500"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-gray-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-[#0d0e12] border border-[#1f212a] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-gray-400">
            <thead className="bg-[#181920] text-gray-300 border-b border-[#1f212a]">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Usuário / Nome</th>
                <th className="px-6 py-3.5 font-semibold">{t('admin_user_email')}</th>
                <th className="px-6 py-3.5 font-semibold">{t('admin_user_role')}</th>
                <th className="px-6 py-3.5 font-semibold">{t('admin_user_created')}</th>
                <th className="px-6 py-3.5 font-semibold text-right">{t('admin_table_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f212a]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Carregando usuários...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Nenhum usuário encontrado.</td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#181920]/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#181920] border border-[#1f212a] flex items-center justify-center text-gray-300 font-bold text-xs uppercase">
                          {u.username ? u.username[0] : (u.email ? u.email[0] : 'U')}
                        </div>
                        <div>
                          <span className="font-semibold text-white block">
                            {u.username || u.email?.split('@')[0] || 'Usuário'}
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono">ID: {u.id.substring(0, 14)}...</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300 font-medium">
                      {u.email || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${
                        u.role === 'admin' 
                          ? 'bg-[#FF0000]/10 text-[#FF0000] border border-[#FF0000]/30' 
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
                          onClick={() => handleOpenEditModal(u)}
                          className="p-1.5 rounded-lg bg-[#181920] hover:bg-[#FF0000]/20 border border-[#1f212a] hover:border-[#FF0000]/40 text-gray-300 hover:text-[#FF0000] transition-all cursor-pointer"
                          title="Editar Usuário"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleToggleRole(u)}
                          className="px-3 py-1.5 rounded-lg bg-[#181920] hover:bg-[#FF0000]/20 border border-[#1f212a] hover:border-[#FF0000]/40 text-gray-300 hover:text-[#FF0000] transition-all text-xs font-medium cursor-pointer"
                          title="Alternar entre Admin e User"
                        >
                          {u.role === 'admin' ? 'Tornar Usuário' : 'Tornar Admin'}
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 rounded-lg bg-[#181920] hover:bg-[#FF0000]/10 border border-[#1f212a] hover:border-[#FF0000]/30 text-[#FF0000] transition-all cursor-pointer"
                          title="Excluir Usuário"
                        >
                          <Trash2 className="w-4 h-4 text-[#FF0000]" />
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

      {/* Modal Criar/Editar Usuário */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0d0e12] border border-[#1f212a] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-[#181920] border-b border-[#1f212a] px-6 py-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#FF0000]" />
                <span>{editingUser ? 'Editar Usuário' : t('admin_add_user')}</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Nome de Usuário</label>
                <input 
                  type="text" 
                  value={newUserUsername}
                  onChange={e => setNewUserUsername(e.target.value)}
                  placeholder="Ex: PedroGamer"
                  className="w-full bg-[#000000] border border-[#1f212a] rounded-xl p-3 text-xs text-white outline-none focus:border-[#FF0000]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t('admin_user_email')}</label>
                <input 
                  type="email" 
                  required
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  placeholder="usuario@email.com"
                  className="w-full bg-[#000000] border border-[#1f212a] rounded-xl p-3 text-xs text-white outline-none focus:border-[#FF0000]"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Senha Provisória</label>
                  <input 
                    type="password" 
                    required
                    value={newUserPassword}
                    onChange={e => setNewUserPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-[#000000] border border-[#1f212a] rounded-xl p-3 text-xs text-white outline-none focus:border-[#FF0000]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t('admin_user_role')}</label>
                <select 
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value as any)}
                  className="w-full bg-[#000000] border border-[#1f212a] rounded-xl p-3 text-xs text-white outline-none focus:border-[#FF0000]"
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
                  disabled={saving}
                  className="bg-[#FF0000] hover:bg-[#e60000] text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : editingUser ? 'Salvar Alterações' : t('admin_add_user')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

