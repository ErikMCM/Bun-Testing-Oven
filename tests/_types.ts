export interface TestMetadata { 
    name: string;
}

export interface Test extends TestMetadata {
    id: number,
    activeID?: string,
    worker?: Worker
}