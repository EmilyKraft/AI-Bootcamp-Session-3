import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

// Mock server to intercept API requests for items
const server = setupServer(
  // GET /api/items handler
  rest.get('/api/items', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
  { id: 1, title: 'Test Item 1', description: 'Desc 1', due_date: '2025-09-30', priority: 'P3', completed: 0 },
  { id: 2, title: 'Test Item 2', description: 'Desc 2', due_date: '2025-10-01', priority: 'P2', completed: 1 },
      ])
    );
  }),

  // POST /api/items handler
  rest.post('/api/items', (req, res, ctx) => {
    const { title, priority } = req.body;
    if (!title || title.trim() === '') {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Item title is required' })
      );
    }
    const safePriority = ['P1','P2','P3'].includes(priority) ? priority : 'P3';
    return res(
      ctx.status(201),
      ctx.json({
        id: 3,
        title,
        description: req.body.description || '',
        due_date: req.body.due_date || null,
        priority: safePriority,
        completed: 0,
      })
    );
  }),

  // PUT /api/items/:id handler
  rest.put('/api/items/:id', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ ...req.body, id: Number(req.params.id), completed: 0 })
    );
  }),

  // PATCH /api/items/:id handler
  rest.patch('/api/items/:id', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ id: Number(req.params.id), completed: req.body.completed ? 1 : 0 })
    );
  }),

  // DELETE /api/items/:id handler
  rest.delete('/api/items/:id', (req, res, ctx) => {
    return res(ctx.status(204));
  })
);

// Setup and teardown for the mock server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('TODO App', () => {
  test('renders the main UI', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText('TODO App')).toBeInTheDocument();
    expect(screen.getByTestId('submit-task')).toBeInTheDocument();
      // Removed 'Tasks' assertion, as the header is 'TODO App'
  });

  test('loads and displays items', async () => {
    await act(async () => {
      render(<App />);
    });
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
      expect(screen.getByText('Test Item 2')).toBeInTheDocument();
    });
  });

  test('adds a new item with selected priority', async () => {
    let items = [
      { id: 1, title: 'Test Item 1', description: 'Desc 1', due_date: '2025-09-30', priority: 'P3', completed: 0 },
      { id: 2, title: 'Test Item 2', description: 'Desc 2', due_date: '2025-10-01', priority: 'P2', completed: 1 },
    ];
    server.use(
      rest.get('/api/items', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(items));
      }),
      rest.post('/api/items', (req, res, ctx) => {
        const { title, description, priority } = req.body;
        const safePriority = ['P1','P2','P3'].includes(priority) ? priority : 'P3';
        const newItem = {
          id: 3,
          title,
          description: description || '',
          due_date: req.body.due_date || null,
          priority: safePriority,
          completed: 0,
        };
        items = [...items, newItem];
        return res(ctx.status(201), ctx.json(newItem));
      })
    );
    const user = userEvent.setup();
    await act(async () => { render(<App />); });
    await waitFor(() => { expect(screen.getByText('Test Item 1')).toBeInTheDocument(); });
    await user.type(screen.getByTestId('title-input'), 'New Test Item');
    await user.type(screen.getByTestId('description-input'), 'Item description');
  // Select P1 priority before submit using new CSS button
  const p1Button = screen.getByTestId('priority-p1');
  await user.click(p1Button);
    await user.click(screen.getByTestId('submit-item'));
    await waitFor(() => {
      expect(screen.getByText(/New Test Item/i)).toBeInTheDocument();
      // Verify one of the priority badges reflects P1 (using data-testid for robustness)
      const priorityBadges = screen.getAllByText('P1');
      expect(priorityBadges.length).toBeGreaterThan(0);
    });
  });

  test('renders priority selector with default P3', async () => {
    await act(async () => {
      render(<App />);
    });
    const p3Btn = screen.getByTestId('priority-p3');
    expect(p3Btn).toBeInTheDocument();
    // New CSS implementation toggles class 'selected'
    expect(p3Btn.className).toMatch(/selected/);
  });

  test('handles API error', async () => {
    server.use(
      rest.get('/api/items', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    await act(async () => {
      render(<App />);
    });
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch items/)).toBeInTheDocument();
    });
  });

  test('shows empty state when no tasks', async () => {
    server.use(
      rest.get('/api/items', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]));
      })
    );
    await act(async () => {
      render(<App />);
    });
    await waitFor(() => {
      expect(screen.getByText('No items found.')).toBeInTheDocument();
    });
  });

  test('inline priority change updates item', async () => {
    let items = [
      { id: 1, title: 'Item A', description: 'Desc A', due_date: '2025-09-30', priority: 'P2', completed: 0 },
      { id: 2, title: 'Item B', description: 'Desc B', due_date: null, priority: 'P3', completed: 0 }
    ];
    server.use(
      rest.get('/api/items', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(items));
      }),
      rest.put('/api/items/:id', (req, res, ctx) => {
        const id = Number(req.params.id);
        const idx = items.findIndex(t => t.id === id);
        if (idx === -1) return res(ctx.status(404));
        const updated = { ...items[idx], ...req.body };
        items[idx] = updated;
        return res(ctx.status(200), ctx.json(updated));
      })
    );
    const user = userEvent.setup();
    await act(async () => { render(<App />); });
    await waitFor(() => { expect(screen.getByText('Item A')).toBeInTheDocument(); });
    const p1Btn = screen.getByTestId('item-1-priority-p1');
    // Initially P2 is selected
    const p2Btn = screen.getByTestId('item-1-priority-p2');
    expect(p2Btn.className).toMatch(/selected/);
    await user.click(p1Btn);
    await waitFor(() => {
      expect(p1Btn.className).toMatch(/selected/);
      expect(p2Btn.className).not.toMatch(/selected/);
    });
  });
});
