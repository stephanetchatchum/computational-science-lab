"""Watch evolution happen: every generation rides live, then the best breed.
Keys: SPACE pause | F fast-forward | C watch the saved champion | ESC quit."""
import numpy as np
import pygame
from src.brain import N_W, next_generation
from src.race import Race
from src.world import HALF
from src.sensors import RAY_ANGLES

W, H = 1200, 760
SCALE = 2.4                      # pixels per metre

def to_screen(x, y, cx, cy):
    return W / 2 + (x - cx) * SCALE, H / 2 - (y - cy) * SCALE

def main():
    pygame.init(); screen = pygame.display.set_mode((W, H)); pygame.display.set_caption("Moto-Taxi Rush")
    font = pygame.font.SysFont(None, 26); clock = pygame.time.Clock()
    rng = np.random.default_rng(0); pop = rng.normal(0, 0.5, (60, N_W))
    gen, history, paused, fast, champ_mode = 0, [], False, False, False
    race = Race(pop, seed=0)
    road = None
    while True:
        for e in pygame.event.get():
            if e.type == pygame.QUIT or (e.type == pygame.KEYDOWN and e.key == pygame.K_ESCAPE): pygame.quit(); return
            if e.type == pygame.KEYDOWN and e.key == pygame.K_SPACE: paused = not paused
            if e.type == pygame.KEYDOWN and e.key == pygame.K_f: fast = not fast
            if e.type == pygame.KEYDOWN and e.key == pygame.K_c:
                champ_mode = True; race = Race(np.load("data/champion.npy")[None, :], seed=int(rng.integers(1000)))
        if not paused:
            for _ in range(10 if fast else 1):
                race.step()
                if race.t >= 45 or not race.alive.any():
                    if champ_mode:
                        race = Race(race.pop, seed=int(rng.integers(1000))); continue
                    fit = race.fitness(); history.append(fit.max())
                    pop = next_generation(pop, fit, rng); gen += 1
                    race = Race(pop, seed=gen); break
        # camera follows the leader
        lead = int(np.argmax(np.where(race.alive, race.progress, -1e9))) if race.alive.any() else int(np.argmax(race.progress))
        cx, cy = race.x[lead], race.y[lead]
        screen.fill((34, 92, 52))
        w = race.w
        pts = [to_screen(px, py, cx, cy) for px, py in w.pts[::4]]
        pygame.draw.lines(screen, (40, 44, 52), True, pts, int(2 * HALF * SCALE) + 2)
        for lane_line in (-1.75, 1.75):
            off = w.to_xy(w.s[::8], lane_line)
            for k in range(0, len(off) - 1, 2):
                pygame.draw.line(screen, (200, 200, 200), to_screen(*off[k], cx, cy), to_screen(*off[k + 1], cx, cy), 1)
        for fx, fy in race.fare_xy:
            pygame.draw.circle(screen, (227, 179, 65), [int(v) for v in to_screen(fx, fy, cx, cy)], 6)
        for px, py in w.car_xy():
            sx, sy = to_screen(px, py, cx, cy); pygame.draw.circle(screen, (88, 166, 255), (int(sx), int(sy)), int(2.0 * SCALE))
        for k, a in enumerate(RAY_ANGLES):
            r = race.rays[lead, k]; ang = race.th[lead] + a
            col = (248, 81, 73) if r < 40 else (57, 208, 216)
            pygame.draw.line(screen, col, to_screen(cx, cy, cx, cy), to_screen(cx + r * np.cos(ang), cy + r * np.sin(ang), cx, cy), 1)
        for b in range(len(race.pop)):
            sx, sy = to_screen(race.x[b], race.y[b], cx, cy)
            col = (255, 123, 90) if race.skid[b] else (227, 179, 65)
            if not race.alive[b]: col = (90, 90, 90)
            pygame.draw.circle(screen, col, (int(sx), int(sy)), 6 if b == lead else 4)
        label = "CHAMPION (press C again for new traffic)" if champ_mode else f"generation {gen}   riding {race.alive.sum()} / {len(race.pop)}"
        screen.blit(font.render(f"{label}   t = {race.t:4.1f} s   leader {race.progress[lead]:5.0f} m", True, (255, 255, 255)), (20, 20))
        if len(history) > 1:
            hx = np.array(history[-50:]); top = max(hx.max(), 1)
            pts = [(W - 260 + 240 * i / (len(hx) - 1), 130 - 100 * max(v, 0) / top) for i, v in enumerate(hx)]
            pygame.draw.rect(screen, (13, 17, 23), (W - 270, 20, 260, 120)); pygame.draw.lines(screen, (63, 185, 80), False, pts, 2)
            screen.blit(font.render("best per generation", True, (200, 200, 200)), (W - 260, 24))
        pygame.display.flip(); clock.tick(30)

if __name__ == "__main__":
    main()
