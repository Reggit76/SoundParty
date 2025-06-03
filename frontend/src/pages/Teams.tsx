import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  TextField,
  Stack,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import DataTable from '../components/common/DataTable';
import FormDialog from '../components/common/FormDialog';
import { teamsApi } from '../services/api/teams';
import { Team, TeamCreate } from '../services/types/api';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

const columns = [
  { id: 'team_id', label: 'ID', minWidth: 50 },
  { id: 'name', label: 'Название', minWidth: 170 },
  { id: 'rating', label: 'Рейтинг', minWidth: 100 },
];

const Teams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState<TeamCreate>({
    name: '',
    rating: 0,
  });

  const { showSuccess, showError } = useNotification();
  const { isAuthenticated, isAdmin, isOrganizer } = useAuth();

  // Создавать команды могут все авторизованные пользователи
  const canCreate = isAuthenticated;
  // Редактировать могут только админы и организаторы
  const canModify = isAdmin || isOrganizer;

  const loadTeams = async () => {
    try {
      setIsLoading(true);
      const data = await teamsApi.getAll();
      setTeams(data);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить список команд');
      showError('Ошибка при загрузке команд');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      if (editingTeam) {
        await teamsApi.update(editingTeam.team_id, formData);
        showSuccess('Команда успешно обновлена');
      } else {
        await teamsApi.create(formData);
        showSuccess('Команда успешно создана');
      }
      loadTeams();
      handleCloseDialog();
    } catch (err) {
      showError(
        editingTeam
          ? 'Ошибка при обновлении команды'
          : 'Ошибка при создании команды'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (team: Team) => {
    if (window.confirm('Вы уверены, что хотите удалить эту команду?')) {
      try {
        setIsLoading(true);
        await teamsApi.delete(team.team_id);
        showSuccess('Команда успешно удалена');
        loadTeams();
      } catch (err) {
        showError('Ошибка при удалении команды');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      rating: team.rating,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTeam(null);
    setFormData({ name: '', rating: 0 });
  };

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Команды
        </Typography>
        {canCreate && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsDialogOpen(true)}
          >
            Добавить команду
          </Button>
        )}
      </Box>

      <DataTable
        columns={columns}
        data={teams}
        isLoading={isLoading}
        error={error || undefined}
        onEdit={canModify ? handleEdit : undefined}
        onDelete={canModify ? handleDelete : undefined}
        searchPlaceholder="Поиск по командам..."
      />

      {canCreate && (
        <FormDialog
          open={isDialogOpen}
          onClose={handleCloseDialog}
          onSubmit={handleSubmit}
          title={editingTeam ? 'Редактировать команду' : 'Создать команду'}
          isLoading={isLoading}
        >
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Название команды"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            {canModify && (
              <TextField
                fullWidth
                type="number"
                label="Рейтинг"
                value={formData.rating}
                onChange={(e) =>
                  setFormData({ ...formData, rating: parseInt(e.target.value) || 0 })
                }
              />
            )}
          </Stack>
        </FormDialog>
      )}
    </Container>
  );
};

export default Teams;