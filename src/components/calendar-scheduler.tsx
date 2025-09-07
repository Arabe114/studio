
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
import { format, isSameDay, parse } from 'date-fns';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { useLanguage } from '@/hooks/use-language';
import { ptBR } from 'date-fns/locale';

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
  const { t, language } = useLanguage();

  useEffect(() => {
    const q = collection(db, 'events');
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const eventsData: Event[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        eventsData.push({ 
            id: doc.id,
            title: data.title,
            type: data.type,
            date: (data.date as Timestamp).toDate(),
        });
      });
      setEvents(eventsData);
    });

    return () => unsubscribe();
  }, []);

  const handleAddEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const type = formData.get('type') as 'work' | 'personal' | 'other';
    const time = formData.get('time') as string; // HH:mm

    if (date && title) {
        const [hours, minutes] = time.split(':').map(Number);
        const eventDate = new Date(date);
        eventDate.setHours(hours, minutes);

        await addDoc(collection(db, 'events'), {
            date: Timestamp.fromDate(eventDate),
            title,
            type,
        });
        setIsModalOpen(false);
    }
  };

  const dayEvents = date 
    ? events.filter(event => isSameDay(event.date, date)).sort((a, b) => a.date.getTime() - b.date.getTime())
    : [];
  
  const locale = language === 'pt' ? ptBR : undefined;
  const formattedDate = date ? format(date, 'PPP', { locale }) : '...';
  const formattedTime = date ? format(date, 'HH:mm') : '12:00';

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('calendarScheduler')}</h1>
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
              locale={locale}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              {t('eventsFor', { date: formattedDate })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dayEvents.length > 0 ? (
              dayEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-2 rounded-lg bg-background">
                  <div>
                    <span className="font-medium">{event.title}</span>
                    <p className="text-sm text-muted-foreground">{format(event.date, 'p', { locale })}</p>
                  </div>
                  <Badge
                    className={
                      event.type === 'work'
                        ? 'bg-blue-500'
                        : event.type === 'personal'
                        ? 'bg-green-500'
                        : 'bg-gray-500'
                    }
                  >
                    {t(event.type)}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">{t('noEventsForThisDay')}</p>
            )}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="w-full mt-4" disabled={!date}>{t('addEvent')}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('addEventFor', {date: formattedDate})}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddEvent} className="space-y-4">
                  <div>
                    <Label htmlFor="title">{t('eventTitle')}</Label>
                    <Input id="title" name="title" required />
                  </div>
                   <div>
                    <Label htmlFor="time">{t('eventTime')}</Label>
                    <Input id="time" name="time" type="time" defaultValue={formattedTime} required />
                  </div>
                  <div>
                    <Label htmlFor="type">{t('eventType')}</Label>
                    <select
                      id="type"
                      name="type"
                      defaultValue="personal"
                      className="w-full p-2 mt-1 rounded-md border bg-background"
                    >
                      <option value="personal">{t('personal')}</option>
                      <option value="work">{t('work')}</option>
                      <option value="other">{t('other')}</option>
                    </select>
                  </div>
                  <Button type="submit">{t('saveEvent')}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
