import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, MoreHorizontal } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

// Calendar event type
interface Event {
  id: number;
  title: string;
  date: Date;
  type: "meeting" | "task" | "reminder" | "deadline";
  description?: string;
  priority?: "Low" | "Medium" | "High";
  relatedTo?: {
    type: "contact" | "company" | "deal";
    id: number;
    name: string;
  };
  completed?: boolean;
}

const CalendarPage = () => {
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isViewEventsOpen, setIsViewEventsOpen] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: "",
    date: new Date(),
    type: "meeting",
    description: "",
    priority: "Medium"
  });

  // Fetch tasks from the API
  const { data: tasks, isLoading: isTasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Sample events data
  // In a real app, this would come from an API
  const [events, setEvents] = useState<Event[]>([
    {
      id: 1,
      title: "Meeting with HSBC",
      date: new Date(2025, 4, 15, 10, 0),
      type: "meeting",
      description: "Discuss new sustainability project proposal",
      relatedTo: {
        type: "company",
        id: 1,
        name: "HSBC"
      }
    },
    {
      id: 2,
      title: "Proposal deadline",
      date: new Date(2025, 4, 20, 17, 0),
      type: "deadline",
      description: "Submit final proposal for VX Academy project",
      priority: "High",
      relatedTo: {
        type: "deal",
        id: 2,
        name: "VX Academy Training Program"
      }
    },
    {
      id: 3,
      title: "Follow up with Goumbook",
      date: new Date(2025, 4, 22, 14, 0),
      type: "task",
      description: "Call to discuss campaign progress",
      priority: "Medium",
      relatedTo: {
        type: "company",
        id: 3,
        name: "Goumbook"
      },
      completed: false
    }
  ]);

  // Add tasks as events
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const taskEvents: Event[] = tasks
        .filter(task => task.dueDate)
        .map(task => ({
          id: task.id + 1000, // Add offset to avoid ID conflicts
          title: task.title,
          date: new Date(task.dueDate!),
          type: "task",
          description: task.description || undefined,
          priority: task.priority as "Low" | "Medium" | "High" || "Medium",
          completed: task.completed || false
        }));
      
      // Merge task events with regular events
      // In a real app, you'd handle this differently, likely with a unified API
      setEvents(prevEvents => {
        const existingIds = new Set(prevEvents.map(e => e.id));
        const newTaskEvents = taskEvents.filter(e => !existingIds.has(e.id));
        return [...prevEvents, ...newTaskEvents];
      });
    }
  }, [tasks]);

  // Get days in the current month view
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(new Date(event.date), day));
  };

  // Go to previous month
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // Go to next month
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Go to today
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  // Handle day click
  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    const dayEvents = getEventsForDay(day);
    
    if (dayEvents.length > 0) {
      setSelectedEvents(dayEvents);
      setIsViewEventsOpen(true);
    } else {
      // If no events, open create event dialog
      setNewEvent({
        ...newEvent,
        date: day
      });
      setIsCreateEventOpen(true);
    }
  };

  // Create a new event
  const createEvent = () => {
    if (!newEvent.title) {
      toast({
        title: "Error",
        description: "Event title is required",
        variant: "destructive"
      });
      return;
    }

    const event: Event = {
      id: events.length + 1,
      title: newEvent.title!,
      date: newEvent.date || new Date(),
      type: newEvent.type as "meeting" | "task" | "reminder" | "deadline",
      description: newEvent.description,
      priority: newEvent.priority as "Low" | "Medium" | "High"
    };

    setEvents([...events, event]);
    setIsCreateEventOpen(false);
    setNewEvent({
      title: "",
      date: new Date(),
      type: "meeting",
      description: "",
      priority: "Medium"
    });

    toast({
      title: "Event created",
      description: "Your event has been added to the calendar."
    });
  };

  // Toggle task completion status
  const toggleTaskCompletion = (eventId: number) => {
    setEvents(events.map(event => 
      event.id === eventId ? { ...event, completed: !event.completed } : event
    ));

    // If this was a task from the API, we would update it
    if (eventId > 1000) {
      const taskId = eventId - 1000;
      const task = tasks?.find(t => t.id === taskId);
      
      if (task) {
        // In a real implementation, this would update the task in the database
        /*
        apiRequest("PATCH", `/api/tasks/${taskId}`, { 
          completed: !task.completed 
        }).then(() => {
          queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
        });
        */
      }
    }
  };

  // Delete an event
  const deleteEvent = (eventId: number) => {
    setEvents(events.filter(event => event.id !== eventId));
    
    if (selectedEvents.length === 1) {
      setIsViewEventsOpen(false);
    } else {
      setSelectedEvents(selectedEvents.filter(event => event.id !== eventId));
    }

    toast({
      title: "Event deleted",
      description: "The event has been removed from your calendar."
    });
  };

  // Event badge color based on type
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-blue-500";
      case "task":
        return "bg-green-500";
      case "reminder":
        return "bg-yellow-500";
      case "deadline":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Render calendar grid
  const renderCalendarDays = () => {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    return (
      <div className="grid grid-cols-7 mt-4">
        {/* Day headers */}
        {dayNames.map((day, i) => (
          <div 
            key={i} 
            className="text-center font-semibold p-2 text-sm text-gray-500"
          >
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {monthDays.map((day, i) => {
          const dayEvents = getEventsForDay(day);
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          
          return (
            <div 
              key={i} 
              className={`
                min-h-[100px] p-2 border border-gray-200 relative
                ${isToday(day) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
                ${!isSameMonth(day, currentMonth) ? 'text-gray-400' : ''}
              `}
              onClick={() => handleDayClick(day)}
            >
              <div className="text-right">
                {format(day, 'd')}
              </div>
              
              <div className="mt-2 space-y-1 max-h-[80px] overflow-y-auto">
                {dayEvents.slice(0, 3).map((event, idx) => (
                  <div 
                    key={idx}
                    className={`
                      text-xs p-1 rounded truncate
                      ${event.completed ? 'line-through opacity-50' : ''}
                      ${getEventTypeColor(event.type)} text-white
                    `}
                  >
                    {event.title}
                  </div>
                ))}
                
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 pl-1">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Calendar</h1>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={goToToday}>
            Today
          </Button>
          
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <h2 className="text-xl font-semibold mx-4">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          
          <Button onClick={() => setIsCreateEventOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>
      
      {renderCalendarDays()}
      
      {/* Create Event Dialog */}
      <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Add a new event to your calendar.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                placeholder="Event title"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newEvent.date ? format(newEvent.date, 'PPP') : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newEvent.date}
                    onSelect={(date) => setNewEvent({...newEvent, date: date || new Date()})}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="type">Event Type</Label>
              <Select 
                value={newEvent.type} 
                onValueChange={(value) => setNewEvent({...newEvent, type: value as any})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={newEvent.priority} 
                onValueChange={(value) => setNewEvent({...newEvent, priority: value as any})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                placeholder="Add details about this event"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateEventOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createEvent}>
              Create Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Events Dialog */}
      <Dialog open={isViewEventsOpen} onOpenChange={setIsViewEventsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Events for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4 max-h-[400px] overflow-y-auto">
            {selectedEvents.map((event, idx) => (
              <Card key={idx} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <Badge 
                        className={`mr-2 ${getEventTypeColor(event.type)} text-white`}
                      >
                        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                      </Badge>
                      <CardTitle className="text-lg">
                        {event.title}
                      </CardTitle>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40 p-0">
                        <div className="py-1">
                          {event.type === 'task' && (
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-left px-2 py-1.5 text-sm"
                              onClick={() => toggleTaskCompletion(event.id)}
                            >
                              {event.completed ? 'Mark Incomplete' : 'Mark Complete'}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-left px-2 py-1.5 text-sm text-red-500"
                            onClick={() => deleteEvent(event.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <CardDescription>
                    {format(new Date(event.date), 'h:mm a')}
                    {event.priority && ` • ${event.priority} Priority`}
                  </CardDescription>
                </CardHeader>
                
                {event.description && (
                  <CardContent className="py-2">
                    <p className="text-sm">{event.description}</p>
                  </CardContent>
                )}
                
                {event.relatedTo && (
                  <CardFooter className="pt-0 pb-3">
                    <div className="text-xs text-gray-500">
                      Related to: {event.relatedTo.type.charAt(0).toUpperCase() + event.relatedTo.type.slice(1)} •{" "}
                      <span className="font-medium">{event.relatedTo.name}</span>
                    </div>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
          
          <DialogFooter>
            <Button 
              onClick={() => {
                setNewEvent({
                  ...newEvent,
                  date: selectedDate || new Date()
                });
                setIsViewEventsOpen(false);
                setIsCreateEventOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;