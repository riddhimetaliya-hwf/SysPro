
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export const ScheduledReports = () => {
  const [enabled, setEnabled] = useState(false);
  const [emailAdded, setEmailAdded] = useState(false);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  
  const handleAddEmail = () => {
    if (newEmail && newEmail.includes('@')) {
      setRecipients([...recipients, newEmail]);
      setNewEmail('');
      setEmailAdded(true);
      toast.success("Email recipient added successfully");
    } else {
      toast.error("Please enter a valid email address");
    }
  };
  
  const handleSaveSchedule = () => {
    toast.success("Scheduled report settings saved successfully");
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scheduled Reports</CardTitle>
        <CardDescription>Configure automatic report generation and delivery</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="enable-weekly">Enable Weekly Summary</Label>
            <Switch 
              id="enable-weekly" 
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>
          
          {enabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="schedule-day">Select Day</Label>
                <Select>
                  <SelectTrigger id="schedule-day">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="tuesday">Tuesday</SelectItem>
                    <SelectItem value="wednesday">Wednesday</SelectItem>
                    <SelectItem value="thursday">Thursday</SelectItem>
                    <SelectItem value="friday">Friday</SelectItem>
                    <SelectItem value="saturday">Saturday</SelectItem>
                    <SelectItem value="sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="schedule-time">Select Time</Label>
                <Select>
                  <SelectTrigger id="schedule-time">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8am">8:00 AM</SelectItem>
                    <SelectItem value="12pm">12:00 PM</SelectItem>
                    <SelectItem value="3pm">3:00 PM</SelectItem>
                    <SelectItem value="6pm">6:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="add-recipient">Add Email Recipient</Label>
                <div className="flex space-x-2">
                  <Input 
                    id="add-recipient" 
                    placeholder="email@example.com" 
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                  <Button onClick={handleAddEmail}>Add</Button>
                </div>
              </div>
              
              {emailAdded && (
                <div className="bg-secondary p-2 rounded-md">
                  <div className="text-sm font-medium">Recipients:</div>
                  <ul className="text-sm mt-1">
                    {recipients.map((email, index) => (
                      <li key={index}>{email}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
      {enabled && (
        <CardFooter>
          <Button className="w-full" onClick={handleSaveSchedule}>
            Save Schedule
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
