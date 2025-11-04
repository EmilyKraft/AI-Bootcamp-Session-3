import React, { useState, useEffect } from 'react';
import { TextField, Button, Paper, Typography, Box, ToggleButtonGroup, ToggleButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';

function TaskForm({ onSave, initialItem }) {
  const [title, setTitle] = useState(initialItem?.title || '');
  const [description, setDescription] = useState(initialItem?.description || '');
  const [dueDate, setDueDate] = useState(initialItem?.due_date || '');
  const [priority, setPriority] = useState(initialItem?.priority || 'P3');
  const [error, setError] = useState(null);

  // Helper to normalize date string to YYYY-MM-DD format
  const normalizeDateString = (dateString) => {
    if (!dateString) return '';
    // If already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    // Otherwise, parse and format
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Update form fields when initialItem changes (editing mode)
  useEffect(() => {
    if (initialItem) {
      setTitle(initialItem.title || '');
      setDescription(initialItem.description || '');
      setDueDate(normalizeDateString(initialItem.due_date));
      setPriority(initialItem.priority || 'P3');
    } else {
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('P3');
    }
  }, [initialItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setError(null);
    const safePriority = ['P1','P2','P3'].includes(priority) ? priority : 'P3';
    await onSave({ title, description, due_date: dueDate, priority: safePriority });
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('P3');
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 2, 
        mb: 2, 
        width: '100%',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
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
  {initialItem ? 'Edit Item' : 'Add Item'}
      </Typography>
      <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={1.5}>
        <TextField
          id="item-title"
          label="Item Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          variant="outlined"
          fullWidth
          size="small"
          inputProps={{ 'data-testid': 'title-input' }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&:hover fieldset': {
                borderColor: '#1976d2',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#1976d2',
              }
            }
          }}
        />
        <TextField
          id="item-description"
          label="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          multiline
          minRows={2}
          variant="outlined"
          fullWidth
          size="small"
          inputProps={{ 'data-testid': 'description-input' }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&:hover fieldset': {
                borderColor: '#1976d2',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#1976d2',
              }
            }
          }}
        />
        <TextField
          id="item-due-date"
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          variant="outlined"
          fullWidth
          size="small"
          InputLabelProps={{ shrink: true }}
          inputProps={{ 'data-testid': 'due-date-input' }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&:hover fieldset': {
                borderColor: '#1976d2',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#1976d2',
              }
            }
          }}
        />
        <Box 
          className="priority-toggle-group" 
          role="radiogroup" 
          aria-label="Item Priority" 
          data-testid="priority-group"
        >
          {['P1','P2','P3'].map(val => (
            <button
              key={val}
              type="button"
              onClick={() => setPriority(val)}
              data-testid={`priority-${val.toLowerCase()}`}
              className={`priority-toggle ${priority === val ? 'selected' : ''}`}
              role="radio"
              aria-checked={priority === val}
              aria-label={`Set priority ${val}`}
            >
              {val}
            </button>
          ))}
        </Box>
        {error && <Typography color="error" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>{error}</Typography>}
        <Box display="flex" gap={2}>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            fullWidth
            data-testid="submit-item"
            startIcon={initialItem ? <SaveIcon /> : <AddIcon />}
            sx={{
              borderRadius: 2,
              py: 1,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.95rem',
            }}
          >
            {initialItem ? 'Save Changes' : 'Add Item'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default TaskForm;
