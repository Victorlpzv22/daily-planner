import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import TaskForm from './TaskForm';

// Mock LocalizationProvider to avoid issues with date pickers in tests
const MockLocalizationProvider = ({ children }) => (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
        {children}
    </LocalizationProvider>
);

const mockHandlers = {
    onSubmit: jest.fn(),
    onCancel: jest.fn()
};

describe('TaskForm Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders form with empty fields for new task', () => {
        render(
            <MockLocalizationProvider>
                <TaskForm {...mockHandlers} />
            </MockLocalizationProvider>
        );

        expect(screen.getByText('Nueva Tarea')).toBeInTheDocument();
        expect(screen.getByLabelText(/Título/i)).toHaveValue('');
        expect(screen.getByLabelText(/Descripción/i)).toHaveValue('');
    });

    test('renders form with existing task data', () => {
        const task = {
            titulo: 'Existing Task',
            descripcion: 'Description',
            fecha_inicio: '2023-01-01',
            fecha_fin: '2023-01-01',
            prioridad: 'alta',
            tipo: 'diaria',
            color: '#d32f2f'
        };

        render(
            <MockLocalizationProvider>
                <TaskForm task={task} {...mockHandlers} />
            </MockLocalizationProvider>
        );

        expect(screen.getByText('Editar Tarea')).toBeInTheDocument();
        expect(screen.getByLabelText(/Título/i)).toHaveValue('Existing Task');
        expect(screen.getByLabelText(/Descripción/i)).toHaveValue('Description');
    });

    test('validates required fields', () => {
        render(
            <MockLocalizationProvider>
                <TaskForm {...mockHandlers} />
            </MockLocalizationProvider>
        );

        const submitButton = screen.getByText('Crear');
        fireEvent.click(submitButton);

        expect(screen.getByText('El título es obligatorio')).toBeInTheDocument();
        expect(mockHandlers.onSubmit).not.toHaveBeenCalled();
    });

    test('submits form with valid data', async () => {
        render(
            <MockLocalizationProvider>
                <TaskForm {...mockHandlers} />
            </MockLocalizationProvider>
        );

        const titleInput = screen.getByLabelText(/Título/i);
        fireEvent.change(titleInput, { target: { value: 'New Task' } });

        const submitButton = screen.getByText('Crear');
        fireEvent.click(submitButton);

        expect(mockHandlers.onSubmit).toHaveBeenCalled();
        expect(mockHandlers.onSubmit).toHaveBeenCalledWith(expect.objectContaining({
            titulo: 'New Task',
            tipo: 'diaria'
        }));
    });

    test('toggles recurrence options', () => {
        render(
            <MockLocalizationProvider>
                <TaskForm {...mockHandlers} />
            </MockLocalizationProvider>
        );

        const toggleButton = screen.getByText('Desactivado');
        fireEvent.click(toggleButton);

        expect(screen.getByText('Activado')).toBeInTheDocument();
        // Check for the presence of the text "Frecuencia" which appears in the label
        expect(screen.getAllByText('Frecuencia').length).toBeGreaterThan(0);
    });
});
