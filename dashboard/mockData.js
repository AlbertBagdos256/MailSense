function getMockEmails() {
    const mockEmails = [
        // Work emails
        {
            id: "1",
            subject: "Q4 Budget Review Meeting",
            body: "Please review the attached Q4 budget proposal for our team.",
            category: "Work",
            date: "2024-01-05",
            spam_status: "not_spam"
        },
        {
            id: "2",
            subject: "Project Deadline Update",
            body: "The project deadline has been moved to next Friday.",
            category: "Work",
            date: "2024-01-08",
            spam_status: "not_spam"
        },
        {
            id: "3",
            subject: "Team Standup Notes",
            body: "Here are the notes from today's standup meeting.",
            category: "Work",
            date: "2024-01-12",
            spam_status: "not_spam"
        },
        {
            id: "4",
            subject: "Performance Review Scheduled",
            body: "Your performance review is scheduled for January 20th.",
            category: "Work",
            date: "2024-01-15",
            spam_status: "not_spam"
        },
        {
            id: "5",
            subject: "New API Documentation",
            body: "The new API documentation is now available.",
            category: "Work",
            date: "2024-01-18",
            spam_status: "not_spam"
        },
        {
            id: "6",
            subject: "Code Review Request",
            body: "Please review my pull request when you have time.",
            category: "Work",
            date: "2024-02-02",
            spam_status: "not_spam"
        },
        {
            id: "7",
            subject: "Sprint Planning Session",
            body: "Sprint planning is scheduled for tomorrow at 10 AM.",
            category: "Work",
            date: "2024-02-08",
            spam_status: "not_spam"
        },
        {
            id: "8",
            subject: "Client Feedback on Deliverables",
            body: "The client has provided feedback on the latest deliverables.",
            category: "Work",
            date: "2024-02-15",
            spam_status: "not_spam"
        },

        // Personal emails
        {
            id: "9",
            subject: "Weekend Plans",
            body: "Hey! Are you free this weekend? Let's grab coffee.",
            category: "Personal",
            date: "2024-01-06",
            spam_status: "not_spam"
        },
        {
            id: "10",
            subject: "Happy Birthday!",
            body: "Wishing you a wonderful birthday! Hope you have a great day.",
            category: "Personal",
            date: "2024-01-10",
            spam_status: "not_spam"
        },
        {
            id: "11",
            subject: "Family Dinner Invitation",
            body: "Mom is hosting a family dinner next Sunday. Can you make it?",
            category: "Personal",
            date: "2024-01-20",
            spam_status: "not_spam"
        },
        {
            id: "12",
            subject: "Trip Photos",
            body: "Here are the photos from our recent trip to the mountains.",
            category: "Personal",
            date: "2024-02-01",
            spam_status: "not_spam"
        },
        {
            id: "13",
            subject: "Book Recommendation",
            body: "You should read this book! It's amazing.",
            category: "Personal",
            date: "2024-02-10",
            spam_status: "not_spam"
        },

        // Reply Needed emails
        {
            id: "14",
            subject: "Action Required: Expense Report",
            body: "Please submit your expense report by end of week.",
            category: "Reply Needed",
            date: "2024-01-07",
            spam_status: "not_spam"
        },
        {
            id: "15",
            subject: "Feedback Requested on Proposal",
            body: "We need your input on the attached proposal. Please review and comment.",
            category: "Reply Needed",
            date: "2024-01-14",
            spam_status: "not_spam"
        },
        {
            id: "16",
            subject: "RSVP Needed for Conference",
            body: "Please confirm your attendance for the upcoming conference.",
            category: "Reply Needed",
            date: "2024-01-25",
            spam_status: "not_spam"
        },
        {
            id: "17",
            subject: "Survey: Your Feedback Matters",
            body: "Please take 5 minutes to complete our customer satisfaction survey.",
            category: "Reply Needed",
            date: "2024-02-05",
            spam_status: "not_spam"
        },
        {
            id: "18",
            subject: "Urgent: Decision Needed",
            body: "We need your decision on this matter by tomorrow.",
            category: "Reply Needed",
            date: "2024-02-12",
            spam_status: "not_spam"
        },

        // Education emails
        {
            id: "19",
            subject: "Course Assignment Due",
            body: "Your assignment for Module 3 is due this Friday.",
            category: "Education",
            date: "2024-01-09",
            spam_status: "not_spam"
        },
        {
            id: "20",
            subject: "Webinar: Advanced JavaScript",
            body: "Join us for a free webinar on advanced JavaScript techniques.",
            category: "Education",
            date: "2024-01-16",
            spam_status: "not_spam"
        },
        {
            id: "21",
            subject: "Course Completion Certificate",
            body: "Congratulations! You have completed the course.",
            category: "Education",
            date: "2024-01-28",
            spam_status: "not_spam"
        },
        {
            id: "22",
            subject: "New Course Available",
            body: "Check out our new course on machine learning fundamentals.",
            category: "Education",
            date: "2024-02-03",
            spam_status: "not_spam"
        },
        {
            id: "23",
            subject: "Exam Results",
            body: "Your exam results are now available in the portal.",
            category: "Education",
            date: "2024-02-14",
            spam_status: "not_spam"
        },

        // Job Applications emails
        {
            id: "24",
            subject: "Application Status Update",
            body: "Thank you for applying. We will review your application.",
            category: "Job Applications",
            date: "2024-01-11",
            spam_status: "not_spam"
        },
        {
            id: "25",
            subject: "Interview Scheduled",
            body: "We would like to invite you for an interview on January 30th.",
            category: "Job Applications",
            date: "2024-01-19",
            spam_status: "not_spam"
        },
        {
            id: "26",
            subject: "Job Offer",
            body: "We are pleased to offer you the position of Senior Developer.",
            category: "Job Applications",
            date: "2024-02-06",
            spam_status: "not_spam"
        },
        {
            id: "27",
            subject: "Rejection Notice",
            body: "Thank you for your interest. We have decided to move forward with other candidates.",
            category: "Job Applications",
            date: "2024-02-11",
            spam_status: "not_spam"
        },

        // Spam emails
        {
            id: "28",
            subject: "You've Won a Prize!",
            body: "Congratulations! You have won a free prize. Click here to claim.",
            category: "Spam",
            date: "2024-01-13",
            spam_status: "spam"
        },
        {
            id: "29",
            subject: "Limited Time Offer - 90% Off",
            body: "Don't miss out! Get 90% off all products today only.",
            category: "Spam",
            date: "2024-01-22",
            spam_status: "spam"
        },
        {
            id: "30",
            subject: "Click Here for Free Money",
            body: "Make money fast! Click here to learn how.",
            category: "Spam",
            date: "2024-02-04",
            spam_status: "spam"
        },
        {
            id: "31",
            subject: "Verify Your Account",
            body: "Click here to verify your account immediately.",
            category: "Spam",
            date: "2024-02-09",
            spam_status: "spam"
        }
    ];

    return mockEmails;
}
