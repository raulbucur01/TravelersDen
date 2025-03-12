import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ReactNode } from "react";

interface CustomizableAlertDialogProps {
  trigger?: string | ReactNode;
  title?: string;
  description?: string;
  cancelText?: string;
  actionText?: string;
  onConfirm?: () => void;
}

const CustomizableAlertDialog = ({
  trigger,
  title,
  description,
  cancelText = "Cancel",
  actionText = "Continue",
  onConfirm,
}: CustomizableAlertDialogProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="bg-dm-dark-2 border-dm-dark-3">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-dm-light">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-dm-light-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="text-dm-light bg-dm-dark-1 hover:bg-dm-secondary">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            className="text-dm-light bg-dm-red hover:bg-dm-red-2"
            onClick={onConfirm}
          >
            {actionText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CustomizableAlertDialog;
