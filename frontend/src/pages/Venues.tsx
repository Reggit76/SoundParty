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
  Alert,
} from '@mui/material';
import { LocationOn, People, Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<VenueCreate>({
    name: '',
    address: '',
    capacity: 0,
  });

  const { isAdmin, isOrganizer } = useAuth();
  const { showSuccess, showError } = useNotification();

  // Может создавать/редактировать только админ или организатор
  const canModify = isAdmin || isOrganizer;

  const fetchVenues = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Временная заглушка с реальными данными
      const mockVenues: Venue[] = [
        { 
          venue_id: 1, 
          name: 'Main Concert Hall', 
          address: '123 Music Street, Moscow', 
          capacity: 500 
        },
        { 
          venue_id: 2, 
          name: 'Small Jazz Club', 
          address: '456 Jazz Avenue, Moscow', 
          capacity: 100 
        },
        { 
          venue_id: 3, 
          name: 'Outdoor Stage', 
          address: 'Central Park, Moscow', 
          capacity: 1000 
        }
      ];
      
      // Имитируем задержку сети
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setVenues(mockVenues);
    } catch (err: any) {
      console.error('Ошибка при загрузке площадок:', err);
      setError('Не удалось загрузить площадки. Попробуйте еще раз.');
      showError('Ошибка при загрузке площадок');
      setVenues([]); // Устанавливаем пустой массив в случае ошибки
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Имитируем API запрос
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingVenue) {
        // Обновляем существующую площадку
        setVenues(prev => prev.map(venue => 
          venue.venue_id === editingVenue.venue_id 
            ? { ...venue, ...formData }
            : venue
        ));
        showSuccess('Площадка успешно обновлена');
      } else {
        // Создаем новую площадку
        const newVenue: Venue = {
          venue_id: Date.now(), // Временный ID
          ...formData
        };
        setVenues(prev => [...prev, newVenue]);
        showSuccess('Площадка успешно создана');
      }
      
      handleCloseDialog();
    } catch (err: any) {
      console.error('Ошибка при сохранении площадки:', err);
      showError(
        editingVenue
          ? 'Ошибка при обновлении площадки'
          : 'Ошибка при создании площадки'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (venue: Venue) => {
    if (window.confirm(`Вы уверены, что хотите удалить площадку "${venue.name}"?`)) {
      try {
        setLoading(true);
        
        // Имитируем API запрос
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setVenues(prev => prev.filter(v => v.venue_id !== venue.venue_id));
        showSuccess('Площадка успешно удалена');
      } catch (err: any) {
        console.error('Ошибка при удалении площадки:', err);
        showError('Ошибка при удалении площадки');
      } finally {
        setLoading(false);
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
    setFormData({ name: '', address: '', capacity: 0 });
  };

  const handleOpenCreateDialog = () => {
    setEditingVenue(null);
    setFormData({ name: '', address: '', capacity: 0 });
    setIsDialogOpen(true);
  };

  if (loading && venues.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
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
            onClick={handleOpenCreateDialog}
            disabled={loading}
          >
            Добавить площадку
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button 
            onClick={fetchVenues} 
            sx={{ ml: 2 }}
            size="small"
          >
            Попробовать снова
          </Button>
        </Alert>
      )}

      {!canModify && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Для создания и редактирования площадок необходимы права администратора или организатора.
        </Alert>
      )}

      {Array.isArray(venues) && venues.length === 0 && !loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
          <Typography variant="h6" color="text.secondary">
            Площадки не найдены
            {canModify && '. Создайте первую площадку!'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {Array.isArray(venues) && venues.map((venue) => (
            <Grid item xs={12} sm={6} md={4} key={venue.venue_id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {venue.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      {venue.address || 'Адрес не указан'}
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
                    <>
                      <Button 
                        size="small" 
                        color="primary" 
                        onClick={() => handleEdit(venue)}
                        startIcon={<EditIcon />}
                      >
                        Редактировать
                      </Button>
                      <Button 
                        size="small" 
                        color="error" 
                        onClick={() => handleDelete(venue)}
                      >
                        Удалить
                      </Button>
                    </>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Диалог создания/редактирования площадки */}
      {canModify && (
        <FormDialog
          open={isDialogOpen}
          onClose={handleCloseDialog}
          onSubmit={handleSubmit}
          title={editingVenue ? 'Редактировать площадку' : 'Создать площадку'}
          isLoading={isSubmitting}
        >
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Название площадки"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              helperText="Введите название площадки"
            />
            <TextField
              fullWidth
              label="Адрес"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
              helperText="Введите полный адрес площадки"
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
              helperText="Максимальное количество человек"
            />
          </Stack>
        </FormDialog>
      )}
    </Container>
  );
};

export default Venues;