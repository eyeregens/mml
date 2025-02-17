export type IframeWrapperResult = {
  iframeWrapper: IframeWrapper;
  iframeWindow: Window;
  iframeDocument: Document;
  iframeBody: HTMLElement;
};

export class IframeWrapper {
  public readonly iframe: HTMLIFrameElement;

  private constructor() {
    this.iframe = document.createElement("iframe");
    this.iframe.style.position = "fixed";
    this.iframe.style.top = "0";
    this.iframe.style.left = "0";
    this.iframe.style.width = "0";
    this.iframe.style.height = "0";
    this.iframe.style.border = "none";
  }

  public static async create(): Promise<IframeWrapperResult> {
    return new Promise((resolve) => {
      const iframeWrapper = new IframeWrapper();
      document.body.append(iframeWrapper.iframe);

      /*
       Firefox is inconsistent with Chrome on how iframes are loaded. Firefox presents an empty doc that is then
       disposed of before presenting a clean second document so we need to wait for the load event before appending
       anything.
      */
      const ready = iframeWrapper.iframe.contentWindow
        ? iframeWrapper.iframe.contentWindow.document.readyState === "complete"
        : false;
      const onLoad = () => {
        const iframe = iframeWrapper.iframe;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const iframeWindow = iframe.contentWindow!;
        resolve({
          iframeWrapper,
          iframeWindow,
          iframeDocument: iframeWindow.document,
          iframeBody: iframeWindow.document.body,
        });
      };
      if (ready) {
        // Run this asynchronously to ensure that implementations handle the case of waiting correctly
        setTimeout(() => {
          onLoad();
        });
      } else {
        iframeWrapper.iframe.addEventListener("load", () => {
          onLoad();
        });
      }
    });
  }

  public dispose() {
    this.iframe.remove();
  }
}
