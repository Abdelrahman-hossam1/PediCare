"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type ConfirmDialogOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: React.ComponentProps<typeof Button>["variant"];
};

type ConfirmFn = (options?: ConfirmDialogOptions) => Promise<boolean>;

const ConfirmDialogContext = React.createContext<ConfirmFn | null>(null);

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<ConfirmDialogOptions>({});

  const resolveRef = React.useRef<((value: boolean) => void) | null>(null);
  const resultRef = React.useRef<boolean | null>(null);

  const confirm = React.useCallback<ConfirmFn>((opts) => {
    setOptions(opts ?? {});
    resultRef.current = null;
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  React.useEffect(() => {
    if (open) return;
    if (!resolveRef.current) return;

    const result = resultRef.current ?? false;
    const resolve = resolveRef.current;

    resolveRef.current = null;
    resultRef.current = null;
    resolve(result);
  }, [open]);

  const title = options.title ?? "Are you sure?";
  const description = options.description ?? "This action cannot be undone.";
  const confirmText = options.confirmText ?? "Continue";
  const cancelText = options.cancelText ?? "Cancel";
  const confirmVariant = options.confirmVariant ?? "default";

  return (
    <ConfirmDialogContext.Provider value={confirm}>
      {children}

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next && open && resultRef.current === null) {
            // dismissed via overlay / ESC / close button
            resultRef.current = false;
          }
          setOpen(next);
        }}
      >
        <DialogContent
          onOpenAutoFocus={(e) => {
            // Avoid auto-focusing the close button; better UX for confirmation dialogs
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resultRef.current = false;
                setOpen(false);
              }}
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              variant={confirmVariant}
              onClick={() => {
                resultRef.current = true;
                setOpen(false);
              }}
            >
              {confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialog() {
  const ctx = React.useContext(ConfirmDialogContext);
  if (!ctx) {
    throw new Error("useConfirmDialog must be used within ConfirmDialogProvider");
  }
  return ctx;
}

