"use client";


import { useState } from 'react';
import { 
  useGetAuthUserQuery,
  useGetAllUsersQuery 
} from '@/state/api';
import { UsersTable } from '@/components/UsersTable';
import { CreateUserModal } from '@/components/CreateUserModal';

export default function UserManagementPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data: authUser } = useGetAuthUserQuery();
  const { data: users, isLoading, error } = useGetAllUsersQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading users</div>;

  return (
    <div className="page-container">
      <div className="header">
        <h1>Gestion des utulisateurs</h1>
        {authUser?.userRole === 'super_admin' && (
          <button 
            className="flex items-center rounded bg-blue-primary px-3 py-2 text-white hover:bg-blue-600"            
            onClick={() =>{
                console.log('Opening modal');

              setShowCreateModal(true)}}
          >
            Créer nouvelle utulisateur
          </button>
        )}
      </div>

      <UsersTable 
        users={users || []} 
        currentUserRole={(authUser?.userRole || 'user') as string} 

      />

      {showCreateModal && (
        <CreateUserModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}