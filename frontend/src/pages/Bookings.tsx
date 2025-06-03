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
import { Booking, Event, Team } from '../services/types/api';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

interface BookingCreate {
  event_id: number;
  team_id: number;
  number_of_seats: number;
}

const columns = [
  { id: 'booking_id', label: 'ID', minWidth: 50 },
  { id: 'event_name', label: 'Мероприятие', minWidth: 170 },
  { id: 'team_name', label: 'Команда', minWidth: 170 },
  { id: 'number_of_seats', label: 'Количество мест', minWidth: 100 },
];

const initialFormData: BookingCreate = {
  event_id: 0,
  team_id: 0,
  number_of_seats: 1,
};

const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [formData, setFormData] = useState<BookingCreate>(initialFormData);

  const { showSuccess, showError } = useNotification();
  const { isAuthenticated } = useAuth();

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Заглушки данных
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
        }
      ];

      const mockBookings: Booking[] = [
        {
          booking_id: 1,
          event_id: 1,
          team_id: 1,
          number_of_seats: 4
        },
        {
          booking_id: 2,
          event_id: 2,
          team_id: 2,
          number_of_seats: 3
        }
      ];
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setEvents(mockEvents);
      setTeams(mockTeams);
      setBookings(mockBookings);
    } catch (err) {
      setError('Не удалось загрузить данные');
      showError('Ошибка при загрузке данных');
      setBookings([]);
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
      
      if (editingBooking) {
        setBookings(prev => prev.map(booking => 
          booking.booking_id === editingBooking.booking_id 
            ? { ...booking, ...formData }
            : booking
        ));
        showSuccess('Бронирование успешно обновлено');
      } else {
        const newBooking: Booking = {
          booking_id: Date.now(),
          ...formData
        };
        setBookings(prev => [...prev, newBooking]);
        showSuccess('Бронирование успешно создано');
      }
      
      handleCloseDialog();
    } catch (err) {
      showError(
        editingBooking
          ? 'Ошибка при обновлении бронирования'
          : 'Ошибка при создании бронирования'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (booking: Booking) => {
    if (window.confirm('Вы уверены, что хотите удалить это бронирование?')) {
      try {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setBookings(prev => prev.filter(b => b.booking_id !== booking.booking_id));
        showSuccess('Бронирование успешно удалено');
      } catch (err) {
        showError('Ошибка при удалении бронирования');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setFormData({
      event_id: booking.event_id,
      team_id: booking.team_id,
      number_of_seats: booking.number_of_seats,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingBooking(null);
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

  // Обогащаем данные бронирований
  const enrichedBookings = Array.isArray(bookings) ? bookings.map((booking) => ({
    ...booking,
    event_name: getEventDescription(booking.event_id),
    team_name: getTeamName(booking.team_id),
  })) : [];

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Бронирования
        </Typography>
        {isAuthenticated && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsDialogOpen(true)}
          >
            Добавить бронирование
          </Button>
        )}
      </Box>

      {!isAuthenticated && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Для создания бронирований необходимо войти в систему.
        </Alert>
      )}

      <DataTable
        columns={columns}
        data={enrichedBookings}
        isLoading={isLoading}
        error={error || undefined}
        onEdit={isAuthenticated ? handleEdit : undefined}
        onDelete={isAuthenticated ? handleDelete : undefined}
        searchPlaceholder="Поиск по бронированиям..."
      />

      <FormDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        title={editingBooking ? 'Редактировать бронирование' : 'Создать бронирование'}
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
            label="Количество мест"
            value={formData.number_of_seats}
            onChange={(e) =>
              setFormData({
                ...formData,
                number_of_seats: parseInt(e.target.value) || 1,
              })
            }
            required
            inputProps={{ min: 1 }}
          />
        </Stack>
      </FormDialog>
    </Container>
  );
};

export default Bookings;