import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '100vh',
                        bgcolor: 'background.default',
                        p: 3
                    }}
                >
                    <Paper
                        elevation={3}
                        sx={{
                            p: 4,
                            maxWidth: 600,
                            textAlign: 'center',
                            borderRadius: 2
                        }}
                    >
                        <Typography variant="h4" color="error" gutterBottom>
                            ¡Ups! Algo salió mal
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            Ha ocurrido un error inesperado en la aplicación.
                        </Typography>

                        {this.state.error && (
                            <Box
                                sx={{
                                    mt: 2,
                                    mb: 3,
                                    p: 2,
                                    bgcolor: 'grey.100',
                                    borderRadius: 1,
                                    textAlign: 'left',
                                    overflow: 'auto',
                                    maxHeight: 200,
                                    fontFamily: 'monospace',
                                    fontSize: '0.875rem'
                                }}
                            >
                                {this.state.error.toString()}
                            </Box>
                        )}

                        <Button
                            variant="contained"
                            startIcon={<RefreshIcon />}
                            onClick={this.handleReset}
                        >
                            Recargar Aplicación
                        </Button>
                    </Paper>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
