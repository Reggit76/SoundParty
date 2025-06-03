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
import { Payment, Booking } from '../services/types/api';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

interface PaymentCreate {
  booking_id: number;
  payment_type: 'банковская карта' | 'наличные' | 'перевод';
  total_amount: number;
  payment_status: 'не оплачено' | 'оплачено' | 'отменено';
  payment_date?: string;
}

const columns = [
  { id: 'payment_id', label: 'ID', minWidth: 50 },
  { id: 'booking_info', label: 'Бронирование', minWidth: 170 },
  { id: 'payment_type', label: 'Тип оплаты', minWidth: 130 },
  { id: 'total_amount', label: 'Сумма', minWidth: 100 },
  { id: 'payment_status', label: 'Статус', minWidth: 130 },
  {
    id: 'payment_date',
    label: 'Дата оплаты',
    minWidth: 130,
    format: (value: string) =>
      value ? format(new Date(value), 'dd.MM.yyyy HH:mm') : '-',
  },
];

const initialFormData: PaymentCreate = {
  booking_id: 0,
  payment_type: 'банковская карта',
  total_amount: 0,
  payment_status: 'не оплачено',
  payment_date: format(new Date(), 'yyyy-MM-dd'),
};

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState<PaymentCreate>(initialFormData);

  const { showSuccess, showError } = useNotification();
  const { isAuthenticated } = useAuth();

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Заглушки данных
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

      const mockPayments: Payment[] = [
        {
          payment_id: 1,
          booking_id: 1,
          payment_type: 'банковская карта',
          total_amount: 5000,
          payment_status: 'оплачено',
          payment_date: '2024-07-01T10:30:00',
          created_at: '2024-06-30T15:00:00',
          updated_at: '2024-07-01T10:30:00'
        },
        {
          payment_id: 2,
          booking_id: 2,
          payment_type: 'наличные',
          total_amount: 3000,
          payment_status: 'не оплачено',
          payment_date: undefined,
          created_at: '2024-07-02T12:00:00',
          updated_at: '2024-07-02T12:00:00'
        }
      ];
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setBookings(mockBookings);
      setPayments(mockPayments);
    } catch (err) {
      setError('Не удалось загрузить данные');
      showError('Ошибка при загрузке данных');
      setPayments([]);
      setBookings([]);
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
      
      if (editingPayment) {
        setPayments(prev => prev.map(payment => 
          payment.payment_id === editingPayment.payment_id 
            ? { 
                ...payment, 
                ...formData,
                updated_at: new Date().toISOString()
              }
            : payment
        ));
        showSuccess('Платеж успешно обновлен');
      } else {
        const newPayment: Payment = {
          payment_id: Date.now(),
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setPayments(prev => [...prev, newPayment]);
        showSuccess('Платеж успешно создан');
      }
      
      handleCloseDialog();
    } catch (err) {
      showError(
        editingPayment
          ? 'Ошибка при обновлении платежа'
          : 'Ошибка при создании платежа'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (payment: Payment) => {
    if (window.confirm('Вы уверены, что хотите удалить этот платеж?')) {
      try {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setPayments(prev => prev.filter(p => p.payment_id !== payment.payment_id));
        showSuccess('Платеж успешно удален');
      } catch (err) {
        showError('Ошибка при удалении платежа');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setFormData({
      booking_id: payment.booking_id,
      payment_type: payment.payment_type,
      total_amount: payment.total_amount,
      payment_status: payment.payment_status,
      payment_date: payment.payment_date,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPayment(null);
    setFormData(initialFormData);
  };

  const getBookingInfo = (bookingId: number) => {
    const booking = bookings.find((b) => b.booking_id === bookingId);
    return booking
      ? `Бронирование #${booking.booking_id} (${booking.number_of_seats} мест)`
      : 'Неизвестное бронирование';
  };

  // Обогащаем данные платежей
  const enrichedPayments = Array.isArray(payments) ? payments.map((payment) => ({
    ...payment,
    booking_info: getBookingInfo(payment.booking_id),
  })) : [];

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Платежи
        </Typography>
        {isAuthenticated && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsDialogOpen(true)}
          >
            Добавить платеж
          </Button>
        )}
      </Box>

      {!isAuthenticated && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Для создания платежей необходимо войти в систему.
        </Alert>
      )}

      <DataTable
        columns={columns}
        data={enrichedPayments}
        isLoading={isLoading}
        error={error || undefined}
        onEdit={isAuthenticated ? handleEdit : undefined}
        onDelete={isAuthenticated ? handleDelete : undefined}
        searchPlaceholder="Поиск по платежам..."
      />

      <FormDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        title={editingPayment ? 'Редактировать платеж' : 'Создать платеж'}
        isLoading={isLoading}
      >
        <Stack spacing={2}>
          <FormControl fullWidth>
            <InputLabel>Бронирование</InputLabel>
            <Select
              value={formData.booking_id}
              label="Бронирование"
              onChange={(e) =>
                setFormData({ ...formData, booking_id: Number(e.target.value) })
              }
            >
              {bookings.map((booking) => (
                <MenuItem key={booking.booking_id} value={booking.booking_id}>
                  {getBookingInfo(booking.booking_id)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Тип оплаты</InputLabel>
            <Select
              value={formData.payment_type}
              label="Тип оплаты"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  payment_type: e.target.value as Payment['payment_type'],
                })
              }
            >
              <MenuItem value="банковская карта">Банковская карта</MenuItem>
              <MenuItem value="наличные">Наличные</MenuItem>
              <MenuItem value="перевод">Перевод</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            type="number"
            label="Сумма"
            value={formData.total_amount}
            onChange={(e) =>
              setFormData({
                ...formData,
                total_amount: parseInt(e.target.value) || 0,
              })
            }
            required
            inputProps={{ min: 0 }}
          />
          <FormControl fullWidth>
            <InputLabel>Статус</InputLabel>
            <Select
              value={formData.payment_status}
              label="Статус"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  payment_status: e.target.value as Payment['payment_status'],
                })
              }
            >
              <MenuItem value="не оплачено">Не оплачено</MenuItem>
              <MenuItem value="оплачено">Оплачено</MenuItem>
              <MenuItem value="отменено">Отменено</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            type="date"
            label="Дата оплаты"
            value={formData.payment_date || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                payment_date: e.target.value || undefined,
              })
            }
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
      </FormDialog>
    </Container>
  );
};

export default Payments;