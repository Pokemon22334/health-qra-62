
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, Clock, Pill, PlusCircle, CheckCircle2, XCircle, Printer } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

interface MedicationFormValues {
  name: string;
  dosage: string;
  frequency: string;
  start_date: Date;
  end_date?: Date;
  notes?: string;
  reminder_time?: string;
}

const frequencyOptions = [
  { label: 'Once daily', value: 'once_daily' },
  { label: 'Twice daily', value: 'twice_daily' },
  { label: 'Three times daily', value: 'three_times_daily' },
  { label: 'Four times daily', value: 'four_times_daily' },
  { label: 'Every morning', value: 'every_morning' },
  { label: 'Every evening', value: 'every_evening' },
  { label: 'Every other day', value: 'every_other_day' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'As needed', value: 'as_needed' },
];

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface MedicationHistory {
  id: string;
  medication_id: string;
  medication_name?: string;
  taken_at: string;
  status: 'taken' | 'missed' | 'skipped';
  notes: string | null;
}

const MedicationManager = ({ refreshTrigger = 0 }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [history, setHistory] = useState<MedicationHistory[]>([]);
  const [activeTab, setActiveTab] = useState('active');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [filterDate, setFilterDate] = useState<Date | undefined>(new Date());

  const form = useForm<MedicationFormValues>({
    defaultValues: {
      name: '',
      dosage: '',
      frequency: 'once_daily',
      start_date: new Date(),
      notes: '',
      reminder_time: '08:00',
    },
  });

  // Load medications
  useEffect(() => {
    if (!user) return;
    fetchMedications();
  }, [user, refreshTrigger]);

  const fetchMedications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      
      setMedications(data || []);
    } catch (error: any) {
      console.error('Error fetching medications:', error.message);
      toast({
        title: 'Error fetching medications',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load medication history
  const fetchMedicationHistory = async (medicationId?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('medication_history')
        .select(`
          *,
          medications(name)
        `)
        .order('taken_at', { ascending: false });
      
      if (medicationId) {
        query = query.eq('medication_id', medicationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Transform data to include medication name
      const historyWithNames = data.map(record => ({
        ...record,
        medication_name: record.medications?.name
      }));
      
      setHistory(historyWithNames);
    } catch (error: any) {
      console.error('Error fetching medication history:', error.message);
      toast({
        title: 'Error fetching history',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedication = async (values: MedicationFormValues) => {
    try {
      setLoading(true);
      
      // Format dates for database
      const formattedStartDate = values.start_date.toISOString().split('T')[0];
      const formattedEndDate = values.end_date ? values.end_date.toISOString().split('T')[0] : null;
      
      // Add medication
      const { data: medication, error } = await supabase
        .from('medications')
        .insert({
          user_id: user?.id,
          name: values.name,
          dosage: values.dosage,
          frequency: values.frequency,
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          notes: values.notes,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Add reminder if time is provided
      if (values.reminder_time) {
        const { error: reminderError } = await supabase
          .from('medication_reminders')
          .insert({
            user_id: user?.id,
            medication_id: medication.id,
            reminder_time: values.reminder_time,
          });
        
        if (reminderError) throw reminderError;
      }
      
      toast({
        title: 'Medication added',
        description: `${values.name} has been added to your medications.`,
      });
      
      setAddDialogOpen(false);
      form.reset();
      fetchMedications();
    } catch (error: any) {
      console.error('Error adding medication:', error.message);
      toast({
        title: 'Error adding medication',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsTaken = async (medicationId: string, medicationName: string, status: 'taken' | 'missed' | 'skipped') => {
    try {
      setLoading(true);
      
      // Add to history
      const { error } = await supabase
        .from('medication_history')
        .insert({
          user_id: user?.id,
          medication_id: medicationId,
          status,
        });

      if (error) throw error;
      
      toast({
        title: status === 'taken' ? 'Marked as taken' : status === 'missed' ? 'Marked as missed' : 'Marked as skipped',
        description: `${medicationName} has been marked as ${status}.`,
      });
      
      if (selectedMedication?.id === medicationId) {
        fetchMedicationHistory(medicationId);
      }
    } catch (error: any) {
      console.error('Error updating medication status:', error.message);
      toast({
        title: 'Error updating status',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = (medication: Medication) => {
    setSelectedMedication(medication);
    fetchMedicationHistory(medication.id);
    setHistoryDialogOpen(true);
  };

  const handlePrintMedicationList = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: 'Print error',
        description: 'Unable to open print window. Please check your popup blocker settings.',
        variant: 'destructive',
      });
      return;
    }
    
    // Generate HTML content for printing
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Medication List</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #1a5fb4; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f2f2f2; }
          .footer { margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <h1>Medication List</h1>
        <p>Generated on ${new Date().toLocaleDateString()} for ${user?.user_metadata?.name || user?.email}</p>
        
        <table>
          <thead>
            <tr>
              <th>Medication</th>
              <th>Dosage</th>
              <th>Frequency</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${medications.map(med => `
              <tr>
                <td>${med.name}</td>
                <td>${med.dosage}</td>
                <td>${frequencyOptions.find(f => f.value === med.frequency)?.label || med.frequency}</td>
                <td>${new Date(med.start_date).toLocaleDateString()}</td>
                <td>${med.end_date ? new Date(med.end_date).toLocaleDateString() : 'Ongoing'}</td>
                <td>${med.notes || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Printed from MediVault Health Records - For medical reference only</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const getActiveMedications = () => {
    const today = new Date().toISOString().split('T')[0];
    return medications.filter(med => {
      const isActive = !med.end_date || med.end_date >= today;
      return activeTab === 'active' ? isActive : !isActive;
    });
  };

  const formatFrequency = (code: string) => {
    return frequencyOptions.find(option => option.value === code)?.label || code;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Medication Management</h2>
          <p className="text-muted-foreground">Manage your medications and set reminders</p>
        </div>
        
        <div className="flex space-x-2">
          <Button onClick={() => handlePrintMedicationList()}>
            <Printer className="h-4 w-4 mr-2" />
            Print List
          </Button>
          
          <Button onClick={() => {
            form.reset();
            setAddDialogOpen(true);
          }}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Medication
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Active Medications</TabsTrigger>
          <TabsTrigger value="inactive">Inactive Medications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4 mt-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading medications...</p>
            </div>
          ) : getActiveMedications().length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <Pill className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">No active medications</h3>
              <p className="mt-1 text-sm text-muted-foreground">Add medications to start tracking them</p>
              <Button className="mt-4" onClick={() => setAddDialogOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Medication
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getActiveMedications().map((medication) => (
                <Card key={medication.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{medication.name}</CardTitle>
                      <Pill className="h-5 w-5 text-primary" />
                    </div>
                    <CardDescription>{formatFrequency(medication.frequency)}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">Dosage:</span>
                        <span>{medication.dosage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Start Date:</span>
                        <span>{format(new Date(medication.start_date), 'MMM d, yyyy')}</span>
                      </div>
                      {medication.end_date && (
                        <div className="flex justify-between">
                          <span className="font-medium">End Date:</span>
                          <span>{format(new Date(medication.end_date), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                      {medication.notes && (
                        <div className="mt-2">
                          <span className="font-medium">Notes:</span>
                          <p className="mt-1 text-muted-foreground">{medication.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewHistory(medication)}
                    >
                      View History
                    </Button>
                    <div className="flex space-x-1">
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => handleMarkAsTaken(medication.id, medication.name, 'taken')}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Taken
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleMarkAsTaken(medication.id, medication.name, 'skipped')}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Skipped
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="inactive" className="space-y-4 mt-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading medications...</p>
            </div>
          ) : getActiveMedications().length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <Pill className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">No inactive medications</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Medications that have passed their end date will appear here
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getActiveMedications().map((medication) => (
                <Card key={medication.id} className="bg-muted/40">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg text-muted-foreground">{medication.name}</CardTitle>
                      <Pill className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardDescription>{formatFrequency(medication.frequency)}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">Dosage:</span>
                        <span>{medication.dosage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Start Date:</span>
                        <span>{format(new Date(medication.start_date), 'MMM d, yyyy')}</span>
                      </div>
                      {medication.end_date && (
                        <div className="flex justify-between">
                          <span className="font-medium">End Date:</span>
                          <span>{format(new Date(medication.end_date), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewHistory(medication)}
                    >
                      View History
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Medication Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Medication</DialogTitle>
            <DialogDescription>
              Enter the details of your medication. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddMedication)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Medication name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medication Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter medication name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dosage"
                rules={{ required: "Dosage is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dosage *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 1 pill, 10mg, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="frequency"
                rules={{ required: "Frequency is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {frequencyOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  rules={{ required: "Start date is required" }}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="w-full pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="w-full pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Ongoing</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="reminder_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reminder Time (Optional)</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormDescription>
                      Set a time for daily reminders
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional instructions or information" 
                        className="resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Medication'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Medication History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedMedication ? selectedMedication.name : 'Medication'} History
            </DialogTitle>
            <DialogDescription>
              Track when medication was taken, missed, or skipped
            </DialogDescription>
          </DialogHeader>
          
          <div className="my-4">
            <Label htmlFor="date-filter">Filter by date</Label>
            <div className="mt-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto justify-start">
                    {filterDate ? format(filterDate, "PPP") : "All dates"}
                    <CalendarIcon className="ml-2 h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filterDate}
                    onSelect={setFilterDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading history...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 border border-dashed rounded-lg">
                <Clock className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">No history found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Record when you take your medication to see history here
                </p>
              </div>
            ) : (
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border-b p-2 text-left">Date & Time</th>
                    <th className="border-b p-2 text-left">Medication</th>
                    <th className="border-b p-2 text-left">Status</th>
                    <th className="border-b p-2 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {history
                    .filter(record => {
                      if (!filterDate) return true;
                      const recordDate = new Date(record.taken_at);
                      return (
                        recordDate.getDate() === filterDate.getDate() &&
                        recordDate.getMonth() === filterDate.getMonth() &&
                        recordDate.getFullYear() === filterDate.getFullYear()
                      );
                    })
                    .map(record => (
                      <tr key={record.id} className="hover:bg-muted/50">
                        <td className="border-b p-2">
                          {format(new Date(record.taken_at), 'MMM d, yyyy h:mm a')}
                        </td>
                        <td className="border-b p-2">
                          {record.medication_name}
                        </td>
                        <td className="border-b p-2">
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            record.status === 'taken' 
                              ? 'bg-green-50 text-green-700' 
                              : record.status === 'missed'
                                ? 'bg-red-50 text-red-700'
                                : 'bg-yellow-50 text-yellow-700'
                          }`}>
                            {record.status === 'taken' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                            {record.status === 'missed' && <XCircle className="mr-1 h-3 w-3" />}
                            {record.status === 'skipped' && <XCircle className="mr-1 h-3 w-3" />}
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                        </td>
                        <td className="border-b p-2">{record.notes || '-'}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MedicationManager;
