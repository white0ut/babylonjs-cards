export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((res, _rej) => {
    const img = new Image();
    img.src = url;
    img.addEventListener(
      "load",
      () => {
        res(img);
      },
      {
        once: true,
      }
    );
  });
}
