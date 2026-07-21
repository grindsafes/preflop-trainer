import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import ObservationEditor from "./ObservationEditor";

interface ObservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onChange: (html: string) => void;
  nodeLabel?: string;
}

export default function ObservationDialog({ open, onOpenChange, value, onChange, nodeLabel }: ObservationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Observation{nodeLabel ? ` — ${nodeLabel}` : ""}</DialogTitle>
        </DialogHeader>
        <ObservationEditor value={value} onChange={onChange} placeholder="Add notes or observations here..." />
      </DialogContent>
    </Dialog>
  );
}
