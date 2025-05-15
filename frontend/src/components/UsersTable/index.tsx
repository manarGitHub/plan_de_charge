import { useDeleteUserMutation, UserOrManager, useUpdateUserMutation } from '@/state/api';
import { useState } from 'react';
import { DataGrid, GridColDef, GridActionsCellItem, GridRowId } from '@mui/x-data-grid';
import { Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { EditUserForm, isManager, isUser } from '@/components/UserFormModal';

export const UsersTable = ({ users, currentUserRole }: { 
  users: UserOrManager[]; 
  currentUserRole: string; 
}) => {
  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [editingUser, setEditingUser] = useState<UserOrManager | null>(null);

  const handleUpdate = async (userData: any) => {
    try {
      await updateUser(userData).unwrap();
      setEditingUser(null);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  // Transform user data for DataGrid
  const rows = users.map((user) => ({
    id: isUser(user) ? user.userId : user.id,
    email: user.email,
    role: user.role,
    name: isManager(user) ? user.name : user.username,
    phone: user.phoneNumber || '-',
    originalData: user // Store the original data for actions
  }));

  const columns: GridColDef[] = [
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'role', headerName: 'Role', flex: 0.5 },
    { field: 'name', headerName: 'Nom', flex: 1 },
    { field: 'phone', headerName: 'Tel', flex: 1 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      flex: 0.5,
      getActions: (params) => {
        const user = params.row.originalData;
        const canEditDelete = currentUserRole === 'super_admin' || user.role === 'user';
        
        if (!canEditDelete) return [];
        
        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            onClick={() => setEditingUser(user)}
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            showInMenu
          />
        ];
      },
    },
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSizeOptions={[5, 10, 25]}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        checkboxSelection={false}
        disableRowSelectionOnClick
      />

      {editingUser && (
        <EditUserForm
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={handleUpdate}
        />
      )}
    </Box>
  );
};