/// <reference types="vite/client" />

declare module 'virtual:decor-files' {
    const files: string[];
    export default files;
}

declare module 'virtual:audio-files' {
    const files: { lofi: string[]; featured: string[] };
    export default files;
}
