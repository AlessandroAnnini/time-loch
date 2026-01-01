import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InstallDialog } from '@/components/InstallDialog';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { toast } from 'sonner';

export function InstallButton() {
  const { canShowInstall, install, dismiss } = usePWAInstall({
    onInstalled: () => {
      toast.success('Installation complete!', {
        description:
          'Time Loch is now installed. Launch it from your home screen.',
      });
    },
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!canShowInstall) {
    return null;
  }

  const handleButtonClick = () => {
    setIsDialogOpen(true);
  };

  const handleInstall = async () => {
    setIsDialogOpen(false);
    const result = await install();

    if (result === 'accepted') {
      toast.success('Installation started', {
        description: 'Time Loch is being installed on your device.',
      });
    } else if (result === 'dismissed') {
      dismiss();
    } else {
      toast.error('Installation failed', {
        description: 'Please try again or install manually.',
      });
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    dismiss();
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleButtonClick}
        aria-label="Install Time Loch">
        <Download className="h-5 w-5" />
      </Button>

      <InstallDialog
        isOpen={isDialogOpen}
        onInstall={handleInstall}
        onCancel={handleCancel}
      />
    </>
  );
}
