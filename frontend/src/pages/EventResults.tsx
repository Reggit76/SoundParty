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
  Alert,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import DataTable from '../components/common/DataTable';
import FormDialog from '../components/common/FormDialog';
import { EventResult, Event, Team } from '../services/types/api';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

interface EventResultCreate {
  event_id: number;
  team_id: number;
  score: number;
}

const columns = [
  { id: 'result_id', label: 'ID', minWidth: 50 },
  { id: 'event_name', label: 'Мероприятие', minWidth: 170 },
  { id: 'team_name', label: 'Команда', minWidth: 170 },
  { id: 'score', label: 'Счет', minWidth: 100 },
];

const initialFormData: EventResultCreate = {
  event_id: 0,
  team_id: 0,
  score: 0,
};

const EventResults = () => {
  const [results, setResults] = useState<EventResult[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<EventResult | null>(null);
  const [formData, setFormData] = useState<EventResultCreate>(initialFormData);

  const { showSuccess, showError } = useNotification();
  const { isAdmin, isOrganizer, isAuthenticated } = useAuth();

  // Может создавать/редактировать только админ или организатор
  const canModify = isAdmin || isOrganizer;

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Заглушки данных для мероприятий
      const mockEvents: Event[] = [
        {
          event_id: 1,
          venue_id: 1,
          description: 'Большой музыкальный фестиваль',
          date: '2024-07-15',
          time: '19:00:00',
          max_teams: 20,
          status: 'завершено'
        },
        {
          event_id: 2,
          venue_id: 2,
          description: 'Джазовый вечер',
          date: '2024-07-20',
          time: '20:30:00',
          max_teams: 5,
          status: 'завершено'
        },
        {
          event_id: 3,
          venue_id: 3,
          description: 'Рок-концерт',
          date: '2024-07-25',
          time: '21:00:00',
          max_teams: 8,
          status: 'в процессе'
        }
      ];

      // Заглушки данных для команд
      const mockTeams: Team[] = [
        {
          team_id: 1,
          name: 'Рок-звезды',
          rating: 150,
          captain_id: 1,
          members: [],
          members_count: 4
        },
        {
          team_id: 2,
          name: 'Джазовые котики',
          rating: 120,
          captain_id: 2,
          members: [],
          members_count: 3
        },
        {
          team_id: 3,
          name: 'Электронная волна',
          rating: 180,
          captain_id: 3,
          members: [],
          members_count: 5
        },
        {
          team_id: 4,
          name: 'Металлурги',
          rating: 90,
          captain_id: 4,
          members: [],
          members_count: 4
        }
      ];

      // Заглушки данных для результатов
      const mockResults: EventResult[] = [
        {
          result_id: 1,
          event_id: 1,
          team_id: 1,
          score: 95
        },
        {
          result_id: 2,
          event_id: 1,
          team_id: 2,
          score: 87
        },
        {
          result_id: 3,
          event_id: 2,
          team_id: 2,
          score: 92
        },
        {
          result_id: 4,
          event_id: 2,
          team_id: 3,
          score: 88
        }
      ];
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setEvents(mockEvents);
      setTeams(mockTeams);
      setResults(mockResults);
    } catch (err) {
      setError('Не удалось загрузить данные');
      showError('Ошибка при загрузке данных');
      setResults([]);
      setEvents([]);
      setTeams([]);
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
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingResult) {
        setResults(prev => prev.map(result => 
          result.result_id === editingResult.result_id 
            ? { ...result, ...formData }
            : result
        ));
        showSuccess('Результат успешно обновлен');
      } else {
        const newResult: EventResult = {
          result_id: Date.now(),
          ...formData
        };
        setResults(prev => [...prev, newResult]);
        showSuccess('Результат успешно добавлен');
      }
      
      handleCloseDialog();
    } catch (err) {
      showError(
        editingResult
          ? 'Ошибка при обновлении результата'
          : 'Ошибка при добавлении результата'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (result: EventResult) => {
    if (window.confirm('Вы уверены, что хотите удалить этот результат?')) {
      try {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setResults(prev => prev.filter(r => r.result_id !== result.result_id));
        showSuccess('Результат успешно удален');
      } catch (err) {
        showError('Ошибка при удалении результата');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEdit = (result: EventResult) => {
    setEditingResult(result);
    setFormData({
      event_id: result.event_id,
      team_id: result.team_id,
      score: result.score,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingResult(null);
    setFormData({
      ...initialFormData,
      event_id: events.length > 0 ? events[0].event_id : 0,
      team_id: teams.length > 0 ? teams[0].team_id : 0
    });
  };

  const getEventDescription = (eventId: number) => {
    const event = events.find((e) => e.event_id === eventId);
    return event ? event.description : 'Неизвестное мероприятие';
  };

  const getTeamName = (teamId: number) => {
    const team = teams.find((t) => t.team_id === teamId);
    return team ? team.name : 'Неизвестная команда';
  };

  // Обогащаем данные результатов
  const enrichedResults = Array.isArray(results) ? results.map((result) => ({
    ...result,
    event_name: getEventDescription(result.event_id),
    team_name: getTeamName(result.team_id),
  })) : [];

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Результаты мероприятий
        </Typography>
        {canModify && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsDialogOpen(true)}
          >
            Добавить результат
          </Button>
        )}
      </Box>

      {!canModify && isAuthenticated && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Для добавления результатов необходимы права администратора или организатора.
        </Alert>
      )}

      {!isAuthenticated && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Для просмотра результатов необходимо войти в систему.
        </Alert>
      )}

      <DataTable
        columns={columns}
        data={enrichedResults}
        isLoading={isLoading}
        error={error || undefined}
        onEdit={canModify ? handleEdit : undefined}
        onDelete={canModify ? handleDelete : undefined}
        searchPlaceholder="Поиск по результатам..."
      />

      <FormDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        title={editingResult ? 'Редактировать результат' : 'Добавить результат'}
        isLoading={isLoading}
      >
        <Stack spacing={2}>
          <FormControl fullWidth>
            <InputLabel>Мероприятие</InputLabel>
            <Select
              value={formData.event_id}
              label="Мероприятие"
              onChange={(e) =>
                setFormData({ ...formData, event_id: Number(e.target.value) })
              }
            >
              {events.map((event) => (
                <MenuItem key={event.event_id} value={event.event_id}>
                  {event.description} ({event.date})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Команда</InputLabel>
            <Select
              value={formData.team_id}
              label="Команда"
              onChange={(e) =>
                setFormData({ ...formData, team_id: Number(e.target.value) })
              }
            >
              {teams.map((team) => (
                <MenuItem key={team.team_id} value={team.team_id}>
                  {team.name} (Рейтинг: {team.rating})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            type="number"
            label="Счет"
            value={formData.score}
            onChange={(e) =>
              setFormData({ ...formData, score: parseInt(e.target.value) || 0 })
            }
            required
            inputProps={{ min: 0, max: 100 }}
            helperText="Введите счет от 0 до 100"
          />
        </Stack>
      </FormDialog>
    </Container>
  );
};

export default EventResults;