// Utility function for conditional class names (similar to clsx)
export const cn = (...classes) => {
    return classes.filter(Boolean).join(' ');
};

export const createPageUrl = (pageName, param = '') => `/${pageName}${param ? `/${param}` : ''}`;

export const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
};

export const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString();
};

export const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
        case 'Easy': return 'bg-green-900/50 text-green-300 border-green-700';
        case 'Medium': return 'bg-yellow-900/50 text-yellow-300 border-yellow-700';
        case 'Hard': return 'bg-red-900/50 text-red-300 border-red-700';
        default: return 'bg-slate-800/50 text-slate-300 border-slate-600';
    }
};

export const generateSampleTasks = () => [
    {
        name: "AP Calculus Practice Problems",
        subject: "AP Calculus AB",
        difficulty: "Hard",
        estimated_time: 45,
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        description: "Complete problems 1-20 in Chapter 3"
    },
    {
        name: "AP Biology Lab Report",
        subject: "AP Biology",
        difficulty: "Medium",
        estimated_time: 60,
        deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        description: "Write lab report for photosynthesis experiment"
    },
    {
        name: "AP English Essay Draft",
        subject: "AP English Literature",
        difficulty: "Medium",
        estimated_time: 90,
        deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        description: "First draft of Shakespeare analysis essay"
    }
];
