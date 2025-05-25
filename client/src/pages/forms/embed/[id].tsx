import { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Form } from '@shared/schema';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { apiRequest } from '@/lib/queryClient';

// UI Components
import {
  Form as FormComponent,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Activity } from 'lucide-react';

const FormEmbed = () => {
  const { id } = useParams();
  const formId = parseInt(id);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Fetch the form data
  const { data: formData, isLoading, error } = useQuery<Form>({
    queryKey: [`/api/forms/${formId}`],
    enabled: !isNaN(formId),
  });

  // Dynamically create form schema based on form fields
  const createDynamicSchema = (fields: any[]) => {
    const schemaFields: Record<string, any> = {};
    
    fields.forEach((field) => {
      let fieldSchema = z.string();
      
      if (field.type === 'email') {
        fieldSchema = z.string().email({ message: 'Invalid email address' });
      } else if (field.type === 'number') {
        fieldSchema = z.string().transform((val) => {
          const parsed = parseFloat(val);
          if (isNaN(parsed)) {
            return undefined;
          }
          return parsed;
        }).pipe(z.number({ invalid_type_error: 'Must be a number' }));
      } else if (field.type === 'tel') {
        fieldSchema = z.string().min(5, { message: 'Phone number is too short' });
      } else if (field.type === 'checkbox') {
        fieldSchema = z.boolean().optional();
      }
      
      if (field.required) {
        if (field.type === 'checkbox') {
          schemaFields[field.id] = z.boolean().refine(val => val === true, {
            message: 'This field is required',
          });
        } else {
          schemaFields[field.id] = fieldSchema.min(1, { message: 'This field is required' });
        }
      } else {
        if (field.type === 'checkbox') {
          schemaFields[field.id] = z.boolean().optional();
        } else {
          schemaFields[field.id] = fieldSchema.optional();
        }
      }
    });
    
    return z.object(schemaFields);
  };

  // Initialize form with empty defaults (will be updated when form data loads)
  const form = useForm<any>({
    resolver: zodResolver(
      formData && formData.fields 
        ? createDynamicSchema(formData.fields as any[]) 
        : z.object({})
    ),
    defaultValues: {},
  });

  // Update form when data loads
  useEffect(() => {
    if (formData && formData.fields) {
      const defaultValues: Record<string, any> = {};
      
      (formData.fields as any[]).forEach((field) => {
        if (field.type === 'checkbox') {
          defaultValues[field.id] = false;
        } else {
          defaultValues[field.id] = '';
        }
      });
      
      form.reset(defaultValues);
    }
  }, [formData, form]);

  const onSubmit = async (data: any) => {
    try {
      setSubmissionError(null);
      
      // Add metadata about the form
      const submissionData = {
        formId,
        data,
        sourceInfo: {
          referrer: document.referrer,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }
      };
      
      await apiRequest('/api/form-submissions', 'POST', submissionData);
      setIsSubmitted(true);
      
      // Clear form after successful submission
      form.reset();
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmissionError('There was an error submitting the form. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-950">
        <Activity className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !formData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-white dark:bg-gray-950">
        <h3 className="text-xl font-semibold text-center mb-2">Form Not Found</h3>
        <p className="text-center text-gray-600 dark:text-gray-400">
          The form you are looking for does not exist or has been removed.
        </p>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-white dark:bg-gray-950">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-lg shadow-md p-8">
          <h3 className="text-xl font-semibold text-center mb-4">Thank You!</h3>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            Your form has been submitted successfully.
          </p>
          <div className="flex justify-center">
            <Button 
              onClick={() => setIsSubmitted(false)}
              variant="outline"
            >
              Submit Another Response
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center min-h-screen p-6 bg-white dark:bg-gray-950">
      <div className="max-w-xl w-full bg-white dark:bg-gray-900 rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-xl font-semibold">{formData.name}</h3>
          {formData.description && (
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {formData.description}
            </p>
          )}
        </div>
        
        <FormComponent {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
            {submissionError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-md">
                {submissionError}
              </div>
            )}
            
            {(formData.fields as any[]).map((field) => (
              <FormField
                key={field.id}
                control={form.control}
                name={field.id}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel>
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </FormLabel>
                    <FormControl>
                      {field.type === 'textarea' ? (
                        <Textarea
                          placeholder={field.placeholder || ''}
                          {...formField}
                        />
                      ) : field.type === 'select' ? (
                        <Select
                          onValueChange={formField.onChange}
                          value={formField.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={field.placeholder || 'Select an option'} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((option: string, idx: number) => (
                              <SelectItem key={idx} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : field.type === 'checkbox' ? (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={formField.value}
                            onCheckedChange={formField.onChange}
                            id={field.id}
                          />
                          <label
                            htmlFor={field.id}
                            className="text-sm text-gray-600 dark:text-gray-400"
                          >
                            {field.placeholder || 'I agree'}
                          </label>
                        </div>
                      ) : (
                        <Input
                          type={field.type}
                          placeholder={field.placeholder || ''}
                          {...formField}
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            
            <div className="pt-4">
              <Button type="submit" className="w-full">
                Submit
              </Button>
            </div>
          </form>
        </FormComponent>
      </div>
    </div>
  );
};

export default FormEmbed;