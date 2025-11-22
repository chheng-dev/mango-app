import customerApiService from "@/lib/api/customerApiService";
import { CustomerFormData, customerFormSchema } from "@/lib/validations/customer-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface useCustomerFormProps {
  customerCode?: string;
  mode: 'create' | 'edit';
  onSuccess?: (data: CustomerFormData) => void;
  onError?: (error: Error) => void;
}

export function useCustomerForm({ 
  customerCode,
  mode,
}: useCustomerFormProps) {
  const queryClient = useQueryClient();

  const {
    data: customerData,
    isLoading: isLoadingCustomer,
    error: customerError,
  } = useQuery({
    queryKey: ['customers', customerCode],
    queryFn: async () => {
      if (!customerCode) throw new Error('Customer code is required');
      const response = await customerApiService.getAll();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch customer');
      }
      return response.data!;
    },
    enabled: mode === 'edit' && !!customerCode,
  });

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema) as any,
    defaultValues: {
      cCode: '',
      cName: '',
      cEmail: '',
      cTel: '',
      cAddress: '',
      cStatus: true,
      cCreatedBy: '',
      cLastUpdatedBy: '',
      cDescription: '',
    },
    mode: 'all',
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = form;

  useEffect(() => {
    if (customerData) {
      reset({
        cCode: customerData.cCode || '',
        cName: customerData.cName || '',
        cEmail: customerData.cEmail || '',
        cTel: customerData.cTel || '',
        cAddress: customerData.cAddress || '',
        cStatus: customerData.cStatus ?? true,
        cCreatedBy: customerData.cCreatedBy || '',
        cLastUpdatedBy: customerData.cLastUpdatedBy || '',
      });
    }
  }, [customerData, reset]);

  const onFormSubmit = handleSubmit((data) => {
    console.log('Form submitted:', data);
  });

  return {
    register,
    handleSubmit: onFormSubmit,
    watch,
    setValue,
    reset,
    errors,
    isSubmitting,
    isValid,
    isDirty,
    isLoadingCustomer,
    customerError,

    form,


  };
} 