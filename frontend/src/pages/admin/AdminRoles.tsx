import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  TextField,
  Stack,
  Alert,
  Chip,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Security,
  AdminPanelSettings,
  Person,
  SupervisorAccount,
} from '@mui/icons-material';
import DataTable from '../../components/common/DataTable';
import FormDialog from '../../components/common/FormDialog';
import { api } from '../../services/api/config';
import { useNotification } from '../../contexts/NotificationContext';

interface Role {
  role_id: number;
  role_name: string;
}

interface RoleCreate {
  role_name: string;
}

const columns = [
  { id: 'role_id', label: 'ID', minWidth: 50 },
  { 
    id: 'role_name', 
    label: 'Название роли', 
    minWidth: 200,
    format: (value: string) => (
      <Box display="flex" alignItems="center" gap={1}>
        {value === 'Администратор' && <AdminPanelSettings color="error" fontSize="small" />}
        {value === 'Организатор' && <SupervisorAccount color="warning" fontSize="small" />}
        {value === 'Пользователь' && <Person color="action" fontSize="small" />}
        <Chip 
          label={value}
          color={
            value === 'Администратор' ? 'error' : 
            value === 'Организатор' ? 'warning' : 'default'
          }
          variant="outlined"
        />
      </Box>
    )
  },
];

const initialFormData: RoleCreate = {
  role_name: '',
};

const AdminRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<RoleCreate>(initialFormData);

  const { showSuccess, showError } = useNotification();

  const loadRoles = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/roles');
      setRoles(response.data);
      setError(null);
    } catch (err: any) {
      setError('Не удалось загрузить список ролей');
      showError('Ошибка при загрузке ролей');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      if (editingRole) {
        await api.put(`/roles/${editingRole.role_id}`, formData);
        showSuccess('Роль успешно обновлена');
      } else {
        await api.post('/roles', formData);
        showSuccess('Роль успешно создана');
      }
      loadRoles();
      handleCloseDialog();
    } catch (err: any) {
      showError(
        editingRole
          ? 'Ошибка при обновлении роли'
          : 'Ошибка при создании роли'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (role: Role) => {
    if (window.confirm(`Вы уверены, что хотите удалить роль "${role.role_name}"?`)) {
      try {
        setIsLoading(true);
        await api.delete(`/roles/${role.role_id}`);
        showSuccess('Роль успешно удалена');
        loadRoles();
      } catch (err: any) {
        showError('Ошибка при удалении роли');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      role_name: role.role_name,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingRole(null);
    setFormData(initialFormData);
  };

  const canEditRole = (role: Role) => role.role_id > 3;
  const canDeleteRole = (role: Role) => role.role_id > 3;

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Security color="primary" fontSize="large" />
          <Typography variant="h4" component="h1">
            Управление ролями
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsDialogOpen(true)}
        >
          Добавить роль
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Информация:</strong> Системные роли (ID 1-3) нельзя редактировать или удалять.
          Они необходимы для корректной работы системы.
        </Typography>
      </Alert>

      <DataTable
        columns={columns}
        data={roles}
        isLoading={isLoading}
        error={error || undefined}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Поиск ролей..."
        canEdit={canEditRole}
        canDelete={canDeleteRole}
      />

      <FormDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        title={editingRole ? 'Редактировать роль' : 'Создать роль'}
        isLoading={isLoading}
      >
        <Stack spacing={2}>
          <Alert severity="warning">
            <Typography variant="body2">
              Будьте осторожны при создании новых ролей. Убедитесь, что название роли 
              отражает ее назначение в системе.
            </Typography>
          </Alert>
          
          <TextField
            fullWidth
            label="Название роли"
            value={formData.role_name}
            onChange={(e) => setFormData({ ...formData, role_name: e.target.value })}
            required
            helperText="Введите понятное название роли (например: 'Модератор', 'VIP пользователь')"
          />

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Существующие системные роли:
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip 
                icon={<AdminPanelSettings />}
                label="Администратор" 
                color="error" 
                size="small" 
              />
              <Chip 
                icon={<SupervisorAccount />}
                label="Организатор" 
                color="warning" 
                size="small" 
              />
              <Chip 
                icon={<Person />}
                label="Пользователь" 
                color="default" 
                size="small" 
              />
            </Box>
          </Box>
        </Stack>
      </FormDialog>
    </Container>
  );
};

export default AdminRoles;