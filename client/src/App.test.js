import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import axios from 'axios';

// Mock axios
jest.mock('axios');

describe('App Component', () => {
  test('renders Daily Planner title', async () => {
    // Mock successful response
    axios.get.mockResolvedValue({ data: { tasks: [] } });

    render(<App />);

    expect(screen.getByText('Daily Planner')).toBeInTheDocument();

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });
});
