import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface CustomizableDialogProps {
  trigger?: string | ReactNode;
  title?: string;
  description?: string;
  cancelText?: string;
  actionText?: string;
  onConfirm?: () => void;
  onClose?: () => void;
  children?: ReactNode;
  className?: string;
  isOpen?: boolean;
  hasAction?: boolean;
  hasCancel?: boolean;
}

const CustomizableDialog = ({
  trigger,
  title,
  description,
  cancelText = "Cancel",
  actionText = "Continue",
  onConfirm,
  onClose,
  children,
  className = "",
  isOpen,
  hasAction = true,
  hasCancel = true,
}: CustomizableDialogProps) => {
  return (
    <Dialog onOpenChange={(isOpen) => !isOpen && onClose?.()} open={isOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={`bg-dm-dark-2 border-dm-dark-3 ${className}`}>
        <DialogHeader>
          <DialogTitle className="text-dm-light">{title}</DialogTitle>
          <DialogDescription className="text-dm-light-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        {children}
        <DialogFooter>
          {hasCancel && (
            <DialogClose asChild>
              <Button className="text-dm-light bg-dm-dark hover:bg-dm-red">
                {cancelText}
              </Button>
            </DialogClose>
          )}

          {hasAction && (
            <Button
              className="text-dm-light bg-dm-dark-3  hover:bg-dm-dark-4"
              onClick={onConfirm}
            >
              {actionText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomizableDialog;
