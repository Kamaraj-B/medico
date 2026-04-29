import React from 'react';
import { Stepper, Step, StepLabel, StepConnector, stepConnectorClasses } from '@mui/material';
import { styled } from '@mui/material/styles';
import Check from '@mui/icons-material/Check';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import StepIcon from '@mui/material/StepIcon';

const ColorlibConnector = styled(StepConnector)(() => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: '#eaeaf0',
    borderRadius: 1,
  },
}));

const StepIconRoot = styled('div')(({  ownerState }) => ({
  backgroundColor: ownerState.active || ownerState.completed ? '#1976d2' : '#bdbdbd',
  zIndex: 1,
  color: '#fff',
  width: 36,
  height: 36,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
}));

const CustomStepIcon =(props)=> {
  const { active, completed, className, icon } = props;

  return (
    <motion.div
      initial={{ scale: 0.8 }}
      animate={{ scale: active ? 1.1 : 1 }}
      transition={{ duration: 0.3 }}
    >
      <StepIconRoot ownerState={{ completed, active }} className={className}>
        {completed ? <Check /> : icon}
      </StepIconRoot>
    </motion.div>
  );
}

export default function StatusTracker({ steps, activeStep = 0 }) {
  return (
    <Stepper alternativeLabel activeStep={activeStep} connector={<ColorlibConnector />}>
      {steps.map((label, index) => (
        <Step key={label}>
          <StepLabel StepIconComponent={CustomStepIcon}>
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{ fontWeight: activeStep === index ? 'bold' : 'normal' }}
            >
              {label}
            </motion.div>
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}

