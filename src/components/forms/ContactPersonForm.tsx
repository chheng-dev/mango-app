import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "../ui/card";
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { useContactPersonForm } from "@/hooks/useContactPersonForm";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { forwardRef, useImperativeHandle } from "react";

export interface ContactPersonFormRef {
  submit: () => void;
  triggerValidation: () => Promise<boolean>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
}

interface ContactPersonFormProps {
  mode: 'create' | 'edit';
  onSuccess: () => void;
  onCancel: () => void;
  cpCode?: string;
  loading?: boolean;
}

export const ContactPersonForm = forwardRef<ContactPersonFormRef, ContactPersonFormProps>(({
  mode,
  cpCode,
}, ref) => {

  const { 
    form,
    handleSubmit,
    isValid,
    isDirty,
    isSubmitting,
    formData,
  } = useContactPersonForm({
    cpCode,
    mode,
  });
  
  useImperativeHandle(ref, () => ({
    submit: () => {
      handleSubmit();
    },
    triggerValidation: async () => {
      return await form.trigger();
    },
    isValid,
    isDirty,
    isSubmitting,
  }), [handleSubmit, form, isValid, isDirty, isSubmitting]);

  return (
    <div className="w-full mx-auto space-y-6">
      <ScrollArea>
        <Card className="mb-12">
          <CardContent>
            <Form {...form}>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cpCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Contact Person Code <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="e.g., CP001" 
                            onChange={(e) => field.onChange(e.target.value)}
                            disabled
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cpName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Contact Person Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="e.g., John Doe" 
                            onChange={(e) => field.onChange(e.target.value)}  
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Customer Code <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., CUST001" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cTel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Phone Number <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field} 
                            placeholder="e.g., +1234567890" 
                            onChange={(e) => field.onChange(e.target.value)}   
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="cEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email Address <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email" 
                          placeholder="e.g., john@example.com" 
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cStatus"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Active Status
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Enable or disable this contact person
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
        </Card>
      </ScrollArea>
    </div>
  )
});