import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FilePlus, Upload, Loader2 } from 'lucide-react';
import { useHealthRecords } from '@/hooks/use-health-records';

const RecordUpload = ({ onUploadComplete }: { onUploadComplete?: () => void }) => {
  const { toast } = useToast();
  const { uploadHealthRecord, isLoading } = useHealthRecords();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'blood_test' | 'xray_mri' | 'prescription' | 'doctor_note' | 'other'>('other');
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !category || !file) {
      toast({
        title: "Incomplete information",
        description: "Please fill in all required fields and select a file.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await uploadHealthRecord(file, title, description, category);
      
      // Reset the form
      setTitle('');
      setDescription('');
      setCategory('other');
      setFile(null);
      
      // Notify parent component of upload completion
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error('Upload error:', error);
      // Error is already handled in the hook
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center mb-6">
        <FilePlus className="h-6 w-6 text-medivault-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-800">Upload Medical Record</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Record Title <span className="text-red-500">*</span>
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Annual Blood Test, X-Ray Report"
            required
          />
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <Select
            value={category}
            onValueChange={(value) => setCategory(value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select record category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blood_test">Blood Test</SelectItem>
              <SelectItem value="xray_mri">X-Ray / MRI</SelectItem>
              <SelectItem value="prescription">Prescription</SelectItem>
              <SelectItem value="doctor_note">Doctor's Note</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the medical record"
            rows={3}
          />
        </div>
        
        <div>
          <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
            Upload File <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-medivault-600 hover:text-medivault-500"
                >
                  <span>Upload a file</span>
                  <Input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PDF, JPG, PNG, DOC up to 10MB
              </p>
              {file && (
                <p className="text-sm text-medivault-600 font-medium">
                  Selected: {file.name}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="pt-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Record
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RecordUpload;
