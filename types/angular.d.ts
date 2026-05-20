interface AngularTestability {
    isStable(): boolean;
}

interface Window {
    getAllAngularTestabilities(): AngularTestability[];
}
