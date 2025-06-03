import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  TextField,
  Stack,
  Alert,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
} from '@mui/material';
import { 
  Add as AddIcon, 
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import DataTable from '../components/common/DataTable';
import FormDialog from '../components/common/FormDialog';
import { Team, TeamMember } from '../services/types/api';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

interface TeamCreate {
  name: string;
}

const columns = [
  { id: 'team_id', label: 'ID', minWidth: 50 },
  { id: 'name', label: 'Название', minWidth: 170 },
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
  const [newMemberUsername, setNewMemberUsername] = useState('');
  const [formData, setFormData] = useState<TeamCreate>({
    name: '',
  });

  const { showSuccess, showError } = useNotification();
  const { isAuthenticated, user } = useAuth();

  // Проверяем, является ли пользователь капитаном команды
  const isCaptain = (team: Team) => team.captain_id === user?.user_id;

  const loadTeams = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Заглушки данных для команд с участниками
      const mockTeams: Team[] = [
        {
          team_id: 1,
          name: 'Рок-звезды',
          rating: 150,
          captain_id: 1,
          members_count: 4,
          members: [
            { user_id: 1, username: 'john_doe', fullname: 'Иван Иванов' },
            { user_id: 2, username: 'jane_smith', fullname: 'Анна Смирнова' },
            { user_id: 3, username: 'mike_rock', fullname: 'Михаил Рокеров' },
            { user_id: 4, username: 'alex_guitar', fullname: 'Алексей Гитаристов' },
          ]
        },
        {
          team_id: 2,
          name: 'Джазовые котики',
          rating: 120,
          captain_id: 2,
          members_count: 3,
          members: [
            { user_id: 2, username: 'jane_smith', fullname: 'Анна Смирнова' },
            { user_id: 5, username: 'bob_jazz', fullname: 'Борис Джазов' },
            { user_id: 6, username: 'lisa_vocal', fullname: 'Лиза Вокалистова' },
          ]
        },
        {
          team_id: 3,
          name: 'Электронная волна',
          rating: 180,
          captain_id: 3,
          members_count: 5,
          members: [
            { user_id: 3, username: 'mike_rock', fullname: 'Михаил Рокеров' },
            { user_id: 7, username: 'dj_max', fullname: 'Максим Диджеев' },
            { user_id: 8, username: 'synth_kate', fullname: 'Екатерина Синтезаторова' },
            { user_id: 9, username: 'beat_drop', fullname: 'Андрей Битдропов' },
            { user_id: 10, username: 'bass_line', fullname: 'Сергей Басслайнов' },
          ]
        }
      ];
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setTeams(mockTeams);
    } catch (err) {
      setError('Не удалось загрузить список команд');
      showError('Ошибка при загрузке команд');
      setTeams([]);
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
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newTeam: Team = {
        team_id: Date.now(),
        name: formData.name,
        rating: 0,
        captain_id: user?.user_id || 1,
        members_count: 1,
        members: [
          { 
            user_id: user?.user_id || 1, 
            username: user?.username || 'current_user', 
            fullname: user?.fullname || 'Текущий пользователь' 
          }
        ]
      };
      
      setTeams(prev => [...prev, newTeam]);
      showSuccess('Команда успешно создана');
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

  const handleAddMember = async () => {
    if (!selectedTeam || !newMemberUsername.trim()) {
      showError('Введите имя пользователя');
      return;
    }

    try {
      // Имитация поиска пользователя
      const newMember: TeamMember = {
        user_id: Date.now(),
        username: newMemberUsername.trim(),
        fullname: `Новый участник (${newMemberUsername.trim()})`
      };

      // Обновляем команду
      setTeams(prev => prev.map(team => 
        team.team_id === selectedTeam.team_id 
          ? {
              ...team,
              members: [...(team.members || []), newMember],
              members_count: (team.members?.length || 0) + 1
            }
          : team
      ));

      // Обновляем выбранную команду
      setSelectedTeam(prev => prev ? {
        ...prev,
        members: [...(prev.members || []), newMember],
        members_count: (prev.members?.length || 0) + 1
      } : null);

      setNewMemberUsername('');
      showSuccess('Участник успешно добавлен в команду');
    } catch (err) {
      showError('Ошибка при добавлении участника');
    }
  };

  const handleRemoveMember = async (member: TeamMember) => {
    if (!selectedTeam) return;

    // Нельзя удалить капитана
    if (member.user_id === selectedTeam.captain_id) {
      showError('Нельзя удалить капитана команды');
      return;
    }

    try {
      // Обновляем команду
      setTeams(prev => prev.map(team => 
        team.team_id === selectedTeam.team_id 
          ? {
              ...team,
              members: (team.members || []).filter(m => m.user_id !== member.user_id),
              members_count: Math.max(0, (team.members?.length || 0) - 1)
            }
          : team
      ));

      // Обновляем выбранную команду
      setSelectedTeam(prev => prev ? {
        ...prev,
        members: (prev.members || []).filter(m => m.user_id !== member.user_id),
        members_count: Math.max(0, (prev.members?.length || 0) - 1)
      } : null);

      showSuccess('Участник успешно удален из команды');
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
    setNewMemberUsername('');
  };

  const renderActions = (team: Team) => {
    return [
      <Button
        key="view"
        size="small"
        startIcon={<PeopleIcon />}
        onClick={() => handleViewMembers(team)}
        variant="outlined"
      >
        Участники ({team.members_count})
      </Button>
    ];
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

      {!isAuthenticated && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Для создания команды необходимо войти в систему.
        </Alert>
      )}

      <DataTable
        columns={columns}
        data={Array.isArray(teams) ? teams : []}
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
      <Dialog
        open={isMembersDialogOpen}
        onClose={handleCloseMembersDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Участники команды "{selectedTeam?.name}"
          <Chip 
            label={`Рейтинг: ${selectedTeam?.rating || 0}`} 
            color="primary" 
            sx={{ ml: 2 }}
          />
        </DialogTitle>
        <DialogContent>
          {selectedTeam && (
            <Stack spacing={3}>
              {/* Добавление участника (только для капитана) */}
              {isCaptain(selectedTeam) && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Добавить участника
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <TextField
                      fullWidth
                      label="Имя пользователя"
                      value={newMemberUsername}
                      onChange={(e) => setNewMemberUsername(e.target.value)}
                      placeholder="Введите имя пользователя"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddMember();
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      startIcon={<PersonAddIcon />}
                      onClick={handleAddMember}
                      disabled={!newMemberUsername.trim()}
                    >
                      Добавить
                    </Button>
                  </Stack>
                </Box>
              )}

              <Divider />

              {/* Список участников */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Текущие участники ({selectedTeam.members_count})
                </Typography>
                
                {selectedTeam.members && selectedTeam.members.length > 0 ? (
                  <List>
                    {selectedTeam.members.map((member) => (
                      <ListItem key={member.user_id} divider>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              {member.fullname}
                              {member.user_id === selectedTeam.captain_id && (
                                <Chip
                                  icon={<StarIcon />}
                                  label="Капитан"
                                  size="small"
                                  color="warning"
                                />
                              )}
                            </Box>
                          }
                          secondary={`@${member.username}`}
                        />
                        {isCaptain(selectedTeam) && member.user_id !== selectedTeam.captain_id && (
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={() => handleRemoveMember(member)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        )}
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info">
                    В команде пока нет участников
                  </Alert>
                )}
              </Box>

              {!isCaptain(selectedTeam) && (
                <Alert severity="info">
                  Только капитан команды может добавлять и удалять участников
                </Alert>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMembersDialog}>
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Teams;