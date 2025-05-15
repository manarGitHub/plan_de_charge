import { useState } from 'react';
import { useCreateUserMutation } from '@/state/api';

export const CreateUserModal = ({ onClose }: { onClose: () => void }) => {
  const [createUser] = useCreateUserMutation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'user',
    name: '',
    phoneNumber: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser({
        username: formData.username,
        email: formData.email,
        role: formData.role,
        ...(formData.role === 'manager' && { name: formData.name }),
        phoneNumber: formData.phoneNumber
      }).unwrap();
      onClose();
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const modalStyles = `
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      min-width: 400px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    .form-group input,
    .form-group select {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
    }

    .required {
      color: #dc3545;
      margin-left: 2px;
    }

    .button-group {
      margin-top: 1.5rem;
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }
  `;

  return (
    <>
      <style>{modalStyles}</style>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Create New User</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username <span className="required">*</span></label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                pattern="[a-zA-Z0-9]+"
                title="Only letters and numbers allowed"
              />
            </div>

            <div className="form-group">
              <label>Email <span className="required">*</span></label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Role <span className="required">*</span></label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="user">User</option>
                <option value="manager">Manager</option>
              </select>
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>

            <div className="button-group">
              <button 
                type="button" 
                onClick={onClose}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#f0f0f0',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button 
                type="submit"
                style={{
                  padding: '0.5rem 1rem',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Create User
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};