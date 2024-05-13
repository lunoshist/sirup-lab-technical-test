export interface Book {
    id: number;
    displayTitle: string;
    url: string;
    description: string;
    subjects: Array<{ name: string }>;
    levels: Array<{ name: string }>;
    valid: boolean;
}