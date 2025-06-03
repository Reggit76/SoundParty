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
  Alert,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import DataTable from '../components/common/DataTable';
import FormDialog from '../components/common/FormDialog';
import { Event } from '../services/types/api';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

interface EventCreate {
  venue_id: number;
  description: string;
  date: string;
  time: string;
  max_teams: number;
  status: 'анонс' | 'в процессе' | 'завершено';
}

const columns = [
  { id: 'event_id', label: 'ID', minWidth: 50 },
  { id: 'description', label: 'Описание', minWidth: 200 },
  { id: 'date', label: 'Дата', minWidth: 100 },
  { id: 'time', label: 'Время', minWidth: 100 },
  { id: 'max_teams', label: 'Макс. команд', minWidth: 100 },
  { id: 'status', label: 'Статус', minWidth: 100 },
];

const initialFormData: EventCreate = {
  venue_id: 0,
  description: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  time: '19:00:00',
  max_teams: 10,
  status: 'анонс',
};

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<EventCreate>(initialFormData);

  const { showSuccess, showError } = useNotification();
  const { isAdmin, isOrganizer } = useAuth();

  // Может создавать/редактировать только админ или организатор
  const canModify = isAdmin || isOrganizer;

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Заглушки данных для площадок
      const mockVenues = [
        { venue_id: 1, name: 'Main Concert Hall', address: '123 Music Street', capacity: 500 },
        { venue_id: 2, name: 'Small Jazz Club', address: '456 Jazz Avenue', capacity: 100 },
        { venue_id: 3, name: 'Outdoor Stage', address: 'Central Park', capacity: 1000 }
      ];
      
      // Заглушки данных для мероприятий
      const mockEvents: Event[] = [
        {
          event_id: 1,
          venue_id: 1,
          description: 'Большой музыкальный фестиваль',
          date: '2024-07-15',
          time: '19:00:00',
          max_teams: 20,
          status: 'анонс'
        },
        {
          event_id: 2,
          venue_id: 2,
          description: 'Джазовый вечер',
          date: '2024-07-20',
          time: '20:30:00',
          max_teams: 5,
          status: 'в процессе'
        }
      ];
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setVenues(mockVenues);
      setEvents(mockEvents);
    } catch (err) {
      setError('Не удалось загрузить список мероприятий');
      showError('Ошибка при загрузке мероприятий');
      setEvents([]);
      setVenues([]);
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
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingEvent) {
        setEvents(prev => prev.map(event => 
          event.event_id === editingEvent.event_id 
            ? { ...event, ...formData }
            : event
        ));
        showSuccess('Мероприятие успешно обновлено');
      } else {
        const newEvent: Event = {
          event_id: Date.now(),
          ...formData
        };
        setEvents(prev => [...prev, newEvent]);
        showSuccess('Мероприятие успешно создано');
      }
      
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
        await new Promise(resolve => setTimeout(resolve, 500));
        setEvents(prev => prev.filter(e => e.event_id !== event.event_id));
        showSuccess('Мероприятие успешно удалено');
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
    setFormData({
      ...initialFormData,
      venue_id: venues.length > 0 ? venues[0].venue_id : 0
    });
  };

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Мероприятия
        </Typography>
        {canModify && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsDialogOpen(true)}
          >
            Добавить мероприятие
          </Button>
        )}
      </Box>

      {!canModify && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Для создания и редактирования мероприятий необходимы права администратора или организатора.
        </Alert>
      )}

      <DataTable
        columns={columns}
        data={Array.isArray(events) ? events : []}
        isLoading={isLoading}
        error={error || undefined}
        onEdit={canModify ? handleEdit : undefined}
        onDelete={canModify ? handleDelete : undefined}
        searchPlaceholder="Поиск по мероприятиям..."
      />

      {canModify && (
        <FormDialog
          open={isDialogOpen}
          onClose={handleCloseDialog}
          onSubmit={handleSubmit}
          title={editingEvent ? 'Редактировать мероприятие' : 'Создать мероприятие'}
          isLoading={isLoading}
        >
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Площадка</InputLabel>
              <Select
                value={formData.venue_id}
                label="Площадка"
                onChange={(e) =>
                  setFormData({ ...formData, venue_id: Number(e.target.value) })
                }
                required
              >
                {venues.map((venue) => (
                  <MenuItem key={venue.venue_id} value={venue.venue_id}>
                    {venue.name} - {venue.address}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
            <TextField
              fullWidth
              type="date"
              label="Дата"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              type="time"
              label="Время"
              value={formData.time}
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value + ':00' })
              }
              required
              InputLabelProps={{ shrink: true }}
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
        </FormDialog>
      )}
    </Container>
  );
};

export default Events;