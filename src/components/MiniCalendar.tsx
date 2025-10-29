import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Plus, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface Event {
  id: string;
  title: string;
  event_date: string;
}

export const MiniCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadEvents();
    } else {
      setEvents([]);
    }
  }, [user]);

  const loadEvents = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error loading events:", error);
      return;
    }

    setEvents(data || []);
  };

  const handleAddEvent = async () => {
    if (!user) {
      toast.error("Please sign in to add events");
      return;
    }

    if (!selectedDate || !eventTitle.trim()) {
      toast.error("Please enter an event title");
      return;
    }

    const { error } = await supabase.from("events").insert({
      user_id: user.id,
      title: eventTitle,
      event_date: format(selectedDate, "yyyy-MM-dd"),
    });

    if (error) {
      toast.error("Failed to add event");
      return;
    }

    toast.success("Event added!");
    setEventTitle("");
    setDialogOpen(false);
    loadEvents();
  };

  const handleDeleteEvent = async (eventId: string) => {
    const { error } = await supabase.from("events").delete().eq("id", eventId);

    if (error) {
      toast.error("Failed to delete event");
      return;
    }

    toast.success("Event deleted!");
    loadEvents();
  };

  const handleDateSelect = (date: Date | undefined) => {
    setDate(date);
    if (date && user) {
      setSelectedDate(date);
      setDialogOpen(true);
    } else if (!user) {
      toast.error("Please sign in to add events");
    }
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return events.filter((event) => event.event_date === dateStr);
  };

  const modifiers = {
    hasEvent: events.map((event) => new Date(event.event_date + "T00:00:00")),
  };

  const modifiersClassNames = {
    hasEvent: "bg-purple-500 text-white hover:bg-purple-600 rounded-full",
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-2 border-2 border-purple-500 hover:bg-purple-500/10 text-purple-700 dark:text-purple-400"
            )}
          >
            <CalendarIcon className="w-4 h-4" />
            Calendar
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
            className="pointer-events-auto"
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
          />
        </PopoverContent>
      </Popover>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add Event - {selectedDate && format(selectedDate, "MMM d, yyyy")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDateEvents.length > 0 && (
              <div className="space-y-2">
                <Label>Existing Events:</Label>
                {selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-2 bg-muted rounded"
                  >
                    <span>{event.title}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="event-title">Event Title</Label>
              <Input
                id="event-title"
                placeholder="e.g., Mom's Birthday"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddEvent();
                  }
                }}
              />
            </div>
            <Button onClick={handleAddEvent} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
