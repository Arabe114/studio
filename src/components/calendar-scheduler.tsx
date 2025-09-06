"use client";

import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { format, isSameDay } from 'date-fns';


type Event = {
  id: string;
  date: Date;
  title: string;
  type: 'work' | 'personal' | 'other';
};

export default function CalendarScheduler() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const handleAddEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const type = formData.get('type') as 'work' | 'personal' | 'other';

    if (date && title) {
        const newEvent: Event = {
            id: `event-${Date.now()}`,
            date,
            title,
            type,
        };
        setEvents(prev => [...prev, newEvent]);
        setIsModalOpen(false);
    }
  };

  const dayEvents = date ? events.filter(event => isSameDay(event.date, date)) : [];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Calendar & Scheduler</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardContent className="p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="w-full"
              modifiers={{ hasEvent: events.map(e => e.date) }}
              modifiersClassNames={{ hasEvent: 'bg-primary/20 rounded-full' }}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              Events for {date ? format(date, 'PPP') : '...'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dayEvents.length > 0 ? (
              dayEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-2 rounded-lg bg-background">
                  <span className="font-medium">{event.title}</span>
                  <Badge
                    className={
                      event.type === 'work'
                        ? 'bg-blue-500'
                        : event.type === 'personal'
                        ? 'bg-green-500'
                        : 'bg-gray-500'
                    }
                  >
                    {event.type}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No events for this day.</p>
            )}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="w-full mt-4" disabled={!date}>Add Event</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Event for {date ? format(date, 'PPP') : ''}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddEvent} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Event Title</Label>
                    <Input id="title" name="title" required />
                  </div>
                  <div>
                    <Label htmlFor="type">Event Type</Label>
                    <select
                      id="type"
                      name="type"
                      defaultValue="personal"
                      className="w-full p-2 mt-1 rounded-md border bg-background"
                    >
                      <option value="personal">Personal</option>
                      <option value="work">Work</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <Button type="submit">Save Event</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
