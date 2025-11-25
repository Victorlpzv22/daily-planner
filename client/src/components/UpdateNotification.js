import React, { useEffect, useState } from 'react';
import { Snackbar, Button, Alert, LinearProgress, Box, Typography } from '@mui/material';

const UpdateNotification = () => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('info');
    const [downloading, setDownloading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [updateDownloaded, setUpdateDownloaded] = useState(false);

    useEffect(() => {
        if (!window.electron) return;

        window.electron.on('update-available', (event, info) => {
            setMessage(`Nueva versión disponible: ${info.version}`);
            setSeverity('info');
            setUpdateAvailable(true);
            setOpen(true);
        });

        window.electron.on('update-error', (event, err) => {
            setMessage(`Error al actualizar: ${err}`);
            setSeverity('error');
            setOpen(true);
            setDownloading(false);
        });

        window.electron.on('update-progress', (event, progressObj) => {
            setDownloading(true);
            setProgress(progressObj.percent);
        });

        window.electron.on('update-downloaded', () => {
            setMessage('Actualización descargada. Reiniciar para instalar.');
            setSeverity('success');
            setDownloading(false);
            setUpdateAvailable(false);
            setUpdateDownloaded(true);
            setOpen(true);
        });

        return () => {
            // Cleanup listeners if necessary (requires removing listeners support in preload)
        };
    }, []);

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    const handleDownload = () => {
        window.electron.send('download-update');
        setOpen(false); // Close the "Available" snackbar, progress will be shown or handled
        setDownloading(true); // Show progress indicator (could be a different UI element)
    };

    const handleInstall = () => {
        window.electron.send('install-update');
    };

    return (
        <>
            <Snackbar open={open} autoHideDuration={null} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
                    {message}
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        {updateAvailable && (
                            <Button color="inherit" size="small" onClick={handleDownload}>
                                Descargar
                            </Button>
                        )}
                        {updateDownloaded && (
                            <Button color="inherit" size="small" onClick={handleInstall}>
                                Reiniciar e Instalar
                            </Button>
                        )}
                    </Box>
                </Alert>
            </Snackbar>

            {/* Optional: Global Progress Bar for downloading */}
            {downloading && (
                <Snackbar open={true} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                    <Box sx={{ width: 300, bgcolor: 'background.paper', p: 2, borderRadius: 1, boxShadow: 3 }}>
                        <Typography variant="caption" display="block" gutterBottom>
                            Descargando actualización... {Math.round(progress)}%
                        </Typography>
                        <LinearProgress variant="determinate" value={progress} />
                    </Box>
                </Snackbar>
            )}
        </>
    );
};

export default UpdateNotification;
