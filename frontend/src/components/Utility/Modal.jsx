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

const primaryActionBtnSx = {
  textTransform: "none",
  fontFamily: "Manrope",
  fontWeight: 700,
  fontSize: 14,
  borderRadius: 999,
  px: 2.4,
  py: 1,
  background: "linear-gradient(90deg, #0ea5e9 0%, #2563eb 100%)",
  boxShadow: "0 8px 18px rgba(37, 99, 235, 0.28)",
  "&:hover": {
    background: "linear-gradient(90deg, #0284c7 0%, #1d4ed8 100%)",
  },
};

const secondaryActionBtnSx = {
  textTransform: "none",
  fontFamily: "Manrope",
  fontWeight: 700,
  fontSize: 14,
  borderRadius: 999,
  px: 2.3,
  py: 0.9,
  borderColor: "#60a5fa",
  color: "#1d4ed8",
  "&:hover": {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },
};

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
              top: 8,
              '&:focus-visible': {
                outline: '3px solid #60a5fa',
                outlineOffset: 2,
              },
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
        <DialogActions sx={{ flexDirection: { xs: "column-reverse", sm: "row" }, gap: 1, p: 2 }}>
          <Button onClick={onClose} variant="outlined" sx={{ ...secondaryActionBtnSx, width: { xs: "100%", sm: "auto" }, "&:focus-visible": { outline: "3px solid #60a5fa", outlineOffset: 2 } }}>
            {cancelText}
          </Button>
          <Button onClick={onSubmit} variant="contained" sx={{ ...primaryActionBtnSx, width: { xs: "100%", sm: "auto" }, "&:focus-visible": { outline: "3px solid #60a5fa", outlineOffset: 2 } }}>
            {submitText}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default Modal;
