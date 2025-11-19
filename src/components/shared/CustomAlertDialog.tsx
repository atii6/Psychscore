import { cn } from "@/lib/utils";
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
} from "../ui/alert-dialog";

type Props = {
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
  dialogCancelText?: string;
  onAction?: () => void;
  actionButtonText?: string;
  actionButtonStyles?: string;
};

function CustomAlertDialog({
  trigger,
  title,
  description,
  dialogCancelText = "Cancel",
  onAction,
  actionButtonText,
  actionButtonStyles,
}: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent style={{ backgroundColor: "var(--card-background)" }}>
        {(title || description) && (
          <AlertDialogHeader>
            {title && <AlertDialogTitle>{title}</AlertDialogTitle>}
            {description && (
              <AlertDialogDescription>{description}</AlertDialogDescription>
            )}
          </AlertDialogHeader>
        )}
        {(dialogCancelText || onAction) && (
          <AlertDialogFooter>
            {dialogCancelText && (
              <AlertDialogCancel>{dialogCancelText}</AlertDialogCancel>
            )}
            {onAction && (
              <AlertDialogAction
                onClick={onAction}
                className={cn("", actionButtonStyles)}
              >
                {actionButtonText}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default CustomAlertDialog;
