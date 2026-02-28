# Arcane Tower Defense (WebGPU + WebAssembly)

This project was migrated from a JavaScript-only prototype to a **Rust + WebAssembly simulation** with a **WebGPU renderer**.

## Tech split

- `rust/td_wasm`: core tower-defense simulation (waves, enemies, towers, combat, economy)
- `js/webgpuRenderer.js`: WebGPU pipeline and draw loop
- `js/main.js`: boots the WASM module, forwards input, updates HUD

## Build WASM package

```bash
rustup target add wasm32-unknown-unknown
cargo install wasm-bindgen-cli
cargo build --release --target wasm32-unknown-unknown --manifest-path rust/td_wasm/Cargo.toml
wasm-bindgen --target web --out-dir rust/td_wasm/pkg rust/td_wasm/target/wasm32-unknown-unknown/release/td_wasm.wasm
```

## Run locally

```bash
python -m http.server 4173
```

Open `http://localhost:4173` in a WebGPU-capable browser.
