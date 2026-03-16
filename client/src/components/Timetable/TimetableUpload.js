import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { toast } from 'react-toastify';
import { saveTimetableToFirestore } from '../../services/firestoreService';
import { useAuth } from '../../contexts/AuthContext';

const TimetableUpload = ({ classId, className }) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  // Expected CSV/Excel format
  const expectedColumns = ['Day', 'Subject', 'Start Time', 'End Time', 'Teacher', 'Meeting Link'];

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (fileExtension === 'csv') {
      parseCSV(file);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      parseExcel(file);
    } else {
      toast.error('Please upload CSV or Excel file only');
    }
  };

  const parseCSV = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        validateAndPreview(results.data);
      },
      error: (error) => {
        toast.error('Error parsing CSV: ' + error.message);
      }
    });
  };

  const parseExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);
      validateAndPreview(jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

  const validateAndPreview = (data) => {
    // Check if data has required columns
    const firstRow = data[0] || {};
    const columns = Object.keys(firstRow);
    
    const hasRequiredColumns = expectedColumns.every(col => 
      columns.some(c => c.toLowerCase().includes(col.toLowerCase()))
    );

    if (!hasRequiredColumns) {
      toast.error(`File must contain columns: ${expectedColumns.join(', ')}`);
      return;
    }

    // Normalize column names
    const normalizedData = data.map(row => ({
      day: row.Day || row.day || row.DAY,
      subject: row.Subject || row.subject,
      startTime: row['Start Time'] || row.startTime || row.start_time,
      endTime: row['End Time'] || row.endTime || row.end_time,
      teacher: row.Teacher || row.teacher,
      meetingLink: row['Meeting Link'] || row.meetingLink || row.meeting_link || ''
    })).filter(item => item.day && item.subject && item.startTime && item.endTime);

    setPreviewData(normalizedData);
    toast.success(`Loaded ${normalizedData.length} timetable entries`);
  };

  const handleSaveToFirestore = async () => {
    if (!previewData.length) {
      toast.error('No valid data to save');
      return;
    }

    setUploading(true);
    try {
      const savePromises = previewData.map(entry => 
        saveTimetableToFirestore({
          classId,
          className,
          ...entry,
          teacherId: user.id,
          createdAt: new Date().toISOString()
        })
      );

      await Promise.all(savePromises);
      toast.success(`Successfully saved ${previewData.length} timetable entries`);
      setPreviewData([]);
      setSelectedFile(null);
      
      // Reset file input
      document.getElementById('timetable-file').value = '';
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save timetable: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="timetable-upload card">
      <h3>Upload Class Timetable</h3>
      <p className="text-light">Upload CSV or Excel file with columns: Day, Subject, Start Time, End Time, Teacher, Meeting Link</p>
      
      <div className="upload-area">
        <input
          type="file"
          id="timetable-file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileUpload}
          disabled={uploading}
          className="file-input"
        />
        
        {selectedFile && (
          <div className="file-info">
            Selected: {selectedFile.name}
          </div>
        )}
      </div>

      {previewData.length > 0 && (
        <div className="preview-section">
          <h4>Preview ({previewData.length} entries)</h4>
          <div className="preview-table">
            <table>
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Subject</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Teacher</th>
                </tr>
              </thead>
              <tbody>
                {previewData.slice(0, 5).map((item, index) => (
                  <tr key={index}>
                    <td>{item.day}</td>
                    <td>{item.subject}</td>
                    <td>{item.startTime}</td>
                    <td>{item.endTime}</td>
                    <td>{item.teacher}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {previewData.length > 5 && (
              <p className="text-light">... and {previewData.length - 5} more</p>
            )}
          </div>

          <div className="action-buttons">
            <button 
              className="btn btn-primary"
              onClick={handleSaveToFirestore}
              disabled={uploading}
            >
              {uploading ? 'Saving...' : 'Save to Database'}
            </button>
            <button 
              className="btn btn-outline"
              onClick={() => {
                setPreviewData([]);
                setSelectedFile(null);
                document.getElementById('timetable-file').value = '';
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .timetable-upload {
          padding: var(--space-lg);
        }
        
        .upload-area {
          margin: var(--space-lg) 0;
          padding: var(--space-lg);
          border: 2px dashed var(--border-color);
          border-radius: var(--radius-md);
          text-align: center;
        }
        
        .file-input {
          padding: var(--space-md);
        }
        
        .file-info {
          margin-top: var(--space-md);
          color: var(--success);
        }
        
        .preview-section {
          margin-top: var(--space-xl);
        }
        
        .preview-table {
          max-height: 300px;
          overflow-y: auto;
          margin: var(--space-md) 0;
        }
        
        .action-buttons {
          display: flex;
          gap: var(--space-md);
          justify-content: flex-end;
          margin-top: var(--space-lg);
        }
      `}</style>
    </div>
  );
};

export default TimetableUpload;