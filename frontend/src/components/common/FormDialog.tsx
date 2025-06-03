import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: () => void;
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  hideSubmitButton?: boolean;
}

const FormDialog: React.FC<FormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  title,
  children,
  isLoading = false,
  submitLabel = 'Сохранить',
  cancelLabel = 'Отмена',
  maxWidth = 'sm',
  hideSubmitButton = false,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
      <DialogTitle>
        {title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ minHeight: '200px' }}>{children}</Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          {cancelLabel}
        </Button>
        {!hideSubmitButton && onSubmit && (
          <Button
            onClick={onSubmit}
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {submitLabel}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default FormDialog; 