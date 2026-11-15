/** Where this repository lives, used to link the data snapshots. Change if you fork or rename it. */
export const REPO = { owner: 'stephanetchatchum', name: 'computational-science-lab', branch: 'main' };
export const snapshotUrl = (file: string) => `https://raw.githubusercontent.com/${REPO.owner}/${REPO.name}/${REPO.branch}/data/snapshots/${file}`;
export const snapshotsPage = `https://github.com/${REPO.owner}/${REPO.name}/tree/${REPO.branch}/data/snapshots`;
