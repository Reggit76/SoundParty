import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Event,
  MusicNote,
  Group,
  LocationOn,
} from '@mui/icons-material';
import api from '../services/api';
import Grid from '../components/CustomGrid';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar_url: string;
  location: string;
  bio: string;
  teams: Array<{
    id: number;
    name: string;
    role: string;
  }>;
  upcoming_events: Array<{
    id: number;
    title: string;
    date: string;
    venue: string;
  }>;
  favorite_genres: string[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.profile.get();
        setProfile(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load profile. Please try again later.');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography color="error">{error || 'Profile not found'}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              src={profile.avatar_url}
              alt={profile.name}
              sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
            />
            <Typography variant="h5" gutterBottom>
              {profile.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {profile.bio}
            </Typography>
            <Button variant="contained" color="primary" fullWidth>
              Edit Profile
            </Button>
          </Paper>

          <Paper sx={{ p: 3, mt: 3 }}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Email />
                </ListItemIcon>
                <ListItemText primary="Email" secondary={profile.email} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Phone />
                </ListItemIcon>
                <ListItemText primary="Phone" secondary={profile.phone} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LocationOn />
                </ListItemIcon>
                <ListItemText primary="Location" secondary={profile.location} />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ width: '100%' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab icon={<Event />} label="Upcoming Events" />
              <Tab icon={<Group />} label="Teams" />
              <Tab icon={<MusicNote />} label="Favorite Genres" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <List>
                {profile.upcoming_events.map((event) => (
                  <React.Fragment key={event.id}>
                    <ListItem>
                      <ListItemIcon>
                        <Event />
                      </ListItemIcon>
                      <ListItemText
                        primary={event.title}
                        secondary={`${new Date(event.date).toLocaleDateString()} at ${
                          event.venue
                        }`}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <List>
                {profile.teams.map((team) => (
                  <React.Fragment key={team.id}>
                    <ListItem>
                      <ListItemIcon>
                        <Group />
                      </ListItemIcon>
                      <ListItemText primary={team.name} secondary={`Role: ${team.role}`} />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {profile.favorite_genres.map((genre, index) => (
                  <Paper
                    key={index}
                    sx={{
                      px: 2,
                      py: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <MusicNote fontSize="small" />
                    <Typography variant="body2">{genre}</Typography>
                  </Paper>
                ))}
              </Box>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile; 