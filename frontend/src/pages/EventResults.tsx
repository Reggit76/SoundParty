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
import { Add as AddIcon, EmojiEvents as TrophyIcon } from '@mui/icons-material';
import DataTable from '../components/common/DataTable';
import FormDialog from '../components/common/FormDialog';
import { eventResultsApi, EventResultCreate } from '../services/api/eventResults';
import { eventsApi } from '../services/api/events';
import { teamsApi } from '../services/api/teams';
import { EventResult, Event, Team } from '../services/types/api';
import { useNotification } from '../contexts/NotificationContext';

const columns = [
  { id: 'result_id', label: 'ID', minWidth: 50 },
  { id: 'event_description', label: 'Мероприятие', minWidth: 170 },
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

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [resultsData, eventsData, teamsData] = await Promise.all([
        eventResultsApi.getAll(),
        eventsApi.getAll(),
        teamsApi.getAll(),
      ]);
      setResults(resultsData);
      setEvents(eventsData);
      setTeams(teamsData);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить данные');
      showError('Ошибка при загрузке данных');
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
      if (editingResult) {
        await eventResultsApi.update(editingResult.result_id, formData);
        showSuccess('Результат успешно обновлен');
      } else {
        await eventResultsApi.create(formData);
        showSuccess('Результат успешно добавлен');
      }
      loadData();
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
        await eventResultsApi.delete(result.result_id);
        showSuccess('Результат успешно удален');
        loadData();
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
    setFormData(initialFormData);
  };

  const getEventDescription = (eventId: number) => {
    const event = events.find((e) => e.event_id === eventId);
    return event ? event.description : 'Неизвестное мероприятие';
  };

  const getTeamName = (teamId: number) => {
    const team = teams.find((t) => t.team_id === teamId);
    return team ? team.name : 'Неизвестная команда';
  };

  const enrichedResults = results.map((result) => ({
    ...result,
    event_description: getEventDescription(result.event_id),
    team_name: getTeamName(result.team_id),
  }));

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          <TrophyIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Результаты мероприятий
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsDialogOpen(true)}
        >
          Добавить результат
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Результаты мероприятий влияют на рейтинг команд. При добавлении результата рейтинг команды будет автоматически обновлен.
      </Alert>

      <DataTable
        columns={columns}
        data={enrichedResults}
        isLoading={isLoading}
        error={error || undefined}
        onEdit={handleEdit}
        onDelete={handleDelete}
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
                  {event.description}
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
                  {team.name}
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
            helperText="Введите счет команды за мероприятие. Он будет добавлен к рейтингу команды."
          />
        </Stack>
      </FormDialog>
    </Container>
  );
};

export default EventResults;