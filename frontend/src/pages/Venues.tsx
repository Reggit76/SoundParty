import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  TextField,
  Stack,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import DataTable from '../components/common/DataTable';
import FormDialog from '../components/common/FormDialog';
import { venuesApi, VenueCreate } from '../services/api/venues';
import { Venue } from '../services/types/api';
import { useNotification } from '../contexts/NotificationContext';

const columns = [
  { id: 'venue_id', label: 'ID', minWidth: 50 },
  { id: 'name', label: 'Название', minWidth: 170 },
  { id: 'address', label: 'Адрес', minWidth: 200 },
  { id: 'capacity', label: 'Вместимость', minWidth: 100 },
];

const initialFormData: VenueCreate = {
  name: '',
  address: '',
  capacity: 0,
};

const Venues = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [formData, setFormData] = useState<VenueCreate>(initialFormData);

  const { showSuccess, showError } = useNotification();

  const loadVenues = async () => {
    try {
      setIsLoading(true);
      const data = await venuesApi.getAll();
      setVenues(data);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить список площадок');
      showError('Ошибка при загрузке площадок');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVenues();
  }, []);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      if (editingVenue) {
        await venuesApi.update(editingVenue.venue_id, formData);
        showSuccess('Площадка успешно обновлена');
      } else {
        await venuesApi.create(formData);
        showSuccess('Площадка успешно создана');
      }
      loadVenues();
      handleCloseDialog();
    } catch (err) {
      showError(
        editingVenue
          ? 'Ошибка при обновлении площадки'
          : 'Ошибка при создании площадки'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (venue: Venue) => {
    if (window.confirm('Вы уверены, что хотите удалить эту площадку?')) {
      try {
        setIsLoading(true);
        await venuesApi.delete(venue.venue_id);
        showSuccess('Площадка успешно удалена');
        loadVenues();
      } catch (err) {
        showError('Ошибка при удалении площадки');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEdit = (venue: Venue) => {
    setEditingVenue(venue);
    setFormData({
      name: venue.name,
      address: venue.address,
      capacity: venue.capacity,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingVenue(null);
    setFormData(initialFormData);
  };

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Площадки
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsDialogOpen(true)}
        >
          Добавить площадку
        </Button>
      </Box>

      <DataTable
        columns={columns}
        data={venues}
        isLoading={isLoading}
        error={error || undefined}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Поиск по площадкам..."
      />

      <FormDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        title={editingVenue ? 'Редактировать площадку' : 'Создать площадку'}
        isLoading={isLoading}
      >
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Название площадки"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <TextField
            fullWidth
            label="Адрес"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            multiline
            rows={2}
          />
          <TextField
            fullWidth
            type="number"
            label="Вместимость"
            value={formData.capacity}
            onChange={(e) =>
              setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })
            }
            required
            inputProps={{ min: 1 }}
          />
        </Stack>
      </FormDialog>
    </Container>
  );
};

export default Venues;