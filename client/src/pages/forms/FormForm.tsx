import React, { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { insertFormSchema } from '@shared/schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { X, Plus, Trash2 } from 'lucide-react';

// UI Components
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Define the form field types
const fieldTypes = [
  { value: 'text', label: 'Text Input' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'email', label: 'Email' },
  { value: 'number', label: 'Number' },
  { value: 'tel', label: 'Phone Number' },
  { value: 'date', label: 'Date' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'select', label: 'Dropdown' },
];

// Form schema with validation
const formSchema = insertFormSchema.extend({
  fields: z.array(
    z.object({
      id: z.string(),
      label: z.string().min(1, "Field label is required"),
      type: z.string().min(1, "Field type is required"),
      placeholder: z.string().optional(),
      required: z.boolean().default(false),
      options: z.array(z.string()).optional(),
    })
  ),
});

// Type for the form data
type FormValues = z.infer<typeof formSchema>;

// Default field template
const getDefaultField = () => ({
  id: `field_${Date.now()}`,
  label: '',
  type: 'text',
  placeholder: '',
  required: false,
});

interface FormFormProps {
  onClose: () => void;
  existingForm?: any;
}

const FormForm: React.FC<FormFormProps> = ({ onClose, existingForm }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showOptionDialog, setShowOptionDialog] = useState(false);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(-1);
  const [newOption, setNewOption] = useState('');

  // Initialize form with default values or existing form data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: existingForm || {
      name: '',
      description: '',
      fields: [getDefaultField()],
      listId: null,
    },
  });
  
  // Use field array to manage dynamic form fields
  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "fields"
  });

  // Mutation for creating/updating forms
  const mutation = useMutation({
    mutationFn: (data: FormValues) => {
      return existingForm
        ? apiRequest('PATCH', `/api/forms/${existingForm.id}`, data)
        : apiRequest('POST', '/api/forms', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/forms'] });
      toast({
        title: existingForm ? 'Form updated' : 'Form created',
        description: existingForm
          ? 'The form has been updated successfully.'
          : 'The form has been created successfully.',
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to ${existingForm ? 'update' : 'create'} the form. Please try again.`,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  const addField = () => {
    append(getDefaultField());
  };

  const removeField = (index: number) => {
    remove(index);
  };

  const openOptionsDialog = (index: number) => {
    setCurrentFieldIndex(index);
    setShowOptionDialog(true);
  };

  const addOption = () => {
    if (!newOption.trim()) return;
    
    const currentField = fields[currentFieldIndex];
    const options = currentField.options || [];
    const updatedField = {
      ...currentField,
      options: [...options, newOption.trim()],
    };
    
    update(currentFieldIndex, updatedField);
    setNewOption('');
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const currentField = fields[fieldIndex];
    const options = [...(currentField.options || [])];
    options.splice(optionIndex, 1);
    
    const updatedField = {
      ...currentField,
      options,
    };
    
    update(fieldIndex, updatedField);
  };

  return (
    <>
      <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {existingForm ? 'Edit Form' : 'Create Form'}
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Form Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Contact Form" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what this form is for" 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium">Form Fields</h4>
              <Button type="button" variant="outline" size="sm" onClick={addField}>
                <Plus className="h-4 w-4 mr-2" /> Add Field
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id}>
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm font-medium">Field {index + 1}</CardTitle>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeField(index)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`fields.${index}.label`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Field Label</FormLabel>
                          <FormControl>
                            <Input placeholder="Full Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`fields.${index}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Field Type</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value);
                              // Reset options when changing field type
                              if (value === 'select' && !fields[index].options) {
                                const updatedField = {
                                  ...fields[index],
                                  options: [],
                                };
                                update(index, updatedField);
                              }
                            }}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a field type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {fieldTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`fields.${index}.placeholder`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Placeholder</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter a placeholder" 
                              {...field} 
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`fields.${index}.required`}
                      render={({ field }) => (
                        <FormItem className="flex items-end space-x-2">
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                              <FormLabel className="m-0">Required Field</FormLabel>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {fields[index].type === 'select' && (
                      <div className="col-span-2">
                        <div className="flex items-center justify-between">
                          <FormLabel>Options</FormLabel>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openOptionsDialog(index)}
                          >
                            <Plus className="h-3 w-3 mr-1" /> Add Options
                          </Button>
                        </div>
                        <div className="mt-2">
                          {fields[index].options?.length ? (
                            <div className="space-y-1">
                              {fields[index].options.map((option, optionIndex) => (
                                <div
                                  key={optionIndex}
                                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded px-3 py-1"
                                >
                                  <span>{option}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeOption(index, optionIndex)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              No options added yet
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending
                ? 'Saving...'
                : existingForm
                ? 'Update Form'
                : 'Create Form'}
            </Button>
          </div>
        </form>
      </Form>

      {/* Options Dialog */}
      <Dialog open={showOptionDialog} onOpenChange={setShowOptionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Options</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center space-x-2">
              <Input
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder="Enter option"
              />
              <Button type="button" onClick={addOption}>
                Add
              </Button>
            </div>
            <div className="mt-4">
              <h5 className="text-sm font-medium mb-2">Current Options</h5>
              {currentFieldIndex >= 0 &&
              fields[currentFieldIndex]?.options?.length ? (
                <div className="space-y-1">
                  {fields[currentFieldIndex].options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded px-3 py-1"
                    >
                      <span>{option}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(currentFieldIndex, optionIndex)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  No options added yet
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="button" onClick={() => setShowOptionDialog(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FormForm;