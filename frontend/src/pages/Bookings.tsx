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
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import DataTable from '../components/common/DataTable';
import FormDialog from '../components/common/FormDialog';
import { bookingsApi, BookingCreate } from '../services/api/bookings';
import { eventsApi } from '../services/api/events';
import { teamsApi } from '../services/api/teams';
import { Booking, Event, Team } from '../services/types/api';
import { useNotification } from '../contexts/NotificationContext';

const columns = [
  { id: 'booking_id', label: 'ID', minWidth: 50 },
  { id: 'event_id', label: 'Мероприятие', minWidth: 170 },
  { id: 'team_id', label: 'Команда', minWidth: 170 },
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

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [bookingsData, eventsData, teamsData] = await Promise.all([
        bookingsApi.getAll(),
        eventsApi.getAll(),
        teamsApi.getAll(),
      ]);
      setBookings(bookingsData);
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
      if (editingBooking) {
        await bookingsApi.update(editingBooking.booking_id, formData);
        showSuccess('Бронирование успешно обновлено');
      } else {
        await bookingsApi.create(formData);
        showSuccess('Бронирование успешно создано');
      }
      loadData();
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
        await bookingsApi.delete(booking.booking_id);
        showSuccess('Бронирование успешно удалено');
        loadData();
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

  const enrichedBookings = bookings.map((booking) => ({
    ...booking,
    event_id: getEventDescription(booking.event_id),
    team_id: getTeamName(booking.team_id),
  }));

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Бронирования
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsDialogOpen(true)}
        >
          Добавить бронирование
        </Button>
      </Box>

      <DataTable
        columns={columns}
        data={enrichedBookings}
        isLoading={isLoading}
        error={error || undefined}
        onEdit={handleEdit}
        onDelete={handleDelete}
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