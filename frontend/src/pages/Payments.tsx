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
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import  ru  from 'date-fns/locale/ru';
import DataTable from '../components/common/DataTable';
import FormDialog from '../components/common/FormDialog';
import { paymentsApi, PaymentCreate } from '../services/api/payments';
import { bookingsApi } from '../services/api/bookings';
import { Payment, Booking } from '../services/types/api';
import { useNotification } from '../contexts/NotificationContext';
import { format } from 'date-fns';

const columns = [
  { id: 'payment_id', label: 'ID', minWidth: 50 },
  { id: 'booking_id', label: 'Бронирование', minWidth: 170 },
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

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [paymentsData, bookingsData] = await Promise.all([
        paymentsApi.getAll(),
        bookingsApi.getAll(),
      ]);
      setPayments(paymentsData);
      setBookings(bookingsData);
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
      if (editingPayment) {
        await paymentsApi.update(editingPayment.payment_id, formData);
        showSuccess('Платеж успешно обновлен');
      } else {
        await paymentsApi.create(formData);
        showSuccess('Платеж успешно создан');
      }
      loadData();
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
        await paymentsApi.delete(payment.payment_id);
        showSuccess('Платеж успешно удален');
        loadData();
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

  const enrichedPayments = payments.map((payment) => ({
    ...payment,
    booking_id: getBookingInfo(payment.booking_id),
  }));

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Платежи
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsDialogOpen(true)}
        >
          Добавить платеж
        </Button>
      </Box>

      <DataTable
        columns={columns}
        data={enrichedPayments}
        isLoading={isLoading}
        error={error || undefined}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Поиск по платежам..."
      />

      <FormDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        title={editingPayment ? 'Редактировать платеж' : 'Создать платеж'}
        isLoading={isLoading}
      >
        <LocalizationProvider dateAdapter={AdapterDateFns}>
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
            <DatePicker
              label="Дата оплаты"
              value={formData.payment_date ? new Date(formData.payment_date) : null}
              onChange={(newValue: Date | null) => {
                setFormData({
                  ...formData,
                  payment_date: newValue ? format(newValue, 'yyyy-MM-dd') : undefined,
                });
              }}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Stack>
        </LocalizationProvider>
      </FormDialog>
    </Container>
  );
};

export default Payments; 