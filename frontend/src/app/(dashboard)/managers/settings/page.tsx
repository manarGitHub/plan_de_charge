"use client";
import { isManager, isUser } from '@/components/UserFormModal';
import { useGetAuthUserQuery } from '@/state/api';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';

export const Settings = () => {
  const { data, isLoading, error } = useGetAuthUserQuery();

  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">Error loading profile</Alert>;

  return (
    <Box sx={{ p: 3, maxWidth: 600, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Mon Profil
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        {data?.userInfo && (
          <>
            {isUser(data.userInfo) && (
              <>
                <ProfileField label="Nom" value={data.userInfo.username} />
                <ProfileField label="Role" value={data.userRole as string} />
                <ProfileField label="Email" value={data.userInfo.email} />
                <ProfileField label="Phone" value={data.userInfo.phoneNumber} />
              </>
            )}

            {isManager(data.userInfo) && (
              <>
                <ProfileField label="Nom" value={data.userInfo.name} />  
                <ProfileField label="Role" value={data.userRole as string} />
                <ProfileField label="Email" value={data.userInfo.email} />
                <ProfileField label="Phone" value={data.userInfo.phoneNumber} />
              </>
            )}

            {data.userRole === 'super_admin' && (
              <>
                <ProfileField label="Email" value={data.cognitoInfo.username} />
                <ProfileField label="Role" value="Super Admin" />
              </>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

const ProfileField = ({ label, value }: { label: string; value?: string | null }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="subtitle2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1">
      {value || 'Not provided'}
    </Typography>
  </Box>
);

export default Settings;