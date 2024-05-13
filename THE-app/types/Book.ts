export interface Book {
    id: number;
    displayTitle: string;
    url: string;
    description: string;
    subjects: { name: string }[];
    levels: { name: string }[];
    valid: boolean;
}