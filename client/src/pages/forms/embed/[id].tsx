import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Function to create a dynamic Zod schema based on form fields
const createDynamicSchema = (fields: any[]) => {
  const schemaMap: Record<string, any> = {};
  
  fields.forEach(field => {
    // Skip if field is null or undefined
    if (!field || typeof field !== 'object') {
      return;
    }
    
    // For forms we need to use the id as the field name since that's how they're identified
    const fieldName = field.id;
    if (!fieldName) return;
    
    const { type, required, options } = field;
    
    let fieldSchema: any = z.string();
    
    // Apply different schemas based on field type
    switch (type) {
      case 'email':
        fieldSchema = z.string().email('Please enter a valid email address');
        break;
      case 'number':
        fieldSchema = z.string().refine(val => !isNaN(Number(val)), {
          message: 'Please enter a valid number',
        });
        break;
      case 'checkbox':
        fieldSchema = z.boolean().optional();
        return; // Checkboxes handled differently
      case 'select':
      case 'radio':
        if (options && options.length > 0) {
          const validOptions = options.map((opt: any) => opt.value);
          if (validOptions.length > 0) {
            fieldSchema = z.enum(validOptions as [string, ...string[]]);
          }
        }
        break;
      case 'textarea':
      case 'text':
      default:
        fieldSchema = z.string();
        break;
    }
    
    // Make the field optional or required
    if (!required) {
      fieldSchema = fieldSchema.optional();
    }
    
    schemaMap[fieldName] = fieldSchema;
  });
  
  return z.object(schemaMap);
};

const EmbedForm = () => {
  const { id } = useParams();
  const formId = parseInt(id);
  const [dynamicSchema, setDynamicSchema] = useState<z.ZodObject<any>>(z.object({}));
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  
  // Get form data
  const { data: formData, isLoading, error } = useQuery({
    queryKey: [`/api/forms/${formId}`],
    enabled: !isNaN(formId),
    retry: 1,
  });
  
  // Initialize form
  const form = useForm<any>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {},
  });
  
  // Create dynamic schema when form data is loaded
  useEffect(() => {
    if (formData && formData.fields && Array.isArray(formData.fields)) {
      try {
        // Create Zod schema based on form fields
        const schema = createDynamicSchema(formData.fields);
        setDynamicSchema(schema);
        
        // Reset form with default values
        const defaultValues: Record<string, any> = {};
        formData.fields.forEach((field: any) => {
          // Skip if field is null or undefined or doesn't have an id property
          if (!field || typeof field !== 'object' || !field.id) {
            return;
          }
          
          if (field.type === 'checkbox') {
            defaultValues[field.id] = false;
          } else {
            defaultValues[field.id] = '';
          }
        });
        
        form.reset(defaultValues);
      } catch (err) {
        console.error("Error setting up form:", err);
        setSubmitError("There was an error loading the form. Please try again later.");
      }
    }
  }, [formData, form]);
  
  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: (data: any) => {
      return apiRequest("POST", `/api/forms/${formId}/submit`, data);
    },
    onSuccess: () => {
      setIsSubmitted(true);
      setSubmitError("");
      form.reset();
    },
    onError: (error: any) => {
      setSubmitError(error?.message || "Failed to submit the form. Please try again.");
    }
  });
  
  // Handle form submission
  const onSubmit = (data: any) => {
    submitMutation.mutate(data);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !formData) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Form not found or could not be loaded. Please check the form ID and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (isSubmitted) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <Alert variant="default" className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle>Thank you!</AlertTitle>
          <AlertDescription>
            Your form has been submitted successfully.
          </AlertDescription>
        </Alert>
        <Button 
          className="mt-4 w-full" 
          onClick={() => setIsSubmitted(false)}
        >
          Submit Another Response
        </Button>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-2">{formData.name}</h1>
      {formData.description && (
        <p className="text-gray-600 dark:text-gray-400 mb-6">{formData.description}</p>
      )}
      
      {submitError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {formData.fields && Array.isArray(formData.fields) && formData.fields.map((field: any, index: number) => {
            // Skip if field is null or undefined or doesn't have an id property
            if (!field || typeof field !== 'object' || !field.id) {
              return null;
            }
            
            return (
              <div key={field.id || `field-${index}`} className="space-y-2">
                {field.type === 'checkbox' ? (
                  <FormField
                    control={form.control}
                    name={field.id}
                    render={({ field: formField }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={formField.value}
                            onCheckedChange={formField.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>{field.label}</FormLabel>
                          {field.helpText && (
                            <FormDescription>{field.helpText}</FormDescription>
                          )}
                        </div>
                      </FormItem>
                    )}
                  />
                ) : field.type === 'select' ? (
                  <FormField
                    control={form.control}
                    name={field.id}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel>{field.label}</FormLabel>
                        <Select 
                          onValueChange={formField.onChange} 
                          defaultValue={formField.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {field.options && Array.isArray(field.options) && field.options.map((option: any, optIndex: number) => (
                              <SelectItem key={option.value || `option-${optIndex}`} value={option.value || ''}>
                                {option.label || option.value || `Option ${optIndex + 1}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {field.helpText && (
                          <FormDescription>{field.helpText}</FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : field.type === 'radio' ? (
                  <FormField
                    control={form.control}
                    name={field.id}
                    render={({ field: formField }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>{field.label}</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={formField.onChange}
                            defaultValue={formField.value}
                            className="flex flex-col space-y-1"
                          >
                            {field.options && Array.isArray(field.options) && field.options.map((option: any, optIndex: number) => (
                              <FormItem className="flex items-center space-x-3 space-y-0" key={option.value || `option-${optIndex}`}>
                                <FormControl>
                                  <RadioGroupItem value={option.value || ''} />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {option.label || option.value || `Option ${optIndex + 1}`}
                                </FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        {field.helpText && (
                          <FormDescription>{field.helpText}</FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : field.type === 'textarea' ? (
                  <FormField
                    control={form.control}
                    name={field.id}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel>{field.label}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={field.placeholder || ''}
                            {...formField}
                          />
                        </FormControl>
                        {field.helpText && (
                          <FormDescription>{field.helpText}</FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name={field.id}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel>{field.label}</FormLabel>
                        <FormControl>
                          <Input
                            type={field.type || 'text'}
                            placeholder={field.placeholder || ''}
                            {...formField}
                          />
                        </FormControl>
                        {field.helpText && (
                          <FormDescription>{field.helpText}</FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            );
          })}
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default EmbedForm;