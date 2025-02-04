import React from 'react';
import { Dialog, Slide } from '@mui/material';

const Transition = React.forwardRef(function Transition(props: { children: React.ReactElement }, ref) {
  return <Slide direction="up" ref={ref} {...props}>{props.children}</Slide>;
});

interface DecoSelectProps {
  readonly isDecoSelectOpen: boolean;
  readonly handleIsDecoSelectClose: () => void;
}

const DecoSelect = ({ isDecoSelectOpen, handleIsDecoSelectClose }: DecoSelectProps) => {
  return (
    <div>
      <Dialog
        fullWidth
        open={isDecoSelectOpen}
        onClose={handleIsDecoSelectClose}
        TransitionComponent={Transition}
        keepMounted
        PaperProps={{
          style: { borderTopLeftRadius: 16, borderTopRightRadius: 16 },
        }}
      >
        <div style={{ minHeight: '200px', padding: '16px' }}>
          {/* ここにグリッドでフィルターのプレビューを配置 */}
          モック：デコレーションのプレビュー
        </div>
      </Dialog>
    </div>
  );
};

export default DecoSelect;