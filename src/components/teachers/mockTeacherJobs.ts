
export interface TeacherJob {
  id: number;
  title: string;
  location: string;
  specialization: string;
  experience: string;
  postedDate: string;
  image: string;
  centerName: string;
  salary: string;
  description: string;
}

export const mockTeacherJobs: TeacherJob[] = [
  {
    id: 1,
    title: "Math Teacher",
    location: "New York, NY",
    specialization: "Mathematics",
    experience: "3-5 years",
    postedDate: "2024-03-15",
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    centerName: "Brooklyn Learning Center",
    salary: "$50,000 - $65,000",
    description: "Looking for an experienced math teacher to join our growing team."
  },
  {
    id: 2,
    title: "English Language Instructor",
    location: "Los Angeles, CA",
    specialization: "Language Teaching",
    experience: "1-3 years",
    postedDate: "2024-03-14",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    centerName: "LA Language Academy",
    salary: "$45,000 - $55,000",
    description: "Join our passionate team of language instructors in central Los Angeles."
  },
  {
    id: 3,
    title: "Science Teacher",
    location: "Chicago, IL",
    specialization: "Science & Mathematics",
    experience: "5+ years",
    postedDate: "2024-03-13",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    centerName: "Windy City STEM Center",
    salary: "$60,000 - $75,000",
    description: "Seeking experienced science educator to lead classes and develop curriculum."
  },
  {
    id: 4,
    title: "Programming Instructor",
    location: "Seattle, WA",
    specialization: "Computer Science",
    experience: "4-6 years",
    postedDate: "2024-03-10",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    centerName: "Tech Futures Academy",
    salary: "$70,000 - $90,000",
    description: "Teach coding fundamentals and advanced programming concepts to eager students."
  },
  {
    id: 5,
    title: "Art Teacher",
    location: "Austin, TX",
    specialization: "Fine Arts",
    experience: "2-4 years",
    postedDate: "2024-03-08",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    centerName: "Creative Arts Workshop",
    salary: "$40,000 - $55,000",
    description: "Help students explore their creative potential in a supportive environment."
  },
  {
    id: 6,
    title: "Physics Professor",
    location: "Portland, OR",
    specialization: "Physics",
    experience: "7+ years",
    postedDate: "2024-03-05",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    centerName: "Northwest Science Institute",
    salary: "$65,000 - $85,000",
    description: "Teach advanced physics concepts to motivated students in our specialized program."
  },
];
