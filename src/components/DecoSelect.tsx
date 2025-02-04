import React from 'react';
import { Dialog, Slide } from '@mui/material';
import { IconX } from '@tabler/icons-react';

const Transition = React.forwardRef(function Transition(props: { children: React.ReactElement }, ref) {
  return <Slide direction="up" ref={ref} {...props}>{props.children}</Slide>;
});

interface DecoSelectProps {
  readonly isDecoSelectOpen: boolean;
  readonly handleIsDecoSelectClose: () => void;
}

const DecoSelect = ({ isDecoSelectOpen, handleIsDecoSelectClose }: DecoSelectProps) => {
  return (
    <Dialog
      fullWidth
      open={isDecoSelectOpen}
      onClose={handleIsDecoSelectClose}
      slots={{ transition: Transition }}
      slotProps={{
        paper: {
          style: {
            position: 'fixed',
            bottom: 0,
            margin: 0,
            padding: 16,
            width: '100%',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px'
          }
        }
      }}
      keepMounted
    >
      <div className="relative bg-white min-h-[400px] max-w-full">
        <IconX size={36} onClick={handleIsDecoSelectClose} className="cursor-pointer absolute top-0 right-0" />
        <div className="mt-8"
        >
          aa
        </div>
      </div>
    </Dialog>
  );
};

export default DecoSelect;