/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import { Box, Button, Dialog, Modal, Slide } from "@mui/material";
import { IconBan, IconCopyPlus, IconX } from "@tabler/icons-react";
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
  const [isDoubleCheckModalOpen, setIsDoubleCheckModalOpen] = useState(false);

  const onCompleteHandler = (data: string) => {
    setFilterImageArray((prev: string[]) => [...prev, data]);
    // ここで参照されるarrayは更新されていないので、直接lengthを参照する
    setFilterImageIndex(filterImageArray ? filterImageArray.length : 0);
    setIsUploadModalOpen(false);
    handleIsDecoSelectClose();
  }

  const handleDelete = (index: number) => {
    // フィルターなしは-1
    if (filterImageIndex === index) {
      setFilterImageIndex(-1);
    }
    setFilterImageArray((prev: string[]) => prev.filter((_, i) => i !== index));
  }

  const handleModalClose = () => {
    setIsDoubleCheckModalOpen(true);
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
                background: "linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.5) 60%, rgba(255, 255, 255, 0.75) 100%)",
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
              <div
                className="relative flex justify-center items-center"
              >
                <button
                  type="button"
                  className={`w-20 h-20 rounded-xl border-2 bg-white border-black flex justify-center items-center ${filterImageIndex === -1 ? "border-blue-500 shadow-xl" : ""}`}
                  onClick={() => setFilterImageIndex(-1)}
                >
                  <IconBan size={32} className="text-black" />
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
        onClose={handleModalClose}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 1,
            borderRadius: "16px",
          }}
        >
          <ImageEditor onClose={handleModalClose} onCompleteHandler={onCompleteHandler} />
        </Box>
      </Modal>
      <Modal
        open={isDoubleCheckModalOpen}
        onClose={() => setIsDoubleCheckModalOpen(false)}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 1,
            borderRadius: "16px",
          }}
        >
          <div className="p-4 w-[200px] flex flex-col items-center">
            <p>本当に閉じますか？</p>
            <div className="flex flex-row justify-between w-full mt-4 ">
              <Button onClick={() => setIsDoubleCheckModalOpen(false)} color="info"
                autoFocus
                sx={{
                  fontSize: "1.1rem",
                }}
              >いいえ</Button>
              <Button onClick={() => {
                setIsDoubleCheckModalOpen(false);
                setIsUploadModalOpen(false);
              }}
                color="error"
                sx={{
                  fontSize: "1.1rem",
                }}
              >はい</Button>
            </div>
          </div>
        </Box>
      </Modal>
    </>
  );
};

export default DecoSelect;