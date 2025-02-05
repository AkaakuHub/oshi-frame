/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { Dialog, Slide } from '@mui/material';
import { IconX } from '@tabler/icons-react';

const Transition = React.forwardRef(function Transition(props: { children: React.ReactElement }, ref) {
  return <Slide direction="up" ref={ref} {...props}>{props.children}</Slide>;
});

interface DecoSelectProps {
  readonly isDecoSelectOpen: boolean;
  readonly handleIsDecoSelectClose: () => void;
  readonly filterImageArray: string[] | null;
  readonly filterImageIndex: number;
  readonly setFilterImageIndex: (index: number) => void;
}

const DecoSelect = ({ isDecoSelectOpen, handleIsDecoSelectClose, filterImageArray, filterImageIndex, setFilterImageIndex }: DecoSelectProps) => {
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
            borderRadius: '16px 16px 0 0'
          }
        }
      }}
      keepMounted
    >
      <div className="relative bg-white min-h-[400px] max-w-full">
        <IconX size={36} onClick={handleIsDecoSelectClose} className="cursor-pointer absolute top-0 right-0" />
        <div className="mt-8 px-4"
        >
          {
            filterImageArray && filterImageArray?.length > 0 ? (
              filterImageArray?.map((filterImage, index) => (
                <button
                  key={filterImage}
                  type="button"
                  className={`w-20 h-20 rounded-full border-4 border-black bg-transparent ${filterImageIndex === index ? 'border-blue-500' : ''}`}
                  onClick={() => setFilterImageIndex(index)}
                >
                  <img
                    src={filterImage}
                    alt="deco"
                    className="w-16 h-16 rounded-full"
                  />
                </button>
              ))) : (
              <div className="">
                画像がありません。
              </div>
            )
          }
        </div>
      </div>
    </Dialog>
  );
};

export default DecoSelect;