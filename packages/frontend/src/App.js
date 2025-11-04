import React, { useState } from 'react';
import './App.css'; // Ensure priority button styles are applied
import { CssBaseline, Container, AppBar, Toolbar, Typography, Box } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import TaskList from './TaskList';
import TaskForm from './TaskForm';

function App() {
  // Central reference to supported priority levels used across form, list, and tests.
  // Keeping this here allows future features (e.g., dynamic priority labels or colors)
  // to source from a single location. Colors are implemented in CSS (App.css).
  const PRIORITY_LEVELS = ['P1', 'P2', 'P3'];

  const [editingItem, setEditingItem] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSave = async (item) => {
    if (editingItem) {
      // Edit existing item
      await fetch(`/api/items/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      setEditingItem(null);
    } else {
      // Add new item
      await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
    }
    setRefreshKey(k => k + 1);
  };

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: '#f5f5f5',
          pb: 4
        }}
      >
        <AppBar
          position="static"
          sx={{
            background: '#1976d2',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Toolbar>
            <CheckCircleOutlineIcon sx={{ mr: 2, fontSize: 28 }} />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                letterSpacing: '0.5px'
              }}
            >
              TODO App
            </Typography>
          </Toolbar>
        </AppBar>
        <Container 
          maxWidth="md" 
          sx={{ 
            mt: 4,
            height: 'calc(100vh - 120px)', 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ mb: 2, flexShrink: 0 }}>
            {/* Pass PRIORITY_LEVELS for potential future dynamic rendering (currently static inside ItemForm) */}
            <TaskForm onSave={handleSave} initialTask={editingItem} priorityLevels={PRIORITY_LEVELS} />
          </Box>
          <Box sx={{ flexGrow: 1, minHeight: 0, overflow: 'hidden' }}>
            <TaskList key={refreshKey} onEdit={setEditingItem} />
          </Box>
        </Container>
      </Box>
    </>
  );
}

export default App;
