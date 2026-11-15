import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from '../src/App';
import { REVISED_ORDER } from '../src/content/audit';

const go = (hash: string) => { window.location.hash = hash; return render(<App />); };
beforeEach(() => { localStorage.clear(); });
afterEach(() => { cleanup(); window.location.hash = ''; });

describe('application shell', () => {
  it('dashboard shows one next action', async () => {
    go('#/');
    expect(await screen.findByText('Your next action')).toBeInTheDocument();
    expect(screen.getByText('Set up your computer')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open Setup/ })).toHaveAttribute('href', '#/setup');
  });
  const routes: [string, RegExp][] = [
    ['#/curriculum', /^Curriculum$/], ['#/lab', /^Concept lab$/], ['#/review', /^Review$/], ['#/journal', /Scientific journal/],
    ['#/setup', /Setup: do this once/], ['#/roadmaps', /^Roadmaps$/], ['#/capstone', /^Capstone$/], ['#/audit', /Scientific audit/],
    ['#/settings', /Settings & account/], ['#/about', /How this app teaches/], ['#/nope', /does not exist/],
  ];
  for (const [hash, heading] of routes) {
    it(`renders ${hash}`, async () => {
      go(hash);
      await waitFor(() => expect(screen.getAllByText(heading).length).toBeGreaterThan(0));
    });
  }
});

describe('every project workspace opens', () => {
  for (const id of REVISED_ORDER) {
    it(id, async () => {
      go(`#/project/${id}?tab=${id === 's2p6' || id.match(/s4p[89]|s5p7/) ? 'overview' : 'build'}`);
      expect((await screen.findAllByText(id)).length).toBeGreaterThan(0);
      expect(screen.queryByText(/Something broke/)).toBeNull();
    });
  }
});

describe('progress is real and persistent', () => {
  it('ticking a build step saves it in the new and the original storage keys', async () => {
    go('#/project/s0p1?tab=build&step=1');
    fireEvent.click(await screen.findByRole('button', { name: /Done — next step/ }));
    await waitFor(() => expect(JSON.parse(localStorage.getItem('cslab_state_v1')!).guideProgress.s0p1.s1).toBe(true));
    expect(JSON.parse(localStorage.getItem('cs_guide_progress_v1')!).s0p1.s1).toBe(true);
    cleanup();
    go('#/');
    expect(await screen.findByText(/Step 0: Create the project folder/)).toBeInTheDocument();
  });
  it('original-app progress already in this browser is picked up', async () => {
    localStorage.setItem('compsci_curriculum_progress_v2', JSON.stringify(['s0p1']));
    go('#/curriculum');
    await screen.findAllByText(/^Curriculum$/);
    expect(JSON.parse(localStorage.getItem('cslab_state_v1')!).completed).toContain('s0p1');
  });
  it('marking complete asks for confirmation while checks are open', async () => {
    go('#/project/s0p1?tab=validate');
    fireEvent.click(await screen.findByRole('button', { name: 'Mark this project complete' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Yes, it is validated' }));
    await waitFor(() => expect(JSON.parse(localStorage.getItem('compsci_curriculum_progress_v2')!)).toContain('s0p1'));
  });
});

describe('lesson flow', () => {
  it('predict → experiment → explanation', async () => {
    go('#/lesson/integrators');
    fireEvent.click(await screen.findByRole('button', { name: /I have the question in mind/ }));
    fireEvent.click(screen.getByRole('radio', { name: '16×' }));
    expect(await screen.findByText(/Try this:/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /I have seen it happen/ }));
    expect(await screen.findByText(/RK4 is fourth order/)).toBeInTheDocument();
    const saved = JSON.parse(localStorage.getItem('cslab_state_v1')!).lessons.integrators;
    expect(saved.prediction).toMatchObject({ choice: 2, correct: true });
  });
});

describe('audit decisions change the curriculum reversibly', () => {
  it('rejecting C1 removes s1p6 and restores it on approve', async () => {
    go('#/audit');
    await screen.findByText(/Scientific audit/);
    expect(screen.getByText(/Required projects now:/).textContent).toContain('40');
    const groups = screen.getAllByRole('group', { name: 'Decision for C1' });
    fireEvent.click(groups[0].querySelectorAll('button')[2]);
    await waitFor(() => expect(screen.getByText(/Required projects now:/).textContent).toContain('39'));
    fireEvent.click(groups[0].querySelectorAll('button')[0]);
    await waitFor(() => expect(screen.getByText(/Required projects now:/).textContent).toContain('40'));
  });
});

describe('journal', () => {
  it('saves a linked entry', async () => {
    go('#/journal?new=derivation&ref=s1p2');
    fireEvent.change(await screen.findByRole('textbox', { name: 'Note' }), { target: { value: 'f(x+h) = f + h f\' + h²/2 f\'\'' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save to journal' }));
    await waitFor(() => expect(JSON.parse(localStorage.getItem('cslab_state_v1')!).journal[0]).toMatchObject({ kind: 'derivation', ref: { id: 's1p2' } }));
  });
});
