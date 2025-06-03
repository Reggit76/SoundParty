import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  CircularProgress,
  Grid,
  TextField,
  Stack,
} from '@mui/material';
import { LocationOn, People, Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import FormDialog from '../components/common/FormDialog';

interface Venue {
  venue_id: number;
  name: string;
  address: string;
  capacity: number;
}

interface VenueCreate {
  name: string;
  address: string;
  capacity: number;
}

const Venues: React.FC = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [formData, setFormData] = useState<VenueCreate>({
    name: '',
    address: '',
    capacity: 0,
  });

  const { isAdmin, isOrganizer } = useAuth();
  const { showSuccess, showError } = useNotification();

  // Может создавать/редактировать только админ или организатор
  const canModify = isAdmin || isOrganizer;

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        // Здесь должен быть вызов API
        // const response = await venuesApi.getAll();
        // setVenues(response);
        
        // Временная заглушка
        setVenues([
          { venue_id: 1, name: 'Main Hall', address: '123 Music Street', capacity: 500 },
          { venue_id: 2, name: 'Small Stage', address: '456 Concert Ave', capacity: 100 }
        ]);
        setLoading(false);
      } catch (err) {
        setError('Failed to load venues. Please try again later.');
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (editingVenue) {
        // await venuesApi.update(editingVenue.venue_id, formData);
        showSuccess('Площадка успешно обновлена');
      } else {
        // await venuesApi.create(formData);
        showSuccess('Площадка успешно создана');
      }
      handleCloseDialog();
    } catch (err) {
      showError(
        editingVenue
          ? 'Ошибка при обновлении площадки'
          : 'Ошибка при создании площадки'
      );
    } finally {
      setLoading(false);
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
    setFormData({ name: '', address: '', capacity: 0 });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Площадки
        </Typography>
        {canModify && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsDialogOpen(true)}
          >
            Добавить площадку
          </Button>
        )}
      </Box>

      <Grid container spacing={4}>
        {venues.map((venue) => (
          <Grid item xs={12} sm={6} md={4} key={venue.venue_id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {venue.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    {venue.address}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <People fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    Вместимость: {venue.capacity}
                  </Typography>
                </Box>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">
                  Подробнее
                </Button>
                {canModify && (
                  <Button size="small" color="primary" onClick={() => handleEdit(venue)}>
                    Редактировать
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {canModify && (
        <FormDialog
          open={isDialogOpen}
          onClose={handleCloseDialog}
          onSubmit={handleSubmit}
          title={editingVenue ? 'Редактировать площадку' : 'Создать площадку'}
          isLoading={loading}
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
              required
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
      )}
    </Container>
  );
};

export default Venues;