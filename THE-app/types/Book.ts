export interface Book {
    id: string;
    displayTitle: string;
    url: string;
    description: string;
    subjects: { name: string }[];
    levels: { name: string }[];
    valid: boolean;
}