
import { useState } from 'react';
import { Pill, Calendar, Clock, CheckCircle, Circle, Info, PlusCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CustomSwitch } from '@/components/ui/custom-switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Frequency = 'daily' | 'weekly' | 'monthly';
type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

type Medication = {
  id: string;
  name: string;
  dosage: string;
  frequency: Frequency;
  timeOfDay: TimeOfDay[];
  startDate: Date;
  endDate?: Date;
  notes?: string;
  taken: boolean;
  remindersEnabled: boolean;
};

const mockMedications: Medication[] = [
  {
    id: '1',
    name: 'Aspirin',
    dosage: '81mg',
    frequency: 'daily',
    timeOfDay: ['morning'],
    startDate: new Date(2023, 0, 15),
    taken: false,
    remindersEnabled: true
  },
  {
    id: '2',
    name: 'Vitamin D',
    dosage: '1000 IU',
    frequency: 'daily',
    timeOfDay: ['morning', 'evening'],
    startDate: new Date(2023, 1, 10),
    taken: true,
    remindersEnabled: true
  },
  {
    id: '3',
    name: 'Amoxicillin',
    dosage: '500mg',
    frequency: 'daily',
    timeOfDay: ['morning', 'afternoon', 'evening'],
    startDate: new Date(2023, 2, 5),
    endDate: new Date(2023, 2, 12),
    notes: 'Take with food',
    taken: false,
    remindersEnabled: true
  }
];

const getTimeOfDayIcon = (timeOfDay: TimeOfDay) => {
  switch (timeOfDay) {
    case 'morning':
      return '🌅';
    case 'afternoon':
      return '☀️';
    case 'evening':
      return '🌆';
    case 'night':
      return '🌙';
    default:
      return '⏰';
  }
};

const MedicationTracker = () => {
  const [medications, setMedications] = useState<Medication[]>(mockMedications);
  
  const handleToggleTaken = (id: string) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, taken: !med.taken } : med
    ));
    
    const medication = medications.find(med => med.id === id);
    if (medication) {
      toast.success(`${medication.taken ? 'Unmarked' : 'Marked'} ${medication.name} as ${medication.taken ? 'not taken' : 'taken'}`);
    }
  };
  
  const handleToggleReminders = (id: string) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, remindersEnabled: !med.remindersEnabled } : med
    ));
    
    const medication = medications.find(med => med.id === id);
    if (medication) {
      toast.success(`Reminders ${medication.remindersEnabled ? 'disabled' : 'enabled'} for ${medication.name}`);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-amber-800">
            <Pill className="h-5 w-5 mr-2 text-amber-500" />
            Medication Tracker
          </CardTitle>
          <Button variant="outline" size="sm" className="text-xs">
            <Settings className="h-3.5 w-3.5 mr-1.5" />
            Settings
          </Button>
        </div>
        <CardDescription className="text-amber-700">
          Track your medications and set reminders
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-4">
          {medications.map((medication) => (
            <div 
              key={medication.id} 
              className={cn(
                "p-3 rounded-lg border transition-all duration-200",
                medication.taken 
                  ? "border-green-100 bg-green-50" 
                  : "border-gray-100 bg-white hover:border-amber-100 hover:bg-amber-50"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => handleToggleTaken(medication.id)}
                    className="mt-0.5"
                  >
                    {medication.taken ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-300" />
                    )}
                  </button>
                  
                  <div>
                    <div className="flex items-center">
                      <h4 className="font-medium text-gray-900">
                        {medication.name}
                      </h4>
                      {medication.notes && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="ml-1.5 text-gray-400 hover:text-gray-500">
                                <Info className="h-3.5 w-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{medication.notes}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      {medication.dosage} • {medication.frequency}
                    </div>
                    
                    <div className="flex space-x-1 mt-1">
                      {medication.timeOfDay.map((time) => (
                        <span 
                          key={time} 
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {getTimeOfDayIcon(time)} {time}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>Until {medication.endDate ? new Date(medication.endDate).toLocaleDateString() : 'ongoing'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-2">Reminders</span>
                    <CustomSwitch
                      checked={medication.remindersEnabled}
                      onCheckedChange={() => handleToggleReminders(medication.id)}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      
      <Separator />
      
      <CardFooter className="py-3 flex justify-center">
        <Button variant="outline" className="w-full">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Medication
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MedicationTracker;
