export interface Book {
    id: string;
    displayTitle: string;
    url: string;
    description: string;
    subjects: Array<{ name: string }>;
    levels: Array<{ name: string }>;
    valid: boolean;
}