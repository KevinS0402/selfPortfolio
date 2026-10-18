const namespace = "http://www.w3.org/2000/svg";

/** Rounded-lens displacement, rebuilt only on resize. The center stays neutral. */
export function installLiquidGlass(page: HTMLElement, definitions: SVGDefsElement, prefix: string) {
  const panels = [...page.querySelectorAll<HTMLElement>(".liquid-glass")];
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return () => {};
  const filters = new Map<HTMLElement, { node: SVGFilterElement; image: SVGFEImageElement; dimensions: string }>();
  const create = (tag: string) => document.createElementNS(namespace, tag);
  function update(panel: HTMLElement) {
    const width = panel.clientWidth, height = panel.clientHeight;
    if (!width || !height) return;
    const radius = Math.min(parseFloat(getComputedStyle(panel).borderTopLeftRadius) || 20, width / 2, height / 2);
    let filter = filters.get(panel);
    const dimensions = `${width}:${height}:${radius}`;
    if (filter?.dimensions === dimensions) return;
    if (!filter) {
      const node = create("filter") as SVGFilterElement;
      node.id = `${prefix}-lens-${panels.indexOf(panel)}`;
      node.setAttribute("x", "0"); node.setAttribute("y", "0"); node.setAttribute("width", "100%"); node.setAttribute("height", "100%");
      node.setAttribute("color-interpolation-filters", "sRGB");
      const image = create("feImage") as SVGFEImageElement;
      image.setAttribute("result", "edge-normal"); image.setAttribute("preserveAspectRatio", "none");
      image.setAttribute("x", "0"); image.setAttribute("y", "0"); image.setAttribute("width", "100%"); image.setAttribute("height", "100%");
      const displacement = create("feDisplacementMap");
      displacement.setAttribute("in", "SourceGraphic"); displacement.setAttribute("in2", "edge-normal");
      displacement.setAttribute("scale", "8"); displacement.setAttribute("xChannelSelector", "R"); displacement.setAttribute("yChannelSelector", "G");
      node.append(image, displacement); definitions.append(node);
      filter = { node, image, dimensions: "" }; filters.set(panel, filter);
      panel.style.setProperty("--glass-filter", `url("#${node.id}")`);
    }
    // Keep the normal map small; coordinates remain in CSS pixels at any aspect ratio.
    const ratio = Math.min(1, 512 / Math.max(width, height));
    canvas.width = Math.max(2, Math.ceil(width * ratio)); canvas.height = Math.max(2, Math.ceil(height * ratio));
    const map = context!.createImageData(canvas.width, canvas.height);
    const band = Math.min(12, radius * .65);
    for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
      const px = (x + .5) / ratio - width / 2, py = (y + .5) / ratio - height / 2;
      const qx = Math.abs(px) - (width / 2 - radius), qy = Math.abs(py) - (height / 2 - radius);
      const ax = Math.max(qx, 0), ay = Math.max(qy, 0), length = Math.hypot(ax, ay);
      const distance = length + Math.min(Math.max(qx, qy), 0) - radius;
      const edge = Math.max(0, Math.min(1, 1 + distance / band));
      const strength = Math.sin(edge * Math.PI / 2) * .85;
      const nx = length ? ax / length : qx > qy ? 1 : 0;
      const ny = length ? ay / length : qy >= qx ? 1 : 0;
      const index = (y * canvas.width + x) * 4;
      map.data[index] = Math.round(127.5 + Math.sign(px) * nx * strength * 127.5);
      map.data[index + 1] = Math.round(127.5 + Math.sign(py) * ny * strength * 127.5);
      map.data[index + 2] = 128; map.data[index + 3] = 255;
    }
    context!.putImageData(map, 0, 0);
    filter.image.setAttribute("href", canvas.toDataURL());
    filter.dimensions = dimensions;
  }
  const resize = new ResizeObserver(entries => entries.forEach(entry => update(entry.target as HTMLElement)));
  panels.forEach(panel => resize.observe(panel));
  return () => { resize.disconnect(); filters.forEach(({ node }, panel) => { node.remove(); panel.style.removeProperty("--glass-filter"); }); };
}
