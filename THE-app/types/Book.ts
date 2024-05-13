export interface Book {
    id: Int16Array;
    displayTitle: string;
    url: string;
    description: string;
    subjects: Array<{ name: string }>;
    levels: Array<{ name: string }>;
    valid: boolean;
}