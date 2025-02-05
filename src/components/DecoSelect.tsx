/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import { Box, Dialog, Modal, Slide } from "@mui/material";
import { IconCopyPlus, IconX } from "@tabler/icons-react";

const Transition = React.forwardRef(function Transition(props: { children: React.ReactElement }, ref) {
  return <Slide direction="up" ref={ref} {...props}>{props.children}</Slide>;
});

interface DecoSelectProps {
  readonly isDecoSelectOpen: boolean;
  readonly handleIsDecoSelectClose: () => void;
  readonly filterImageArray: string[] | null;
  readonly setFilterImageArray: (array: string[]) => void;
  readonly filterImageIndex: number;
  readonly setFilterImageIndex: (index: number) => void;
}

const DecoSelect = ({ isDecoSelectOpen, handleIsDecoSelectClose, filterImageArray, setFilterImageArray, filterImageIndex, setFilterImageIndex }: DecoSelectProps) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // 画像が選択されたときのハンドラ
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      // arrayの末尾に追加
      setFilterImageArray((prev: string[]) => [...prev, reader.result as string])
    };
    reader.readAsDataURL(file);
    setIsUploadModalOpen(false);
  };

  return (
    <>
      <div className="relative z-20">
        <Dialog
          fullWidth
          open={isDecoSelectOpen}
          onClose={handleIsDecoSelectClose}
          slots={{ transition: Transition }}
          slotProps={{
            paper: {
              style: {
                position: "fixed",
                bottom: 0,
                margin: 0,
                padding: 16,
                width: "100%",
                borderRadius: "16px 16px 0 0",
                zIndex: 20,
              }
            }
          }}
          keepMounted
        >
          <div className="relative bg-white min-h-[400px] max-w-full">
            <IconX size={36} onClick={handleIsDecoSelectClose} className="cursor-pointer absolute top-0 right-0" />
            <div className="mt-14 px-4 grid grid-cols-4 gap-4">
              <button
                type="button"
                className="w-20 h-20 rounded-xl border-2 border-black border-dashed flex justify-center items-center"
                onClick={() => setIsUploadModalOpen(true)}
              >
                <IconCopyPlus size={32} className="text-black" />
              </button>
              {filterImageArray && filterImageArray.length > 0 && (
                filterImageArray.map((filterImage: string, index: number) => (
                  <div
                    key={filterImage}
                    className="relative flex justify-center items-center"
                  >
                    <button
                      type="button"
                      className={`w-20 h-20 rounded-xl border-2 border-black ${filterImageIndex === index ? "border-blue-500 shadow-xl" : ""}`}
                      onClick={() => setFilterImageIndex(index)}
                    >
                      <img
                        src={filterImage}
                        alt={`deco-${index}`}
                        className="w-full h-full object-cover object-center rounded-[0.65rem]"
                      />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </Dialog>
      </div>
      <Modal open={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </Box>
      </Modal>
    </>
  );
};

export default DecoSelect;