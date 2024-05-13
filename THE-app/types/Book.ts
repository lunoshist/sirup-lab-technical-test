export interface Book {
    id: Int16Array;
    displayTitle: string;
    url: string;
    description: string;
    subjects: { name: string }[];
    levels: { name: string }[];
    valid: boolean;
}