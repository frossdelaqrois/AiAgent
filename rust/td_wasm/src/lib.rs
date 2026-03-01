use serde::Serialize;
use wasm_bindgen::prelude::*;

const PATH_Y: f32 = 250.0;
const MAP_WIDTH: f32 = 960.0;
const ENEMY_RADIUS: f32 = 12.0;
const TOWER_RANGE: f32 = 170.0;

#[derive(Clone)]
struct Enemy {
    x: f32,
    hp: f32,
    speed: f32,
    bounty: f32,
}

#[derive(Clone)]
struct Tower {
    x: f32,
    cooldown: f32,
}

#[derive(Serialize)]
struct RenderEnemy {
    x: f32,
    y: f32,
    hp_ratio: f32,
}

#[derive(Serialize)]
struct RenderTower {
    x: f32,
    y: f32,
}

#[derive(Serialize)]
struct Snapshot {
    gold: u32,
    health: i32,
    wave: u32,
    queued_enemies: u32,
    alive_enemies: u32,
    enemies: Vec<RenderEnemy>,
    towers: Vec<RenderTower>,
}

#[wasm_bindgen]
pub struct TdEngine {
    gold: f32,
    health: i32,
    wave: u32,
    spawn_timer: f32,
    queued_enemies: u32,
    enemies: Vec<Enemy>,
    towers: Vec<Tower>,
}

#[wasm_bindgen]
impl TdEngine {
    #[wasm_bindgen(constructor)]
    pub fn new() -> TdEngine {
        TdEngine {
            gold: 120.0,
            health: 20,
            wave: 0,
            spawn_timer: 0.0,
            queued_enemies: 0,
            enemies: Vec::new(),
            towers: Vec::new(),
        }
    }

    pub fn start_wave(&mut self) {
        if self.queued_enemies > 0 || !self.enemies.is_empty() {
            return;
        }
        self.wave += 1;
        self.queued_enemies = 6 + self.wave * 2;
        self.spawn_timer = 0.1;
    }

    pub fn place_tower(&mut self, x: f32) -> bool {
        let cost = 50.0 + self.towers.len() as f32 * 20.0;
        if self.gold < cost {
            return false;
        }

        let valid_x = x.clamp(90.0, MAP_WIDTH - 90.0);
        if self
            .towers
            .iter()
            .any(|tower| (tower.x - valid_x).abs() < 55.0)
        {
            return false;
        }

        self.gold -= cost;
        self.towers.push(Tower {
            x: valid_x,
            cooldown: 0.1,
        });
        true
    }

    pub fn tick(&mut self, dt: f32) {
        if self.health <= 0 {
            return;
        }

        self.spawn_timer -= dt;
        if self.queued_enemies > 0 && self.spawn_timer <= 0.0 {
            let hp = 40.0 + self.wave as f32 * 16.0;
            let speed = 42.0 + self.wave as f32 * 3.5;
            self.enemies.push(Enemy {
                x: -ENEMY_RADIUS,
                hp,
                speed,
                bounty: 12.0 + self.wave as f32 * 1.2,
            });
            self.queued_enemies -= 1;
            self.spawn_timer = 0.72;
        }

        for enemy in &mut self.enemies {
            enemy.x += enemy.speed * dt;
        }

        for tower in &mut self.towers {
            tower.cooldown -= dt;
            if tower.cooldown > 0.0 {
                continue;
            }

            if let Some(target) = self
                .enemies
                .iter_mut()
                .find(|enemy| (enemy.x - tower.x).abs() <= TOWER_RANGE)
            {
                let damage = 20.0 + self.wave as f32 * 2.8;
                target.hp -= damage;
                tower.cooldown = 0.45;
            }
        }

        let mut escaped = 0;
        let mut bounty_gain = 0.0;
        self.enemies.retain(|enemy| {
            if enemy.hp <= 0.0 {
                bounty_gain += enemy.bounty;
                return false;
            }
            if enemy.x > MAP_WIDTH + ENEMY_RADIUS {
                escaped += 1;
                return false;
            }
            true
        });

        if escaped > 0 {
            self.health -= escaped;
        }
        self.gold += bounty_gain;
    }

    pub fn reset(&mut self) {
        *self = Self::new();
    }

    pub fn snapshot(&self) -> JsValue {
        let enemies = self
            .enemies
            .iter()
            .map(|e| RenderEnemy {
                x: e.x,
                y: PATH_Y,
                hp_ratio: (e.hp / (40.0 + self.wave as f32 * 16.0)).clamp(0.0, 1.0),
            })
            .collect::<Vec<_>>();

        let towers = self
            .towers
            .iter()
            .map(|t| RenderTower { x: t.x, y: 185.0 })
            .collect::<Vec<_>>();

        serde_wasm_bindgen::to_value(&Snapshot {
            gold: self.gold.floor() as u32,
            health: self.health,
            wave: self.wave,
            queued_enemies: self.queued_enemies,
            alive_enemies: self.enemies.len() as u32,
            enemies,
            towers,
        })
        .unwrap_or(JsValue::NULL)
    }
}
