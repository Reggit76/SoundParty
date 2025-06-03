import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
} from '@mui/material';
import { 
  Add as AddIcon, 
  AdminPanelSettings,
  Person,
  SupervisorAccount,
} from '@mui/icons-material';
import DataTable from '../../components/common/DataTable';
import FormDialog from '../../components/common/FormDialog';
import { api } from '../../services/api/config';
import { useNotification } from '../../contexts/NotificationContext';

interface User {
  user_id: number;
  username: string;
  fullname: string;
  email: string;
  role_id: number;
}

interface Role {
  role_id: number;
  role_name: string;
}

interface UserCreate {
  username: string;
  fullname: string;
  email: string;
  password: string;
  role_id: number;
}

const columns = [
  { id: 'user_id', label: 'ID', minWidth: 50 },
  { id: 'username', label: 'Логин', minWidth: 120 },
  { id: 'fullname', label: 'Полное имя', minWidth: 150 },
  { id: 'email', label: 'Email', minWidth: 200 },
  { 
    id: 'role_name', 
    label: 'Роль', 
    minWidth: 120,
    format: (value: string) => (
      <Chip 
        label={value}
        color={
          value === 'admin' ? 'error' : 
          value === 'organizer' ? 'warning' : 'default'
        }
        size="small"
      />
    )
  },
];

const initialFormData: UserCreate = {
  username: '',
  fullname: '',
  email: '',
  password: '',
  role_id: 3,
};

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserCreate>(initialFormData);

  const { showSuccess, showError } = useNotification();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [usersResponse, rolesResponse] = await Promise.all([
        api.get('/users'),
        api.get('/roles'),
      ]);
      
      // Объединяем данные пользователей с ролями
      const enrichedUsers = usersResponse.data.map((user: User) => {
        const role = rolesResponse.data.find((r: Role) => r.role_id === user.role_id);
        return {
          ...user,
          role_name: role?.role_name || 'Неизвестная роль'
        };
      });
      
      setUsers(enrichedUsers);
      setRoles(rolesResponse.data);
      setError(null);
    } catch (err: any) {
      setError('Не удалось загрузить данные');
      showError('Ошибка при загрузке данных пользователей');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      if (editingUser) {
        await api.put(`/users/${editingUser.user_id}`, formData);
        showSuccess('Пользователь успешно обновлен');
      } else {
        await api.post('/users', formData);
        showSuccess('Пользователь успешно создан');
      }
      loadData();
      handleCloseDialog();
    } catch (err: any) {
      showError(
        editingUser
          ? 'Ошибка при обновлении пользователя'
          : 'Ошибка при создании пользователя'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (user.role_id === 1) {
      showError('Нельзя удалить администратора');
      return;
    }

    if (window.confirm(`Вы уверены, что хотите удалить пользователя "${user.fullname}"?`)) {
      try {
        setIsLoading(true);
        await api.delete(`/users/${user.user_id}`);
        showSuccess('Пользователь успешно удален');
        loadData();
      } catch (err: any) {
        showError('Ошибка при удалении пользователя');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      fullname: user.fullname,
      email: user.email,
      password: '', // Не показываем текущий пароль
      role_id: user.role_id,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
    setFormData(initialFormData);
  };

  const getRoleName = (roleId: number) => {
    const role = roles.find((r) => r.role_id === roleId);
    return role?.role_name || 'Неизвестная роль';
  };

  // Фильтруем роли для формы (убираем admin для обычных пользователей)
  const getAvailableRoles = () => {
    if (editingUser && editingUser.role_id === 1) {
      // Если редактируем админа, показываем все роли
      return roles;
    }
    // Для остальных пользователей показываем только participant и organizer
    return roles.filter((role) => role.role_id !== 1);
  };

  // Проверяем, можно ли редактировать пользователя
  const canEdit = (user: User) => {
    return true; // Админ может редактировать всех
  };

  // Проверяем, можно ли удалить пользователя
  const canDelete = (user: User) => {
    return user.role_id !== 1; // Нельзя удалить админа
  };

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <AdminPanelSettings color="error" fontSize="large" />
          <Typography variant="h4" component="h1">
            Управление пользователями
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsDialogOpen(true)}
        >
          Добавить пользователя
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        error={error || undefined}
        onEdit={handleEdit}
        onDelete={handleDelete}
        canEdit={canEdit}
        canDelete={canDelete}
        searchPlaceholder="Поиск пользователей..."
      />

      <FormDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        title={editingUser ? 'Редактировать пользователя' : 'Создать пользователя'}
        isLoading={isLoading}
      >
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Имя пользователя"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            helperText="Только латинские буквы и цифры"
          />
          <TextField
            fullWidth
            label="Полное имя"
            value={formData.fullname}
            onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
            required
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <TextField
            fullWidth
            label={editingUser ? "Новый пароль (оставьте пустым для сохранения текущего)" : "Пароль"}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!editingUser}
            helperText="Минимум 6 символов"
          />
          <FormControl fullWidth>
            <InputLabel>Роль</InputLabel>
            <Select
              value={formData.role_id}
              label="Роль"
              onChange={(e) =>
                setFormData({ ...formData, role_id: Number(e.target.value) })
              }
            >
              {getAvailableRoles().map((role) => (
                <MenuItem key={role.role_id} value={role.role_id}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {role.role_id === 1 && <AdminPanelSettings fontSize="small" />}
                    {role.role_id === 2 && <SupervisorAccount fontSize="small" />}
                    {role.role_id === 3 && <Person fontSize="small" />}
                    {role.role_name === 'admin' ? 'Администратор' : 
                     role.role_name === 'organizer' ? 'Организатор' : 
                     role.role_name === 'participant' ? 'Участник' : role.role_name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {editingUser && editingUser.role_id === 1 && (
            <Alert severity="warning">
              Вы редактируете учетную запись администратора. Будьте осторожны при изменении роли.
            </Alert>
          )}
          
          {!editingUser && (
            <Alert severity="info">
              Новые пользователи могут быть созданы только с ролями "Участник" или "Организатор"
            </Alert>
          )}
        </Stack>
      </FormDialog>
    </Container>
  );
};

export default AdminUsers;