import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Zap, Wifi, Home, Lock, HardDrive } from 'lucide-react';

interface InstallDialogProps {
  isOpen: boolean;
  onInstall: () => void;
  onCancel: () => void;
}

export function InstallDialog({
  isOpen,
  onInstall,
  onCancel,
}: InstallDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <img
              src="/icon-192.png"
              alt="Time Loch Icon"
              className="h-12 w-12 rounded-lg"
            />
            <div>
              <DialogTitle>Install Time Loch</DialogTitle>
              <DialogDescription>
                Add to your home screen for a better experience
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-sm">Lightning-fast loading</h4>
              <p className="text-sm text-muted-foreground">
                Instant access with optimized performance
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Wifi className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-sm">Works offline</h4>
              <p className="text-sm text-muted-foreground">
                Practice anywhere, no internet required
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Home className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-sm">Quick home screen access</h4>
              <p className="text-sm text-muted-foreground">
                Launch directly from your device
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-sm">Secure and private</h4>
              <p className="text-sm text-muted-foreground">
                Your data stays on your device
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <HardDrive className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-sm">Minimal storage</h4>
              <p className="text-sm text-muted-foreground">
                Only ~13MB of space required
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Not now
          </Button>
          <Button type="button" onClick={onInstall}>
            <Download className="h-4 w-4 mr-2" />
            Install
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
