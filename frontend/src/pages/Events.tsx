import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  TextField,
  Stack,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import  ru  from 'date-fns/locale/ru';
import DataTable from '../components/common/DataTable';
import FormDialog from '../components/common/FormDialog';
import { eventsApi, EventCreate } from '../services/api/events';
import { Event } from '../services/types/api';
import { useNotification } from '../contexts/NotificationContext';
import { format } from 'date-fns';

const columns = [
  { id: 'event_id', label: 'ID', minWidth: 50 },
  { id: 'description', label: 'Описание', minWidth: 200 },
  {
    id: 'date',
    label: 'Дата',
    minWidth: 100,
    format: (value: string) => format(new Date(value), 'dd.MM.yyyy'),
  },
  {
    id: 'time',
    label: 'Время',
    minWidth: 100,
    format: (value: string) => format(new Date(`2000-01-01T${value}`), 'HH:mm'),
  },
  { id: 'max_teams', label: 'Макс. команд', minWidth: 100 },
  { id: 'status', label: 'Статус', minWidth: 100 },
];

const initialFormData: EventCreate = {
  venue_id: 0,
  description: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  time: format(new Date(), 'HH:mm:ss'),
  max_teams: 10,
  status: 'анонс',
};

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<EventCreate>(initialFormData);

  const { showSuccess, showError } = useNotification();

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const data = await eventsApi.getAll();
      setEvents(data);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить список мероприятий');
      showError('Ошибка при загрузке мероприятий');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      if (editingEvent) {
        await eventsApi.update(editingEvent.event_id, formData);
        showSuccess('Мероприятие успешно обновлено');
      } else {
        await eventsApi.create(formData);
        showSuccess('Мероприятие успешно создано');
      }
      loadEvents();
      handleCloseDialog();
    } catch (err) {
      showError(
        editingEvent
          ? 'Ошибка при обновлении мероприятия'
          : 'Ошибка при создании мероприятия'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (event: Event) => {
    if (window.confirm('Вы уверены, что хотите удалить это мероприятие?')) {
      try {
        setIsLoading(true);
        await eventsApi.delete(event.event_id);
        showSuccess('Мероприятие успешно удалено');
        loadEvents();
      } catch (err) {
        showError('Ошибка при удалении мероприятия');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      venue_id: event.venue_id,
      description: event.description,
      date: event.date,
      time: event.time,
      max_teams: event.max_teams,
      status: event.status,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingEvent(null);
    setFormData(initialFormData);
  };

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Мероприятия
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsDialogOpen(true)}
        >
          Добавить мероприятие
        </Button>
      </Box>

      <DataTable
        columns={columns}
        data={events}
        isLoading={isLoading}
        error={error || undefined}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Поиск по мероприятиям..."
      />

      <FormDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        title={editingEvent ? 'Редактировать мероприятие' : 'Создать мероприятие'}
        isLoading={isLoading}
      >
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Описание"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              multiline
              rows={3}
            />
            <DatePicker
              label="Дата"
              value={new Date(formData.date)}
              onChange={(newValue: Date | null) => {
                if (newValue) {
                  setFormData({
                    ...formData,
                    date: format(newValue, 'yyyy-MM-dd'),
                  });
                }
              }}
              slotProps={{ textField: { fullWidth: true } }}
            />
            <TimePicker
              label="Время"
              value={new Date(`2000-01-01T${formData.time}`)}
              onChange={(newValue: Date | null) => {
                if (newValue) {
                  setFormData({
                    ...formData,
                    time: format(newValue, 'HH:mm:ss'),
                  });
                }
              }}
              slotProps={{ textField: { fullWidth: true } }}
            />
            <TextField
              fullWidth
              type="number"
              label="Максимальное количество команд"
              value={formData.max_teams}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  max_teams: parseInt(e.target.value) || 0,
                })
              }
              required
            />
            <FormControl fullWidth>
              <InputLabel>Статус</InputLabel>
              <Select
                value={formData.status}
                label="Статус"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as Event['status'],
                  })
                }
              >
                <MenuItem value="анонс">Анонс</MenuItem>
                <MenuItem value="в процессе">В процессе</MenuItem>
                <MenuItem value="завершено">Завершено</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </LocalizationProvider>
      </FormDialog>
    </Container>
  );
};

export default Events; 