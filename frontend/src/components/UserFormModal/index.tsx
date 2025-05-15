// components/UserManagement/EditUserForm.tsx
import { Manager, User, UserOrManager } from '@/state/api';
import { useState } from 'react';

// types/index.ts
export function isUser(user: UserOrManager): user is User {
  return (user as User).userId !== undefined;
}

export function isManager(user: UserOrManager): user is Manager {
  return (user as Manager).id !== undefined;
}

export const EditUserForm = ({ 
  user,
  onClose,
  onSubmit
}: {
  user: UserOrManager;
  onClose: () => void;
  onSubmit: (data: any) => void;
}) => {
  const [formData, setFormData] = useState({
    name: user.role === 'manager' ? (user as any).name : '',
    phoneNumber: user.phoneNumber || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
  const id = isUser(user) ? user.userId : user.id;
  onSubmit({
    id,
    ...(isManager(user) && { name: formData.name }),
    phoneNumber: formData.phoneNumber
  });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Edit User</h2>
        <form onSubmit={handleSubmit}>
          {user.role === 'manager' && (
            <div className="form-group">
              <label>Name</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}

          <div className="form-group">
            <label>Phone Number</label>
            <input
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
          </div>

          <div className="button-group">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};