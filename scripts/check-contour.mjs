import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const modules = new Map();
const surfaces = [];
class Canvas {
  width = 1; height = 1;
  strokes = 0; paints = 0; letters = []; rectangles = []; baseOpacity = []; curves = [];
  constructor() { surfaces.push(this); }
  getContext() {
    let matrix = [1, 0, 0, 1, 0, 0];
    let point = [0,0];
    const context = { globalAlpha: 1,
      setTransform: (...values) => { matrix = values; }, clearRect: () => { this.paints++; },
      fillRect: (x,y,width,height) => { this.rectangles.push({x:(x+width/2)*matrix[0]+matrix[4],y:(y+height/2)*matrix[3]+matrix[5]}); },
      beginPath() {}, moveTo: (x,y) => { point = [x,y]; }, lineTo: (x,y) => { point = [x,y]; },
      bezierCurveTo: (x1,y1,x2,y2,x,y) => { this.curves.push({start:point,c1:[x1,y1],c2:[x2,y2],end:[x,y]}); point=[x,y]; }, stroke: () => { this.strokes++; },
      drawImage: () => { this.baseOpacity.push(context.globalAlpha); }, fillText: (letter) => { this.letters.push(letter); },
      createRadialGradient: () => ({ addColorStop() {} }), createLinearGradient: () => ({ addColorStop() {} }) };
    return context;
  }
}
function load(name) {
  if (modules.has(name)) return modules.get(name);
  const source = readFileSync(new URL(`../src/components/ui/${name}.ts`, import.meta.url), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const compiledModule = { exports: {} };
  vm.runInNewContext(code, { module: compiledModule, exports: compiledModule.exports, require: (path) => load(path.replace("./", "")), OffscreenCanvas: Canvas, Math });
  modules.set(name, compiledModule.exports); return compiledModule.exports;
}
const { createContourRenderer } = load("contourRenderer");
const { pointerInQuad } = load("contourCoordinates");
// Round-trip known positions through rotated, skewed, perspective and translated
// planes. A bounding-box mapping fails these cases, especially near the corners.
for (const [a,b,c,d,e,f,g,h] of [
  [600,0,100,0,400,200,0,0],
  [587,83,-120,-125,391,340,0,0],
  [900,180,73,-60,560,-800,.17,.38],
]) {
  const forward = (x,y) => ({x:(a*x+b*y+c)/(g*x+h*y+1),y:(d*x+e*y+f)/(g*x+h*y+1)});
  const corners = [[0,0],[1,0],[1,1],[0,1]].map(([x,y])=>forward(x,y));
  for (const [x,y] of [[.1,.2],[.5,.5],[.93,.81]]) {
    const actual = pointerInQuad(forward(x,y), corners);
    assert.ok(actual && Math.abs(actual.x-x)<1e-8 && Math.abs(actual.y-y)<1e-8, "Pointer origin must survive CSS transforms and scroll offsets");
  }
}
assert.equal(pointerInQuad({x:1,y:1},[{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}]),null);
for (const variant of ["terrain", "circuit", "community", "sound"]) {
  const canvas = new Canvas();
  const field = createContourRenderer(canvas, variant);
  const background = surfaces.at(-1);
  field.resize(3000, 2000, 3);
  assert.ok(canvas.width * canvas.height <= 855000, "Large screens must respect the raster budget");
  assert.equal(background.strokes, 48);
  if (variant === "sound") {
    assert.equal(background.curves.length,48*120);
    for (let i=1;i<background.curves.length;i++) {
      if (i%120===0) continue;
      const before=background.curves[i-1], after=background.curves[i];
      assert.ok(Math.abs(before.end[0]-after.start[0])<1e-8 && Math.abs(before.end[1]-after.start[1])<1e-8);
      for (const axis of [0,1]) assert.ok(Math.abs((before.end[axis]-before.c2[axis])-(after.c1[axis]-after.start[axis]))<1e-7, "Sound wave tangents must join continuously without corners");
    }
  }
  const idle = canvas.paints;
  field.tick(500); assert.equal(canvas.paints, idle, "Offscreen fields must not draw");
  field.setActive(true, false);
  field.tick(1000); assert.ok(canvas.paints > idle);
  const beforePointer = canvas.paints;
  field.pointer(.8, .2, 1100);
  assert.ok(canvas.rectangles.length > 0);
  assert.ok(canvas.rectangles.every(point => Math.abs(point.x-canvas.width*.8)<1e-6 && Math.abs(point.y-canvas.height*.2)<1e-6), "New wave must start at the exact cursor position, including cropped/high-DPI canvases");
  field.tick(2200);
  assert.ok(Math.abs(canvas.baseOpacity.at(-1)-canvas.baseOpacity[1])>.02, "Cached lines must pulse without cursor input");
  assert.ok(canvas.paints > beforePointer, "Pointer input must paint immediately");
  assert.equal(background.strokes, 48, "Pointer/ambient frames must reuse cached terrain");
  field.setActive(true, true);
  const staticFrame = canvas.paints;
  field.pointer(.4, .4, 1200); field.tick(1300);
  assert.equal(canvas.paints, staticFrame, "Reduced motion must disable animation and ripples");
  field.setActive(false, false);
  const paused = canvas.paints; field.tick(1500);
  assert.equal(canvas.paints, paused);
  field.dispose(); assert.equal(canvas.width * canvas.height, 1);
}
console.log("Contour checks passed: all 4 variants, smooth sound-wave joins, transformed pointer alignment, exact ripple origin, independent pulse, pixel budget, cached terrain, visibility pause, reduced motion, disposal.");
