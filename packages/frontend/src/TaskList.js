import React, { useState, useEffect } from 'react';
import {
  List, ListItem, ListItemText, IconButton, Checkbox, Typography, Box, CircularProgress, Paper, Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';

function TaskList({ onEdit }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const formatDueDate = (dateString) => {
    if (!dateString) return null;
    // Parse as local date to avoid timezone offset issues
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/items');
      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      setItems(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (item) => {
    try {
      await fetch(`/api/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !item.completed })
      });
      fetchItems();
    } catch (err) {
      setError('Failed to update item');
    }
  };

  const handlePriorityChange = async (item, newPriority) => {
    if (!['P1','P2','P3'].includes(newPriority)) return;
    try {
      await fetch(`/api/items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: item.title,
            description: item.description,
            due_date: item.due_date,
            priority: newPriority
        })
      });
      fetchItems();
    } catch (err) {
      setError('Failed to change item priority');
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/items/${id}`, { method: 'DELETE' });
      fetchItems();
    } catch (err) {
      setError('Failed to delete item');
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
      <CircularProgress sx={{ color: '#1976d2' }} />
    </Box>
  );
  if (error) return <Typography color="error" sx={{ fontWeight: 500 }}>{error}</Typography>;

  return (
    <Paper 
      elevation={0}
      sx={{ 
        mt: 3, 
        p: 2, 
        width: '100%', 
        maxHeight: '60vh', 
        overflow: 'auto',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(0, 0, 0, 0.05)',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(25, 118, 210, 0.5)',
          borderRadius: '4px',
          '&:hover': {
            background: 'rgba(25, 118, 210, 0.7)',
          }
        }
      }}
    >
      <Typography 
        variant="subtitle1" 
        sx={{ 
          fontWeight: 600,
          color: '#1976d2',
          mb: 1.5
        }}
      >
  Items
      </Typography>
      <List sx={{ p: 0 }}>
  {items.length === 0 && (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 4,
              color: '#9e9e9e' 
            }}
          >
            <Typography variant="body2">No items found.</Typography>
          </Box>
        )}
        {items.map((item, index) => (
          <ListItem 
            key={item.id} 
            sx={{ 
              pr: 18,
              py: 1,
              mb: 1,
              borderRadius: 2,
              background: item.completed 
                ? 'rgba(158, 158, 158, 0.08)' 
                : 'rgba(25, 118, 210, 0.05)',
              border: '1px solid',
              borderColor: item.completed 
                ? 'rgba(158, 158, 158, 0.15)' 
                : 'rgba(25, 118, 210, 0.15)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                background: item.completed 
                  ? 'rgba(158, 158, 158, 0.12)' 
                  : 'rgba(25, 118, 210, 0.1)',
                transform: 'translateX(4px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              }
            }}
          >
            <Checkbox
              edge="start"
              checked={!!item.completed}
              onChange={() => handleToggleComplete(item)}
              inputProps={{ 'aria-label': 'Mark task complete' }}
              size="small"
              sx={{
                color: '#1976d2',
                py: 0,
                '&.Mui-checked': {
                  color: '#1976d2',
                }
              }}
            />
            <ListItemText
              primary={
                <Typography 
                  variant="body2"
                  sx={{ 
                    textDecoration: item.completed ? 'line-through' : 'none', 
                    color: item.completed ? '#9e9e9e' : '#212121',
                    fontWeight: item.completed ? 400 : 600,
                    fontSize: '1rem'
                  }}
                >
                  {item.title}
                </Typography>
              }
              secondary={
                item.description && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: item.completed ? '#bdbdbd' : '#616161',
                      fontSize: '0.85rem',
                      mt: 0.25
                    }}
                  >
                    {item.description}
                  </Typography>
                )
              }
            />
            <Box 
              sx={{ 
                position: 'absolute', 
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 1
              }}
            >
              {item.priority && (
                <Box 
                  className="priority-toggle-group"
                  role="radiogroup"
                  aria-label={`Change priority for item ${item.title}`}
                  sx={{ display: 'flex', gap: 0.5 }}
                >
                  {['P1','P2','P3'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handlePriorityChange(item, p)}
                      className={`priority-toggle ${item.priority === p ? 'selected' : ''}`}
                      role="radio"
                      aria-checked={item.priority === p}
                      aria-label={`Set priority ${p}`}
                      data-testid={`item-${item.id}-priority-${p.toLowerCase()}`}
                    >{p}</button>
                  ))}
                </Box>
              )}
              {item.due_date && (
                <Chip
                  icon={<EventIcon sx={{ fontSize: 14 }} />}
                  label={formatDueDate(item.due_date)}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    background: 'linear-gradient(135deg, #ff9800 0%, #ff6f00 100%)',
                    color: 'white',
                    '& .MuiChip-icon': {
                      color: 'white'
                    }
                  }}
                />
              )}
              <Box 
                sx={{ 
                  display: 'flex', 
                  gap: 0.5,
                  opacity: 0.7,
                  transition: 'opacity 0.2s',
                  '&:hover': {
                    opacity: 1
                  }
                }}
              >
                <IconButton 
                  aria-label="edit" 
                  onClick={() => onEdit(item)}
                  size="small"
                  sx={{
                    color: '#1976d2',
                    '&:hover': {
                      background: 'rgba(25, 118, 210, 0.1)',
                    }
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton 
                  aria-label="delete" 
                  onClick={() => handleDelete(item.id)}
                  size="small"
                  sx={{
                    color: '#f44336',
                    '&:hover': {
                      background: 'rgba(244, 67, 54, 0.1)',
                    }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

export default TaskList;
