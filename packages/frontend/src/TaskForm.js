import React, { useState, useEffect } from 'react';
import { TextField, Button, Paper, Typography, Box, ToggleButtonGroup, ToggleButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';

function TaskForm({ onSave, initialTask }) {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [dueDate, setDueDate] = useState(initialTask?.due_date || '');
  const [priority, setPriority] = useState(initialTask?.priority || 'P3');
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

  // Update form fields when initialTask changes (editing mode)
  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '');
      setDescription(initialTask.description || '');
      setDueDate(normalizeDateString(initialTask.due_date));
      setPriority(initialTask.priority || 'P3');
    } else {
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('P3');
    }
  }, [initialTask]);

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
        {initialTask ? 'Edit Task' : 'Add Task'}
      </Typography>
      <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={1.5}>
        <TextField
          id="task-title"
          label="Task Title"
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
          id="task-description"
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
          id="task-due-date"
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
        <ToggleButtonGroup
          value={priority}
          exclusive
          onChange={(e, val) => { if (val) setPriority(val); }}
          size="small"
          aria-label="Task Priority"
          data-testid="priority-group"
          sx={{
            display: 'flex',
            gap: 1,
            '& .MuiToggleButton-root': {
              flex: 1,
              fontSize: '0.7rem',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
              py: 0.75
            }
          }}
        >
          <ToggleButton
            value="P1"
            aria-label="Priority P1"
            data-testid="priority-p1"
            sx={{
              backgroundColor: priority === 'P1' ? '#d32f2f' : 'rgba(211,47,47,0.12)',
              color: priority === 'P1' ? '#fff' : '#d32f2f',
              '&.Mui-selected': { backgroundColor: '#d32f2f', color: '#fff' },
              '&:hover': { backgroundColor: '#d32f2f', color: '#fff' }
            }}
          >P1</ToggleButton>
          <ToggleButton
            value="P2"
            aria-label="Priority P2"
            data-testid="priority-p2"
            sx={{
              backgroundColor: priority === 'P2' ? '#ff9800' : 'rgba(255,152,0,0.18)',
              color: priority === 'P2' ? '#fff' : '#ef6c00',
              '&.Mui-selected': { backgroundColor: '#ff9800', color: '#fff' },
              '&:hover': { backgroundColor: '#ff9800', color: '#fff' }
            }}
          >P2</ToggleButton>
          <ToggleButton
            value="P3"
            aria-label="Priority P3"
            data-testid="priority-p3"
            sx={{
              backgroundColor: priority === 'P3' ? '#9e9e9e' : 'rgba(158,158,158,0.18)',
              color: priority === 'P3' ? '#fff' : '#616161',
              '&.Mui-selected': { backgroundColor: '#9e9e9e', color: '#fff' },
              '&:hover': { backgroundColor: '#9e9e9e', color: '#fff' }
            }}
          >P3</ToggleButton>
        </ToggleButtonGroup>
        {error && <Typography color="error" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>{error}</Typography>}
        <Box display="flex" gap={2}>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            fullWidth
            data-testid="submit-task"
            startIcon={initialTask ? <SaveIcon /> : <AddIcon />}
            sx={{
              borderRadius: 2,
              py: 1,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.95rem',
            }}
          >
            {initialTask ? 'Save Changes' : 'Add Task'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default TaskForm;
