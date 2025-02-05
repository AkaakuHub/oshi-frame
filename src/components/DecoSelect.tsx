/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import { Box, Dialog, Modal, Slide } from "@mui/material";
import { IconCopyPlus, IconX } from "@tabler/icons-react";
import dynamic from "next/dynamic";

const ImageEditor = dynamic(() => import("./ImageEditor"), { ssr: false });

const Transition = React.forwardRef(function Transition(props: { children: React.ReactElement }, ref) {
  return <Slide direction="up" ref={ref} {...props}>{props.children}</Slide>;
});

interface DecoSelectProps {
  readonly isDecoSelectOpen: boolean;
  readonly handleIsDecoSelectClose: () => void;
  readonly filterImageArray: string[] | null;
  readonly setFilterImageArray: React.Dispatch<React.SetStateAction<string[]>>;
  readonly filterImageIndex: number;
  readonly setFilterImageIndex: (index: number) => void;
}

const DecoSelect = ({ isDecoSelectOpen, handleIsDecoSelectClose, filterImageArray, setFilterImageArray, filterImageIndex, setFilterImageIndex }: DecoSelectProps) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const onCompleteHandler = (data: string) => {
    setFilterImageArray((prev: string[]) => [...prev, data]);
    setIsUploadModalOpen(false);
  }

  const handleDelete = (index: number) => {
    setFilterImageArray((prev: string[]) => prev.filter((_, i) => i !== index));
  }

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
                background: "linear-gradient(180deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.8) 20%, rgba(255, 255, 255, 1) 100%)",
              }
            }
          }}
          keepMounted
        >
          <div className="relative min-h-[400px] max-w-full">
            <IconX size={36} onClick={handleIsDecoSelectClose} className="cursor-pointer absolute top-0 right-0" />
            <div className="mt-14 px-4 grid grid-cols-[repeat(auto-fill,minmax(5rem,1fr))] gap-4">
              <div
                className="relative flex justify-center items-center"
              >
                <button
                  type="button"
                  className="w-20 h-20 rounded-xl border-2 bg-white border-black border-dashed flex justify-center items-center"
                  onClick={() => setIsUploadModalOpen(true)}
                >
                  <IconCopyPlus size={32} className="text-black" />
                </button>
              </div>

              {filterImageArray && filterImageArray.length > 0 && (
                filterImageArray.map((filterImage: string, index: number) => (
                  <div
                    key={filterImage}
                    className="relative flex justify-center items-center"
                  >
                    <button
                      type="button"
                      className={`w-20 h-20 rounded-xl border-2 bg-white border-black ${filterImageIndex === index ? "border-blue-500 shadow-xl" : ""}`}
                      onClick={() => setFilterImageIndex(index)}
                    >
                      <img
                        src={filterImage}
                        alt={`deco-${index}`}
                        className="w-full h-full object-cover object-center rounded-[0.65rem]"
                      />
                    </button>
                    <button
                      type="button"
                      className="absolute top-[-8px] right-0 w-8 h-8 bg-white rounded-full flex justify-center items-center border-2 border-black"
                      onClick={() => handleDelete(index)}
                    >
                      <IconX size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </Dialog>
      </div>
      <Modal
        open={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: "16px",
          }}
        >
          <ImageEditor onCompleteHandler={onCompleteHandler}/>
        </Box>
      </Modal>
    </>
  );
};

export default DecoSelect;