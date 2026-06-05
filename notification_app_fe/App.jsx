
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Chip, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Pagination,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Badge,
  Divider
} from '@mui/material';

export default function App() {
  const [list, setList] = useState([]);
  const [urgentList, setUrgentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [filterType, setFilterType] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);

  const getColor = (t) => {
    if (t === 'Placement') return 'error';
    if (t === 'Result') return 'warning';
    if (t === 'Event') return 'info';
    return 'default';
  };

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        let apiProps = `?limit=${limit}&page=${page}`;
        if (filterType) {
          apiProps += `&notification_type=${filterType}`;
        }

        const res = await fetch(`http://4.2.24.186.213/evaluation-service/notifications${apiProps}`);
        if (!res.ok) throw new Error('Network issues detected.');
        
        const json = await res.json();
        const items = json.notifications || [];
        setList(items);

        const weights = { Placement: 3, Result: 2, Event: 1 };
        const sorted = [...items].sort((a, b) => {
          const wA = weights[a.Type] || 0;
          const wB = weights[b.Type] || 0;
          if (wA !== wB) return wB - wA;
          return new Date(b.Timestamp) - new Date(a.Timestamp);
        });

        setUrgentList(sorted.slice(0, 10));
        setErr(null);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [filterType, page, limit]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
          Campus Notification Hub
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Live academic streams and time-critical announcements
        </Typography>
      </Box>

      <Card sx={{ mb: 4, p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={filterType}
                label="Type"
                onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
              >
                <MenuItem value="">All Notifications</MenuItem>
                <MenuItem value="Placement">Placements</MenuItem>
                <MenuItem value="Result">Results</MenuItem>
                <MenuItem value="Event">Events</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Size</InputLabel>
              <Select
                value={limit}
                label="Size"
                onChange={(e) => { setLimit(e.target.value); setPage(1); }}
              >
                <MenuItem value={5}>5 Items</MenuItem>
                <MenuItem value={10}>10 Items</MenuItem>
                <MenuItem value={20}>20 Items</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {err && (
        <Box sx={{ p: 2, bgcolor: '#fdf2f2', color: '#9b1c1c', borderRadius: 1, mb: 4 }}>
          <Typography variant="body1">Error: {err}</Typography>
        </Box>
      )}

      {!loading && !err && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              Priority Inbox <Badge badgeContent={urgentList.length} color="error" />
            </Typography>
            <Card sx={{ borderLeft: '4px solid #d32f2f' }}>
              <CardContent sx={{ p: 1 }}>
                {urgentList.length === 0 ? (
                  <Typography color="text.secondary" sx={{ p: 2 }}>No updates available.</Typography>
                ) : (
                  <List disablePadding>
                    {urgentList.map((item, i) => (
                      <React.Fragment key={item.ID || i}>
                        <ListItem alignItems="flex-start" sx={{ px: 1 }}>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Chip label={item.Type} size="small" color={getColor(item.Type)} />
                                <Typography variant="caption" color="text.secondary">{item.Timestamp}</Typography>
                              </Box>
                            }
                            secondary={
                              <Typography variant="body2" color="text.primary">
                                {item.Message}
                              </Typography>
                            }
                          />
                        </ListItem>
                        {i < urgentList.length - 1 && <Divider component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={7}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              General Stream Noticeboard
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {list.length === 0 ? (
                <Typography color="text.secondary">No matching feeds found.</Typography>
              ) : (
                list.map((item, i) => (
                  <Card key={item.ID || i}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Chip label={item.Type} size="small" color={getColor(item.Type)} />
                        <Typography variant="caption" color="text.secondary">
                          {item.Timestamp}
                        </Typography>
                      </Box>
                      <Typography variant="body1">
                        {item.Message}
                      </Typography>
                    </CardContent>
                  </Card>
                ))
              )}

              {list.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                  <Pagination 
                    count={5} 
                    page={page} 
                    onChange={(e, v) => setPage(v)} 
                    color="primary" 
                  />
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
