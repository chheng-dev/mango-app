"use client";

import { Button } from "@/components/ui/button";

interface FormActionsSectionProps {
  mode: "create" | "edit";
  onDelete?: () => Promise<void>;
  isLoading?: boolean;
  loading?: boolean;
  deleteLoading?: boolean;
  isSubmitting?: boolean;
}

export function FormActionsSection({
  mode,
  onDelete,
  isLoading = false,
  loading = false,
  deleteLoading = false,
  isSubmitting = false,
}: FormActionsSectionProps) {
  return (
    <div className="flex items-center justify-between pt-6 border-t border-border">
      <div className="flex items-center space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        
        {/* Delete button for edit mode */}
        {mode === "edit" && onDelete && (
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
            disabled={isLoading || loading || deleteLoading || isSubmitting}
            className="min-w-[120px]"
          >
            {deleteLoading ? (
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Deleting...</span>
              </div>
            ) : (
              <span>Delete User</span>
            )}
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-3">
        <Button
          type="submit"
          disabled={isLoading || loading || deleteLoading || isSubmitting}
          className="min-w-[120px]"
        >
          {(isLoading || loading || isSubmitting) ? (
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span>{mode === "create" ? "Creating..." : "Updating..."}</span>
            </div>
          ) : (
            <span>{mode === "create" ? "Create User" : "Update User"}</span>
          )}
        </Button>
      </div>
    </div>
  );
}
