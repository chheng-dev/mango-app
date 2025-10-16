import contactPersonApiService from "@/lib/api/contactPersonApiService";
import { ContactPersonFormData, contactPersonSchema } from "@/lib/validations/contact-person-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface UseContactPersonFormProps {
  cpCode?: string;
  mode: 'create' | 'edit';
  onSuccess?: (data: ContactPersonFormData) => void;
  onError?: (error: Error) => void;
}

export function useContactPersonForm({
  cpCode,
  mode,
  onSuccess,
  onError,
}: UseContactPersonFormProps) {
  const queryClient = useQueryClient();

  const createFormSchema = () => {
    return contactPersonSchema;
  }

  const {
    data: contactPersonData,
    isLoading: isLoadingContactPerson,
    error: contactPersonError,
  } = useQuery({
    queryKey: ['contact-persons', cpCode],
    queryFn: async () => {
      if (!cpCode) throw new Error('Contact Person Code is required');
      const response = await contactPersonApiService.getByCode(cpCode);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch contact person');
      }
      return response.data!;
    },
    enabled: mode === 'edit' && !!cpCode,
  });

  const form = useForm<ContactPersonFormData>({
    resolver: zodResolver(contactPersonSchema) as any,
    defaultValues: {
      cpCode: '',
      cpName: '',
      cCode: '',
      cTel: '',
      cEmail: '',
      cStatus: true,
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
    if (contactPersonData && mode === 'edit') {
      reset({
        cpCode: contactPersonData.cpCode,
        cpName: contactPersonData.cpName,
        cCode: contactPersonData.cCode,
        cTel: contactPersonData.cTel,
        cEmail: contactPersonData.cEmail,
        cStatus: contactPersonData.cStatus,
      });
    }
  }, [contactPersonData, reset]);

  // Watch form values
  const watchedCpCode = watch('cpCode');
  const watchedCpName = watch('cpName');
  const watchedCCode = watch('cCode');
  const watchedCTel = watch('cTel');
  const watchedCEmail = watch('cEmail');
  const watchedCStatus = watch('cStatus');

  const createContactPersonMutation = useMutation({
    mutationFn: async (data: ContactPersonFormData) => {
      const response = await contactPersonApiService.createContactPerson({
        cpCode: data.cpCode,
        cpName: data.cpName,
        cCode: data.cCode,
        cTel: data.cTel,
        cEmail: data.cEmail,
        cStatus: data.cStatus,
      });
      return response;
    },
    onSuccess: (contactPerson) => {
      queryClient.invalidateQueries({ queryKey: ['contact-persons'] });
      onSuccess?.(contactPerson);
    },
    onError: (error) => {
      console.error('Error creating contact person:', error);
    }
  });

  const updateContactPersonMutation = useMutation({
    mutationFn: async (data: ContactPersonFormData) => {
      const response = await contactPersonApiService.updateContactPerson(cpCode as string, {
        cpCode: data.cpCode,
        cpName: data.cpName,
        cCode: data.cCode,
        cTel: data.cTel,
        cEmail: data.cEmail,
        cStatus: data.cStatus,
      });
      return response;
    },
  });

  const onFormSubmit = handleSubmit(async (data) => {  
    try {
      if (mode === 'create') {
        await createContactPersonMutation.mutateAsync(data);
      } else {
        await updateContactPersonMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
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

    form,

    isLoadingContactPerson,
    contactPersonError,

    formData: {
      cpCode: watchedCpCode || '',
      cpName: watchedCpName || '',
      cCode: watchedCCode || '',
      cTel: watchedCTel || '',
      cEmail: watchedCEmail || '',
      cStatus: watchedCStatus || '',
    }
  };
}