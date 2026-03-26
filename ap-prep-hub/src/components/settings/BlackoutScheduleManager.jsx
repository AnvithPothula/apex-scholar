import React, { useState } from 'react';
import { Button, Input } from '../ui/UIComponents';
import { Plus, X, Edit2, Save, Calendar } from 'lucide-react';

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

// Default blackout templates with names
const DEFAULT_BLACKOUTS = {
    sleepTime: { name: "Sleep Time", range: "22:00-07:00", description: "Nighttime rest" },
    schoolHours: { name: "School Hours", range: "08:00-15:00", description: "Class time" },
    workHours: { name: "Work Hours", range: "09:00-17:00", description: "Work time" },
    earlyMorning: { name: "Early Morning", range: "05:00-08:00", description: "Early hours" },
    lateEvening: { name: "Late Evening", range: "20:00-23:00", description: "Evening time" }
};

export default function BlackoutScheduleManager({ blackoutDates = {}, setBlackoutDates }) {
    const schedule = blackoutDates || {};
    const [editingName, setEditingName] = useState({});
    const [showDefaults, setShowDefaults] = useState(false);

    const onChange = (newSchedule) => {
        setBlackoutDates(newSchedule);
    };

    // Enhanced structure: each range now has { range, name, id }
    const normalizeScheduleItem = (item) => {
        if (typeof item === 'string') {
            // Legacy format - convert to new format
            return {
                range: item,
                name: getDefaultName(item) || "Custom Block",
                id: `legacy-${item}-${Date.now()}-${Math.random()}`
            };
        }
        // Ensure new format items have all required fields
        return {
            range: item.range || "09:00-17:00",
            name: item.name || "Custom Block",
            id: item.id || `item-${Date.now()}-${Math.random()}`
        };
    };

    // Helper function to identify common time ranges
    const getDefaultName = (range) => {
        const commonRanges = {
            "22:00-07:00": "Sleep Time",
            "08:00-15:00": "School Hours",
            "09:00-17:00": "Work Hours",
            "23:00-06:00": "Sleep Time",
            "07:00-16:00": "School Hours"
        };
        return commonRanges[range];
    };

    const handleAddRange = (day, template = null) => {
        const currentRanges = schedule[day] || [];
        let newItem;

        if (template) {
            newItem = {
                range: template.range,
                name: template.name,
                id: Date.now() + Math.random()
            };
        } else {
            newItem = {
                range: "09:00-17:00",
                name: "Custom Block",
                id: Date.now() + Math.random()
            };
        }

        const newSchedule = { ...schedule, [day]: [...currentRanges.map(normalizeScheduleItem), newItem] };
        onChange(newSchedule);
    };

    const handleRemoveRange = (day, index) => {
        const currentRanges = schedule[day] || [];
        const newRanges = currentRanges.filter((_, i) => i !== index);
        const newSchedule = { ...schedule, [day]: newRanges };
        onChange(newSchedule);
    };

    const handleRangeChange = (day, index, part, value) => {
        const currentRanges = schedule[day] || [];
        const normalizedRanges = currentRanges.map(normalizeScheduleItem);
        const itemToUpdate = normalizedRanges[index];

        if (!itemToUpdate) return; // Safety check

        let [start, end] = itemToUpdate.range.split('-');

        if (part === 'start') {
            start = value;
        } else {
            end = value;
        }

        // Validate time format
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(start) || !timeRegex.test(end)) {
            console.warn(`Invalid time format: ${start}-${end}`);
            return;
        }

        const newRanges = [...normalizedRanges];
        newRanges[index] = { ...itemToUpdate, range: `${start}-${end}` };
        const newSchedule = { ...schedule, [day]: newRanges };
        onChange(newSchedule);
    };

    const handleNameChange = (day, index, newName) => {
        const currentRanges = schedule[day] || [];
        const normalizedRanges = currentRanges.map(normalizeScheduleItem);

        if (!normalizedRanges[index]) return; // Safety check

        // Sanitize name input
        const sanitizedName = newName.trim() || "Custom Block";

        const newRanges = [...normalizedRanges];
        newRanges[index] = { ...newRanges[index], name: sanitizedName };
        const newSchedule = { ...schedule, [day]: newRanges };
        onChange(newSchedule);
    };

    const startEditingName = (day, index) => {
        setEditingName({ day, index });
    };

    const stopEditingName = () => {
        setEditingName({});
    };

    return (
        <div className="space-y-4">
            {/* Quick Add Templates Section */}
            <div className="mb-6 p-4 border rounded-lg bg-base-900/40 border-border-strong">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-content-primary">Quick Add Templates</h4>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDefaults(!showDefaults)}
                        className="text-content-secondary hover:text-content-primary"
                    >
                        <Calendar className="w-4 h-4 mr-2" strokeWidth={1.5} />
                        {showDefaults ? 'Hide' : 'Show'} Templates
                    </Button>
                </div>

                <p className="text-sm text-content-muted mb-3">
                    Common time blocks you can quickly add to any day. Click "Show Templates" and then "Quick Add" on any day to use these.
                </p>

                {showDefaults && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.values(DEFAULT_BLACKOUTS).map((template, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-base-850/50 rounded border border-border hover:border-border-strong transition-colors">
                                <div className="flex-1">
                                    <span className="text-sm font-medium text-content-primary">{template.name}</span>
                                    <div className="text-xs text-content-muted">{template.range} - {template.description}</div>
                                </div>
                                <div className="ml-2 text-xs text-content-muted">
                                    Click below to add
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Day Schedule Section */}
            {DAYS.map((day) => (
                <div key={day} className="p-4 border rounded-lg bg-base-850/40 border-border-strong">
                    <div className="flex justify-between items-center">
                        <h4 className="font-medium capitalize text-content-primary">{day}</h4>
                        <div className="flex gap-2">
                            {showDefaults && (
                                <div className="relative group">
                                    <Button variant="ghost" size="sm" className="text-content-secondary hover:text-content-primary">
                                        <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} /> Quick Add
                                    </Button>
                                    <div className="absolute right-0 top-full mt-1 w-48 bg-base-850 border border-border-strong rounded-lg shadow-raised opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                        {Object.values(DEFAULT_BLACKOUTS).map((template, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleAddRange(day, template)}
                                                className="w-full text-left px-3 py-2 text-sm text-content-primary hover:bg-base-800 first:rounded-t-lg last:rounded-b-lg"
                                            >
                                                <div className="font-medium">{template.name}</div>
                                                <div className="text-xs text-content-muted">{template.range}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => handleAddRange(day)} className="text-content-secondary hover:text-content-primary">
                                <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} /> Add Custom
                            </Button>
                        </div>
                    </div>
                    <div className="mt-2 space-y-2">
                        {(schedule[day] || []).map((item, index) => {
                            const normalizedItem = normalizeScheduleItem(item);
                            const [start, end] = normalizedItem.range.split('-');
                            const isEditing = editingName.day === day && editingName.index === index;

                            return (
                                <div key={normalizedItem.id || `${day}-${index}-${normalizedItem.range}`} className="flex items-center gap-2 p-2 bg-base-900/30 rounded">
                                    <Input
                                        type="time"
                                        value={start}
                                        onChange={(e) => handleRangeChange(day, index, 'start', e.target.value)}
                                        className="w-32"
                                    />
                                    <span className="text-content-muted">-</span>
                                    <Input
                                        type="time"
                                        value={end}
                                        onChange={(e) => handleRangeChange(day, index, 'end', e.target.value)}
                                        className="w-32"
                                    />

                                    {/* Name editing */}
                                    <div className="flex-1 flex items-center gap-2">
                                        {isEditing ? (
                                            <>
                                                <Input
                                                    value={normalizedItem.name}
                                                    onChange={(e) => handleNameChange(day, index, e.target.value)}
                                                    className="flex-1"
                                                    placeholder="Enter name..."
                                                />
                                                <Button variant="ghost" size="sm" onClick={stopEditingName} className="text-success-400 hover:text-success-300">
                                                    <Save className="w-4 h-4" strokeWidth={1.5} />
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-sm text-content-muted bg-base-800/30 px-2 py-1 rounded flex-1">
                                                    {normalizedItem.name}
                                                </span>
                                                <Button variant="ghost" size="sm" onClick={() => startEditingName(day, index)} className="text-content-muted hover:text-content-secondary">
                                                    <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                                                </Button>
                                            </>
                                        )}
                                    </div>

                                    <Button variant="ghost" size="sm" onClick={() => handleRemoveRange(day, index)} className="text-content-muted hover:text-error-400">
                                        <X className="w-4 h-4" strokeWidth={1.5} />
                                    </Button>
                                </div>
                            );
                        })}
                        {(schedule[day] || []).length === 0 && (
                            <p className="text-sm text-content-muted">No unavailable times set.</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
