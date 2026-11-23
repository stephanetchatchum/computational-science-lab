"""Split screen: the same outbreak, left without help, right with an AI in charge.
Keys: 1 hand rule, 2 Q-learning, 3 evolved brain (right side) | SPACE pause | R restart | UP/DOWN R0."""
import numpy as np
import pygame
from src.country import demo_country
from src.outbreak import Outbreak
from src.play import do_nothing, hand_rule, score
from src.qlearn import q_policy
from src.evolve import net_policy

W, H = 1200, 700
COLS = {1: (88, 166, 255), 2: (248, 81, 73), 3: (63, 185, 80)}

def main():
    pygame.init(); screen = pygame.display.set_mode((W, H)); pygame.display.set_caption("AI vs the Virus")
    font = pygame.font.SysFont(None, 24); big = pygame.font.SysFont(None, 34); clock = pygame.time.Clock()
    pops, xy, G = demo_country()
    brains = {1: ("hand rule", hand_rule), 2: ("Q-learning", q_policy(np.load("data/qtable.npy"))), 3: ("evolved", net_policy(np.load("data/brain.npy")))}
    choice, R0, paused = 3, 2.5, False

    def restart():
        return [Outbreak(pops, G, R0=R0), Outbreak(pops, G, R0=R0)], [0.0, 0.0], [np.zeros(len(pops), int)] * 2, 0
    sims, scores, acts, wk = restart()
    timer = 0
    while True:
        for e in pygame.event.get():
            if e.type == pygame.QUIT: pygame.quit(); return
            if e.type == pygame.KEYDOWN:
                if e.key in (pygame.K_1, pygame.K_2, pygame.K_3): choice = int(e.unicode); sims, scores, acts, wk = restart()
                if e.key == pygame.K_SPACE: paused = not paused
                if e.key == pygame.K_r: sims, scores, acts, wk = restart()
                if e.key == pygame.K_UP: R0 = min(4.0, R0 + 0.1); sims, scores, acts, wk = restart()
                if e.key == pygame.K_DOWN: R0 = max(1.5, R0 - 0.1); sims, scores, acts, wk = restart()
        timer += clock.tick(30)
        if not paused and wk < 26 and timer > 400:
            timer = 0
            for k, pol in enumerate((do_nothing, brains[choice][1])):
                a = np.asarray(pol(sims[k].features())); new, cost = sims[k].week(a)
                scores[k] += score(new, cost, pops, 1.0); acts[k] = a
            wk += 1
        screen.fill((13, 17, 23))
        for k in range(2):
            ox = k * W // 2
            title = "nobody in charge" if k == 0 else f"AI in charge: {brains[choice][0]}"
            screen.blit(big.render(title, True, (230, 237, 243)), (ox + 20, 15))
            o = sims[k]
            for i in range(len(pops)):
                x = ox + 40 + xy[i, 0] * 1.3; y = 90 + xy[i, 1] * 1.3
                prev = min(1.0, o.I[i] / pops[i] / 0.02)
                r = int(6 + np.sqrt(pops[i] / 2e6) * 26)
                pygame.draw.circle(screen, (int(60 + 188 * prev), int(80 - 30 * prev), int(110 - 50 * prev)), (int(x), int(y)), r)
                if acts[k][i]: screen.blit(font.render("TLV"[acts[k][i] - 1], True, COLS[acts[k][i]]), (x - 5, y - 8))
            infected = 100 * o.cases / pops.sum()
            screen.blit(font.render(f"week {wk}/26   infected {infected:.1f}%   score {scores[k]:.1f}", True, (230, 237, 243)), (ox + 20, H - 40))
        screen.blit(font.render(f"R0 = {R0:.1f}   (UP/DOWN)   1 hand rule  2 Q-learning  3 evolved   SPACE pause  R restart", True, (107, 118, 132)), (20, H - 70))
        pygame.draw.line(screen, (48, 54, 61), (W // 2, 0), (W // 2, H), 2)
        pygame.display.flip()

if __name__ == "__main__":
    main()
