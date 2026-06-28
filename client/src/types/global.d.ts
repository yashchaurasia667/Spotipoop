export {};

interface openDownloadDialog {
  canceled: boolean;
  filePaths: string[];
}

declare global {
  interface Window {
    api: {
      openDownloadDialog: () => Promise<openDownloadDialog | undefined>;
      openPath: (path) => undefined;
    };
  }
}
