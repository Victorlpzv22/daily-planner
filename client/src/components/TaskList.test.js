import React from 'react';
import { render, screen } from '@testing-library/react';
import TaskList from './TaskList';

const mockTasks = [
    {
        id: 1,
        titulo: 'Task 1',
        descripcion: 'Desc 1',
        fecha_inicio: '2023-01-01',
        fecha_fin: '2023-01-01',
        completada: false,
        prioridad: 'media',
        tipo: 'diaria',
        color: '#1976d2'
    },
    {
        id: 2,
        titulo: 'Task 2',
        descripcion: 'Desc 2',
        fecha_inicio: '2023-01-02',
        fecha_fin: '2023-01-02',
        completada: true,
        prioridad: 'alta',
        tipo: 'diaria',
        color: '#d32f2f'
    }
];

const mockHandlers = {
    onToggle: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn()
};

describe('TaskList Component', () => {
    test('renders empty state when no tasks', () => {
        render(<TaskList tasks={[]} {...mockHandlers} />);

        expect(screen.getByText('No hay tareas')).toBeInTheDocument();
        expect(screen.getByText('Crea tu primera tarea para comenzar')).toBeInTheDocument();
    });

    test('renders list of tasks', () => {
        render(<TaskList tasks={mockTasks} {...mockHandlers} />);

        expect(screen.getByText('Task 1')).toBeInTheDocument();
        expect(screen.getByText('Task 2')).toBeInTheDocument();
        expect(screen.getAllByRole('checkbox')).toHaveLength(2);
    });
});
