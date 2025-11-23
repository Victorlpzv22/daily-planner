import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskItem from './TaskItem';

const mockTask = {
    id: 1,
    titulo: 'Test Task',
    descripcion: 'Test Description',
    fecha_inicio: '2023-01-01',
    fecha_fin: '2023-01-01',
    hora: '10:00:00',
    completada: false,
    prioridad: 'media',
    tipo: 'diaria',
    color: '#1976d2'
};

const mockHandlers = {
    onToggle: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn()
};

describe('TaskItem Component', () => {
    test('renders task details correctly', () => {
        render(<TaskItem task={mockTask} {...mockHandlers} />);

        expect(screen.getByText('Test Task')).toBeInTheDocument();
        expect(screen.getByText('Test Description')).toBeInTheDocument();
        expect(screen.getByText('MEDIA')).toBeInTheDocument();
        expect(screen.getByText('10:00')).toBeInTheDocument();
    });

    test('calls onToggle when checkbox is clicked', () => {
        render(<TaskItem task={mockTask} {...mockHandlers} />);

        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);

        expect(mockHandlers.onToggle).toHaveBeenCalledWith(mockTask.id);
    });

    test('calls onEdit when edit button is clicked', () => {
        render(<TaskItem task={mockTask} {...mockHandlers} />);

        const editButton = screen.getByLabelText('Editar');
        fireEvent.click(editButton);

        expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockTask);
    });

    test('calls onDelete when delete button is clicked', () => {
        render(<TaskItem task={mockTask} {...mockHandlers} />);

        const deleteButton = screen.getByLabelText('Eliminar');
        fireEvent.click(deleteButton);

        expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockTask.id);
    });

    test('renders completed task correctly', () => {
        const completedTask = { ...mockTask, completada: true };
        render(<TaskItem task={completedTask} {...mockHandlers} />);

        const title = screen.getByText('Test Task');
        expect(title).toHaveStyle('text-decoration: line-through');
    });
});
