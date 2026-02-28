const shaderCode = /* wgsl */`
struct VsOut {
  @builtin(position) pos: vec4<f32>,
  @location(0) color: vec4<f32>,
};

@group(0) @binding(0) var<uniform> viewport: vec2<f32>;

@vertex
fn vs_main(
  @location(0) local_pos: vec2<f32>,
  @location(1) center: vec2<f32>,
  @location(2) size: vec2<f32>,
  @location(3) color: vec4<f32>
) -> VsOut {
  let world = center + local_pos * size;
  let clip = vec2<f32>(
    (world.x / viewport.x) * 2.0 - 1.0,
    1.0 - (world.y / viewport.y) * 2.0
  );

  var out: VsOut;
  out.pos = vec4<f32>(clip, 0.0, 1.0);
  out.color = color;
  return out;
}

@fragment
fn fs_main(input: VsOut) -> @location(0) vec4<f32> {
  return input.color;
}
`;

export class WebGpuRenderer {
  static async create(canvas) {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) throw new Error('No GPU adapter');
    const device = await adapter.requestDevice();
    const context = canvas.getContext('webgpu');
    const format = navigator.gpu.getPreferredCanvasFormat();
    context.configure({ device, format, alphaMode: 'opaque' });

    const shader = device.createShaderModule({ code: shaderCode });

    const quadVertices = new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      -1, 1,
      1, -1,
      1, 1
    ]);
    const vertexBuffer = device.createBuffer({
      size: quadVertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(vertexBuffer, 0, quadVertices);

    const maxInstances = 256;
    const instanceStride = 8 * Float32Array.BYTES_PER_ELEMENT;
    const instanceBuffer = device.createBuffer({
      size: maxInstances * instanceStride,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    const viewportBuffer = device.createBuffer({
      size: 2 * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const bindGroupLayout = device.createBindGroupLayout({
      entries: [{ binding: 0, visibility: GPUShaderStage.VERTEX, buffer: {} }],
    });

    const pipeline = device.createRenderPipeline({
      layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
      vertex: {
        module: shader,
        entryPoint: 'vs_main',
        buffers: [
          {
            arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT,
            attributes: [{ shaderLocation: 0, format: 'float32x2', offset: 0 }],
          },
          {
            arrayStride: instanceStride,
            stepMode: 'instance',
            attributes: [
              { shaderLocation: 1, format: 'float32x2', offset: 0 },
              { shaderLocation: 2, format: 'float32x2', offset: 8 },
              { shaderLocation: 3, format: 'float32x4', offset: 16 },
            ],
          },
        ],
      },
      fragment: {
        module: shader,
        entryPoint: 'fs_main',
        targets: [{ format }],
      },
      primitive: { topology: 'triangle-list' },
    });

    const bindGroup = device.createBindGroup({
      layout: bindGroupLayout,
      entries: [{ binding: 0, resource: { buffer: viewportBuffer } }],
    });

    return new WebGpuRenderer(device, context, pipeline, bindGroup, vertexBuffer, instanceBuffer, viewportBuffer);
  }

  constructor(device, context, pipeline, bindGroup, vertexBuffer, instanceBuffer, viewportBuffer) {
    this.device = device;
    this.context = context;
    this.pipeline = pipeline;
    this.bindGroup = bindGroup;
    this.vertexBuffer = vertexBuffer;
    this.instanceBuffer = instanceBuffer;
    this.viewportBuffer = viewportBuffer;
    this.instances = new Float32Array(256 * 8);
  }

  render(snapshot) {
    const width = this.context.canvas.width;
    const height = this.context.canvas.height;
    this.device.queue.writeBuffer(this.viewportBuffer, 0, new Float32Array([width, height]));

    let instanceCount = 0;
    const pushRect = (x, y, w, h, r, g, b, a = 1) => {
      const offset = instanceCount * 8;
      this.instances[offset] = x;
      this.instances[offset + 1] = y;
      this.instances[offset + 2] = w;
      this.instances[offset + 3] = h;
      this.instances[offset + 4] = r;
      this.instances[offset + 5] = g;
      this.instances[offset + 6] = b;
      this.instances[offset + 7] = a;
      instanceCount += 1;
    };

    pushRect(width / 2, 250, width / 2, 26, 0.36, 0.26, 0.18, 1.0); // path

    for (const tower of snapshot.towers) {
      pushRect(tower.x, tower.y, 18, 38, 0.45, 0.81, 0.95, 1.0);
    }

    for (const enemy of snapshot.enemies) {
      const hp = enemy.hp_ratio;
      pushRect(enemy.x, enemy.y, 12, 12, 0.92 - hp * 0.4, 0.22 + hp * 0.55, 0.32, 1.0);
      pushRect(enemy.x, enemy.y - 16, 16 * hp, 3, 0.2, 0.95, 0.48, 1.0);
    }

    this.device.queue.writeBuffer(this.instanceBuffer, 0, this.instances.subarray(0, instanceCount * 8));

    const encoder = this.device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view: this.context.getCurrentTexture().createView(),
        clearValue: { r: 0.05, g: 0.08, b: 0.12, a: 1.0 },
        loadOp: 'clear',
        storeOp: 'store',
      }],
    });

    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, this.bindGroup);
    pass.setVertexBuffer(0, this.vertexBuffer);
    pass.setVertexBuffer(1, this.instanceBuffer);
    pass.draw(6, instanceCount, 0, 0);
    pass.end();

    this.device.queue.submit([encoder.finish()]);
  }
}
