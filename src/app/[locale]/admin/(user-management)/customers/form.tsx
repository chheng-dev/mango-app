import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useCustomerForm } from "@/hooks/useCustomerForm";
import { RadioGroup } from "@radix-ui/react-dropdown-menu";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { forwardRef, use, useImperativeHandle } from "react";

export interface CustomerFormRef {
  submit: () => void;
  triggerValidation: () => Promise<boolean>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
} 

interface CustomerFormProps {
  mode: 'create' | 'edit';
  onSuccess: () => void;
  onCancel: () => void;
  customerCode?: string;
  loading?: boolean;
}

export const CustomerForm = forwardRef<CustomerFormRef, CustomerFormProps>(({
  mode,
  customerCode,
}, ref) => {
  const {
    form,
    handleSubmit,
    isDirty,
    isValid,
    isSubmitting,
  } = useCustomerForm({
    customerCode,
    mode,
  });

  useImperativeHandle(ref, () => ({
    submit: () => {
      handleSubmit();
    },
    triggerValidation: () => form.trigger(),
    isValid: form.formState.isValid,
    isDirty: form.formState.isDirty,
    isSubmitting: form.formState.isSubmitting,
  }), [form, handleSubmit]);

  return (
    <div className="w-full mx-auto space-y-6">
      <ScrollArea>
        <Card>
          <CardContent>
            <Form {...form}>
              <form onSubmit={() => {}} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="cCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Customer Code<span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field} 
                            placeholder="e.g., C001" 
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Customer Name<span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field} 
                            placeholder="e.g., Jonh Doe" 
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Email<span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field} 
                            placeholder="example@gmail.com" 
                            onChange={(e) => field.onChange(e.target.value)}
                          />
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
                          Telephone<span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field} 
                            placeholder="0xx-xxx-xxxx" 
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Address<span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field} 
                            placeholder="e.g., 123 Main St" 
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
                      <FormItem>
                        <FormLabel>
                          Status<span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Switch id="status" checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </ScrollArea>
    </div>
  )
});