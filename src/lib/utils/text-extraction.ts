
// This is a mock implementation of text extraction
// In a real application, you would use OCR services like Tesseract.js, Google Cloud Vision, or Azure Computer Vision

export const extractTextFromImage = async (
  imageUrl: string,
  category: 'blood_test' | 'xray_mri' | 'prescription' | 'doctor_note' | 'other'
): Promise<string> => {
  // Simulating API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock data based on category
  switch (category) {
    case 'blood_test':
      return `BLOOD TEST RESULTS
Patient: John Doe
Date: ${new Date().toLocaleDateString()}
Test Type: Complete Blood Count (CBC)

Results:
- Hemoglobin: 14.5 g/dL (Normal range: 13.5-17.5 g/dL)
- White Blood Cells: 7.2 x10^9/L (Normal range: 4.5-11.0 x10^9/L)
- Platelets: 250 x10^9/L (Normal range: 150-450 x10^9/L)
- Red Blood Cells: 5.1 x10^12/L (Normal range: 4.5-5.9 x10^12/L)

All results within normal range.`;

    case 'xray_mri':
      return `RADIOLOGY REPORT
Patient: John Doe
Date: ${new Date().toLocaleDateString()}
Examination: Chest X-Ray

Findings:
- Lungs are clear without evidence of infiltrates or effusions
- Heart size is normal
- No pneumothorax or pleural effusion
- Osseous structures are intact

Impression: Normal chest radiograph.`;

    case 'prescription':
      return `PRESCRIPTION
Patient: John Doe
Date: ${new Date().toLocaleDateString()}
Doctor: Dr. Smith

Medication: Amoxicillin
Dosage: 500mg
Frequency: 3 times daily for 7 days
Instructions: Take with food

Refills: 0
Signature: Dr. Smith, MD`;

    case 'doctor_note':
      return `DOCTOR'S NOTE
Patient: John Doe
Date: ${new Date().toLocaleDateString()}
Provider: Dr. Smith

Subjective: Patient presents with 3-day history of sore throat, mild fever, and fatigue.

Objective:
- Temperature: 99.8°F
- Throat: Erythematous with tonsillar exudate
- Lymph nodes: Mild cervical lymphadenopathy

Assessment: Acute pharyngitis, likely viral in origin.

Plan:
- Rest and hydration
- Acetaminophen for fever and discomfort
- Return if symptoms worsen or persist beyond 5 days

Follow-up: As needed`;

    default:
      return `Extracted text from document.
Date: ${new Date().toLocaleDateString()}

This is automatically extracted text from your uploaded document.
In a production environment, this would be processed using advanced OCR technology to accurately extract all text content from your medical document.`;
  }
};

export const extractTextFromPDF = async (
  pdfUrl: string,
  category: 'blood_test' | 'xray_mri' | 'prescription' | 'doctor_note' | 'other'
): Promise<string> => {
  // In a real app, this would use a PDF parsing library like pdf.js
  // For this demo, we'll use the same mock function as for images
  return extractTextFromImage(pdfUrl, category);
};

export const extractTextFromFile = async (
  file: File,
  fileUrl: string,
  category: 'blood_test' | 'xray_mri' | 'prescription' | 'doctor_note' | 'other'
): Promise<string> => {
  // Check file type and use appropriate extraction method
  const fileType = file.type.toLowerCase();
  
  if (fileType.includes('pdf')) {
    return extractTextFromPDF(fileUrl, category);
  } else if (fileType.includes('image')) {
    return extractTextFromImage(fileUrl, category);
  } else {
    // For other document types, return a generic message
    return `This is a ${fileType} document. Text extraction is not available for this file type in the demo.`;
  }
};
