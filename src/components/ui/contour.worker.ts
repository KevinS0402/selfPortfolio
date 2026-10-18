import { createContourRenderer, type ContourMessage } from "./contourRenderer";

// All visible fields share one worker clock. The main thread stays available for input.
const fields = new Map<number, ReturnType<typeof createContourRenderer>>();
let timer: ReturnType<typeof setTimeout> | undefined;
function schedule() {
  if (timer !== undefined || ![...fields.values()].some(field => field.running)) return;
  timer = setTimeout(() => {
    timer = undefined;
    const now = performance.now();
    fields.forEach(field => field.tick(now));
    schedule();
  }, [...fields.values()].some(field => field.interactive) ? 16 : 50);
}
self.onmessage = (event: MessageEvent<ContourMessage>) => {
  const message = event.data;
  if (message.type === "init") fields.set(message.id, createContourRenderer(message.canvas, message.variant, message.fade));
  else if (message.type === "resize") fields.get(message.id)?.resize(message.width, message.height, message.ratio);
  else if (message.type === "active") fields.get(message.id)?.setActive(message.active, message.reduced);
  else if (message.type === "pointer") fields.get(message.id)?.pointer(message.x, message.y, performance.now());
  else if (message.type === "dispose") { fields.get(message.id)?.dispose(); fields.delete(message.id); }
  schedule();
};
