import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const Modal = ({
  open,
  onClose,
  title,
  children,
  onSubmit,
  submitText = 'Submit',
  cancelText = 'Cancel',
  showActions = true,
  maxWidth = 'sm',
  fullWidth = true
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth={fullWidth}
      maxWidth={maxWidth}
    >
      <DialogTitle sx={{ m: 0, p: 2 }}>
        {title}
        {onClose ? (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8
            }}
          >
            <CloseIcon />
          </IconButton>
        ) : null}
      </DialogTitle>

      <DialogContent dividers>
        {children}
      </DialogContent>

      {showActions && (
        <DialogActions>
          <Button onClick={onClose}>{cancelText}</Button>
          <Button onClick={onSubmit} variant="contained" color="primary">
            {submitText}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default Modal;
