import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Box,
  CircularProgress,
  Rating,
  Chip,
} from '@mui/material';
import { LocationOn, People, MusicNote } from '@mui/icons-material';
import api from '../services/api';

interface Venue {
  id: number;
  name: string;
  description: string;
  address: string;
  capacity: number;
  rating: number;
  image_url: string;
  amenities: string[];
}

const Venues: React.FC = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await api.venues.getAll();
        setVenues(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load venues. Please try again later.');
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

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
      <Typography variant="h4" component="h1" gutterBottom>
        Music Venues
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 4,
        }}
      >
        {venues.map((venue) => (
          <Box
            key={venue.id}
            sx={{
              flex: {
                xs: '0 0 100%',
                sm: '0 0 calc(50% - 32px)',
                md: '0 0 calc(33.333% - 32px)',
              },
            }}
          >
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={venue.image_url}
                alt={venue.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {venue.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating value={venue.rating} readOnly precision={0.5} />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    ({venue.rating})
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {venue.description}
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
                    Capacity: {venue.capacity}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {venue.amenities.map((amenity, index) => (
                    <Chip
                      key={index}
                      icon={<MusicNote />}
                      label={amenity}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">
                  View Details
                </Button>
                <Button size="small" color="primary">
                  Book Venue
                </Button>
              </CardActions>
            </Card>
          </Box>
        ))}
      </Box>
    </Container>
  );
};

export default Venues; 