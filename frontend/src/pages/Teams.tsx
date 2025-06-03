import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  TextField,
  Stack,
  Chip,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Person as PersonIcon } from '@mui/icons-material';
import DataTable from '../components/common/DataTable';
import FormDialog from '../components/common/FormDialog';
import { teamsApi } from '../services/api/teams';
import { Team, TeamCreate, TeamMember } from '../services/types/api';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

const columns = [
  { id: 'team_id', label: 'ID', minWidth: 50 },
  { id: 'name', label: 'Название', minWidth: 170 },
  { id: 'captain', label: 'Капитан', minWidth: 170 },
  { id: 'members_count', label: 'Участники', minWidth: 100 },
  { id: 'rating', label: 'Рейтинг', minWidth: 100 },
];

const Teams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState<TeamCreate>({
    name: '',
  });

  const { showSuccess, showError } = useNotification();
  const { user, isAuthenticated } = useAuth();

  // Проверяем, является ли пользователь капитаном команды
  const isCaptain = (team: Team) => team.captain_id === user?.user_id;

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

  const handleCreateTeam = async () => {
    try {
      setIsLoading(true);
      await teamsApi.create(formData);
      showSuccess('Команда успешно создана');
      loadTeams();
      handleCloseDialog();
    } catch (err) {
      showError('Ошибка при создании команды');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewMembers = (team: Team) => {
    setSelectedTeam(team);
    setIsMembersDialogOpen(true);
  };

  const handleAddMember = async (username: string) => {
    if (!selectedTeam) return;

    try {
      await teamsApi.addMember(selectedTeam.team_id, username);
      showSuccess('Участник успешно добавлен в команду');
      loadTeams();
    } catch (err) {
      showError('Ошибка при добавлении участника');
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!selectedTeam) return;

    try {
      await teamsApi.removeMember(selectedTeam.team_id, memberId);
      showSuccess('Участник успешно удален из команды');
      loadTeams();
    } catch (err) {
      showError('Ошибка при удалении участника');
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData({ name: '' });
  };

  const handleCloseMembersDialog = () => {
    setIsMembersDialogOpen(false);
    setSelectedTeam(null);
  };

  const renderActions = (team: Team) => {
    const actions = [];

    // Просмотр участников доступен всем
    actions.push(
      <Button
        key="view"
        size="small"
        startIcon={<PersonIcon />}
        onClick={() => handleViewMembers(team)}
      >
        Участники
      </Button>
    );

    return actions;
  };

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Команды
        </Typography>
        {isAuthenticated && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsDialogOpen(true)}
          >
            Создать команду
          </Button>
        )}
      </Box>

      <DataTable
        columns={columns}
        data={teams}
        isLoading={isLoading}
        error={error || undefined}
        actions={renderActions}
        searchPlaceholder="Поиск по командам..."
      />

      {/* Диалог создания команды */}
      <FormDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleCreateTeam}
        title="Создать команду"
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
          <Alert severity="info">
            После создания команды вы автоматически станете её капитаном
          </Alert>
        </Stack>
      </FormDialog>

      {/* Диалог управления участниками */}
      <FormDialog
        open={isMembersDialogOpen}
        onClose={handleCloseMembersDialog}
        title={`Участники команды "${selectedTeam?.name}"`}
        isLoading={isLoading}
        maxWidth="sm"
        hideSubmitButton
      >
        {selectedTeam && (
          <Stack spacing={2}>
            {isAuthenticated && isCaptain(selectedTeam) && (
              <>
                <TextField
                  fullWidth
                  label="Добавить участника по имени пользователя"
                  placeholder="Введите имя пользователя"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement;
                      handleAddMember(input.value);
                      input.value = '';
                    }
                  }}
                />
                <Alert severity="info">
                  Нажмите Enter, чтобы добавить участника
                </Alert>
              </>
            )}

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Текущие участники:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {selectedTeam.members?.map((member: TeamMember) => (
                  <Chip
                    key={member.user_id}
                    label={member.username}
                    onDelete={
                      isAuthenticated && isCaptain(selectedTeam) ? () => handleRemoveMember(member.user_id) : undefined
                    }
                    color={member.user_id === selectedTeam.captain_id ? "primary" : "default"}
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
        )}
      </FormDialog>
    </Container>
  );
};

export default Teams;