# Arcane Idle + Rust Tower Defense

The original Arcane Idle game UI and systems remain in place.
Only the tower-defense lane is now driven by the Rust/WebAssembly engine and rendered via WebGPU.

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
